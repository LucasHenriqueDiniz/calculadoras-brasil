const SECURITY_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export function json(data: unknown, init: ResponseInit & { cacheControl?: string } = {}): Response {
  const headers = new Headers(init.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }

  headers.set(
    "cache-control",
    init.cacheControl ?? "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
  );

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function unavailable(source: string, notes: string): Response {
  return json(
    {
      available: false,
      source,
      lastUpdated: null,
      isStale: false,
      notes,
    },
    { status: 200, cacheControl: "public, max-age=0, s-maxage=300" },
  );
}
