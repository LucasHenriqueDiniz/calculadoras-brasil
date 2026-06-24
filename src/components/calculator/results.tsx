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
  const base =
    tone === "primary"
      ? "bg-primary text-primary-foreground border-transparent"
      : "bg-surface text-foreground border-border";
  return (
    <div className={`min-w-0 rounded-xl border p-4 shadow-sm ${base}`}>
      <p
        className={`text-xs font-medium uppercase tracking-wide ${tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}
      >
        {title}
      </p>
      <p className="mt-1 break-words font-display text-[clamp(1.25rem,5vw,1.5rem)] leading-tight [overflow-wrap:anywhere]">
        {value}
      </p>
      {description ? (
        <p
          className={`mt-1 text-xs ${tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}
        >
          {description}
        </p>
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
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">Categoria</th>
            <th className="px-3 py-2 text-right font-medium">Mensal</th>
            <th className="px-3 py-2 text-right font-medium">Anual</th>
            <th className="px-3 py-2 text-right font-medium">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = total > 0 ? (r.monthly / total) * 100 : 0;
            return (
              <tr key={r.key} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-foreground">{r.label}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatBRL(r.monthly)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {formatBRL(r.annual)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {pct.toFixed(1)}%
                </td>
              </tr>
            );
          })}
          <tr className="bg-muted/40 font-medium">
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatBRL(total)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatBRL(total * 12)}</td>
            <td className="px-3 py-2 text-right tabular-nums">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SimpleBarChart({ rows, title }: { rows: BreakdownRow[]; title: string }) {
  const max = Math.max(...rows.map((r) => r.monthly), 1);
  const filtered = rows.filter((r) => r.monthly > 0);
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{title}</p>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem valores para exibir.</p>
      ) : (
        <ul className="space-y-2" aria-label={title}>
          {filtered.map((r) => {
            const pct = (r.monthly / max) * 100;
            return (
              <li key={r.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{r.label}</span>
                  <span className="tabular-nums text-muted-foreground">{formatBRL(r.monthly)}</span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        A tabela de breakdown abaixo apresenta os mesmos valores de forma acessível.
      </p>
    </div>
  );
}

export function DisclaimerBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-accent/40 p-4 text-sm text-foreground/85">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <ul className="space-y-2 rounded-xl border border-border bg-surface p-4 text-sm text-foreground/85">
      {warnings.map((w) => (
        <li key={w} className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <span>{w}</span>
        </li>
      ))}
    </ul>
  );
}
