/**
 * Checks a published tariff page against ANEEL's live open data, row by row.
 *
 *   node scripts/verify-aneel-pages.mjs https://calculebrasil.com/tarifa-de-energia
 *   node scripts/verify-aneel-pages.mjs https://calculebrasil.com/tarifa-de-energia/copel
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

const rows = await aneelRows();
const covering = (agent, cnpj, day) =>
  rows.find(
    (row) =>
      row.SigAgente === agent &&
      String(row.NumCNPJDistribuidora) === cnpj &&
      row.DatInicioVigencia <= day &&
      row.DatFimVigencia >= day,
  );
const brl = (value, digits) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
const pct = (value) =>
  `${value > 0 ? "+" : ""}${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

// Every agent in force on the page's date, as ANEEL has it today.
const inForce = rows.filter(
  (row) =>
    row.SigAgente.toUpperCase() !== "NÃO INFORMADO" &&
    row.DatInicioVigencia <= date &&
    row.DatFimVigencia >= date,
);

const problems = [];
const report = [];
const distributor = html.match(/data-distributor="([^"]+)"/)?.[1];

if (distributor === undefined) {
  // The ranking: one row per agent, its R$/kWh and its change against a year before.
  const page = new Map();
  for (const match of html.matchAll(/<tr\b[^>]*data-agent="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cell = (name) =>
      plain(match[2].match(new RegExp(`data-cell="${name}"[^>]*>([\\s\\S]*?)<\\/td>`))?.[1] ?? "");
    page.set(decode(match[1]), { kwh: cell("kwh"), change: cell("change") });
  }
  let matched = 0;
  for (const row of inForce) {
    const now = kwh(row);
    const then = covering(row.SigAgente, String(row.NumCNPJDistribuidora), yearBefore);
    const change = then ? Math.round((now / kwh(then) - 1) * 1000) / 10 : null;
    const want = { kwh: brl(now, 5), change: change === null ? "—" : pct(change) };
    const got = page.get(row.SigAgente);
    if (!got) problems.push(`missing on the page: ${row.SigAgente}`);
    else if (got.kwh !== want.kwh || got.change !== want.change) {
      problems.push(
        `${row.SigAgente}: page ${got.kwh} ${got.change}, ANEEL ${want.kwh} ${want.change}`,
      );
    } else matched += 1;
  }
  const expected = new Set(inForce.map((row) => row.SigAgente));
  for (const agent of page.keys()) {
    if (!expected.has(agent)) problems.push(`on the page but not in force at ANEEL: ${agent}`);
  }
  report.push(
    `rows ${matched}/${inForce.length} match (R$/kWh to 5 decimals, 12-month change to 0.1 pp)`,
  );
} else {
  // One distributor: its history, its gaps, its bill table and its rank.
  const agent = decode(distributor);
  const current = inForce.find((row) => row.SigAgente === agent);
  if (!current) {
    console.error(`${agent} has no tariff in force at ANEEL on ${date}.`);
    process.exit(1);
  }
  const cnpj = String(current.NumCNPJDistribuidora);
  const own = rows
    .filter((row) => row.SigAgente === agent && String(row.NumCNPJDistribuidora) === cnpj)
    .sort((a, b) => a.DatInicioVigencia.localeCompare(b.DatInicioVigencia));
  const nextDay = (day) =>
    new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

  // A page period must be exactly a run of ANEEL rows with its value, end to end, and every ANEEL
  // row must sit inside one page period: that checks the merge without re-implementing it.
  const periods = [
    ...html.matchAll(
      /<tr\b[^>]*data-period-start="([^"]+)"[^>]*data-period-end="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g,
    ),
  ].map((m) => ({
    start: m[1],
    end: m[2],
    kwh: plain(m[3].match(/data-cell="kwh"[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? ""),
  }));
  let periodsOk = 0;
  for (const period of periods) {
    const inside = own.filter(
      (row) => row.DatInicioVigencia >= period.start && row.DatFimVigencia <= period.end,
    );
    const contiguous = inside.every(
      (row, i) => i === 0 || nextDay(inside[i - 1].DatFimVigencia) === row.DatInicioVigencia,
    );
    const ok =
      inside.length > 0 &&
      inside[0].DatInicioVigencia === period.start &&
      inside[inside.length - 1].DatFimVigencia === period.end &&
      contiguous &&
      inside.every((row) => brl(kwh(row), 5) === period.kwh);
    if (ok) periodsOk += 1;
    else problems.push(`period ${period.start}..${period.end} ${period.kwh} does not match ANEEL`);
  }
  for (const row of own) {
    if (!periods.some((p) => row.DatInicioVigencia >= p.start && row.DatFimVigencia <= p.end)) {
      problems.push(`ANEEL row ${row.DatInicioVigencia}..${row.DatFimVigencia} is not on the page`);
    }
  }

  const gapsWanted = [];
  for (let i = 1; i < own.length; i += 1) {
    if (nextDay(own[i - 1].DatFimVigencia) !== own[i].DatInicioVigencia) {
      gapsWanted.push(`${nextDay(own[i - 1].DatFimVigencia)}..${own[i].DatInicioVigencia}`);
    }
  }
  const gapsShown = [...html.matchAll(/data-gap-start="([^"]+)"[^>]*data-gap-end="([^"]+)"/g)].map(
    (m) => `${m[1]}..${nextDay(m[2])}`,
  );
  const gapsOk = gapsWanted.filter((gap) => gapsShown.includes(gap)).length;
  if (gapsOk !== gapsWanted.length || gapsShown.length !== gapsWanted.length) {
    problems.push(
      `gaps: page ${gapsShown.join(", ") || "none"}, ANEEL ${gapsWanted.join(", ") || "none"}`,
    );
  }

  const price = kwh(current);
  const bills = [...html.matchAll(/<tr\b[^>]*data-kwh-level="(\d+)"[^>]*>([\s\S]*?)<\/tr>/g)].map(
    (m) => ({
      level: Number(m[1]),
      cost: plain(m[2].match(/data-cell="cost"[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? ""),
    }),
  );
  let billsOk = 0;
  for (const bill of bills) {
    const want = brl(Math.round(bill.level * price * 100) / 100, 2);
    if (bill.cost === want) billsOk += 1;
    else problems.push(`bill ${bill.level} kWh: page ${bill.cost}, ANEEL tariff gives ${want}`);
  }

  const ranking = [...inForce].sort(
    (a, b) => kwh(b) - kwh(a) || a.SigAgente.localeCompare(b.SigAgente, "pt-BR"),
  );
  const rankWanted = ranking.findIndex((row) => row.SigAgente === agent) + 1;
  const rankShown = Number(html.match(/data-rank="(\d+)"/)?.[1]);
  if (rankShown !== rankWanted) problems.push(`rank: page ${rankShown}, ANEEL ${rankWanted}`);

  report.push(
    `${agent}: periods ${periodsOk}/${periods.length} (ANEEL rows ${own.length}), gaps ${gapsOk}/${gapsWanted.length}, ` +
      `bill rows ${billsOk}/${bills.length}, rank ${rankShown === rankWanted ? "ok" : "WRONG"} (${rankWanted}/${ranking.length})`,
  );
}

console.log(
  `${pageUrl}\ndata date ${date} (a year before: ${yearBefore}); ANEEL rows read: ${rows.length}`,
);
for (const line of report) console.log(line);
for (const problem of problems) console.log(`  ${problem}`);
process.exit(problems.length === 0 ? 0 : 1);
