import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { json } from "../src/server/responses";

/**
 * Why no public-data response may carry a stale-while-revalidate directive.
 *
 * The edge cache is the Workers Cache API, which does not support the directive,
 * so it never applied there. The browser does apply it: with `max-age=0`, a lookup
 * the browser had seen before was answered from its own copy, however old within
 * the window, and a second request went out behind it to revalidate. On
 * custo-carro that was two requests per fuel lookup, and the page kept the stale
 * answer.
 *
 * The scan matches the directive with its `=`, so prose that names it survives.
 */
const DIRECTIVE = /stale-while-revalidate=/;

const API_ROUTES = readdirSync(new URL("../src/routes", import.meta.url))
  .filter((name) => name.startsWith("api."))
  .map((name) => `src/routes/${name}`);

const SOURCES = ["src/server/responses.ts", ...API_ROUTES];

describe("public-data responses never let the browser reuse a stale copy", () => {
  /** Keeps the scan below from passing on an empty or renamed directory. */
  it("scans the routes that serve fuel prices and energy tariffs", () => {
    expect(API_ROUTES).toEqual(
      expect.arrayContaining(["src/routes/api.fuel-prices.ts", "src/routes/api.energy-tariffs.ts"]),
    );
  });

  it.each(SOURCES)("%s sets no stale-while-revalidate", (path) => {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

    expect(source).not.toMatch(DIRECTIVE);
  });

  it("defaults to an edge TTL and nothing a browser may reuse", () => {
    expect(json({}).headers.get("cache-control")).toBe("public, max-age=0, s-maxage=300");
  });
});
