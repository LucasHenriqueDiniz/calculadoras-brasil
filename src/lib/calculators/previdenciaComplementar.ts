export interface PrevidenciaComplementarInput {
  contribuicaoMensalPgbl: number;
  tasaRetornoAnual: number;
  anosAteAposentadoria: number;
  aliquotaIrpfAtual: number;
}

export interface PrevidenciaComplementarYear {
  ano: number;
  saldo: number;
  rendimento: number;
}

export interface PrevidenciaComplementarResult {
  contribuicaoMensalPgbl: number;
  contribuicaoAnualPgbl: number;
  economiaIrpfMensal: number;
  economiaIrpfAnual: number;
  /**
   * The balance at the horizon the visitor asked for. This is the answer the
   * page headlines; the three fixed marks below are comparison points and must
   * not stand in for it.
   */
  montanteFinalHorizonte: number;
  montanteFinal10anos: number;
  montanteFinal20anos: number;
  montanteFinal30anos: number;
  rendimentoTotal: number;
  projecao: PrevidenciaComplementarYear[];
}

/** Years the projection samples, out of every year it walks. */
function isSampledYear(ano: number): boolean {
  return ano === 1 || ano === 5 || ano % 10 === 0;
}

/**
 * Walks the balance year by year. One deposit of `annualContribution` at the
 * END of each year, so the first year earns nothing: this is the convention the
 * whole module is written in, and it matches the ordinary-annuity closed form
 * `C · ((1 + r)^n − 1) / r`.
 */
function projectYearByYear(
  annualContribution: number,
  annualRate: number,
  years: number,
): PrevidenciaComplementarYear[] {
  const series: PrevidenciaComplementarYear[] = [];
  let saldo = 0;

  for (let ano = 1; ano <= years; ano++) {
    const rendimento = saldo * annualRate;
    saldo = saldo + rendimento + annualContribution;
    series.push({ ano, saldo, rendimento });
  }

  return series;
}

const FIXED_MARKS = 30;

export function calculatePrevidenciaComplementar(
  input: PrevidenciaComplementarInput,
): PrevidenciaComplementarResult {
  const contribuicaoAnual = input.contribuicaoMensalPgbl * 12;
  const tasaRetornoDecimal = input.tasaRetornoAnual / 100;

  // IRPF savings (deductible contribution)
  const economiaIrpfMensal = input.contribuicaoMensalPgbl * (input.aliquotaIrpfAtual / 100);
  const economiaIrpfAnual = economiaIrpfMensal * 12;

  // the visitor's own horizon
  const horizonte = projectYearByYear(
    contribuicaoAnual,
    tasaRetornoDecimal,
    input.anosAteAposentadoria,
  );
  const montanteFinalHorizonte = horizonte.at(-1)?.saldo ?? 0;
  const rendimentoTotal = montanteFinalHorizonte - contribuicaoAnual * input.anosAteAposentadoria;

  // fixed comparison marks, always the same years whatever the horizon is
  const marcos = projectYearByYear(contribuicaoAnual, tasaRetornoDecimal, FIXED_MARKS);
  const saldoNoAno = (ano: number) => marcos[ano - 1]?.saldo ?? 0;

  return {
    contribuicaoMensalPgbl: input.contribuicaoMensalPgbl,
    contribuicaoAnualPgbl: contribuicaoAnual,
    economiaIrpfMensal,
    economiaIrpfAnual,
    montanteFinalHorizonte,
    montanteFinal10anos: saldoNoAno(10),
    montanteFinal20anos: saldoNoAno(20),
    montanteFinal30anos: saldoNoAno(30),
    rendimentoTotal,
    projecao: horizonte.filter((ponto) => isSampledYear(ponto.ano)),
  };
}
