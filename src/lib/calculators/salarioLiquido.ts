/**
 * Net salary calculator.
 * Turns a gross salary into a net one, accounting for IRPF, INSS and union dues.
 *
 * This module answers a MONTHLY question — what lands in the bank account this
 * month — so it computes the monthly withholding (IRRF) rather than the annual
 * adjustment. That choice decides which half of the 2026 legislation applies:
 * the monthly incidence table and the monthly Lei 15.270/2025 reduction, both of
 * which differ from their annual counterparts by more than a factor of twelve.
 *
 * It also decides which deductions exist. Lei 9.250/1995, art. 4º, lists what
 * the MONTHLY base may deduct: the INSS contribution, a fixed amount per
 * dependant, private pension contributions, court-ordered alimony and two items
 * outside this calculator's scope. Health and education are not on that list:
 * they are art. 8º, the annual adjustment, and belong to the IRPF calculator.
 * Against all of those, § 2º offers a flat desconto simplificado "caso seja mais
 * benéfico ao contribuinte" — so the month is taxed on whichever of the two
 * lowers the base more, and the visitor does not get to pick the worse one.
 *
 * Every amount here is monthly unless its name says otherwise.
 * The rules themselves live in `irpf-constants.ts`, alongside their sources.
 */

import { calculateEmployeeInss } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_MONTHLY,
  SIMPLIFIED_DEDUCTION_MONTHLY,
  findMonthlyTaxBracket,
  monthlyReductionLei15270,
} from "./irpf-constants";
import { roundToCentavos } from "./money";

export interface NetSalaryInput {
  monthlyGrossSalary: number;
  dependants: number;
  /** Monthly contribution to a PGBL-type private pension plan: art. 4º, V. */
  monthlyPrivatePension: number;
  hasMealAllowance: boolean;
  hasTransportAllowance: boolean;
  hasUnionDue: boolean;
}

/** Which of art. 4º's two routes to the monthly base the withholding took. */
export type MonthlyDeduction = "legal" | "simplified";

export interface NetSalaryResult {
  monthlyGrossSalary: number;
  annualGrossSalary: number;
  inssWithheld: number;
  /** Art. 4º, III: R$ 189,59 per dependant. */
  dependantAllowance: number;
  /** Art. 4º, V. */
  privatePensionDeduction: number;
  /** INSS, dependants and private pension: every art. 4º deduction this page asks about. */
  legalDeductions: number;
  /** Art. 4º, § 2º: the flat alternative to all of the above, capped at the gross. */
  simplifiedDeduction: number;
  /** The more beneficial of the two, which is the one the law applies. */
  deductionApplied: MonthlyDeduction;
  monthlyAssessableBase: number;
  /** What the monthly table produces, before the Lei 15.270/2025 reduction. */
  taxFromTable: number;
  /** The monthly Lei 15.270/2025 reduction applied, never more than the tax due. */
  reductionLei15270: number;
  estimatedIrpfWithheld: number;
  unionDue: number;
  transportAllowanceDeduction: number;
  monthlyNetSalary: number;
  annualNetSalary: number;
  nonTaxableBenefits: number;
  totalMonthlyIncome: number;
  effectiveIrpfRate: number;
}

