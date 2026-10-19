import { describe, expect, it } from "vitest";
import {
  SIMPLES_ANNEX_III,
  SIMPLES_ANNEX_V,
  annexFor,
  fatorRProLabore,
  simplesEffectiveRate,
} from "../../src/lib/calculators/simples-nacional";

/**
 * LC 123/2006, Anexos III and V, transcribed from
 * docs/research/2026-10-18-pj-simples-nacional/fetches/planalto-lc-123-2006-art-18-anexos.md.
 * The one hard-coded copy, and it has to be one: a table checked against itself
 * pins nothing.
 */
const PUBLISHED = {
  III: [
    { upTo: 180_000, rate: 0.06, deduction: 0 },
    { upTo: 360_000, rate: 0.112, deduction: 9_360 },
    { upTo: 720_000, rate: 0.135, deduction: 17_640 },
    { upTo: 1_800_000, rate: 0.16, deduction: 35_640 },
    { upTo: 3_600_000, rate: 0.21, deduction: 125_640 },
    { upTo: 4_800_000, rate: 0.33, deduction: 648_000 },
  ],
  V: [
    { upTo: 180_000, rate: 0.155, deduction: 0 },
    { upTo: 360_000, rate: 0.18, deduction: 4_500 },
    { upTo: 720_000, rate: 0.195, deduction: 9_900 },
    { upTo: 1_800_000, rate: 0.205, deduction: 17_100 },
    { upTo: 3_600_000, rate: 0.23, deduction: 62_100 },
    { upTo: 4_800_000, rate: 0.305, deduction: 540_000 },
  ],
};

describe("Simples Nacional annexes", () => {
  it("carry LC 123/2006's own bands for Anexo III", () => {
    expect(SIMPLES_ANNEX_III).toEqual(PUBLISHED.III);
  });

  it("carry LC 123/2006's own bands for Anexo V", () => {
    expect(SIMPLES_ANNEX_V).toEqual(PUBLISHED.V);
  });
});

describe("simplesEffectiveRate — art. 18, § 1º-A", () => {
  it("is the nominal rate in the first band, where nothing is deducted", () => {
    expect(simplesEffectiveRate("III", 120_000)).toBeCloseTo(0.06, 12);
    expect(simplesEffectiveRate("V", 120_000)).toBeCloseTo(0.155, 12);
  });

  /** (240.000 × 11,2% − 9.360) / 240.000 = 7,3%; (240.000 × 18% − 4.500) / 240.000 = 16,125%. */
  it("deducts the parcela in the second band", () => {
    expect(simplesEffectiveRate("III", 240_000)).toBeCloseTo(0.073, 12);
    expect(simplesEffectiveRate("V", 240_000)).toBeCloseTo(0.16125, 12);
  });

  /**
   * The parcela a deduzir exists to make the formula continuous, so no boundary
   * up to the fifth band may jump. Measured on both annexes, one real either
   * side of each boundary.
   */
  it.each(["III", "V"] as const)("never jumps at a band boundary in Anexo %s", (annex) => {
    for (const { upTo } of PUBLISHED[annex].slice(0, 4)) {
      const step = simplesEffectiveRate(annex, upTo + 1) - simplesEffectiveRate(annex, upTo);
      expect(step, `RBT12 ${upTo}`).toBeGreaterThanOrEqual(0);
      expect(step, `RBT12 ${upTo}`).toBeLessThan(1e-5);
    }
  });

  /**
   * ⚠️ Pinned as measured, not as designed: entering the sixth band, the effective
   * rate FALLS by about 2,5 points in both annexes — from 17,51% to 15,00% in
   * Anexo III. That is the sublimit, where ISS leaves the DAS; the CLT vs PJ model
   * stops at R$ 3,6 milhões rather than charge a rate that omits it.
   */
  it.each([
    ["III", 0.1751, 0.15],
    ["V", 0.2128, 0.155],
  ] as const)("falls entering the sixth band in Anexo %s", (annex, before, after) => {
    expect(simplesEffectiveRate(annex, 3_600_000)).toBeCloseTo(before, 4);
    expect(simplesEffectiveRate(annex, 3_600_001)).toBeCloseTo(after, 4);
  });

  it("charges nothing on nothing", () => {
    expect(simplesEffectiveRate("III", 0)).toBe(0);
  });
});

describe("the Fator R — §§ 5º-J and 5º-M", () => {
  /** The case floating point got wrong: 0,28 × 7.334 / 7.334 < 0,28. */
  it("meets 28% to the centavo, in whole centavos", () => {
    expect(fatorRProLabore(7_334)).toBe(2053.52);
    expect(annexFor(2053.52, 7_334)).toBe("III");
    expect(annexFor(2053.51, 7_334)).toBe("V");
  });

  it.each([1_000, 7_334, 10_000, 12_345.67, 99_999.99])(
    "rounds 28%% of %s up to the centavo, never down",
    (revenue) => {
      const proLabore = fatorRProLabore(revenue);
      expect(annexFor(proLabore, revenue)).toBe("III");
      expect(annexFor(proLabore - 0.01, revenue)).toBe("V");
    },
  );
});
