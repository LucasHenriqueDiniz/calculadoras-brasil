/**
 * INSS contribution calculator for self-employed workers (contribuinte individual).
 *
 * Rules covered:
 * - Standard plan: 20% of the contribution salary, clamped between the floor
 *   (minimum wage) and the RGPS ceiling. Grants access to every benefit and
 *   counts towards length-of-contribution retirement.
 * - Simplified plan (Lei 12.470/2011): 11% of the minimum wage, not of the
 *   income. In exchange it only entitles the worker to benefits worth one
 *   minimum wage and does NOT count towards length-of-contribution retirement —
 *   that requires topping up the 9% difference plus interest.
 * - Someone providing services to a company has 11% withheld at source by the
 *   payer, and the company pays the employer share; the 45% deduction of the
 *   employer contribution is not handled here.
 *
 * Every result is an educational estimate. The official contribution and benefit
 * amounts are always the ones assessed by INSS.
 */

import {
  INSS_REFERENCE_YEAR,
  MINIMUM_WAGE,
  INSS_CEILING,
  contributionSalary,
} from "./inss-constants";

export type PlanoInss = "normal" | "simplificado";

export interface InssAutonomoInput {
  /** Gross monthly income declared as self-employed. */
  ganhoMensalBruto: number;
  /** Contribution months already accumulated. */
  mesesContribuidos: number;
  /** Sex sets the minimum length-of-contribution requirement (EC 103/2019). */
  sexo: "masculino" | "feminino";
}

export interface InssAutonomoResult {
  anoReferencia: number;
  ganhoMensalBruto: number;
  /** Effective base of the standard plan, already clamped to floor and ceiling. */
  salarioContribuicao: number;
  /** Signals that the income exceeded the ceiling and the base was capped. */
  limitadoPeloTeto: boolean;
  /** Signals that the income fell below the floor and the base was raised to it. */
  elevadoAoPiso: boolean;

  planoNormal: PlanoDetalhe;
  planoSimplificado: PlanoDetalhe;

  /** Annual cost difference between the two plans. */
  diferencaCustoAnual: number;

  mesesContribuidos: number;
  anosContribuidos: number;
  /** Applicable length-of-contribution requirement, in years. */
  tempoMinimoContribuicao: number;
  /** Benefit estimate for the standard plan, under the EC 103/2019 rule. */
  estimativaBeneficioNormal: number;
  /** The simplified plan's benefit is always one minimum wage. */
  estimativaBeneficioSimplificado: number;
  /** Percentage of the average applied in the standard-plan estimate. */
  percentualMediaAplicado: number;
  /** False while the minimum contribution time has not been reached yet. */
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

/** EC 103/2019: 20 years for men, 15 for women, for a self-employed contributor. */
const TEMPO_MINIMO_ANOS = { masculino: 20, feminino: 15 } as const;

/** EC 103/2019: 60% of the average + 2% per year beyond the minimum time. */
const PERCENTUAL_BASE = 60;
const PERCENTUAL_POR_ANO_EXCEDENTE = 2;

export function calculateInssAutonomo(input: InssAutonomoInput): InssAutonomoResult {
  const ganhoMensalBruto = Math.max(input.ganhoMensalBruto, 0);
  const salarioContribuicao = contributionSalary(ganhoMensalBruto);

  const contribuicaoNormalMensal = salarioContribuicao * ALIQUOTA_NORMAL;
  const contribuicaoSimplificadaMensal = MINIMUM_WAGE * ALIQUOTA_SIMPLIFICADA;

  const planoNormal: PlanoDetalhe = {
    base: salarioContribuicao,
    aliquota: ALIQUOTA_NORMAL * 100,
    contribuicaoMensal: contribuicaoNormalMensal,
    contribuicaoAnual: contribuicaoNormalMensal * 12,
    contaTempoDeContribuicao: true,
    tetoBeneficio: "teto do INSS",
  };

  const planoSimplificado: PlanoDetalhe = {
    base: MINIMUM_WAGE,
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

  // The real average considers every contribution salary since 07/1994.
  // Here the current contribution salary stands in as an approximation.
  const beneficioBruto = salarioContribuicao * (percentualMediaAplicado / 100);
  const estimativaBeneficioNormal = tempoMinimoAtingido
    ? Math.min(Math.max(beneficioBruto, MINIMUM_WAGE), INSS_CEILING)
    : 0;

  return {
    anoReferencia: INSS_REFERENCE_YEAR,
    ganhoMensalBruto,
    salarioContribuicao,
    limitadoPeloTeto: ganhoMensalBruto > INSS_CEILING,
    elevadoAoPiso: ganhoMensalBruto > 0 && ganhoMensalBruto < MINIMUM_WAGE,
    planoNormal,
    planoSimplificado,
    diferencaCustoAnual: planoNormal.contribuicaoAnual - planoSimplificado.contribuicaoAnual,
    mesesContribuidos,
    anosContribuidos,
    tempoMinimoContribuicao,
    estimativaBeneficioNormal,
    estimativaBeneficioSimplificado: MINIMUM_WAGE,
    percentualMediaAplicado,
    tempoMinimoAtingido,
  };
}
