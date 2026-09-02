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
  // non-taxable benefits
  const beneficiosTotalMensal = input.valeRefeicaoMensal + input.valeTransporteMensal;
  const beneficiosTotalAnual = beneficiosTotalMensal * 12;

  // IRPF savings (taken as cash, this amount would be taxed)
  const economiaIrpfMensal = beneficiosTotalMensal * (input.aliquotaIrpfEstimada / 100);
  const economiaIrpfAnual = economiaIrpfMensal * 12;

  // Simulation: the equivalent in gross salary.
  // Received as benefits, nothing is withheld for IRPF;
  // received as cash, it would be.
  const salarioLiquidoSemBeneficios = 0; // reference point
  const salarioLiquidoComBeneficios = beneficiosTotalMensal; // the untaxed part

  // Gross salary needed to end up with the same net amount
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
