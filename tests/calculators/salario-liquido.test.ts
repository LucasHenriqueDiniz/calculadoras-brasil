import { describe, expect, it } from "vitest";
import {
  calculateSalarioLiquido,
  type SalarioLiquidoInput,
} from "../../src/lib/calculators/salarioLiquido";
import { IRPF_MONTHLY_TABLE_2026 } from "../../src/lib/calculators/irpf-constants";
import { calculateIrpf } from "../../src/lib/calculators/irpf";
import { TETO_INSS, calcularInssEmpregado } from "../../src/lib/calculators/inss-constants";

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

const NO_DEDUCTIONS: Omit<SalarioLiquidoInput, "salarioBrutoMensal"> = {
  dependentes: 0,
  deducaoEducacao: 0,
  deducaoSaude: 0,
  deducaoPrevidenciaComplementar: 0,
  temValeRefeicao: false,
  temValeTransporte: false,
  temSindicato: false,
  regimeSimplificado: false,
};

function salario(input: Partial<SalarioLiquidoInput> & { salarioBrutoMensal: number }) {
  return calculateSalarioLiquido({ ...NO_DEDUCTIONS, ...input });
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
    if (salario({ salarioBrutoMensal: middle }).baseImponivelMensal < base) {
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
 * ⚠️ Deliberately not `descIrpfEstimado`. The reduction zeroes the withholding
 * below R$ 5.000 of gross salary, and every bracket boundary here sits under
 * that — so asserting continuity on the final figure would compare 0 to 0 at
 * every boundary and pass while proving nothing.
 */
function taxAtBase(base: number): number {
  return salario({ salarioBrutoMensal: grossForBase(base) }).irpfPelaTabela;
}

describe("calculateSalarioLiquido — the ordinary case", () => {
  /**
   * One salary, the whole breakdown. Every figure below was produced by running
   * the module, but each is reachable by hand from the published 2026 tables,
   * which is what makes it an assertion rather than a snapshot.
   */
  const result = salario({
    salarioBrutoMensal: 6000,
    dependentes: 1,
    deducaoEducacao: 3000,
    deducaoSaude: 1200,
    deducaoPrevidenciaComplementar: 2400,
  });

  it("withholds the progressive INSS contribution", () => {
    expect(result.descInssEmpregado).toBeCloseTo(641.51, 2);
    expect(result.baseParaIrpf).toBeCloseTo(5358.49, 2);
  });

  it("sums the annual itemised deductions and the dependant allowance", () => {
    expect(result.totalDeducoes).toBeCloseTo(3000 + 1200 + 2400, 2);
    expect(result.descDependentes).toBeCloseTo(2275.08, 2);
    expect(result.baseImponivel).toBeCloseTo(55426.75, 2);
  });

  it("taxes the monthly share of that base, then applies the reduction", () => {
    expect(result.baseImponivelMensal).toBeCloseTo(4618.9, 2);
    expect(result.irpfPelaTabela).toBeCloseTo(363.76, 2);
    expect(result.reducaoLei15270).toBeCloseTo(179.75, 2);
    expect(result.descIrpfEstimado).toBeCloseTo(184.01, 2);
  });

  it("arrives at the net salary and the effective rate", () => {
    // 6.000,00 gross, less 641,5144 of INSS and 184,01 of IRPF.
    expect(result.salarioLiquidoMensal).toBeCloseTo(5174.4756, 4);
    expect(result.salarioLiquidoAnual).toBeCloseTo(5174.4756 * 12, 4);
    expect(result.aliquotaEfetivaIrpf).toBeCloseTo(3.0668, 4);
  });

  it("reports the monthly share of what the deductions took off the base", () => {
    expect(result.economia.comDependentes).toBeCloseTo(189.59, 2);
    expect(result.economia.comDeducoes).toBeCloseTo(550, 2);
    expect(result.economia.total).toBeCloseTo(739.59, 2);
  });
});

describe("calculateSalarioLiquido — INSS", () => {
  it("stops at the RGPS ceiling instead of scaling with the salary", () => {
    const ceilingContribution = calcularInssEmpregado(TETO_INSS);

    expect(ceilingContribution).toBeCloseTo(988.09, 2);
    expect(salario({ salarioBrutoMensal: TETO_INSS }).descInssEmpregado).toBeCloseTo(
      ceilingContribution,
      2,
    );
    expect(salario({ salarioBrutoMensal: 50_000 }).descInssEmpregado).toBeCloseTo(
      ceilingContribution,
      2,
    );
  });

  /**
   * The figure, not the wiring. Asserting this against `calcularInssEmpregado`
   * only restated the call the module makes and would have passed against a flat
   * rate, a cumulative one, or any other contribution table.
   *
   * R$ 4.000,00 spans three brackets, each rate applying to its own slice:
   * `1.621,00 × 7,5% + (2.902,84 − 1.621,00) × 9% + (4.000,00 − 2.902,84) × 12%`
   * = `121,575 + 115,3656 + 131,6592` = R$ 368,5998.
   */
  it("charges each bracket only on the slice of the salary inside it", () => {
    expect(salario({ salarioBrutoMensal: 4000 }).descInssEmpregado).toBeCloseTo(368.5998, 4);
    // A cumulative reading of the same table would take 12% of the whole salary.
    expect(salario({ salarioBrutoMensal: 4000 }).descInssEmpregado).not.toBeCloseTo(480, 2);
  });
});

describe("calculateSalarioLiquido — the monthly table is the published one", () => {
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
   * Asserted on `irpfPelaTabela` for the reason `taxAtBase` records: the final
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
    "leaves the net salary rising with the gross (regimeSimplificado=%s)",
    (regimeSimplificado) => {
      let previousNet = -Infinity;
      let previousTax = -Infinity;

      for (let salarioBrutoMensal = 0; salarioBrutoMensal <= 12_000; salarioBrutoMensal += 0.25) {
        const result = salario({ salarioBrutoMensal, regimeSimplificado });

        expect(result.descIrpfEstimado).toBeGreaterThanOrEqual(previousTax);
        expect(result.salarioLiquidoMensal).toBeGreaterThanOrEqual(previousNet);
        previousTax = result.descIrpfEstimado;
        previousNet = result.salarioLiquidoMensal;
      }
    },
  );
});

describe("calculateSalarioLiquido — the Lei 15.270/2025 reduction", () => {
  /**
   * The worked example in
   * docs/research/2026-09-04-irpf-2026-table/research.md, Findings §4: a gross of
   * R$ 5.000,00 less the R$ 607,20 simplified ceiling gives a base of
   * R$ 4.392,80, which the table taxes at R$ 312,89 — exactly the reduction the
   * statute grants in its first band, so the withholding is zero by construction.
   */
  it("reproduces the statute's own first-band figure at R$ 5.000", () => {
    const result = salario({ salarioBrutoMensal: 5000, regimeSimplificado: true });

    expect(result.baseImponivelMensal).toBeCloseTo(4392.8, 2);
    expect(result.irpfPelaTabela).toBeCloseTo(312.89, 2);
    expect(result.reducaoLei15270).toBeCloseTo(312.89, 2);
    expect(result.descIrpfEstimado).toBe(0);
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
    const result = salario({ salarioBrutoMensal: 6000 });

    expect(result.reducaoLei15270).toBeCloseTo(179.75, 2);
    expect(result.reducaoLei15270).not.toBeCloseTo(
      978.62 - 0.133145 * result.baseImponivelMensal,
      2,
    );
  });

  it("exempts an ordinary salary that the old annual table charged for", () => {
    // Before the fix this salary was withheld R$ 189,90 a month.
    expect(salario({ salarioBrutoMensal: 4000 }).descIrpfEstimado).toBe(0);
    expect(salario({ salarioBrutoMensal: 3000 }).descIrpfEstimado).toBe(0);
    expect(salario({ salarioBrutoMensal: 2500 }).descIrpfEstimado).toBe(0);
  });

  it("has phased out to nothing by R$ 7.350", () => {
    expect(salario({ salarioBrutoMensal: 7350 }).reducaoLei15270).toBeLessThan(0.01);
    expect(salario({ salarioBrutoMensal: 7351 }).reducaoLei15270).toBe(0);

    const above = salario({ salarioBrutoMensal: 9000 });
    expect(above.reducaoLei15270).toBe(0);
    expect(above.descIrpfEstimado).toBeCloseTo(above.irpfPelaTabela, 6);
  });

  it("never reduces by more than the tax the table produced", () => {
    for (let salarioBrutoMensal = 1000; salarioBrutoMensal <= 12_000; salarioBrutoMensal += 50) {
      const result = salario({ salarioBrutoMensal });

      expect(result.reducaoLei15270).toBeLessThanOrEqual(result.irpfPelaTabela + 1e-9);
      expect(result.descIrpfEstimado).toBeGreaterThanOrEqual(0);
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
    const below = salario({ salarioBrutoMensal: 5000 });
    const above = salario({ salarioBrutoMensal: 5000.01 });

    expect(above.reducaoLei15270).toBe(below.reducaoLei15270);
    expect(above.descIrpfEstimado).toBe(below.descIrpfEstimado);
  });
});

describe("calculateSalarioLiquido — dependants and itemised deductions", () => {
  it("deducts the 2026 annual allowance per dependant, uncapped in count", () => {
    expect(salario({ salarioBrutoMensal: 8000, dependentes: 0 }).descDependentes).toBe(0);
    expect(salario({ salarioBrutoMensal: 8000, dependentes: 1 }).descDependentes).toBeCloseTo(
      2275.08,
      2,
    );
    expect(salario({ salarioBrutoMensal: 8000, dependentes: 3 }).descDependentes).toBeCloseTo(
      6825.24,
      2,
    );
  });

  it("lowers the withholding as dependants are added", () => {
    const none = salario({ salarioBrutoMensal: 8000, dependentes: 0 }).descIrpfEstimado;
    const one = salario({ salarioBrutoMensal: 8000, dependentes: 1 }).descIrpfEstimado;
    const three = salario({ salarioBrutoMensal: 8000, dependentes: 3 }).descIrpfEstimado;

    expect(one).toBeLessThan(none);
    expect(three).toBeLessThan(one);
  });

  it("caps education at the documented annual limit", () => {
    expect(salario({ salarioBrutoMensal: 8000, deducaoEducacao: 1000 }).totalDeducoes).toBe(1000);
    expect(salario({ salarioBrutoMensal: 8000, deducaoEducacao: 99_999 }).totalDeducoes).toBe(
      3561.5,
    );
  });

  /**
   * No official ceiling on health expenses was found in any source read for
   * docs/research/2026-09-04-irpf-2026-table/research.md, so this module does not
   * invent one.
   */
  it("does not cap health expenses", () => {
    expect(salario({ salarioBrutoMensal: 8000, deducaoSaude: 40_000 }).totalDeducoes).toBe(40_000);
  });

  it("floors every deduction at zero rather than letting one raise the tax", () => {
    const result = salario({
      salarioBrutoMensal: 8000,
      deducaoEducacao: -1000,
      deducaoSaude: -1000,
      deducaoPrevidenciaComplementar: -1000,
      dependentes: -2,
    });

    expect(result.totalDeducoes).toBe(0);
    expect(result.descDependentes).toBe(0);
    expect(result.descIrpfEstimado).toBeCloseTo(
      salario({ salarioBrutoMensal: 8000 }).descIrpfEstimado,
      6,
    );
  });

  it("never drives the calculation base below zero", () => {
    const result = salario({
      salarioBrutoMensal: 3000,
      deducaoPrevidenciaComplementar: 999_999,
    });

    expect(result.baseImponivel).toBe(0);
    expect(result.baseImponivelMensal).toBe(0);
    expect(result.descIrpfEstimado).toBe(0);
  });
});

describe("calculateSalarioLiquido — the two regimes", () => {
  it("discounts exactly 20% of the gross where the monthly ceiling does not bind", () => {
    // 20% of R$ 3.000 is R$ 600, just under the R$ 607,20 monthly ceiling.
    const result = salario({ salarioBrutoMensal: 3000, regimeSimplificado: true });

    expect(3000 - result.baseImponivelMensal).toBeCloseTo(600, 2);
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
   * (They do differ in `baseImponivelMensal` below R$ 3.036 — R$ 800,00 against
   * R$ 392,80 at a gross of R$ 1.000 — which is why the pin is on the tax.)
   */
  it("withholds what a flat R$ 607,20 reading of the ceiling would", () => {
    for (let salarioBrutoMensal = 0; salarioBrutoMensal <= 8000; salarioBrutoMensal += 6.25) {
      const result = salario({ salarioBrutoMensal, regimeSimplificado: true });
      const flatCeilingReading = officialTableTax(Math.max(salarioBrutoMensal - 607.2, 0));

      expect(result.irpfPelaTabela, `gross R$ ${salarioBrutoMensal}`).toBe(flatCeilingReading);
    }
  });

  it("caps the simplified discount instead of scaling it without limit", () => {
    const modest = salario({ salarioBrutoMensal: 8000, regimeSimplificado: true });
    const large = salario({ salarioBrutoMensal: 40_000, regimeSimplificado: true });

    expect(8000 - modest.baseImponivelMensal).toBeCloseTo(607.2, 2);
    expect(40_000 - large.baseImponivelMensal).toBeCloseTo(607.2, 2);
  });

  /**
   * The desconto simplificado replaces every deduction the legislation allows,
   * dependants included. Subtracting both takes one of them twice.
   * See docs/research/2026-09-04-irpf-2026-table/research.md, Findings §5.
   */
  it("ignores dependants and itemised deductions under the simplified regime", () => {
    const bare = salario({ salarioBrutoMensal: 15_000, regimeSimplificado: true });
    const loaded = salario({
      salarioBrutoMensal: 15_000,
      regimeSimplificado: true,
      dependentes: 3,
      deducaoEducacao: 3000,
      deducaoSaude: 10_000,
      deducaoPrevidenciaComplementar: 20_000,
    });

    expect(loaded.descIrpfEstimado).toBe(bare.descIrpfEstimado);
    // Still reported, so the page can explain what the regime gave up.
    expect(loaded.descDependentes).toBeCloseTo(6825.24, 2);
    expect(loaded.totalDeducoes).toBeCloseTo(33_000, 2);
    // …but claiming a saving from deductions that changed nothing would be a lie.
    expect(loaded.economia.total).toBe(0);
  });

  it("computes a finite withholding under either regime", () => {
    for (const salarioBrutoMensal of [0, 1621, 5000, 15_000, 50_000]) {
      for (const regimeSimplificado of [false, true]) {
        const result = salario({ salarioBrutoMensal, regimeSimplificado });

        expect(Number.isFinite(result.descIrpfEstimado)).toBe(true);
        expect(result.descIrpfEstimado).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("calculateSalarioLiquido — benefits and other deductions", () => {
  const salarioBrutoMensal = 5000;
  const plain = salario({ salarioBrutoMensal });

  it("adds the meal allowance outside the taxable salary", () => {
    const result = salario({ salarioBrutoMensal, temValeRefeicao: true });

    expect(result.beneficiosNaoTributaveis).toBe(360);
    expect(result.salarioLiquidoMensal).toBeCloseTo(plain.salarioLiquidoMensal, 6);
    expect(result.rendimentoTotalMensal).toBeCloseTo(plain.salarioLiquidoMensal + 360, 6);
  });

  it("takes the transport allowance off the net, capped", () => {
    const result = salario({ salarioBrutoMensal, temValeTransporte: true });

    expect(result.descValeTransporte).toBe(250); // 6% of 5.000 is 300, above the cap
    expect(salario({ salarioBrutoMensal: 3000, temValeTransporte: true }).descValeTransporte).toBe(
      180,
    );
    expect(result.beneficiosNaoTributaveis).toBe(0);
    expect(result.salarioLiquidoMensal).toBeCloseTo(plain.salarioLiquidoMensal - 250, 6);
  });

  it("takes the union due off the net", () => {
    const result = salario({ salarioBrutoMensal, temSindicato: true });

    expect(result.descSindicato).toBeCloseTo(16.5, 2);
    expect(result.descValeTransporte).toBe(0);
    expect(result.beneficiosNaoTributaveis).toBe(0);
    expect(result.salarioLiquidoMensal).toBeCloseTo(plain.salarioLiquidoMensal - 16.5, 2);
  });

  it("leaves all three off when none is selected", () => {
    expect(plain.beneficiosNaoTributaveis).toBe(0);
    expect(plain.descValeTransporte).toBe(0);
    expect(plain.descSindicato).toBe(0);
  });

  it("does not let any benefit change the tax", () => {
    const all = salario({
      salarioBrutoMensal,
      temValeRefeicao: true,
      temValeTransporte: true,
      temSindicato: true,
    });

    expect(all.descIrpfEstimado).toBeCloseTo(plain.descIrpfEstimado, 6);
    expect(all.descInssEmpregado).toBeCloseTo(plain.descInssEmpregado, 6);
  });
});

describe("calculateSalarioLiquido — agrees with calculateIrpf on the table and the deductions", () => {
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
    dependentes: 2,
    deducaoEducacao: 4000,
    deducaoSaude: 2000,
    deducaoPrevidenciaComplementar: 1000,
  };
  const rendaBrutaAnual = 100_000;

  const monthly = salario({ ...shared, salarioBrutoMensal: rendaBrutaAnual / 12 });
  const annual = calculateIrpf({ ...shared, rendaBrutaAnual, regimeSimplificado: false });

  it("caps education and totals the deductions identically", () => {
    expect(monthly.totalDeducoes).toBeCloseTo(annual.totalDeducoes, 6);
  });

  it("allows the same dependant amount", () => {
    expect(monthly.descDependentes).toBeCloseTo(annual.descDependentes, 6);
  });

  it("withholds the same INSS over a year", () => {
    expect(monthly.descInssEmpregado * 12).toBeCloseTo(annual.descInss, 6);
  });

  it("reaches the same annual assessable base", () => {
    expect(monthly.baseImponivel).toBeCloseTo(annual.baseImponivel, 6);
  });

  /** Keeps this comparison honest about which half of the legislation it reaches. */
  it("sits above both phase-outs, so neither reduction is in play", () => {
    expect(monthly.reducaoLei15270).toBe(0);
    expect(annual.reducaoLei15270).toBe(0);
  });

  /**
   * The monthly and annual tables are the same table: every annual boundary is
   * twelve times its monthly one. The published parcels are each rounded to the
   * centavo independently, so twelve monthly withholdings land within a few
   * centavos of the annual assessment rather than exactly on it — measured here
   * at R$ 0,16.
   */
  it("produces the same tax over a year, to within the parcels' own rounding", () => {
    expect(monthly.irpfPelaTabela * 12).toBeCloseTo(annual.irpfPelaTabela, 0);
  });
});

describe("calculateSalarioLiquido — degenerate input", () => {
  it("returns zeros for a zero salary without producing NaN", () => {
    const result = salario({ salarioBrutoMensal: 0 });

    for (const [field, value] of Object.entries(result)) {
      if (typeof value === "number") {
        expect(Number.isNaN(value), `${field} is NaN`).toBe(false);
        expect(value, `${field} is not zero`).toBe(0);
      }
    }

    expect(result.economia).toEqual({ comDependentes: 0, comDeducoes: 0, total: 0 });
  });

  it("clamps a negative salary to zero rather than paying the worker tax back", () => {
    const result = salario({ salarioBrutoMensal: -5000 });

    expect(result.salarioBrutoMensal).toBe(0);
    expect(result.salarioLiquidoMensal).toBe(0);
    expect(result.descIrpfEstimado).toBe(0);
  });

  it("reports a zero effective rate at a zero salary instead of dividing by zero", () => {
    expect(salario({ salarioBrutoMensal: 0 }).aliquotaEfetivaIrpf).toBe(0);
  });
});
