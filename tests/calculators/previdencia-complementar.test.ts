import { describe, expect, it } from "vitest";
import {
  buildPgblSavingTable,
  calculateSupplementaryPension,
  type SupplementaryPensionInput,
  type SupplementaryPensionResult,
} from "../../src/lib/calculators/previdenciaComplementar";

/**
 * ⚠️ in this file means one thing and one thing only: the test underneath it
 * PINS current behaviour instead of endorsing it. Everything else — including
 * real limitations of the model — is written as a plain "Caveat:" note, so that
 * scanning for ⚠️ returns the pinned cases and nothing else.
 */

const BASELINE: SupplementaryPensionInput = {
  monthlyPgblContribution: 1_000,
  annualReturnRate: 8,
  yearsToRetirement: 10,
  grossAnnualIncome: 120_000,
};

function project(overrides: Partial<SupplementaryPensionInput> = {}): SupplementaryPensionResult {
  return calculateSupplementaryPension({ ...BASELINE, ...overrides });
}

/**
 * The closed form for an ordinary annuity: `years` deposits of
 * `annualContribution`, each made at the end of its year, compounded at
 * `annualRatePercent`.
 *
 *     FV = C · ((1 + r)^n − 1) / r
 *
 * Written from the textbook formula, not from the module's loop, so that the
 * two can disagree. The end-of-year convention is the module's own — see
 * "treats a year of contributions as one deposit at year end" below.
 */
function annuityFutureValue(
  annualContribution: number,
  annualRatePercent: number,
  years: number,
): number {
  const rate = annualRatePercent / 100;

  if (rate === 0) {
    return annualContribution * years;
  }

  return annualContribution * (((1 + rate) ** years - 1) / rate);
}

describe("calculateSupplementaryPension — the compounding base case", () => {
  it("has nothing saved and nothing earned when there are no years left", () => {
    const result = project({ yearsToRetirement: 0 });

    expect(result.balanceAtHorizon).toBe(0);
    expect(result.totalEarnings).toBe(0);
    expect(result.projection).toHaveLength(0);
    expect(Number.isNaN(result.totalEarnings)).toBe(false);
  });

  /**
   * The module treats a year of contributions as one deposit at year end, so
   * the first year earns nothing at all and the balance is exactly twelve
   * monthly contributions. Anyone changing this to monthly compounding will
   * fail here first — that would be a deliberate change, and this is where it
   * gets argued.
   *
   * Caveat: the convention understates a real PGBL, where each month's
   * contribution starts earning on arrival.
   */
  it("treats a year of contributions as one deposit at year end", () => {
    const result = project({ yearsToRetirement: 1 });

    expect(result.balanceAtHorizon).toBeCloseTo(12_000, 6);
    expect(result.totalEarnings).toBeCloseTo(0, 6);
    expect(result.projection[0]).toMatchObject({ year: 1, earnings: 0 });
  });

  it("returns exactly the contributions when nothing is earned on them", () => {
    const result = project({ annualReturnRate: 0, yearsToRetirement: 25 });

    expect(result.totalEarnings).toBe(0);
    expect(result.balanceAtHorizon).toBe(300_000);
  });
});

