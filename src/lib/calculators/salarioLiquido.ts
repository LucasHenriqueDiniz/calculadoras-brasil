/**
 * Net salary calculator.
 * Turns a gross salary into a net one, accounting for IRPF, INSS and union dues.
 *
 * This module answers a MONTHLY question — what lands in the bank account this
 * month — so it computes the monthly withholding (IRRF) rather than the annual
 * adjustment. That choice decides which half of the 2026 legislation applies:
 * the monthly incidence table and the monthly Lei 15.270/2025 reduction, both of
 * which differ from their annual counterparts by more than a factor of twelve.
 *
 * Figures, sources and the arithmetic that cross-checks them:
 * docs/research/2026-09-04-irpf-2026-table/research.md
 */

import { calcularInssEmpregado } from "./inss-constants";

export interface SalarioLiquidoInput {
  salarioBrutoMensal: number;
  /** Annual amounts: they feed the annual deduction chain, not the monthly one. */
  dependentes: number;
  deducaoEducacao: number;
  deducaoSaude: number;
  deducaoPrevidenciaComplementar: number;
  temValeRefeicao: boolean;
  temValeTransporte: boolean;
  temSindicato: boolean;
  /**
   * Desconto simplificado instead of the itemised deductions above. It replaces
   * every one of them, dependants included — see `calculateSalarioLiquido`.
   */
  regimeSimplificado: boolean;
}

export interface SalarioLiquidoResult {
  salarioBrutoMensal: number;
  salarioBrutoAnual: number;
  descInssEmpregado: number;
  baseParaIrpf: number;
  /** Annual total of the three itemised deductions, after their caps and floors. */
  totalDeducoes: number;
  /** Annual dependant allowance. Reported even under the simplified regime, where it does not apply. */
  descDependentes: number;
  /** Annual itemised assessable base. Not what the simplified regime taxes. */
  baseImponivel: number;
  /** The monthly base actually taken to the table, whichever regime is in force. */
  baseImponivelMensal: number;
  /** What the monthly table produces, before the Lei 15.270/2025 reduction. */
  irpfPelaTabela: number;
  /** The monthly Lei 15.270/2025 reduction applied, never more than the tax due. */
  reducaoLei15270: number;
  descIrpfEstimado: number;
  descSindicato: number;
  descValeTransporte: number;
  salarioLiquidoMensal: number;
  salarioLiquidoAnual: number;
  beneficiosNaoTributaveis: number;
  rendimentoTotalMensal: number;
  aliquotaEfetivaIrpf: number;
  economia: {
    comDependentes: number;
    comDeducoes: number;
    total: number;
  };
}

/**
 * Official monthly incidence table from January 2026, Receita Federal.
 * Each bracket carries only its upper bound, so no base can fall between two of
 * them — the gap the annual table in this file used to have.
 *
 * Exported so the tests probe these boundaries rather than a hand copy of them.
 * A copy drifts silently: the suite goes on asserting continuity and monotonicity
 * at figures the module no longer uses, and passes. Exporting the array is the
 * whole seam — the tests need the boundaries, not a way to replace them.
 */
