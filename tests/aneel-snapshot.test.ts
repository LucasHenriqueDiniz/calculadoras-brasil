import { describe, expect, it } from "vitest";
import { ANEEL_DISTRIBUTOR_STATES } from "../src/data/aneel-distributor-states";
import { ANEEL_TARIFF_SNAPSHOT } from "../src/data/aneel-tariff-snapshot";
import { ANEEL_TARIFF_SUMMARY } from "../src/data/aneel-tariff-summary";
import { BRAZILIAN_STATES } from "../src/lib/public-data/states";
import { lastmodFor } from "../src/lib/seo-pages";
import { distributorsForState } from "../src/server/adapters/aneel";
import { periodOn, rankByTariff, summarizeRanking } from "../src/lib/calculators/energy-tariffs";

const UFS = new Set<string>(BRAZILIAN_STATES.map((state) => state.value));
const { referenceDate, distributors } = ANEEL_TARIFF_SNAPSHOT;

describe("ANEEL_TARIFF_SNAPSHOT", () => {
  it("dates /tarifa-de-energia by the snapshot it renders", () => {
    expect(lastmodFor("/tarifa-de-energia")).toBe(referenceDate);
  });

  it("places every distributor in a real state", () => {
    const misplaced = distributors.filter((d) => !d.uf || !UFS.has(d.uf)).map((d) => d.agent);
    expect(misplaced).toEqual([]);
  });

  it("gives every distributor a tariff in force on the reference date", () => {
    const without = distributors
      .filter((d) => periodOn(d.periods, referenceDate) === null)
      .map((d) => d.agent);
    expect(without).toEqual([]);
  });

  it("keeps each history in order with no two periods overlapping", () => {
    const broken = distributors
      .filter((d) => d.periods.some((p, i) => i > 0 && p.start <= d.periods[i - 1].end))
      .map((d) => d.agent);
    expect(broken).toEqual([]);
  });

  it("does not list ANEEL's placeholder agent as a distributor", () => {
    expect(distributors.some((d) => d.agent.toUpperCase() === "NÃO INFORMADO")).toBe(false);
  });

  it("carries the summary the page's head and prose read, equal to the table's ranking", () => {
    expect(ANEEL_TARIFF_SUMMARY).toEqual(
      summarizeRanking(rankByTariff(distributors, referenceDate), referenceDate),
    );
  });

  it("writes the same states into the file the API filters by", () => {
    expect(ANEEL_DISTRIBUTOR_STATES).toEqual(
      Object.fromEntries(distributors.map((d) => [d.agent, d.uf])),
    );
  });
});

describe("distributorsForState", () => {
  const live = [
    "Âmbar Amazonas",
    "COPEL-DIS",
    "CERAL-DIS",
    "ELETROPAULO",
    "NOVA-DIS",
    "Não Informado",
  ];

  it("lists the state's distributors, then any the snapshot cannot place", () => {
    expect(distributorsForState(live, "PR", ANEEL_DISTRIBUTOR_STATES)).toEqual([
      "COPEL-DIS",
      "CERAL-DIS",
      "NOVA-DIS",
    ]);
  });

  it("falls back to the national list when the state matches nothing", () => {
    expect(
      distributorsForState(["NOVA-DIS", "Não Informado"], "PR", ANEEL_DISTRIBUTOR_STATES),
    ).toEqual(["NOVA-DIS"]);
  });
});
