import { createFileRoute } from "@tanstack/react-router";
import { unavailable, json } from "@/server/responses";
import { readText } from "@/server/validation";

export const Route = createFileRoute("/api/vehicle-efficiency")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const brand = readText(url, "brand");
        const model = readText(url, "model");

        if (!brand || !model) {
          return json(
            { available: false, error: "Informe marca e modelo." },
            { status: 400, cacheControl: "no-store" },
          );
        }

        return unavailable(
          "Inmetro/PBE Veicular",
          `Ainda não há eficiência normalizada para ${brand} ${model}. Informe o consumo manualmente.`,
        );
      },
    },
  },
});
