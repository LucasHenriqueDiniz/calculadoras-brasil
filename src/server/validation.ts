const BRAZILIAN_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

export function readUf(url: URL): string | null {
  const value = url.searchParams.get("uf")?.trim().toUpperCase();
  return value && BRAZILIAN_STATES.has(value) ? value : null;
}

export function readText(url: URL, key: string, maxLength = 120): string | null {
  const value = url.searchParams.get(key)?.trim();
  return value && value.length <= maxLength ? value : null;
}
