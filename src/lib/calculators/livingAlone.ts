export interface LivingAloneInput {
  rent: number;
  condoFee: number;
  iptuMonthly: number;
  electricity: number;
  water: number;
  gas: number;
  internet: number;
  phone: number;
  groceries: number;
  deliveryAndRestaurants: number;
  transportation: number;
  cleaningAndHygiene: number;
  laundry: number;
  furnitureInstallments: number;
  subscriptions: number;
  healthAndMedicine: number;
  leisure: number;
  emergencyReserve: number;
  otherCosts: number;
  netIncome: number;
}

export type FinancialStatus = "comfortable" | "attention" | "tight" | "critical" | "unknown";

export interface LivingAloneBreakdownItem {
  key: string;
  label: string;
  monthly: number;
  annual: number;
  category: "moradia" | "contas" | "alimentacao" | "rotina" | "estrutura" | "reserva";
}

export interface LivingAloneResult {
  monthlyTotal: number;
  annualTotal: number;
  housingTotal: number;
  billsTotal: number;
  foodTotal: number;
  routineTotal: number;
  structureTotal: number;
  reserveTotal: number;
  incomePercentage: number | null;
  remainingIncome: number | null;
  financialStatus: FinancialStatus;
  financialStatusLabel: string;
  breakdown: LivingAloneBreakdownItem[];
  highlights: string[];
  warnings: string[];
}

export const FINANCIAL_STATUS_LABEL: Record<FinancialStatus, string> = {
  comfortable: "Confortável",
  attention: "Atenção",
  tight: "Apertado",
  critical: "Muito apertado",
  unknown: "Renda não informada",
};

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fmtBRL(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function calculateLivingAloneCost(input: LivingAloneInput): LivingAloneResult {
  const warnings: string[] = [];
  const highlights: string[] = [];

  const rent = safe(input.rent);
  const condoFee = safe(input.condoFee);
  const iptuMonthly = safe(input.iptuMonthly);
  const electricity = safe(input.electricity);
  const water = safe(input.water);
  const gas = safe(input.gas);
  const internet = safe(input.internet);
  const phone = safe(input.phone);
  const groceries = safe(input.groceries);
  const deliveryAndRestaurants = safe(input.deliveryAndRestaurants);
  const transportation = safe(input.transportation);
  const cleaningAndHygiene = safe(input.cleaningAndHygiene);
  const laundry = safe(input.laundry);
  const furnitureInstallments = safe(input.furnitureInstallments);
  const subscriptions = safe(input.subscriptions);
  const healthAndMedicine = safe(input.healthAndMedicine);
  const leisure = safe(input.leisure);
  const emergencyReserve = safe(input.emergencyReserve);
  const otherCosts = safe(input.otherCosts);
  const netIncome = safe(input.netIncome);

  const housingTotal = rent + condoFee + iptuMonthly;
  const billsTotal = electricity + water + gas + internet + phone;
  const foodTotal = groceries + deliveryAndRestaurants;
  const routineTotal =
    transportation +
    cleaningAndHygiene +
    laundry +
    subscriptions +
    healthAndMedicine +
    leisure +
    otherCosts;
  const structureTotal = furnitureInstallments;
  const reserveTotal = emergencyReserve;

  const monthlyTotal =
    housingTotal + billsTotal + foodTotal + routineTotal + structureTotal + reserveTotal;
  const annualTotal = monthlyTotal * 12;

  const hasIncome = netIncome > 0;
  const incomePercentage = hasIncome ? (monthlyTotal / netIncome) * 100 : null;
  const remainingIncome = hasIncome ? netIncome - monthlyTotal : null;

  let financialStatus: FinancialStatus = "unknown";
  if (!hasIncome) {
    financialStatus = "unknown";
  } else if (remainingIncome !== null && remainingIncome < 0) {
    financialStatus = "critical";
  } else if (incomePercentage !== null) {
    if (incomePercentage <= 50) financialStatus = "comfortable";
    else if (incomePercentage <= 70) financialStatus = "attention";
    else if (incomePercentage <= 90) financialStatus = "tight";
    else financialStatus = "critical";
  }

  const breakdown: LivingAloneBreakdownItem[] = [
    {
      key: "housing",
      label: "Moradia",
      monthly: housingTotal,
      annual: housingTotal * 12,
      category: "moradia",
    },
    {
      key: "bills",
      label: "Contas básicas",
      monthly: billsTotal,
      annual: billsTotal * 12,
      category: "contas",
    },
    {
      key: "food",
      label: "Alimentação",
      monthly: foodTotal,
      annual: foodTotal * 12,
      category: "alimentacao",
    },
    {
      key: "routine",
      label: "Rotina",
      monthly: routineTotal,
      annual: routineTotal * 12,
      category: "rotina",
    },
    {
      key: "structure",
      label: "Estrutura",
      monthly: structureTotal,
      annual: structureTotal * 12,
      category: "estrutura",
    },
    {
      key: "reserve",
      label: "Reserva",
      monthly: reserveTotal,
      annual: reserveTotal * 12,
      category: "reserva",
    },
  ];

  const sorted = [...breakdown].sort((a, b) => b.monthly - a.monthly);
  if (sorted[0] && sorted[0].monthly > 0) {
    highlights.push(`${sorted[0].label} é a maior categoria do seu orçamento.`);
  }
  if (incomePercentage !== null) {
    highlights.push(
      `Seu custo mensal estimado representa ${incomePercentage.toFixed(1).replace(".", ",")}% da renda líquida informada.`,
    );
  }
  if (remainingIncome !== null) {
    highlights.push(`Sua sobra mensal estimada é de ${fmtBRL(remainingIncome)}.`);
  }
  if (foodTotal > 0) {
    highlights.push(`Alimentação e delivery somam ${fmtBRL(foodTotal)} por mês.`);
  }
  if (reserveTotal > 0) {
    highlights.push("Reserva de emergência não é gasto imediato, mas ajuda no planejamento.");
  }

  if (!hasIncome) {
    warnings.push("Renda líquida não informada; a análise de percentual da renda foi ocultada.");
  }
  if (iptuMonthly > 0) {
    warnings.push("Se o IPTU for anual, divida por 12 antes de preencher.");
  }
  warnings.push(
    "Valores padrão são apenas exemplos. Use seus gastos reais para uma estimativa melhor.",
  );
  if (remainingIncome !== null && remainingIncome < 0) {
    warnings.push("A sobra mensal ficou negativa neste cenário.");
  }

  return {
    monthlyTotal,
    annualTotal,
    housingTotal,
    billsTotal,
    foodTotal,
    routineTotal,
    structureTotal,
    reserveTotal,
    incomePercentage,
    remainingIncome,
    financialStatus,
    financialStatusLabel: FINANCIAL_STATUS_LABEL[financialStatus],
    breakdown,
    highlights,
    warnings,
  };
}
