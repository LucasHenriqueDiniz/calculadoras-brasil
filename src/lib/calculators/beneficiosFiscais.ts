export interface BeneficiosFiscaisInput {
  valeRefeicaoMensal: number;
  valeTransporteMensal: number;
  aliquotaIrpfEstimada: number;
}

export interface BeneficiosFiscaisResult {
  valeRefeicaoMensal: number;
  valeTransporteMensal: number;
  beneficiosTotalMensal: number;
  economiaIrpfMensal: number;
  economiaIrpfAnual: number;
  salarioLiquidoSemBeneficios: number;
  salarioLiquidoComBeneficios: number;
  rendaBrutaNecessaria: number;
  comparacao: {
    emDinheiro: number;
    emBeneficios: number;
    diferenca: number;
  };
}

export function calculateBeneficiosFiscais(input: BeneficiosFiscaisInput): BeneficiosFiscaisResult {
  // Benefícios não tributáveis
  const beneficiosTotalMensal = input.valeRefeicaoMensal + input.valeTransporteMensal;
  const beneficiosTotalAnual = beneficiosTotalMensal * 12;

  // Economia de IRPF (se recebesse em dinheiro, pagaria IRPF sobre)
  const economiaIrpfMensal = beneficiosTotalMensal * (input.aliquotaIrpfEstimada / 100);
  const economiaIrpfAnual = economiaIrpfMensal * 12;

  // Simulação: equivalente em salário bruto
  // Se você recebe em benefícios, não desconta IRPF
  // Se recebesse em dinheiro, teria que descontar
  const salarioLiquidoSemBeneficios = 0; // Referência
  const salarioLiquidoComBeneficios = beneficiosTotalMensal; // O que você não paga imposto

  // Quanto de salário bruto seria necessário para ter o mesmo em líquido
  const rendaBrutaNecessaria = beneficiosTotalMensal / (1 - input.aliquotaIrpfEstimada / 100);

  return {
    valeRefeicaoMensal: input.valeRefeicaoMensal,
    valeTransporteMensal: input.valeTransporteMensal,
    beneficiosTotalMensal,
    economiaIrpfMensal,
    economiaIrpfAnual,
    salarioLiquidoSemBeneficios,
    salarioLiquidoComBeneficios,
    rendaBrutaNecessaria,
    comparacao: {
      emDinheiro: rendaBrutaNecessaria,
      emBeneficios: beneficiosTotalMensal,
      diferenca: rendaBrutaNecessaria - beneficiosTotalMensal,
    },
  };
}
