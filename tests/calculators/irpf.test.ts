import { describe, expect, it } from "vitest";
import { calculateIrpf, type IrpfInput } from "../../src/lib/calculators/irpf";
import { TETO_INSS, calcularInssEmpregado } from "../../src/lib/calculators/inss-constants";

/**
 * The declared boundaries of IRPF_TABLE_2026, as the upper bound of each bracket.
 * Read from src/lib/calculators/irpf.ts, not from the legislation: these tests
 * check the table against itself, so they hold whichever year is in force.
 */
const BRACKET_BOUNDARIES = [29145.6, 33919.8, 45012.6, 55976.16];

const NO_DEDUCTIONS: Omit<IrpfInput, "rendaBrutaAnual"> = {
  dependentes: 0,
  deducaoEducacao: 0,
  deducaoSaude: 0,
  deducaoPrevidenciaComplementar: 0,
  regimeSimplificado: false,
};

function irpf(input: Partial<IrpfInput> & { rendaBrutaAnual: number }) {
  return calculateIrpf({ ...NO_DEDUCTIONS, ...input });
}

/**
 * Gross income whose assessable base is `base`, with no deductions and no
 * dependants.
 *
 * ⚠️ This used to be `base / 0.9`, which was only right while INSS was a flat
 * 10%. It is progressive and capped, so the mapping is no longer a division —
 * and a stale helper here would leave every boundary test probing the wrong
 * base while still passing. Income to base is strictly increasing (the marginal
 * INSS rate is below 1), so bisection is exact enough.
 */
