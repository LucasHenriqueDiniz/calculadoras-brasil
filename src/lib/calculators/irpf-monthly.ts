/**
 * The monthly income tax on a salary-like income: a CLT salary or a partner's
 * pró-labore. One definition, because two calculators withhold it and they must
 * agree to the centavo.
 *
 * Lei 9.250/1995, art. 4º, lets the monthly base take either the legal
 * deductions (INSS, dependants, private pension, alimony) or, by § 2º, a flat
 * desconto simplificado "caso seja mais benéfico ao contribuinte". Tax is
 * non-decreasing in the base and the Lei 15.270/2025 reduction depends on the
 * gross alone, so the larger deduction is the more beneficial one; a tie takes
 * the legal route, which costs nothing.
 */

import {
  SIMPLIFIED_DEDUCTION_MONTHLY,
  findMonthlyTaxBracket,
  monthlyReductionLei15270,
} from "./irpf-constants";
import { roundToCentavos } from "./money";

/** Which of art. 4º's two routes to the monthly base the withholding took. */
export type MonthlyDeduction = "legal" | "simplified";

export interface MonthlyIncomeTax {
  legalDeductions: number;
  /** Art. 4º, § 2º: the flat alternative to the legal deductions, capped at the income. */
  simplifiedDeduction: number;
  deductionApplied: MonthlyDeduction;
  assessableBase: number;
  /** What the monthly table produces, before the Lei 15.270/2025 reduction. */
  taxFromTable: number;
  /** The monthly Lei 15.270/2025 reduction applied, never more than the tax due. */
  reductionLei15270: number;
  withheld: number;
}

/**
 * Both the table's tax and the reduction are rounded to the centavo, because
 * both are legally denominated in it and the reduction's first band is a
 * centavo literal. Left in binary floating point, the statute's own exempt case
 * misses by 1.1e-13: the table yields 312,89000000000004 where the law says
 * 312,89, the R$ 312,89 cap then fails to cover it, and an income the statute
 * declares exempt is withheld a sliver of tax.
 */
export function monthlyIncomeTax(grossIncome: number, legalDeductions: number): MonthlyIncomeTax {
  const income = Math.max(grossIncome, 0);
  const legal = Math.max(legalDeductions, 0);
  const simplifiedDeduction = Math.min(SIMPLIFIED_DEDUCTION_MONTHLY, income);
  const deductionApplied: MonthlyDeduction = simplifiedDeduction > legal ? "simplified" : "legal";

  const assessableBase = Math.max(
    income - (deductionApplied === "simplified" ? simplifiedDeduction : legal),
    0,
  );
  const { rate, deduction } = findMonthlyTaxBracket(assessableBase);
  const taxFromTable = roundToCentavos(Math.max(assessableBase * rate - deduction, 0));
  const reductionLei15270 = roundToCentavos(monthlyReductionLei15270(income, taxFromTable));

  return {
    legalDeductions: legal,
    simplifiedDeduction,
    deductionApplied,
    assessableBase,
    taxFromTable,
    reductionLei15270,
    withheld: roundToCentavos(Math.max(taxFromTable - reductionLei15270, 0)),
  };
}
