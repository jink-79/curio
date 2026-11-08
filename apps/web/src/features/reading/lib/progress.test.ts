import { describe, expect, it } from "vitest";
import { scrollProgress, shouldAutoComplete } from "./progress";

describe("scrollProgress", () => {
  it("is 100 when content fits on screen", () => expect(scrollProgress(0, 500, 800)).toBe(100));
  it("rounds and clamps", () => {
    expect(scrollProgress(150, 1300, 800)).toBe(30);
    expect(scrollProgress(-40, 1300, 800)).toBe(0);
    expect(scrollProgress(900, 1300, 800)).toBe(100);
  });
});

describe("shouldAutoComplete", () => {
  it("needs both 90% scroll and 40% of the estimated time", () => {
    expect(shouldAutoComplete(95, 60, 8)).toBe(false); // skimmed
    expect(shouldAutoComplete(80, 600, 8)).toBe(false); // not at the end
    expect(shouldAutoComplete(90, 192, 8)).toBe(true); // 8 min * 40% = 192 s
  });
});