function incomeForBase(base: number): number {
  let low = base;
  let high = base * 2 + 200_000;

  for (let step = 0; step < 200; step += 1) {
    const middle = (low + high) / 2;
    if (irpf({ rendaBrutaAnual: middle }).baseImponivel < base) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}

function taxAtBase(base: number): number {
  return irpf({ rendaBrutaAnual: incomeForBase(base) }).irpfCalculado;
}

describe("calculateIrpf — exemption band", () => {
  it("charges nothing below the first bracket", () => {
    expect(taxAtBase(0)).toBe(0);
    expect(taxAtBase(10_000)).toBe(0);
    expect(taxAtBase(BRACKET_BOUNDARIES[0] - 0.01)).toBe(0);
  });

  it("reports the exempt band as 'Isento' rather than a percentage", () => {
    expect(irpf({ rendaBrutaAnual: 10_000 }).aliquotaMarginal).toBe("Isento");
  });
});

describe("calculateIrpf — the progressive table is self-consistent", () => {
  /**
   * A progressive table with deduction parcels is continuous by construction:
   * the parcel exists precisely so that tax computed from either side of a
   * boundary agrees. A jump means the parcel is wrong, whatever the legislation
   * says the rates are.
   */
  it.each(BRACKET_BOUNDARIES)("does not jump across the boundary at %s", (boundary) => {
    const below = taxAtBase(boundary);
    const above = taxAtBase(boundary + 0.01);

    expect(above - below).toBeGreaterThan(-0.01);
    expect(Math.abs(above - below)).toBeLessThan(1);
  });

  /**
   * The single property every income tax must have: earning more never leaves
   * you with more tax deducted than someone who earned less. Swept finely
   * around each boundary, which is the only place it can break.
   */
  it.each(BRACKET_BOUNDARIES)("never charges less for more income near %s", (boundary) => {
    let previous = -Infinity;

    for (let base = boundary - 0.02; base <= boundary + 0.02; base += 0.005) {
      const tax = taxAtBase(base);
      expect(tax).toBeGreaterThanOrEqual(previous - 0.005);
      previous = tax;
    }
  });

  /**
   * The marginal rate only ever climbs. This is what an unclassified base breaks:
   * before 2026-09-04 the brackets ended at .34 and resumed at .35, so a base
   * between them matched nothing and took the last bracket's 27.5% — a spike that
   * then dropped back to 15% one centavo later.
   */
  it("applies a rate to every base, and that rate never goes down", () => {
    const marginalRateAt = (base: number) =>
      Number.parseFloat(irpf({ rendaBrutaAnual: incomeForBase(base) }).aliquotaMarginal) || 0;

    let previous = 0;

    for (const boundary of BRACKET_BOUNDARIES) {
      for (const base of [boundary - 0.01, boundary, boundary + 0.005, boundary + 0.01]) {
        const rate = marginalRateAt(base);
        expect(rate).toBeGreaterThanOrEqual(previous);
        previous = rate;
      }
    }
  });
});

describe("calculateIrpf — INSS withheld", () => {
  it("never deducts more INSS than the RGPS ceiling allows", () => {
    const annualCeiling = calcularInssEmpregado(TETO_INSS) * 12;

    expect(irpf({ rendaBrutaAnual: 500_000 }).descInss).toBeLessThanOrEqual(annualCeiling + 0.01);
  });

  it("deducts the progressive contribution below the ceiling, not a flat rate", () => {
    const rendaBrutaAnual = 50_000;
    const expected = calcularInssEmpregado(rendaBrutaAnual / 12) * 12;

    expect(irpf({ rendaBrutaAnual }).descInss).toBeCloseTo(expected, 2);

    // The point of the change: this is NOT the 10% the module used to charge.
    expect(irpf({ rendaBrutaAnual }).descInss).not.toBeCloseTo(5_000, 2);
  });
});

describe("calculateIrpf — itemised deductions", () => {
  it("caps education at the documented limit", () => {
    expect(irpf({ rendaBrutaAnual: 100_000, deducaoEducacao: 1_000 }).deducaoEducacao).toBe(1_000);
    expect(irpf({ rendaBrutaAnual: 100_000, deducaoEducacao: 99_999 }).deducaoEducacao).toBe(
      3561.5,
    );
  });

  it("caps health, which the module itself flags as having no legal cap", () => {
    expect(irpf({ rendaBrutaAnual: 100_000, deducaoSaude: 1_000 }).deducaoSaude).toBe(1_000);
    expect(irpf({ rendaBrutaAnual: 100_000, deducaoSaude: 99_999 }).deducaoSaude).toBe(2666.67);
  });

  it("does not cap supplementary pension, and floors it at zero", () => {
    expect(
      irpf({ rendaBrutaAnual: 100_000, deducaoPrevidenciaComplementar: 50_000 })
        .deducaoPrevidenciaComplementar,
    ).toBe(50_000);
    expect(
      irpf({ rendaBrutaAnual: 100_000, deducaoPrevidenciaComplementar: -5_000 })
        .deducaoPrevidenciaComplementar,
    ).toBe(0);
  });

  it("sums the three capped amounts, not the three raw ones", () => {
    const result = irpf({
      rendaBrutaAnual: 100_000,
      deducaoEducacao: 99_999,
      deducaoSaude: 99_999,
      deducaoPrevidenciaComplementar: 5_000,
    });

    expect(result.totalDeducoes).toBeCloseTo(3561.5 + 2666.67 + 5_000, 2);
  });

  it("never drives the calculation base below zero", () => {
    const result = irpf({ rendaBrutaAnual: 10_000, deducaoPrevidenciaComplementar: 999_999 });

    expect(result.baseCalculoCompleta).toBe(0);
    expect(result.irpfCalculado).toBe(0);
  });
});

describe("calculateIrpf — dependants", () => {
  it("deducts a flat amount per dependant, uncapped in count", () => {
    expect(irpf({ rendaBrutaAnual: 100_000, dependentes: 0 }).descDependentes).toBe(0);
    expect(irpf({ rendaBrutaAnual: 100_000, dependentes: 1 }).descDependentes).toBeCloseTo(
      2275.08,
      2,
    );
    expect(irpf({ rendaBrutaAnual: 100_000, dependentes: 3 }).descDependentes).toBeCloseTo(
      6825.24,
      2,
    );
  });

  it("lowers the tax as dependants are added", () => {
    const none = irpf({ rendaBrutaAnual: 100_000, dependentes: 0 }).irpfCalculado;
    const one = irpf({ rendaBrutaAnual: 100_000, dependentes: 1 }).irpfCalculado;
    const three = irpf({ rendaBrutaAnual: 100_000, dependentes: 3 }).irpfCalculado;

    expect(one).toBeLessThan(none);
    expect(three).toBeLessThan(one);
  });

  it("rejects a negative dependant count", () => {
    expect(() => irpf({ rendaBrutaAnual: 100_000, dependentes: -1 })).toThrow(
      /dependants cannot be negative/i,
    );
  });
});

describe("calculateIrpf — the two regimes", () => {
  it("computes both regimes for the same input", () => {
    const full = irpf({ rendaBrutaAnual: 100_000, regimeSimplificado: false });
    const simplified = irpf({ rendaBrutaAnual: 100_000, regimeSimplificado: true });

    expect(Number.isFinite(full.irpfCalculado)).toBe(true);
    expect(Number.isFinite(simplified.irpfCalculado)).toBe(true);
  });

  /**
   * The module's own comment says the simplified discount runs "up to the
   * allowed cap". A percentage with no ceiling is not a capped discount, and at
   * high incomes the difference is the whole point of the cap existing.
   */
  it("caps the simplified discount instead of scaling it without limit", () => {
    const modest = irpf({ rendaBrutaAnual: 100_000, regimeSimplificado: true });
    const large = irpf({ rendaBrutaAnual: 1_000_000, regimeSimplificado: true });

    const modestDiscount = 100_000 - modest.baseCalculoSimplificada;
    const largeDiscount = 1_000_000 - large.baseCalculoSimplificada;

    expect(largeDiscount).toBeCloseTo(modestDiscount, 2);
  });

  /**
   * The simplified discount replaces every other deduction the legislation allows,
   * dependants included. Subtracting both takes one of them twice.
   * See docs/research/2026-09-04-irpf-2026-table/research.md, Findings 5.
   */
  it("discounts exactly 20% where the ceiling does not bind", () => {
    const rendaBrutaAnual = 50_000;
    const result = irpf({ rendaBrutaAnual, regimeSimplificado: true });

    // 20% of 50.000 is 10.000, well under the 17.640 ceiling.
    expect(rendaBrutaAnual - result.baseCalculoSimplificada).toBeCloseTo(10_000, 2);
  });

  it("ignores dependants under the simplified regime", () => {
    const none = irpf({ rendaBrutaAnual: 100_000, regimeSimplificado: true, dependentes: 0 });
    const two = irpf({ rendaBrutaAnual: 100_000, regimeSimplificado: true, dependentes: 2 });

    expect(two.irpfCalculado).toBe(none.irpfCalculado);
  });
});

describe("calculateIrpf — degenerate input", () => {
  it("returns zeros for zero income without producing NaN", () => {
    const result = irpf({ rendaBrutaAnual: 0 });

    expect(result.irpfCalculado).toBe(0);
    expect(result.irpfDevido).toBe(0);
    expect(result.aliquotaEfetiva).toBe(0);
    expect(Number.isNaN(result.aliquotaEfetiva)).toBe(false);
  });

  it("rejects negative income rather than returning a negative tax", () => {
    expect(() => irpf({ rendaBrutaAnual: -1 })).toThrow(/income cannot be negative/i);
  });

  it("never returns a negative tax due", () => {
    for (const rendaBrutaAnual of [0, 1, 10_000, 50_000, 250_000]) {
      expect(irpf({ rendaBrutaAnual }).irpfDevido).toBeGreaterThanOrEqual(0);
    }
  });
});