export const IRPF_MONTHLY_TABLE_2026 = [
  { upTo: 2428.8, rate: 0.0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
  { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
  { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
  { upTo: Infinity, rate: 0.275, deduction: 908.73 },
] as const;

// 2026 constants. The deduction inputs are annual, so these are the annual figures.
const DEDUCTION_PER_DEPENDENT = 2275.08;
const MAX_DEDUCTION_EDUCATION = 3561.5;

// Desconto simplificado, monthly. Only half of this is sourced, so the two halves
// are labelled rather than presented as one figure from the research note.
//
// SOURCED — the R$ 607,20 ceiling. The Receita's own monthly table states
// "Limite do desconto simplificado: R$ 607,20" and nothing more
// (fetches/receita-federal-tabelas-2026.md). Note it is NOT the annual ceiling
// divided by twelve (17.640,00 / 12 = 1.470,00), which is why it is stated
// separately from irpf.ts.
//
// INFERRED — the 20% rate. No monthly source read for that research gives any
// percentage at all; 20% is the ANNUAL rate, carried across on the assumption
// that the monthly discount is the same proportion under a lower ceiling.
//
// The inference is free today, and provably rather than by luck: 607,20 / 0,20 is
// R$ 3.036,00, and 80% of R$ 3.036,00 is R$ 2.428,80 — the exempt ceiling itself.
// So below R$ 3.036 of gross both readings (a rate under a cap, or a flat
// R$ 607,20) leave the base inside the exemption, and above it both subtract the
// same R$ 607,20. They can never produce a different withholding. They do differ
// in `baseImponivelMensal` below R$ 3.036 — at a gross of R$ 1.000 this reading
// gives R$ 800,00 and the flat one R$ 392,80 — but no route renders that field.
// The equivalence is pinned in tests/calculators/salario-liquido.test.ts, so an
// edit that moves the rate or the ceiling apart fails there instead of shipping.
const SIMPLIFIED_DEDUCTION_RATE = 0.2;
const MAX_SIMPLIFIED_DEDUCTION_MONTHLY = 607.2;

// Lei 15.270/2025, monthly reduction (Art. 3º-A). Applied to the tax the table
// produces rather than changing the brackets, which is why no table expresses it.
const REDUCTION_FULL_UP_TO = 5000.0;
const REDUCTION_FULL_AMOUNT = 312.89;
const REDUCTION_PHASE_OUT_UP_TO = 7350.0;
const REDUCTION_PHASE_OUT_BASE = 978.62;
const REDUCTION_PHASE_OUT_RATE = 0.133145;

export function calculateSalarioLiquido(input: SalarioLiquidoInput): SalarioLiquidoResult {
  const salarioBrutoMensal = Math.max(input.salarioBrutoMensal, 0);
  const salarioBrutoAnual = salarioBrutoMensal * 12;

  // 1. employee INSS: progressive per bracket and capped at the RGPS ceiling.
  //    Each rate applies only to the slice of the salary inside its bracket.
  const descInssEmpregado = calcularInssEmpregado(salarioBrutoMensal);

  // 2. IRPF base after INSS
  const baseParaIrpf = salarioBrutoMensal - descInssEmpregado;

  // 3. annual itemised deductions.
  //    Health is uncapped on purpose: no official ceiling was found for it.
  const deducaoEducacao = Math.min(Math.max(input.deducaoEducacao, 0), MAX_DEDUCTION_EDUCATION);
  const deducaoSaude = Math.max(input.deducaoSaude, 0);
  const deducaoPrevidenciaComplementar = Math.max(input.deducaoPrevidenciaComplementar, 0);
  const totalDeducoes = deducaoEducacao + deducaoSaude + deducaoPrevidenciaComplementar;

  const baseCalculoAnual = Math.max(baseParaIrpf * 12 - totalDeducoes, 0);
  const descDependentes = Math.max(input.dependentes, 0) * DEDUCTION_PER_DEPENDENT;
  const baseImponivel = Math.max(baseCalculoAnual - descDependentes, 0);

  // 4. the monthly base the table is applied to.
  //
  //    Itemised: the annual chain above, spread evenly over the year.
  //    Simplified: the desconto simplificado REPLACES every legal deduction —
  //    INSS and dependants included — so it starts again from the gross salary.
  //    The Receita's own worked example confirms the shape: R$ 5.000,00 less the
  //    R$ 607,20 ceiling gives a base of R$ 4.392,80 — the gross less the ceiling,
  //    with no INSS taken off first.
  const baseImponivelMensal = input.regimeSimplificado
    ? Math.max(
        salarioBrutoMensal -
          Math.min(
            salarioBrutoMensal * SIMPLIFIED_DEDUCTION_RATE,
            MAX_SIMPLIFIED_DEDUCTION_MONTHLY,
          ),
        0,
      )
    : baseImponivel / 12;

  // 5. monthly IRPF withheld: the table, then the reduction on top of it.
  //
  //    Both are rounded to the centavo, because both are legally denominated in
  //    it and the reduction's first band is a centavo literal. Left in binary
  //    floating point, the statute's own exempt case misses by 1.1e-13: the table
  //    yields 312,89000000000004 where the law says 312,89, the R$ 312,89 cap
  //    then fails to cover it, and a salary the statute declares exempt is
  //    withheld a sliver of tax.
  const { rate, deduction } = findMonthlyTaxBracket(baseImponivelMensal);
  const irpfPelaTabela = roundToCentavos(Math.max(baseImponivelMensal * rate - deduction, 0));
  const reducaoLei15270 = roundToCentavos(
    monthlyReductionLei15270(salarioBrutoMensal, irpfPelaTabela),
  );
  const descIrpfEstimado = roundToCentavos(Math.max(irpfPelaTabela - reducaoLei15270, 0));

  // 6. union dues
  const descSindicato = input.temSindicato ? salarioBrutoMensal * 0.0033 : 0; // roughly one hour of pay

  // 7. transport allowance, deducted from the gross
  const descValeTransporte = input.temValeTransporte ? Math.min(salarioBrutoMensal * 0.06, 250) : 0;

  // 8. net salary
  const salarioLiquidoMensal =
    salarioBrutoMensal - descInssEmpregado - descIrpfEstimado - descSindicato - descValeTransporte;

  // 9. non-taxable benefits
  const beneficiosNaoTributaveis = input.temValeRefeicao ? 360 : 0; // roughly R$ 360/month in meal allowance

  // 10. monthly share of what the itemised deductions took off the base.
  //     Zero under the simplified regime, where neither of them reduces anything.
  const economiaComDependentes = input.regimeSimplificado ? 0 : descDependentes / 12;
  const economiaComDeducoes = input.regimeSimplificado ? 0 : totalDeducoes / 12;

  const aliquotaEfetivaIrpf =
    salarioBrutoMensal > 0 ? (descIrpfEstimado / salarioBrutoMensal) * 100 : 0;

  return {
    salarioBrutoMensal,
    salarioBrutoAnual,
    descInssEmpregado,
    baseParaIrpf,
    totalDeducoes,
    descDependentes,
    baseImponivel,
    baseImponivelMensal,
    irpfPelaTabela,
    reducaoLei15270,
    descIrpfEstimado,
    descSindicato,
    descValeTransporte,
    salarioLiquidoMensal,
    salarioLiquidoAnual: salarioLiquidoMensal * 12,
    beneficiosNaoTributaveis,
    rendimentoTotalMensal: salarioLiquidoMensal + beneficiosNaoTributaveis,
    aliquotaEfetivaIrpf,
    economia: {
      comDependentes: economiaComDependentes,
      comDeducoes: economiaComDeducoes,
      total: economiaComDependentes + economiaComDeducoes,
    },
  };
}

/** Rounds a currency amount to the centavo, the granularity a payslip has. */
function roundToCentavos(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Monthly reduction of Lei 15.270/2025.
 *
 * ⚠️ The coefficient applies to gross monthly income, not to the calculation
 * base — the Receita's own worked example is explicit about it, and applying it
 * to the base instead is silent and wrong.
 *
 * Capped at the tax the table produced, so it can zero the withholding but never
 * turn it into a refund.
 */
function monthlyReductionLei15270(salarioBrutoMensal: number, irpfPelaTabela: number): number {
  if (salarioBrutoMensal <= REDUCTION_FULL_UP_TO) {
    return Math.min(REDUCTION_FULL_AMOUNT, irpfPelaTabela);
  }

  if (salarioBrutoMensal <= REDUCTION_PHASE_OUT_UP_TO) {
    const reducao = REDUCTION_PHASE_OUT_BASE - REDUCTION_PHASE_OUT_RATE * salarioBrutoMensal;
    return Math.min(Math.max(reducao, 0), irpfPelaTabela);
  }

  return 0;
}

/**
 * Finds the rate bracket that applies to the monthly assessable base.
 * Total by construction: the last bracket has no upper bound, so every
 * non-negative base matches exactly one.
 */
function findMonthlyTaxBracket(baseImponivelMensal: number): { rate: number; deduction: number } {
  if (baseImponivelMensal <= 0) {
    return { rate: 0, deduction: 0 };
  }

  for (const bracket of IRPF_MONTHLY_TABLE_2026) {
    if (baseImponivelMensal <= bracket.upTo) {
      return { rate: bracket.rate, deduction: bracket.deduction };
    }
  }

  // Unreachable while the last bracket's upTo is Infinity. Throwing rather than
  // returning a rate keeps a future edit to that row from silently charging 0%.
  throw new Error("IRPF bracket table does not cover the assessable base");
}
