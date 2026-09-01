/**
 * Cores de gráfico e o mapa categoria → cor.
 *
 * Vive fora de components/calculator/results.tsx porque aquele arquivo exporta
 * componentes: misturar helpers puros com componentes quebra o fast refresh, que
 * só consegue recarregar um módulo quando tudo que ele exporta é componente.
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
 * Mapeia cada categoria (por key) para uma cor estável, ordenando por valor.
 * Tanto o gráfico quanto a tabela usam as mesmas linhas, garantindo cores consistentes.
 */
export function buildColorMap(rows: BreakdownRow[]): Record<string, string> {
  const sorted = [...rows].filter((r) => r.monthly > 0).sort((a, b) => b.monthly - a.monthly);
  const map: Record<string, string> = {};
  sorted.forEach((r, i) => {
    map[r.key] = CHART_COLORS[i % CHART_COLORS.length];
  });
  return map;
}
