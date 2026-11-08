import { beforeEach, describe, expect, it } from "vitest";
import { addHighlight, getHighlights, removeHighlight, resetHighlightCache, subscribeHighlights, updateHighlight } from "./highlight-store";

const base = { lessonKey: "l", blockId: "b", exact: "some words", color: "blue" as const };

describe("highlight store", () => {
  beforeEach(() => {
    resetHighlightCache();
    for (const h of getHighlights()) removeHighlight(h.id);
  });

  it("adds, trims notes and notifies subscribers", () => {
    let calls = 0;
    const off = subscribeHighlights(() => (calls += 1));
    const h = addHighlight({ ...base, note: "  remember this  " }, 1000);
    off();
    expect(h).toMatchObject({ ...base, note: "remember this", createdAt: 1000 });
    expect(getHighlights()).toHaveLength(1);
    expect(calls).toBe(1);
  });

  it("drops an empty note on add", () => {
    expect(addHighlight({ ...base, note: "   " })).not.toHaveProperty("note");
  });

  it("updates colour and note, and an empty note removes it", () => {
    const h = addHighlight({ ...base, note: "x" });
    updateHighlight(h.id, { color: "pink", note: "new note" }, 2000);
    expect(getHighlights()[0]).toMatchObject({ color: "pink", note: "new note", updatedAt: 2000 });
    updateHighlight(h.id, { note: "" });
    expect(getHighlights()[0]).not.toHaveProperty("note");
  });

  it("removes", () => {
    const h = addHighlight(base);
    removeHighlight(h.id);
    expect(getHighlights()).toEqual([]);
  });

  it("returns the same array until something changes (stable for React)", () => {
    addHighlight(base);
    expect(getHighlights()).toBe(getHighlights());
  });
});
