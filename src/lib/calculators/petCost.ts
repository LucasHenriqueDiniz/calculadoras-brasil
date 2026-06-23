export interface PetCostInput {
  foodPackagePrice: number;
  foodPackageWeightKg: number;
  dailyFoodGrams: number;
  foodMonthly: number;
  litterAndHygieneMonthly: number;
  groomingMonthly: number;
  healthPlanMonthly: number;
  toysMonthly: number;
  medicationMonthly: number;
  vaccinesAnnual: number;
  checkupsAnnual: number;
  fleaAndWormAnnual: number;
  emergencyReserveMonthly: number;
  quantity: number;
}

export function calculatePetCost(input: PetCostInput) {
  const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
  const quantity = Math.max(1, Math.floor(safe(input.quantity) || 1));
  const packagePrice = safe(input.foodPackagePrice);
  const packageWeightKg = safe(input.foodPackageWeightKg);
  const dailyFoodGrams = safe(input.dailyFoodGrams);
  const monthlyFoodKg = (dailyFoodGrams * 30) / 1000;
  const calculatedFoodMonthly =
    packagePrice > 0 && packageWeightKg > 0 && dailyFoodGrams > 0
      ? (packagePrice / packageWeightKg) * monthlyFoodKg
      : safe(input.foodMonthly);
  const food = calculatedFoodMonthly * quantity;
  const hygiene = (safe(input.litterAndHygieneMonthly) + safe(input.groomingMonthly)) * quantity;
  const health =
    (safe(input.healthPlanMonthly) +
      safe(input.medicationMonthly) +
      safe(input.vaccinesAnnual) / 12 +
      safe(input.checkupsAnnual) / 12 +
      safe(input.fleaAndWormAnnual) / 12) *
    quantity;
  const wellbeing = (safe(input.toysMonthly) + safe(input.emergencyReserveMonthly)) * quantity;
  const monthlyTotal = food + hygiene + health + wellbeing;

  return {
    quantity,
    monthlyFoodKg: monthlyFoodKg * quantity,
    foodPackageDurationDays:
      packageWeightKg > 0 && dailyFoodGrams > 0 ? (packageWeightKg * 1000) / dailyFoodGrams : null,
    calculatedFoodMonthly,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    breakdown: [
      { key: "food", label: "Alimentação", monthly: food, annual: food * 12 },
      { key: "hygiene", label: "Higiene e banho", monthly: hygiene, annual: hygiene * 12 },
      { key: "health", label: "Saúde", monthly: health, annual: health * 12 },
      {
        key: "wellbeing",
        label: "Bem-estar e reserva",
        monthly: wellbeing,
        annual: wellbeing * 12,
      },
    ],
  };
}
