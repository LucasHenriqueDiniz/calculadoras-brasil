import { unavailable, json } from "../../_shared/responses";
import { readUf } from "../../_shared/validation";

export const onRequestGet: PagesFunction = async ({ request }) => {
  const uf = readUf(new URL(request.url));

  if (!uf) {
    return json(
      { available: false, error: "Informe uma UF válida." },
      { status: 400, cacheControl: "no-store" },
    );
  }

  return unavailable(
    "IBGE",
    `A lista de municípios de ${uf} ainda não foi carregada. O uso básico continua disponível.`,
  );
};
