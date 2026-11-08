import { describe, expect, it } from "vitest";
import type { Category, PathOutline } from "@/features/reading/types";
import { normalize, searchCategories, searchPaths } from "./search";

const cats: Category[] = [
  { slug: "history", name: "History", description: "", icon: "landmark" },
  { slug: "ai", name: "Artificial Intelligence", description: "", icon: "sparkles" },
];
const mk = (pathId: string, title: string, categorySlug: string, lessons: string[]): PathOutline => ({
  pathId,
  title,
  description: `About ${title}`,
  categorySlug,
  difficulty: "Beginner",
  objectives: [],
  stages: [{ number: 1, title: "S", lessons: lessons.map((t, i) => ({ lessonKey: `${pathId}-${i}`, title: t, minutes: 5, summary: "" })) }],
});
const ww2 = mk("ww2", "World War II", "history", ["Treaty of Versailles", "Great Depression"]);
const ai = mk("ai", "History of Artificial Intelligence", "ai", ["Transformers", "AI Winters"]);

describe("normalize", () => {
  it("lowercases and strips accents and punctuation", () => {
    expect(normalize("  Mönch’s  War-time! ")).toBe("monchs wartime");
  });
});

describe("searchPaths", () => {
  it("returns nothing for an empty query", () => {
    expect(searchPaths("   ", [ww2, ai], cats)).toEqual([]);
  });

  it("finds paths by lesson title and reports the lesson", () => {
    const r = searchPaths("versailles", [ww2, ai], cats);
    expect(r.map((m) => m.path.pathId)).toEqual(["ww2"]);
    expect(r[0]?.matchedLessons).toEqual(["Treaty of Versailles"]);
  });

  it("requires every word to match", () => {
    expect(searchPaths("history transformers", [ww2, ai], cats).map((m) => m.path.pathId)).toEqual(["ai"]);
    expect(searchPaths("versailles transformers", [ww2, ai], cats)).toEqual([]);
  });

  it("ranks title matches above category matches", () => {
    // "history" is in the AI path's title and is the WWII path's category name.
    expect(searchPaths("history", [ww2, ai], cats).map((m) => m.path.pathId)).toEqual(["ai", "ww2"]);
  });
});

describe("searchCategories", () => {
  it("matches category names", () => {
    expect(searchCategories("intel", cats).map((c) => c.slug)).toEqual(["ai"]);
    expect(searchCategories("", cats)).toEqual([]);
  });
});
