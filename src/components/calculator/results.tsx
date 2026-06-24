import type { ReactNode } from "react";
import { AlertTriangle, Info, PieChart } from "lucide-react";
import { formatBRL } from "@/lib/format";

interface ResultSummaryCardProps {
  title: string;
  value: string;
  description?: string;
  tone?: "primary" | "neutral";
}

export function ResultSummaryCard({
  title,
  value,
  description,
  tone = "neutral",
}: ResultSummaryCardProps) {
  if (tone === "primary") {
    return (
      <div className="min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-primary p-5 text-primary-foreground shadow-[var(--shadow-panel)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
          {title}
        </p>
        <p className="mt-2 break-words font-display text-[clamp(1.75rem,7vw,2.25rem)] font-bold leading-tight [overflow-wrap:anywhere]">
          {value}
        </p>
        {description ? (
          <p className="mt-2 text-sm text-primary-foreground/85 [overflow-wrap:anywhere]">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1.5 break-words font-display text-[clamp(1.125rem,4.5vw,1.375rem)] font-semibold leading-tight text-foreground [overflow-wrap:anywhere]">
        {value}
      </p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">{description}</p>
      ) : null}
    </div>
  );
}

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
function buildColorMap(rows: BreakdownRow[]): Record<string, string> {
  const sorted = [...rows].filter((r) => r.monthly > 0).sort((a, b) => b.monthly - a.monthly);
  const map: Record<string, string> = {};
  sorted.forEach((r, i) => {
    map[r.key] = CHART_COLORS[i % CHART_COLORS.length];
  });
  return map;
}

export function BreakdownTable({ rows, caption }: { rows: BreakdownRow[]; caption?: string }) {
  const total = rows.reduce((s, r) => s + r.monthly, 0);
  const colorMap = buildColorMap(rows);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 text-right font-medium">Mensal</th>
              <th className="px-4 py-3 text-right font-medium">Anual</th>
              <th className="px-4 py-3 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = total > 0 ? (r.monthly / total) * 100 : 0;
              const color = colorMap[r.key] ?? "var(--color-muted-foreground)";
              return (
                <tr
                  key={r.key}
                  className="border-b border-border/60 transition-colors last:border-0 odd:bg-muted/15 hover:bg-primary-soft/25"
                >
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2.5 text-foreground">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: r.monthly > 0 ? color : "var(--color-border)" }}
                        aria-hidden
                      />
                      {r.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                    {formatBRL(r.monthly)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatBRL(r.annual)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center justify-end gap-2">
                      <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:block">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </span>
                      <span className="w-12 text-right tabular-nums text-muted-foreground">
                        {pct.toFixed(1)}%
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-border bg-primary-soft/40 font-semibold text-foreground">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatBRL(total)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatBRL(total * 12)}</td>
              <td className="px-4 py-3 text-right tabular-nums">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Donut em SVG puro — seguro para SSR/pré-renderização, sem dependências. */
function Donut({
  segments,
  total,
}: {
  segments: { key: string; value: number; color: string }[];
  total: number;
}) {
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-40 w-40 shrink-0"
      role="img"
      aria-label="Gráfico de distribuição do custo por categoria"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth={stroke}
      />
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s) => {
          const len = total > 0 ? (s.value / total) * c : 0;
          const dash = `${len} ${c - len}`;
          const circle = (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return circle;
        })}
      </g>
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-medium uppercase tracking-wide"
      >
        Total/mês
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        className="fill-foreground font-display text-[15px] font-bold"
      >
        {formatBRL(total)}
      </text>
    </svg>
  );
}

export function SimpleBarChart({ rows, title }: { rows: BreakdownRow[]; title: string }) {
  const total = rows.reduce((s, r) => s + r.monthly, 0);
  const filtered = rows.filter((r) => r.monthly > 0).sort((a, b) => b.monthly - a.monthly);
  const colorMap = buildColorMap(rows);

  // Agrupa categorias pequenas em "Outros" para manter o donut limpo.
  const MAX_SLICES = 6;
  const main = filtered.slice(0, MAX_SLICES);
  const rest = filtered.slice(MAX_SLICES);
  const segments = main.map((r) => ({ key: r.key, value: r.monthly, color: colorMap[r.key] }));
  if (rest.length > 0) {
    segments.push({
      key: "__outros__",
      value: rest.reduce((s, r) => s + r.monthly, 0),
      color: "var(--color-chart-8)",
    });
  }

  const legend = [
    ...main.map((r) => ({ key: r.key, label: r.label, value: r.monthly, color: colorMap[r.key] })),
    ...(rest.length > 0
      ? [
          {
            key: "__outros__",
            label: "Outros",
            value: rest.reduce((s, r) => s + r.monthly, 0),
            color: "var(--color-chart-8)",
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
          <PieChart className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem valores para exibir.</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
          <Donut segments={segments} total={total} />
          <ul className="w-full flex-1 space-y-2.5" aria-label={title}>
            {legend.map((item) => {
              const share = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <li key={item.key} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="h-3 w-3 shrink-0 rounded-[4px]"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">{item.label}</span>
                  <span className="shrink-0 tabular-nums font-medium text-foreground">
                    {formatBRL(item.value)}
                  </span>
                  <span className="w-10 shrink-0 text-right tabular-nums text-xs text-muted-foreground">
                    {share.toFixed(0)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        A tabela ao lado apresenta os mesmos valores com detalhamento mensal e anual.
      </p>
    </div>
  );
}

export function DisclaimerBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-accent/60 bg-accent/30 p-4 text-sm leading-relaxed text-foreground/85">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/60 text-accent-foreground">
        <Info className="h-4 w-4" aria-hidden />
      </span>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

export function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <ul className="space-y-2.5 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed text-foreground/85">
      {warnings.map((w) => (
        <li key={w} className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <span>{w}</span>
        </li>
      ))}
    </ul>
  );
}
