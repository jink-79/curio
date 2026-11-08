import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, migrateSettings, stepFont } from "./settings";

describe("migrateSettings", () => {
  it("returns defaults for missing or malformed storage", () => {
    expect(migrateSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings("dark")).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid fields and defaults the rest", () => {
    expect(migrateSettings({ theme: "light", fontStep: 9, typeface: "sans", spacing: "nope" })).toEqual({
      ...DEFAULT_SETTINGS,
      theme: "light",
      typeface: "sans",
    });
  });

  it("maps the retired sepia theme to tidepool and adds a pairing", () => {
    const old = { theme: "sepia", fontStep: 3, typeface: "serif", spacing: "airy" };
    expect(migrateSettings(old)).toEqual({ theme: "tidepool", pairing: "tidepool", fontStep: 3, typeface: "serif", spacing: "airy" });
  });

  it("keeps a valid pairing", () => {
    expect(migrateSettings({ ...DEFAULT_SETTINGS, pairing: "bookmark" }).pairing).toBe("bookmark");
    expect(migrateSettings({ ...DEFAULT_SETTINGS, pairing: "comic" }).pairing).toBe("tidepool");
  });
});

describe("stepFont", () => {
  it("clamps font steps", () => {
    expect(stepFont({ ...DEFAULT_SETTINGS, fontStep: 4 }, 1).fontStep).toBe(4);
    expect(stepFont({ ...DEFAULT_SETTINGS, fontStep: 0 }, -1).fontStep).toBe(0);
    expect(stepFont(DEFAULT_SETTINGS, 1).fontStep).toBe(2);
  });
});
