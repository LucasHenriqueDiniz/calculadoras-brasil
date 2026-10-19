import { describe, expect, it } from "vitest";
import {
  ETHANOL_YIELD_PERCENT,
  buildFuelByStateTable,
  calculateCarCost,
  type CarCostInput,
} from "../../src/lib/calculators/carCost";

/** The page's example car, under flex. */
const CAR: CarCostInput = {
  monthlyKm: 800,
  cityConsumptionKmL: 10,
  highwayConsumptionKmL: 13,
  ethanolYieldPercent: 70,
  cityUsePercent: 80,
  gasolinePrice: 6,
  ethanolPrice: 4.2,
  dieselPrice: 6.1,
  fuelType: "flex",
  carValue: 50_000,
  ipvaAnnual: 2_000,
  insuranceAnnual: 2_500,
  licensingAnnual: 200,
  maintenanceMonthly: 250,
  tiresAnnual: 1_200,
  parkingMonthly: 0,
  tollsMonthly: 0,
  washingMonthly: 50,
  finesAndOthersMonthly: 0,
  depreciationAnnualPercent: 8,
};

function flex(overrides: Partial<CarCostInput> = {}) {
  return calculateCarCost({ ...CAR, ...overrides }).fuelComparison!;
}

/**
 * By hand: 640 km in town at 10 km/l and 160 km on the road at 13 km/l is
 * 64 + 12,3077 = 76,3077 litres of gasoline. At 70% of the yield, ethanol does
 * 7 and 9,1 km/l, so 76,3077 / 0,7 = 109,0110 litres.
 */
const GASOLINE_LITRES = 640 / 10 + 160 / 13;
const ETHANOL_LITRES = 640 / 7 + 160 / 9.1;

describe("calculateCarCost — flex compares each fuel at its own yield", () => {
  it("ties at a price ratio equal to the yield, as the 70% rule says", () => {
    // R$ 4,20 is exactly 70% of R$ 6,00. Run at one km/l for both fuels, as the
    // calculator did, ethanol came out R$ 137,35 a month cheaper.
    const comparison = flex();

    expect(comparison.gasolineMonthly).toBeCloseTo(GASOLINE_LITRES * 6, 6);
    expect(comparison.ethanolMonthly).toBeCloseTo(ETHANOL_LITRES * 4.2, 6);
    expect(comparison.cheaper).toBe("tie");
  });

  it("prices São Paulo's week by hand: ethanol R$ 64,53 cheaper", () => {
    // ANP, 04–10/10/2026: gasoline R$ 6,36, ethanol R$ 3,86.
    // 76,3077 × 6,36 = 485,3169; 109,0110 × 3,86 = 420,7824.
    const comparison = flex({ gasolinePrice: 6.36, ethanolPrice: 3.86 });

    expect(comparison.cheaper).toBe("ethanol");
    expect(comparison.gasolineMonthly).toBeCloseTo(485.3169, 3);
    expect(comparison.ethanolMonthly).toBeCloseTo(420.7824, 3);
    expect(comparison.differenceMonthly).toBeCloseTo(64.5345, 3);
  });

  it("prefers gasoline once ethanol costs more than the yield", () => {
    expect(flex({ ethanolPrice: 4.3 }).cheaper).toBe("gasoline");
    expect(flex({ ethanolPrice: 4.1 }).cheaper).toBe("ethanol");
  });

  it("follows the yield the visitor types", () => {
    // A car whose ethanol yields 75% makes R$ 4,40 (73,3%) the cheaper fuel.
    expect(flex({ ethanolYieldPercent: 75, ethanolPrice: 4.4 }).cheaper).toBe("ethanol");
    expect(flex({ ethanolYieldPercent: 70, ethanolPrice: 4.4 }).cheaper).toBe("gasoline");
  });

  it("falls back to the PBE median, and says so, when the yield is not a percentage", () => {
    for (const ethanolYieldPercent of [0, -5, 140]) {
      const result = calculateCarCost({ ...CAR, ethanolYieldPercent });
      expect(result.fuelComparison!.ethanolMonthly).toBeCloseTo(ETHANOL_LITRES * 4.2, 6);
      expect(result.warnings.some((w) => w.includes(`${ETHANOL_YIELD_PERCENT}%`))).toBe(true);
    }
  });

  it("leaves gasoline, ethanol and diesel alone outside flex", () => {
    // Outside flex, the consumption typed is the fuel's own: no yield applies.
    const ethanol = calculateCarCost({ ...CAR, fuelType: "ethanol" });
    expect(ethanol.monthlyFuelCost).toBeCloseTo(GASOLINE_LITRES * 4.2, 6);
    expect(ethanol.fuelComparison).toBeUndefined();
  });
});

describe("buildFuelByStateTable", () => {
  const STATES = [
    { uf: "SP", gasoline: 6.36, ethanol: 3.86 },
    { uf: "RN", gasoline: 6.6, ethanol: 5.03 },
    { uf: "AP", gasoline: 6.68, ethanol: null },
  ];

  it("is the form's own answer on every row", () => {
    for (const row of buildFuelByStateTable(STATES, CAR)) {
      if (row.ethanolPrice === null) continue;
      const form = flex({ gasolinePrice: row.gasolinePrice, ethanolPrice: row.ethanolPrice });
      expect(row.gasolineMonthly).toBe(form.gasolineMonthly);
      expect(row.ethanolMonthly).toBe(form.ethanolMonthly);
      expect(row.cheaper).toBe(form.cheaper);
      expect(row.monthlySaving).toBe(form.differenceMonthly);
    }
  });

  it("names the cheaper fuel and the price ratio", () => {
    const [sp, rn] = buildFuelByStateTable(STATES, CAR);

    expect(sp.cheaper).toBe("ethanol");
    expect(sp.priceRatio).toBeCloseTo(3.86 / 6.36, 10);
    expect(rn.cheaper).toBe("gasoline");
  });

  it("keeps a state the survey has no ethanol price for, without a verdict", () => {
    const ap = buildFuelByStateTable(STATES, CAR).find((row) => row.uf === "AP")!;

    expect(ap.ethanolPrice).toBeNull();
    expect(ap.cheaper).toBeNull();
    expect(ap.monthlySaving).toBe(0);
    expect(ap.gasolineMonthly).toBeCloseTo(GASOLINE_LITRES * 6.68, 6);
  });
});
