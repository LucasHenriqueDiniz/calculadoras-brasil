import { createFileRoute } from "@tanstack/react-router";
import { fetchAneelDistributors, fetchAneelTariff } from "@/server/adapters/aneel";
import { respondWithEdgeCache } from "@/server/edge-cache";
import { unavailable, json } from "@/server/responses";
import { readText, readUf } from "@/server/validation";

export const Route = createFileRoute("/api/energy-tariffs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const uf = readUf(url);
        const distributor = readText(url, "distributor");

        if (!uf) {
          return json(
            { available: false, error: "Informe uma UF válida." },
            { status: 400, cacheControl: "no-store" },
          );
        }

        return respondWithEdgeCache(request, async () => {
          try {
            if (!distributor) {
              const distributors = await fetchAneelDistributors(uf);
              return json(
                { available: true, source: "ANEEL", distributors },
                {
                  cacheControl:
                    "public, max-age=0, s-maxage=604800, stale-while-revalidate=2592000",
                },
              );
            }

            const result = await fetchAneelTariff(uf, distributor);
            if (!result) {
              return unavailable(
                "ANEEL",
                `Não foi encontrada uma tarifa B1 vigente para "${distributor}". Confira a sigla da distribuidora na fatura.`,
              );
            }

            return json(
              { available: true, ...result },
              {
                cacheControl: "public, max-age=0, s-maxage=604800, stale-while-revalidate=2592000",
              },
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
      },
    },
  },
});
