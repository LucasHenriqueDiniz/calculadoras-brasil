export interface SupplementaryPensionInput {
  monthlyPgblContribution: number;
  annualReturnRate: number;
  yearsToRetirement: number;
  currentIrpfRate: number;
}

export interface SupplementaryPensionYear {
  year: number;
  balance: number;
  earnings: number;
}

export interface SupplementaryPensionResult {
  monthlyPgblContribution: number;
  annualPgblContribution: number;
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

  // IRPF savings (deductible contribution)
  const monthlyIrpfSaving = input.monthlyPgblContribution * (input.currentIrpfRate / 100);
  const annualIrpfSaving = monthlyIrpfSaving * 12;

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
