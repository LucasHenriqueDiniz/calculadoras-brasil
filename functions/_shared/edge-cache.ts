export async function respondWithEdgeCache(
  request: Request,
  context: EventContext<Env, string, unknown>,
  producer: () => Promise<Response>,
): Promise<Response> {
  const cache = await caches.open("public-data");
  const cacheKey = new Request(request.url, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const response = await producer();
  if (response.ok && !response.headers.get("cache-control")?.includes("no-store")) {
    context.waitUntil(
      cache.put(cacheKey, response.clone()).catch((error) => {
        console.warn(
          JSON.stringify({
            event: "edge_cache_write_error",
            message: error instanceof Error ? error.message : "Erro desconhecido",
          }),
        );
      }),
    );
  }

  return response;
}
