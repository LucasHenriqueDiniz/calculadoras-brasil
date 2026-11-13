import { afterEach, describe, expect, it, vi } from "vitest";
import { distributorsInForce, fetchAneelDistributors } from "../src/server/adapters/aneel";

/**
 * On 2026-11-13 the distributor list failed on every request: the query asked for every field
 * of all 3,824 tariff rows, ANEEL answered 2,214,387 bytes, and the adapter's cap was 2,000,000.
 *
 * The fake upstream below answers the way ANEEL's CKAN datastore does: it honours `fields`,
 * `sort` and `limit`, and a full row weighs what a real one does (about 580 bytes). Its history
 * is 103 distributors over 37 yearly tariffs, the shape and size that broke production.
 */
const DISTRIBUTORS = 103;
const YEARS_OF_HISTORY = 37;
const FILLER = "x".repeat(420);

interface FakeRow {
  SigAgente: string;
  DatInicioVigencia: string;
  DatFimVigencia: string;
  [field: string]: string;
}

function fakeHistory(currentYear: number): FakeRow[] {
  const rows: FakeRow[] = [];
  for (let d = 0; d < DISTRIBUTORS; d += 1) {
    for (let y = currentYear - YEARS_OF_HISTORY + 1; y <= currentYear; y += 1) {
      rows.push({
        SigAgente: `DIST-${String(d).padStart(3, "0")}`,
        DatInicioVigencia: `${y}-01-01`,
        DatFimVigencia: `${y}-12-31`,
        DatGeracaoConjuntoDados: "2026-11-12",
        DscREH: FILLER,
        VlrTUSD: "450,17",
        VlrTE: "310,85",
      });
    }
  }
  return rows;
}

function fakeCkan(rows: FakeRow[]) {
  return async (input: string | URL) => {
    const params = new URL(String(input)).searchParams;
    const [sortField, direction] = (params.get("sort") ?? "_id asc").split(" ");
    const sorted = [...rows].sort(
      (a, b) =>
        (direction === "desc" ? -1 : 1) * (a[sortField] ?? "").localeCompare(b[sortField] ?? ""),
    );
    const limited = sorted.slice(0, Number(params.get("limit") ?? 100));
    const fields = params.get("fields")?.split(",");
    const records = fields
      ? limited.map((row) => Object.fromEntries(fields.map((field) => [field, row[field]])))
      : limited;
    return new Response(JSON.stringify({ success: true, result: { records } }));
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchAneelDistributors", () => {
  const currentYear = new Date().getUTCFullYear();
  const history = fakeHistory(currentYear);

  /** Keeps the test honest: the fake must reproduce the size that broke production. */
  it("is fed a history whose full rows exceed the 2 MB that failed in production", () => {
    expect(JSON.stringify({ success: true, result: { records: history } }).length).toBeGreaterThan(
      2_000_000,
    );
  });

  it("lists every distributor in force, whatever the size of the history", async () => {
    vi.stubGlobal("fetch", fakeCkan(history));
    const options = await fetchAneelDistributors("SP");
    expect(options).toHaveLength(DISTRIBUTORS);
    expect(options[0]).toMatchObject({ uf: "SP", distributor: "DIST-000", source: "ANEEL" });
  });
});

describe("distributorsInForce", () => {
  const today = "2026-11-13";

  it("keeps the rows whose validity covers today, once each, sorted", () => {
    expect(
      distributorsInForce(
        [
          { SigAgente: "EDP SP", DatInicioVigencia: "2026-10-23", DatFimVigencia: "2027-10-22" },
          { SigAgente: "COPEL-DIS", DatInicioVigencia: "2026-06-24", DatFimVigencia: "2027-06-23" },
          { SigAgente: "EDP SP", DatInicioVigencia: "2026-10-23", DatFimVigencia: "2027-10-22" },
          { SigAgente: "FUTURA", DatInicioVigencia: "2027-01-01", DatFimVigencia: "2027-12-31" },
          { SigAgente: "EXPIRADA", DatInicioVigencia: "2025-01-01", DatFimVigencia: "2025-12-31" },
        ],
        today,
        1000,
      ),
    ).toEqual(["COPEL-DIS", "EDP SP"]);
  });

  it("refuses a full page whose last row is still in force, since more may follow", () => {
    const stillInForce = {
      SigAgente: "A",
      DatInicioVigencia: "2026-01-01",
      DatFimVigencia: "2026-12-31",
    };
    expect(() => distributorsInForce([stillInForce, stillInForce], today, 2)).toThrow(/cut short/);
  });
});
