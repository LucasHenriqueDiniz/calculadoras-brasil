/**
 * INSS reference parameters used by the calculators.
 *
 * IMPORTANT: these are reference values and must be reviewed every time the
 * minimum wage and the contribution table are adjusted. The site's calculators
 * show educational estimates — the official amount is always the one assessed by
 * INSS/Receita Federal.
 */

/** Base year of the table below. Shown alongside the estimates. */
export const INSS_ANO_REFERENCIA = 2026;

/** National minimum wage for the reference year (floor of the contribution salary). */
export const SALARIO_MINIMO = 1621.0;

/** RGPS contribution-salary ceiling for the reference year. */
export const TETO_INSS = 8475.55;

/**
 * Progressive contribution brackets for an employed insured worker.
 * `ate` is the upper bound of the bracket; the rate applies only to the slice of
 * the salary that falls inside the bracket (marginal, not cumulative).
 *
 * Cross-check: applied to the ceiling, these brackets yield a maximum
 * contribution of R$ 988,09, which is the maximum deduction published for 2026.
 */
export const INSS_FAIXAS_EMPREGADO = [
  { ate: 1621.0, aliquota: 0.075 },
  { ate: 2902.84, aliquota: 0.09 },
  { ate: 4354.27, aliquota: 0.12 },
  { ate: TETO_INSS, aliquota: 0.14 },
] as const;

/**
 * Progressive contribution of an employed insured worker, capped at the ceiling.
 * Each bracket applies only to the slice of the salary it contains.
 */
export function calcularInssEmpregado(salarioBrutoMensal: number): number {
  const base = Math.min(Math.max(salarioBrutoMensal, 0), TETO_INSS);
  let contribuicao = 0;
  let pisoFaixa = 0;

  for (const faixa of INSS_FAIXAS_EMPREGADO) {
    if (base <= pisoFaixa) break;
    const parcela = Math.min(base, faixa.ate) - pisoFaixa;
    contribuicao += parcela * faixa.aliquota;
    pisoFaixa = faixa.ate;
  }

  return contribuicao;
}

/**
 * Contribution salary of a self-employed contributor: the declared income,
 * clamped between the floor (minimum wage) and the RGPS ceiling.
 */
export function salarioDeContribuicao(rendaMensal: number): number {
  return Math.min(Math.max(rendaMensal, SALARIO_MINIMO), TETO_INSS);
}
