/**
 * Refreshes src/data/aneel-tariff-snapshot.ts, aneel-tariff-summary.ts and
 * aneel-distributor-states.ts from
 * ANEEL's "Tarifas de Aplicação": every residential B1 tariff period of every distributor in force
 * today, with its state.
 *
 *   node scripts/refresh-aneel-snapshot.mjs
 *
 * /tarifa-de-energia is built from the snapshot at prerender, and /api/energy-tariffs filters its
 * distributor list by the states file. After running it, move /tarifa-de-energia's lastmod in
 * src/lib/seo-pages.ts. Tariffs move about once a year per distributor, so monthly is enough.
 *
 * States come from two places, and each distributor records which:
 * - "aneel": ANEEL's call-centre dataset, which pairs CNPJ and state for the concessionaires;
 * - "cnpj": for the cooperatives that dataset does not cover, the head office's state and city in
 *   the CNPJ register (BrasilAPI), with the city's accented name from IBGE. A cooperative serves
 *   the area around its head office. These are looked up once and carried over from the previous
 *   snapshot on later runs, so a refresh does not repeat 60-odd lookups.
 */
import { access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import { createServer } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SNAPSHOT = `${ROOT}src/data/aneel-tariff-snapshot.ts`;
const STATES = `${ROOT}src/data/aneel-distributor-states.ts`;
const SUMMARY = `${ROOT}src/data/aneel-tariff-summary.ts`;
const USER_AGENT = "calculebrasil-snapshot/1.0 (+https://calculebrasil.com)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.ok) return response.json();
    if (attempt >= attempts || (response.status !== 429 && response.status < 500)) {
      throw new Error(`${url} answered ${response.status}`);
    }
    await sleep(5_000 * attempt);
  }
}

async function previousCnpjStates(server) {
  try {
    await access(SNAPSHOT);
    const { ANEEL_TARIFF_SNAPSHOT: snapshot } = await server.ssrLoadModule(
      "/src/data/aneel-tariff-snapshot.ts",
    );
    return new Map(
      snapshot.distributors
        .filter((d) => d.stateSource === "cnpj" && d.uf)
        .map((d) => [d.cnpj, { uf: d.uf, city: d.city }]),
    );
  } catch {
    return new Map();
  }
}

const ibgeCities = new Map();
async function accentedCity(uf, ibgeCode, fallback) {
  if (!ibgeCities.has(uf)) {
    const list = await getJson(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
    );
    ibgeCities.set(uf, new Map(list.map((city) => [String(city.id), city.nome])));
  }
  return ibgeCities.get(uf).get(String(ibgeCode)) ?? fallback;
}

const server = await createServer({
  root: ROOT,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  resolve: { alias: { "@": `${ROOT}src` } },
});

