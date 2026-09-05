import { describe, expect, it } from "vitest";
import {
  calculateCltVsPj,
  type CltVsPjInput,
  type CltVsPjResult,
} from "../../src/lib/calculators/cltVsPj";
import { INSS_CEILING, calculateEmployeeInss } from "../../src/lib/calculators/inss-constants";

const BASELINE: CltVsPjInput = {
  cltGrossSalary: 8_000,
  monthlyPjOffer: 12_000,
  dependants: 0,
  pjDeductibleExpenses: 0,
};

function compare(overrides: Partial<CltVsPjInput> = {}): CltVsPjResult {
  return calculateCltVsPj({ ...BASELINE, ...overrides });
}

/**
 * The 2026 monthly incidence table, as published by the Receita Federal and
 * recorded in docs/research/2026-09-04-irpf-2026-table/research.md.
 *
 * ⚠️ Taken from the research note rather than from the module, on purpose. Read
 * from the module, these tests would follow a wrong table wherever it went: the
 * continuity check below passes for any self-consistent set of parcels, and a
 * bracket boundary moved to half its value is self-consistent. The rate is what
 * pins the boundary in place — see the marginal-rate test.
 */
const MONTHLY_TABLE = [
  { upTo: 2428.8, rate: 0, inside: [1_000, 2_000] },
  { upTo: 2826.65, rate: 0.075, inside: [2_500, 2_800] },
  { upTo: 3751.05, rate: 0.15, inside: [3_000, 3_700] },
  { upTo: 4664.68, rate: 0.225, inside: [3_800, 4_600] },
  { upTo: Infinity, rate: 0.275, inside: [5_000, 9_000] },
] as const;

const BRACKET_BOUNDARIES = [2428.8, 2826.65, 3751.05, 4664.68];

/**
 * The two sides share one implementation of the monthly table but reach it from
 * different income, so the table tests run against both. `grossForBase` maps an
 * assessable base back to the income that produces it, which is what lets a test
 * name a bracket boundary and land the module exactly on it.
 */
const TAX_PATHS = [
  {
    name: "CLT",
    // gross − INSS, and INSS is progressive, so the mapping is a search rather
    // than a division. Bisection on the base the module itself reports.
    grossForBase: (base: number) =>
      bisect(
        (cltGrossSalary) => compare({ cltGrossSalary }).cltDetail.assessableBase < base,
        0,
        base * 2 + 20_000,
      ),
    detail: (gross: number) => compare({ cltGrossSalary: gross }).cltDetail,
    net: (gross: number) => compare({ cltGrossSalary: gross }).cltNet,
  },
  {
    name: "PJ",
    // The invoice less the 20% pró-labore contribution, with no expenses.
    grossForBase: (base: number) => base / 0.8,
    detail: (gross: number) => compare({ monthlyPjOffer: gross }).pjDetail,
    net: (gross: number) => compare({ monthlyPjOffer: gross }).pjNet,
  },
] as const;

/** The smallest value in [low, high] for which `belowTarget` stops holding. */
function bisect(belowTarget: (value: number) => boolean, low: number, high: number): number {
  let lower = low;
  let upper = high;

  for (let step = 0; step < 200; step += 1) {
    const middle = (lower + upper) / 2;
    if (belowTarget(middle)) {
      lower = middle;
    } else {
      upper = middle;
    }
  }

  return (lower + upper) / 2;
}

/**
 * The first point where `read` moves the wrong way as its input rises, or
 * undefined.
 *
 * Two failures, one sweep: a fall means a higher income leaves less in hand, and
 * a rise larger than the raise itself means the income the module hands back
 * grew faster than the income that produced it. A progressive table can do
 * neither, and the two defects this file was rewritten for were one of each.
 *
 * Returned as an object rather than asserted inside the loop so that a failure
 * names the exact input that broke.
 */
function firstNonSmoothPoint(
  read: (value: number) => number,
  from: number,
  to: number,
  step: number,
): { at: number; before: number; after: number } | undefined {
  let previous = read(from);

  for (let value = from + step; value <= to; value += step) {
    const current = read(value);
    const change = current - previous;

    if (change < -1e-9 || change > step + 1e-9) {
      return { at: value, before: previous, after: current };
    }

    previous = current;
  }

  return undefined;
}

/**
 * The lowest PJ proposal at which the module stops calling CLT the better deal,
 * found by bisection rather than by re-deriving the module's own arithmetic.
 */
