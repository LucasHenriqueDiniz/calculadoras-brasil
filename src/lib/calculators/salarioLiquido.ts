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
 * Both axes meet here, so every field that could be read either way says which
 * one it is. Where a name carries no axis, the doc comment above it does.
 *
 * The rules themselves live in `irpf-constants.ts`, alongside their sources.
 */

import { calculateEmployeeInss } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_ANNUAL,
  MAX_DEDUCTION_EDUCATION_ANNUAL,
  MAX_SIMPLIFIED_DEDUCTION_MONTHLY,
  SIMPLIFIED_DEDUCTION_RATE_MONTHLY,
  findMonthlyTaxBracket,
  monthlyReductionLei15270,
} from "./irpf-constants";
import { roundToCentavos } from "./money";

export interface NetSalaryInput {
  monthlyGrossSalary: number;
  /** Annual amounts: they feed the annual deduction chain, not the monthly one. */
  dependants: number;
  educationDeduction: number;
  healthDeduction: number;
  supplementaryPensionDeduction: number;
  hasMealAllowance: boolean;
  hasTransportAllowance: boolean;
  hasUnionDue: boolean;
  /**
   * Desconto simplificado instead of the itemised deductions above. It replaces
   * every one of them, dependants included — see `calculateNetSalary`.
   */
  simplifiedRegime: boolean;
}

export interface NetSalaryResult {
  monthlyGrossSalary: number;
  annualGrossSalary: number;
  inssWithheld: number;
  monthlyBaseAfterInss: number;
  /** Annual total of the three itemised deductions, after their caps and floors. */
  totalDeductions: number;
  /** Annual dependant allowance. Reported even under the simplified regime, where it does not apply. */
  dependantAllowance: number;
  /** Annual itemised assessable base. Not what the simplified regime taxes. */
  annualAssessableBase: number;
  /** The monthly base actually taken to the table, whichever regime is in force. */
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
  savings: {
    fromDependants: number;
    fromDeductions: number;
    total: number;
  };
}

export function calculateNetSalary(input: NetSalaryInput): NetSalaryResult {
  const monthlyGrossSalary = Math.max(input.monthlyGrossSalary, 0);
  const annualGrossSalary = monthlyGrossSalary * 12;

  // 1. employee INSS: progressive per bracket and capped at the RGPS ceiling.
  //    Each rate applies only to the slice of the salary inside its bracket.
  const inssWithheld = calculateEmployeeInss(monthlyGrossSalary);

  // 2. IRPF base after INSS
  const monthlyBaseAfterInss = monthlyGrossSalary - inssWithheld;

  // 3. annual itemised deductions.
  //    Health is uncapped on purpose: no official ceiling was found for it.
  const educationDeduction = Math.min(
    Math.max(input.educationDeduction, 0),
    MAX_DEDUCTION_EDUCATION_ANNUAL,
  );
  const healthDeduction = Math.max(input.healthDeduction, 0);
  const supplementaryPensionDeduction = Math.max(input.supplementaryPensionDeduction, 0);
  const totalDeductions = educationDeduction + healthDeduction + supplementaryPensionDeduction;

  const annualCalculationBase = Math.max(monthlyBaseAfterInss * 12 - totalDeductions, 0);
  const dependantAllowance = Math.max(input.dependants, 0) * DEDUCTION_PER_DEPENDENT_ANNUAL;
  const annualAssessableBase = Math.max(annualCalculationBase - dependantAllowance, 0);

  // 4. the monthly base the table is applied to.
  //
  //    Itemised: the annual chain above, spread evenly over the year.
  //    Simplified: the desconto simplificado REPLACES every legal deduction —
  //    INSS and dependants included — so it starts again from the gross salary.
  //    The Receita's own worked example confirms the shape: R$ 5.000,00 less the
  //    R$ 607,20 ceiling gives a base of R$ 4.392,80 — the gross less the ceiling,
  //    with no INSS taken off first.
  const monthlyAssessableBase = input.simplifiedRegime
    ? Math.max(
        monthlyGrossSalary -
          Math.min(
            monthlyGrossSalary * SIMPLIFIED_DEDUCTION_RATE_MONTHLY,
            MAX_SIMPLIFIED_DEDUCTION_MONTHLY,
          ),
        0,
      )
    : annualAssessableBase / 12;

  // 5. monthly IRPF withheld: the table, then the reduction on top of it.
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

  // 6. union dues
  const unionDue = input.hasUnionDue ? monthlyGrossSalary * 0.0033 : 0; // roughly one hour of pay

  // 7. transport allowance, deducted from the gross
  const transportAllowanceDeduction = input.hasTransportAllowance
    ? Math.min(monthlyGrossSalary * 0.06, 250)
    : 0;

  // 8. net salary
  const monthlyNetSalary =
    monthlyGrossSalary -
    inssWithheld -
    estimatedIrpfWithheld -
    unionDue -
    transportAllowanceDeduction;

  // 9. non-taxable benefits
  const nonTaxableBenefits = input.hasMealAllowance ? 360 : 0; // roughly R$ 360/month in meal allowance

  // 10. monthly share of what the itemised deductions took off the base.
  //     Zero under the simplified regime, where neither of them reduces anything.
  const savingsFromDependants = input.simplifiedRegime ? 0 : dependantAllowance / 12;
  const savingsFromDeductions = input.simplifiedRegime ? 0 : totalDeductions / 12;

  const effectiveIrpfRate =
    monthlyGrossSalary > 0 ? (estimatedIrpfWithheld / monthlyGrossSalary) * 100 : 0;

  return {
    monthlyGrossSalary,
    annualGrossSalary,
    inssWithheld,
    monthlyBaseAfterInss,
    totalDeductions,
    dependantAllowance,
    annualAssessableBase,
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
    savings: {
      fromDependants: savingsFromDependants,
      fromDeductions: savingsFromDeductions,
      total: savingsFromDependants + savingsFromDeductions,
    },
  };
}
