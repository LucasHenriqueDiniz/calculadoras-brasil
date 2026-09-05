import { describe, expect, it } from "vitest";
import {
  calculateBeneficiosFiscais,
  type BeneficiosFiscaisInput,
  type BeneficiosFiscaisResult,
} from "../../src/lib/calculators/beneficiosFiscais";

/**
 * Every marginal rate the IRPF table can put a taxpayer on, plus the exempt
 * band. The route caps its own input at 27,5, so this is the whole reachable
 * domain of `aliquotaIrpfEstimada`.
 */
const MARGINAL_RATES = [0, 7.5, 15, 22.5, 27.5];

const BASELINE: BeneficiosFiscaisInput = {
  valeRefeicaoMensal: 800,
  valeTransporteMensal: 220,
  aliquotaIrpfEstimada: 15,
};

function benefits(overrides: Partial<BeneficiosFiscaisInput> = {}): BeneficiosFiscaisResult {
  return calculateBeneficiosFiscais({ ...BASELINE, ...overrides });
}

describe("calculateBeneficiosFiscais — the benefit total", () => {
  it("returns nothing but zeros when there is no benefit", () => {
    const result = benefits({ valeRefeicaoMensal: 0, valeTransporteMensal: 0 });

    expect(result.beneficiosTotalMensal).toBe(0);
    expect(result.economiaIrpfMensal).toBe(0);
    expect(result.economiaIrpfAnual).toBe(0);
    expect(result.rendaBrutaNecessaria).toBe(0);
    expect(result.comparacao.diferenca).toBe(0);
    expect(Number.isNaN(result.economiaIrpfMensal)).toBe(false);
  });

  /**
   * Neither benefit is taxed, so which of the two carries the money cannot
   * change a single figure. Only the total may matter.
   */
  it("cares about the total, not about how it splits between the two benefits", () => {
    const mealHeavy = benefits({ valeRefeicaoMensal: 900, valeTransporteMensal: 120 });
    const transportHeavy = benefits({ valeRefeicaoMensal: 120, valeTransporteMensal: 900 });

    expect(transportHeavy.beneficiosTotalMensal).toBe(mealHeavy.beneficiosTotalMensal);
    expect(transportHeavy.economiaIrpfMensal).toBe(mealHeavy.economiaIrpfMensal);
    expect(transportHeavy.rendaBrutaNecessaria).toBe(mealHeavy.rendaBrutaNecessaria);
  });

  it("echoes each benefit back untouched", () => {
    const result = benefits({ valeRefeicaoMensal: 640, valeTransporteMensal: 310 });

    expect(result.valeRefeicaoMensal).toBe(640);
    expect(result.valeTransporteMensal).toBe(310);
    expect(result.beneficiosTotalMensal).toBe(950);
  });
});

describe("calculateBeneficiosFiscais — the IRPF saving", () => {
  it("saves nothing in the exempt band", () => {
    expect(benefits({ aliquotaIrpfEstimada: 0 }).economiaIrpfMensal).toBe(0);
  });

  /**
   * Hand-worked from the top marginal rate: R$ 800 + R$ 220 = R$ 1.020 of
   * untaxed benefit, at 27,5%, is R$ 280,50 of IRPF not withheld.
   */
  it("saves the marginal rate on the whole benefit", () => {
    expect(benefits({ aliquotaIrpfEstimada: 27.5 }).economiaIrpfMensal).toBeCloseTo(280.5, 2);
  });

  it("grows with the marginal rate, never shrinking", () => {
    let previous = -Infinity;

    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const saving = benefits({ aliquotaIrpfEstimada }).economiaIrpfMensal;
      expect(saving).toBeGreaterThanOrEqual(previous);
      previous = saving;
    }

    expect(benefits({ aliquotaIrpfEstimada: 27.5 }).economiaIrpfMensal).toBeGreaterThan(
      benefits({ aliquotaIrpfEstimada: 7.5 }).economiaIrpfMensal,
    );
  });

  /**
   * The saving is tax that was not withheld, so it can never exceed the amount
   * that would have been taxed. A saving larger than the benefit would mean the
   * Receita paying the visitor to take a meal voucher.
   */
  it("never saves more tax than the benefit is worth", () => {
    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const result = benefits({ aliquotaIrpfEstimada });

      expect(result.economiaIrpfMensal).toBeGreaterThanOrEqual(0);
      expect(result.economiaIrpfMensal).toBeLessThanOrEqual(result.beneficiosTotalMensal);
    }
  });

  it("reports the yearly saving as twelve monthly ones", () => {
    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const result = benefits({ aliquotaIrpfEstimada });
      expect(result.economiaIrpfAnual).toBeCloseTo(result.economiaIrpfMensal * 12, 6);
    }
  });
});

