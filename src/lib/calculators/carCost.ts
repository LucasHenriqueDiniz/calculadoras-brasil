export type FuelType = "gasoline" | "ethanol" | "diesel" | "flex";

export interface CarCostInput {
  monthlyKm: number;
  cityConsumptionKmL: number;
  highwayConsumptionKmL: number;
  cityUsePercent: number;
  gasolinePrice: number;
  ethanolPrice: number;
  dieselPrice: number;
  fuelType: FuelType;
  carValue: number;
  ipvaAnnual: number;
  insuranceAnnual: number;
  licensingAnnual: number;
  maintenanceMonthly: number;
  tiresAnnual: number;
  parkingMonthly: number;
  tollsMonthly: number;
  washingMonthly: number;
  finesAndOthersMonthly: number;
  depreciationAnnualPercent: number;
}

export interface BreakdownItem {
  key: string;
  label: string;
  monthly: number;
  annual: number;
  category: "fixo" | "variavel" | "depreciacao";
}

export interface FuelComparison {
  gasolineMonthly: number;
  ethanolMonthly: number;
  cheaper: "gasoline" | "ethanol" | "tie";
  differenceMonthly: number;
}

export interface CarCostResult {
  monthlyTotal: number;
  annualTotal: number;
  costPerKm: number | null;
  monthlyFuelCost: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  monthlyDepreciation: number;
  selectedFuelLabel: string;
  recommendedFuel?: string;
  fuelComparison?: FuelComparison;
  breakdown: BreakdownItem[];
  highlights: string[];
  warnings: string[];
}

const FUEL_LABEL: Record<FuelType, string> = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  diesel: "Diesel",
  flex: "Flex (automático)",
};

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fuelCostFor(
  pricePerLiter: number,
  monthlyKm: number,
  cityKmL: number,
  highwayKmL: number,
  cityUsePercent: number,
): { monthly: number; averageConsumption: number; liters: number } {
  const cityUse = Math.min(Math.max(cityUsePercent, 0), 100) / 100;
  const highwayUse = 1 - cityUse;
  const cKm = safe(cityKmL);
  const hKm = safe(highwayKmL);
  if (cKm === 0 && hKm === 0) {
    return { monthly: 0, averageConsumption: 0, liters: 0 };
  }
  const denom =
    (cityUse / (cKm || 1)) * (cKm > 0 ? 1 : 0) + (highwayUse / (hKm || 1)) * (hKm > 0 ? 1 : 0);
  const averageConsumption = denom > 0 ? 1 / denom : 0;
  const liters = averageConsumption > 0 ? safe(monthlyKm) / averageConsumption : 0;
  const monthly = liters * safe(pricePerLiter);
  return { monthly, averageConsumption, liters };
}

interface FuelChoice {
  monthlyFuelCost: number;
  selectedFuelLabel: string;
  recommendedFuel?: string;
  fuelComparison?: FuelComparison;
}

/**
 * Picks the fuel the driver actually pays for, and — under flex — the cheaper of
 * the two, which is the only branch that produces a comparison.
 */
function chooseFuel(input: CarCostInput, monthlyKm: number): FuelChoice {
  const costOf = (pricePerLiter: number) =>
    fuelCostFor(
      pricePerLiter,
      monthlyKm,
      input.cityConsumptionKmL,
      input.highwayConsumptionKmL,
      input.cityUsePercent,
    ).monthly;

  if (input.fuelType === "gasoline") {
    return { monthlyFuelCost: costOf(input.gasolinePrice), selectedFuelLabel: FUEL_LABEL.gasoline };
  }
  if (input.fuelType === "ethanol") {
    return { monthlyFuelCost: costOf(input.ethanolPrice), selectedFuelLabel: FUEL_LABEL.ethanol };
  }
  if (input.fuelType === "diesel") {
    return { monthlyFuelCost: costOf(input.dieselPrice), selectedFuelLabel: FUEL_LABEL.diesel };
  }

  const gasolineMonthly = costOf(input.gasolinePrice);
  const ethanolMonthly = costOf(input.ethanolPrice);
  const cheaper: FuelComparison["cheaper"] =
    Math.abs(gasolineMonthly - ethanolMonthly) < 0.01
      ? "tie"
      : gasolineMonthly < ethanolMonthly
        ? "gasoline"
        : "ethanol";

  const fuelComparison: FuelComparison = {
    gasolineMonthly,
    ethanolMonthly,
    cheaper,
    differenceMonthly: Math.abs(gasolineMonthly - ethanolMonthly),
  };

  const recommendedFuel =
    cheaper === "ethanol"
      ? "Etanol"
      : cheaper === "tie"
        ? "Empate (gasolina ou etanol)"
        : "Gasolina";

  return {
    monthlyFuelCost: cheaper === "ethanol" ? ethanolMonthly : gasolineMonthly,
    selectedFuelLabel: `Flex — ${recommendedFuel}`,
    recommendedFuel,
    fuelComparison,
  };
}

interface MonthlyCosts {
  ipva: number;
  insurance: number;
  licensing: number;
  tires: number;
  parking: number;
  tolls: number;
  washing: number;
  maintenance: number;
  finesAndOthers: number;
  depreciation: number;
}

