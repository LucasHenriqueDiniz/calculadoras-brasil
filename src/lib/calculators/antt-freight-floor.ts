/**
 * The ANTT's minimum freight for road cargo (Política Nacional de Pisos
 * Mínimos, Lei 13.703/2018), for general cargo carried by a whole truck: what a
 * removal van's trip may not be contracted below.
 *
 * Resolução ANTT 5.867/2020, art. 5º, § 1º (as worded by Resolução 6.076/2026):
 * floor = distance × CCD + CC, with the coefficients of Tabela A of Anexo II.
 * It applies only to "carga lotação": one contract, one shipper, the vehicle in
 * exclusive use (art. 2º and art. 4º, § 1º), which is what hiring a truck for a
 * move is. The empty return is owed only for containers and dedicated fleets
 * (art. 3º, § 4º), so it is left out.
 *
 * Coefficients: Portaria SUROC nº 22, de 28 de setembro de 2026, Anexo, Tabela
 * A, "Carga Geral", in force from 30/09/2026 with diesel at R$ 7,33
 * (docs/research/2026-10-18-adsense-added-value/fetches/antt-piso-minimo-frete-2026-09.md).
 * The floors are binding: paying less owes the carrier twice the difference
 * (Lei 13.703/2018, art. 5º, § 4º). The ANTT must publish new ones whenever
 * diesel moves more than 5% (§ 3º); the twice-yearly schedule of § 1º was
 * revoked by Lei 15.485/2026.
 */

import { roundToCentavos } from "./money";

export type TruckAxles = 2 | 3 | 4 | 5 | 6 | 7 | 9;

/** Tabela A, Carga Geral: displacement cost per km (CCD) and loading cost (CC). */
export const ANTT_GENERAL_CARGO: Record<TruckAxles, { perKm: number; loading: number }> = {
  2: { perKm: 4.0738, loading: 451.84 },
  3: { perKm: 5.2177, loading: 541.86 },
  4: { perKm: 5.918, loading: 588.86 },
  5: { perKm: 6.8284, loading: 657.56 },
  6: { perKm: 7.5347, loading: 671.93 },
  7: { perKm: 8.2727, loading: 831.66 },
  9: { perKm: 9.4114, loading: 903.32 },
};

export const ANTT_COEFFICIENTS_IN_FORCE_FROM = "2026-09-30";

/** The minimum freight, to the centavo, for `distanceKm` on a truck of `axles` loaded axles. */
export function minimumFreight(distanceKm: number, axles: TruckAxles): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  const { perKm, loading } = ANTT_GENERAL_CARGO[axles];
  return roundToCentavos(distanceKm * perKm + loading);
}

/** One line of the page's table: the floor at one distance, for each truck size shown. */
export interface FreightFloorRow {
  distanceKm: number;
  floors: { axles: TruckAxles; floor: number; perKm: number }[];
}

export function buildFreightFloorTable(
  distances: readonly number[],
  axles: readonly TruckAxles[],
): FreightFloorRow[] {
  return distances.map((distanceKm) => ({
    distanceKm,
    floors: axles.map((count) => {
      const floor = minimumFreight(distanceKm, count);
      return { axles: count, floor, perKm: floor / distanceKm };
    }),
  }));
}
