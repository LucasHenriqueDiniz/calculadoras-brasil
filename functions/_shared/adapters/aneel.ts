import { decodeUtf8, fetchBounded } from "../bounded-fetch";
import { normalizeText, parseBrazilianNumber } from "../normalization";

const RESOURCE_ID = "fcf2906c-7c32-4b9b-a637-054e7a5234f4";
const API_URL = "https://dadosabertos.aneel.gov.br/api/action/datastore_search";

interface AneelRecord {
  DatGeracaoConjuntoDados: string;
  SigAgente: string;
  DatInicioVigencia: string;
  DatFimVigencia: string;
  VlrTUSD: string;
  VlrTE: string;
}

interface AneelResponse {
  success: boolean;
  result?: { records?: AneelRecord[] };
}

interface EnergyTariffResult {
  uf: string;
  distributor: string;
  tariffKwh: number;
  tusd: number;
  te: number;
  taxesIncluded: false;
  source: "ANEEL";
  sourceUrl: string;
  lastUpdated: string;
  isStale: boolean;
  notes: string;
}

function scoreDistributor(agent: string, query: string, uf: string): number {
  const normalizedAgent = normalizeText(agent);
  const normalizedQuery = normalizeText(query);
  if (normalizedAgent === normalizedQuery) return 100;
  if (normalizedAgent.includes(normalizedQuery) && normalizedAgent.endsWith(` ${uf}`)) return 80;
  if (normalizedAgent.includes(normalizedQuery)) return 50;
  return 0;
}

function roundTariff(value: number): number {
  return Math.round(value * 100_000) / 100_000;
}

export async function fetchAneelTariff(
  uf: string,
  distributor: string,
): Promise<EnergyTariffResult | null> {
  const filters = JSON.stringify({
    DscBaseTarifaria: "Tarifa de Aplicação",
    DscSubGrupo: "B1",
    DscModalidadeTarifaria: "Convencional",
    DscClasse: "Residencial",
    DscSubClasse: "Residencial",
    DscDetalhe: "Não se aplica",
    NomPostoTarifario: "Não se aplica",
    DscUnidadeTerciaria: "MWh",
  });
  const url = new URL(API_URL);
  url.searchParams.set("resource_id", RESOURCE_ID);
  url.searchParams.set("limit", "100");
  url.searchParams.set("q", distributor);
  url.searchParams.set("filters", filters);
  url.searchParams.set("sort", "DatFimVigencia desc");

  const { bytes } = await fetchBounded(url, {
    maxBytes: 1_000_000,
    headers: { accept: "application/json", "user-agent": "CalculadorasBrasil/1.0" },
  });
  const payload = JSON.parse(decodeUtf8(bytes)) as AneelResponse;
  if (!payload.success || !payload.result?.records) {
    throw new Error("A API de dados abertos da ANEEL retornou uma resposta inválida.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const record = payload.result.records
    .filter(
      (candidate) =>
        candidate.DatInicioVigencia <= today &&
        candidate.DatFimVigencia >= today &&
        scoreDistributor(candidate.SigAgente, distributor, uf) > 0,
    )
    .sort(
      (a, b) =>
        scoreDistributor(b.SigAgente, distributor, uf) -
          scoreDistributor(a.SigAgente, distributor, uf) ||
        b.DatInicioVigencia.localeCompare(a.DatInicioVigencia),
    )[0];
  if (!record) return null;

  const tusdMwh = parseBrazilianNumber(record.VlrTUSD);
  const teMwh = parseBrazilianNumber(record.VlrTE);
  if (tusdMwh === null || teMwh === null) return null;

  const lastUpdated = record.DatGeracaoConjuntoDados;
  const ageDays = (Date.now() - new Date(`${lastUpdated}T00:00:00Z`).getTime()) / 86_400_000;

  return {
    uf,
    distributor: record.SigAgente,
    tariffKwh: roundTariff((tusdMwh + teMwh) / 1000),
    tusd: roundTariff(tusdMwh / 1000),
    te: roundTariff(teMwh / 1000),
    taxesIncluded: false,
    source: "ANEEL",
    sourceUrl: url.toString(),
    lastUpdated,
    isStale: ageDays > 31,
    notes:
      "Tarifa B1 residencial convencional de aplicação. Não inclui impostos, bandeiras, contribuição de iluminação pública nem particularidades da fatura.",
  };
}
