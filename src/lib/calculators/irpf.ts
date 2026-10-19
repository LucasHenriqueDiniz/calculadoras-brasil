/**
 * IRPF 2026 Calculator
 * Computes Brazilian personal income tax (IRPF) under the 2026 legislation.
 *
 * This module answers an ANNUAL question — the ajuste anual — so it reaches for
 * the annual half of `irpf-constants.ts`. The monthly half belongs to the
 * net-salary and CLT-vs-PJ calculators, and is not this one divided by twelve.
 *
 * Every figure here is annual, which is why no field repeats the word: the axis
 * is stated once, at the door, by `grossAnnualIncome`.
 */

import { calculateEmployeeInss } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_ANNUAL,
  MAX_DEDUCTION_EDUCATION_ANNUAL,
  MAX_SIMPLIFIED_DEDUCTION_ANNUAL,
  SIMPLIFIED_DEDUCTION_RATE_ANNUAL,
  annualReductionLei15270,
  findAnnualTaxBracket,
} from "./irpf-constants";

export interface IrpfInput {
  grossAnnualIncome: number;
  dependants: number;
  educationDeduction: number;
  healthDeduction: number;
  supplementaryPensionDeduction: number;
  simplifiedRegime: boolean;
}

export interface IrpfResult {
  grossAnnualIncome: number;
  inssWithheld: number;
  simplifiedCalculationBase: number;
  educationDeduction: number;
  healthDeduction: number;
  supplementaryPensionDeduction: number;
  totalDeductions: number;
  fullCalculationBase: number;
  dependantAllowance: number;
  assessableBase: number;
  effectiveRate: number;
  /** What the progressive table produces, before the Lei 15.270/2025 reduction. */
  taxFromTable: number;
  /** The Lei 15.270/2025 reduction actually applied, never more than the tax due. */
  reductionLei15270: number;
  /** What is actually owed: the table's figure less the reduction, floored at zero. */
  calculatedTax: number;
  taxDue: number;
  /** Product text: a percentage, or the Portuguese word for the exempt band. */
  marginalRate: string;
}

/** PGBL contributions deduct up to this share of taxable income. */
const MAX_PENSION_SHARE_OF_INCOME = 0.12;

/**
 * Computes personal income tax.
 * Follows the Receita Federal progressive rules for 2026.
 */
export function calculateIrpf(input: IrpfInput): IrpfResult {
  // basic validation
  if (input.grossAnnualIncome < 0) {
    throw new Error("Gross income cannot be negative");
  }
  if (input.dependants < 0) {
    throw new Error("Number of dependants cannot be negative");
  }

  const { grossAnnualIncome } = input;

  // 1. INSS deduction (withheld at source).
  // Variation: a self-employed worker already pays INSS as a contribution; an
  // employee has it withheld.
  //
  // The brackets are monthly and this module is annual, so the contribution is
  // computed on the monthly salary and annualised. What matters is not the rate
  // but the ceiling: a flat percentage of gross income has none, and deducted
  // R$ 50.000 from an income of R$ 500.000 against a legal maximum of R$ 11.857.
  const inssWithheld = calculateEmployeeInss(grossAnnualIncome / 12) * 12;

  // 2. taxable base after INSS
  const baseAfterInss = grossAnnualIncome - inssWithheld;

  // 3. determine the allowed deductions (Lei 9.250/1995, art. 8º, II).
  //    Education, "b": "até o limite anual individual" — per person, so the
  //    taxpayer and each dependant carry their own. With one total on the form,
  //    the most it can hold is that limit times the people it may cover.
  //    Health, "a": no limit at all. The R$ 2.666,67 cap this used to apply was
  //    invented, and its own comment said so.
  //    See docs/research/2026-10-18-adsense-added-value/fetches/planalto-lei-9250-1995-art-8.md.
  const educationDeduction = Math.min(
    Math.max(input.educationDeduction, 0),
    MAX_DEDUCTION_EDUCATION_ANNUAL * (1 + input.dependants),
  );
  const healthDeduction = Math.max(input.healthDeduction, 0);
  // Private pension (PGBL): "até o limite de 12% do rendimento tributável", per the
  // Receita's own FAQ (docs/research/2026-09-05-filing-and-pension-limits/). The
  // page already said so; the module took any amount.
  const supplementaryPensionDeduction = Math.min(
    Math.max(input.supplementaryPensionDeduction, 0),
    MAX_PENSION_SHARE_OF_INCOME * grossAnnualIncome,
  );

  const totalDeductions = educationDeduction + healthDeduction + supplementaryPensionDeduction;

  // 4. full calculation base
  const fullCalculationBase = Math.max(baseAfterInss - totalDeductions, 0);

  // 5. dependant deduction (R$ 2.275 per dependant in 2026)
  const dependantAllowance = input.dependants * DEDUCTION_PER_DEPENDENT_ANNUAL;

  // 6. assessable base (full base minus dependants)
  const assessableBase = Math.max(fullCalculationBase - dependantAllowance, 0);

  // 7. compute IRPF according to the chosen regime
  let calculatedTax = 0;
  let marginalRate = "Isento";
  let simplifiedCalculationBase = 0;

  if (input.simplifiedRegime) {
    // Simplified regime: 20% of gross income, capped.
    //
    // The desconto simplificado REPLACES every deduction the legislation allows —
    // dependants included. Subtracting `dependantAllowance` here as well, which
    // this branch used to do, takes one of them twice. `dependantAllowance` is
    // still reported in the result; it just does not reduce the tax under this
    // regime.
    const simplifiedDiscount = Math.min(
      grossAnnualIncome * SIMPLIFIED_DEDUCTION_RATE_ANNUAL,
      MAX_SIMPLIFIED_DEDUCTION_ANNUAL,
    );
    simplifiedCalculationBase = Math.max(grossAnnualIncome - simplifiedDiscount, 0);

    const { rate, deduction } = findAnnualTaxBracket(simplifiedCalculationBase);
    calculatedTax = Math.max(simplifiedCalculationBase * rate - deduction, 0);
    marginalRate = rate > 0 ? `${(rate * 100).toFixed(1).replace(".", ",")}%` : "Isento";
  } else {
    // full regime: itemised deductions
    simplifiedCalculationBase = fullCalculationBase;
    const { rate, deduction } = findAnnualTaxBracket(assessableBase);
    calculatedTax = Math.max(assessableBase * rate - deduction, 0);
    marginalRate = rate > 0 ? `${(rate * 100).toFixed(1).replace(".", ",")}%` : "Isento";
  }

  // 8. Lei 15.270/2025 reduction, applied to the tax the table produced.
  const taxFromTable = calculatedTax;
  const reductionLei15270 = annualReductionLei15270(grossAnnualIncome, taxFromTable);

  // 9. what is actually owed
  calculatedTax = Math.max(taxFromTable - reductionLei15270, 0);
  const taxDue = calculatedTax;

  // 10. effective rate, on what is owed rather than on what the table said
  const effectiveRate = grossAnnualIncome > 0 ? (taxDue / grossAnnualIncome) * 100 : 0;

  return {
    grossAnnualIncome,
    inssWithheld,
    simplifiedCalculationBase,
    educationDeduction,
    healthDeduction,
    supplementaryPensionDeduction,
    totalDeductions,
    fullCalculationBase,
    dependantAllowance,
    assessableBase,
    effectiveRate,
    taxFromTable,
    reductionLei15270,
    calculatedTax,
    taxDue,
    marginalRate,
  };
}

