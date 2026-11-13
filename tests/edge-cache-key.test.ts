import { describe, expect, it } from "vitest";
import { edgeCacheKey } from "../src/server/edge-cache-key";

const FUEL_LOOKUP = "https://calculebrasil.com/api/fuel-prices?uf=SP&fuel=gasolina";

describe("edgeCacheKey", () => {
  it("gives a new deploy a key the previous deploy never wrote", () => {
    expect(edgeCacheKey(FUEL_LOOKUP, "version-after-fix")).not.toBe(
      edgeCacheKey(FUEL_LOOKUP, "version-before-fix"),
    );
  });

  it("gives one deploy the same key for the same lookup, so the cache still hits", () => {
    expect(edgeCacheKey(FUEL_LOOKUP, "v1")).toBe(edgeCacheKey(FUEL_LOOKUP, "v1"));
  });

  it("keeps the lookup's own parameters in the key", () => {
    const key = new URL(edgeCacheKey(FUEL_LOOKUP, "v1"));

    expect(key.searchParams.get("uf")).toBe("SP");
    expect(key.searchParams.get("fuel")).toBe("gasolina");
  });

  it("does not let a visitor's own _version parameter reach another deploy's entry", () => {
    const forged = `${FUEL_LOOKUP}&_version=version-before-fix`;

    expect(edgeCacheKey(forged, "version-after-fix")).toBe(
      edgeCacheKey(FUEL_LOOKUP, "version-after-fix"),
    );
  });
});
