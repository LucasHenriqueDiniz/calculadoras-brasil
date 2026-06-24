import { createFileRoute } from "@tanstack/react-router";
import { unavailable, json } from "@/server/responses";
import { readUf } from "@/server/validation";

export const Route = createFileRoute("/api/locations/cities")({
  server: {
    handlers: {
      GET: async ({ request }) => {
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
      },
    },
  },
});
