import { Link } from "@tanstack/react-router";
import { ANEEL_TARIFF_SNAPSHOT } from "@/data/aneel-tariff-snapshot";
import { distributorPageByAgent } from "@/data/distributor-pages";
import { distributorName, DISTRIBUTOR_NAMES } from "@/data/distributor-names";
import { rankByTariff } from "@/lib/calculators/energy-tariffs";
import { formatLongDate, formatNumber, formatShortDate } from "@/lib/format";

/**
 * Every distributor in force, most expensive first. The only importer of the full ANEEL snapshot
 * (1,670 periods), so the history loads with /tarifa-de-energia and with nothing else.
 *
 * `data-agent` and `data-cell` are read by scripts/verify-aneel-pages.mjs, which compares what this
 * renders with ANEEL's live data.
 */
const DATE = ANEEL_TARIFF_SNAPSHOT.referenceDate;
const RANKED = rankByTariff(ANEEL_TARIFF_SNAPSHOT.distributors, DATE);

const kwh = (value: number) => `R$ ${formatNumber(value, 5)}`;
const pct = (value: number) => `${value > 0 ? "+" : ""}${formatNumber(value, 1)}%`;

export function TariffRankingTable() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">
            Tarifa residencial B1 de cada distribuidora em {formatLongDate(DATE)}, sem impostos, e a
            variação em 12 meses
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-right">
                #
              </th>
              <th scope="col" className="px-3 py-2.5">
                Distribuidora
              </th>
              <th scope="col" className="px-3 py-2.5">
                UF
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                R$/kWh
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                12 meses
              </th>
              <th scope="col" className="px-3 py-2.5">
                Em vigor desde
              </th>
            </tr>
          </thead>
          <tbody>
            {RANKED.map((row) => (
              <tr key={row.agent} data-agent={row.agent} className="border-t border-border/70">
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {row.rank}
                </td>
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {distributorPageByAgent(row.agent) ? (
                    <Link
                      to="/tarifa-de-energia/$slug"
                      params={{ slug: distributorPageByAgent(row.agent)?.slug ?? "" }}
                      className="text-primary underline underline-offset-2"
                    >
                      {distributorName(row.agent)}
                    </Link>
                  ) : (
                    distributorName(row.agent)
                  )}
                  {DISTRIBUTOR_NAMES[row.agent] ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {row.agent}
                    </span>
                  ) : row.city ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {row.city}
                    </span>
                  ) : null}
                </th>
                <td className="px-3 py-2">{row.uf ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums" data-cell="kwh">
                  {kwh(row.kwh)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums" data-cell="change">
                  {row.changePct === null ? "—" : pct(row.changePct)}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatShortDate(row.since)}
                  {row.resolution ? (
                    <span className="block text-xs">REH {row.resolution}</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