function crossoverProposal(cltGrossSalary: number): number {
  return bisect(
    (monthlyPjOffer) => compare({ cltGrossSalary, monthlyPjOffer }).analysis.cltIsBetter,
    0,
    500_000,
  );
}

describe.each(TAX_PATHS)("calculateCltVsPj — the monthly IRPF table, $name side", (path) => {
  /**
   * A progressive table with deduction parcels is continuous by construction:
   * the parcel exists precisely so that tax computed from either side of a
   * boundary agrees.
   *
   * ⚠️ Asserted on the tax the TABLE produces, before the Lei 15.270/2025
   * reduction. On the final withholding the two lowest boundaries would compare
   * zero with zero and pass while proving nothing.
   */
  it.each(BRACKET_BOUNDARIES)("does not jump across the boundary at %s", (boundary) => {
    const below = path.detail(path.grossForBase(boundary)).taxFromTable;
    const above = path.detail(path.grossForBase(boundary + 0.01)).taxFromTable;

    expect(above - below).toBeGreaterThan(-0.01);
    expect(Math.abs(above - below)).toBeLessThan(1);
  });

  /**
   * Inside a bracket, one more real of base costs exactly the bracket's rate.
   * This is what holds the boundaries where the legislation put them: move one
   * and the rate charged on the band it used to cover changes with it, while
   * continuity — which only relates a parcel to its neighbours — still holds.
   */
  it.each(MONTHLY_TABLE)("charges $rate on the band ending at $upTo", ({ rate, inside }) => {
    const [lower, upper] = inside;
    const taxAt = (base: number) => path.detail(path.grossForBase(base)).taxFromTable;

    expect((taxAt(upper) - taxAt(lower)) / (upper - lower)).toBeCloseTo(rate, 3);
  });

  it("charges nothing at all below the first bracket", () => {
    expect(path.detail(path.grossForBase(1_000)).taxFromTable).toBe(0);
    expect(path.detail(path.grossForBase(BRACKET_BOUNDARIES[0] - 0.01)).taxFromTable).toBe(0);
  });

  /**
   * Neither side may leave a higher income with less in hand, and neither may
   * hand back more than the raise that produced it.
   */
  it("moves smoothly across the whole comparison range", () => {
    expect(firstNonSmoothPoint(path.net, 1_000, 30_000, 1)).toBeUndefined();
  });
});

describe("calculateCltVsPj — the CLT side", () => {
  /**
   * The same contribution /calculadora-salario-liquido withholds for the same
   * salary: progressive per bracket and capped at the RGPS ceiling. A flat
   * percentage put the two calculators on different answers for one input, and
   * kept charging above the ceiling.
   */
  it.each([2_000, 4_000, 8_000, 30_000])("withholds the payslip INSS on %s", (cltGrossSalary) => {
    expect(compare({ cltGrossSalary }).cltDetail.inssWithheld).toBeCloseTo(
      calculateEmployeeInss(cltGrossSalary),
      2,
    );
  });

  it("stops the contribution at the RGPS ceiling", () => {
    const ceiling = calculateEmployeeInss(INSS_CEILING);

    expect(compare({ cltGrossSalary: 30_000 }).cltDetail.inssWithheld).toBeCloseTo(ceiling, 2);
  });

  /**
   * R$ 4.000 a month. INSS takes R$ 368,60, so the base is R$ 3.631,40, and the
   * 15% row of the monthly table charges 3.631,40 × 0,15 − 394,16 = R$ 150,55.
   * The Lei 15.270/2025 reduction covers up to R$ 312,89 at this income, so the
   * withholding is nil and the net is the gross less INSS.
   */
  it("leaves a R$ 4.000 salary untaxed, which is what Lei 15.270/2025 is for", () => {
    const { cltDetail, cltNet } = compare({ cltGrossSalary: 4_000 });

    expect(cltDetail.taxFromTable).toBe(150.55);
    expect(cltDetail.reductionLei15270).toBe(150.55);
    expect(cltDetail.irpfWithheld).toBe(0);
    expect(cltNet).toBe(3631.4);
  });

  /**
   * R$ 8.000 a month, past the reduction's R$ 7.350 phase-out. INSS takes
   * R$ 921,51, so the base is R$ 7.078,49, and the top row charges
   * 7.078,49 × 0,275 − 908,73 = R$ 1.037,85 with nothing taken off it.
   */
  it("withholds R$ 1.037,85 on a R$ 8.000 salary, where the reduction no longer reaches", () => {
    const { cltDetail, cltNet } = compare({ cltGrossSalary: 8_000 });

    expect(cltDetail.taxFromTable).toBe(1037.85);
    expect(cltDetail.reductionLei15270).toBe(0);
    expect(cltNet).toBe(6040.64);
  });

  /**
   * ⚠️ The headline must contain the tax the breakdown reports. Dropping the
   * withholding from this one subtraction is invisible to every property test in
   * this file — the result stays monotone, smooth and self-consistent — and the
   * page then prints a net nobody receives.
   */
  it.each([2_000, 4_000, 8_000, 20_000])("nets %s down by both withholdings", (cltGrossSalary) => {
    const { cltDetail, cltNet } = compare({ cltGrossSalary });

    expect(cltNet).toBeCloseTo(cltGrossSalary - cltDetail.inssWithheld - cltDetail.irpfWithheld, 2);
  });

  /**
   * ⚠️ The benefit package is the page's whole thesis: "é comum ser preciso
   * faturar entre 25% e 40% a mais como PJ". It is 13º salary (1/12) plus 15% of
   * the gross for FGTS, holiday pay with its third and the usual allowances.
   * Pinned as a value, not as "some positive constant" — every constant is
   * positive and scale-invariant, so that assertion held for all of them.
   */
  it("amortises the benefits at one twelfth plus 15% of the gross", () => {
    const result = compare({ cltGrossSalary: 8_000 });

    expect(result.cltDetail.benefits).toBeCloseTo(8_000 * (1 / 12 + 0.15), 6);
    expect(result.cltDetail.benefits).toBeCloseTo(1866.67, 2);
    expect(result.cltWithBenefits).toBe(7907.31);
  });

  it("adds those benefits on top of the net, and nothing else", () => {
    const result = compare({ cltGrossSalary: 11_000 });

    expect(result.cltWithBenefits).toBeCloseTo(result.cltNet + result.cltDetail.benefits, 2);
  });
});

