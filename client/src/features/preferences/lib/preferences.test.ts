import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  interestsFirst,
  migratePreferences,
  resetPreferencesCache,
  setKnownCategories,
  subscribePreferences,
  updatePreferences,
} from "./preferences";

const cats = ["history", "science", "finance"];

describe("migratePreferences", () => {
  it("defaults when nothing is stored", () => {
    expect(migratePreferences(null, cats)).toEqual(DEFAULT_PREFERENCES);
  });

  it("keeps valid fields, drops unknown or duplicate interests", () => {
    expect(migratePreferences({ articleLength: "short", interests: ["history", "astrology", "history", 4], autoComplete: false }, cats)).toEqual({
      articleLength: "short",
      interests: ["history"],
      autoComplete: false,
    });
  });

  it("defaults bad values individually", () => {
    expect(migratePreferences({ articleLength: "epic", autoComplete: "yes" }, cats)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe("preferences store", () => {
  beforeEach(() => {
    setKnownCategories(cats);
    resetPreferencesCache();
  });

  it("updates and notifies", () => {
    let calls = 0;
    const off = subscribePreferences(() => (calls += 1));
    updatePreferences({ articleLength: "in-depth" });
    off();
    expect(getPreferences().articleLength).toBe("in-depth");
    expect(calls).toBe(1);
  });
});

describe("interestsFirst", () => {
  it("moves interests to the front, stable within groups", () => {
    expect(interestsFirst(["a", "b", "c", "d"], (x) => x, ["d", "b"])).toEqual(["b", "d", "a", "c"]);
    expect(interestsFirst(["a", "b"], (x) => x, [])).toEqual(["a", "b"]);
  });
});
