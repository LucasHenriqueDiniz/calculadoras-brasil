/**
 * Calculadora de Salário Líquido
 * Converte salário bruto em líquido considerando IRPF, INSS, sindicato
 */

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

// Faixas de INSS 2026 (empregado)
const INSS_FAIXAS = [
  { max: 1412.0, rate: 0.077 },
  { max: 2666.68, rate: 0.09 },
  { max: 4000.03, rate: 0.12 },
  { max: Infinity, rate: 0.14 },
];

export function calculateSalarioLiquido(input: SalarioLiquidoInput): SalarioLiquidoResult {
  const salarioBrutoAnual = input.salarioBrutoMensal * 12;

  // 1. Calcular INSS empregado
  let descInssEmpregado = 0;
  for (const faixa of INSS_FAIXAS) {
    const valor = Math.min(input.salarioBrutoMensal, faixa.max);
    descInssEmpregado += valor * faixa.rate;
  }

  // 2. Base para IRPF após INSS
  const baseParaIrpf = input.salarioBrutoMensal - descInssEmpregado;

  // 3. Deduções anuais (para cálculo do IRPF anual)
  const deducaoEducacao = Math.min(input.deducaoEducacao, 3561.5);
  const deducaoSaude = input.deducaoSaude;
  const totalDeducoes = deducaoEducacao + deducaoSaude + input.deducaoPrevidenciaComplementar;

  // 4. Calcular IRPF mensal estimado (simplificação: dividir cálculo anual por 12)
  const basePosInssAnual = (input.salarioBrutoMensal - descInssEmpregado) * 12;
  const baseCalculoAnual = Math.max(basePosInssAnual - totalDeducoes, 0);
  const descDependentes = input.dependentes * 2275;
  const baseImponivel = Math.max(baseCalculoAnual - descDependentes, 0);

  // Aplicar alíquota progressiva (simplificação)
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

  // 5. Sindicato
  const descSindicato = input.temSindicato ? input.salarioBrutoMensal * 0.0033 : 0; // 1 hora aprox

  // 6. Vale Transporte (desconta do bruto)
  const descValeTransporte = input.temValeTransporte ? Math.min(input.salarioBrutoMensal * 0.06, 250) : 0;

  // 7. Salário Líquido
  const salarioLiquidoMensal =
    input.salarioBrutoMensal -
    descInssEmpregado -
    descIrpfEstimado -
    descSindicato -
    descValeTransporte;

  // 8. Benefícios não tributáveis
  const beneficiosNaoTributaveis = input.temValeRefeicao ? 360 : 0; // Aprox R$ 360/mês em vale refeição

  // 9. Economia com dependentes e deduções
  const economiaComDependentes = descDependentes / 12; // Estimado mensal
  const economiaComDeducoes = totalDeducoes / 12; // Estimado mensal

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