/**
 * `dependants` is published input that nothing read: the CLT tax ignored it, so
 * the field could only ever be decoration. It is wired into the CLT withholding
 * base here — the route hardcodes it to 0 and offers no control, but removing it
 * from the interface would have to change the route, and the allowance is the
 * one deduction a comparison like this cannot get from the PJ side.
 */
describe("calculateCltVsPj — dependants", () => {
  it.each([
    { dependants: 1, allowance: 189.59 },
    { dependants: 3, allowance: 568.77 },
  ])("takes R$ $allowance off the CLT base for $dependants", ({ dependants, allowance }) => {
    const none = compare({ cltGrossSalary: 8_000, dependants: 0 });
    const some = compare({ cltGrossSalary: 8_000, dependants });

    expect(none.cltDetail.assessableBase - some.cltDetail.assessableBase).toBeCloseTo(allowance, 2);
  });

  it("turns the allowance into tax at the marginal rate, and into net pay", () => {
    const none = compare({ cltGrossSalary: 8_000, dependants: 0 });
    const one = compare({ cltGrossSalary: 8_000, dependants: 1 });

    // 189,59 sheltered from the top row: 189,59 × 0,275 = 52,14.
    expect(none.cltDetail.irpfWithheld - one.cltDetail.irpfWithheld).toBeCloseTo(52.14, 1);
    expect(one.cltNet).toBeGreaterThan(none.cltNet);
  });

  it("never touches the PJ side, which shelters income with expenses instead", () => {
    const none = compare({ dependants: 0 });
    const three = compare({ dependants: 3 });

    expect(three.pjNet).toBe(none.pjNet);
    expect(three.breakEvenPjOffer).toBeGreaterThan(none.breakEvenPjOffer);
  });

  it("treats a negative count as none rather than as a surcharge", () => {
    expect(compare({ dependants: -2 }).cltNet).toBe(compare({ dependants: 0 }).cltNet);
  });
});

