import { describe, expect, it } from "vitest";
import {
  calculateTaxFreeBenefits,
  type TaxFreeBenefitsInput,
  type TaxFreeBenefitsResult,
} from "../../src/lib/calculators/beneficiosFiscais";

/**
 * Every marginal rate the IRPF table can put a taxpayer on, plus the exempt
 * band. The route caps its own input at 27,5, so this is the whole reachable
 * domain of `estimatedIrpfRate`.
 */
const MARGINAL_RATES = [0, 7.5, 15, 22.5, 27.5];

const BASELINE: TaxFreeBenefitsInput = {
  monthlyMealAllowance: 800,
  monthlyTransportAllowance: 220,
  estimatedIrpfRate: 15,
};

function benefits(overrides: Partial<TaxFreeBenefitsInput> = {}): TaxFreeBenefitsResult {
  return calculateTaxFreeBenefits({ ...BASELINE, ...overrides });
}

describe("calculateTaxFreeBenefits — the benefit total", () => {
  it("returns nothing but zeros when there is no benefit", () => {
    const result = benefits({ monthlyMealAllowance: 0, monthlyTransportAllowance: 0 });

    expect(result.monthlyBenefitTotal).toBe(0);
    expect(result.monthlyIrpfSaving).toBe(0);
    expect(result.annualIrpfSaving).toBe(0);
    expect(result.requiredGrossIncome).toBe(0);
    expect(result.comparison.difference).toBe(0);
    expect(Number.isNaN(result.monthlyIrpfSaving)).toBe(false);
  });

  /**
   * Neither benefit is taxed, so which of the two carries the money cannot
   * change a single figure. Only the total may matter.
   */
  it("cares about the total, not about how it splits between the two benefits", () => {
    const mealHeavy = benefits({ monthlyMealAllowance: 900, monthlyTransportAllowance: 120 });
    const transportHeavy = benefits({ monthlyMealAllowance: 120, monthlyTransportAllowance: 900 });

    expect(transportHeavy.monthlyBenefitTotal).toBe(mealHeavy.monthlyBenefitTotal);
    expect(transportHeavy.monthlyIrpfSaving).toBe(mealHeavy.monthlyIrpfSaving);
    expect(transportHeavy.requiredGrossIncome).toBe(mealHeavy.requiredGrossIncome);
  });

  it("echoes each benefit back untouched", () => {
    const result = benefits({ monthlyMealAllowance: 640, monthlyTransportAllowance: 310 });

    expect(result.monthlyMealAllowance).toBe(640);
    expect(result.monthlyTransportAllowance).toBe(310);
    expect(result.monthlyBenefitTotal).toBe(950);
  });
});

describe("calculateTaxFreeBenefits — the IRPF saving", () => {
  it("saves nothing in the exempt band", () => {
    expect(benefits({ estimatedIrpfRate: 0 }).monthlyIrpfSaving).toBe(0);
  });

  /**
   * Hand-worked from the top marginal rate: R$ 800 + R$ 220 = R$ 1.020 of
   * untaxed benefit, at 27,5%, is R$ 280,50 of IRPF not withheld.
   */
  it("saves the marginal rate on the whole benefit", () => {
    expect(benefits({ estimatedIrpfRate: 27.5 }).monthlyIrpfSaving).toBeCloseTo(280.5, 2);
  });

  it("grows with the marginal rate, never shrinking", () => {
    let previous = -Infinity;

    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const saving = benefits({ estimatedIrpfRate }).monthlyIrpfSaving;
      expect(saving).toBeGreaterThanOrEqual(previous);
      previous = saving;
    }

    expect(benefits({ estimatedIrpfRate: 27.5 }).monthlyIrpfSaving).toBeGreaterThan(
      benefits({ estimatedIrpfRate: 7.5 }).monthlyIrpfSaving,
    );
  });

  /**
   * The saving is tax that was not withheld, so it can never exceed the amount
   * that would have been taxed. A saving larger than the benefit would mean the
   * Receita paying the visitor to take a meal voucher.
   */
  it("never saves more tax than the benefit is worth", () => {
    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const result = benefits({ estimatedIrpfRate });

      expect(result.monthlyIrpfSaving).toBeGreaterThanOrEqual(0);
      expect(result.monthlyIrpfSaving).toBeLessThanOrEqual(result.monthlyBenefitTotal);
    }
  });

  it("reports the yearly saving as twelve monthly ones", () => {
    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const result = benefits({ estimatedIrpfRate });
      expect(result.annualIrpfSaving).toBeCloseTo(result.monthlyIrpfSaving * 12, 6);
    }
  });
});

