export type DataFreshness = "fresh" | "stale" | "unavailable" | "manual";

export interface PublicDataUnavailable {
  available: false;
  source?: string;
  lastUpdated?: string | null;
  isStale?: boolean;
  notes?: string;
  error?: string;
}

export interface FuelPriceData {
  available: true;
  uf: string;
  fuel: string;
  averagePrice: number;
  minPrice?: number;
  maxPrice?: number;
  sampleSize?: number;
  period?: string;
  source: "ANP";
  lastUpdated: string;
  isStale: boolean;
}

export interface EnergyTariffData {
  available: true;
  uf: string;
  distributor: string;
  tariffKwh: number;
  tusd?: number;
  te?: number;
  taxesIncluded: boolean;
  source: "ANEEL";
  lastUpdated: string;
  isStale: boolean;
  notes?: string;
}

export type PublicDataResult<T> = T | PublicDataUnavailable;
