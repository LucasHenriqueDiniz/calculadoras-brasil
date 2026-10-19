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

export type InssPlan = "normal" | "simplificado";

export interface InssAutonomoInput {
  /** Gross monthly income declared as self-employed. */
  grossMonthlyIncome: number;
  /** Contribution months already accumulated. */
  contributedMonths: number;
  /** Sex sets the minimum length-of-contribution requirement (EC 103/2019). */
  contributorSex: "masculino" | "feminino";
  /**
   * Already affiliated to the RGPS when EC 103/2019 came into force (13/11/2019).
   * Decides which article sets the minimum time: art. 18 (15 years for both
   * sexes) or art. 19 (15 for women, 20 for men).
   */
  affiliatedBeforeReform: boolean;
}

export interface InssAutonomoResult {
  referenceYear: number;
  grossMonthlyIncome: number;
  /** Effective base of the standard plan, already clamped to floor and ceiling. */
  contributionBase: number;
  /** Signals that the income exceeded the ceiling and the base was capped. */
  cappedByCeiling: boolean;
  /** Signals that the income fell below the floor and the base was raised to it. */
  raisedToFloor: boolean;

  standardPlan: PlanDetail;
  simplifiedPlan: PlanDetail;

  /** Annual cost difference between the two plans. */
  annualCostDifference: number;

  contributedMonths: number;
  contributedYears: number;
  /** Applicable length-of-contribution requirement, in years. */
  minimumContributionYears: number;
  /** Minimum retirement age under either article: 62 for women, 65 for men. */
  minimumRetirementAge: number;
  /** Benefit estimate for the standard plan, under the EC 103/2019 rule. */
  standardPlanBenefitEstimate: number;
  /** The simplified plan's benefit is always one minimum wage. */
  simplifiedPlanBenefitEstimate: number;
  /** Percentage of the average applied in the standard-plan estimate. */
  appliedAveragePercentage: number;
  /** False while the minimum contribution time has not been reached yet. */
  minimumTimeReached: boolean;
}

export interface PlanDetail {
  base: number;
  rate: number;
  monthlyContribution: number;
  annualContribution: number;
  countsTowardsContributionTime: boolean;
  benefitCeiling: "teto do INSS" | "um salário mínimo";
}

const STANDARD_PLAN_RATE = 0.2;
const SIMPLIFIED_PLAN_RATE = 0.11;

/**
 * EC 103/2019, read on Planalto
 * (docs/research/2026-10-18-adsense-added-value/fetches/planalto-ec-103-2019.md):
 * - art. 18, affiliated before the reform: 15 years of contribution "para ambos
 *   os sexos", at 65 (men) and 62 (women, reached in 2023 by § 1º's steps);
 * - art. 19, affiliated after it: 15 years for women, 20 for men, same ages.
 *
 * This used to apply art. 19's 20 years to every man, so a man who had been
 * contributing since before 2019 was told he had not reached the minimum at 15
 * to 19 years — when the transition rule lets him retire from 15.
 */
function minimumContributionYearsFor(
  sex: InssAutonomoInput["contributorSex"],
  affiliatedBeforeReform: boolean,
): number {
  if (sex === "feminino") return 15;
  return affiliatedBeforeReform ? 15 : 20;
}

const MINIMUM_RETIREMENT_AGE = { masculino: 65, feminino: 62 } as const;

/**
 * EC 103/2019, art. 26: 60% of the average, plus 2 points for each year beyond
 * 20 years of contribution (§ 2º) — beyond 15 for women (§ 5º). The threshold is
 * NOT the minimum time: a man retiring under art. 18 with 15 years gets 60%, and
 * the 2 points start only past 20.
 */
const INCREMENT_THRESHOLD_YEARS = { masculino: 20, feminino: 15 } as const;
const BASE_PERCENTAGE = 60;
const PERCENTAGE_PER_EXTRA_YEAR = 2;

