import { describe, expect, it } from "vitest";
import { relativeDay } from "./relative-day";

describe("relativeDay", () => {
  const now = new Date(2026, 10, 8, 9, 0).getTime();
  it("uses calendar days", () => {
    expect(relativeDay(new Date(2026, 10, 8, 0, 5).getTime(), now)).toBe("today");
    expect(relativeDay(new Date(2026, 10, 7, 23, 59).getTime(), now)).toBe("yesterday");
    expect(relativeDay(new Date(2026, 10, 5, 12, 0).getTime(), now)).toBe("3 days ago");
  });
  it("switches to months after 30 days", () => {
    expect(relativeDay(new Date(2026, 8, 1).getTime(), now)).toBe("2 months ago");
  });
});
