import { describe, expect, it } from "vitest";
import { blogPosts } from "../src/lib/blog";
import { calculators } from "../src/data/calculators";

describe("blogPosts", () => {
  it("ties every post to a calculator that exists, since the blog index groups by it", () => {
    const known = new Set(calculators.map((c) => c.slug));
    const orphans = Object.values(blogPosts)
      .filter((post) => !known.has(post.calculator))
      .map((post) => post.slug);
    expect(orphans).toEqual([]);
  });
});
