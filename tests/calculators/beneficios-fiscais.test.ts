import { describe, expect, it } from "vitest";
import {
  buildBenefitEquivalenceTable,
  calculateTaxFreeBenefits,
  type TaxFreeBenefitsInput,
} from "../../src/lib/calculators/beneficiosFiscais";
import { calculateNetSalary } from "../../src/lib/calculators/salarioLiquido";

const BASELINE: TaxFreeBenefitsInput = {
  monthlyGrossSalary: 5_000,
  monthlyMealAllowance: 800,
  monthlyTransportCost: 0,
};

function benefits(overrides: Partial<TaxFreeBenefitsInput> = {}) {
  return calculateTaxFreeBenefits({ ...BASELINE, ...overrides });
}

function net(monthlyGrossSalary: number): number {
  return calculateNetSalary({
    monthlyGrossSalary,
    dependants: 0,
    monthlyPrivatePension: 0,
    monthlyMealAllowance: 0,
    monthlyTransportCost: 0,
    hasUnionDue: false,
  }).monthlyNetSalary;
}

describe("calculateTaxFreeBenefits — the vale-transporte share (Lei 7.418/1985, art. 4º)", () => {
  /** R$ 3.000 of salary: the worker pays up to 6%, R$ 180; the employer pays the R$ 220 above it. */
  it("leaves the worker 6% of the base salary and counts only the employer's part", () => {
    const result = benefits({ monthlyGrossSalary: 3_000, monthlyTransportCost: 400 });

    expect(result.transportEmployeeShare).toBe(180);
    expect(result.transportEmployerShare).toBe(220);
  });

  it("is worth nothing when the commute costs less than 6% of the salary", () => {
    const result = benefits({ monthlyGrossSalary: 5_000, monthlyTransportCost: 220 });

    expect(result.transportEmployeeShare).toBe(220);
    expect(result.transportEmployerShare).toBe(0);
  });

  it("adds the meal allowance and the employer's transport share, nothing else", () => {
    const result = benefits({
      monthlyGrossSalary: 3_000,
      monthlyMealAllowance: 500,
      monthlyTransportCost: 400,
    });

    expect(result.monthlyBenefitTotal).toBe(720);
    expect(result.annualBenefitTotal).toBe(8_640);
  });
});

describe("calculateTaxFreeBenefits — the equivalent raise, by the net-salary calculator", () => {
  /**
   * By hand at R$ 20.000: INSS is already at the ceiling, so a raise pays only
   * 27,5% income tax and no reduction applies. R$ 800 needs 800 / 0,725 =
   * R$ 1.103,45 of gross raise.
   */
  it("grosses up by the top rate alone above the INSS ceiling", () => {
    const result = benefits({ monthlyGrossSalary: 20_000, monthlyMealAllowance: 800 });

    expect(result.equivalentGrossRaise).toBeCloseTo(1103.45, 2);
    expect(result.taxesOnEquivalentRaise).toBeCloseTo(303.45, 2);
  });

  /**
   * By hand at R$ 8.000, below the INSS ceiling and past the reduction: each
   * real of raise pays 14% INSS and 27,5% on the other 86%, keeping 0,6235.
   * R$ 200 needs 200 / 0,6235 = R$ 320,77. The INSS the old formula left out is
   * what separates this from 200 / 0,725 = R$ 275,86.
   */
  it("counts the raise's INSS, which the old formula left out", () => {
    const result = benefits({ monthlyGrossSalary: 8_000, monthlyMealAllowance: 200 });

    // 320,769… by hand; the payslip rounds the tax to the centavo, which can
    // cost one more centavo of raise.
    expect(result.equivalentGrossRaise).toBeGreaterThanOrEqual(320.77);
    expect(result.equivalentGrossRaise).toBeLessThanOrEqual(320.78);
  });

  it.each([1_621, 3_000, 5_000, 6_500, 9_000, 15_000])(
    "names the smallest raise that nets the benefit, at %s",
    (monthlyGrossSalary) => {
      const result = benefits({ monthlyGrossSalary, monthlyMealAllowance: 600 });
      const gain = (raise: number) => net(monthlyGrossSalary + raise) - net(monthlyGrossSalary);

      expect(gain(result.equivalentGrossRaise)).toBeGreaterThanOrEqual(600 - 1e-6);
      expect(gain(result.equivalentGrossRaise - 0.01)).toBeLessThan(600);
    },
  );

  it("never makes cash cheaper than the benefit", () => {
    for (const monthlyGrossSalary of [1_621, 4_000, 5_500, 8_000, 30_000]) {
      const result = benefits({ monthlyGrossSalary });
      expect(result.equivalentGrossRaise).toBeGreaterThanOrEqual(result.monthlyBenefitTotal);
    }
  });

  it("asks for no raise when there is no benefit", () => {
    const result = benefits({ monthlyMealAllowance: 0, monthlyTransportCost: 0 });

    expect(result.monthlyBenefitTotal).toBe(0);
    expect(result.equivalentGrossRaise).toBe(0);
    expect(result.taxesOnEquivalentRaise).toBe(0);
  });

  it("treats negative inputs as none", () => {
    const result = benefits({ monthlyMealAllowance: -100, monthlyTransportCost: -50 });

    expect(result.monthlyBenefitTotal).toBe(0);
  });
});

describe("buildBenefitEquivalenceTable", () => {
  it("is the form's own answer on every row", () => {
    for (const row of buildBenefitEquivalenceTable([3_000, 8_000, 20_000], 800)) {
      const form = benefits({
        monthlyGrossSalary: row.monthlyGrossSalary,
        monthlyMealAllowance: 800,
      });
      expect(row.equivalentGrossRaise).toBe(form.equivalentGrossRaise);
    }
  });

  it("reports the premium the raise needs over the benefit", () => {
    const [row] = buildBenefitEquivalenceTable([20_000], 800);

    expect(row.premium).toBeCloseTo(1103.45 / 800 - 1, 4);
  });
});
