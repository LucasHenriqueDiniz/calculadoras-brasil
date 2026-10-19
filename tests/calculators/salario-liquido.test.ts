import { describe, expect, it } from "vitest";
import {
  buildNetSalaryTable,
  calculateNetSalary,
  simplifiedRouteCeiling,
  type NetSalaryInput,
} from "../../src/lib/calculators/salarioLiquido";
import {
  IRPF_MONTHLY_TABLE_2026,
  SIMPLIFIED_DEDUCTION_MONTHLY,
} from "../../src/lib/calculators/irpf-constants";
import { calculateIrpf } from "../../src/lib/calculators/irpf";
import { INSS_CEILING, calculateEmployeeInss } from "../../src/lib/calculators/inss-constants";

/**
 * The monthly incidence table exactly as the Receita Federal publishes it,
 * transcribed from
 * docs/research/2026-09-04-irpf-2026-table/fetches/receita-federal-tabelas-2026.md.
 *
 * ⚠️ The one hard-coded copy of the table in this file, and it has to be one.
 * Every other figure below is read from the module's own export, so no assertion
 * can drift onto a boundary the module stopped using — but a table checked only
 * against itself pins nothing at all. Measured: with the boundaries hand-copied
 * and no external oracle, R$ 2.428,80 could be moved to any value up to R$ 4.390
 * and the whole suite still passed, because the Lei 15.270 reduction zeroes the
 * withholding under R$ 5.000 of gross and every boundary sits in that zone, so
 * the continuity cases compared 0 with 0.
 *
 * The oracle for a published tax table is the publication.
 */
