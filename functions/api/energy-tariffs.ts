import { fetchAneelTariff } from "../_shared/adapters/aneel";
import { respondWithEdgeCache } from "../_shared/edge-cache";
import { unavailable, json } from "../_shared/responses";
import { readText, readUf } from "../_shared/validation";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const uf = readUf(url);
  const distributor = readText(url, "distributor");

  if (!uf) {
    return json(
      { available: false, error: "Informe uma UF válida." },
      { status: 400, cacheControl: "no-store" },
    );
  }

  if (!distributor) {
    return unavailable(
      "ANEEL",
      "Informe a distribuidora como aparece na fatura para consultar a tarifa residencial.",
    );
  }

  return respondWithEdgeCache(request, context, async () => {
    try {
      const result = await fetchAneelTariff(uf, distributor);
      if (!result) {
        return unavailable(
          "ANEEL",
          `Não foi encontrada uma tarifa B1 vigente para "${distributor}". Confira a sigla da distribuidora na fatura.`,
        );
      }

      return json(
        { available: true, ...result },
        { cacheControl: "public, max-age=0, s-maxage=604800, stale-while-revalidate=2592000" },
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "public_data_error",
          source: "ANEEL",
          message: error instanceof Error ? error.message : "Erro desconhecido",
        }),
      );
      return unavailable(
        "ANEEL",
        "Não foi possível consultar os dados abertos da ANEEL agora. Use o valor da sua fatura.",
      );
    }
  });
};
