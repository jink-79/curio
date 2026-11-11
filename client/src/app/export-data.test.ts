import { describe, expect, it } from "vitest";
import { collectDeviceData } from "./export-data";

function fakeStorage(entries: Record<string, string>): Storage {
  const keys = Object.keys(entries);
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null,
    getItem: (k: string) => entries[k] ?? null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

describe("collectDeviceData", () => {
  it("exports only CURIO keys, parsing JSON values", () => {
    const doc = collectDeviceData(
      fakeStorage({
        "curio.highlights.v1": '[{"id":"h1"}]',
        "curio.lastPath.v1": "world-war-2",
        "other.app": '{"secret":true}',
      }),
      new Date("2026-11-11T10:00:00Z"),
    );
    expect(doc).toEqual({
      app: "curio",
      exportedAt: "2026-11-11T10:00:00.000Z",
      data: { "curio.highlights.v1": [{ id: "h1" }], "curio.lastPath.v1": "world-war-2" },
    });
  });
});
