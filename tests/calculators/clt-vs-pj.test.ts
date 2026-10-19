import { describe, expect, it } from "vitest";
import {
  buildBreakEvenTable,
  calculateCltVsPj,
  type CltVsPjInput,
  type CltVsPjResult,
} from "../../src/lib/calculators/cltVsPj";
import { INSS_CEILING, calculateEmployeeInss } from "../../src/lib/calculators/inss-constants";
import { calculateNetSalary } from "../../src/lib/calculators/salarioLiquido";

const BASELINE: CltVsPjInput = {
  cltGrossSalary: 8_000,
  monthlyPjOffer: 12_000,
  dependants: 0,
  pjMonthlyCosts: 0,
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
 * The CLT side reaches the monthly table through `monthlyIncomeTax`, the same
 * function the pró-labore uses; the PJ side is checked against an oracle of its
 * own further down, because its table input is a pró-labore, not the invoice. `grossForBase` maps an
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
   * R$ 4.000 a month. INSS takes R$ 368,60, less than the R$ 607,20 desconto
   * simplificado, so Lei 9.250, art. 4º, § 2º takes the simplified route: the base
   * is 4.000 − 607,20 = R$ 3.392,80, and the 15% row charges
   * 3.392,80 × 0,15 − 394,16 = R$ 114,76. The Lei 15.270/2025 reduction covers up
   * to R$ 312,89 at this income, so the withholding is nil and the net is the
   * gross less INSS. (The legal route would have taxed R$ 150,55 from the table,
   * also reduced to nil, which is why this case alone could not catch the
   * missing route.)
   */
  it("leaves a R$ 4.000 salary untaxed, which is what Lei 15.270/2025 is for", () => {
    const { cltDetail, cltNet } = compare({ cltGrossSalary: 4_000 });

    expect(cltDetail.assessableBase).toBeCloseTo(3392.8, 2);
    expect(cltDetail.taxFromTable).toBe(114.76);
    expect(cltDetail.reductionLei15270).toBe(114.76);
    expect(cltDetail.irpfWithheld).toBe(0);
    expect(cltNet).toBe(3631.4);
  });

  /**
   * R$ 5.000 a month, no dependants: the case that could. On the legal route the
   * base is 5.000 − 501,51 = R$ 4.498,49 and the table charges R$ 336,67, which the
   * R$ 312,89 reduction leaves at R$ 23,78. On the simplified route the base is
   * R$ 4.392,80, the table charges exactly R$ 312,89 and nothing is withheld. The
   * statute picks the second; the copy of the CLT rules this module used to carry
   * picked the first.
   */
  it("withholds nothing at R$ 5.000, taking the more beneficial route", () => {
    const { cltDetail, cltNet } = compare({ cltGrossSalary: 5_000 });

    expect(cltDetail.assessableBase).toBeCloseTo(4392.8, 2);
    expect(cltDetail.irpfWithheld).toBe(0);
    expect(cltNet).toBe(4498.49);
  });

  it("nets exactly what the net-salary calculator nets, at every CLT salary", () => {
    for (let cltGrossSalary = 0; cltGrossSalary <= 12_000; cltGrossSalary += 7) {
      for (const dependants of [0, 2]) {
        const net = calculateNetSalary({
          monthlyGrossSalary: cltGrossSalary,
          dependants,
          monthlyPrivatePension: 0,
          hasMealAllowance: false,
          hasTransportAllowance: false,
          hasUnionDue: false,
        });

        expect(compare({ cltGrossSalary, dependants }).cltNet, `R$ ${cltGrossSalary}`).toBe(
          Math.round(net.monthlyNetSalary * 100) / 100,
        );
      }
    }
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

  /**
   * The dependants are the worker's, whichever contract pays them, so they lower
   * the withholding on the pró-labore too — where there is any. At R$ 30.000
   * invoiced the pró-labore is R$ 8.400 and does pay tax.
   */
  it("lowers the pró-labore withholding as well, where there is one", () => {
    const none = compare({ monthlyPjOffer: 30_000, dependants: 0 });
    const three = compare({ monthlyPjOffer: 30_000, dependants: 3 });

    expect(three.pjDetail.irpfWithheld).toBeLessThan(none.pjDetail.irpfWithheld);
    expect(three.pjNet).toBeGreaterThan(none.pjNet);
  });

  it("treats a negative count as none rather than as a surcharge", () => {
    expect(compare({ dependants: -2 }).cltNet).toBe(compare({ dependants: 0 }).cltNet);
  });
});

/**
 * LC 123/2006, Anexos III and V, transcribed from
 * docs/research/2026-10-18-pj-simples-nacional/fetches/planalto-lc-123-2006-art-18-anexos.md
 * rather than imported, so the oracle below shares no code with the module.
 */
const ANNEX_III = [
  [180_000, 0.06, 0],
  [360_000, 0.112, 9_360],
  [720_000, 0.135, 17_640],
  [1_800_000, 0.16, 35_640],
  [3_600_000, 0.21, 125_640],
  [4_800_000, 0.33, 648_000],
] as const;
const ANNEX_V = [
  [180_000, 0.155, 0],
  [360_000, 0.18, 4_500],
  [720_000, 0.195, 9_900],
  [1_800_000, 0.205, 17_100],
  [3_600_000, 0.23, 62_100],
  [4_800_000, 0.305, 540_000],
] as const;

const cents = (value: number) => Math.round(value * 100) / 100;

/** The published monthly table, then the statute's reduction, on the more beneficial route. */
function oracleMonthlyTax(income: number, legal: number): number {
  const table = [
    [2428.8, 0, 0],
    [2826.65, 0.075, 182.16],
    [3751.05, 0.15, 394.16],
    [4664.68, 0.225, 675.49],
    [Infinity, 0.275, 908.73],
  ] as const;
  const taxOn = (base: number) => {
    const [, rate, deduction] = table.find(([upTo]) => base <= upTo)!;
    return cents(Math.max(base * rate - deduction, 0));
  };
  const reduce = (tax: number) => {
    if (income <= 5000) return Math.min(312.89, tax);
    if (income <= 7350) return Math.min(Math.max(978.62 - 0.133145 * income, 0), tax);
    return 0;
  };
  const route = (deduction: number) => {
    const tax = taxOn(Math.max(income - deduction, 0));
    return cents(Math.max(tax - cents(reduce(tax)), 0));
  };
  return Math.min(route(legal), route(Math.min(607.2, income)));
}

/** The PJ net of one pró-labore, from the statutes alone. */
function oraclePjNet(invoice: number, proLabore: number, costs: number, dependants: number) {
  const rbt12 = invoice * 12;
  // "igual ou superior a 28%", decided in whole centavos as the statute's threshold is exact.
  const bands =
    Math.round(proLabore * 100) * 100 >= 28 * Math.round(invoice * 100) ? ANNEX_III : ANNEX_V;
  const [, rate, deduction] = bands.find(([upTo]) => rbt12 <= upTo) ?? bands[bands.length - 1];
  const das = cents(invoice * ((rbt12 * rate - deduction) / rbt12));
  const inss = cents(0.11 * Math.min(proLabore, 8475.55));
  const irpf = oracleMonthlyTax(proLabore, inss + dependants * 189.59);
  const distribution = cents(invoice - das - proLabore - costs);
  const dividendTax = distribution > 50_000 ? cents(distribution * 0.1) : 0;
  return cents(invoice - das - costs - inss - irpf - dividendTax);
}

describe("calculateCltVsPj — the PJ side, a Simples Nacional company (D6)", () => {
  /**
   * R$ 10.000 invoiced. RBT12 is R$ 120.000, the first band of Anexo III: DAS 6%,
   * R$ 600. Pró-labore 28%, R$ 2.800, which meets the Fator R. INSS 11%, R$ 308.
   * The simplified R$ 607,20 beats the R$ 308 of legal deductions, leaving a base
   * of R$ 2.192,80, inside the exemption. Distributed: 10.000 − 600 − 2.800 =
   * R$ 6.600. Net 10.000 − 600 − 308 = R$ 9.092.
   */
  it("nets R$ 9.092 out of a R$ 10.000 invoice", () => {
    const { pjDetail, pjNet } = compare({ monthlyPjOffer: 10_000 });

    expect(pjDetail.annex).toBe("III");
    expect(pjDetail.strategy).toBe("fatorR");
    expect(pjDetail.dasEffectiveRate).toBeCloseTo(0.06, 10);
    expect(pjDetail.das).toBe(600);
    expect(pjDetail.proLabore).toBe(2800);
    expect(pjDetail.inssWithheld).toBe(308);
    expect(pjDetail.irpfWithheld).toBe(0);
    expect(pjDetail.distribution).toBe(6600);
    expect(pjNet).toBe(9092);
  });

  /**
   * R$ 20.000 invoiced, RBT12 R$ 240.000, second band: (240.000 × 11,2% −
   * 9.360) / 240.000 = 7,3%, so R$ 1.460. Pró-labore R$ 5.600, INSS R$ 616, now
   * above R$ 607,20, so the legal route: base 4.984, table 4.984 × 27,5% − 908,73
   * = 461,87, reduction 978,62 − 0,133145 × 5.600 = 233,01, IRPF R$ 228,86.
   */
  it("prices the second band at its effective rate, and taxes the pró-labore", () => {
    const { pjDetail, pjNet } = compare({ monthlyPjOffer: 20_000 });

    expect(pjDetail.dasEffectiveRate).toBeCloseTo(0.073, 10);
    expect(pjDetail.das).toBe(1460);
    expect(pjDetail.inssWithheld).toBe(616);
    expect(pjDetail.taxFromTable).toBe(461.87);
    expect(pjDetail.reductionLei15270).toBe(233.01);
    expect(pjDetail.irpfWithheld).toBe(228.86);
    expect(pjNet).toBe(17695.14);
  });

  /**
   * The model's whole claim, against an oracle built from the statutes with no
   * code from the module: the net is the better of the two pró-labore strategies,
   * at every invoice, cost and dependant count swept.
   */
  it("nets the better of the two pró-labore strategies, everywhere", () => {
    for (let monthlyPjOffer = 250; monthlyPjOffer <= 120_000; monthlyPjOffer += 250) {
      for (const pjMonthlyCosts of [0, 300]) {
        for (const dependants of [0, 2]) {
          // 28% of the invoice, rounded up to the centavo so that it meets the
          // threshold, computed in whole centavos as the statute's threshold is exact.
          const fatorR = Math.min(
            monthlyPjOffer,
            Math.max(1621, Math.ceil((Math.round(monthlyPjOffer * 100) * 28) / 100) / 100),
          );
          const minimumWage = Math.min(monthlyPjOffer, 1621);
          const strategies = [
            oraclePjNet(monthlyPjOffer, fatorR, pjMonthlyCosts, dependants),
            oraclePjNet(monthlyPjOffer, minimumWage, pjMonthlyCosts, dependants),
          ];
          // And the pró-labore that leaves exactly R$ 50.000 to distribute, per annex.
          for (const [bands, isIII] of [
            [ANNEX_III, true],
            [ANNEX_V, false],
          ] as const) {
            const rbt12 = monthlyPjOffer * 12;
            const [, rate, deduction] =
              bands.find(([upTo]) => rbt12 <= upTo) ?? bands[bands.length - 1];
            const das = cents(monthlyPjOffer * ((rbt12 * rate - deduction) / rbt12));
            const proLabore = cents(monthlyPjOffer - das - pjMonthlyCosts - 50_000);
            const meetsFatorR =
              Math.round(proLabore * 100) * 100 >= 28 * Math.round(monthlyPjOffer * 100);
            if (proLabore >= 1621 && meetsFatorR === isIII) {
              strategies.push(oraclePjNet(monthlyPjOffer, proLabore, pjMonthlyCosts, dependants));
            }
          }
          const expected = Math.max(...strategies);

          expect(
            compare({ monthlyPjOffer, pjMonthlyCosts, dependants }).pjNet,
            `R$ ${monthlyPjOffer}, costs ${pjMonthlyCosts}, ${dependants} dependant(s)`,
          ).toBeCloseTo(expected, 2);
        }
      }
    }
  });

  /**
   * Under the Simples Nacional the DAS is charged on revenue, so a cost shelters
   * no tax: it comes off the net real for real, while the distribution stays
   * under the R$ 50.000 threshold.
   */
  it.each([300, 2_000, 5_000])("takes %s of costs off the net, real for real", (pjMonthlyCosts) => {
    const without = compare({ monthlyPjOffer: 15_000, pjMonthlyCosts: 0 }).pjNet;
    const withCosts = compare({ monthlyPjOffer: 15_000, pjMonthlyCosts }).pjNet;

    expect(cents(without - withCosts)).toBe(pjMonthlyCosts);
  });

  /**
   * Lei 9.250, art. 6º-A: past R$ 50.000 of distribution in a month, 10% of the
   * WHOLE distribution is withheld. Pinned as the statute's cliff, not smoothed.
   */
  it("withholds 10% of the whole distribution once it passes R$ 50.000", () => {
    const sweep = [10_000, 50_000, 200_000, 290_000].map((monthlyPjOffer) =>
      compare({ monthlyPjOffer }),
    );
    const over = sweep.filter((r) => r.pjDetail.distribution > 50_000);
    const under = sweep.filter((r) => r.pjDetail.distribution <= 50_000);

    expect(over.length).toBeGreaterThan(0);
    expect(under.length).toBeGreaterThan(0);
    for (const r of over) {
      expect(r.pjDetail.dividendWithholding).toBe(cents(r.pjDetail.distribution * 0.1));
    }
    for (const r of under) {
      expect(r.pjDetail.dividendWithholding).toBe(0);
    }
  });

  /** Past R$ 3,6 milhões a year the sixth band takes ISS out of the DAS, which this model does not charge. */
  it("flags revenue past the R$ 3,6 milhões sublimit instead of passing it off as covered", () => {
    expect(compare({ monthlyPjOffer: 300_000 }).pjDetail.withinModel).toBe(true);
    expect(compare({ monthlyPjOffer: 300_000.01 }).pjDetail.withinModel).toBe(false);
  });

  /**
   * At R$ 90.000 the Fator R pró-labore would distribute more than R$ 50.000 and
   * lose 10% of all of it; raising the pró-labore until exactly R$ 50.000 is left
   * costs less, and the model finds that as an accountant would.
   */
  it("raises the pró-labore to stay at the R$ 50.000 threshold when that pays", () => {
    const { pjDetail } = compare({ monthlyPjOffer: 90_000 });

    expect(pjDetail.strategy).toBe("dividendThreshold");
    expect(pjDetail.distribution).toBe(50_000);
    expect(pjDetail.dividendWithholding).toBe(0);
  });

  it("nets nothing from an empty invoice, rather than a loss", () => {
    expect(compare({ monthlyPjOffer: 0 }).pjNet).toBe(0);
  });

  /** ⚠️ The headline must contain every cost the breakdown reports. */
  it.each([2_000, 10_000, 30_000, 90_000])(
    "nets %s down by every item it lists",
    (monthlyPjOffer) => {
      const { pjDetail, pjNet } = compare({ monthlyPjOffer, pjMonthlyCosts: 300 });

      expect(pjNet).toBeCloseTo(
        monthlyPjOffer -
          pjDetail.das -
          pjDetail.costs -
          pjDetail.inssWithheld -
          pjDetail.irpfWithheld -
          pjDetail.dividendWithholding,
        2,
      );
    },
  );

  /**
   * Through the point where the distribution reaches R$ 50.000 as well: the
   * statute's 10% on the whole distribution is a cliff for any fixed pró-labore,
   * and the `dividendThreshold` strategy is what keeps it out of the net.
   */
  // 149.000 invoices, a real apart: the sweep is the point, so it gets its own
  // budget. It ran 5,0–5,2 s on a loaded machine and failed Vitest's default 5 s.
  it("moves smoothly across the whole range the model covers", { timeout: 30_000 }, () => {
    expect(
      firstNonSmoothPoint((monthlyPjOffer) => compare({ monthlyPjOffer }).pjNet, 1_000, 150_000, 1),
    ).toBeUndefined();
  });

  it("treats negative costs as none", () => {
    expect(compare({ pjMonthlyCosts: -1_000 }).pjNet).toBe(compare({ pjMonthlyCosts: 0 }).pjNet);
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
  it.each([3_000, 5_000, 8_000, 15_000, 25_000])(
    "names an invoice that reaches a %s salary's package, with and without costs",
    (cltGrossSalary) => {
      for (const pjMonthlyCosts of [0, 300]) {
        const result = compare({ cltGrossSalary, pjMonthlyCosts });
        const atThatInvoice = compare({
          cltGrossSalary,
          pjMonthlyCosts,
          monthlyPjOffer: result.breakEvenPjOffer,
        });

        // Reaches, not "equals": the net moves on a centavo grid, so the smallest
        // invoice that reaches the package can pass it by a centavo.
        expect(atThatInvoice.pjNet).toBeGreaterThanOrEqual(result.cltWithBenefits);
        expect(atThatInvoice.pjNet - result.cltWithBenefits).toBeLessThanOrEqual(0.011);
      }
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

  it("does depend on the company's costs, which are part of the question", () => {
    const withoutCosts = compare({ pjMonthlyCosts: 0 }).breakEvenPjOffer;
    const withCosts = compare({ pjMonthlyCosts: 3_000 }).breakEvenPjOffer;

    // Costs shelter no tax under the Simples, so they can only raise the invoice needed.
    expect(withCosts).toBeGreaterThan(withoutCosts);
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
      pjMonthlyCosts: 0,
    }).breakEvenPjOffer;

    const tied = calculateCltVsPj({
      cltGrossSalary: gross,
      monthlyPjOffer: matching,
      dependants: 0,
      pjMonthlyCosts: 0,
    });

    expect(tied.analysis.isTie).toBe(true);
    expect(Math.abs(tied.difference)).toBeLessThan(0.01);
  });

  /** The break-even invoice can pass the package by a centavo; that is still a draw. */
  it.each([3_000, 5_000, 15_000])("calls the break-even a tie for %s, with costs", (gross) => {
    const { breakEvenPjOffer } = compare({ cltGrossSalary: gross, pjMonthlyCosts: 300 });
    const atIt = compare({
      cltGrossSalary: gross,
      pjMonthlyCosts: 300,
      monthlyPjOffer: breakEvenPjOffer,
    });

    expect(atIt.analysis.isTie).toBe(true);
    expect(atIt.analysis.rationale).toMatch(/empatam/);
  });

  it.each([0, 8_000])(
    "says whether a percentage has a base to be taken of, for a CLT salary of %s",
    (cltGrossSalary) => {
      const result = calculateCltVsPj({
        cltGrossSalary,
        monthlyPjOffer: 5_000,
        dependants: 0,
        pjMonthlyCosts: 0,
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

describe("buildBreakEvenTable — the page's break-even table", () => {
  const salaries = [3_000, 5_000, 8_000, 15_000, 30_000];
  const rows = buildBreakEvenTable(salaries, 300);

  it("returns one row per salary, each the form's own break-even", () => {
    expect(rows.map((row) => row.cltGrossSalary)).toEqual(salaries);
    for (const row of rows) {
      const form = calculateCltVsPj({
        cltGrossSalary: row.cltGrossSalary,
        monthlyPjOffer: 0,
        dependants: 0,
        pjMonthlyCosts: 300,
      });
      expect(row.breakEvenPjOffer).toBe(form.breakEvenPjOffer);
      expect(row.cltWithBenefits).toBe(form.cltWithBenefits);
    }
  });

  /**
   * Against the statutes, not the module: at each row's break-even invoice the
   * oracle's PJ net reaches the CLT package, and a centavo less does not. Only
   * the Fator R strategy is in play this low, which the row also reports.
   */
  it("lands each break-even on the CLT package by the statutes' own arithmetic", () => {
    for (const row of rows) {
      const proLabore = (invoice: number) =>
        Math.min(invoice, Math.max(1621, Math.ceil((Math.round(invoice * 100) * 28) / 100) / 100));
      const net = (invoice: number) => oraclePjNet(invoice, proLabore(invoice), 300, 0);

      expect(row.strategy).toBe("fatorR");
      expect(net(row.breakEvenPjOffer)).toBeGreaterThanOrEqual(row.cltWithBenefits - 0.005);
      expect(net(row.breakEvenPjOffer - 0.01)).toBeLessThan(row.cltWithBenefits);
    }
  });

  it("reports the margin over the gross salary as a share", () => {
    for (const row of rows) {
      expect(row.aboveGross).toBeCloseTo(row.breakEvenPjOffer / row.cltGrossSalary - 1, 10);
    }
  });
});
