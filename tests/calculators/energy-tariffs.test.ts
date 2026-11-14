import { describe, expect, it } from "vitest";
import fixture from "../fixtures/aneel-b1-history-2026-11-14.json";
import {
  groupByDistributor,
  kwhPrice,
  median,
  mergeRepeatedPeriods,
  nextDay,
  periodOn,
  rankByTariff,
  shortResolution,
  yearBefore,
  type DistributorTariffs,
  type RawTariffRow,
} from "../../src/lib/calculators/energy-tariffs";

/**
 * The fixture is ANEEL's own rows, recorded from the datastore on 2026-11-14 for five
 * distributors and the predecessors two of them absorbed. The expected numbers below were read
 * off those rows by hand (and match the AI Overview's "R$ 0,768" for Copel that day), not
 * computed by the module under test.
 */
const parse = (value: string) => Number(value.replace(/\./g, "").replace(",", "."));
const rows: RawTariffRow[] = fixture.records.map((record) => ({
  agent: record.SigAgente,
  cnpj: String(record.NumCNPJDistribuidora).padStart(14, "0"),
  start: record.DatInicioVigencia,
  end: record.DatFimVigencia,
  tusdMwh: parse(record.VlrTUSD),
  teMwh: parse(record.VlrTE),
  resolution: shortResolution(record.DscREH),
}));

const TODAY = "2026-11-14";
const grouped = groupByDistributor(rows, TODAY);
const withState = (agent: string): DistributorTariffs => {
  const found = grouped.find((distributor) => distributor.agent === agent);
  if (!found) throw new Error(`${agent} is not in force on ${TODAY}`);
  return { ...found, uf: null, stateSource: null, city: null };
};

describe("groupByDistributor", () => {
  it("keeps only the five distributors in force, not the predecessors they absorbed", () => {
    expect(grouped.map((d) => d.agent)).toEqual([
      "CEMIG-D",
      "COPEL-DIS",
      "CPFL Santa Cruz",
      "ELETROPAULO",
      "RGE",
    ]);
  });

  it("merges COPEL-DIS's 2025 cycle, which ANEEL split in two at 2026-01-01", () => {
    const copel = withState("COPEL-DIS");
    expect(rows.filter((row) => row.agent === "COPEL-DIS")).toHaveLength(19);
    expect(copel.periods).toHaveLength(18);
    expect(copel.periods.find((p) => p.resolution === "3.472/2025")).toEqual({
      start: "2025-06-24",
      end: "2026-06-23",
      tusdMwh: 366.67,
      teMwh: 275.75,
      resolution: "3.472/2025",
    });
  });

  it("keeps COPEL-DIS's series from 2010 to the period in force", () => {
    const { periods } = withState("COPEL-DIS");
    expect(periods[0]).toMatchObject({ start: "2010-06-24", tusdMwh: 188.98, teMwh: 111.02 });
    expect(kwhPrice(periods[0])).toBe(0.3);
    expect(periods[periods.length - 1]).toMatchObject({
      start: "2026-06-24",
      end: "2027-06-23",
      resolution: "3.592/2026",
    });
    expect(kwhPrice(periods[periods.length - 1])).toBe(0.76802);
  });

  it("keys a history by CNPJ and name, so a merger does not splice two areas together", () => {
    // ANEEL's "CPFL SANTA CRUZ" before 2018 had another CNPJ; the one in force uses CPFL
    // Jaguari's. The page shows the current entity's own rows only.
    const santaCruz = withState("CPFL Santa Cruz");
    expect(santaCruz.cnpj).toBe("53859112000169");
    expect(santaCruz.periods.length).toBeLessThanOrEqual(10);
    expect(santaCruz.periods.every((p) => p.start >= "2018-01-01")).toBe(true);
  });
});

describe("periodOn", () => {
  it("returns null in a year ANEEL has no row for, rather than guessing", () => {
    const { periods } = withState("COPEL-DIS");
    expect(periodOn(periods, "2012-08-01")).toBeNull();
    expect(periodOn(periods, "2016-12-01")).toBeNull();
    expect(periodOn(periods, "2013-02-01")?.resolution).toBe("1.431/2013");
  });
});

describe("rankByTariff", () => {
  const ranked = rankByTariff(["CEMIG-D", "COPEL-DIS", "ELETROPAULO"].map(withState), TODAY);

  it("orders the most expensive first, as ANEEL's ranking does", () => {
    expect(ranked.map((row) => [row.rank, row.agent, row.kwh])).toEqual([
      [1, "CEMIG-D", 0.90329],
      [2, "ELETROPAULO", 0.78938],
      [3, "COPEL-DIS", 0.76802],
    ]);
  });

  it("measures the change against the tariff in force on the same day a year before", () => {
    const byAgent = Object.fromEntries(ranked.map((row) => [row.agent, row]));
    expect(byAgent["COPEL-DIS"]).toMatchObject({ kwhYearBefore: 0.64242, changePct: 19.6 });
    expect(byAgent["ELETROPAULO"]).toMatchObject({ kwhYearBefore: 0.72518, changePct: 8.9 });
    expect(byAgent["CEMIG-D"]).toMatchObject({ kwhYearBefore: 0.85858, changePct: 5.2 });
  });

  it("leaves the change empty when no period covers the earlier date", () => {
    const copel = withState("COPEL-DIS");
    // 2013-08-01 is in force; 2012-08-01, a year before, falls in ANEEL's gap.
    const [row] = rankByTariff([copel], "2013-08-01");
    expect(row).toMatchObject({ kwhYearBefore: null, changePct: null });
  });
});

describe("mergeRepeatedPeriods", () => {
  it("does not merge equal values that are not contiguous", () => {
    const a = {
      start: "2020-01-01",
      end: "2020-12-31",
      tusdMwh: 1,
      teMwh: 1,
      resolution: "1/2020",
    };
    const b = { ...a, start: "2021-02-01", end: "2021-12-31" };
    expect(mergeRepeatedPeriods([b, a])).toHaveLength(2);
  });
});

describe("dates and labels", () => {
  it("walks the calendar without a Date object", () => {
    expect(nextDay("2025-12-31")).toBe("2026-01-01");
    expect(nextDay("2028-02-28")).toBe("2028-02-29");
    expect(nextDay("2027-02-28")).toBe("2027-03-01");
    expect(yearBefore("2028-02-29")).toBe("2027-02-28");
    expect(yearBefore(TODAY)).toBe("2025-11-14");
  });

  it("shortens ANEEL's resolution text to number and year", () => {
    expect(shortResolution("RESOLUÇÃO HOMOLOGATÓRIA Nº 3.592, DE 23 DE JUNHO DE 2026")).toBe(
      "3.592/2026",
    );
    expect(shortResolution(null)).toBeNull();
  });

  it("takes the middle value, or the mean of the two middle ones", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});
