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
import { DEDUCTION_PER_DEPENDENT_MONTHLY, SIMPLIFIED_DEDUCTION_MONTHLY } from "./irpf-constants";
import { monthlyIncomeTax, type MonthlyDeduction } from "./irpf-monthly";
import { roundToCentavos } from "./money";

export type { MonthlyDeduction } from "./irpf-monthly";

export interface NetSalaryInput {
  monthlyGrossSalary: number;
  dependants: number;
  /** Monthly contribution to a PGBL-type private pension plan: art. 4º, V. */
  monthlyPrivatePension: number;
  /** The meal or food allowance credited each month, as the payslip shows it. */
  monthlyMealAllowance: number;
  /** What the commute costs a month; zero when the worker takes no vale-transporte. */
  monthlyTransportCost: number;
  /** Whether the worker authorised the contribuição sindical (CLT, art. 579). */
  hasUnionDue: boolean;
}

/** Lei 7.418/1985, art. 4º, parágrafo único: the worker's share of the commute. */
export const TRANSPORT_EMPLOYEE_SHARE = 0.06;

/**
 * What the worker pays towards the vale-transporte: 6% of the base salary, but
 * never more than the commute costs, because the employer pays only what
 * exceeds that 6%. It used to be min(6%, R$ 250), an invented cap: on R$ 6.000
 * with a R$ 400 commute it took R$ 250 where the law takes R$ 360.
 */
export function transportEmployeeShare(monthlyGrossSalary: number, monthlyTransportCost: number) {
  return roundToCentavos(
    Math.min(
      Math.max(monthlyTransportCost, 0),
      Math.max(monthlyGrossSalary, 0) * TRANSPORT_EMPLOYEE_SHARE,
    ),
  );
}

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
  /**
   * The contribuição sindical, when authorised: one day's pay, deducted once a
   * year from March's payroll (CLT, arts. 580, I, and 582). It is not part of
   * the monthly net; it used to be taken every month at 0,33% of the gross.
   */
  unionDueInMarch: number;
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

  // 2. the monthly income tax: art. 4º's more beneficial route, the table, then
  //    the Lei 15.270/2025 reduction. Shared with the CLT vs PJ calculator.
  const dependantAllowance = Math.max(input.dependants, 0) * DEDUCTION_PER_DEPENDENT_MONTHLY;
  const privatePensionDeduction = Math.max(input.monthlyPrivatePension, 0);
  const tax = monthlyIncomeTax(
    monthlyGrossSalary,
    inssWithheld + dependantAllowance + privatePensionDeduction,
  );
  const {
    legalDeductions,
    simplifiedDeduction,
    deductionApplied,
    taxFromTable,
    reductionLei15270,
  } = tax;
  const monthlyAssessableBase = tax.assessableBase;
  const estimatedIrpfWithheld = tax.withheld;

  // 3. the contribuição sindical: one day of a monthly salary, in March only
  const unionDueInMarch = input.hasUnionDue ? roundToCentavos(monthlyGrossSalary / 30) : 0;

  // 4. the worker's share of the vale-transporte, deducted from the gross
  const transportAllowanceDeduction = transportEmployeeShare(
    monthlyGrossSalary,
    input.monthlyTransportCost,
  );

  // 5. net salary
  const monthlyNetSalary =
    monthlyGrossSalary - inssWithheld - estimatedIrpfWithheld - transportAllowanceDeduction;

  // 6. non-taxable benefits: the meal allowance the worker says they receive
  const nonTaxableBenefits = Math.max(input.monthlyMealAllowance, 0);

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
    unionDueInMarch,
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
      monthlyMealAllowance: 0,
      monthlyTransportCost: 0,
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
