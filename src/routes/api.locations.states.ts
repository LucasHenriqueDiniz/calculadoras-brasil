import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/server/responses";
import { STATES } from "@/server/states";

export const Route = createFileRoute("/api/locations/states")({
  server: {
    handlers: {
      GET: async () =>
        json(
          {
            available: true,
            source: "IBGE",
            lastUpdated: "2026-06-23",
            states: STATES,
          },
          { cacheControl: "public, max-age=86400, s-maxage=2592000" },
        ),
    },
  },
});
