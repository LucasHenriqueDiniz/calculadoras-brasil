import { unzipSync } from "fflate";
import { decodeUtf8, fetchBounded } from "../bounded-fetch";
import { normalizeText } from "../normalization";

const ANP_PAGE =
  "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas";

const STATE_BY_UF: Record<string, string> = {
  AC: "ACRE",
  AL: "ALAGOAS",
  AP: "AMAPA",
  AM: "AMAZONAS",
  BA: "BAHIA",
  CE: "CEARA",
  DF: "DISTRITO FEDERAL",
  ES: "ESPIRITO SANTO",
  GO: "GOIAS",
  MA: "MARANHAO",
  MT: "MATO GROSSO",
  MS: "MATO GROSSO DO SUL",
  MG: "MINAS GERAIS",
  PA: "PARA",
  PB: "PARAIBA",
  PR: "PARANA",
  PE: "PERNAMBUCO",
  PI: "PIAUI",
  RJ: "RIO DE JANEIRO",
  RN: "RIO GRANDE DO NORTE",
  RS: "RIO GRANDE DO SUL",
  RO: "RONDONIA",
  RR: "RORAIMA",
  SC: "SANTA CATARINA",
  SP: "SAO PAULO",
  SE: "SERGIPE",
  TO: "TOCANTINS",
};

const PRODUCTS: Record<string, string[]> = {
  gasolina: ["GASOLINA COMUM"],
  etanol: ["ETANOL HIDRATADO"],
  diesel: ["OLEO DIESEL S10", "OLEO DIESEL"],
  glp: ["GLP"],
};

interface FuelPriceResult {
  uf: string;
  fuel: string;
  averagePrice: number;
  minPrice?: number;
  maxPrice?: number;
  sampleSize?: number;
  period?: string;
  source: "ANP";
  sourceUrl: string;
  lastUpdated: string;
  isStale: boolean;
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function readSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((text) => decodeXml(text[1])).join(""),
  );
}

function readRows(xml: string, sharedStrings: string[]): Map<string, string>[] {
  const rows: Map<string, string>[] = [];

  for (const rowMatch of xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    if (Number(rowMatch[1]) < 11) continue;

    const row = new Map<string, string>();
    for (const cellMatch of rowMatch[2].matchAll(
      /<c\b([^>]*)\br="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g,
    )) {
      const attributes = `${cellMatch[1]} ${cellMatch[3]}`;
      const value = cellMatch[4].match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (value === undefined) continue;
      row.set(
        cellMatch[2],
        /\bt="s"/.test(attributes) ? (sharedStrings[Number(value)] ?? "") : value,
      );
    }
    rows.push(row);
  }

  return rows;
}

function excelDateToIso(serial: string): string {
  const days = Number(serial);
  const milliseconds = Math.round((days - 25569) * 86_400_000);
  return new Date(milliseconds).toISOString().slice(0, 10);
}

async function findLatestWorkbookUrl(): Promise<string> {
  const { bytes } = await fetchBounded(ANP_PAGE, {
    maxBytes: 1_500_000,
    headers: { accept: "text/html", "user-agent": "CalculadorasBrasil/1.0" },
  });
  const html = decodeUtf8(bytes).replace(/&amp;/g, "&");
  const links = [
    ...html.matchAll(
      /href=["']([^"']*resumo_semanal_lpc_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\.xlsx)["']/gi,
    ),
  ].sort((a, b) => b[3].localeCompare(a[3]));
  if (!links[0]) throw new Error("A ANP não publicou uma planilha semanal reconhecível.");

  const url = new URL(links[0][1], ANP_PAGE);
  if (url.hostname !== "www.gov.br" || !url.pathname.startsWith("/anp/")) {
    throw new Error("A planilha encontrada não pertence ao domínio oficial da ANP.");
  }
  return url.toString();
}

function findStatesSheet(files: Record<string, Uint8Array>): Uint8Array | undefined {
  const workbook = files["xl/workbook.xml"];
  const relationships = files["xl/_rels/workbook.xml.rels"];
  if (!workbook || !relationships) return undefined;

  const sheetTag = [...decodeUtf8(workbook).matchAll(/<sheet\b[^>]*>/g)].find((match) =>
    /\bname="ESTADOS"/i.test(match[0]),
  )?.[0];
  const relationshipId = sheetTag?.match(/\br:id="([^"]+)"/)?.[1];
  if (!relationshipId) return undefined;

  const relationshipTag = [...decodeUtf8(relationships).matchAll(/<Relationship\b[^>]*\/>/g)].find(
    (match) => new RegExp(`\\bId="${relationshipId}"`).test(match[0]),
  )?.[0];
  const target = relationshipTag?.match(/\bTarget="([^"]+)"/)?.[1];
  if (!target) return undefined;

  return files[`xl/${target.replace(/^\/+/, "")}`];
}

export async function fetchAnpFuelPrice(uf: string, fuel: string): Promise<FuelPriceResult | null> {
  const workbookUrl = await findLatestWorkbookUrl();
  const { bytes } = await fetchBounded(workbookUrl, {
    maxBytes: 2_000_000,
    headers: {
      accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "user-agent": "CalculadorasBrasil/1.0",
    },
  });

  const files = unzipSync(bytes);
  const sharedStringsFile = files["xl/sharedStrings.xml"];
  const statesSheet = findStatesSheet(files);
  if (!sharedStringsFile || !statesSheet) {
    throw new Error("A estrutura da planilha semanal da ANP mudou.");
  }

  const sharedStrings = readSharedStrings(decodeUtf8(sharedStringsFile));
  const rows = readRows(decodeUtf8(statesSheet), sharedStrings);
  const state = STATE_BY_UF[uf];
  const acceptedProducts = PRODUCTS[fuel] ?? [];

  const matchingRows = rows.filter(
    (row) =>
      normalizeText(row.get("D") ?? "") === state &&
      acceptedProducts.includes(normalizeText(row.get("E") ?? "")),
  );
  const row = acceptedProducts
    .map((product) =>
      matchingRows.find((candidate) => normalizeText(candidate.get("E") ?? "") === product),
    )
    .find(Boolean);
  if (!row) return null;

  const averagePrice = Number(row.get("H"));
  if (!Number.isFinite(averagePrice)) return null;

  const startDate = excelDateToIso(row.get("A") ?? "");
  const endDate = excelDateToIso(row.get("B") ?? "");
  const ageDays = (Date.now() - new Date(`${endDate}T23:59:59Z`).getTime()) / 86_400_000;

  return {
    uf,
    fuel,
    averagePrice,
    minPrice: Number(row.get("J")) || undefined,
    maxPrice: Number(row.get("K")) || undefined,
    sampleSize: Number(row.get("F")) || undefined,
    period: `${startDate} a ${endDate}`,
    source: "ANP",
    sourceUrl: workbookUrl,
    lastUpdated: endDate,
    isStale: ageDays > 14,
  };
}
