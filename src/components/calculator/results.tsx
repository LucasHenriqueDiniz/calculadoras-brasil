import { useState, type ReactNode } from "react";
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
export function buildColorMap(rows: BreakdownRow[]): Record<string, string> {
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

interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

/** Donut em SVG puro — seguro para SSR. Realça o segmento ativo no hover. */
function Donut({
  segments,
  total,
  activeKey,
  onHover,
}: {
  segments: Slice[];
  total: number;
  activeKey: string | null;
  onHover: (key: string | null) => void;
}) {
  const size = 180;
  const stroke = 24;
  const r = (size - stroke - 8) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const active = segments.find((s) => s.key === activeKey) ?? null;
  const centerLabel = active ? active.label : "Total/mês";
  const centerValue = active ? formatBRL(active.value) : formatBRL(total);
  const centerPct = active && total > 0 ? `${((active.value / total) * 100).toFixed(1)}%` : null;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-44 w-44 shrink-0"
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
          const isActive = s.key === activeKey;
          const dimmed = activeKey !== null && !isActive;
          const circle = (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={isActive ? stroke + 6 : stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="cursor-pointer transition-[stroke-width,opacity] duration-150"
              style={{ opacity: dimmed ? 0.35 : 1 }}
              onMouseEnter={() => onHover(s.key)}
              onMouseLeave={() => onHover(null)}
            >
              <title>{`${s.label}: ${formatBRL(s.value)}`}</title>
            </circle>
          );
          offset += len;
          return circle;
        })}
      </g>
      <text
        x="50%"
        y="43%"
        textAnchor="middle"
        className="fill-muted-foreground text-[8.5px] font-medium uppercase tracking-wide"
      >
        {centerLabel.length > 18 ? `${centerLabel.slice(0, 17)}…` : centerLabel}
      </text>
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        className="fill-foreground font-display text-[15px] font-bold"
      >
        {centerValue}
      </text>
      {centerPct ? (
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          className="fill-primary text-[10px] font-semibold tabular-nums"
        >
          {centerPct}
        </text>
      ) : null}
    </svg>
  );
}

export function SimpleBarChart({ rows, title }: { rows: BreakdownRow[]; title: string }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const total = rows.reduce((s, r) => s + r.monthly, 0);
  const filtered = rows.filter((r) => r.monthly > 0).sort((a, b) => b.monthly - a.monthly);
  const colorMap = buildColorMap(rows);

  // Agrupa categorias pequenas em "Outros" para manter o donut limpo.
  const MAX_SLICES = 6;
  const main = filtered.slice(0, MAX_SLICES);
  const rest = filtered.slice(MAX_SLICES);
  const segments: Slice[] = main.map((r) => ({
    key: r.key,
    label: r.label,
    value: r.monthly,
    color: colorMap[r.key],
  }));
  if (rest.length > 0) {
    segments.push({
      key: "__outros__",
      label: "Outros",
      value: rest.reduce((s, r) => s + r.monthly, 0),
      color: "var(--color-chart-8)",
    });
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
          <PieChart className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem valores para exibir.</p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <Donut segments={segments} total={total} activeKey={activeKey} onHover={setActiveKey} />
          <ul className="w-full min-w-0 flex-1 space-y-1" aria-label={title}>
            {segments.map((item) => {
              const share = total > 0 ? (item.value / total) * 100 : 0;
              const isActive = item.key === activeKey;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveKey(item.key)}
                    onMouseLeave={() => setActiveKey(null)}
                    onFocus={() => setActiveKey(item.key)}
                    onBlur={() => setActiveKey(null)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      isActive ? "bg-primary-soft/50" : "hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-[4px] ring-2 ring-transparent transition-[box-shadow]"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: isActive
                          ? `0 0 0 3px color-mix(in oklab, ${item.color} 30%, transparent)`
                          : undefined,
                      }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-foreground">{item.label}</span>
                    <span className="shrink-0 text-right">
                      <span className="block tabular-nums font-medium text-foreground">
                        {formatBRL(item.value)}
                      </span>
                      <span className="block text-[11px] tabular-nums text-muted-foreground">
                        {share.toFixed(1)}%
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="mt-auto border-t border-border/60 pt-3 text-xs text-muted-foreground">
        Passe o mouse sobre o gráfico ou a legenda para destacar cada categoria.
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
