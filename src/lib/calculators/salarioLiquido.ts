/**
 * Net salary calculator.
 * Turns a gross salary into a net one, accounting for IRPF, INSS and union dues.
 */

import { calcularInssEmpregado } from "./inss-constants";

export interface SalarioLiquidoInput {
  salarioBrutoMensal: number;
  dependentes: number;
  deducaoEducacao: number;
  deducaoSaude: number;
  deducaoPrevidenciaComplementar: number;
  temValeRefeicao: boolean;
  temValeTransporte: boolean;
  temSindicato: boolean;
  regimeSimplificado: boolean;
}

export interface SalarioLiquidoResult {
  salarioBrutoMensal: number;
  salarioBrutoAnual: number;
  descInssEmpregado: number;
  baseParaIrpf: number;
  totalDeducoes: number;
  descDependentes: number;
  baseImponivel: number;
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
  const salarioBrutoAnual = input.salarioBrutoMensal * 12;

  // 1. employee INSS: progressive per bracket and capped at the RGPS ceiling.
  //    Each rate applies only to the slice of the salary inside its bracket.
  const descInssEmpregado = calcularInssEmpregado(input.salarioBrutoMensal);

  // 2. IRPF base after INSS
  const baseParaIrpf = input.salarioBrutoMensal - descInssEmpregado;

  // 3. annual deductions, for the annual IRPF calculation
  const deducaoEducacao = Math.min(input.deducaoEducacao, 3561.5);
  const deducaoSaude = input.deducaoSaude;
  const totalDeducoes = deducaoEducacao + deducaoSaude + input.deducaoPrevidenciaComplementar;

  // 4. estimated monthly IRPF (simplification: the annual figure divided by 12)
  const basePosInssAnual = (input.salarioBrutoMensal - descInssEmpregado) * 12;
  const baseCalculoAnual = Math.max(basePosInssAnual - totalDeducoes, 0);
  const descDependentes = input.dependentes * 2275;
  const baseImponivel = Math.max(baseCalculoAnual - descDependentes, 0);

  // apply the progressive rate (simplified)
  let descIrpfAnual = 0;
  if (baseImponivel > 55471.75) {
    descIrpfAnual = baseImponivel * 0.275 - 10432.32;
  } else if (baseImponivel > 44693.6) {
    descIrpfAnual = baseImponivel * 0.225 - 7633.69;
  } else if (baseImponivel > 33503.35) {
    descIrpfAnual = baseImponivel * 0.15 - 4257.67;
  } else if (baseImponivel > 21503.35) {
    descIrpfAnual = baseImponivel * 0.075 - 1612.75;
  }

  const descIrpfEstimado = Math.max(descIrpfAnual / 12, 0);

  // 5. union dues
  const descSindicato = input.temSindicato ? input.salarioBrutoMensal * 0.0033 : 0; // roughly one hour of pay

  // 6. transport allowance, deducted from the gross
  const descValeTransporte = input.temValeTransporte
    ? Math.min(input.salarioBrutoMensal * 0.06, 250)
    : 0;

  // 7. net salary
  const salarioLiquidoMensal =
    input.salarioBrutoMensal -
    descInssEmpregado -
    descIrpfEstimado -
    descSindicato -
    descValeTransporte;

  // 8. non-taxable benefits
  const beneficiosNaoTributaveis = input.temValeRefeicao ? 360 : 0; // roughly R$ 360/month in meal allowance

  // 9. savings from dependants and deductions
  const economiaComDependentes = descDependentes / 12; // monthly estimate
  const economiaComDeducoes = totalDeducoes / 12; // monthly estimate

  const aliquotaEfetivaIrpf =
    input.salarioBrutoMensal > 0 ? (descIrpfEstimado / input.salarioBrutoMensal) * 100 : 0;

  return {
    salarioBrutoMensal: input.salarioBrutoMensal,
    salarioBrutoAnual,
    descInssEmpregado,
    baseParaIrpf,
    totalDeducoes,
    descDependentes,
    baseImponivel,
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
