import { describe, expect, it } from "vitest";
import {
  calculatePrevidenciaComplementar,
  type PrevidenciaComplementarInput,
  type PrevidenciaComplementarResult,
} from "../../src/lib/calculators/previdenciaComplementar";

/**
 * ⚠️ in this file means one thing and one thing only: the test underneath it
 * PINS current behaviour instead of endorsing it. Everything else — including
 * real limitations of the model — is written as a plain "Caveat:" note, so that
 * scanning for ⚠️ returns the pinned cases and nothing else.
 */

const BASELINE: PrevidenciaComplementarInput = {
  contribuicaoMensalPgbl: 1_000,
  tasaRetornoAnual: 8,
  anosAteAposentadoria: 10,
  aliquotaIrpfAtual: 27.5,
};

function project(
  overrides: Partial<PrevidenciaComplementarInput> = {},
): PrevidenciaComplementarResult {
  return calculatePrevidenciaComplementar({ ...BASELINE, ...overrides });
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

describe("calculatePrevidenciaComplementar — the compounding base case", () => {
  it("has nothing saved and nothing earned when there are no years left", () => {
    const result = project({ anosAteAposentadoria: 0 });

    expect(result.montanteFinalHorizonte).toBe(0);
    expect(result.rendimentoTotal).toBe(0);
    expect(result.projecao).toHaveLength(0);
    expect(Number.isNaN(result.rendimentoTotal)).toBe(false);
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
    const result = project({ anosAteAposentadoria: 1 });

    expect(result.montanteFinalHorizonte).toBeCloseTo(12_000, 6);
    expect(result.rendimentoTotal).toBeCloseTo(0, 6);
    expect(result.projecao[0]).toMatchObject({ ano: 1, rendimento: 0 });
  });

  it("returns exactly the contributions when nothing is earned on them", () => {
    const result = project({ tasaRetornoAnual: 0, anosAteAposentadoria: 25 });

    expect(result.rendimentoTotal).toBe(0);
    expect(result.montanteFinalHorizonte).toBe(300_000);
  });
});

describe("calculatePrevidenciaComplementar — the balance at the visitor's horizon", () => {
  /**
   * The field the page headlines. It is the balance after exactly the number of
   * years the visitor asked for — never the nearest of the 10/20/30 marks,
   * which is what the route used to print under the label "em {anos} anos".
   */
  it.each([
    [5, 70_399.21],
    [15, 325_825.37],
    [35, 2_067_801.64],
  ])(
    "reports the balance at %i years, not the nearest fixed mark",
    (anosAteAposentadoria, expected) => {
      const result = project({ anosAteAposentadoria });

      expect(result.montanteFinalHorizonte).toBeCloseTo(expected, 2);
      expect(result.montanteFinalHorizonte).toBeCloseTo(
        annuityFutureValue(12_000, 8, anosAteAposentadoria),
        2,
      );
      expect(result.montanteFinalHorizonte).not.toBeCloseTo(result.montanteFinal10anos, 2);
      expect(result.montanteFinalHorizonte).not.toBeCloseTo(result.montanteFinal20anos, 2);
      expect(result.montanteFinalHorizonte).not.toBeCloseTo(result.montanteFinal30anos, 2);
    },
  );

  it.each([1, 10, 20, 30])(
    "coincides with the mark when the horizon lands on one: %i years",
    (anosAteAposentadoria) => {
      const result = project({ anosAteAposentadoria });

      expect(result.montanteFinalHorizonte).toBeCloseTo(
        annuityFutureValue(12_000, 8, anosAteAposentadoria),
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
    (tasaRetornoAnual, anosAteAposentadoria) => {
      const result = project({ tasaRetornoAnual, anosAteAposentadoria });

      expect(result.montanteFinalHorizonte).toBeCloseTo(
        annuityFutureValue(12_000, tasaRetornoAnual, anosAteAposentadoria),
        2,
      );
    },
  );

  it.each([1, 5, 12, 25, 40])(
    "keeps rendimentoTotal as the horizon balance less the contributions: %i years",
    (anosAteAposentadoria) => {
      const result = project({ anosAteAposentadoria });

      expect(result.rendimentoTotal).toBeCloseTo(
        result.montanteFinalHorizonte - result.contribuicaoAnualPgbl * anosAteAposentadoria,
        6,
      );
    },
  );

  it("pins the worked example: R$ 1.000/month at 8% for 10 years", () => {
    // 12.000 × ((1,08^10 − 1) / 0,08) = 173.838,75
    expect(project().montanteFinalHorizonte).toBeCloseTo(173_838.75, 2);
    expect(project().rendimentoTotal).toBeCloseTo(173_838.75 - 120_000, 2);
  });

  it("scales in proportion to the contribution", () => {
    const single = project({ contribuicaoMensalPgbl: 1_000, anosAteAposentadoria: 20 });
    const triple = project({ contribuicaoMensalPgbl: 3_000, anosAteAposentadoria: 20 });

    expect(triple.montanteFinalHorizonte).toBeCloseTo(single.montanteFinalHorizonte * 3, 6);
    expect(triple.rendimentoTotal).toBeCloseTo(single.rendimentoTotal * 3, 6);
  });

  it("grows with the return rate and with the horizon", () => {
    let previousByRate = -Infinity;
    for (let tasaRetornoAnual = 0; tasaRetornoAnual <= 20; tasaRetornoAnual += 0.5) {
      const balance = project({ tasaRetornoAnual }).montanteFinalHorizonte;
      expect(balance).toBeGreaterThanOrEqual(previousByRate);
      previousByRate = balance;
    }

    let previousByYears = -Infinity;
    for (let anosAteAposentadoria = 1; anosAteAposentadoria <= 40; anosAteAposentadoria += 1) {
      const balance = project({ anosAteAposentadoria }).montanteFinalHorizonte;
      expect(balance).toBeGreaterThan(previousByYears);
      previousByYears = balance;
    }
  });

  it("never reports a gain where the money only sat still", () => {
    for (let tasaRetornoAnual = 0; tasaRetornoAnual <= 20; tasaRetornoAnual += 0.5) {
      const result = project({ tasaRetornoAnual, anosAteAposentadoria: 30 });

      expect(result.rendimentoTotal).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(result.rendimentoTotal)).toBe(true);
    }
  });

  /**
   * `montanteFinal10anos`, `montanteFinal20anos` and `montanteFinal30anos` are
   * fixed reference points — the balance at that many years, whatever horizon
   * the visitor chose — and the breakdown table prints all three side by side.
   * They are comparison marks, not the answer, which is why the headline reads
   * `montanteFinalHorizonte` instead.
   */
  it.each([1, 5, 15, 35])(
    "reports 10, 20 and 30 years as fixed marks, independent of a %i-year horizon",
    (anosAteAposentadoria) => {
      const result = project({ anosAteAposentadoria });

      expect(result.montanteFinal10anos).toBeCloseTo(annuityFutureValue(12_000, 8, 10), 2);
      expect(result.montanteFinal20anos).toBeCloseTo(annuityFutureValue(12_000, 8, 20), 2);
      expect(result.montanteFinal30anos).toBeCloseTo(annuityFutureValue(12_000, 8, 30), 2);
    },
  );
});

describe("calculatePrevidenciaComplementar — the year-by-year projection", () => {
  /**
   * ⚠️ Pinned sampling, not a contract.
   *
   * `projecao` is dead output: `grep -rn projecao src/` finds the module and
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
  ])("samples years 1, 5 and each decade — a %i-year horizon gives %j", (anos, expected) => {
    const { projecao } = project({ anosAteAposentadoria: anos });

    expect(projecao.map((point) => point.ano)).toEqual(expected);
  });

  it.each([1, 5, 12, 30, 40])(
    "never samples a year beyond a %i-year horizon, and always moves forward",
    (anosAteAposentadoria) => {
      const { projecao } = project({ anosAteAposentadoria });

      let previousYear = 0;
      for (const point of projecao) {
        expect(point.ano).toBeGreaterThan(previousYear);
        expect(point.ano).toBeLessThanOrEqual(anosAteAposentadoria);
        previousYear = point.ano;
      }
    },
  );

  it("agrees with the closed form at every year it does sample", () => {
    const { projecao } = project({ anosAteAposentadoria: 40, tasaRetornoAnual: 6 });

    expect(projecao.length).toBeGreaterThan(0);

    for (const point of projecao) {
      expect(point.saldo).toBeCloseTo(annuityFutureValue(12_000, 6, point.ano), 2);
      expect(point.rendimento).toBeCloseTo(annuityFutureValue(12_000, 6, point.ano - 1) * 0.06, 2);
    }
  });
});

describe("calculatePrevidenciaComplementar — the IRPF deduction", () => {
  it("deducts nothing in the exempt band", () => {
    expect(project({ aliquotaIrpfAtual: 0 }).economiaIrpfMensal).toBe(0);
    expect(project({ aliquotaIrpfAtual: 0 }).economiaIrpfAnual).toBe(0);
  });

  /**
   * Hand-worked from the top marginal rate: R$ 1.000 deducted at 27,5% defers
   * R$ 275 of IRPF a month, R$ 3.300 a year.
   */
  it("defers the marginal rate on the contribution", () => {
    const result = project({ aliquotaIrpfAtual: 27.5 });

    expect(result.economiaIrpfMensal).toBeCloseTo(275, 2);
    expect(result.economiaIrpfAnual).toBeCloseTo(3_300, 2);
  });

  it.each([0, 7.5, 15, 22.5, 27.5])(
    "never defers more tax than the contribution itself at %i%%",
    (aliquotaIrpfAtual) => {
      const result = project({ aliquotaIrpfAtual });

      expect(result.economiaIrpfMensal).toBeGreaterThanOrEqual(0);
      expect(result.economiaIrpfMensal).toBeLessThanOrEqual(result.contribuicaoMensalPgbl);
      expect(result.economiaIrpfAnual).toBeCloseTo(result.economiaIrpfMensal * 12, 6);
    },
  );

  it("leaves the projected balance untouched — the deduction is a separate pot", () => {
    const exempt = project({ aliquotaIrpfAtual: 0 });
    const topRate = project({ aliquotaIrpfAtual: 27.5 });

    expect(topRate.montanteFinalHorizonte).toBe(exempt.montanteFinalHorizonte);
  });
});

describe("calculatePrevidenciaComplementar — degenerate input", () => {
  it("echoes the contribution back, monthly and annualised", () => {
    const result = project({ contribuicaoMensalPgbl: 750 });

    expect(result.contribuicaoMensalPgbl).toBe(750);
    expect(result.contribuicaoAnualPgbl).toBe(9_000);
  });

  it("saves nothing and earns nothing on a zero contribution", () => {
    const result = project({ contribuicaoMensalPgbl: 0 });

    expect(result.rendimentoTotal).toBe(0);
    expect(result.economiaIrpfMensal).toBe(0);
    expect(result.montanteFinalHorizonte).toBe(0);
  });

  /**
   * ⚠️ Pinned arithmetic, not an endorsement.
   *
   * `rendimentoTotal` is the balance less the contributions, and neither term
   * is floored. A negative horizon runs no years, so the balance is zero while
   * the contributions term goes negative — and the subtraction reports a
   * R$ 60.000 return on money never deposited. No visitor reaches it: the
   * route's "Anos até aposentadoria" field is `min={1}`. Pinned rather than
   * failed, for the same reason the unreachable ≥100% rate is pinned in
   * tests/calculators/beneficios-fiscais.test.ts — an unreachable input is not
   * a defect until something can reach it.
   */
  it("manufactures a return out of a negative horizon", () => {
    const result = project({ anosAteAposentadoria: -5 });

    expect(result.montanteFinalHorizonte).toBe(0);
    expect(result.projecao).toHaveLength(0);
    expect(result.rendimentoTotal).toBe(60_000);
  });

  it("reports a loss, not a gain, when the rate is negative", () => {
    const result = project({ tasaRetornoAnual: -20, anosAteAposentadoria: 10 });

    expect(result.rendimentoTotal).toBeLessThan(0);
    expect(result.montanteFinalHorizonte).toBeCloseTo(annuityFutureValue(12_000, -20, 10), 2);
  });
});
