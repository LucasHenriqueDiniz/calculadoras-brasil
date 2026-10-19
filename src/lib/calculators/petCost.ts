/**
 * Days in an average month. Food was counted on 30, so the year came to 360
 * days of food: five days short, 1,4% of the bill for the largest item.
 */
export const DAYS_PER_MONTH = 365 / 12;

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
  const monthlyFoodKg = (dailyFoodGrams * DAYS_PER_MONTH) / 1000;
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

/**
 * How much energy an adult dog or cat needs a day, from the FEDIAF Nutritional
 * Guidelines (September 2025, the same figures as July 2024): Table VII-6 for
 * dogs by age, in kcal ME per kg of
 * body weight to the 0,75; § 7.2.4.2 and Table VII-9 for cats, per kg to the
 * 0,67 (docs/research/2026-10-18-adsense-added-value/fetches/fediaf-energy-requirements.md).
 * Averages: FEDIAF calls them starting points, and an individual animal can
 * need noticeably more or less.
 */
export type PetProfile = "dog-young" | "dog-adult" | "dog-senior" | "cat-indoor" | "cat-active";

export const FEDIAF_ENERGY: Record<PetProfile, { kcalPerMetabolicKg: number; exponent: number }> = {
  "dog-young": { kcalPerMetabolicKg: 130, exponent: 0.75 },
  "dog-adult": { kcalPerMetabolicKg: 110, exponent: 0.75 },
  "dog-senior": { kcalPerMetabolicKg: 95, exponent: 0.75 },
  "cat-indoor": { kcalPerMetabolicKg: 75, exponent: 0.67 },
  "cat-active": { kcalPerMetabolicKg: 100, exponent: 0.67 },
};

export function dailyEnergyKcal(profile: PetProfile, weightKg: number): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return 0;
  const { kcalPerMetabolicKg, exponent } = FEDIAF_ENERGY[profile];
  return kcalPerMetabolicKg * weightKg ** exponent;
}

/** Grams a day of a food with `kcalPerKg` of metabolisable energy, as its bag declares. */
export function dailyFoodGrams(profile: PetProfile, weightKg: number, kcalPerKg: number): number {
  if (!Number.isFinite(kcalPerKg) || kcalPerKg <= 0) return 0;
  return (dailyEnergyKcal(profile, weightKg) / kcalPerKg) * 1000;
}

/** One line of the page's table: a pet's daily ration and what it costs a month. */
export interface FeedingRow {
  profile: PetProfile;
  weightKg: number;
  kcalPerDay: number;
  gramsPerDay: number;
  kgPerMonth: number;
  monthlyFoodCost: number;
}

/**
 * The page's table, built by the calculator: each pet's FEDIAF ration of a food
 * with `kcalPerKg`, in whole grams, priced by calculatePetCost at `pricePerKg`.
 */
export function buildFeedingTable(
  pets: readonly { profile: PetProfile; weightKg: number }[],
  kcalPerKg: number,
  pricePerKg: number,
): FeedingRow[] {
  return pets.map(({ profile, weightKg }) => {
    // Whole grams, as the page shows them and a visitor would type them into
    // the form: priced on 176,7 g, a row read "177 g" and cost 8 centavos less
    // than the form did for 177.
    const gramsPerDay = Math.round(dailyFoodGrams(profile, weightKg, kcalPerKg));
    const { monthlyFoodKg, calculatedFoodMonthly } = calculatePetCost({
      foodPackagePrice: pricePerKg,
      foodPackageWeightKg: 1,
      dailyFoodGrams: gramsPerDay,
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
    return {
      profile,
      weightKg,
      kcalPerDay: dailyEnergyKcal(profile, weightKg),
      gramsPerDay,
      kgPerMonth: monthlyFoodKg,
      monthlyFoodCost: calculatedFoodMonthly,
    };
  });
}
