import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/server/responses";

export const Route = createFileRoute("/api/public-data/sources")({
  server: {
    handlers: {
      GET: async () =>
        json(
          {
            available: true,
            sources: [
              {
                id: "anp",
                name: "ANP",
                enabled: true,
                lastUpdated: "2026-06-20",
                cacheTtl: 86400,
                sourceUrlName: "Levantamento semanal de preços de combustíveis",
                notes: "Consulta a planilha semanal oficial e agrega a linha publicada por UF.",
              },
              {
                id: "aneel",
                name: "ANEEL",
                enabled: true,
                lastUpdated: "2026-06-23",
                cacheTtl: 604800,
                sourceUrlName: "Tarifas de aplicação das distribuidoras de energia elétrica",
                notes: "Consulta a tarifa B1 residencial convencional vigente por distribuidora.",
              },
              {
                id: "inmetro",
                name: "Inmetro/PBE Veicular",
                enabled: false,
                lastUpdated: null,
                cacheTtl: 2592000,
                sourceUrlName: "Programa Brasileiro de Etiquetagem Veicular",
                notes: "Dataset normalizado ainda não publicado.",
              },
              {
                id: "ibge",
                name: "IBGE",
                enabled: true,
                lastUpdated: "2026-06-23",
                cacheTtl: 2592000,
                sourceUrlName: "Divisão territorial brasileira",
                notes: "A lista de UFs possui fallback local.",
              },
            ],
          },
          { cacheControl: "public, max-age=3600, s-maxage=86400" },
        ),
    },
  },
});