export function calculateNetSalary(input: NetSalaryInput): NetSalaryResult {
  const monthlyGrossSalary = Math.max(input.monthlyGrossSalary, 0);
  const annualGrossSalary = monthlyGrossSalary * 12;

  // 1. employee INSS: progressive per bracket and capped at the RGPS ceiling.
  //    Each rate applies only to the slice of the salary inside its bracket.
  const inssWithheld = calculateEmployeeInss(monthlyGrossSalary);

  // 2. the two routes to the monthly base. Tax is non-decreasing in the base and
  //    the reduction depends on the gross alone, so the larger deduction is the
  //    more beneficial one; a tie takes the legal route, which costs nothing.
  const dependantAllowance = Math.max(input.dependants, 0) * DEDUCTION_PER_DEPENDENT_MONTHLY;
  const privatePensionDeduction = Math.max(input.monthlyPrivatePension, 0);
  const legalDeductions = inssWithheld + dependantAllowance + privatePensionDeduction;
  const simplifiedDeduction = Math.min(SIMPLIFIED_DEDUCTION_MONTHLY, monthlyGrossSalary);
  const deductionApplied: MonthlyDeduction =
    simplifiedDeduction > legalDeductions ? "simplified" : "legal";

  const monthlyAssessableBase = Math.max(
    monthlyGrossSalary -
      (deductionApplied === "simplified" ? simplifiedDeduction : legalDeductions),
    0,
  );

  // 3. monthly IRPF withheld: the table, then the reduction on top of it.
  //
  //    Both are rounded to the centavo, because both are legally denominated in
  //    it and the reduction's first band is a centavo literal. Left in binary
  //    floating point, the statute's own exempt case misses by 1.1e-13: the table
  //    yields 312,89000000000004 where the law says 312,89, the R$ 312,89 cap
  //    then fails to cover it, and a salary the statute declares exempt is
  //    withheld a sliver of tax.
  const { rate, deduction } = findMonthlyTaxBracket(monthlyAssessableBase);
  const taxFromTable = roundToCentavos(Math.max(monthlyAssessableBase * rate - deduction, 0));
  const reductionLei15270 = roundToCentavos(
    monthlyReductionLei15270(monthlyGrossSalary, taxFromTable),
  );
  const estimatedIrpfWithheld = roundToCentavos(Math.max(taxFromTable - reductionLei15270, 0));

  // 4. union dues
  const unionDue = input.hasUnionDue ? monthlyGrossSalary * 0.0033 : 0; // roughly one hour of pay

  // 5. transport allowance, deducted from the gross
  const transportAllowanceDeduction = input.hasTransportAllowance
    ? Math.min(monthlyGrossSalary * 0.06, 250)
    : 0;

  // 6. net salary
  const monthlyNetSalary =
    monthlyGrossSalary -
    inssWithheld -
    estimatedIrpfWithheld -
    unionDue -
    transportAllowanceDeduction;

  // 7. non-taxable benefits
  const nonTaxableBenefits = input.hasMealAllowance ? 360 : 0; // roughly R$ 360/month in meal allowance

  const effectiveIrpfRate =
    monthlyGrossSalary > 0 ? (estimatedIrpfWithheld / monthlyGrossSalary) * 100 : 0;

  return {
    monthlyGrossSalary,
    annualGrossSalary,
    inssWithheld,
    dependantAllowance,
    privatePensionDeduction,
    legalDeductions,
    simplifiedDeduction,
    deductionApplied,
    monthlyAssessableBase,
    taxFromTable,
    reductionLei15270,
    estimatedIrpfWithheld,
    unionDue,
    transportAllowanceDeduction,
    monthlyNetSalary,
    annualNetSalary: monthlyNetSalary * 12,
    nonTaxableBenefits,
    totalMonthlyIncome: monthlyNetSalary + nonTaxableBenefits,
    effectiveIrpfRate,
  };
}

/** One line of the page's salary table: the breakdown a visitor would get for that gross. */
export interface NetSalaryTableRow {
  monthlyGrossSalary: number;
  inssWithheld: number;
  deductionApplied: MonthlyDeduction;
  /** What the applied route took off the base. */
  baseDeduction: number;
  taxFromTable: number;
  reductionLei15270: number;
  estimatedIrpfWithheld: number;
  monthlyNetSalary: number;
  /** Net as a share of gross, 0–1. */
  netShare: number;
}

/**
 * The page's table, built by the calculator itself. Every row is exactly what
 * typing that gross into the form returns, with no benefits, union due or
 * pension, because it IS that call: a table that could disagree with the form
 * would be a second calculator.
 */
export function buildNetSalaryTable(
  grossSalaries: readonly number[],
  dependants = 0,
): NetSalaryTableRow[] {
  return grossSalaries.map((monthlyGrossSalary) => {
    const result = calculateNetSalary({
      monthlyGrossSalary,
      dependants,
      monthlyPrivatePension: 0,
      hasMealAllowance: false,
      hasTransportAllowance: false,
      hasUnionDue: false,
    });

    return {
      monthlyGrossSalary: result.monthlyGrossSalary,
      inssWithheld: result.inssWithheld,
      deductionApplied: result.deductionApplied,
      baseDeduction:
        result.deductionApplied === "simplified"
          ? result.simplifiedDeduction
          : result.legalDeductions,
      taxFromTable: result.taxFromTable,
      reductionLei15270: result.reductionLei15270,
      estimatedIrpfWithheld: result.estimatedIrpfWithheld,
      monthlyNetSalary: result.monthlyNetSalary,
      netShare:
        result.monthlyGrossSalary > 0 ? result.monthlyNetSalary / result.monthlyGrossSalary : 0,
    };
  });
}

/**
 * The gross at which the legal deductions of a worker with `dependants`
 * dependants reach the flat simplified discount: below it, art. 4º § 2º's route
 * is the more beneficial. Bisection, because INSS is progressive and capped.
 * Returns 0 when the dependants alone already exceed the discount.
 */
export function simplifiedRouteCeiling(dependants = 0): number {
  const needed =
    SIMPLIFIED_DEDUCTION_MONTHLY - Math.max(dependants, 0) * DEDUCTION_PER_DEPENDENT_MONTHLY;
  if (needed <= 0) return 0;

  let low = 0;
  let high = 20_000;
  for (let step = 0; step < 100; step += 1) {
    const middle = (low + high) / 2;
    if (calculateEmployeeInss(middle) < needed) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return roundToCentavos((low + high) / 2);
}
