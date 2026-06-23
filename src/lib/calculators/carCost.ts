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

export function calculateCarCost(input: CarCostInput): CarCostResult {
  const warnings: string[] = [];
  const highlights: string[] = [];

  const monthlyKm = safe(input.monthlyKm);
  if (monthlyKm === 0) {
    warnings.push("Informe quilômetros por mês para calcular o custo por km.");
  }
  if (safe(input.cityConsumptionKmL) === 0 || safe(input.highwayConsumptionKmL) === 0) {
    warnings.push("Consumo informado inválido; ajuste os valores de km/l.");
  }

  // Fuel selection
  let selectedPrice = 0;
  let selectedFuelLabel = FUEL_LABEL[input.fuelType];
  let recommendedFuel: string | undefined;
  let fuelComparison: FuelComparison | undefined;

  const gasolineCalc = fuelCostFor(
    input.gasolinePrice,
    monthlyKm,
    input.cityConsumptionKmL,
    input.highwayConsumptionKmL,
    input.cityUsePercent,
  );
  const ethanolCalc = fuelCostFor(
    input.ethanolPrice,
    monthlyKm,
    input.cityConsumptionKmL,
    input.highwayConsumptionKmL,
    input.cityUsePercent,
  );
  const dieselCalc = fuelCostFor(
    input.dieselPrice,
    monthlyKm,
    input.cityConsumptionKmL,
    input.highwayConsumptionKmL,
    input.cityUsePercent,
  );

  let monthlyFuelCost = 0;
  if (input.fuelType === "gasoline") {
    monthlyFuelCost = gasolineCalc.monthly;
    selectedPrice = input.gasolinePrice;
  } else if (input.fuelType === "ethanol") {
    monthlyFuelCost = ethanolCalc.monthly;
    selectedPrice = input.ethanolPrice;
  } else if (input.fuelType === "diesel") {
    monthlyFuelCost = dieselCalc.monthly;
    selectedPrice = input.dieselPrice;
  } else {
    // flex — compare gasoline vs ethanol
    const cheaper: "gasoline" | "ethanol" | "tie" =
      Math.abs(gasolineCalc.monthly - ethanolCalc.monthly) < 0.01
        ? "tie"
        : gasolineCalc.monthly < ethanolCalc.monthly
          ? "gasoline"
          : "ethanol";
    fuelComparison = {
      gasolineMonthly: gasolineCalc.monthly,
      ethanolMonthly: ethanolCalc.monthly,
      cheaper,
      differenceMonthly: Math.abs(gasolineCalc.monthly - ethanolCalc.monthly),
    };
    if (cheaper === "ethanol") {
      monthlyFuelCost = ethanolCalc.monthly;
      recommendedFuel = "Etanol";
      selectedPrice = input.ethanolPrice;
    } else {
      monthlyFuelCost = gasolineCalc.monthly;
      recommendedFuel = cheaper === "tie" ? "Empate (gasolina ou etanol)" : "Gasolina";
      selectedPrice = input.gasolinePrice;
    }
    selectedFuelLabel = `Flex — ${recommendedFuel}`;
  }
  void selectedPrice;

  // Fixed costs
  const ipvaMonthly = safe(input.ipvaAnnual) / 12;
  const insuranceMonthly = safe(input.insuranceAnnual) / 12;
  const licensingMonthly = safe(input.licensingAnnual) / 12;
  const tiresMonthly = safe(input.tiresAnnual) / 12;
  const parkingMonthly = safe(input.parkingMonthly);
  const tollsMonthly = safe(input.tollsMonthly);
  const washingMonthly = safe(input.washingMonthly);
  const maintenanceMonthly = safe(input.maintenanceMonthly);
  const finesAndOthersMonthly = safe(input.finesAndOthersMonthly);

  const depreciationMonthly =
    (safe(input.carValue) * Math.min(Math.max(input.depreciationAnnualPercent, 0), 100)) / 100 / 12;

  const monthlyFixedCost = ipvaMonthly + insuranceMonthly + licensingMonthly + parkingMonthly;
  const monthlyVariableCost =
    monthlyFuelCost +
    maintenanceMonthly +
    tiresMonthly +
    tollsMonthly +
    washingMonthly +
    finesAndOthersMonthly;

  const monthlyTotal = monthlyFixedCost + monthlyVariableCost + depreciationMonthly;
  const annualTotal = monthlyTotal * 12;
  const costPerKm = monthlyKm > 0 ? monthlyTotal / monthlyKm : null;

  const breakdown: BreakdownItem[] = [
    {
      key: "fuel",
      label: "Combustível",
      monthly: monthlyFuelCost,
      annual: monthlyFuelCost * 12,
      category: "variavel",
    },
    {
      key: "ipva",
      label: "IPVA",
      monthly: ipvaMonthly,
      annual: ipvaMonthly * 12,
      category: "fixo",
    },
    {
      key: "insurance",
      label: "Seguro",
      monthly: insuranceMonthly,
      annual: insuranceMonthly * 12,
      category: "fixo",
    },
    {
      key: "licensing",
      label: "Licenciamento",
      monthly: licensingMonthly,
      annual: licensingMonthly * 12,
      category: "fixo",
    },
    {
      key: "maintenance",
      label: "Manutenção",
      monthly: maintenanceMonthly,
      annual: maintenanceMonthly * 12,
      category: "variavel",
    },
    {
      key: "tires",
      label: "Pneus",
      monthly: tiresMonthly,
      annual: tiresMonthly * 12,
      category: "variavel",
    },
    {
      key: "parking",
      label: "Estacionamento",
      monthly: parkingMonthly,
      annual: parkingMonthly * 12,
      category: "fixo",
    },
    {
      key: "tolls",
      label: "Pedágios",
      monthly: tollsMonthly,
      annual: tollsMonthly * 12,
      category: "variavel",
    },
    {
      key: "washing",
      label: "Lavagem",
      monthly: washingMonthly,
      annual: washingMonthly * 12,
      category: "variavel",
    },
    {
      key: "depreciation",
      label: "Depreciação",
      monthly: depreciationMonthly,
      annual: depreciationMonthly * 12,
      category: "depreciacao",
    },
    {
      key: "fines",
      label: "Multas e outros",
      monthly: finesAndOthersMonthly,
      annual: finesAndOthersMonthly * 12,
      category: "variavel",
    },
  ];

  // Highlights
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

  warnings.push(
    "Valores padrão são apenas exemplos. Use seus custos reais para uma estimativa melhor.",
  );

  return {
    monthlyTotal,
    annualTotal,
    costPerKm,
    monthlyFuelCost,
    monthlyFixedCost,
    monthlyVariableCost,
    monthlyDepreciation: depreciationMonthly,
    selectedFuelLabel,
    recommendedFuel,
    fuelComparison,
    breakdown,
    highlights,
    warnings,
  };
}
