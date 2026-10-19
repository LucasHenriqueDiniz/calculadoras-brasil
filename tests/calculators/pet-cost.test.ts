import { describe, expect, it } from "vitest";
import {
  buildFeedingTable,
  calculatePetCost,
  dailyEnergyKcal,
  dailyFoodGrams,
} from "../../src/lib/calculators/petCost";

describe("dailyEnergyKcal — FEDIAF 2024", () => {
  /** By hand: 10^0,75 = 5,6234, so a 3-to-7-year-old dog of 10 kg needs 110 × 5,6234 = 618,6 kcal. */
  it("prices an adult dog by Table VII-6", () => {
    expect(dailyEnergyKcal("dog-adult", 10)).toBeCloseTo(618.575, 2);
  });

  /** By hand: 4^0,67 = 2,5315, so a 4 kg indoor cat needs 75 × 2,5315 = 189,9 kcal. */
  it("prices a cat on the 0,67 exponent, not the dog's 0,75", () => {
    expect(dailyEnergyKcal("cat-indoor", 4)).toBeCloseTo(189.86, 1);
  });

  it("orders the dog's ages as FEDIAF does: young > adult > senior", () => {
    expect(dailyEnergyKcal("dog-young", 20)).toBeGreaterThan(dailyEnergyKcal("dog-adult", 20));
    expect(dailyEnergyKcal("dog-adult", 20)).toBeGreaterThan(dailyEnergyKcal("dog-senior", 20));
  });

  it("is zero for no weight", () => {
    expect(dailyEnergyKcal("dog-adult", 0)).toBe(0);
  });
});

describe("dailyFoodGrams", () => {
  /** 618,575 kcal of a food with 3.500 kcal/kg is 176,7 g. */
  it("turns energy into grams of the food on the bag", () => {
    expect(dailyFoodGrams("dog-adult", 10, 3500)).toBeCloseTo(176.736, 2);
  });

  it("asks for less of a denser food", () => {
    expect(dailyFoodGrams("dog-adult", 10, 4000)).toBeLessThan(
      dailyFoodGrams("dog-adult", 10, 3500),
    );
  });
});

describe("buildFeedingTable", () => {
  /**
   * By hand: 176,736 g rounds to the 177 g the page shows; over 365/12 days that
   * is 5,38375 kg a month, R$ 53,84 at R$ 10/kg.
   */
  it("prices a 10 kg adult dog's month by hand, on the grams it shows", () => {
    const [row] = buildFeedingTable([{ profile: "dog-adult", weightKg: 10 }], 3500, 10);

    expect(row.gramsPerDay).toBe(177);
    expect(row.kgPerMonth).toBeCloseTo(5.38375, 5);
    expect(row.monthlyFoodCost).toBeCloseTo(53.8375, 4);
  });

  it("is the form's own food cost on every row", () => {
    const rows = buildFeedingTable(
      [
        { profile: "dog-adult", weightKg: 5 },
        { profile: "dog-senior", weightKg: 30 },
        { profile: "cat-indoor", weightKg: 4 },
      ],
      3500,
      10,
    );
    for (const row of rows) {
      const form = calculatePetCost({
        foodPackagePrice: 100,
        foodPackageWeightKg: 10,
        dailyFoodGrams: row.gramsPerDay,
        foodMonthly: 0,
        litterAndHygieneMonthly: 0,
        groomingMonthly: 0,
        healthPlanMonthly: 0,
        toysMonthly: 0,
        medicationMonthly: 0,
        vaccinesAnnual: 0,
        checkupsAnnual: 0,
        fleaAndWormAnnual: 0,
        emergencyReserveMonthly: 0,
        quantity: 1,
      });
      expect(row.monthlyFoodCost).toBeCloseTo(form.calculatedFoodMonthly, 10);
    }
  });
});
