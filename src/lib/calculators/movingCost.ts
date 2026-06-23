export interface MovingCostInput {
  truckAndLabor: number;
  packingMaterials: number;
  insurance: number;
  buildingFees: number;
  cleaning: number;
  assembly: number;
  deposit: number;
  firstRent: number;
  utilitySetup: number;
  furniture: number;
  appliances: number;
  other: number;
  contingencyPercent: number;
}

export function calculateMovingCost(input: MovingCostInput) {
  const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
  const logistics =
    safe(input.truckAndLabor) +
    safe(input.packingMaterials) +
    safe(input.insurance) +
    safe(input.buildingFees) +
    safe(input.cleaning) +
    safe(input.assembly);
  const newHome = safe(input.deposit) + safe(input.firstRent) + safe(input.utilitySetup);
  const purchases = safe(input.furniture) + safe(input.appliances) + safe(input.other);
  const subtotal = logistics + newHome + purchases;
  const contingency = (subtotal * Math.min(Math.max(safe(input.contingencyPercent), 0), 100)) / 100;

  return {
    logistics,
    newHome,
    purchases,
    subtotal,
    contingency,
    total: subtotal + contingency,
    breakdown: [
      { key: "logistics", label: "Transporte e operação", monthly: logistics, annual: logistics },
      { key: "new-home", label: "Entrada no imóvel", monthly: newHome, annual: newHome },
      { key: "purchases", label: "Móveis e itens", monthly: purchases, annual: purchases },
      {
        key: "contingency",
        label: "Reserva para imprevistos",
        monthly: contingency,
        annual: contingency,
      },
    ],
  };
}
