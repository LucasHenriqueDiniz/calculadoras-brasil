import { describe, expect, it } from "vitest";
import {
  ANTT_GENERAL_CARGO,
  buildFreightFloorTable,
  minimumFreight,
} from "../../src/lib/calculators/antt-freight-floor";
import { calculateMovingCost, type MovingCostInput } from "../../src/lib/calculators/movingCost";

/** The page's example move. */
const MOVE: MovingCostInput = {
  truckAndLabor: 1800,
  packingMaterials: 300,
  insurance: 100,
  buildingFees: 0,
  cleaning: 250,
  assembly: 400,
  deposit: 3000,
  firstRent: 1500,
  utilitySetup: 200,
  furniture: 2000,
  appliances: 1000,
  other: 300,
  contingencyPercent: 10,
  distanceKm: 0,
  truckAxles: 2,
};

describe("calculateMovingCost — the reserve and the deposit", () => {
  /**
   * By hand: 2.850 of logistics, 4.700 for the new home and 3.300 of purchases
   * make 10.850. The reserve takes 10% of 10.850 − 3.000 − 1.500 = 635, not
   * 1.085, so the total is 11.485, and 8.485 of it does not come back.
   */
  it("keeps the deposit and the first rent out of the reserve", () => {
    const result = calculateMovingCost(MOVE);

    expect(result.subtotal).toBe(10_850);
    expect(result.contingency).toBe(635);
    expect(result.total).toBe(11_485);
  });

  it("separates the deposit that comes back from what the move costs", () => {
    const result = calculateMovingCost(MOVE);

    expect(result.refundableDeposit).toBe(3_000);
    expect(result.nonRefundableTotal).toBe(8_485);
  });

  it("shows no freight floor without a distance", () => {
    expect(calculateMovingCost(MOVE).freightFloor).toBe(0);
  });

  it("shows the ANTT floor for the trip when there is one", () => {
    const result = calculateMovingCost({ ...MOVE, distanceKm: 500, truckAxles: 3 });
    expect(result.freightFloor).toBe(minimumFreight(500, 3));
  });
});

describe("minimumFreight — Portaria SUROC 22/2026, Tabela A, Carga Geral", () => {
  it("keeps the coefficients as the portaria prints them", () => {
    expect(ANTT_GENERAL_CARGO[2]).toEqual({ perKm: 4.0738, loading: 451.84 });
    expect(ANTT_GENERAL_CARGO[3]).toEqual({ perKm: 5.2177, loading: 541.86 });
    expect(ANTT_GENERAL_CARGO[9]).toEqual({ perKm: 9.4114, loading: 903.32 });
  });

  /** By hand: 500 × 5,2177 + 541,86 = 2.608,85 + 541,86 = 3.150,71. */
  it("prices 500 km on three axles by hand", () => {
    expect(minimumFreight(500, 3)).toBe(3150.71);
  });

  /** By hand: 1.000 × 4,0738 + 451,84 = 4.525,64. */
  it("prices 1.000 km on two axles by hand", () => {
    expect(minimumFreight(1000, 2)).toBe(4525.64);
  });

  it("is zero for no trip", () => {
    expect(minimumFreight(0, 2)).toBe(0);
    expect(minimumFreight(-10, 3)).toBe(0);
  });
});

describe("buildFreightFloorTable", () => {
  const TABLE = buildFreightFloorTable([100, 500, 3000], [2, 3]);

  it("is minimumFreight in every cell", () => {
    for (const row of TABLE) {
      for (const cell of row.floors) {
        expect(cell.floor).toBe(minimumFreight(row.distanceKm, cell.axles));
      }
    }
  });

  it("falls per km as the trip grows, because loading is paid once", () => {
    const perKm = TABLE.map((row) => row.floors[0].perKm);
    expect(perKm[0]).toBeGreaterThan(perKm[1]);
    expect(perKm[1]).toBeGreaterThan(perKm[2]);
  });
});