/** The two ways to file, side by side, and which one owes less. */
export interface IrpfRegimeComparison {
  /** Declaração completa: the legal deductions. */
  legal: IrpfResult;
  /** Desconto simplificado: 20% of income, capped, in place of every deduction. */
  simplified: IrpfResult;
  better: "legal" | "simplified";
  /** How much less the better one owes. Zero when they tie. */
  saving: number;
}

/**
 * Both regimes for the same income, as the declaration program shows them: the
 * taxpayer chooses, so the page shows what each choice costs instead of asking
 * the visitor to guess. A tie goes to the simplified one, which needs no receipts.
 */
export function compareIrpfRegimes(
  input: Omit<IrpfInput, "simplifiedRegime">,
): IrpfRegimeComparison {
  const legal = calculateIrpf({ ...input, simplifiedRegime: false });
  const simplified = calculateIrpf({ ...input, simplifiedRegime: true });
  const better = legal.taxDue < simplified.taxDue ? "legal" : "simplified";

  return {
    legal,
    simplified,
    better,
    saving: Math.abs(legal.taxDue - simplified.taxDue),
  };
}

/** One line of the page's regime table: what tips a given income from simplified to complete. */
export interface RegimeThresholdRow {
  grossAnnualIncome: number;
  inssWithheld: number;
  simplifiedDiscount: number;
  /**
   * Further deductions — dependants, health, education, private pension — the
   * declaração completa needs before it owes less than the simplified one.
   * Zero once INSS alone already exceeds the simplified discount; null when the
   * simplified return owes nothing, so there is nothing to beat.
   */
  deductionsToBeatSimplified: number | null;
  taxSimplified: number;
}

/**
 * The page's regime table, from the calculator itself. Both regimes are taxed by
 * the same table and the same reduction on the same gross, so the complete one
 * owes less exactly when its deductions pass the simplified discount.
 */
export function buildRegimeThresholdTable(incomes: readonly number[]): RegimeThresholdRow[] {
  return incomes.map((grossAnnualIncome) => {
    const none = {
      dependants: 0,
      educationDeduction: 0,
      healthDeduction: 0,
      supplementaryPensionDeduction: 0,
    };
    const simplified = calculateIrpf({ ...none, grossAnnualIncome, simplifiedRegime: true });
    const simplifiedDiscount = grossAnnualIncome - simplified.simplifiedCalculationBase;

    return {
      grossAnnualIncome,
      inssWithheld: simplified.inssWithheld,
      simplifiedDiscount,
      // Both regimes share the table and the reduction, which depends on the gross
      // alone; so once the simplified return owes something, any lower base owes
      // strictly less, and below that point both owe nothing.
      deductionsToBeatSimplified:
        simplified.taxDue > 0 ? Math.max(simplifiedDiscount - simplified.inssWithheld, 0) : null,
      taxSimplified: simplified.taxDue,
    };
  });
}
