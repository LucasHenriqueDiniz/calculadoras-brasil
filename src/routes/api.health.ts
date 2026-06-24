import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/server/responses";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () =>
        json(
          {
            ok: true,
            service: "calculadoras-brasil",
            runtime: "cloudflare-workers",
            timestamp: new Date().toISOString(),
          },
          { cacheControl: "no-store" },
        ),
    },
  },
});
