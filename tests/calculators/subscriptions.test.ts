import { describe, expect, it } from "vitest";
import { STREAMING_ANNUAL_PLANS } from "../../src/data/streaming-annual-plans";
import {
  buildAnnualPlanTable,
  calculateSubscriptions,
  compareAnnualPlan,
} from "../../src/lib/calculators/subscriptions";

describe("compareAnnualPlan", () => {
  /**
   * Amazon Prime, 18/10/2026: R$ 19,90 a month or R$ 166,80 a year. By hand,
   * twelve months cost R$ 238,80, the year saves R$ 72,00 (30,15%), and the
   * annual price is 166,80 / 19,90 = 8,38 monthly payments.
   */
  it("prices Amazon Prime's two plans by hand", () => {
    const prime = compareAnnualPlan(19.9, 166.8);

    expect(prime.yearlySaving).toBeCloseTo(72, 6);
    expect(prime.savingShare).toBeCloseTo(72 / 238.8, 10);
    expect(prime.breakEvenMonths).toBeCloseTo(166.8 / 19.9, 10);
    expect(prime.annualPerMonth).toBeCloseTo(13.9, 6);
  });

  it("makes the annual plan the cheaper one exactly from the break-even month on", () => {
    // HBO Max Platinum: R$ 55,90 or R$ 538,80. 538,80 / 55,90 = 9,64, so nine
    // monthly payments (R$ 503,10) cost less than the year, and ten (R$ 559,00) more.
    const platinum = compareAnnualPlan(55.9, 538.8);

    expect(platinum.breakEvenMonths).toBeGreaterThan(9);
    expect(platinum.breakEvenMonths).toBeLessThan(10);
    expect(9 * 55.9).toBeLessThan(platinum.annual);
    expect(10 * 55.9).toBeGreaterThan(platinum.annual);
  });

  it("uses the calculator's own annual cycle for the monthly equivalent", () => {
    const [annual] = calculateSubscriptions([
      { id: "a", name: "", category: "", value: 407.88, cycle: "annual", keep: true },
    ]).items;

    expect(compareAnnualPlan(49.9, 407.88).annualPerMonth).toBe(annual.monthly);
  });

  it("says nothing about a plan with no monthly price", () => {
    expect(compareAnnualPlan(0, 100).breakEvenMonths).toBe(0);
    expect(compareAnnualPlan(0, 100).savingShare).toBe(0);
  });
});

describe("buildAnnualPlanTable", () => {
  const TABLE = buildAnnualPlanTable(STREAMING_ANNUAL_PLANS.plans);

  it("has every plan the services' pages showed", () => {
    expect(TABLE).toHaveLength(6);
  });

  it("runs from the earliest break-even to the latest", () => {
    // By hand: Disney+ Padrão 407,88 / 49,90 = 8,17 first; HBO Max Platinum 9,64 last.
    expect(TABLE[0]).toMatchObject({ service: "Disney+", plan: "Padrão" });
    expect(TABLE[0].breakEvenMonths).toBeCloseTo(8.1739, 4);
    expect(TABLE.at(-1)).toMatchObject({ service: "HBO Max", plan: "Platinum" });
    for (let i = 1; i < TABLE.length; i += 1) {
      expect(TABLE[i].breakEvenMonths).toBeGreaterThanOrEqual(TABLE[i - 1].breakEvenMonths);
    }
  });

  it("is compareAnnualPlan on every row", () => {
    for (const row of TABLE) {
      expect(row).toMatchObject(compareAnnualPlan(row.monthly, row.annual));
    }
  });
});