describe("calculateSupplementaryPension — the balance at the visitor's horizon", () => {
  /**
   * The field the page headlines. It is the balance after exactly the number of
   * years the visitor asked for — never the nearest of the 10/20/30 marks,
   * which is what the route used to print under the label "em {yearsToRetirement} anos".
   */
  it.each([
    [5, 70_399.21],
    [15, 325_825.37],
    [35, 2_067_801.64],
  ])(
    "reports the balance at %i years, not the nearest fixed mark",
    (yearsToRetirement, expected) => {
      const result = project({ yearsToRetirement });

      expect(result.balanceAtHorizon).toBeCloseTo(expected, 2);
      expect(result.balanceAtHorizon).toBeCloseTo(
        annuityFutureValue(12_000, 8, yearsToRetirement),
        2,
      );
      expect(result.balanceAtHorizon).not.toBeCloseTo(result.balanceAt10Years, 2);
      expect(result.balanceAtHorizon).not.toBeCloseTo(result.balanceAt20Years, 2);
      expect(result.balanceAtHorizon).not.toBeCloseTo(result.balanceAt30Years, 2);
    },
  );

  it.each([1, 10, 20, 30])(
    "coincides with the mark when the horizon lands on one: %i years",
    (yearsToRetirement) => {
      const result = project({ yearsToRetirement });

      expect(result.balanceAtHorizon).toBeCloseTo(
        annuityFutureValue(12_000, 8, yearsToRetirement),
        2,
      );
    },
  );

  it.each([
    [8, 10],
    [8, 35],
    [4.5, 15],
    [12, 20],
    [0.5, 30],
  ])(
    "matches the ordinary-annuity closed form at %i%% over %i years",
    (annualReturnRate, yearsToRetirement) => {
      const result = project({ annualReturnRate, yearsToRetirement });

      expect(result.balanceAtHorizon).toBeCloseTo(
        annuityFutureValue(12_000, annualReturnRate, yearsToRetirement),
        2,
      );
    },
  );

  it.each([1, 5, 12, 25, 40])(
    "keeps totalEarnings as the horizon balance less the contributions: %i years",
    (yearsToRetirement) => {
      const result = project({ yearsToRetirement });

      expect(result.totalEarnings).toBeCloseTo(
        result.balanceAtHorizon - result.annualPgblContribution * yearsToRetirement,
        6,
      );
    },
  );

  it("pins the worked example: R$ 1.000/month at 8% for 10 years", () => {
    // 12.000 × ((1,08^10 − 1) / 0,08) = 173.838,75
    expect(project().balanceAtHorizon).toBeCloseTo(173_838.75, 2);
    expect(project().totalEarnings).toBeCloseTo(173_838.75 - 120_000, 2);
  });

  it("scales in proportion to the contribution", () => {
    const single = project({ monthlyPgblContribution: 1_000, yearsToRetirement: 20 });
    const triple = project({ monthlyPgblContribution: 3_000, yearsToRetirement: 20 });

    expect(triple.balanceAtHorizon).toBeCloseTo(single.balanceAtHorizon * 3, 6);
    expect(triple.totalEarnings).toBeCloseTo(single.totalEarnings * 3, 6);
  });

  it("grows with the return rate and with the horizon", () => {
    let previousByRate = -Infinity;
    for (let annualReturnRate = 0; annualReturnRate <= 20; annualReturnRate += 0.5) {
      const balance = project({ annualReturnRate }).balanceAtHorizon;
      expect(balance).toBeGreaterThanOrEqual(previousByRate);
      previousByRate = balance;
    }

    let previousByYears = -Infinity;
    for (let yearsToRetirement = 1; yearsToRetirement <= 40; yearsToRetirement += 1) {
      const balance = project({ yearsToRetirement }).balanceAtHorizon;
      expect(balance).toBeGreaterThan(previousByYears);
      previousByYears = balance;
    }
  });

  it("never reports a gain where the money only sat still", () => {
    for (let annualReturnRate = 0; annualReturnRate <= 20; annualReturnRate += 0.5) {
      const result = project({ annualReturnRate, yearsToRetirement: 30 });

      expect(result.totalEarnings).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(result.totalEarnings)).toBe(true);
    }
  });

  /**
   * `balanceAt10Years`, `balanceAt20Years` and `balanceAt30Years` are
   * fixed reference points — the balance at that many years, whatever horizon
   * the visitor chose — and the breakdown table prints all three side by side.
   * They are comparison marks, not the answer, which is why the headline reads
   * `balanceAtHorizon` instead.
   */
  it.each([1, 5, 15, 35])(
    "reports 10, 20 and 30 years as fixed marks, independent of a %i-year horizon",
    (yearsToRetirement) => {
      const result = project({ yearsToRetirement });

      expect(result.balanceAt10Years).toBeCloseTo(annuityFutureValue(12_000, 8, 10), 2);
      expect(result.balanceAt20Years).toBeCloseTo(annuityFutureValue(12_000, 8, 20), 2);
      expect(result.balanceAt30Years).toBeCloseTo(annuityFutureValue(12_000, 8, 30), 2);
    },
  );
});

