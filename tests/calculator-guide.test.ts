import { describe, expect, it } from "vitest";
import { calculatorGuide } from "../src/data/calculator-guide";
import { calculators } from "../src/data/calculators";

describe("calculatorGuide", () => {
  const known = new Set(calculators.map((c) => c.slug));
  const referenced = calculatorGuide.flatMap((s) => s.steps.map((step) => step.calculator));

  it("references only calculators that exist", () => {
    expect(referenced.filter((slug) => !known.has(slug))).toEqual([]);
  });

  it("places every calculator in at least one situation", () => {
    const placed = new Set(referenced);
    expect([...known].filter((slug) => !placed.has(slug))).toEqual([]);
  });

  it("gives each situation a unique anchor", () => {
    const ids = calculatorGuide.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
