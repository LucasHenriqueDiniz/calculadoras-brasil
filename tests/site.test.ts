import { describe, expect, it } from "vitest";
import { isProductionHost } from "../src/lib/site";

/**
 * The AdSense script loads only where `isProductionHost` says so. The hosts below are the
 * ones the AdSense report listed as domains of their own in the 90 days to 2026-11-11.
 */
describe("isProductionHost", () => {
  it("accepts the production domain", () => {
    expect(isProductionHost("calculebrasil.com")).toBe(true);
  });

  it.each([
    "127.0.0.1",
    "localhost",
    "feat-adsense-clt-vs-pj-calcule-brasil.lucas-hdo.workers.dev",
    "fix-persisted-state-hydration-calcule-brasil.lucas-hdo.workers.dev",
    "chore-undici-audit-calcule-brasil.lucas-hdo.workers.dev",
    // Not in the report: a Pages-style preview, and a www host that does not resolve today.
    "calcule-brasil.pages.dev",
    "www.calculebrasil.com",
    "calculebrasil.com.evil.example",
  ])("rejects %s", (hostname) => {
    expect(isProductionHost(hostname)).toBe(false);
  });
});