describe("calculateSupplementaryPension — the year-by-year projection", () => {
  /**
   * ⚠️ Pinned sampling, not a contract.
   *
   * `projection` is dead output: `grep -rn projection src/` finds the module and
   * nothing else, so no component renders the series and it declares no
   * sampling contract of its own. What it actually keeps is year 1, year 5 and
   * every multiple of ten the horizon reaches — which means the visitor's own
   * final year is absent whenever it is not one of those. Whether that is the
   * right sampling is undecidable while nobody consumes it; pinned so that
   * whoever gives it a consumer has to choose the sampling on purpose, here.
   */
  it.each([
    [2, [1]],
    [15, [1, 5, 10]],
    [35, [1, 5, 10, 20, 30]],
  ])("samples years 1, 5 and each decade — a %i-year horizon gives %j", (years, expected) => {
    const { projection } = project({ yearsToRetirement: years });

    expect(projection.map((point) => point.year)).toEqual(expected);
  });

  it.each([1, 5, 12, 30, 40])(
    "never samples a year beyond a %i-year horizon, and always moves forward",
    (yearsToRetirement) => {
      const { projection } = project({ yearsToRetirement });

      let previousYear = 0;
      for (const point of projection) {
        expect(point.year).toBeGreaterThan(previousYear);
        expect(point.year).toBeLessThanOrEqual(yearsToRetirement);
        previousYear = point.year;
      }
    },
  );

  it("agrees with the closed form at every year it does sample", () => {
    const { projection } = project({ yearsToRetirement: 40, annualReturnRate: 6 });

    expect(projection.length).toBeGreaterThan(0);

    for (const point of projection) {
      expect(point.balance).toBeCloseTo(annuityFutureValue(12_000, 6, point.year), 2);
      expect(point.earnings).toBeCloseTo(annuityFutureValue(12_000, 6, point.year - 1) * 0.06, 2);
    }
  });
});

describe("calculateSupplementaryPension — the IRPF deduction, from the visitor's income", () => {
  /** Up to R$ 60.000 the 2026 reduction already zeroes the tax: there is nothing to defer. */
  it("saves nothing where the tax is already zero", () => {
    const result = project({ grossAnnualIncome: 60_000 });

    expect(result.taxWithoutPgbl).toBe(0);
    expect(result.annualIrpfSaving).toBe(0);
  });

  /**
   * By hand, R$ 120.000 with R$ 12.000 of PGBL: without it, the simplified return
   * wins (R$ 17.640 against R$ 11.857,10 of INSS) and owes 102.360 × 27,5% −
   * 10.904,66 = 17.244,34. With it, the complete return deducts 11.857,10 +
   * 12.000 and owes 96.142,90 × 27,5% − 10.904,66 = 15.534,64. The saving is
   * R$ 1.709,70 — the PGBL only pays where it takes the deductions past the
   * simplified discount, so it is NOT 12.000 × 27,5% = R$ 3.300.
   */
  it("saves the difference between the better returns, not contribution × rate", () => {
    const result = project({ grossAnnualIncome: 120_000, monthlyPgblContribution: 1_000 });

    expect(result.taxWithoutPgbl).toBeCloseTo(17244.34, 2);
    expect(result.taxWithPgbl).toBeCloseTo(15534.64, 2);
    expect(result.regimeWithPgbl).toBe("legal");
    expect(result.annualIrpfSaving).toBeCloseTo(1709.7, 2);
    expect(result.monthlyIrpfSaving).toBeCloseTo(result.annualIrpfSaving / 12, 10);
  });

  it("deducts at most 12% of income", () => {
    const result = project({ grossAnnualIncome: 100_000, monthlyPgblContribution: 2_000 });

    expect(result.deductibleAnnualContribution).toBeCloseTo(12_000, 6);
  });

  it.each([30_000, 90_000, 150_000, 400_000])(
    "never saves more than 27,5%% of the deductible part at %i",
    (grossAnnualIncome) => {
      const result = project({ grossAnnualIncome, monthlyPgblContribution: 3_000 });

      expect(result.annualIrpfSaving).toBeGreaterThanOrEqual(0);
      expect(result.annualIrpfSaving).toBeLessThanOrEqual(
        result.deductibleAnnualContribution * 0.275 + 1e-6,
      );
    },
  );

  it("leaves the projected balance untouched — the deduction is a separate pot", () => {
    const low = project({ grossAnnualIncome: 40_000 });
    const high = project({ grossAnnualIncome: 300_000 });

    expect(high.balanceAtHorizon).toBe(low.balanceAtHorizon);
  });
});

