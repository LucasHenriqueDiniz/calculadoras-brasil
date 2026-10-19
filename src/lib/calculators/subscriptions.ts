export type BillingCycle = "weekly" | "monthly" | "quarterly" | "annual";

export interface SubscriptionInput {
  id: string;
  name: string;
  category: string;
  value: number;
  cycle: BillingCycle;
  keep: boolean;
}

export function calculateSubscriptions(items: SubscriptionInput[]) {
  const normalized = items.map((item) => {
    const value = Number.isFinite(item.value) && item.value > 0 ? item.value : 0;
    const monthly =
      item.cycle === "weekly"
        ? (value * 52) / 12
        : item.cycle === "quarterly"
          ? value / 3
          : item.cycle === "annual"
            ? value / 12
            : value;
    return { ...item, monthly, annual: monthly * 12 };
  });
  const active = normalized.filter((item) => item.keep);
  const monthlyTotal = active.reduce((sum, item) => sum + item.monthly, 0);
  const originalMonthly = normalized.reduce((sum, item) => sum + item.monthly, 0);
  const monthlySavings = originalMonthly - monthlyTotal;
  const top = [...active].sort((a, b) => b.monthly - a.monthly)[0] ?? null;

  return {
    items: normalized,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    threeYearTotal: monthlyTotal * 36,
    fiveYearTotal: monthlyTotal * 60,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    top,
  };
}

/** What paying a plan yearly is worth against paying it month by month. */
export interface AnnualPlanComparison {
  monthly: number;
  annual: number;
  /** The annual plan spread over twelve months, as the calculator records an annual cycle. */
  annualPerMonth: number;
  /** Twelve monthly payments less the annual price. */
  yearlySaving: number;
  /** The saving as a share of twelve monthly payments: 0,3 is 30%. */
  savingShare: number;
  /**
   * How many monthly payments the annual price buys. Keeping the service at
   * least this many months makes the annual plan the cheaper choice; fewer,
   * and paying monthly then cancelling costs less.
   */
  breakEvenMonths: number;
}

export function compareAnnualPlan(monthly: number, annual: number): AnnualPlanComparison {
  const [monthlyPlan, annualPlan] = calculateSubscriptions([
    { id: "monthly", name: "", category: "", value: monthly, cycle: "monthly", keep: true },
    { id: "annual", name: "", category: "", value: annual, cycle: "annual", keep: true },
  ]).items;

  return {
    monthly: monthlyPlan.monthly,
    annual: annualPlan.annual,
    annualPerMonth: annualPlan.monthly,
    yearlySaving: monthlyPlan.annual - annualPlan.annual,
    savingShare: monthlyPlan.annual > 0 ? 1 - annualPlan.annual / monthlyPlan.annual : 0,
    breakEvenMonths: monthlyPlan.monthly > 0 ? annualPlan.annual / monthlyPlan.monthly : 0,
  };
}

/** The page's table, built by the calculator: every plan, from the earliest break-even. */
export function buildAnnualPlanTable<P extends { monthly: number; annual: number }>(
  plans: readonly P[],
): (P & AnnualPlanComparison)[] {
  return plans
    .map((plan) => ({ ...plan, ...compareAnnualPlan(plan.monthly, plan.annual) }))
    .sort((a, b) => a.breakEvenMonths - b.breakEvenMonths);
}