describe("calculateCltVsPj — the PJ side", () => {
  /**
   * R$ 8.000 invoiced. 20% pró-labore contribution and a 5% accounting fee, so
   * the base is R$ 6.400 and the top row charges 6.400 × 0,275 − 908,73 =
   * R$ 851,27, past the reduction's reach.
   */
  it("nets R$ 5.148,73 out of a R$ 8.000 invoice", () => {
    const { pjDetail, pjNet } = compare({ monthlyPjOffer: 8_000 });

    expect(pjDetail.inssWithheld).toBeCloseTo(1_600, 2);
    expect(pjDetail.accountantFee).toBeCloseTo(400, 2);
    expect(pjDetail.taxFromTable).toBe(851.27);
    expect(pjDetail.reductionLei15270).toBe(0);
    expect(pjNet).toBe(5148.73);
  });

  /**
   * R$ 4.000 invoiced: a base of R$ 3.200 in the 15% row charges
   * 3.200 × 0,15 − 394,16 = R$ 85,84, which the reduction covers in full.
   */
  it("applies the same Lei 15.270/2025 reduction to a small invoice", () => {
    const { pjDetail, pjNet } = compare({ monthlyPjOffer: 4_000 });

    expect(pjDetail.taxFromTable).toBe(85.84);
    expect(pjDetail.reductionLei15270).toBe(85.84);
    expect(pjDetail.irpfWithheld).toBe(0);
    expect(pjNet).toBe(3_000);
  });

  /** ⚠️ The PJ twin of the CLT wiring test above, and the same silent failure. */
  it.each([2_000, 4_000, 8_000, 20_000])("nets %s down by all three costs", (monthlyPjOffer) => {
    const { pjDetail, pjNet } = compare({ monthlyPjOffer });

    expect(pjNet).toBeCloseTo(
      monthlyPjOffer - pjDetail.inssWithheld - pjDetail.accountantFee - pjDetail.irpfWithheld,
      2,
    );
  });

  /**
   * A deductible expense can only shelter income from tax. It can never raise
   * the net by more than it costs — a shield worth more than the expense would
   * be a money pump — and it can never lower it either.
   */
  it.each([500, 2_000, 5_000, 20_000])(
    "shelters tax with %s of expenses, and no more",
    (pjDeductibleExpenses) => {
      const withoutExpenses = compare({ monthlyPjOffer: 15_000, pjDeductibleExpenses: 0 });
      const withExpenses = compare({ monthlyPjOffer: 15_000, pjDeductibleExpenses });
      const gain = withExpenses.pjNet - withoutExpenses.pjNet;

      expect(gain).toBeGreaterThanOrEqual(0);
      expect(gain).toBeLessThanOrEqual(pjDeductibleExpenses);
    },
  );

  /**
   * Once expenses have taken the tax to zero there is nothing left to shelter,
   * so the net stops moving — and stops exactly at the invoice less the
   * contribution and the fee.
   */
  it("stops rewarding expenses once the tax is already zero", () => {
    const monthlyPjOffer = 8_000;
    const large = compare({ monthlyPjOffer, pjDeductibleExpenses: 50_000 }).pjNet;
    const larger = compare({ monthlyPjOffer, pjDeductibleExpenses: 100_000 }).pjNet;

    expect(larger).toBe(large);
    expect(large).toBe(6_000);
  });

  it("treats a negative expense as none", () => {
    expect(compare({ pjDeductibleExpenses: -1_000 }).pjNet).toBe(
      compare({ pjDeductibleExpenses: 0 }).pjNet,
    );
  });
});

describe("calculateCltVsPj — the break-even proposal", () => {
  /**
   * ⚠️ `breakEvenPjOffer` is the single number the page promises in prose: "seria
   * preciso faturar cerca de R$ X por mês como PJ para chegar ao mesmo ganho
   * líquido". A PJ invoicing exactly that must land on the CLT package — not
   * near it, on it, since the search solves for the figure instead of stepping
   * towards it in R$ 100 jumps.
   */
  it.each([3_000, 8_000, 15_000, 25_000])(
    "names the invoice that matches a %s salary",
    (cltGrossSalary) => {
      const result = compare({ cltGrossSalary });
      const atThatInvoice = compare({ cltGrossSalary, monthlyPjOffer: result.breakEvenPjOffer });

      expect(atThatInvoice.pjNet).toBe(result.cltWithBenefits);
    },
  );

  it.each([3_000, 8_000, 15_000, 25_000])(
    "names the smallest such invoice for %s",
    (cltGrossSalary) => {
      const result = compare({ cltGrossSalary });
      const aCentavoLess = compare({
        cltGrossSalary,
        monthlyPjOffer: result.breakEvenPjOffer - 0.01,
      });

      expect(aCentavoLess.pjNet).toBeLessThan(result.cltWithBenefits);
    },
  );

  /**
   * ⚠️ What a PJ must invoice to match a CLT package is a property of that
   * package and of the deductible expenses — not of the offer on the table. The
   * search used to start from the offer and take at most ten R$ 100 steps, so it
   * both failed to arrive and gave four different answers to four candidates
   * weighing four offers against the same salary.
   */
  it.each([0, 4_000, 8_000, 12_000, 20_000])(
    "ignores the %s offer it is compared with",
    (monthlyPjOffer) => {
      const reference = compare({ cltGrossSalary: 8_000, monthlyPjOffer: 1 }).breakEvenPjOffer;

      expect(compare({ cltGrossSalary: 8_000, monthlyPjOffer }).breakEvenPjOffer).toBe(reference);
    },
  );

  it("does depend on the expenses, which are part of the question", () => {
    const withoutExpenses = compare({ pjDeductibleExpenses: 0 }).breakEvenPjOffer;
    const withExpenses = compare({ pjDeductibleExpenses: 3_000 }).breakEvenPjOffer;

    expect(withExpenses).toBeLessThan(withoutExpenses);
  });

  it("asks for nothing when there is no CLT package to match", () => {
    expect(compare({ cltGrossSalary: 0 }).breakEvenPjOffer).toBe(0);
  });
});

