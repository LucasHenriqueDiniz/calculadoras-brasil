import { describe, expect, it } from "vitest";
import { formatLongDate, formatShortDate } from "../src/lib/format";

describe("formatLongDate", () => {
  it("writes the date out the way a visitor reads it", () => {
    expect(formatLongDate("2026-10-18")).toBe("18 de outubro de 2026");
  });

  // West of Greenwich, midnight UTC is still the day before; this runs in
  // whatever zone the machine is in, which is how the bug would show.
  it("keeps the calendar date in any time zone", () => {
    expect(formatLongDate("2026-01-01")).toBe("1 de janeiro de 2026");
  });
});

describe("formatShortDate", () => {
  // The ANP week ending 10/10/2026 showed as "09/10/2026" in Brasília.
  it("keeps a source's calendar day in any time zone", () => {
    expect(formatShortDate("2026-10-10")).toBe("10/10/2026");
  });
});