export function calculateInssAutonomo(input: InssAutonomoInput): InssAutonomoResult {
  const grossMonthlyIncome = Math.max(input.grossMonthlyIncome, 0);
  const contributionBase = contributionSalary(grossMonthlyIncome);

  const standardMonthlyContribution = contributionBase * STANDARD_PLAN_RATE;
  const simplifiedMonthlyContribution = MINIMUM_WAGE * SIMPLIFIED_PLAN_RATE;

  const standardPlan: PlanDetail = {
    base: contributionBase,
    rate: STANDARD_PLAN_RATE * 100,
    monthlyContribution: standardMonthlyContribution,
    annualContribution: standardMonthlyContribution * 12,
    countsTowardsContributionTime: true,
    benefitCeiling: "teto do INSS",
  };

  const simplifiedPlan: PlanDetail = {
    base: MINIMUM_WAGE,
    rate: SIMPLIFIED_PLAN_RATE * 100,
    monthlyContribution: simplifiedMonthlyContribution,
    annualContribution: simplifiedMonthlyContribution * 12,
    countsTowardsContributionTime: false,
    benefitCeiling: "um salário mínimo",
  };

  const contributedMonths = Math.max(input.contributedMonths, 0);
  const contributedYears = contributedMonths / 12;
  const minimumContributionYears = minimumContributionYearsFor(
    input.contributorSex,
    input.affiliatedBeforeReform,
  );
  const minimumTimeReached = contributedYears >= minimumContributionYears;

  const yearsBeyondThreshold = Math.max(
    contributedYears - INCREMENT_THRESHOLD_YEARS[input.contributorSex],
    0,
  );
  const appliedAveragePercentage = Math.min(
    BASE_PERCENTAGE + Math.floor(yearsBeyondThreshold) * PERCENTAGE_PER_EXTRA_YEAR,
    100,
  );

  // The real average considers every contribution salary since 07/1994.
  // Here the current contribution salary stands in as an approximation.
  const grossBenefit = contributionBase * (appliedAveragePercentage / 100);
  const standardPlanBenefitEstimate = minimumTimeReached
    ? Math.min(Math.max(grossBenefit, MINIMUM_WAGE), INSS_CEILING)
    : 0;

  return {
    referenceYear: INSS_REFERENCE_YEAR,
    grossMonthlyIncome,
    contributionBase,
    cappedByCeiling: grossMonthlyIncome > INSS_CEILING,
    raisedToFloor: grossMonthlyIncome > 0 && grossMonthlyIncome < MINIMUM_WAGE,
    standardPlan,
    simplifiedPlan,
    annualCostDifference: standardPlan.annualContribution - simplifiedPlan.annualContribution,
    contributedMonths,
    contributedYears,
    minimumContributionYears,
    minimumRetirementAge: MINIMUM_RETIREMENT_AGE[input.contributorSex],
    standardPlanBenefitEstimate,
    simplifiedPlanBenefitEstimate: MINIMUM_WAGE,
    appliedAveragePercentage,
    minimumTimeReached,
  };
}

/** One line of the page's plan table: what the standard plan costs more, and what it pays more. */
export interface PlanComparisonRow {
  grossMonthlyIncome: number;
  standardMonthly: number;
  simplifiedMonthly: number;
  extraMonthlyCost: number;
  /** Standard-plan benefit after `years` of contribution, by the same estimate as the form. */
  standardBenefit: number;
  /** Always one minimum wage. */
  simplifiedBenefit: number;
}

/**
 * The page's plan table, from the calculator itself: every row is
 * `calculateInssAutonomo` at that income, for a contributor with `years` of
 * contribution under `sex` and the reform rule given.
 */
export function buildPlanComparisonTable(
  incomes: readonly number[],
  years: number,
  sex: InssAutonomoInput["contributorSex"],
  affiliatedBeforeReform: boolean,
): PlanComparisonRow[] {
  return incomes.map((grossMonthlyIncome) => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome,
      contributedMonths: years * 12,
      contributorSex: sex,
      affiliatedBeforeReform,
    });

    return {
      grossMonthlyIncome: result.grossMonthlyIncome,
      standardMonthly: result.standardPlan.monthlyContribution,
      simplifiedMonthly: result.simplifiedPlan.monthlyContribution,
      extraMonthlyCost:
        result.standardPlan.monthlyContribution - result.simplifiedPlan.monthlyContribution,
      standardBenefit: result.standardPlanBenefitEstimate,
      simplifiedBenefit: result.simplifiedPlanBenefitEstimate,
    };
  });
}
