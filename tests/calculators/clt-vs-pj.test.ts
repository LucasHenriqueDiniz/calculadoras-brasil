import { describe, expect, it } from "vitest";
import {
  calculateCltVsPj,
  type CltVsPjInput,
  type CltVsPjResult,
} from "../../src/lib/calculators/cltVsPj";
import { TETO_INSS, calcularInssEmpregado } from "../../src/lib/calculators/inss-constants";

const BASELINE: CltVsPjInput = {
  salarioCltBruto: 8_000,
  propostaPjMensal: 12_000,
  dependentes: 0,
  despesasDedutivelsPj: 0,
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
 * The two sides share one implementation of the monthly table but reach it from
 * different income, so the table tests run against both. `grossForBase` maps an
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
        (salarioCltBruto) => compare({ salarioCltBruto }).detalhesClt.baseIrpf < base,
        0,
        base * 2 + 20_000,
      ),
    detail: (gross: number) => compare({ salarioCltBruto: gross }).detalhesClt,
    net: (gross: number) => compare({ salarioCltBruto: gross }).cltLiquido,
  },
  {
    name: "PJ",
    // The invoice less the 20% pró-labore contribution, with no expenses.
    grossForBase: (base: number) => base / 0.8,
    detail: (gross: number) => compare({ propostaPjMensal: gross }).detalhesPj,
    net: (gross: number) => compare({ propostaPjMensal: gross }).pjLiquido,
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
function crossoverProposal(salarioCltBruto: number): number {
  return bisect(
    (propostaPjMensal) => compare({ salarioCltBruto, propostaPjMensal }).analise.cltMelhor,
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
    const below = path.detail(path.grossForBase(boundary)).irpfPelaTabela;
    const above = path.detail(path.grossForBase(boundary + 0.01)).irpfPelaTabela;

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
    const taxAt = (base: number) => path.detail(path.grossForBase(base)).irpfPelaTabela;

    expect((taxAt(upper) - taxAt(lower)) / (upper - lower)).toBeCloseTo(rate, 3);
  });

  it("charges nothing at all below the first bracket", () => {
    expect(path.detail(path.grossForBase(1_000)).irpfPelaTabela).toBe(0);
    expect(path.detail(path.grossForBase(BRACKET_BOUNDARIES[0] - 0.01)).irpfPelaTabela).toBe(0);
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
  it.each([2_000, 4_000, 8_000, 30_000])("withholds the payslip INSS on %s", (salarioCltBruto) => {
    expect(compare({ salarioCltBruto }).detalhesClt.descInss).toBeCloseTo(
      calcularInssEmpregado(salarioCltBruto),
      2,
    );
  });

  it("stops the contribution at the RGPS ceiling", () => {
    const ceiling = calcularInssEmpregado(TETO_INSS);

    expect(compare({ salarioCltBruto: 30_000 }).detalhesClt.descInss).toBeCloseTo(ceiling, 2);
  });

  /**
   * R$ 4.000 a month. INSS takes R$ 368,60, so the base is R$ 3.631,40, and the
   * 15% row of the monthly table charges 3.631,40 × 0,15 − 394,16 = R$ 150,55.
   * The Lei 15.270/2025 reduction covers up to R$ 312,89 at this income, so the
   * withholding is nil and the net is the gross less INSS.
   */
  it("leaves a R$ 4.000 salary untaxed, which is what Lei 15.270/2025 is for", () => {
    const { detalhesClt, cltLiquido } = compare({ salarioCltBruto: 4_000 });

    expect(detalhesClt.irpfPelaTabela).toBe(150.55);
    expect(detalhesClt.reducaoLei15270).toBe(150.55);
    expect(detalhesClt.descIrpf).toBe(0);
    expect(cltLiquido).toBe(3631.4);
  });

  /**
   * R$ 8.000 a month, past the reduction's R$ 7.350 phase-out. INSS takes
   * R$ 921,51, so the base is R$ 7.078,49, and the top row charges
   * 7.078,49 × 0,275 − 908,73 = R$ 1.037,85 with nothing taken off it.
   */
  it("withholds R$ 1.037,85 on a R$ 8.000 salary, where the reduction no longer reaches", () => {
    const { detalhesClt, cltLiquido } = compare({ salarioCltBruto: 8_000 });

    expect(detalhesClt.irpfPelaTabela).toBe(1037.85);
    expect(detalhesClt.reducaoLei15270).toBe(0);
    expect(cltLiquido).toBe(6040.64);
  });

  /**
   * ⚠️ The headline must contain the tax the breakdown reports. Dropping the
   * withholding from this one subtraction is invisible to every property test in
   * this file — the result stays monotone, smooth and self-consistent — and the
   * page then prints a net nobody receives.
   */
  it.each([2_000, 4_000, 8_000, 20_000])("nets %s down by both withholdings", (salarioCltBruto) => {
    const { detalhesClt, cltLiquido } = compare({ salarioCltBruto });

    expect(cltLiquido).toBeCloseTo(
      salarioCltBruto - detalhesClt.descInss - detalhesClt.descIrpf,
      2,
    );
  });

  /**
   * ⚠️ The benefit package is the page's whole thesis: "é comum ser preciso
   * faturar entre 25% e 40% a mais como PJ". It is 13º salary (1/12) plus 15% of
   * the gross for FGTS, holiday pay with its third and the usual allowances.
   * Pinned as a value, not as "some positive constant" — every constant is
   * positive and scale-invariant, so that assertion held for all of them.
   */
  it("amortises the benefits at one twelfth plus 15% of the gross", () => {
    const result = compare({ salarioCltBruto: 8_000 });

    expect(result.detalhesClt.beneficios).toBeCloseTo(8_000 * (1 / 12 + 0.15), 6);
    expect(result.detalhesClt.beneficios).toBeCloseTo(1866.67, 2);
    expect(result.cltComBeneficios).toBe(7907.31);
  });

  it("adds those benefits on top of the net, and nothing else", () => {
    const result = compare({ salarioCltBruto: 11_000 });

    expect(result.cltComBeneficios).toBeCloseTo(
      result.cltLiquido + result.detalhesClt.beneficios,
      2,
    );
  });
});

/**
 * `dependentes` is published input that nothing read: the CLT tax ignored it, so
 * the field could only ever be decoration. It is wired into the CLT withholding
 * base here — the route hardcodes it to 0 and offers no control, but removing it
 * from the interface would have to change the route, and the allowance is the
 * one deduction a comparison like this cannot get from the PJ side.
 */
describe("calculateCltVsPj — dependants", () => {
  it.each([
    { dependentes: 1, allowance: 189.59 },
    { dependentes: 3, allowance: 568.77 },
  ])("takes R$ $allowance off the CLT base for $dependentes", ({ dependentes, allowance }) => {
    const none = compare({ salarioCltBruto: 8_000, dependentes: 0 });
    const some = compare({ salarioCltBruto: 8_000, dependentes });

    expect(none.detalhesClt.baseIrpf - some.detalhesClt.baseIrpf).toBeCloseTo(allowance, 2);
  });

  it("turns the allowance into tax at the marginal rate, and into net pay", () => {
    const none = compare({ salarioCltBruto: 8_000, dependentes: 0 });
    const one = compare({ salarioCltBruto: 8_000, dependentes: 1 });

    // 189,59 sheltered from the top row: 189,59 × 0,275 = 52,14.
    expect(none.detalhesClt.descIrpf - one.detalhesClt.descIrpf).toBeCloseTo(52.14, 1);
    expect(one.cltLiquido).toBeGreaterThan(none.cltLiquido);
  });

  it("never touches the PJ side, which shelters income with expenses instead", () => {
    const none = compare({ dependentes: 0 });
    const three = compare({ dependentes: 3 });

    expect(three.pjLiquido).toBe(none.pjLiquido);
    expect(three.pjNecessaria).toBeGreaterThan(none.pjNecessaria);
  });

  it("treats a negative count as none rather than as a surcharge", () => {
    expect(compare({ dependentes: -2 }).cltLiquido).toBe(compare({ dependentes: 0 }).cltLiquido);
  });
});

describe("calculateCltVsPj — the PJ side", () => {
  /**
   * R$ 8.000 invoiced. 20% pró-labore contribution and a 5% accounting fee, so
   * the base is R$ 6.400 and the top row charges 6.400 × 0,275 − 908,73 =
   * R$ 851,27, past the reduction's reach.
   */
  it("nets R$ 5.148,73 out of a R$ 8.000 invoice", () => {
    const { detalhesPj, pjLiquido } = compare({ propostaPjMensal: 8_000 });

    expect(detalhesPj.descInss).toBeCloseTo(1_600, 2);
    expect(detalhesPj.descContador).toBeCloseTo(400, 2);
    expect(detalhesPj.irpfPelaTabela).toBe(851.27);
    expect(detalhesPj.reducaoLei15270).toBe(0);
    expect(pjLiquido).toBe(5148.73);
  });

  /**
   * R$ 4.000 invoiced: a base of R$ 3.200 in the 15% row charges
   * 3.200 × 0,15 − 394,16 = R$ 85,84, which the reduction covers in full.
   */
  it("applies the same Lei 15.270/2025 reduction to a small invoice", () => {
    const { detalhesPj, pjLiquido } = compare({ propostaPjMensal: 4_000 });

    expect(detalhesPj.irpfPelaTabela).toBe(85.84);
    expect(detalhesPj.reducaoLei15270).toBe(85.84);
    expect(detalhesPj.descIrpf).toBe(0);
    expect(pjLiquido).toBe(3_000);
  });

  /** ⚠️ The PJ twin of the CLT wiring test above, and the same silent failure. */
  it.each([2_000, 4_000, 8_000, 20_000])("nets %s down by all three costs", (propostaPjMensal) => {
    const { detalhesPj, pjLiquido } = compare({ propostaPjMensal });

    expect(pjLiquido).toBeCloseTo(
      propostaPjMensal - detalhesPj.descInss - detalhesPj.descContador - detalhesPj.descIrpf,
      2,
    );
  });

  /**
   * A deductible expense can only shelter income from tax. It can never raise
   * the net by more than it costs — a shield worth more than the expense would
   * be a money pump — and it can never lower it either.
   */
  it.each([500, 2_000, 5_000, 20_000])(
    "shelters tax with %s of expenses, and no more",
    (despesasDedutivelsPj) => {
      const withoutExpenses = compare({ propostaPjMensal: 15_000, despesasDedutivelsPj: 0 });
      const withExpenses = compare({ propostaPjMensal: 15_000, despesasDedutivelsPj });
      const gain = withExpenses.pjLiquido - withoutExpenses.pjLiquido;

      expect(gain).toBeGreaterThanOrEqual(0);
      expect(gain).toBeLessThanOrEqual(despesasDedutivelsPj);
    },
  );

  /**
   * Once expenses have taken the tax to zero there is nothing left to shelter,
   * so the net stops moving — and stops exactly at the invoice less the
   * contribution and the fee.
   */
  it("stops rewarding expenses once the tax is already zero", () => {
    const propostaPjMensal = 8_000;
    const large = compare({ propostaPjMensal, despesasDedutivelsPj: 50_000 }).pjLiquido;
    const larger = compare({ propostaPjMensal, despesasDedutivelsPj: 100_000 }).pjLiquido;

    expect(larger).toBe(large);
    expect(large).toBe(6_000);
  });

  it("treats a negative expense as none", () => {
    expect(compare({ despesasDedutivelsPj: -1_000 }).pjLiquido).toBe(
      compare({ despesasDedutivelsPj: 0 }).pjLiquido,
    );
  });
});

describe("calculateCltVsPj — the break-even proposal", () => {
  /**
   * ⚠️ `pjNecessaria` is the single number the page promises in prose: "seria
   * preciso faturar cerca de R$ X por mês como PJ para chegar ao mesmo ganho
   * líquido". A PJ invoicing exactly that must land on the CLT package — not
   * near it, on it, since the search solves for the figure instead of stepping
   * towards it in R$ 100 jumps.
   */
  it.each([3_000, 8_000, 15_000, 25_000])(
    "names the invoice that matches a %s salary",
    (salarioCltBruto) => {
      const result = compare({ salarioCltBruto });
      const atThatInvoice = compare({ salarioCltBruto, propostaPjMensal: result.pjNecessaria });

      expect(atThatInvoice.pjLiquido).toBe(result.cltComBeneficios);
    },
  );

  it.each([3_000, 8_000, 15_000, 25_000])(
    "names the smallest such invoice for %s",
    (salarioCltBruto) => {
      const result = compare({ salarioCltBruto });
      const aCentavoLess = compare({
        salarioCltBruto,
        propostaPjMensal: result.pjNecessaria - 0.01,
      });

      expect(aCentavoLess.pjLiquido).toBeLessThan(result.cltComBeneficios);
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
    (propostaPjMensal) => {
      const reference = compare({ salarioCltBruto: 8_000, propostaPjMensal: 1 }).pjNecessaria;

      expect(compare({ salarioCltBruto: 8_000, propostaPjMensal }).pjNecessaria).toBe(reference);
    },
  );

  it("does depend on the expenses, which are part of the question", () => {
    const withoutExpenses = compare({ despesasDedutivelsPj: 0 }).pjNecessaria;
    const withExpenses = compare({ despesasDedutivelsPj: 3_000 }).pjNecessaria;

    expect(withExpenses).toBeLessThan(withoutExpenses);
  });

  it("asks for nothing when there is no CLT package to match", () => {
    expect(compare({ salarioCltBruto: 0 }).pjNecessaria).toBe(0);
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
    (salarioCltBruto) => {
      const crossover = crossoverProposal(salarioCltBruto);

      // Both sides are rounded to the centavo, so the flip lands within one of zero.
      expect(
        Math.abs(compare({ salarioCltBruto, propostaPjMensal: crossover }).diferenca),
      ).toBeLessThanOrEqual(0.01);
      expect(compare({ salarioCltBruto, propostaPjMensal: crossover - 10 }).analise.cltMelhor).toBe(
        true,
      );
      expect(compare({ salarioCltBruto, propostaPjMensal: crossover + 10 }).analise.cltMelhor).toBe(
        false,
      );
    },
  );

  /**
   * ⚠️ The exact tie, which `pjNecessaria` puts within reach: invoicing the
   * break-even figure makes the difference exactly zero. Neither side is ahead
   * there, so the badge must not claim CLT is — and the prose must say so too,
   * rather than announcing a 0% advantage for whichever side the comparison
   * happens to fall on.
   */
  it("calls an exact tie a tie, on neither side", () => {
    const salarioCltBruto = 8_000;
    const { pjNecessaria } = compare({ salarioCltBruto });
    const tie = compare({ salarioCltBruto, propostaPjMensal: pjNecessaria });

    expect(tie.diferenca).toBe(0);
    expect(tie.analise.cltMelhor).toBe(false);
    expect(tie.analise.justificativa).toMatch(/empatam/);
  });

  /**
   * ⚠️ The badge and the prose are two renderings of one verdict, printed side
   * by side. Read apart, an inverted branch shows "CLT é melhor" above a
   * paragraph explaining how much better PJ is, and no assertion notices.
   */
  it.each([
    { scenario: "CLT ahead", propostaPjMensal: 5_000, cltMelhor: true, opening: /^CLT é/ },
    { scenario: "PJ ahead", propostaPjMensal: 20_000, cltMelhor: false, opening: /^PJ é/ },
  ])(
    "says in prose what the badge says, with $scenario",
    ({ propostaPjMensal, cltMelhor, opening }) => {
      const { analise } = compare({ salarioCltBruto: 8_000, propostaPjMensal });

      expect(analise.cltMelhor).toBe(cltMelhor);
      expect(analise.justificativa).toMatch(opening);
    },
  );

  /**
   * ⚠️ When CLT wins, the prose names the invoice a PJ would need. It has to be
   * the same figure the table beside it prints: the two disagreed for every
   * input, because the prose read a search that never converged.
   */
  it("quotes the break-even invoice the page prints beside it", () => {
    const result = compare({ salarioCltBruto: 8_000, propostaPjMensal: 5_000 });

    expect(result.analise.cltMelhor).toBe(true);
    expect(result.analise.justificativa).toContain(result.pjNecessaria.toFixed(0));
  });

  it.each([4_000, 9_000, 13_000, 25_000])(
    "agrees on which side is ahead at %s",
    (propostaPjMensal) => {
      const result = compare({ propostaPjMensal });

      expect(result.percentualDiferenca < 0).toBe(result.analise.cltMelhor);
      expect(result.diferenca < 0).toBe(result.analise.cltMelhor);
    },
  );

  it.each([4_000, 13_000, 25_000])(
    "reports the yearly gap at %s as twelve monthly ones",
    (propostaPjMensal) => {
      const { analise } = compare({ propostaPjMensal });

      expect(analise.diferencaMensal).toBeGreaterThanOrEqual(0);
      expect(analise.diferencaAnual).toBeCloseTo(analise.diferencaMensal * 12, 2);
    },
  );
});

describe("calculateCltVsPj — degenerate input", () => {
  /**
   * ⚠️ Both fields are plain currency inputs with no floor, so a visitor who
   * clears them reaches this. `percentualDiferenca` was 0/0 here, and the number
   * lands in the page twice: in the "Diferença: %" label and inside the
   * Portuguese justificativa.
   */
  it("does not produce a NaN percentage when both sides are zero", () => {
    const result = compare({ salarioCltBruto: 0, propostaPjMensal: 0 });

    expect(Number.isNaN(result.percentualDiferenca)).toBe(false);
    expect(result.analise.justificativa).not.toMatch(/NaN/);
  });

  /**
   * ⚠️ Same field, the other degenerate case: any PJ offer against a zero CLT
   * salary divided by zero and rendered as "PJ é Infinity% mais vantajoso".
   */
  it("does not produce an infinite percentage when the CLT salary is zero", () => {
    const result = compare({ salarioCltBruto: 0, propostaPjMensal: 5_000 });

    expect(Number.isFinite(result.percentualDiferenca)).toBe(true);
    expect(result.analise.justificativa).not.toMatch(/Infinity/);
    expect(result.analise.justificativa).toMatch(/^PJ é mais vantajoso/);
  });

  it("keeps every returned figure finite for ordinary input", () => {
    const result = compare({ salarioCltBruto: 7_500, propostaPjMensal: 11_000 });

    for (const value of [
      result.cltLiquido,
      result.cltComBeneficios,
      result.pjLiquido,
      result.diferenca,
      result.percentualDiferenca,
      result.pjNecessaria,
      result.analise.diferencaMensal,
      result.analise.diferencaAnual,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("echoes the input back untouched", () => {
    const result = compare({ salarioCltBruto: 7_500, propostaPjMensal: 11_000 });

    expect(result.salarioCltBruto).toBe(7_500);
    expect(result.propostaPjMensal).toBe(11_000);
  });

  it("floors negative income at zero instead of paying a negative tax", () => {
    const result = compare({ salarioCltBruto: -5_000, propostaPjMensal: -5_000 });

    expect(result.salarioCltBruto).toBe(0);
    expect(result.propostaPjMensal).toBe(0);
    expect(result.cltLiquido).toBe(0);
    expect(result.pjLiquido).toBe(0);
  });
});
