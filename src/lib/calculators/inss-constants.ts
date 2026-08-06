/**
 * Parâmetros de referência do INSS usados pelas calculadoras.
 *
 * IMPORTANTE: são valores de referência que precisam ser revisados sempre que o
 * salário mínimo e a tabela de contribuição forem reajustados. As calculadoras
 * do site apresentam estimativas educativas — o valor oficial é sempre o apurado
 * pelo INSS/Receita Federal.
 */

/** Ano-base da tabela abaixo. Exibido junto das estimativas. */
export const INSS_ANO_REFERENCIA = 2024;

/** Salário mínimo nacional do ano de referência (piso do salário de contribuição). */
export const SALARIO_MINIMO = 1412.0;

/** Teto do salário de contribuição do RGPS no ano de referência. */
export const TETO_INSS = 7786.02;

/**
 * Faixas progressivas de contribuição do segurado empregado.
 * `ate` é o limite superior da faixa; a alíquota incide apenas sobre a parcela
 * do salário que cai dentro da faixa (cálculo marginal, não cumulativo).
 */
export const INSS_FAIXAS_EMPREGADO = [
  { ate: 1412.0, aliquota: 0.075 },
  { ate: 2666.68, aliquota: 0.09 },
  { ate: 4000.03, aliquota: 0.12 },
  { ate: TETO_INSS, aliquota: 0.14 },
] as const;

/**
 * Contribuição progressiva do segurado empregado, respeitando o teto.
 * Cada faixa incide apenas sobre a parcela do salário contida nela.
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
 * Salário de contribuição do contribuinte individual: a renda declarada,
 * limitada ao piso (salário mínimo) e ao teto do RGPS.
 */
export function salarioDeContribuicao(rendaMensal: number): number {
  return Math.min(Math.max(rendaMensal, SALARIO_MINIMO), TETO_INSS);
}