describe("calculateCltVsPj — the verdict", () => {
  /**
   * There is one crossover, and the verdict must flip across it in the right
   * direction: below it CLT wins, above it PJ does. The crossover is located by
   * bisection on the module's own verdict, so the test never restates how the
   * two sides are computed.
   */
  it.each([4_000, 8_000, 20_000])(
    "flips the verdict across the crossover for %s, and only there",
    (cltGrossSalary) => {
      const crossover = crossoverProposal(cltGrossSalary);

      // Both sides are rounded to the centavo, so the flip lands within one of zero.
      expect(
        Math.abs(compare({ cltGrossSalary, monthlyPjOffer: crossover }).difference),
      ).toBeLessThanOrEqual(0.01);
      expect(compare({ cltGrossSalary, monthlyPjOffer: crossover - 10 }).analysis.cltIsBetter).toBe(
        true,
      );
      expect(compare({ cltGrossSalary, monthlyPjOffer: crossover + 10 }).analysis.cltIsBetter).toBe(
        false,
      );
    },
  );

  /**
   * ⚠️ The exact tie, which `breakEvenPjOffer` puts within reach: invoicing the
   * break-even figure makes the difference exactly zero. Neither side is ahead
   * there, so the badge must not claim CLT is — and the prose must say so too,
   * rather than announcing a 0% advantage for whichever side the comparison
   * happens to fall on.
   */
  it("calls an exact tie a tie, on neither side", () => {
    const cltGrossSalary = 8_000;
    const { breakEvenPjOffer } = compare({ cltGrossSalary });
    const tie = compare({ cltGrossSalary, monthlyPjOffer: breakEvenPjOffer });

    expect(tie.difference).toBe(0);
    expect(tie.analysis.cltIsBetter).toBe(false);
    expect(tie.analysis.rationale).toMatch(/empatam/);
  });

  /**
   * ⚠️ The badge and the prose are two renderings of one verdict, printed side
   * by side. Read apart, an inverted branch shows "CLT é melhor" above a
   * paragraph explaining how much better PJ is, and no assertion notices.
   */
  it.each([
    { scenario: "CLT ahead", monthlyPjOffer: 5_000, cltIsBetter: true, opening: /^CLT é/ },
    { scenario: "PJ ahead", monthlyPjOffer: 20_000, cltIsBetter: false, opening: /^PJ é/ },
  ])(
    "says in prose what the badge says, with $scenario",
    ({ monthlyPjOffer, cltIsBetter, opening }) => {
      const { analysis } = compare({ cltGrossSalary: 8_000, monthlyPjOffer });

      expect(analysis.cltIsBetter).toBe(cltIsBetter);
      expect(analysis.rationale).toMatch(opening);
    },
  );

  /**
   * ⚠️ When CLT wins, the prose names the invoice a PJ would need. It has to be
   * the same figure the table beside it prints: the two disagreed for every
   * input, because the prose read a search that never converged.
   */
  it("quotes the break-even invoice the page prints beside it", () => {
    const result = compare({ cltGrossSalary: 8_000, monthlyPjOffer: 5_000 });

    expect(result.analysis.cltIsBetter).toBe(true);
    expect(result.analysis.rationale).toContain(result.breakEvenPjOffer.toFixed(0));
  });

  it.each([4_000, 9_000, 13_000, 25_000])(
    "agrees on which side is ahead at %s",
    (monthlyPjOffer) => {
      const result = compare({ monthlyPjOffer });

      expect(result.differencePercent < 0).toBe(result.analysis.cltIsBetter);
      expect(result.difference < 0).toBe(result.analysis.cltIsBetter);
    },
  );

  it.each([4_000, 13_000, 25_000])(
    "reports the yearly gap at %s as twelve monthly ones",
    (monthlyPjOffer) => {
      const { analysis } = compare({ monthlyPjOffer });

      expect(analysis.monthlyDifference).toBeGreaterThanOrEqual(0);
      expect(analysis.annualDifference).toBeCloseTo(analysis.monthlyDifference * 12, 2);
    },
  );
});

