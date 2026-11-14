/**
 * Checks a published tariff page against ANEEL's live open data, row by row.
 *
 *   node scripts/verify-aneel-pages.mjs https://calculebrasil.com/tarifa-de-energia
 *
 * The oracle is ANEEL's datastore, read here with its own small parser: this script imports
 * nothing from src/, so a bug in the site's code cannot agree with itself. For the date the page
 * says its data is from, it takes each agent's row in force, adds TUSD and TE, and compares the
 * R$/kWh and the change against the same day a year before with what the page's HTML shows.
 * Exit code 1 on any mismatch.
 */
import process from "node:process";

const API = "https://dadosabertos.aneel.gov.br/api/action/datastore_search";
const RESOURCE = "fcf2906c-7c32-4b9b-a637-054e7a5234f4";
const FILTERS = {
  DscBaseTarifaria: "Tarifa de Aplicação",
  DscSubGrupo: "B1",
  DscModalidadeTarifaria: "Convencional",
  DscClasse: "Residencial",
  DscSubClasse: "Residencial",
  DscDetalhe: "Não se aplica",
  NomPostoTarifario: "Não se aplica",
  DscUnidadeTerciaria: "MWh",
};

const pageUrl = process.argv[2];
if (!pageUrl) {
  console.error("usage: node scripts/verify-aneel-pages.mjs <page url>");
  process.exit(2);
}

const decode = (text) =>
  text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replaceAll(" ", " ");
const plain = (html) =>
  decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const mwh = (value) => Number(value.replace(/\./g, "").replace(",", "."));
const kwh = (row) => Math.round(((mwh(row.VlrTUSD) + mwh(row.VlrTE)) / 1000) * 100_000) / 100_000;

async function aneelRows() {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const url = new URL(API);
    url.searchParams.set("resource_id", RESOURCE);
    url.searchParams.set("limit", "1000");
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("filters", JSON.stringify(FILTERS));
    url.searchParams.set(
      "fields",
      "SigAgente,NumCNPJDistribuidora,DatInicioVigencia,DatFimVigencia,VlrTUSD,VlrTE",
    );
    const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    const { result } = await response.json();
    rows.push(...result.records);
    if (result.records.length < 1000 || rows.length >= result.total) return rows;
  }
}

const html = await (await fetch(pageUrl, { signal: AbortSignal.timeout(60_000) })).text();
const date = html.match(/<main[\s\S]*?<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"/i)?.[1];
if (!date) {
  console.error("The page does not say which date its data is from (<time datetime>).");
  process.exit(1);
}
const yearBefore = `${Number(date.slice(0, 4)) - 1}${date.slice(4)}`.replace(/-02-29$/, "-02-28");

const page = new Map();
for (const match of html.matchAll(/<tr\b[^>]*data-agent="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)) {
  const cell = (name) =>
    plain(match[2].match(new RegExp(`data-cell="${name}"[^>]*>([\\s\\S]*?)<\\/td>`))?.[1] ?? "");
  page.set(decode(match[1]), { kwh: cell("kwh"), change: cell("change") });
}

const rows = await aneelRows();
const covering = (agent, cnpj, day) =>
  rows.find(
    (row) =>
      row.SigAgente === agent &&
      String(row.NumCNPJDistribuidora) === cnpj &&
      row.DatInicioVigencia <= day &&
      row.DatFimVigencia >= day,
  );

const expected = new Map();
for (const row of rows) {
  if (row.SigAgente.toUpperCase() === "NÃO INFORMADO") continue;
  if (row.DatInicioVigencia > date || row.DatFimVigencia < date) continue;
  const now = kwh(row);
  const then = covering(row.SigAgente, String(row.NumCNPJDistribuidora), yearBefore);
  const change = then ? Math.round((now / kwh(then) - 1) * 1000) / 10 : null;
  expected.set(row.SigAgente, {
    kwh: `R$ ${now.toLocaleString("pt-BR", { minimumFractionDigits: 5, maximumFractionDigits: 5 })}`,
    change:
      change === null
        ? "—"
        : `${change > 0 ? "+" : ""}${change.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
  });
}

let matched = 0;
const problems = [];
for (const [agent, want] of expected) {
  const got = page.get(agent);
  if (!got) problems.push(`missing on the page: ${agent}`);
  else if (got.kwh !== want.kwh || got.change !== want.change) {
    problems.push(`${agent}: page ${got.kwh} ${got.change}, ANEEL ${want.kwh} ${want.change}`);
  } else matched += 1;
}
for (const agent of page.keys()) {
  if (!expected.has(agent)) problems.push(`on the page but not in force at ANEEL: ${agent}`);
}

console.log(
  `${pageUrl}\ndata date ${date} (a year before: ${yearBefore}); ANEEL rows read: ${rows.length}`,
);
console.log(
  `rows ${matched}/${expected.size} match (R$/kWh to 5 decimals, 12-month change to 0.1 pp)`,
);
for (const problem of problems) console.log(`  ${problem}`);
process.exit(problems.length === 0 ? 0 : 1);
