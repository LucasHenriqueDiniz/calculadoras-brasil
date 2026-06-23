import { json } from "../_shared/responses";

export const onRequestGet: PagesFunction = async () =>
  json(
    {
      ok: true,
      service: "calculadoras-brasil",
      runtime: "cloudflare-pages-functions",
      timestamp: new Date().toISOString(),
    },
    { cacheControl: "no-store" },
  );
