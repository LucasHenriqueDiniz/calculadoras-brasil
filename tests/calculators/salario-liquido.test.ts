import { describe, expect, it } from "vitest";
import { calculateNetSalary, type NetSalaryInput } from "../../src/lib/calculators/salarioLiquido";
import { IRPF_MONTHLY_TABLE_2026 } from "../../src/lib/calculators/irpf-constants";
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
  educationDeduction: 0,
  healthDeduction: 0,
  supplementaryPensionDeduction: 0,
  hasMealAllowance: false,
  hasTransportAllowance: false,
  hasUnionDue: false,
  simplifiedRegime: false,
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

describe("calculateNetSalary — the ordinary case", () => {
  /**
   * One salary, the whole breakdown. Every figure below was produced by running
   * the module, but each is reachable by hand from the published 2026 tables,
   * which is what makes it an assertion rather than a snapshot.
   */
  const result = netSalary({
    monthlyGrossSalary: 6000,
    dependants: 1,
    educationDeduction: 3000,
    healthDeduction: 1200,
    supplementaryPensionDeduction: 2400,
  });

  it("withholds the progressive INSS contribution", () => {
    expect(result.inssWithheld).toBeCloseTo(641.51, 2);
    expect(result.monthlyBaseAfterInss).toBeCloseTo(5358.49, 2);
  });

  it("sums the annual itemised deductions and the dependant allowance", () => {
    expect(result.totalDeductions).toBeCloseTo(3000 + 1200 + 2400, 2);
    expect(result.dependantAllowance).toBeCloseTo(2275.08, 2);
    expect(result.annualAssessableBase).toBeCloseTo(55426.75, 2);
  });

  it("taxes the monthly share of that base, then applies the reduction", () => {
    expect(result.monthlyAssessableBase).toBeCloseTo(4618.9, 2);
    expect(result.taxFromTable).toBeCloseTo(363.76, 2);
    expect(result.reductionLei15270).toBeCloseTo(179.75, 2);
    expect(result.estimatedIrpfWithheld).toBeCloseTo(184.01, 2);
  });

  it("arrives at the net salary and the effective rate", () => {
    // 6.000,00 gross, less 641,5144 of INSS and 184,01 of IRPF.
    expect(result.monthlyNetSalary).toBeCloseTo(5174.4756, 4);
    expect(result.annualNetSalary).toBeCloseTo(5174.4756 * 12, 4);
    expect(result.effectiveIrpfRate).toBeCloseTo(3.0668, 4);
  });

  it("reports the monthly share of what the deductions took off the base", () => {
    expect(result.savings.fromDependants).toBeCloseTo(189.59, 2);
    expect(result.savings.fromDeductions).toBeCloseTo(550, 2);
    expect(result.savings.total).toBeCloseTo(739.59, 2);
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
  it.each([false, true])(
    "leaves the net salary rising with the gross (simplifiedRegime=%s)",
    (simplifiedRegime) => {
      let previousNet = -Infinity;
      let previousTax = -Infinity;

      for (let monthlyGrossSalary = 0; monthlyGrossSalary <= 12_000; monthlyGrossSalary += 0.25) {
        const result = netSalary({ monthlyGrossSalary, simplifiedRegime });

        expect(result.estimatedIrpfWithheld).toBeGreaterThanOrEqual(previousTax);
        expect(result.monthlyNetSalary).toBeGreaterThanOrEqual(previousNet);
        previousTax = result.estimatedIrpfWithheld;
        previousNet = result.monthlyNetSalary;
      }
    },
  );
});

describe("calculateNetSalary — the Lei 15.270/2025 reduction", () => {
  /**
   * The worked example in
   * docs/research/2026-09-04-irpf-2026-table/research.md, Findings §4: a gross of
   * R$ 5.000,00 less the R$ 607,20 simplified ceiling gives a base of
   * R$ 4.392,80, which the table taxes at R$ 312,89 — exactly the reduction the
   * statute grants in its first band, so the withholding is zero by construction.
   */
  it("reproduces the statute's own first-band figure at R$ 5.000", () => {
    const result = netSalary({ monthlyGrossSalary: 5000, simplifiedRegime: true });

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

describe("calculateNetSalary — dependants and itemised deductions", () => {
  it("deducts the 2026 annual allowance per dependant, uncapped in count", () => {
    expect(netSalary({ monthlyGrossSalary: 8000, dependants: 0 }).dependantAllowance).toBe(0);
    expect(netSalary({ monthlyGrossSalary: 8000, dependants: 1 }).dependantAllowance).toBeCloseTo(
      2275.08,
      2,
    );
    expect(netSalary({ monthlyGrossSalary: 8000, dependants: 3 }).dependantAllowance).toBeCloseTo(
      6825.24,
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

  it("caps education at the documented annual limit", () => {
    expect(netSalary({ monthlyGrossSalary: 8000, educationDeduction: 1000 }).totalDeductions).toBe(
      1000,
    );
    expect(
      netSalary({ monthlyGrossSalary: 8000, educationDeduction: 99_999 }).totalDeductions,
    ).toBe(3561.5);
  });

  /**
   * No official ceiling on health expenses was found in any source read for
   * docs/research/2026-09-04-irpf-2026-table/research.md, so this module does not
   * invent one.
   */
  it("does not cap health expenses", () => {
    expect(netSalary({ monthlyGrossSalary: 8000, healthDeduction: 40_000 }).totalDeductions).toBe(
      40_000,
    );
  });

  it("floors every deduction at zero rather than letting one raise the tax", () => {
    const result = netSalary({
      monthlyGrossSalary: 8000,
      educationDeduction: -1000,
      healthDeduction: -1000,
      supplementaryPensionDeduction: -1000,
      dependants: -2,
    });

    expect(result.totalDeductions).toBe(0);
    expect(result.dependantAllowance).toBe(0);
    expect(result.estimatedIrpfWithheld).toBeCloseTo(
      netSalary({ monthlyGrossSalary: 8000 }).estimatedIrpfWithheld,
      6,
    );
  });

  it("never drives the calculation base below zero", () => {
    const result = netSalary({
      monthlyGrossSalary: 3000,
      supplementaryPensionDeduction: 999_999,
    });

    expect(result.annualAssessableBase).toBe(0);
    expect(result.monthlyAssessableBase).toBe(0);
    expect(result.estimatedIrpfWithheld).toBe(0);
  });
});

describe("calculateNetSalary — the two regimes", () => {
  it("discounts exactly 20% of the gross where the monthly ceiling does not bind", () => {
    // 20% of R$ 3.000 is R$ 600, just under the R$ 607,20 monthly ceiling.
    const result = netSalary({ monthlyGrossSalary: 3000, simplifiedRegime: true });

    expect(3000 - result.monthlyAssessableBase).toBeCloseTo(600, 2);
  });

  /**
   * A provenance hole, pinned so it cannot become an answer hole.
   *
   * The module reads the monthly desconto simplificado as
   * `min(20% × bruto, R$ 607,20)`, but only the R$ 607,20 is sourced: the
   * Receita's monthly table states a "limite" and no percentage at all
   * (fetches/receita-federal-tabelas-2026.md). The 20% is the ANNUAL rate,
   * carried across.
   *
   * It costs nothing today, and provably rather than by luck: `607,20 / 0,20` is
   * R$ 3.036,00 and 80% of R$ 3.036,00 is R$ 2.428,80 — the exempt ceiling
   * itself. Below that gross both readings leave the base inside the exemption;
   * above it both subtract the same R$ 607,20. So the two readings cannot
   * withhold different amounts, and this sweep measures that rather than trusting
   * it. If an edit moves the rate or the ceiling apart, the inference stops being
   * free and this fails.
   *
   * (They do differ in `monthlyAssessableBase` below R$ 3.036 — R$ 800,00 against
   * R$ 392,80 at a gross of R$ 1.000 — which is why the pin is on the tax.)
   */
  it("withholds what a flat R$ 607,20 reading of the ceiling would", () => {
    for (let monthlyGrossSalary = 0; monthlyGrossSalary <= 8000; monthlyGrossSalary += 6.25) {
      const result = netSalary({ monthlyGrossSalary, simplifiedRegime: true });
      const flatCeilingReading = officialTableTax(Math.max(monthlyGrossSalary - 607.2, 0));

      expect(result.taxFromTable, `gross R$ ${monthlyGrossSalary}`).toBe(flatCeilingReading);
    }
  });

  it("caps the simplified discount instead of scaling it without limit", () => {
    const modest = netSalary({ monthlyGrossSalary: 8000, simplifiedRegime: true });
    const large = netSalary({ monthlyGrossSalary: 40_000, simplifiedRegime: true });

    expect(8000 - modest.monthlyAssessableBase).toBeCloseTo(607.2, 2);
    expect(40_000 - large.monthlyAssessableBase).toBeCloseTo(607.2, 2);
  });

  /**
   * The desconto simplificado replaces every deduction the legislation allows,
   * dependants included. Subtracting both takes one of them twice.
   * See docs/research/2026-09-04-irpf-2026-table/research.md, Findings §5.
   */
  it("ignores dependants and itemised deductions under the simplified regime", () => {
    const bare = netSalary({ monthlyGrossSalary: 15_000, simplifiedRegime: true });
    const loaded = netSalary({
      monthlyGrossSalary: 15_000,
      simplifiedRegime: true,
      dependants: 3,
      educationDeduction: 3000,
      healthDeduction: 10_000,
      supplementaryPensionDeduction: 20_000,
    });

    expect(loaded.estimatedIrpfWithheld).toBe(bare.estimatedIrpfWithheld);
    // Still reported, so the page can explain what the regime gave up.
    expect(loaded.dependantAllowance).toBeCloseTo(6825.24, 2);
    expect(loaded.totalDeductions).toBeCloseTo(33_000, 2);
    // …but claiming a saving from deductions that changed nothing would be a lie.
    expect(loaded.savings.total).toBe(0);
  });

  it("computes a finite withholding under either regime", () => {
    for (const monthlyGrossSalary of [0, 1621, 5000, 15_000, 50_000]) {
      for (const simplifiedRegime of [false, true]) {
        const result = netSalary({ monthlyGrossSalary, simplifiedRegime });

        expect(Number.isFinite(result.estimatedIrpfWithheld)).toBe(true);
        expect(result.estimatedIrpfWithheld).toBeGreaterThanOrEqual(0);
      }
    }
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
   * The two modules implement the same 2026 table and the same deduction chain on
   * the same inputs. This is the case that catches those two copies drifting
   * apart — it asserts one module's output against the other's, never against a
   * hard-coded pair.
   *
   * ⚠️ It says nothing about the two Lei 15.270/2025 reductions, and the name is
   * narrowed to admit it. R$ 100.000 a year is R$ 8.333,33 a month, past the
   * monthly phase-out at R$ 7.350 and the annual one at R$ 88.200, so both
   * reductions are zero here — asserted below rather than assumed. They could not
   * be compared in any case: they are different statutory bands, and
   * `312,89 × 12 = 3.754,68` is not the annual R$ 2.694,15.
   *
   * ⚠️ Health stays under R$ 2.666,67 on purpose. `irpf.ts` caps health at that
   * figure, which its own comment records as invented (no official ceiling was
   * found); this module does not. Above it the two disagree by construction, and
   * that disagreement is a product decision, not something a test should settle.
   */
  const shared = {
    dependants: 2,
    educationDeduction: 4000,
    healthDeduction: 2000,
    supplementaryPensionDeduction: 1000,
  };
  const grossAnnualIncome = 100_000;

  const monthly = netSalary({ ...shared, monthlyGrossSalary: grossAnnualIncome / 12 });
  const annual = calculateIrpf({ ...shared, grossAnnualIncome, simplifiedRegime: false });

  it("caps education and totals the deductions identically", () => {
    expect(monthly.totalDeductions).toBeCloseTo(annual.totalDeductions, 6);
  });

  it("allows the same dependant amount", () => {
    expect(monthly.dependantAllowance).toBeCloseTo(annual.dependantAllowance, 6);
  });

  it("withholds the same INSS over a year", () => {
    expect(monthly.inssWithheld * 12).toBeCloseTo(annual.inssWithheld, 6);
  });

  it("reaches the same annual assessable base", () => {
    expect(monthly.annualAssessableBase).toBeCloseTo(annual.assessableBase, 6);
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
   * centavos of the annual assessment rather than exactly on it — measured here
   * at R$ 0,16.
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

    expect(result.savings).toEqual({ fromDependants: 0, fromDeductions: 0, total: 0 });
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