describe("calculateCltVsPj — the verdict the page renders", () => {
  /**
   * `cltIsBetter` is a boolean, so on its own it cannot express a tie: at an exact
   * draw it reads false and the badge said "PJ é melhor" over prose saying the
   * two were level. `isTie` is what gives the page a third state.
   */
  it("flags a tie rather than silently favouring PJ", () => {
    const gross = 8_000;
    const matching = calculateCltVsPj({
      cltGrossSalary: gross,
      monthlyPjOffer: 4_000,
      dependants: 0,
      pjDeductibleExpenses: 0,
    }).breakEvenPjOffer;

    const tied = calculateCltVsPj({
      cltGrossSalary: gross,
      monthlyPjOffer: matching,
      dependants: 0,
      pjDeductibleExpenses: 0,
    });

    expect(tied.analysis.isTie).toBe(true);
    expect(Math.abs(tied.difference)).toBeLessThan(0.01);
  });

  it.each([0, 8_000])(
    "says whether a percentage has a base to be taken of, for a CLT salary of %s",
    (cltGrossSalary) => {
      const result = calculateCltVsPj({
        cltGrossSalary,
        monthlyPjOffer: 5_000,
        dependants: 0,
        pjDeductibleExpenses: 0,
      });

      expect(result.analysis.hasBaseForPercentage).toBe(cltGrossSalary > 0);
      expect(Number.isFinite(result.differencePercent)).toBe(true);
    },
  );
});

describe("calculateCltVsPj — degenerate input", () => {
  /**
   * ⚠️ Both fields are plain currency inputs with no floor, so a visitor who
   * clears them reaches this. `differencePercent` was 0/0 here, and the number
   * lands in the page twice: in the "Diferença: %" label and inside the
   * Portuguese rationale.
   */
  it("does not produce a NaN percentage when both sides are zero", () => {
    const result = compare({ cltGrossSalary: 0, monthlyPjOffer: 0 });

    expect(Number.isNaN(result.differencePercent)).toBe(false);
    expect(result.analysis.rationale).not.toMatch(/NaN/);
  });

  /**
   * ⚠️ Same field, the other degenerate case: any PJ offer against a zero CLT
   * salary divided by zero and rendered as "PJ é Infinity% mais vantajoso".
   */
  it("does not produce an infinite percentage when the CLT salary is zero", () => {
    const result = compare({ cltGrossSalary: 0, monthlyPjOffer: 5_000 });

    expect(Number.isFinite(result.differencePercent)).toBe(true);
    expect(result.analysis.rationale).not.toMatch(/Infinity/);
    expect(result.analysis.rationale).toMatch(/^PJ é mais vantajoso/);
  });

  it("keeps every returned figure finite for ordinary input", () => {
    const result = compare({ cltGrossSalary: 7_500, monthlyPjOffer: 11_000 });

    for (const value of [
      result.cltNet,
      result.cltWithBenefits,
      result.pjNet,
      result.difference,
      result.differencePercent,
      result.breakEvenPjOffer,
      result.analysis.monthlyDifference,
      result.analysis.annualDifference,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("echoes the input back untouched", () => {
    const result = compare({ cltGrossSalary: 7_500, monthlyPjOffer: 11_000 });

    expect(result.cltGrossSalary).toBe(7_500);
    expect(result.monthlyPjOffer).toBe(11_000);
  });

  it("floors negative income at zero instead of paying a negative tax", () => {
    const result = compare({ cltGrossSalary: -5_000, monthlyPjOffer: -5_000 });

    expect(result.cltGrossSalary).toBe(0);
    expect(result.monthlyPjOffer).toBe(0);
    expect(result.cltNet).toBe(0);
    expect(result.pjNet).toBe(0);
  });
});