/** Every non-fuel cost, normalised to a month and floored at zero. */
function monthlyCostsOf(input: CarCostInput): MonthlyCosts {
  return {
    ipva: safe(input.ipvaAnnual) / 12,
    insurance: safe(input.insuranceAnnual) / 12,
    licensing: safe(input.licensingAnnual) / 12,
    tires: safe(input.tiresAnnual) / 12,
    parking: safe(input.parkingMonthly),
    tolls: safe(input.tollsMonthly),
    washing: safe(input.washingMonthly),
    maintenance: safe(input.maintenanceMonthly),
    finesAndOthers: safe(input.finesAndOthersMonthly),
    depreciation:
      (safe(input.carValue) * Math.min(Math.max(input.depreciationAnnualPercent, 0), 100)) /
      100 /
      12,
  };
}

function buildBreakdown(costs: MonthlyCosts, monthlyFuelCost: number): BreakdownItem[] {
  const rows: ReadonlyArray<[string, string, number, BreakdownItem["category"]]> = [
    ["fuel", "Combustível", monthlyFuelCost, "variavel"],
    ["ipva", "IPVA", costs.ipva, "fixo"],
    ["insurance", "Seguro", costs.insurance, "fixo"],
    ["licensing", "Licenciamento", costs.licensing, "fixo"],
    ["maintenance", "Manutenção", costs.maintenance, "variavel"],
    ["tires", "Pneus", costs.tires, "variavel"],
    ["parking", "Estacionamento", costs.parking, "fixo"],
    ["tolls", "Pedágios", costs.tolls, "variavel"],
    ["washing", "Lavagem", costs.washing, "variavel"],
    ["depreciation", "Depreciação", costs.depreciation, "depreciacao"],
    ["fines", "Multas e outros", costs.finesAndOthers, "variavel"],
  ];

  return rows.map(([key, label, monthly, category]) => ({
    key,
    label,
    monthly,
    annual: monthly * 12,
    category,
  }));
}

function buildHighlights(
  breakdown: BreakdownItem[],
  monthlyTotal: number,
  depreciationMonthly: number,
  costPerKm: number | null,
  fuelComparison: FuelComparison | undefined,
): string[] {
  const highlights: string[] = [];

  const sorted = [...breakdown].sort((a, b) => b.monthly - a.monthly);
  if (sorted[0] && sorted[0].monthly > 0) {
    highlights.push(`${sorted[0].label} é o maior custo mensal estimado.`);
  }
  if (depreciationMonthly > 0 && monthlyTotal > 0 && depreciationMonthly / monthlyTotal > 0.15) {
    highlights.push("A depreciação representa uma parte relevante do custo real do carro.");
  }
  if (costPerKm !== null) {
    const formatted = costPerKm.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
    highlights.push(`Seu custo aproximado por km é ${formatted}.`);
  }
  if (fuelComparison) {
    if (fuelComparison.cheaper === "tie") {
      highlights.push("No modo flex, gasolina e etanol custam praticamente o mesmo neste cenário.");
    } else {
      const name = fuelComparison.cheaper === "gasoline" ? "gasolina" : "etanol";
      highlights.push(`No modo flex, o combustível mais barato neste cenário é ${name}.`);
    }
  }

  return highlights;
}

function collectWarnings(input: CarCostInput, monthlyKm: number): string[] {
  const warnings: string[] = [];

  if (monthlyKm === 0) {
    warnings.push("Informe quilômetros por mês para calcular o custo por km.");
  }
  if (safe(input.cityConsumptionKmL) === 0 || safe(input.highwayConsumptionKmL) === 0) {
    warnings.push("Consumo informado inválido; ajuste os valores de km/l.");
  }
  warnings.push(
    "Valores padrão são apenas exemplos. Use seus custos reais para uma estimativa melhor.",
  );

  return warnings;
}

export function calculateCarCost(input: CarCostInput): CarCostResult {
  const monthlyKm = safe(input.monthlyKm);
  const fuel = chooseFuel(input, monthlyKm);
  const costs = monthlyCostsOf(input);

  const monthlyFixedCost = costs.ipva + costs.insurance + costs.licensing + costs.parking;
  const monthlyVariableCost =
    fuel.monthlyFuelCost +
    costs.maintenance +
    costs.tires +
    costs.tolls +
    costs.washing +
    costs.finesAndOthers;

  const monthlyTotal = monthlyFixedCost + monthlyVariableCost + costs.depreciation;
  const costPerKm = monthlyKm > 0 ? monthlyTotal / monthlyKm : null;
  const breakdown = buildBreakdown(costs, fuel.monthlyFuelCost);

  return {
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    costPerKm,
    monthlyFuelCost: fuel.monthlyFuelCost,
    monthlyFixedCost,
    monthlyVariableCost,
    monthlyDepreciation: costs.depreciation,
    selectedFuelLabel: fuel.selectedFuelLabel,
    recommendedFuel: fuel.recommendedFuel,
    fuelComparison: fuel.fuelComparison,
    breakdown,
    highlights: buildHighlights(
      breakdown,
      monthlyTotal,
      costs.depreciation,
      costPerKm,
      fuel.fuelComparison,
    ),
    warnings: collectWarnings(input, monthlyKm),
  };
}
