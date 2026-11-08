import { describe, expect, it } from "vitest";
import { applyHighlights, orphanedHighlights, parseInline, splitParagraphs } from "./segments";
const base = { lessonKey: "l", color: "blue" as const, createdAt: 0 };

describe("splitParagraphs", () => {
  it("splits on blank lines and joins soft line breaks", () => {
    expect(splitParagraphs("One\nline.\n\n  Two.  \n\n\n")).toEqual(["One line.", "Two."]);
  });
});

describe("parseInline", () => {
  it("parses emphasis and strong", () => {
    expect(parseInline("a *b* **c** d")).toEqual([
      { text: "a ", em: false, strong: false },
      { text: "b", em: true, strong: false },
      { text: " ", em: false, strong: false },
      { text: "c", em: false, strong: true },
      { text: " d", em: false, strong: false },
    ]);
  });

  it("leaves unmatched markers and HTML as literal text", () => {
    expect(parseInline("2 * 3 <b>x</b>")).toEqual([{ text: "2 * 3 <b>x</b>", em: false, strong: false }]);
  });
});

describe("applyHighlights", () => {
  const segs = parseInline("The *quick* brown fox jumps.");

  it("returns segments unchanged with no matches", () => {
    expect(applyHighlights(segs, [{ ...base, id: "h", blockId: "b", exact: "zebra" }])).toEqual(segs);
  });

  it("splits a highlight that spans styled runs", () => {
    const out = applyHighlights(segs, [{ ...base, id: "h1", blockId: "b", exact: "quick brown" }]);
    expect(out.map((s) => [s.text, s.em, s.highlightId])).toEqual([
      ["The ", false, undefined],
      ["quick", true, "h1"],
      [" brown", false, "h1"],
      [" fox jumps.", false, undefined],
    ]);
    expect(out.map((s) => s.text).join("")).toBe("The quick brown fox jumps.");
  });

  it("ignores a highlight that overlaps an earlier one", () => {
    const out = applyHighlights(segs, [
      { ...base, id: "a", blockId: "b", exact: "quick brown" },
      { ...base, id: "b", blockId: "b", exact: "brown fox" },
    ]);
    expect(out.filter((s) => s.highlightId === "b")).toHaveLength(0);
  });
});

describe("orphanedHighlights", () => {
  it("reports quotes that no longer appear in the text", () => {
    const md = "Kept *text* here.\n\nSecond para.";
    const result = orphanedHighlights(md, [
      { ...base, id: "ok", blockId: "b", exact: "Kept text" },
      { ...base, id: "gone", blockId: "b", exact: "removed words" },
    ]);
    expect(result.map((h) => h.id)).toEqual(["gone"]);
  });
});
