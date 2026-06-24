const DEFAULT_TIMEOUT_MS = 15_000;

export async function fetchBounded(
  input: string | URL,
  options: RequestInit & { maxBytes: number; timeoutMs?: number },
): Promise<{ response: Response; bytes: Uint8Array }> {
  const { maxBytes, timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`Fonte externa respondeu HTTP ${response.status}.`);

    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new Error("Fonte externa excedeu o tamanho permitido.");
    }

    if (!response.body) return { response, bytes: new Uint8Array() };

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("Fonte externa excedeu o tamanho permitido.");
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return { response, bytes };
  } finally {
    clearTimeout(timeout);
  }
}

export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