describe("buildPgblSavingTable — a PGBL at the full 12%", () => {
  it("is the form's own saving on every row", () => {
    for (const row of buildPgblSavingTable([90_000, 120_000, 240_000])) {
      const form = project({
        grossAnnualIncome: row.grossAnnualIncome,
        monthlyPgblContribution: row.annualContribution / 12,
      });
      expect(row.saving).toBeCloseTo(form.annualIrpfSaving, 6);
    }
  });

  /** Far above the simplified cap, the whole 12% sits in the top bracket: 27,5% of it. */
  it("returns 27,5% of the contribution at a high income", () => {
    const [row] = buildPgblSavingTable([400_000]);

    expect(row.savingShare).toBeGreaterThan(0.2);
    expect(row.savingShare).toBeLessThanOrEqual(0.275 + 1e-9);
  });
});

describe("calculateSupplementaryPension — degenerate input", () => {
  it("echoes the contribution back, monthly and annualised", () => {
    const result = project({ monthlyPgblContribution: 750 });

    expect(result.monthlyPgblContribution).toBe(750);
    expect(result.annualPgblContribution).toBe(9_000);
  });

  it("saves nothing and earns nothing on a zero contribution", () => {
    const result = project({ monthlyPgblContribution: 0 });

    expect(result.totalEarnings).toBe(0);
    expect(result.monthlyIrpfSaving).toBe(0);
    expect(result.balanceAtHorizon).toBe(0);
  });

  /**
   * ⚠️ Pinned arithmetic, not an endorsement.
   *
   * `totalEarnings` is the balance less the contributions, and neither term
   * is floored. A negative horizon runs no years, so the balance is zero while
   * the contributions term goes negative — and the subtraction reports a
   * R$ 60.000 return on money never deposited. No visitor reaches it: the
   * route's "Anos até aposentadoria" field is `min={1}`. Pinned rather than
   * failed, for the same reason the unreachable ≥100% rate is pinned in
   * tests/calculators/beneficios-fiscais.test.ts — an unreachable input is not
   * a defect until something can reach it.
   */
  it("manufactures a return out of a negative horizon", () => {
    const result = project({ yearsToRetirement: -5 });

    expect(result.balanceAtHorizon).toBe(0);
    expect(result.projection).toHaveLength(0);
    expect(result.totalEarnings).toBe(60_000);
  });

  it("reports a loss, not a gain, when the rate is negative", () => {
    const result = project({ annualReturnRate: -20, yearsToRetirement: 10 });

    expect(result.totalEarnings).toBeLessThan(0);
    expect(result.balanceAtHorizon).toBeCloseTo(annuityFutureValue(12_000, -20, 10), 2);
  });
});
