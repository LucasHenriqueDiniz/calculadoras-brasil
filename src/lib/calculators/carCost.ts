export type FuelType = "gasoline" | "ethanol" | "diesel" | "flex";

/**
 * How far a litre of hydrated ethanol takes a flex car, as a percentage of a
 * litre of gasoline. Measured on Inmetro's PBE Veicular 2026 table (update of
 * 14/08/2026): across its 261 combustion flex rows, ethanol's combined km/l is
 * a median 70,0% of gasoline's, from 66,4% to 72,6%
 * (docs/research/2026-10-18-adsense-added-value/fetches/inmetro-pbev-2026.md).
 * It is the "regra dos 70%", measured rather than repeated.
 */
export const ETHANOL_YIELD_PERCENT = 70;

export interface CarCostInput {
  monthlyKm: number;
  /** km/l on the fuel the car uses; under flex, on gasoline. */
  cityConsumptionKmL: number;
  highwayConsumptionKmL: number;
  /** Under flex, ethanol's km/l as a percentage of gasoline's. */
  ethanolYieldPercent: number;
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

/** The yield typed, or the PBE median when it is missing or out of (0, 100]. */
function ethanolYieldOf(input: CarCostInput): number {
  const typed = safe(input.ethanolYieldPercent);
  return typed > 0 && typed <= 100 ? typed : ETHANOL_YIELD_PERCENT;
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
 *
 * Under flex the consumption is gasoline's, and ethanol's is that times its
 * yield. Both used to run on the same km/l, which made a litre of ethanol go as
 * far as a litre of gasoline: at R$ 6,00 and R$ 4,20, exactly the 70% where
 * the two cost the same, the page called ethanol R$ 137 a month cheaper.
 */
function chooseFuel(input: CarCostInput, monthlyKm: number): FuelChoice {
  const costOf = (pricePerLiter: number, yieldFactor = 1) =>
    fuelCostFor(
      pricePerLiter,
      monthlyKm,
      input.cityConsumptionKmL * yieldFactor,
      input.highwayConsumptionKmL * yieldFactor,
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

  const ethanolYield = ethanolYieldOf(input) / 100;
  const gasolineMonthly = costOf(input.gasolinePrice);
  const ethanolMonthly = costOf(input.ethanolPrice, ethanolYield);
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
  if (input.fuelType === "flex" && ethanolYieldOf(input) !== input.ethanolYieldPercent) {
    warnings.push(
      `Rendimento do etanol inválido; usamos ${ETHANOL_YIELD_PERCENT}% do consumo com gasolina.`,
    );
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

/** One state's line in the page's table: the same car, on each fuel, at that week's prices. */
export interface FuelByStateRow {
  uf: string;
  gasolinePrice: number;
  ethanolPrice: number | null;
  /** Ethanol's price over gasoline's: 0,70 is the default yield's break-even. */
  priceRatio: number | null;
  gasolineMonthly: number;
  ethanolMonthly: number | null;
  /** Null when the survey had no ethanol price for the state that week. */
  cheaper: FuelComparison["cheaper"] | null;
  /** What the cheaper fuel saves a month; zero on a tie. */
  monthlySaving: number;
}

/**
 * The page's table, built by the calculator: `car` under flex at each state's
 * average prices, so every row is what the form shows for those prices.
 */
export function buildFuelByStateTable(
  states: readonly { uf: string; gasoline: number | null; ethanol: number | null }[],
  car: CarCostInput,
): FuelByStateRow[] {
  return states.flatMap(({ uf, gasoline, ethanol }): FuelByStateRow[] => {
    if (gasoline === null) return [];

    const result = calculateCarCost({
      ...car,
      fuelType: "flex",
      gasolinePrice: gasoline,
      ethanolPrice: ethanol ?? 0,
    });
    const comparison = result.fuelComparison!;

    if (ethanol === null) {
      return [
        {
          uf,
          gasolinePrice: gasoline,
          ethanolPrice: null,
          priceRatio: null,
          gasolineMonthly: comparison.gasolineMonthly,
          ethanolMonthly: null,
          cheaper: null,
          monthlySaving: 0,
        },
      ];
    }

    return [
      {
        uf,
        gasolinePrice: gasoline,
        ethanolPrice: ethanol,
        priceRatio: ethanol / gasoline,
        gasolineMonthly: comparison.gasolineMonthly,
        ethanolMonthly: comparison.ethanolMonthly,
        cheaper: comparison.cheaper,
        monthlySaving: comparison.cheaper === "tie" ? 0 : comparison.differenceMonthly,
      },
    ];
  });
}
