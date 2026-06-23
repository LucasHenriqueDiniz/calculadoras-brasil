import { describe, expect, it } from "vitest";
import { calculateCarCost } from "../src/lib/calculators/carCost";
import { calculateLivingAloneCost } from "../src/lib/calculators/livingAlone";
import { calculateElectricityBill } from "../src/lib/calculators/electricityBill";
import { calculateSubscriptions } from "../src/lib/calculators/subscriptions";
import { calculateMovingCost } from "../src/lib/calculators/movingCost";
import { calculatePetCost } from "../src/lib/calculators/petCost";

describe("calculadoras principais", () => {
  it("calcula o cenário de custo de carro", () => {
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

  it("não divide por zero no custo do carro", () => {
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

  it("calcula morar sozinho e alerta orçamento negativo", () => {
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

  it("calcula consumo elétrico com quantidade", () => {
    const result = calculateElectricityBill({
      tariff: 1,
      appliances: [
        { id: "a", name: "Teste", watts: 1000, hoursPerDay: 1, daysPerMonth: 30, quantity: 2 },
      ],
    });
    expect(result.totalKwhPerMonth).toBe(60);
    expect(result.totalCostPerMonth).toBe(60);
  });

  it("normaliza assinaturas mensais, anuais, semanais e trimestrais", () => {
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

  it("soma mudança e contingência", () => {
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

  it("calcula ração por pacote e rateia custos anuais do pet", () => {
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
