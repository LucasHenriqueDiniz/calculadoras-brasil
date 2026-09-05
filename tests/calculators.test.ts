import { describe, expect, it } from "vitest";
import { calculateCarCost } from "../src/lib/calculators/carCost";
import { calculateLivingAloneCost } from "../src/lib/calculators/livingAlone";
import { calculateElectricityBill } from "../src/lib/calculators/electricityBill";
import { calculateSubscriptions } from "../src/lib/calculators/subscriptions";
import { calculateMovingCost } from "../src/lib/calculators/movingCost";
import { calculatePetCost } from "../src/lib/calculators/petCost";
import { calculateInssAutonomo } from "../src/lib/calculators/inssAutonomo";
import {
  calculateEmployeeInss,
  MINIMUM_WAGE,
  INSS_CEILING,
} from "../src/lib/calculators/inss-constants";

describe("core calculators", () => {
  it("computes the car cost scenario", () => {
    const result = calculateCarCost({
      monthlyKm: 800,
      cityConsumptionKmL: 10,
      highwayConsumptionKmL: 13,
      cityUsePercent: 80,
      gasolinePrice: 6,
      ethanolPrice: 4.2,
      dieselPrice: 6.1,
      fuelType: "gasoline",
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
    });

    expect(result.monthlyFuelCost).toBeCloseTo(457.85, 1);
    expect(result.monthlyTotal).toBeCloseTo(1582.85, 1);
    expect(result.annualTotal).toBeCloseTo(18_994.2, 0);
    expect(result.costPerKm).toBeCloseTo(1.98, 1);
  });

  it("does not divide by zero in the car cost", () => {
    const result = calculateCarCost({
      monthlyKm: 0,
      cityConsumptionKmL: 0,
      highwayConsumptionKmL: 0,
      cityUsePercent: 80,
      gasolinePrice: 0,
      ethanolPrice: 0,
      dieselPrice: 0,
      fuelType: "flex",
      carValue: 0,
      ipvaAnnual: 0,
      insuranceAnnual: 0,
      licensingAnnual: 0,
      maintenanceMonthly: 0,
      tiresAnnual: 0,
      parkingMonthly: 0,
      tollsMonthly: 0,
      washingMonthly: 0,
      finesAndOthersMonthly: 0,
      depreciationAnnualPercent: 0,
    });
    expect(result.costPerKm).toBeNull();
    expect(Number.isNaN(result.monthlyTotal)).toBe(false);
  });

  it("computes living alone and flags a negative budget", () => {
    const result = calculateLivingAloneCost({
      rent: 1200,
      condoFee: 250,
      iptuMonthly: 80,
      electricity: 180,
      water: 80,
      gas: 80,
      internet: 120,
      phone: 60,
      groceries: 700,
      deliveryAndRestaurants: 250,
      transportation: 250,
      cleaningAndHygiene: 120,
      laundry: 0,
      furnitureInstallments: 200,
      subscriptions: 80,
      healthAndMedicine: 100,
      leisure: 250,
      emergencyReserve: 300,
      otherCosts: 100,
      netIncome: 3500,
    });
    expect(result.monthlyTotal).toBe(4400);
    expect(result.remainingIncome).toBe(-900);
    expect(result.financialStatus).toBe("critical");
  });

  it("computes electricity use with a quantity", () => {
    const result = calculateElectricityBill({
      tariff: 1,
      appliances: [
        { id: "a", name: "Teste", watts: 1000, hoursPerDay: 1, daysPerMonth: 30, quantity: 2 },
      ],
    });
    expect(result.totalKwhPerMonth).toBe(60);
    expect(result.totalCostPerMonth).toBe(60);
  });

  it("normalises monthly, yearly, weekly and quarterly subscriptions", () => {
    const result = calculateSubscriptions([
      { id: "a", name: "Streaming", category: "A", value: 50, cycle: "monthly", keep: true },
      { id: "b", name: "Anual", category: "B", value: 120, cycle: "annual", keep: true },
      { id: "c", name: "Trimestral", category: "C", value: 90, cycle: "quarterly", keep: false },
    ]);
    expect(result.monthlyTotal).toBe(60);
    expect(result.annualTotal).toBe(720);
    expect(result.fiveYearTotal).toBe(3600);
    expect(result.monthlySavings).toBe(30);
  });

  it("adds up the move and its contingency", () => {
    const result = calculateMovingCost({
      truckAndLabor: 1200,
      packingMaterials: 200,
      insurance: 100,
      buildingFees: 0,
      cleaning: 0,
      assembly: 0,
      deposit: 2000,
      firstRent: 0,
      utilitySetup: 300,
      furniture: 1500,
      appliances: 0,
      other: 0,
      contingencyPercent: 10,
    });
    expect(result.subtotal).toBe(5300);
    expect(result.contingency).toBe(530);
    expect(result.total).toBe(5830);
  });

  it("computes food per bag and spreads the pet's yearly costs", () => {
    const result = calculatePetCost({
      foodPackagePrice: 100,
      foodPackageWeightKg: 10,
      dailyFoodGrams: 200,
      foodMonthly: 0,
      litterAndHygieneMonthly: 0,
      groomingMonthly: 0,
      healthPlanMonthly: 0,
      toysMonthly: 0,
      medicationMonthly: 0,
      vaccinesAnnual: 120,
      checkupsAnnual: 0,
      fleaAndWormAnnual: 0,
      emergencyReserveMonthly: 0,
      quantity: 1,
    });
    expect(result.calculatedFoodMonthly).toBe(60);
    expect(result.monthlyFoodKg).toBe(6);
    expect(result.foodPackageDurationDays).toBe(50);
    expect(result.monthlyTotal).toBe(70);
  });
});

