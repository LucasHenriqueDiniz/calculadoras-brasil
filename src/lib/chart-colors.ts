/**
 * Chart colours and the category-to-colour map.
 *
 * This lives outside components/calculator/results.tsx because that file exports
 * components: mixing pure helpers with components breaks fast refresh, which can
 * only reload a module when everything it exports is a component.
 */

export interface BreakdownRow {
  key: string;
  label: string;
  monthly: number;
  annual: number;
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
];

/**
 * Maps each category (by key) to a stable colour, ordered by value.
 * Chart and table share the same rows, which keeps the colours consistent.
 */
export function buildColorMap(rows: BreakdownRow[]): Record<string, string> {
  const sorted = [...rows].filter((r) => r.monthly > 0).sort((a, b) => b.monthly - a.monthly);
  const map: Record<string, string> = {};
  sorted.forEach((r, i) => {
    map[r.key] = CHART_COLORS[i % CHART_COLORS.length];
  });
  return map;
}