describe("calculateTaxFreeBenefits — the cash equivalent", () => {
  /**
   * The definition of `requiredGrossIncome`, checked as a round trip rather
   * than by restating the formula: withhold the marginal rate from the gross
   * salary it proposes and exactly the benefit must survive.
   */
  it("proposes a gross salary that nets exactly the benefit after tax", () => {
    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const result = benefits({ estimatedIrpfRate });
      const afterTax = result.requiredGrossIncome * (1 - estimatedIrpfRate / 100);

      expect(afterTax).toBeCloseTo(result.monthlyBenefitTotal, 6);
    }
  });

  /**
   * Paying the same amount in cash always costs the employer at least as much
   * as paying it in benefits, and strictly more as soon as any tax is due.
   */
  it("never makes cash the cheaper way to deliver the same amount", () => {
    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const result = benefits({ estimatedIrpfRate });

      expect(result.comparison.asCash).toBeGreaterThanOrEqual(result.comparison.asBenefits);
      expect(result.comparison.difference).toBeGreaterThanOrEqual(0);
      expect(result.comparison.difference).toBeCloseTo(
        result.comparison.asCash - result.comparison.asBenefits,
        6,
      );
    }
  });

  it("charges no premium at all in the exempt band", () => {
    const result = benefits({ estimatedIrpfRate: 0 });

    expect(result.requiredGrossIncome).toBe(result.monthlyBenefitTotal);
    expect(result.comparison.difference).toBe(0);
  });

  it("stays finite across every rate the page allows", () => {
    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const result = benefits({ estimatedIrpfRate });

      expect(Number.isFinite(result.requiredGrossIncome)).toBe(true);
      expect(Number.isFinite(result.monthlyIrpfSaving)).toBe(true);
      expect(Number.isFinite(result.comparison.difference)).toBe(true);
    }
  });

  /**
   * ⚠️ Pinned hole, not an endorsement.
   *
   * `requiredGrossIncome` divides by `1 - estimatedIrpfRate/100`, which is zero at a
   * 100% rate and negative above it. Nothing in the module rejects either. The
   * route's own input caps at 27,5 so no visitor reaches this today — this test
   * exists so that the guard's absence is recorded rather than rediscovered if
   * the caller ever changes.
   */
  it("has no guard against a rate of 100% or more", () => {
    expect(benefits({ estimatedIrpfRate: 100 }).requiredGrossIncome).toBe(Infinity);
    expect(benefits({ estimatedIrpfRate: 150 }).requiredGrossIncome).toBeLessThan(0);
  });
});

describe("calculateTaxFreeBenefits — the unused net-salary fields", () => {
  /**
   * ⚠️ Pinned placeholder, not a computation.
   *
   * `netSalaryWithoutBenefits` is the literal 0 the module calls a
   * "reference point", and `netSalaryWithBenefits` is the benefit total
   * again under another name. Neither depends on the rate, and no route renders
   * either. Pinned so that whoever gives them a meaning has to come here first.
   */
  it("returns two constants that no input moves", () => {
    for (const estimatedIrpfRate of MARGINAL_RATES) {
      const result = benefits({ estimatedIrpfRate });

      expect(result.netSalaryWithoutBenefits).toBe(0);
      expect(result.netSalaryWithBenefits).toBe(result.monthlyBenefitTotal);
    }
  });
});