describe("INSS: progressive employee contribution", () => {
  it("applies the rate only to the slice inside each bracket", () => {
    // 1621 * 7,5% = 121,575 — first bracket in isolation.
    expect(calculateEmployeeInss(1621)).toBeCloseTo(121.575, 3);

    // 121,575 + (2902,84 - 1621) * 9% = 121,575 + 115,366 = 236,94
    expect(calculateEmployeeInss(2902.84)).toBeCloseTo(236.94, 2);

    // 236,94 + (4354,27 - 2902,84) * 12% = 236,94 + 174,17 = 411,11
    expect(calculateEmployeeInss(4354.27)).toBeCloseTo(411.11, 2);
  });

  it("matches the maximum deduction published for the 2026 ceiling", () => {
    // Reference value published for 2026: R$ 988,09.
    expect(calculateEmployeeInss(INSS_CEILING)).toBeCloseTo(988.09, 2);
  });

  it("never charges more than the contribution at the ceiling", () => {
    const noTeto = calculateEmployeeInss(INSS_CEILING);
    expect(calculateEmployeeInss(50_000)).toBeCloseTo(noTeto, 2);
    // The maximum contribution sits well below 20% of the ceiling.
    expect(noTeto).toBeLessThan(INSS_CEILING * 0.2);
  });

  it("keeps the effective rate progressive and below 14%", () => {
    const salario = 5000;
    const aliquotaEfetiva = calculateEmployeeInss(salario) / salario;
    expect(aliquotaEfetiva).toBeGreaterThan(0.075);
    expect(aliquotaEfetiva).toBeLessThan(0.14);
  });
});

