import { compareIrpfRegimes } from "./irpf";

export interface SupplementaryPensionInput {
  monthlyPgblContribution: number;
  annualReturnRate: number;
  yearsToRetirement: number;
  /**
   * The visitor's annual taxable income. It sets the 12% cap on the deduction and
   * the tax the deduction is taken from. It replaced a fixed marginal rate the
   * visitor could not even see.
   */
  grossAnnualIncome: number;
}

export interface SupplementaryPensionYear {
  year: number;
  balance: number;
  earnings: number;
}

export interface SupplementaryPensionResult {
  monthlyPgblContribution: number;
  annualPgblContribution: number;
  /** The part of the contribution the complete return can deduct: at most 12% of income. */
  deductibleAnnualContribution: number;
  /** The year's tax on the better return, without and with the PGBL. */
  taxWithoutPgbl: number;
  taxWithPgbl: number;
  /** Which return is the better one once the PGBL is in. */
  regimeWithPgbl: "legal" | "simplified";
  monthlyIrpfSaving: number;
  annualIrpfSaving: number;
  /**
   * The balance at the horizon the visitor asked for. This is the answer the
   * page headlines; the three fixed marks below are comparison points and must
   * not stand in for it.
   */
  balanceAtHorizon: number;
  balanceAt10Years: number;
  balanceAt20Years: number;
  balanceAt30Years: number;
  totalEarnings: number;
  projection: SupplementaryPensionYear[];
}

/** Years the projection samples, out of every year it walks. */
function isSampledYear(year: number): boolean {
  return year === 1 || year === 5 || year % 10 === 0;
}

/**
 * Walks the balance year by year. One deposit of `annualContribution` at the
 * END of each year, so the first year earns nothing: this is the convention the
 * whole module is written in, and it matches the ordinary-annuity closed form
 * `C · ((1 + r)^n − 1) / r`.
 */
function projectYearByYear(
  annualContribution: number,
  annualRate: number,
  years: number,
): SupplementaryPensionYear[] {
  const series: SupplementaryPensionYear[] = [];
  let balance = 0;

  for (let year = 1; year <= years; year++) {
    const earnings = balance * annualRate;
    balance = balance + earnings + annualContribution;
    series.push({ year, balance, earnings });
  }

  return series;
}

const FIXED_MARKS = 30;

export function calculateSupplementaryPension(
  input: SupplementaryPensionInput,
): SupplementaryPensionResult {
  const annualContribution = input.monthlyPgblContribution * 12;
  const annualRate = input.annualReturnRate / 100;

  // IRPF saving: the year's tax on the better return without the PGBL, less the
  // same with it. Not "contribution × marginal rate", which this used to be: the
  // deduction only exists in the complete return, stops at 12% of income, and
  // first has to overtake the simplified discount the visitor would otherwise
  // take — at R$ 120.000 a R$ 12.000 PGBL saves R$ 1.709,70, not R$ 3.300.
  const saving = pgblTaxSaving(input.grossAnnualIncome, annualContribution);
  const annualIrpfSaving = saving.annualSaving;
  const monthlyIrpfSaving = annualIrpfSaving / 12;

  // the visitor's own horizon
  const horizon = projectYearByYear(annualContribution, annualRate, input.yearsToRetirement);
  const balanceAtHorizon = horizon.at(-1)?.balance ?? 0;
  const totalEarnings = balanceAtHorizon - annualContribution * input.yearsToRetirement;

  // fixed comparison marks, always the same years whatever the horizon is
  const marks = projectYearByYear(annualContribution, annualRate, FIXED_MARKS);
  const balanceAtYear = (year: number) => marks[year - 1]?.balance ?? 0;

  return {
    monthlyPgblContribution: input.monthlyPgblContribution,
    annualPgblContribution: annualContribution,
    deductibleAnnualContribution: saving.deductibleAnnualContribution,
    taxWithoutPgbl: saving.taxWithout,
    taxWithPgbl: saving.taxWith,
    regimeWithPgbl: saving.regimeWith,
    monthlyIrpfSaving,
    annualIrpfSaving,
    balanceAtHorizon,
    balanceAt10Years: balanceAtYear(10),
    balanceAt20Years: balanceAtYear(20),
    balanceAt30Years: balanceAtYear(30),
    totalEarnings,
    projection: horizon.filter((point) => isSampledYear(point.year)),
  };
}

/** What a year's PGBL contribution takes off a year's income tax, by the IRPF calculator itself. */
export function pgblTaxSaving(grossAnnualIncome: number, annualContribution: number) {
  const income = Math.max(grossAnnualIncome, 0);
  const contribution = Math.max(annualContribution, 0);
  const none = { dependants: 0, educationDeduction: 0, healthDeduction: 0 };
  const without = compareIrpfRegimes({
    ...none,
    grossAnnualIncome: income,
    supplementaryPensionDeduction: 0,
  });
  const withPgbl = compareIrpfRegimes({
    ...none,
    grossAnnualIncome: income,
    supplementaryPensionDeduction: contribution,
  });
  const taxWithout = without[without.better].taxDue;
  const taxWith = withPgbl[withPgbl.better].taxDue;

  return {
    deductibleAnnualContribution: withPgbl.legal.supplementaryPensionDeduction,
    taxWithout,
    taxWith,
    regimeWith: withPgbl.better,
    annualSaving: Math.max(taxWithout - taxWith, 0),
  };
}

/** One line of the page's PGBL table. */
export interface PgblSavingRow {
  grossAnnualIncome: number;
  /** 12% of income: the most the deduction can take. */
  annualContribution: number;
  taxWithout: number;
  taxWith: number;
  saving: number;
  /** Saving as a share of the contribution: what each real put in returns this year. */
  savingShare: number;
}

/** The page's table: a PGBL at the full 12% cap, at each income. */
export function buildPgblSavingTable(incomes: readonly number[]): PgblSavingRow[] {
  return incomes.map((grossAnnualIncome) => {
    const annualContribution = grossAnnualIncome * 0.12;
    const saving = pgblTaxSaving(grossAnnualIncome, annualContribution);

    return {
      grossAnnualIncome,
      annualContribution,
      taxWithout: saving.taxWithout,
      taxWith: saving.taxWith,
      saving: saving.annualSaving,
      savingShare: annualContribution > 0 ? saving.annualSaving / annualContribution : 0,
    };
  });
}
