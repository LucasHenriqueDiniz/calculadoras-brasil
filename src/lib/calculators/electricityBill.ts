export interface ApplianceInput {
  id: string;
  name: string;
  /** Potência em watts */
  watts: number;
  /** Horas de uso por dia */
  hoursPerDay: number;
  /** Dias de uso por mês */
  daysPerMonth: number;
  /** Quantidade do mesmo aparelho */
  quantity: number;
}

export interface ElectricityInput {
  /** Tarifa em R$ por kWh, já com impostos */
  tariff: number;
  appliances: ApplianceInput[];
}

export interface ApplianceResult {
  id: string;
  name: string;
  kwhPerMonth: number;
  costPerMonth: number;
  costPerYear: number;
  sharePercent: number;
}

export interface ElectricityResult {
  totalKwhPerMonth: number;
  totalCostPerMonth: number;
  totalCostPerYear: number;
  appliances: ApplianceResult[];
  topAppliance: ApplianceResult | null;
  highlights: string[];
  warnings: string[];
}

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function calculateApplianceConsumption(a: ApplianceInput): {
  kwhPerMonth: number;
} {
  const watts = safe(a.watts);
  const hours = Math.min(24, safe(a.hoursPerDay));
  const days = Math.min(31, safe(a.daysPerMonth));
  const qty = Math.max(1, Math.floor(safe(a.quantity) || 1));
  const kwhPerMonth = (watts * hours * days * qty) / 1000;
  return { kwhPerMonth };
}

export function calculateElectricityBill(input: ElectricityInput): ElectricityResult {
  const warnings: string[] = [];
  const highlights: string[] = [];
  const tariff = safe(input.tariff);

  const items = (input.appliances ?? []).map((a) => {
    const { kwhPerMonth } = calculateApplianceConsumption(a);
    const costPerMonth = kwhPerMonth * tariff;
    return {
      id: a.id,
      name: a.name?.trim() || "Aparelho sem nome",
      kwhPerMonth,
      costPerMonth,
      costPerYear: costPerMonth * 12,
      sharePercent: 0,
    } as ApplianceResult;
  });

  const totalKwhPerMonth = items.reduce((s, i) => s + i.kwhPerMonth, 0);
  const totalCostPerMonth = items.reduce((s, i) => s + i.costPerMonth, 0);
  const totalCostPerYear = totalCostPerMonth * 12;

  items.forEach((i) => {
    i.sharePercent = totalKwhPerMonth > 0 ? (i.kwhPerMonth / totalKwhPerMonth) * 100 : 0;
  });

  const sorted = [...items].sort((a, b) => b.kwhPerMonth - a.kwhPerMonth);
  const topAppliance = sorted[0] && sorted[0].kwhPerMonth > 0 ? sorted[0] : null;

  if (tariff <= 0) {
    warnings.push(
      "Tarifa de energia não informada. Consulte sua conta de luz para preencher o valor real em R$/kWh.",
    );
  } else if (tariff < 0.4 || tariff > 1.6) {
    warnings.push(
      "A tarifa informada está fora da faixa comum no Brasil (R$ 0,40 a R$ 1,60 por kWh). Confira sua conta.",
    );
  }
  if (items.length === 0) {
    warnings.push("Adicione pelo menos um aparelho para ver o resultado.");
  }
  if (totalKwhPerMonth > 0) {
    highlights.push(
      `Consumo total estimado de ${totalKwhPerMonth.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kWh por mês.`,
    );
  }
  if (topAppliance) {
    highlights.push(
      `${topAppliance.name} é o aparelho que mais pesa, com ${topAppliance.sharePercent.toFixed(1).replace(".", ",")}% do consumo.`,
    );
  }
  warnings.push(
    "Os valores são estimativas educativas. O consumo real varia conforme modelo, eficiência, idade do aparelho e hábitos de uso.",
  );

  return {
    totalKwhPerMonth,
    totalCostPerMonth,
    totalCostPerYear,
    appliances: items,
    topAppliance,
    highlights,
    warnings,
  };
}

/** Catálogo de aparelhos comuns com potência média em watts. */
export const APPLIANCE_PRESETS: {
  name: string;
  watts: number;
  hoursPerDay: number;
  daysPerMonth: number;
}[] = [
  { name: "Geladeira", watts: 130, hoursPerDay: 24, daysPerMonth: 30 },
  { name: "Freezer", watts: 150, hoursPerDay: 24, daysPerMonth: 30 },
  { name: "Chuveiro elétrico", watts: 5500, hoursPerDay: 0.25, daysPerMonth: 30 },
  { name: "Ar-condicionado 9.000 BTUs", watts: 900, hoursPerDay: 8, daysPerMonth: 30 },
  { name: "Ar-condicionado 12.000 BTUs", watts: 1200, hoursPerDay: 8, daysPerMonth: 30 },
  { name: "Ventilador", watts: 100, hoursPerDay: 6, daysPerMonth: 30 },
  { name: "Máquina de lavar", watts: 500, hoursPerDay: 1, daysPerMonth: 12 },
  { name: "Secadora", watts: 2500, hoursPerDay: 1, daysPerMonth: 8 },
  { name: "Ferro de passar", watts: 1000, hoursPerDay: 0.5, daysPerMonth: 8 },
  { name: "Micro-ondas", watts: 1300, hoursPerDay: 0.3, daysPerMonth: 30 },
  { name: "Forno elétrico", watts: 1500, hoursPerDay: 0.5, daysPerMonth: 15 },
  { name: 'TV LED 50"', watts: 100, hoursPerDay: 5, daysPerMonth: 30 },
  { name: "Computador desktop", watts: 250, hoursPerDay: 6, daysPerMonth: 22 },
  { name: "Notebook", watts: 65, hoursPerDay: 6, daysPerMonth: 22 },
  { name: "Roteador Wi-Fi", watts: 10, hoursPerDay: 24, daysPerMonth: 30 },
  { name: "Lâmpada LED", watts: 10, hoursPerDay: 5, daysPerMonth: 30 },
  { name: "Aspirador de pó", watts: 1400, hoursPerDay: 0.2, daysPerMonth: 8 },
  { name: "Cafeteira", watts: 800, hoursPerDay: 0.2, daysPerMonth: 30 },
  { name: "Chapinha / secador", watts: 1800, hoursPerDay: 0.1, daysPerMonth: 20 },
];
