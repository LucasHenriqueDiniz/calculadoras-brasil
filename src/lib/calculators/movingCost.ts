import { minimumFreight, type TruckAxles } from "./antt-freight-floor";

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
  /** For a move between cities: the distance, to show the ANTT freight floor. Zero for none. */
  distanceKm: number;
  truckAxles: TruckAxles;
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

  // The deposit and the first rent are set by the lease, so a margin for the
  // unforeseen has nothing to absorb there. It used to apply to them too: at
  // the defaults, R$ 450 of the R$ 1.085 reserve was 10% of the contract.
  const contractAmounts = safe(input.deposit) + safe(input.firstRent);
  const contingency =
    ((subtotal - contractAmounts) * Math.min(Math.max(safe(input.contingencyPercent), 0), 100)) /
    100;
  const total = subtotal + contingency;

  // Lei 8.245/1991, art. 38, § 2º: a cash deposit goes into a savings account
  // and returns to the tenant with its yield. Cash needed, not a cost.
  const refundableDeposit = safe(input.deposit);

  return {
    logistics,
    newHome,
    purchases,
    subtotal,
    contingency,
    total,
    refundableDeposit,
    /** What the move costs for good: the total less the deposit that comes back. */
    nonRefundableTotal: total - refundableDeposit,
    /** The ANTT floor for the trip, a reference for the freight quote; zero without a distance. */
    freightFloor: minimumFreight(safe(input.distanceKm), input.truckAxles),
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