describe("self-employed INSS", () => {
  it("charges 20% of the income and 11% always of the minimum wage", () => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome: 3000,
      contributedMonths: 0,
      contributorSex: "masculino",
    });

    expect(result.contributionBase).toBe(3000);
    expect(result.standardPlan.monthlyContribution).toBeCloseTo(600, 2);
    // The simplified plan does not follow the income: 11% of the minimum wage.
    expect(result.simplifiedPlan.monthlyContribution).toBeCloseTo(MINIMUM_WAGE * 0.11, 2);
    expect(result.simplifiedPlan.countsTowardsContributionTime).toBe(false);
  });

  it("clamps the contribution salary to the floor and the ceiling", () => {
    const aboveCeiling = calculateInssAutonomo({
      grossMonthlyIncome: 30_000,
      contributedMonths: 0,
      contributorSex: "masculino",
    });
    expect(aboveCeiling.contributionBase).toBe(INSS_CEILING);
    expect(aboveCeiling.cappedByCeiling).toBe(true);

    const belowFloor = calculateInssAutonomo({
      grossMonthlyIncome: 800,
      contributedMonths: 0,
      contributorSex: "masculino",
    });
    expect(belowFloor.contributionBase).toBe(MINIMUM_WAGE);
    expect(belowFloor.raisedToFloor).toBe(true);
  });

  it("estimates no benefit before the minimum contribution time", () => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome: 5000,
      contributedMonths: 10 * 12,
      contributorSex: "masculino",
    });
    expect(result.minimumTimeReached).toBe(false);
    expect(result.standardPlanBenefitEstimate).toBe(0);
  });

  it("applies 60% of the average plus 2% per extra year (EC 103/2019)", () => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome: 5000,
      contributedMonths: 25 * 12,
      contributorSex: "masculino",
    });
    // 20 years of requirement + 5 extra years = 60% + 10% = 70%
    expect(result.minimumTimeReached).toBe(true);
    expect(result.appliedAveragePercentage).toBe(70);
    expect(result.standardPlanBenefitEstimate).toBeCloseTo(3500, 2);
  });

  it("uses the shorter requirement for women", () => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome: 5000,
      contributedMonths: 15 * 12,
      contributorSex: "feminino",
    });
    expect(result.minimumContributionYears).toBe(15);
    expect(result.minimumTimeReached).toBe(true);
    expect(result.appliedAveragePercentage).toBe(60);
  });

  it("never estimates a benefit below the floor or above the ceiling", () => {
    const alto = calculateInssAutonomo({
      grossMonthlyIncome: 30_000,
      contributedMonths: 40 * 12,
      contributorSex: "masculino",
    });
    expect(alto.standardPlanBenefitEstimate).toBeLessThanOrEqual(INSS_CEILING);

    const baixo = calculateInssAutonomo({
      grossMonthlyIncome: MINIMUM_WAGE,
      contributedMonths: 20 * 12,
      contributorSex: "masculino",
    });
    expect(baixo.standardPlanBenefitEstimate).toBeGreaterThanOrEqual(MINIMUM_WAGE);
  });
});

describe("calculateInssAutonomo — the literal values are stored data", () => {
  /**
   * `contributorSex` and `InssPlan` are the only fields in this feature whose
   * *values* — not just their names — are persisted. The route serialises the
   * whole input into `localStorage` under `inss-autonomo-input-v2`, so a
   * returning visitor hands the module a literal written by an older build.
   *
   * Slice 3 of docs/plans/english-domain-identifiers/ renamed the type and the
   * field and deliberately left the literals in Portuguese: changing them would
   * be a data migration needing a `-v3` key, not a rename. These cases fail if
   * someone changes a literal without bumping the key.
   */
  it.each([
    ["masculino", 20],
    ["feminino", 15],
  ] as const)("accepts the stored contributorSex %s and requires %i years", (stored, years) => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome: 3000,
      contributedMonths: 120,
      contributorSex: stored,
    });

    expect(result.minimumContributionYears).toBe(years);
  });

  it("keeps both plan detail shapes reachable, whichever plan a stored value names", () => {
    const result = calculateInssAutonomo({
      grossMonthlyIncome: 3000,
      contributedMonths: 120,
      contributorSex: "masculino",
    });

    // "normal" and "simplificado" are the InssPlan literals a stored input may carry.
    expect(result.standardPlan.countsTowardsContributionTime).toBe(true);
    expect(result.simplifiedPlan.countsTowardsContributionTime).toBe(false);
    expect(result.simplifiedPlan.base).toBe(MINIMUM_WAGE);
  });
});
