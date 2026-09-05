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
 * The rules themselves live in `irpf-constants.ts`, alongside their sources.
 */

import { calcularInssEmpregado } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_ANNUAL,
  MAX_DEDUCTION_EDUCATION_ANNUAL,
  MAX_SIMPLIFIED_DEDUCTION_MONTHLY,
  SIMPLIFIED_DEDUCTION_RATE_MONTHLY,
  findMonthlyTaxBracket,
  monthlyReductionLei15270,
} from "./irpf-constants";
import { roundToCentavos } from "./money";

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
  const deducaoEducacao = Math.min(
    Math.max(input.deducaoEducacao, 0),
    MAX_DEDUCTION_EDUCATION_ANNUAL,
  );
  const deducaoSaude = Math.max(input.deducaoSaude, 0);
  const deducaoPrevidenciaComplementar = Math.max(input.deducaoPrevidenciaComplementar, 0);
  const totalDeducoes = deducaoEducacao + deducaoSaude + deducaoPrevidenciaComplementar;

  const baseCalculoAnual = Math.max(baseParaIrpf * 12 - totalDeducoes, 0);
  const descDependentes = Math.max(input.dependentes, 0) * DEDUCTION_PER_DEPENDENT_ANNUAL;
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
            salarioBrutoMensal * SIMPLIFIED_DEDUCTION_RATE_MONTHLY,
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
