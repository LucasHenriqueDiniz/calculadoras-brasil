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
