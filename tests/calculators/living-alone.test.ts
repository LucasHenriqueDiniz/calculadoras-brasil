import { describe, expect, it } from "vitest";
import { CAPITAL_LIVING_COSTS } from "../../src/data/capital-living-costs";
import {
  FINANCIAL_STATUS_BANDS,
  buildCapitalCostTable,
  calculateLivingAloneCost,
} from "../../src/lib/calculators/livingAlone";
import { MINIMUM_WAGE } from "../../src/lib/calculators/inss-constants";

const TABLE = buildCapitalCostTable(CAPITAL_LIVING_COSTS.capitals, 40, MINIMUM_WAGE);

describe("CAPITAL_LIVING_COSTS — the two reports, as printed", () => {
  it("has the 22 capitals FipeZAP covers, each with a cesta", () => {
    expect(CAPITAL_LIVING_COSTS.capitals).toHaveLength(22);
    for (const capital of CAPITAL_LIVING_COSTS.capitals) {
      expect(capital.rentPerSquareMetre).toBeGreaterThan(0);
      expect(capital.basicBasket).toBeGreaterThan(0);
    }
  });

  it("keeps the extremes as the reports print them", () => {
    // FipeZAP, setembro/2026: São Paulo R$ 65,78/m², the highest; Teresina R$ 32,59/m², the lowest.
    // DIEESE, Tabela 1, setembro/2026: São Paulo R$ 922,51; Aracaju R$ 587,76.
    const byCity = new Map(CAPITAL_LIVING_COSTS.capitals.map((c) => [c.city, c]));
    expect(byCity.get("São Paulo")).toMatchObject({
      rentPerSquareMetre: 65.78,
      basicBasket: 922.51,
    });
    expect(byCity.get("Teresina")?.rentPerSquareMetre).toBe(32.59);
    expect(byCity.get("Aracaju")?.basicBasket).toBe(587.76);
  });
});

describe("buildCapitalCostTable", () => {
  /** By hand: 65,78 × 40 = 2.631,20 of rent, + 922,51 = 3.553,71, or 2,19 minimum wages of R$ 1.621. */
  it("prices São Paulo by hand", () => {
    const sp = TABLE.find((row) => row.city === "São Paulo")!;

    expect(sp.rent).toBe(2631.2);
    expect(sp.monthlyTotal).toBeCloseTo(3553.71, 2);
    expect(sp.minimumWages).toBeCloseTo(3553.71 / 1621, 6);
  });

  it("is the form's own total on every row", () => {
    for (const row of TABLE) {
      const form = calculateLivingAloneCost({
        rent: row.rent,
        condoFee: 0,
        iptuMonthly: 0,
        electricity: 0,
        water: 0,
        gas: 0,
        internet: 0,
        phone: 0,
        groceries: row.basicBasket,
        deliveryAndRestaurants: 0,
        transportation: 0,
        cleaningAndHygiene: 0,
        laundry: 0,
        furnitureInstallments: 0,
        subscriptions: 0,
        healthAndMedicine: 0,
        leisure: 0,
        emergencyReserve: 0,
        otherCosts: 0,
        netIncome: 0,
      });
      expect(row.monthlyTotal).toBe(form.monthlyTotal);
    }
  });

  it("runs from the dearest capital to the cheapest", () => {
    // By hand, the cheapest: Teresina 32,59 × 40 + 698,55 = 2.002,15.
    expect(TABLE[0].city).toBe("São Paulo");
    expect(TABLE.at(-1)!.city).toBe("Teresina");
    expect(TABLE.at(-1)!.monthlyTotal).toBeCloseTo(2002.15, 2);
    for (let i = 1; i < TABLE.length; i += 1) {
      expect(TABLE[i - 1].monthlyTotal).toBeGreaterThanOrEqual(TABLE[i].monthlyTotal);
    }
  });
});

describe("calculateLivingAloneCost — the income bands the FAQ quotes", () => {
  const atShare = (percent: number) =>
    calculateLivingAloneCost({
      rent: percent * 10,
      condoFee: 0,
      iptuMonthly: 0,
      electricity: 0,
      water: 0,
      gas: 0,
      internet: 0,
      phone: 0,
      groceries: 0,
      deliveryAndRestaurants: 0,
      transportation: 0,
      cleaningAndHygiene: 0,
      laundry: 0,
      furnitureInstallments: 0,
      subscriptions: 0,
      healthAndMedicine: 0,
      leisure: 0,
      emergencyReserve: 0,
      otherCosts: 0,
      netIncome: 1_000,
    }).financialStatus;

  it.each([
    [FINANCIAL_STATUS_BANDS.comfortable, "comfortable"],
    [FINANCIAL_STATUS_BANDS.comfortable + 1, "attention"],
    [FINANCIAL_STATUS_BANDS.attention, "attention"],
    [FINANCIAL_STATUS_BANDS.attention + 1, "tight"],
    [FINANCIAL_STATUS_BANDS.tight, "tight"],
    [FINANCIAL_STATUS_BANDS.tight + 1, "critical"],
  ] as const)("calls %s%% of income %s", (percent, status) => {
    expect(atShare(percent)).toBe(status);
  });
});