try {
  const adapter = await server.ssrLoadModule("/src/server/adapters/aneel.ts");
  const domain = await server.ssrLoadModule("/src/lib/calculators/energy-tariffs.ts");

  const rows = await adapter.fetchAneelTariffHistory();
  const referenceDate = new Date().toISOString().slice(0, 10);
  const datasetDates = new Set(rows.map((row) => row.datasetDate));
  if (datasetDates.size !== 1) {
    throw new Error(`Expected one dataset date, found: ${[...datasetDates].join(", ")}`);
  }
  const [datasetDate] = datasetDates;

  const grouped = domain.groupByDistributor(
    rows.map((row) => ({ ...row, resolution: domain.shortResolution(row.resolution) })),
    referenceDate,
  );

  const aneelStates = await adapter.fetchAneelDistributorStates();
  const carried = await previousCnpjStates(server);
  let looked = 0;
  const distributors = [];
  for (const distributor of grouped) {
    let uf = aneelStates.get(distributor.cnpj) ?? null;
    let stateSource = uf ? "aneel" : null;
    let city = null;
    if (!uf && carried.has(distributor.cnpj)) {
      ({ uf, city } = carried.get(distributor.cnpj));
      stateSource = "cnpj";
    } else if (!uf) {
      try {
        const registry = await getJson(`https://brasilapi.com.br/api/cnpj/v1/${distributor.cnpj}`);
        looked += 1;
        uf = registry.uf ?? null;
        city = uf
          ? await accentedCity(uf, registry.codigo_municipio_ibge, registry.municipio)
          : null;
        stateSource = uf ? "cnpj" : null;
      } catch (error) {
        console.warn(`No state for ${distributor.agent} (${distributor.cnpj}): ${error.message}`);
      }
      await sleep(1_200);
    }
    distributors.push({ ...distributor, uf, stateSource, city });
  }

  // One period per line: prettier keeps an object on one line when the source has it on one and
  // it fits the print width, so the file reads as a table instead of 7 lines per period.
  const periodLines = (periods) =>
    `[\n${periods.map((period) => JSON.stringify(period)).join(",\n")}\n]`;
  const distributorBlocks = distributors.map(({ periods, ...rest }) => {
    const head = JSON.stringify(rest, null, 2).slice(0, -2);
    return `${head},\n  "periods": ${periodLines(periods)}\n}`;
  });
  const snapshotLiteral = `{
  "referenceDate": ${JSON.stringify(referenceDate)},
  "datasetDate": ${JSON.stringify(datasetDate)},
  "distributors": [
${distributorBlocks.join(",\n")}
  ]
}`;
  const header = `/**
 * GENERATED by scripts/refresh-aneel-snapshot.mjs. Do not edit by hand: re-run it.
 *
 * ANEEL "Tarifas de Aplicação", B1 residencial convencional, every period of every distributor
 * in force on ${referenceDate} (dataset generated ${datasetDate}). Values in R$/MWh, before taxes.
 * Licence: Open Data Commons ODbL. /tarifa-de-energia is built from it.
 */
import type { TariffSnapshot } from "@/lib/calculators/energy-tariffs";

export const ANEEL_TARIFF_SNAPSHOT: TariffSnapshot = ${snapshotLiteral};
`;
  const statesMap = Object.fromEntries(
    distributors.filter((d) => d.uf).map((d) => [d.agent, d.uf]),
  );
  const statesSource = `/**
 * GENERATED by scripts/refresh-aneel-snapshot.mjs, with the tariff snapshot. Do not edit by hand.
 *
 * The state of each distributor in force on ${referenceDate}, keyed by ANEEL's \`SigAgente\`.
 * /api/energy-tariffs filters its distributor list by it.
 */
export const ANEEL_DISTRIBUTOR_STATES: Readonly<Record<string, string>> = ${JSON.stringify(statesMap, null, 2)};
`;

  // The snapshot is written as is, one period per line, and listed in .prettierignore: prettier
  // would spread every period over seven lines and turn a 1,670-row table into 12,000 lines.
  await writeFile(SNAPSHOT, header);
  const summary = domain.summarizeRanking(
    domain.rankByTariff(distributors, referenceDate),
    referenceDate,
  );
  const summarySource = `/**
 * GENERATED by scripts/refresh-aneel-snapshot.mjs, with the tariff snapshot. Do not edit by hand.
 *
 * The figures /tarifa-de-energia states in its title, prose and FAQ, small enough for the route's
 * <head>, which is not code-split. tests/aneel-snapshot.test.ts holds it equal to the snapshot.
 */
import type { TariffSummary } from "@/lib/calculators/energy-tariffs";

export const ANEEL_TARIFF_SUMMARY: TariffSummary = ${JSON.stringify(summary, null, 2)};
`;
  for (const [target, source] of [
    [STATES, statesSource],
    [SUMMARY, summarySource],
  ]) {
    const options = (await prettier.resolveConfig(target)) ?? {};
    await writeFile(target, await prettier.format(source, { ...options, filepath: target }));
  }

  const bySource = (source) => distributors.filter((d) => d.stateSource === source).length;
  console.log(
    `Wrote ${distributors.length} distributors in force on ${referenceDate} ` +
      `(dataset ${datasetDate}), ${distributors.reduce((n, d) => n + d.periods.length, 0)} periods. ` +
      `States: ${bySource("aneel")} from ANEEL, ${bySource("cnpj")} from the CNPJ register ` +
      `(${looked} looked up now), ${distributors.filter((d) => !d.uf).length} unknown.`,
  );
} finally {
  await server.close();
}
