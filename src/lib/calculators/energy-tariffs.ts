/**
 * Residential electricity tariffs per distributor, from ANEEL's "Tarifas de Aplicação" (B1,
 * residencial, convencional). Pure: every date is an argument, nothing here reads a clock or the
 * network. The snapshot these functions read is built by scripts/refresh-aneel-snapshot.mjs.
 *
 * Values stay in R$/MWh, as ANEEL publishes them, until a function returns R$/kWh.
 */

/** One tariff period: from `start` to `end`, both inclusive, ISO dates. */
export interface TariffPeriod {
  start: string;
  end: string;
  tusdMwh: number;
  teMwh: number;
  /** The homologating resolution, as "3.592/2026", or null when ANEEL left it blank. */
  resolution: string | null;
}

export type StateSource = "aneel" | "cnpj";

export interface DistributorTariffs {
  /** `SigAgente`, as ANEEL spells it on the period in force. */
  agent: string;
  cnpj: string;
  uf: string | null;
  /**
   * "aneel": ANEEL's call-centre dataset, which covers the concessionaires.
   * "cnpj": the state of the head office in the CNPJ register, used for the cooperatives.
   */
  stateSource: StateSource | null;
  /** The head office's city, from the CNPJ register, for the cooperatives only. */
  city: string | null;
  periods: TariffPeriod[];
}

export interface TariffSnapshot {
  /** The date "in force" and "a year before" are measured from. */
  referenceDate: string;
  /** `DatGeracaoConjuntoDados` of the ANEEL rows read. */
  datasetDate: string;
  distributors: DistributorTariffs[];
}

export interface RawTariffRow {
  agent: string;
  cnpj: string;
  start: string;
  end: string;
  tusdMwh: number;
  teMwh: number;
  resolution: string | null;
}

export interface RankedDistributor {
  rank: number;
  agent: string;
  uf: string | null;
  city: string | null;
  kwh: number;
  /** null when no period covers the same date a year before. */
  kwhYearBefore: number | null;
  /** Percentage, one decimal; null when `kwhYearBefore` is. */
  changePct: number | null;
  /** Start of the period in force. */
  since: string;
  resolution: string | null;
}

/** Agents ANEEL publishes that are not a distributor a visitor can be served by. */
const NOT_A_DISTRIBUTOR = new Set(["NÃO INFORMADO"]);

export function isDistributorAgent(agent: string): boolean {
  return !NOT_A_DISTRIBUTOR.has(agent.toUpperCase());
}

const RESOLUTION_NUMBER = /N[º°O]\s*([\d.]+)/i;
const RESOLUTION_YEAR = /(\d{4})\s*$/;

/** "RESOLUÇÃO HOMOLOGATÓRIA Nº 3.592, DE 23 DE JUNHO DE 2026" -> "3.592/2026". */
export function shortResolution(text: string | null): string | null {
  if (!text) return null;
  const number = RESOLUTION_NUMBER.exec(text)?.[1];
  const year = RESOLUTION_YEAR.exec(text.trim())?.[1];
  if (!number) return null;
  return year ? `${number}/${year}` : number;
}

export function kwhPrice(period: Pick<TariffPeriod, "tusdMwh" | "teMwh">): number {
  return Math.round(((period.tusdMwh + period.teMwh) / 1000) * 100_000) / 100_000;
}

/**
 * Joins consecutive periods that carry the same resolution and the same values into one. ANEEL
 * split the 2025 cycle at 2026-01-01 for several distributors (COPEL-DIS: 19 rows, 18 periods),
 * and a reader should see one tariff there, not two identical ones.
 */
export function mergeRepeatedPeriods(periods: readonly TariffPeriod[]): TariffPeriod[] {
  const sorted = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  const merged: TariffPeriod[] = [];
  for (const period of sorted) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.resolution === period.resolution &&
      last.tusdMwh === period.tusdMwh &&
      last.teMwh === period.teMwh &&
      nextDay(last.end) === period.start
    ) {
      merged[merged.length - 1] = { ...last, end: period.end };
    } else {
      merged.push({ ...period });
    }
  }
  return merged;
}

/**
 * The distributors with a period in force on `referenceDate`, each with its own history.
 *
 * A history is keyed by CNPJ **and** agent name (case aside), because mergers reused both: the
 * "CPFL Santa Cruz" in force today carries CPFL Jaguari's former CNPJ, and an older "CPFL SANTA
 * CRUZ" had another. Keying by either alone would splice two concession areas into one line.
 */
