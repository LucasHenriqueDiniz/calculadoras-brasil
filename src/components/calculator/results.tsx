import type { ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
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

export function BreakdownTable({ rows, caption }: { rows: BreakdownRow[]; caption?: string }) {
  const total = rows.reduce((s, r) => s + r.monthly, 0);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 text-right font-medium">Mensal</th>
              <th className="px-4 py-3 text-right font-medium">Anual</th>
              <th className="px-4 py-3 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = total > 0 ? (r.monthly / total) * 100 : 0;
              return (
                <tr
                  key={r.key}
                  className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-2.5 text-foreground">{r.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                    {formatBRL(r.monthly)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatBRL(r.annual)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-border bg-primary-soft/40 font-semibold text-foreground">
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

export function SimpleBarChart({ rows, title }: { rows: BreakdownRow[]; title: string }) {
  const max = Math.max(...rows.map((r) => r.monthly), 1);
  const total = rows.reduce((s, r) => s + r.monthly, 0);
  const filtered = rows.filter((r) => r.monthly > 0).sort((a, b) => b.monthly - a.monthly);
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem valores para exibir.</p>
      ) : (
        <ul className="space-y-3.5" aria-label={title}>
          {filtered.map((r) => {
            const pct = (r.monthly / max) * 100;
            const share = total > 0 ? (r.monthly / total) * 100 : 0;
            return (
              <li key={r.key}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-foreground">{r.label}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatBRL(r.monthly)}
                    <span className="ml-1.5 text-muted-foreground/70">{share.toFixed(0)}%</span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        A tabela de breakdown abaixo apresenta os mesmos valores de forma acessível.
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
