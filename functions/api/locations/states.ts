import { json } from "../../_shared/responses";
import { STATES } from "../../_shared/states";

export const onRequestGet: PagesFunction = async () =>
  json(
    {
      available: true,
      source: "IBGE",
      lastUpdated: "2026-06-23",
      states: STATES,
    },
    { cacheControl: "public, max-age=86400, s-maxage=2592000" },
  );
