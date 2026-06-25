import { Check, X } from "lucide-react";

export interface ComparisonItem {
  feature: string;
  items: (string | boolean | null)[];
}

export interface ComparisonChartProps {
  title: string;
  columns: string[];
  rows: ComparisonItem[];
}

export function ComparisonChart({ title, columns, rows }: ComparisonChartProps) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <caption className="mb-4 text-sm font-semibold text-foreground">{title}</caption>
        <thead>
          <tr className="bg-surface">
            <th className="border border-border bg-surface p-4 text-left font-semibold">
              Critério
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="border border-border bg-surface p-4 text-center font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-surface"}>
              <td className="border border-border p-4 font-medium text-foreground">
                {row.feature}
              </td>
              {row.items.map((item, itemIdx) => (
                <td
                  key={itemIdx}
                  className="border border-border p-4 text-center text-sm text-muted-foreground"
                >
                  {typeof item === "boolean" ? (
                    item ? (
                      <Check className="mx-auto h-5 w-5 text-green-600" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-red-600" />
                    )
                  ) : (
                    item
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
