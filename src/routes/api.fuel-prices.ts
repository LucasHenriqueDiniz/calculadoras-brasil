import { createFileRoute } from "@tanstack/react-router";
import { fetchAnpFuelPrice } from "@/server/adapters/anp";
import { respondWithEdgeCache } from "@/server/edge-cache";
import { unavailable, json } from "@/server/responses";
import { readText, readUf } from "@/server/validation";

const FUELS = new Set(["gasolina", "etanol", "diesel", "glp"]);

export const Route = createFileRoute("/api/fuel-prices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const uf = readUf(url);
        const fuel = readText(url, "fuel", 40)?.toLowerCase();

        if (!uf || !fuel || !FUELS.has(fuel)) {
          return json(
            { available: false, error: "Informe uma UF válida e um combustível suportado." },
            { status: 400, cacheControl: "no-store" },
          );
        }

        return respondWithEdgeCache(request, async () => {
          try {
            const result = await fetchAnpFuelPrice(uf, fuel);
            if (!result) {
              return unavailable(
                "ANP",
                `A planilha semanal não contém preço para ${fuel} em ${uf}. Informe o valor manualmente.`,
              );
            }

            return json(
              { available: true, ...result },
              {
                cacheControl: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
              },
            );
          } catch (error) {
            console.error(
              JSON.stringify({
                event: "public_data_error",
                source: "ANP",
                message: error instanceof Error ? error.message : "Erro desconhecido",
              }),
            );
            return unavailable(
              "ANP",
              "Não foi possível consultar a planilha semanal da ANP agora. Informe o valor manualmente.",
            );
          }
        });
      },
    },
  },
});
