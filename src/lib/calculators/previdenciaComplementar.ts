export interface PrevidenciaComplementarInput {
  contribuicaoMensalPgbl: number;
  tasaRetornoAnual: number;
  anosAteAposentadoria: number;
  aliquotaIrpfAtual: number;
}

export interface PrevidenciaComplementarResult {
  contribuicaoMensalPgbl: number;
  contribuicaoAnualPgbl: number;
  economiaIrpfMensal: number;
  economiaIrpfAnual: number;
  montanteFinal10anos: number;
  montanteFinal20anos: number;
  montanteFinal30anos: number;
  rendimentoTotal: number;
  projecao: Array<{
    ano: number;
    saldo: number;
    rendimento: number;
  }>;
}

export function calculatePrevidenciaComplementar(
  input: PrevidenciaComplementarInput,
): PrevidenciaComplementarResult {
  const contribuicaoAnual = input.contribuicaoMensalPgbl * 12;
  const tasaRetornoDecimal = input.tasaRetornoAnual / 100;

  // IRPF savings (deductible contribution)
  const economiaIrpfMensal = input.contribuicaoMensalPgbl * (input.aliquotaIrpfAtual / 100);
  const economiaIrpfAnual = economiaIrpfMensal * 12;

  // balance projection
  let saldo = 0;
  const projecao: Array<{ ano: number; saldo: number; rendimento: number }> = [];

  for (let ano = 1; ano <= input.anosAteAposentadoria; ano++) {
    const rendimento = saldo * tasaRetornoDecimal;
    saldo = saldo + rendimento + contribuicaoAnual;
    if (ano % 10 === 0 || ano === 1 || ano === 5 || ano === 20 || ano === 30) {
      projecao.push({ ano, saldo, rendimento });
    }
  }

  // assemble the final values per period
  let montante10 = 0,
    montante20 = 0,
    montante30 = 0;

  for (const p of projecao) {
    if (p.ano === 10) montante10 = p.saldo;
    if (p.ano === 20) montante20 = p.saldo;
    if (p.ano === 30) montante30 = p.saldo;
  }

  // 10/20/30 years not reached: compute it by hand
  saldo = 0;
  for (let ano = 1; ano <= 30; ano++) {
    const rendimento = saldo * tasaRetornoDecimal;
    saldo = saldo + rendimento + contribuicaoAnual;
    if (ano === 10) montante10 = saldo;
    if (ano === 20) montante20 = saldo;
    if (ano === 30) montante30 = saldo;
  }

  // final balance for the chosen period
  saldo = 0;
  for (let ano = 1; ano <= input.anosAteAposentadoria; ano++) {
    const rendimento = saldo * tasaRetornoDecimal;
    saldo = saldo + rendimento + contribuicaoAnual;
  }

  const rendimentoTotal = saldo - contribuicaoAnual * input.anosAteAposentadoria;

  return {
    contribuicaoMensalPgbl: input.contribuicaoMensalPgbl,
    contribuicaoAnualPgbl: contribuicaoAnual,
    economiaIrpfMensal,
    economiaIrpfAnual,
    montanteFinal10anos: montante10,
    montanteFinal20anos: montante20,
    montanteFinal30anos: montante30,
    rendimentoTotal,
    projecao,
  };
}
