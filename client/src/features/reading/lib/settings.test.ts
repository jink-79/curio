import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, isReaderSettings, stepFont } from "./settings";

describe("reader settings", () => {
  it("accepts defaults and rejects malformed stored values", () => {
    expect(isReaderSettings(DEFAULT_SETTINGS)).toBe(true);
    expect(isReaderSettings({ ...DEFAULT_SETTINGS, theme: "neon" })).toBe(false);
    expect(isReaderSettings({ ...DEFAULT_SETTINGS, fontStep: 9 })).toBe(false);
    expect(isReaderSettings(null)).toBe(false);
  });

  it("clamps font steps", () => {
    expect(stepFont({ ...DEFAULT_SETTINGS, fontStep: 4 }, 1).fontStep).toBe(4);
    expect(stepFont({ ...DEFAULT_SETTINGS, fontStep: 0 }, -1).fontStep).toBe(0);
    expect(stepFont(DEFAULT_SETTINGS, 1).fontStep).toBe(2);
  });
});
