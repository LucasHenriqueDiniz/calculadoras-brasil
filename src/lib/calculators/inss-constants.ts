/**
 * INSS reference parameters used by the calculators.
 *
 * IMPORTANT: these are reference values and must be reviewed every time the
 * minimum wage and the contribution table are adjusted. The site's calculators
 * show educational estimates — the official amount is always the one assessed by
 * INSS/Receita Federal.
 */

/** Base year of the table below. Shown alongside the estimates. */
export const INSS_REFERENCE_YEAR = 2026;

/** National minimum wage for the reference year (floor of the contribution salary). */
export const MINIMUM_WAGE = 1621.0;

/** RGPS contribution-salary ceiling for the reference year. */
export const INSS_CEILING = 8475.55;

/**
 * Progressive contribution brackets for an employed insured worker.
 * `upTo` is the upper bound of the bracket; the rate applies only to the slice of
 * the salary that falls inside the bracket (marginal, not cumulative).
 *
 * Cross-check: applied to the ceiling, these brackets yield a maximum
 * contribution of R$ 988,09, which is the maximum deduction published for 2026.
 */
export const INSS_EMPLOYEE_BRACKETS = [
  { upTo: 1621.0, rate: 0.075 },
  { upTo: 2902.84, rate: 0.09 },
  { upTo: 4354.27, rate: 0.12 },
  { upTo: INSS_CEILING, rate: 0.14 },
] as const;

/**
 * Progressive contribution of an employed insured worker, capped at the ceiling.
 * Each bracket applies only to the slice of the salary it contains.
 */
export function calculateEmployeeInss(monthlyGrossSalary: number): number {
  const base = Math.min(Math.max(monthlyGrossSalary, 0), INSS_CEILING);
  let contribution = 0;
  let bracketFloor = 0;

  for (const bracket of INSS_EMPLOYEE_BRACKETS) {
    if (base <= bracketFloor) break;
    const portion = Math.min(base, bracket.upTo) - bracketFloor;
    contribution += portion * bracket.rate;
    bracketFloor = bracket.upTo;
  }

  return contribution;
}

/**
 * Contribution salary of a self-employed contributor: the declared income,
 * clamped between the floor (minimum wage) and the RGPS ceiling.
 */
export function contributionSalary(monthlyIncome: number): number {
  return Math.min(Math.max(monthlyIncome, MINIMUM_WAGE), INSS_CEILING);
}