export function groupByDistributor(
  rows: readonly RawTariffRow[],
  referenceDate: string,
): Omit<DistributorTariffs, "uf" | "stateSource" | "city">[] {
  const keyOf = (row: RawTariffRow) => `${row.cnpj}|${row.agent.toUpperCase()}`;
  const byKey = new Map<string, RawTariffRow[]>();
  for (const row of rows) {
    if (!isDistributorAgent(row.agent)) continue;
    const list = byKey.get(keyOf(row)) ?? [];
    list.push(row);
    byKey.set(keyOf(row), list);
  }

  const distributors: Omit<DistributorTariffs, "uf" | "stateSource" | "city">[] = [];
  for (const list of byKey.values()) {
    const current = list.find((row) => row.start <= referenceDate && row.end >= referenceDate);
    if (!current) continue;
    const periods = mergeRepeatedPeriods(
      list.map(({ start, end, tusdMwh, teMwh, resolution }) => ({
        start,
        end,
        tusdMwh,
        teMwh,
        resolution,
      })),
    );
    distributors.push({ agent: current.agent, cnpj: current.cnpj, periods });
  }
  return distributors.sort((a, b) => a.agent.localeCompare(b.agent, "pt-BR"));
}

export function periodOn(periods: readonly TariffPeriod[], date: string): TariffPeriod | null {
  return periods.find((period) => period.start <= date && period.end >= date) ?? null;
}

/** The same calendar day a year earlier; 29 February falls back to the 28th. */
export function yearBefore(date: string): string {
  const [year, month, day] = date.split("-");
  const previous = String(Number(year) - 1);
  if (month === "02" && day === "29") return `${previous}-02-28`;
  return `${previous}-${month}-${day}`;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Calendar arithmetic on the ISO string, so this module never constructs a Date. */
export function nextDay(date: string): string {
  let [year, month, day] = date.split("-").map(Number);
  day += 1;
  if (day > daysInMonth(year, month)) {
    day = 1;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Every distributor with a tariff in force on `date`, most expensive first, as ANEEL's own
 * ranking orders them. Ties share neither rank nor order by accident: they fall back to the
 * agent name.
 */
export function rankByTariff(
  distributors: readonly DistributorTariffs[],
  date: string,
): RankedDistributor[] {
  const before = yearBefore(date);
  const rows = distributors.flatMap((distributor) => {
    const now = periodOn(distributor.periods, date);
    if (!now) return [];
    const then = periodOn(distributor.periods, before);
    const kwh = kwhPrice(now);
    const kwhYearBefore = then ? kwhPrice(then) : null;
    return [
      {
        agent: distributor.agent,
        uf: distributor.uf,
        city: distributor.city,
        kwh,
        kwhYearBefore,
        changePct:
          kwhYearBefore === null ? null : Math.round((kwh / kwhYearBefore - 1) * 1000) / 10,
        since: now.start,
        resolution: now.resolution,
      },
    ];
  });

  return rows
    .sort((a, b) => b.kwh - a.kwh || a.agent.localeCompare(b.agent, "pt-BR"))
    .map((row, index) => ({ rank: index + 1, ...row }));
}

export function median(values: readonly number[]): number {
  if (values.length === 0) throw new Error("The median of no values is undefined.");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export type RankedSummaryRow = Pick<
  RankedDistributor,
  "agent" | "uf" | "city" | "kwh" | "changePct" | "since" | "resolution"
>;

/**
 * The handful of figures the ranking page states in prose, in its title and in its FAQ. Kept apart
 * from the full ranking so the page's <head> can carry them without the 1,670-period history: route
 * heads are not code-split, and the history would ride in every page's JavaScript.
 */
export interface TariffSummary {
  referenceDate: string;
  count: number;
  most: RankedSummaryRow;
  least: RankedSummaryRow;
  medianKwh: number;
  /** How many distributors had a tariff on both dates, so a change. */
  withChange: number;
  medianChangePct: number;
  roseTenOrMore: number;
  fell: number;
  biggestRise: RankedSummaryRow;
}

const summaryRow = ({
  agent,
  uf,
  city,
  kwh,
  changePct,
  since,
  resolution,
}: RankedDistributor): RankedSummaryRow => ({ agent, uf, city, kwh, changePct, since, resolution });

export function summarizeRanking(
  ranked: readonly RankedDistributor[],
  referenceDate: string,
): TariffSummary {
  if (ranked.length === 0)
    throw new Error("A ranking with no distributor has nothing to summarise.");
  const changes = ranked.flatMap((row) => (row.changePct === null ? [] : [row.changePct]));
  const biggestRise = ranked.reduce((top, row) =>
    (row.changePct ?? -Infinity) > (top.changePct ?? -Infinity) ? row : top,
  );
  return {
    referenceDate,
    count: ranked.length,
    most: summaryRow(ranked[0]),
    least: summaryRow(ranked[ranked.length - 1]),
    medianKwh: Math.round(median(ranked.map((row) => row.kwh)) * 100_000) / 100_000,
    withChange: changes.length,
    medianChangePct: Math.round(median(changes) * 10) / 10,
    roseTenOrMore: changes.filter((change) => change >= 10).length,
    fell: changes.filter((change) => change < 0).length,
    biggestRise: summaryRow(biggestRise),
  };
}
