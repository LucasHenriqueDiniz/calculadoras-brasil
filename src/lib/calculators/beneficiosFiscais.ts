export interface TaxFreeBenefitsInput {
  monthlyMealAllowance: number;
  monthlyTransportAllowance: number;
  estimatedIrpfRate: number;
}

export interface TaxFreeBenefitsResult {
  monthlyMealAllowance: number;
  monthlyTransportAllowance: number;
  monthlyBenefitTotal: number;
  monthlyIrpfSaving: number;
  annualIrpfSaving: number;
  netSalaryWithoutBenefits: number;
  netSalaryWithBenefits: number;
  requiredGrossIncome: number;
  comparison: {
    asCash: number;
    asBenefits: number;
    difference: number;
  };
}

export function calculateTaxFreeBenefits(input: TaxFreeBenefitsInput): TaxFreeBenefitsResult {
  // non-taxable benefits
  const monthlyBenefitTotal = input.monthlyMealAllowance + input.monthlyTransportAllowance;

  // IRPF savings (taken as cash, this amount would be taxed)
  const monthlyIrpfSaving = monthlyBenefitTotal * (input.estimatedIrpfRate / 100);
  const annualIrpfSaving = monthlyIrpfSaving * 12;

  // Simulation: the equivalent in gross salary.
  // Received as benefits, nothing is withheld for IRPF;
  // received as cash, it would be.
  const netSalaryWithoutBenefits = 0; // reference point
  const netSalaryWithBenefits = monthlyBenefitTotal; // the untaxed part

  // Gross salary needed to end up with the same net amount
  const requiredGrossIncome = monthlyBenefitTotal / (1 - input.estimatedIrpfRate / 100);

  return {
    monthlyMealAllowance: input.monthlyMealAllowance,
    monthlyTransportAllowance: input.monthlyTransportAllowance,
    monthlyBenefitTotal,
    monthlyIrpfSaving,
    annualIrpfSaving,
    netSalaryWithoutBenefits,
    netSalaryWithBenefits,
    requiredGrossIncome,
    comparison: {
      asCash: requiredGrossIncome,
      asBenefits: monthlyBenefitTotal,
      difference: requiredGrossIncome - monthlyBenefitTotal,
    },
  };
}
