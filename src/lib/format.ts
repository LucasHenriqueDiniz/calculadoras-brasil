export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) return brlFormatter.format(0);
  return brlFormatter.format(value);
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * An ISO calendar date ("2026-10-18") as a visitor reads it ("18 de outubro de
 * 2026"). Read and formatted in UTC: at midnight UTC the date is already the
 * previous day in Brasília, and a page revised on the 18th would say the 17th.
 */
export function formatLongDate(isoDate: string): string {
  return longDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * Parse a string with brazilian number format (1.234,56) or plain (1234.56)
 * into a finite number. Returns 0 for invalid input.
 */
export function parseBRNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