describe("calculateBeneficiosFiscais — the cash equivalent", () => {
  /**
   * The definition of `rendaBrutaNecessaria`, checked as a round trip rather
   * than by restating the formula: withhold the marginal rate from the gross
   * salary it proposes and exactly the benefit must survive.
   */
  it("proposes a gross salary that nets exactly the benefit after tax", () => {
    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const result = benefits({ aliquotaIrpfEstimada });
      const afterTax = result.rendaBrutaNecessaria * (1 - aliquotaIrpfEstimada / 100);

      expect(afterTax).toBeCloseTo(result.beneficiosTotalMensal, 6);
    }
  });

  /**
   * Paying the same amount in cash always costs the employer at least as much
   * as paying it in benefits, and strictly more as soon as any tax is due.
   */
  it("never makes cash the cheaper way to deliver the same amount", () => {
    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const result = benefits({ aliquotaIrpfEstimada });

      expect(result.comparacao.emDinheiro).toBeGreaterThanOrEqual(result.comparacao.emBeneficios);
      expect(result.comparacao.diferenca).toBeGreaterThanOrEqual(0);
      expect(result.comparacao.diferenca).toBeCloseTo(
        result.comparacao.emDinheiro - result.comparacao.emBeneficios,
        6,
      );
    }
  });

  it("charges no premium at all in the exempt band", () => {
    const result = benefits({ aliquotaIrpfEstimada: 0 });

    expect(result.rendaBrutaNecessaria).toBe(result.beneficiosTotalMensal);
    expect(result.comparacao.diferenca).toBe(0);
  });

  it("stays finite across every rate the page allows", () => {
    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const result = benefits({ aliquotaIrpfEstimada });

      expect(Number.isFinite(result.rendaBrutaNecessaria)).toBe(true);
      expect(Number.isFinite(result.economiaIrpfMensal)).toBe(true);
      expect(Number.isFinite(result.comparacao.diferenca)).toBe(true);
    }
  });

  /**
   * ⚠️ Pinned hole, not an endorsement.
   *
   * `rendaBrutaNecessaria` divides by `1 - aliquota/100`, which is zero at a
   * 100% rate and negative above it. Nothing in the module rejects either. The
   * route's own input caps at 27,5 so no visitor reaches this today — this test
   * exists so that the guard's absence is recorded rather than rediscovered if
   * the caller ever changes.
   */
  it("has no guard against a rate of 100% or more", () => {
    expect(benefits({ aliquotaIrpfEstimada: 100 }).rendaBrutaNecessaria).toBe(Infinity);
    expect(benefits({ aliquotaIrpfEstimada: 150 }).rendaBrutaNecessaria).toBeLessThan(0);
  });
});

describe("calculateBeneficiosFiscais — the unused net-salary fields", () => {
  /**
   * ⚠️ Pinned placeholder, not a computation.
   *
   * `salarioLiquidoSemBeneficios` is the literal 0 the module calls a
   * "reference point", and `salarioLiquidoComBeneficios` is the benefit total
   * again under another name. Neither depends on the rate, and no route renders
   * either. Pinned so that whoever gives them a meaning has to come here first.
   */
  it("returns two constants that no input moves", () => {
    for (const aliquotaIrpfEstimada of MARGINAL_RATES) {
      const result = benefits({ aliquotaIrpfEstimada });

      expect(result.salarioLiquidoSemBeneficios).toBe(0);
      expect(result.salarioLiquidoComBeneficios).toBe(result.beneficiosTotalMensal);
    }
  });
});
