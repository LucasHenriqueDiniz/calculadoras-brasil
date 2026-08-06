/**
 * Calculadora de contribuição do INSS para autônomos (contribuinte individual).
 *
 * Regras consideradas:
 * - Plano normal: 20% sobre o salário de contribuição, limitado ao piso
 *   (salário mínimo) e ao teto do RGPS. Dá acesso a todos os benefícios e conta
 *   tempo para aposentadoria por tempo de contribuição.
 * - Plano simplificado (Lei 12.470/2011): 11% sobre o salário mínimo, e não
 *   sobre a renda. Em contrapartida, dá direito apenas a benefícios no valor de
 *   um salário mínimo e NÃO conta tempo para aposentadoria por tempo de
 *   contribuição — para isso é preciso complementar a diferença (9%) com juros.
 * - Quem presta serviço a empresa tem 11% retidos na fonte pelo tomador, e a
 *   empresa recolhe a parte patronal; a dedução de 45% da contribuição patronal
 *   não é tratada aqui.
 *
 * Todos os resultados são estimativas educativas. O valor oficial da
 * contribuição e do benefício é sempre o apurado pelo INSS.
 */

import {
  INSS_ANO_REFERENCIA,
  SALARIO_MINIMO,
  TETO_INSS,
  salarioDeContribuicao,
} from "./inss-constants";

export type PlanoInss = "normal" | "simplificado";

export interface InssAutonomoInput {
  /** Renda mensal bruta declarada como autônomo. */
  ganhoMensalBruto: number;
  /** Meses de contribuição já acumulados. */
  mesesContribuidos: number;
  /** Sexo define a carência mínima de tempo de contribuição (EC 103/2019). */
  sexo: "masculino" | "feminino";
}

export interface InssAutonomoResult {
  anoReferencia: number;
  ganhoMensalBruto: number;
  /** Base efetiva do plano normal, já limitada ao piso e ao teto. */
  salarioContribuicao: number;
  /** Indica que a renda ultrapassou o teto e a base foi limitada. */
  limitadoPeloTeto: boolean;
  /** Indica que a renda ficou abaixo do piso e a base foi elevada ao mínimo. */
  elevadoAoPiso: boolean;

  planoNormal: PlanoDetalhe;
  planoSimplificado: PlanoDetalhe;

  /** Diferença de custo anual entre os dois planos. */
  diferencaCustoAnual: number;

  mesesContribuidos: number;
  anosContribuidos: number;
  /** Carência de tempo de contribuição aplicável (em anos). */
  tempoMinimoContribuicao: number;
  /** Estimativa do benefício no plano normal, pela regra da EC 103/2019. */
  estimativaBeneficioNormal: number;
  /** Benefício do plano simplificado é sempre um salário mínimo. */
  estimativaBeneficioSimplificado: number;
  /** Percentual da média aplicado na estimativa do plano normal. */
  percentualMediaAplicado: number;
  /** Falso enquanto o tempo mínimo de contribuição ainda não foi atingido. */
  tempoMinimoAtingido: boolean;
}

export interface PlanoDetalhe {
  base: number;
  aliquota: number;
  contribuicaoMensal: number;
  contribuicaoAnual: number;
  contaTempoDeContribuicao: boolean;
  tetoBeneficio: "teto do INSS" | "um salário mínimo";
}

const ALIQUOTA_NORMAL = 0.2;
const ALIQUOTA_SIMPLIFICADA = 0.11;

/** EC 103/2019: 20 anos para homens, 15 para mulheres, no contribuinte individual. */
const TEMPO_MINIMO_ANOS = { masculino: 20, feminino: 15 } as const;

/** EC 103/2019: 60% da média + 2% por ano que exceder o tempo mínimo. */
const PERCENTUAL_BASE = 60;
const PERCENTUAL_POR_ANO_EXCEDENTE = 2;

export function calculateInssAutonomo(input: InssAutonomoInput): InssAutonomoResult {
  const ganhoMensalBruto = Math.max(input.ganhoMensalBruto, 0);
  const salarioContribuicao = salarioDeContribuicao(ganhoMensalBruto);

  const contribuicaoNormalMensal = salarioContribuicao * ALIQUOTA_NORMAL;
  const contribuicaoSimplificadaMensal = SALARIO_MINIMO * ALIQUOTA_SIMPLIFICADA;

  const planoNormal: PlanoDetalhe = {
    base: salarioContribuicao,
    aliquota: ALIQUOTA_NORMAL * 100,
    contribuicaoMensal: contribuicaoNormalMensal,
    contribuicaoAnual: contribuicaoNormalMensal * 12,
    contaTempoDeContribuicao: true,
    tetoBeneficio: "teto do INSS",
  };

  const planoSimplificado: PlanoDetalhe = {
    base: SALARIO_MINIMO,
    aliquota: ALIQUOTA_SIMPLIFICADA * 100,
    contribuicaoMensal: contribuicaoSimplificadaMensal,
    contribuicaoAnual: contribuicaoSimplificadaMensal * 12,
    contaTempoDeContribuicao: false,
    tetoBeneficio: "um salário mínimo",
  };

  const mesesContribuidos = Math.max(input.mesesContribuidos, 0);
  const anosContribuidos = mesesContribuidos / 12;
  const tempoMinimoContribuicao = TEMPO_MINIMO_ANOS[input.sexo];
  const tempoMinimoAtingido = anosContribuidos >= tempoMinimoContribuicao;

  const anosExcedentes = Math.max(anosContribuidos - tempoMinimoContribuicao, 0);
  const percentualMediaAplicado = Math.min(
    PERCENTUAL_BASE + Math.floor(anosExcedentes) * PERCENTUAL_POR_ANO_EXCEDENTE,
    100,
  );

  // A média real considera todos os salários de contribuição desde 07/1994.
  // Aqui usamos o salário de contribuição atual como aproximação da média.
  const beneficioBruto = salarioContribuicao * (percentualMediaAplicado / 100);
  const estimativaBeneficioNormal = tempoMinimoAtingido
    ? Math.min(Math.max(beneficioBruto, SALARIO_MINIMO), TETO_INSS)
    : 0;

  return {
    anoReferencia: INSS_ANO_REFERENCIA,
    ganhoMensalBruto,
    salarioContribuicao,
    limitadoPeloTeto: ganhoMensalBruto > TETO_INSS,
    elevadoAoPiso: ganhoMensalBruto > 0 && ganhoMensalBruto < SALARIO_MINIMO,
    planoNormal,
    planoSimplificado,
    diferencaCustoAnual: planoNormal.contribuicaoAnual - planoSimplificado.contribuicaoAnual,
    mesesContribuidos,
    anosContribuidos,
    tempoMinimoContribuicao,
    estimativaBeneficioNormal,
    estimativaBeneficioSimplificado: SALARIO_MINIMO,
    percentualMediaAplicado,
    tempoMinimoAtingido,
  };
}
