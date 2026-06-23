import type { EnergyTariffData, FuelPriceData, PublicDataResult } from "./types";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    headers: { accept: "application/json" },
    signal,
  });

  const data = (await response.json()) as T;
  if (!response.ok) throw new Error("Fonte pública indisponível.");
  return data;
}

export function getFuelPrice(uf: string, fuel: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ uf, fuel });
  return getJson<PublicDataResult<FuelPriceData>>(`/api/fuel-prices?${params}`, signal);
}

export function getEnergyTariff(uf: string, distributor?: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ uf });
  if (distributor) params.set("distributor", distributor);
  return getJson<PublicDataResult<EnergyTariffData>>(`/api/energy-tariffs?${params}`, signal);
}