const OFFICIAL_MONTHLY_TABLE_2026 = [
  { upTo: 2428.8, rate: 0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
  { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
  { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
  { upTo: Infinity, rate: 0.275, deduction: 908.73 },
];

/** The upper bound of every bounded bracket, read from the module, never copied. */
const BRACKET_BOUNDARIES = IRPF_MONTHLY_TABLE_2026.map((bracket) => bracket.upTo).filter((upTo) =>
  Number.isFinite(upTo),
);

const TOP_MARGINAL_RATE = IRPF_MONTHLY_TABLE_2026[IRPF_MONTHLY_TABLE_2026.length - 1].rate;

/** What the published table charges on a monthly base, rounded as a payslip is. */
function officialTableTax(base: number): number {
  const bracket = OFFICIAL_MONTHLY_TABLE_2026.find(({ upTo }) => base <= upTo);
  if (!bracket) {
    throw new Error(`no published bracket covers a base of ${base}`);
  }

  return Math.round(Math.max(base * bracket.rate - bracket.deduction, 0) * 100) / 100;
}

/**
 * One base inside every published bracket: just past its lower edge, its middle,
 * and its upper edge. Derived from the publication rather than from the module,
 * so a boundary the module moved reclassifies a probe and the value oracle fails.
 */
function publishedBracketProbes(): Array<{ base: number; rate: number }> {
  const probes: Array<{ base: number; rate: number }> = [];
  let previousUpTo = 0;

  for (const { upTo, rate } of OFFICIAL_MONTHLY_TABLE_2026) {
    const top = Number.isFinite(upTo) ? upTo : previousUpTo + 20_000;

    for (const base of [previousUpTo + 0.01, (previousUpTo + top) / 2, top]) {
      probes.push({ base, rate });
    }

    previousUpTo = upTo;
  }

  return probes;
}

const NO_DEDUCTIONS: Omit<NetSalaryInput, "monthlyGrossSalary"> = {
  dependants: 0,
  monthlyPrivatePension: 0,
  hasMealAllowance: false,
  hasTransportAllowance: false,
  hasUnionDue: false,
};

function netSalary(input: Partial<NetSalaryInput> & { monthlyGrossSalary: number }) {
  return calculateNetSalary({ ...NO_DEDUCTIONS, ...input });
}

/**
 * Gross monthly salary whose monthly assessable base is `base`, with no
 * deductions and no dependants.
 *
 * Deliberately not `base / 0.9` or any other closed form: INSS is progressive
 * and capped, so the mapping is not a division, and a stale helper here would
 * leave every boundary test probing the wrong base while still passing. Gross to
 * base is strictly increasing (the marginal INSS rate is below 1), so bisection
 * is exact enough.
 */
function grossForBase(base: number): number {
  let low = base;
  let high = base * 2 + 20_000;

  for (let step = 0; step < 200; step += 1) {
    const middle = (low + high) / 2;
    if (netSalary({ monthlyGrossSalary: middle }).monthlyAssessableBase < base) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}

/**
 * The tax the TABLE produces, before the Lei 15.270/2025 reduction.
 *
 * ⚠️ Deliberately not `estimatedIrpfWithheld`. The reduction zeroes the withholding
 * below R$ 5.000 of gross salary, and every bracket boundary here sits under
 * that — so asserting continuity on the final figure would compare 0 to 0 at
 * every boundary and pass while proving nothing.
 */
function taxAtBase(base: number): number {
  return netSalary({ monthlyGrossSalary: grossForBase(base) }).taxFromTable;
}

/**
 * The Lei 15.270/2025 monthly reduction, written out from the statute's own
 * figures in docs/research/2026-09-04-irpf-2026-table/research.md rather than
 * imported, so the oracle below shares no code with the module it checks.
 */
function statuteMonthlyReduction(gross: number, taxFromTable: number): number {
  if (gross <= 5000) return Math.min(312.89, taxFromTable);
  if (gross <= 7350) return Math.min(Math.max(978.62 - 0.133145 * gross, 0), taxFromTable);
  return 0;
}

/**
 * The withholding of one route to the base, from the publication alone:
 * `deduction` off the gross, the published table, then the statute's reduction.
 */
function withholdingOnRoute(gross: number, deduction: number): number {
  const tax = officialTableTax(Math.max(gross - deduction, 0));
  const reduction = Math.round(statuteMonthlyReduction(gross, tax) * 100) / 100;
  return Math.round(Math.max(tax - reduction, 0) * 100) / 100;
}

/** The employee INSS of 2026, from the published brackets, for the same reason. */
function officialInss(gross: number): number {
  const brackets = [
    { upTo: 1621.0, rate: 0.075 },
    { upTo: 2902.84, rate: 0.09 },
    { upTo: 4354.27, rate: 0.12 },
    { upTo: 8475.55, rate: 0.14 },
  ];
  let contribution = 0;
  let floor = 0;
  for (const { upTo, rate } of brackets) {
    if (gross <= floor) break;
    contribution += (Math.min(gross, upTo) - floor) * rate;
    floor = upTo;
  }
  return contribution;
}

describe("calculateNetSalary — the ordinary case", () => {
  /**
   * One salary, the whole breakdown, each figure reachable by hand from the
   * published 2026 tables:
   *
   * - INSS on R$ 6.000,00: R$ 641,5144
   * - legal deductions: 641,5144 + 189,59 (one dependant) + 200,00 (PGBL) = R$ 1.031,1044,
   *   which beats the R$ 607,20 simplified discount, so the legal route applies
   * - base: R$ 4.968,8956; table: × 27,5% − 908,73 = R$ 457,72
   * - reduction: 978,62 − 0,133145 × 6.000 = R$ 179,75; withheld R$ 277,97
   */
  const result = netSalary({ monthlyGrossSalary: 6000, dependants: 1, monthlyPrivatePension: 200 });

  it("withholds the progressive INSS contribution", () => {
    expect(result.inssWithheld).toBeCloseTo(641.51, 2);
  });

  it("totals the monthly legal deductions and takes them, being the larger", () => {
    expect(result.dependantAllowance).toBeCloseTo(189.59, 2);
    expect(result.privatePensionDeduction).toBe(200);
    expect(result.legalDeductions).toBeCloseTo(1031.1044, 4);
    expect(result.deductionApplied).toBe("legal");
    expect(result.monthlyAssessableBase).toBeCloseTo(4968.8956, 4);
  });

  it("taxes that base, then applies the reduction", () => {
    expect(result.taxFromTable).toBeCloseTo(457.72, 2);
    expect(result.reductionLei15270).toBeCloseTo(179.75, 2);
    expect(result.estimatedIrpfWithheld).toBeCloseTo(277.97, 2);
  });

  it("arrives at the net salary and the effective rate", () => {
    // 6.000,00 gross, less 641,5144 of INSS and 277,97 of IRPF.
    expect(result.monthlyNetSalary).toBeCloseTo(5080.5156, 4);
    expect(result.annualNetSalary).toBeCloseTo(5080.5156 * 12, 4);
    expect(result.effectiveIrpfRate).toBeCloseTo(4.6328, 4);
  });
});

describe("calculateNetSalary — INSS", () => {
  it("stops at the RGPS ceiling instead of scaling with the salary", () => {
    const ceilingContribution = calculateEmployeeInss(INSS_CEILING);

    expect(ceilingContribution).toBeCloseTo(988.09, 2);
    expect(netSalary({ monthlyGrossSalary: INSS_CEILING }).inssWithheld).toBeCloseTo(
      ceilingContribution,
      2,
    );
    expect(netSalary({ monthlyGrossSalary: 50_000 }).inssWithheld).toBeCloseTo(
      ceilingContribution,
      2,
    );
  });

  /**
   * The figure, not the wiring. Asserting this against `calculateEmployeeInss`
   * only restated the call the module makes and would have passed against a flat
   * rate, a cumulative one, or any other contribution table.
   *
   * R$ 4.000,00 spans three brackets, each rate applying to its own slice:
   * `1.621,00 × 7,5% + (2.902,84 − 1.621,00) × 9% + (4.000,00 − 2.902,84) × 12%`
   * = `121,575 + 115,3656 + 131,6592` = R$ 368,5998.
   */
  it("charges each bracket only on the slice of the salary inside it", () => {
    expect(netSalary({ monthlyGrossSalary: 4000 }).inssWithheld).toBeCloseTo(368.5998, 4);
    // A cumulative reading of the same table would take 12% of the whole salary.
    expect(netSalary({ monthlyGrossSalary: 4000 }).inssWithheld).not.toBeCloseTo(480, 2);
  });
});

describe("calculateNetSalary — the monthly table is the published one", () => {
  /**
   * The assertion the rest of this file rests on. Bound for bound and parcel for
   * parcel against the publication, because continuity and monotonicity are
   * properties a *wrong* table has just as readily as a right one.
   */
  it("carries the Receita Federal's own brackets", () => {
    expect(IRPF_MONTHLY_TABLE_2026).toEqual(OFFICIAL_MONTHLY_TABLE_2026);
  });

  /**
   * The published figures, exercised end to end. The equality above proves the
   * constants are right; this proves they are the constants the calculation
   * actually reaches, and that each base lands in the bracket the publication
   * puts it in.
   *
   * Asserted on `taxFromTable` for the reason `taxAtBase` records: the final
   * withholding is flattened to zero across this whole range by the reduction, so
   * a wrong parcel or a moved boundary leaves no trace in it.
   */
  it.each(publishedBracketProbes())(
    "charges the published $rate rate on a base of R$ $base",
    ({ base }) => {
      // Tolerance 1e-4, not a centavo: both sides round to the centavo, and the
      // gross that `grossForBase` bisects back to this base is exact to 1e-12.
      expect(taxAtBase(base)).toBeCloseTo(officialTableTax(base), 4);
    },
  );

  it("charges nothing below the first bracket", () => {
    expect(taxAtBase(0)).toBe(0);
    expect(taxAtBase(1000)).toBe(0);
    expect(taxAtBase(BRACKET_BOUNDARIES[0] - 0.01)).toBe(0);
  });

  /**
   * A progressive table with deduction parcels is continuous by construction:
   * the parcel exists precisely so that tax computed from either side of a
   * boundary agrees. A jump means the parcel is wrong, whatever the legislation
   * says the rates are.
   *
   * The tolerance is the rounding and nothing else: both figures are rounded to
   * the centavo, and the probe above the boundary carries one extra centavo of
   * base, worth `0,01 × 27,5%` at the steepest rate. Measured on the published
   * table the step is exactly zero at all four boundaries. The R$ 1,00 that stood
   * here pinned nothing — it is thirty times the entire tax the 7,5% band can
   * charge (R$ 29,84 at its top).
   */
  const CONTINUITY_TOLERANCE = 2 * 0.005 + 0.01 * TOP_MARGINAL_RATE;

  it.each(BRACKET_BOUNDARIES)("does not jump across the boundary at %s", (boundary) => {
    const below = taxAtBase(boundary);
    const above = taxAtBase(boundary + 0.01);

    expect(above).toBeGreaterThanOrEqual(below);
    expect(above - below).toBeLessThanOrEqual(CONTINUITY_TOLERANCE);
  });

  it.each(BRACKET_BOUNDARIES)("never charges less for more income near %s", (boundary) => {
    let previous = -Infinity;

    for (let base = boundary - 0.02; base <= boundary + 0.02; base += 0.005) {
      const tax = taxAtBase(base);
      // Exact: rounding to the centavo is monotonic, so a step of half a centavo
      // of base can never lower the tax. The R$ 0,01 of slack this allowed was
      // twice the step it was sweeping in.
      expect(tax).toBeGreaterThanOrEqual(previous);
      previous = tax;
    }
  });

  /**
   * The property a visitor would notice: a raise never leaves you taking home
   * less. Swept across the whole band where the table and the reduction interact.
   */
  it("leaves the net salary rising with the gross", () => {
    let previousNet = -Infinity;
    let previousTax = -Infinity;

    for (let monthlyGrossSalary = 0; monthlyGrossSalary <= 12_000; monthlyGrossSalary += 0.25) {
      const result = netSalary({ monthlyGrossSalary });

      expect(result.estimatedIrpfWithheld).toBeGreaterThanOrEqual(previousTax);
      expect(result.monthlyNetSalary).toBeGreaterThanOrEqual(previousNet);
      previousTax = result.estimatedIrpfWithheld;
      previousNet = result.monthlyNetSalary;
    }
  });
});

describe("calculateNetSalary — the Lei 15.270/2025 reduction", () => {
  /**
   * The worked example in
   * docs/research/2026-09-04-irpf-2026-table/research.md, Findings §4: a gross of
   * R$ 5.000,00 less the R$ 607,20 simplified ceiling gives a base of
   * R$ 4.392,80, which the table taxes at R$ 312,89 — exactly the reduction the
   * statute grants in its first band, so the withholding is zero by construction.
   *
   * No regime is passed: the simplified discount is the more beneficial route at
   * R$ 5.000 (INSS is R$ 501,51), so the law applies it. Before that was read
   * from art. 4º, § 2º, the page's own default — R$ 5.000, no deductions — took the
   * legal route and withheld R$ 23,78 from a salary the statute exempts.
   */
  it("reproduces the statute's own first-band figure at R$ 5.000, unprompted", () => {
    const result = netSalary({ monthlyGrossSalary: 5000 });

    expect(result.deductionApplied).toBe("simplified");

    expect(result.monthlyAssessableBase).toBeCloseTo(4392.8, 2);
    expect(result.taxFromTable).toBeCloseTo(312.89, 2);
    expect(result.reductionLei15270).toBeCloseTo(312.89, 2);
    expect(result.estimatedIrpfWithheld).toBe(0);
  });

  /**
   * The Receita's own worked example, quoted in the research note:
   * R$ 978,62 − (0,133145 × R$ 6.000,00) = R$ 179,75.
   *
   * ⚠️ The coefficient multiplies the GROSS salary, not the calculation base.
   * Against the base (R$ 5.358,49 here) it would give R$ 265,25 instead — the
   * kind of error that is invisible without a case that pins the difference.
   */
  it("applies the phase-out coefficient to the gross salary, not to the base", () => {
    const result = netSalary({ monthlyGrossSalary: 6000 });

    expect(result.reductionLei15270).toBeCloseTo(179.75, 2);
    expect(result.reductionLei15270).not.toBeCloseTo(
      978.62 - 0.133145 * result.monthlyAssessableBase,
      2,
    );
  });

  it("exempts an ordinary salary that the old annual table charged for", () => {
    // Before the fix this salary was withheld R$ 189,90 a month.
    expect(netSalary({ monthlyGrossSalary: 4000 }).estimatedIrpfWithheld).toBe(0);
    expect(netSalary({ monthlyGrossSalary: 3000 }).estimatedIrpfWithheld).toBe(0);
    expect(netSalary({ monthlyGrossSalary: 2500 }).estimatedIrpfWithheld).toBe(0);
  });

  it("has phased out to nothing by R$ 7.350", () => {
    expect(netSalary({ monthlyGrossSalary: 7350 }).reductionLei15270).toBeLessThan(0.01);
    expect(netSalary({ monthlyGrossSalary: 7351 }).reductionLei15270).toBe(0);

    const above = netSalary({ monthlyGrossSalary: 9000 });
    expect(above.reductionLei15270).toBe(0);
    expect(above.estimatedIrpfWithheld).toBeCloseTo(above.taxFromTable, 6);
  });

  it("never reduces by more than the tax the table produced", () => {
    for (let monthlyGrossSalary = 1000; monthlyGrossSalary <= 12_000; monthlyGrossSalary += 50) {
      const result = netSalary({ monthlyGrossSalary });

      expect(result.reductionLei15270).toBeLessThanOrEqual(result.taxFromTable + 1e-9);
      expect(result.estimatedIrpfWithheld).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * ⚠️ Pinned artifact, not a defect in this module.
   *
   * The two bands of the statute do not meet. The first caps the reduction at
   * R$ 312,89 while the second's formula evaluates to R$ 312,8937 at
   * R$ 5.000,01, so the reduction steps UP as the gross crosses R$ 5.000 and the
   * withholding steps DOWN — the monthly twin of the R$ 1,08 annual step pinned
   * in tests/calculators/irpf.test.ts.
   *
   * Monthly it is R$ 0,0037, below the centavo this module rounds to, so it
   * cannot reach a payslip. This test pins that it stays there: if a constant
   * drifted, the step would grow past the rounding and show up here.
   */
  it("keeps the statute's own band-boundary step below the centavo at R$ 5.000", () => {
    const below = netSalary({ monthlyGrossSalary: 5000 });
    const above = netSalary({ monthlyGrossSalary: 5000.01 });

    expect(above.reductionLei15270).toBe(below.reductionLei15270);
    expect(above.estimatedIrpfWithheld).toBe(below.estimatedIrpfWithheld);
  });
});

describe("calculateNetSalary — the more beneficial route (Lei 9.250, art. 4º, § 2º)", () => {
  it("is 25% of the exempt band's ceiling, as the statute words it", () => {
    expect(SIMPLIFIED_DEDUCTION_MONTHLY).toBeCloseTo(0.25 * OFFICIAL_MONTHLY_TABLE_2026[0].upTo, 2);
    expect(SIMPLIFIED_DEDUCTION_MONTHLY).toBe(607.2);
  });

  it("takes the simplified discount where it beats INSS alone", () => {
    const result = netSalary({ monthlyGrossSalary: 5300 });

    expect(result.deductionApplied).toBe("simplified");
    expect(result.monthlyAssessableBase).toBeCloseTo(5300 - 607.2, 6);
  });

  /**
   * INSS reaches R$ 607,20 at a gross of R$ 5.754,90: 599,5144 at R$ 5.700,00
   * plus 14% of the next R$ 54,90. Either side of it, the larger deduction wins.
   */
  it("switches to the legal route once INSS alone passes R$ 607,20", () => {
    expect(netSalary({ monthlyGrossSalary: 5754 }).deductionApplied).toBe("simplified");
    expect(netSalary({ monthlyGrossSalary: 5756 }).deductionApplied).toBe("legal");
  });

  it("lets a dependant tip it back to the legal route", () => {
    // 543,51 of INSS + 189,59 = 733,10, above the simplified 607,20.
    expect(netSalary({ monthlyGrossSalary: 5300, dependants: 1 }).deductionApplied).toBe("legal");
  });

  /**
   * The property itself, against the publication: whatever the salary and the
   * dependants, the withholding is the lower of the two routes, each computed
   * here from the published tables and the statute with no code from the module.
   */
  it("withholds the lower of the two routes, everywhere", () => {
    for (let monthlyGrossSalary = 0; monthlyGrossSalary <= 12_000; monthlyGrossSalary += 5) {
      for (const dependants of [0, 1, 2]) {
        const legal = officialInss(monthlyGrossSalary) + dependants * 189.59;
        const simplified = Math.min(607.2, monthlyGrossSalary);
        const expected = Math.min(
          withholdingOnRoute(monthlyGrossSalary, legal),
          withholdingOnRoute(monthlyGrossSalary, simplified),
        );

        expect(
          netSalary({ monthlyGrossSalary, dependants }).estimatedIrpfWithheld,
          `gross R$ ${monthlyGrossSalary}, ${dependants} dependant(s)`,
        ).toBeCloseTo(expected, 2);
      }
    }
  });

  it("is worth R$ 23,78 a month at R$ 5.000 against the legal route alone", () => {
    expect(withholdingOnRoute(5000, officialInss(5000))).toBeCloseTo(23.78, 2);
    expect(netSalary({ monthlyGrossSalary: 5000 }).estimatedIrpfWithheld).toBe(0);
  });
});

describe("calculateNetSalary — dependants and private pension", () => {
  it("deducts R$ 189,59 a month per dependant, uncapped in count", () => {
    expect(netSalary({ monthlyGrossSalary: 8000, dependants: 0 }).dependantAllowance).toBe(0);
    expect(netSalary({ monthlyGrossSalary: 8000, dependants: 1 }).dependantAllowance).toBeCloseTo(
      189.59,
      2,
    );
    expect(netSalary({ monthlyGrossSalary: 8000, dependants: 3 }).dependantAllowance).toBeCloseTo(
      568.77,
      2,
    );
  });

  it("lowers the withholding as dependants are added", () => {
    const none = netSalary({ monthlyGrossSalary: 8000, dependants: 0 }).estimatedIrpfWithheld;
    const one = netSalary({ monthlyGrossSalary: 8000, dependants: 1 }).estimatedIrpfWithheld;
    const three = netSalary({ monthlyGrossSalary: 8000, dependants: 3 }).estimatedIrpfWithheld;

    expect(one).toBeLessThan(none);
    expect(three).toBeLessThan(one);
  });

  /**
   * The field is labelled monthly on the page, and it is read as monthly here.
   * It used to be divided by twelve, so a R$ 500,00 monthly contribution lowered
   * the base by R$ 41,67.
   */
  it("deducts the private pension contribution as the monthly amount typed", () => {
    const none = netSalary({ monthlyGrossSalary: 8000 });
    const withPension = netSalary({ monthlyGrossSalary: 8000, monthlyPrivatePension: 500 });

    expect(withPension.privatePensionDeduction).toBe(500);
    expect(none.monthlyAssessableBase - withPension.monthlyAssessableBase).toBeCloseTo(500, 6);
  });

  /**
   * Health and education are art. 8º, the annual adjustment, and do not reach
   * the monthly base. A form saved by the previous build still carries both
   * fields; they must change nothing, which is also why the page's storage key
   * moved to v3.
   */
  it("ignores health and education, which belong to the annual adjustment", () => {
    const stale = {
      ...NO_DEDUCTIONS,
      monthlyGrossSalary: 8000,
      educationDeduction: 3000,
      healthDeduction: 10_000,
    } as NetSalaryInput;

    expect(calculateNetSalary(stale).estimatedIrpfWithheld).toBe(
      netSalary({ monthlyGrossSalary: 8000 }).estimatedIrpfWithheld,
    );
  });

  it("floors negative inputs at zero rather than letting one raise the tax", () => {
    const result = netSalary({
      monthlyGrossSalary: 8000,
      monthlyPrivatePension: -1000,
      dependants: -2,
    });

    expect(result.privatePensionDeduction).toBe(0);
    expect(result.dependantAllowance).toBe(0);
    expect(result.estimatedIrpfWithheld).toBeCloseTo(
      netSalary({ monthlyGrossSalary: 8000 }).estimatedIrpfWithheld,
      6,
    );
  });

  it("never drives the base below zero", () => {
    const result = netSalary({ monthlyGrossSalary: 3000, monthlyPrivatePension: 999_999 });

    expect(result.monthlyAssessableBase).toBe(0);
    expect(result.estimatedIrpfWithheld).toBe(0);
  });
});

describe("calculateNetSalary — benefits and other deductions", () => {
  const monthlyGrossSalary = 5000;
  const plain = netSalary({ monthlyGrossSalary });

  it("adds the meal allowance outside the taxable salary", () => {
    const result = netSalary({ monthlyGrossSalary, hasMealAllowance: true });

    expect(result.nonTaxableBenefits).toBe(360);
    expect(result.monthlyNetSalary).toBeCloseTo(plain.monthlyNetSalary, 6);
    expect(result.totalMonthlyIncome).toBeCloseTo(plain.monthlyNetSalary + 360, 6);
  });

  it("takes the transport allowance off the net, capped", () => {
    const result = netSalary({ monthlyGrossSalary, hasTransportAllowance: true });

    expect(result.transportAllowanceDeduction).toBe(250); // 6% of 5.000 is 300, above the cap
    expect(
      netSalary({ monthlyGrossSalary: 3000, hasTransportAllowance: true })
        .transportAllowanceDeduction,
    ).toBe(180);
    expect(result.nonTaxableBenefits).toBe(0);
    expect(result.monthlyNetSalary).toBeCloseTo(plain.monthlyNetSalary - 250, 6);
  });

  it("takes the union due off the net", () => {
    const result = netSalary({ monthlyGrossSalary, hasUnionDue: true });

    expect(result.unionDue).toBeCloseTo(16.5, 2);
    expect(result.transportAllowanceDeduction).toBe(0);
    expect(result.nonTaxableBenefits).toBe(0);
    expect(result.monthlyNetSalary).toBeCloseTo(plain.monthlyNetSalary - 16.5, 2);
  });

  it("leaves all three off when none is selected", () => {
    expect(plain.nonTaxableBenefits).toBe(0);
    expect(plain.transportAllowanceDeduction).toBe(0);
    expect(plain.unionDue).toBe(0);
  });

  it("does not let any benefit change the tax", () => {
    const all = netSalary({
      monthlyGrossSalary,
      hasMealAllowance: true,
      hasTransportAllowance: true,
      hasUnionDue: true,
    });

    expect(all.estimatedIrpfWithheld).toBeCloseTo(plain.estimatedIrpfWithheld, 6);
    expect(all.inssWithheld).toBeCloseTo(plain.inssWithheld, 6);
  });
});

describe("calculateNetSalary — agrees with calculateIrpf on the table and the deductions", () => {
  /**
   * The two modules implement the same 2026 table and the deductions they share
   * — INSS, dependants, private pension — on the same inputs. This is the case
   * that catches those copies drifting apart; it asserts one module's output
   * against the other's, never against a hard-coded pair.
   *
   * Health and education are left at zero because the monthly base cannot take
   * them (art. 4º) while the annual one can (art. 8º): that is a difference in
   * the law, not drift.
   *
   * ⚠️ It says nothing about the two Lei 15.270/2025 reductions. R$ 100.000 a year
   * is R$ 8.333,33 a month, past the monthly phase-out at R$ 7.350 and the annual
   * one at R$ 88.200, so both are zero here — asserted below rather than assumed.
   */
  const grossAnnualIncome = 100_000;
  const monthly = netSalary({
    monthlyGrossSalary: grossAnnualIncome / 12,
    dependants: 2,
    monthlyPrivatePension: 1000 / 12,
  });
  const annual = calculateIrpf({
    grossAnnualIncome,
    dependants: 2,
    educationDeduction: 0,
    healthDeduction: 0,
    supplementaryPensionDeduction: 1000,
    simplifiedRegime: false,
  });

  it("takes the legal route, as the annual comparison assumes", () => {
    expect(monthly.deductionApplied).toBe("legal");
  });

  it("allows the same dependant amount over a year", () => {
    expect(monthly.dependantAllowance * 12).toBeCloseTo(annual.dependantAllowance, 2);
  });

  it("withholds the same INSS over a year", () => {
    expect(monthly.inssWithheld * 12).toBeCloseTo(annual.inssWithheld, 6);
  });

  it("reaches the same assessable base over a year", () => {
    expect(monthly.monthlyAssessableBase * 12).toBeCloseTo(annual.assessableBase, 2);
  });

  /** Keeps this comparison honest about which half of the legislation it reaches. */
  it("sits above both phase-outs, so neither reduction is in play", () => {
    expect(monthly.reductionLei15270).toBe(0);
    expect(annual.reductionLei15270).toBe(0);
  });

  /**
   * The monthly and annual tables are the same table: every annual boundary is
   * twelve times its monthly one. The published parcels are each rounded to the
   * centavo independently, so twelve monthly withholdings land within a few
   * centavos of the annual assessment rather than exactly on it.
   */
  it("produces the same tax over a year, to within the parcels' own rounding", () => {
    expect(monthly.taxFromTable * 12).toBeCloseTo(annual.taxFromTable, 0);
  });
});

describe("calculateNetSalary — degenerate input", () => {
  it("returns zeros for a zero salary without producing NaN", () => {
    const result = netSalary({ monthlyGrossSalary: 0 });

    for (const [field, value] of Object.entries(result)) {
      if (typeof value === "number") {
        expect(Number.isNaN(value), `${field} is NaN`).toBe(false);
        expect(value, `${field} is not zero`).toBe(0);
      }
    }

    expect(result.deductionApplied).toBe("legal");
  });

  it("clamps a negative salary to zero rather than paying the worker tax back", () => {
    const result = netSalary({ monthlyGrossSalary: -5000 });

    expect(result.monthlyGrossSalary).toBe(0);
    expect(result.monthlyNetSalary).toBe(0);
    expect(result.estimatedIrpfWithheld).toBe(0);
  });

  it("reports a zero effective rate at a zero salary instead of dividing by zero", () => {
    expect(netSalary({ monthlyGrossSalary: 0 }).effectiveIrpfRate).toBe(0);
  });
});

describe("buildNetSalaryTable — the page's salary table", () => {
  const grosses = [1621, 3000, 5000, 5500, 6000, 8000, 20_000];
  const rows = buildNetSalaryTable(grosses);

  it("returns one row per salary, in order", () => {
    expect(rows.map((row) => row.monthlyGrossSalary)).toEqual(grosses);
  });

  it("is the form's own answer on every row", () => {
    for (const dependants of [0, 2]) {
      for (const row of buildNetSalaryTable(grosses, dependants)) {
        const form = netSalary({ monthlyGrossSalary: row.monthlyGrossSalary, dependants });

        expect(row.monthlyNetSalary).toBe(form.monthlyNetSalary);
        expect(row.estimatedIrpfWithheld).toBe(form.estimatedIrpfWithheld);
        expect(row.deductionApplied).toBe(form.deductionApplied);
      }
    }
  });

  /**
   * The equality above alone is a tautology: a builder and a form that were both
   * wrong would agree. These four rows are computed by hand from the published
   * 2026 tables and the statute, one per situation the table has to get right:
   *
   * - R$ 5.000: simplified route, base 4.392,80, table 312,89, reduction 312,89, IR 0;
   *   net = 5.000 − 501,5144 = 4.498,4856
   * - R$ 5.500: simplified route, base 4.892,80 at 27,5% − 908,73 = 436,79;
   *   reduction 978,62 − 0,133145 × 5.500 = 246,32; IR 190,47; INSS 571,5144
   * - R$ 6.000: legal route (INSS 641,5144), base 5.358,4856, table 564,85;
   *   reduction 179,75; IR 385,10
   * - R$ 8.000: legal route (INSS 921,5144), base 7.078,4856, table 1.037,85;
   *   past the phase-out, IR 1.037,85
   */
  it.each([
    { gross: 5000, route: "simplified", irrf: 0, net: 4498.4856 },
    { gross: 5500, route: "simplified", irrf: 190.47, net: 4738.0156 },
    { gross: 6000, route: "legal", irrf: 385.1, net: 4973.3856 },
    { gross: 8000, route: "legal", irrf: 1037.85, net: 6040.6356 },
  ])("matches the hand computation at R$ $gross", ({ gross, route, irrf, net }) => {
    const [row] = buildNetSalaryTable([gross]);

    expect(row.deductionApplied).toBe(route);
    expect(row.estimatedIrpfWithheld).toBeCloseTo(irrf, 2);
    expect(row.monthlyNetSalary).toBeCloseTo(net, 4);
    expect(row.netShare).toBeCloseTo(net / gross, 6);
  });
});

describe("simplifiedRouteCeiling", () => {
  /** INSS reaches R$ 607,20 at 5.700 + (607,20 − 599,5144) / 0,14 = R$ 5.754,90. */
  it("finds the gross where INSS alone reaches R$ 607,20", () => {
    expect(simplifiedRouteCeiling(0)).toBeCloseTo(5754.9, 1);
    expect(netSalary({ monthlyGrossSalary: simplifiedRouteCeiling(0) - 1 }).deductionApplied).toBe(
      "simplified",
    );
    expect(netSalary({ monthlyGrossSalary: simplifiedRouteCeiling(0) + 1 }).deductionApplied).toBe(
      "legal",
    );
  });

  /**
   * What the page says in prose: with a dependant, the simplified route only wins
   * below R$ 4.400 or so, where the 2026 reduction already zeroes the tax, so it
   * never changes what is withheld.
   */
  it("moves below the exempt range once there is a dependant", () => {
    expect(simplifiedRouteCeiling(1)).toBeLessThan(5000);

    for (let monthlyGrossSalary = 0; monthlyGrossSalary <= 9000; monthlyGrossSalary += 5) {
      const legalOnly = withholdingOnRoute(
        monthlyGrossSalary,
        officialInss(monthlyGrossSalary) + 189.59,
      );
      expect(
        netSalary({ monthlyGrossSalary, dependants: 1 }).estimatedIrpfWithheld,
        `gross R$ ${monthlyGrossSalary}`,
      ).toBeCloseTo(legalOnly, 2);
    }
  });

  it("is zero when the dependants alone exceed the discount", () => {
    expect(simplifiedRouteCeiling(4)).toBe(0);
  });
});
