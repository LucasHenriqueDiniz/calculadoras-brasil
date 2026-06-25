export interface CltVsPjInput {
  salarioCltBruto: number;
  propostaPjMensal: number;
  dependentes: number;
  despesasDedutivelsPj: number;
}

export interface CltVsPjResult {
  salarioCltBruto: number;
  propostaPjMensal: number;
  cltLiquido: number;
  cltComBeneficios: number;
  pjLiquido: number;
  diferenca: number;
  percentualDiferenca: number;
  pjNecessaria: number;
  analise: {
    cltMelhor: boolean;
    diferencaMensal: number;
    diferencaAnual: number;
    justificativa: string;
  };
}

export function calculateCltVsPj(input: CltVsPjInput): CltVsPjResult {
  // CLT Cálculo (Simplificado)
  const inssPercentualClt = 0.11;
  const descInss = input.salarioCltBruto * inssPercentualClt;
  const baseParaIrpfClt = input.salarioCltBruto - descInss;

  // IRPF estimado CLT
  let descIrpfClt = 0;
  if (baseParaIrpfClt * 12 > 55471.75) {
    descIrpfClt = (baseParaIrpfClt * 12 * 0.275 - 10432.32) / 12;
  } else if (baseParaIrpfClt * 12 > 44693.6) {
    descIrpfClt = (baseParaIrpfClt * 12 * 0.225 - 7633.69) / 12;
  }

  const salarioCltLiquido = input.salarioCltBruto - descInss - descIrpfClt;

  // Benefícios CLT (13º + FGTS + Vale diluído)
  const beneficiosClt = input.salarioCltBruto * (1 / 12 + 0.15); // ~27% anualizado
  const cltComBeneficios = salarioCltLiquido + beneficiosClt;

  // PJ Cálculo
  const inssPercentualPj = 0.2;
  const descInssPj = input.propostaPjMensal * inssPercentualPj;
  const baseParaIrpfPj = input.propostaPjMensal - descInssPj - input.despesasDedutivelsPj;

  // IRPF estimado PJ
  let descIrpfPj = 0;
  if (baseParaIrpfPj * 12 > 55471.75) {
    descIrpfPj = (baseParaIrpfPj * 12 * 0.275 - 10432.32) / 12;
  } else if (baseParaIrpfPj * 12 > 44693.6) {
    descIrpfPj = (baseParaIrpfPj * 12 * 0.225 - 7633.69) / 12;
  }

  // Desconto contador (estimado 5%)
  const descContador = input.propostaPjMensal * 0.05;

  const pjLiquido = input.propostaPjMensal - descInssPj - descIrpfPj - descContador;

  // Cálculo de quanto PJ precisa ganhar para igualar CLT
  // Aproximação iterativa simplificada
  let pjNecessaria = input.propostaPjMensal;
  for (let i = 0; i < 10; i++) {
    const inssTemp = pjNecessaria * 0.2;
    const baseTemp = pjNecessaria - inssTemp - input.despesasDedutivelsPj;
    let irpfTemp = 0;
    if (baseTemp * 12 > 44693.6) {
      irpfTemp = (baseTemp * 12 * 0.225 - 7633.69) / 12;
    }
    const contagemTemp = pjNecessaria * 0.05;
    const liquidoTemp = pjNecessaria - inssTemp - irpfTemp - contagemTemp;

    if (Math.abs(liquidoTemp - cltComBeneficios) < 100) break;

    if (liquidoTemp < cltComBeneficios) {
      pjNecessaria += 100;
    } else {
      pjNecessaria -= 100;
    }
  }

  const diferenca = pjLiquido - cltComBeneficios;
  const percentualDiferenca = ((diferenca / cltComBeneficios) * 100).toFixed(2);

  return {
    salarioCltBruto: input.salarioCltBruto,
    propostaPjMensal: input.propostaPjMensal,
    cltLiquido: salarioCltLiquido,
    cltComBeneficios,
    pjLiquido,
    diferenca,
    percentualDiferenca: parseFloat(percentualDiferenca),
    pjNecessaria,
    analise: {
      cltMelhor: cltComBeneficios > pjLiquido,
      diferencaMensal: Math.abs(diferenca),
      diferencaAnual: Math.abs(diferenca) * 12,
      justificativa:
        cltComBeneficios > pjLiquido
          ? `CLT é ${Math.abs(percentualDiferenca)}% mais vantajoso. PJ precisa de R$ ${pjNecessaria.toFixed(0)}/mês para igualar.`
          : `PJ é ${percentualDiferenca}% mais vantajoso. Ganho adicional: R$ ${diferenca.toFixed(2)}/mês.`,
    },
  };
}
