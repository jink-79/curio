import { describe, expect, it } from "vitest";
import type { LessonProgress } from "@/features/reading/hooks/use-lesson-progress";
import type { LessonView, PathOutline } from "@/features/reading/types";
import { buildLibrary, countByTab, filterLibrary } from "./library";

const path: PathOutline = {
  pathId: "p",
  title: "World War II",
  description: "",
  categorySlug: "history",
  difficulty: "",
  objectives: [],
  stages: [
    { number: 1, title: "S", lessons: [
      { lessonKey: "a", title: "Treaty of Versailles", minutes: 8, summary: "" },
      { lessonKey: "b", title: "Great Depression", minutes: 10, summary: "" },
      { lessonKey: "c", title: "Rise of Fascism", minutes: 12, summary: "" },
    ] },
  ],
};
const lessonA = { lessonKey: "a", blocks: [{ id: "blk", type: "authored", markdown: "x" }] } as unknown as LessonView;
const empty: LessonProgress = { bookmarked: false, completed: false, manuallyIncomplete: false, maxScrollPct: 0, activeSeconds: 0 };
const progress: Record<string, LessonProgress> = {
  a: { ...empty, completed: true, completedAt: 100, maxScrollPct: 100 },
  b: { ...empty, bookmarked: true, bookmarkedAt: 300, maxScrollPct: 40, lastReadAt: 200 },
};
const items = buildLibrary({
  paths: [path],
  lessons: { a: lessonA },
  highlights: [
    { id: "h1", lessonKey: "a", blockId: "blk", exact: "war guilt clause", note: "Compare with 1945", color: "blue", createdAt: 50 },
    { id: "h2", lessonKey: "a", blockId: "elsewhere", exact: "not in any lesson", color: "blue", createdAt: 60 },
  ],
  progressOf: (k) => progress[k] ?? empty,
});

describe("buildLibrary", () => {
  it("collects highlights, bookmarks and reading, newest first", () => {
    expect(items.map((i) => i.id)).toEqual(["b:b", "r:b", "r:a", "h:h1"]);
  });

  it("skips highlights whose block is not in a known lesson", () => {
    expect(items.some((i) => i.id === "h:h2")).toBe(false);
  });

  it("reports partial reading as a percent and completion as 100", () => {
    const read = items.filter((i) => i.kind === "read");
    expect(read.map((i) => (i.kind === "read" ? [i.lesson.lessonKey, i.completed, i.percent] : null))).toEqual([
      ["b", false, 40],
      ["a", true, 100],
    ]);
  });
});

describe("filterLibrary", () => {
  it("filters by tab", () => {
    expect(filterLibrary(items, "notes", "").map((i) => i.id)).toEqual(["h:h1"]);
    expect(filterLibrary(items, "bookmarks", "").map((i) => i.id)).toEqual(["b:b"]);
  });

  it("searches quotes, notes and lesson titles", () => {
    expect(filterLibrary(items, "all", "guilt").map((i) => i.id)).toEqual(["h:h1"]);
    expect(filterLibrary(items, "all", "1945").map((i) => i.id)).toEqual(["h:h1"]);
    expect(filterLibrary(items, "all", "depression").map((i) => i.id)).toEqual(["b:b", "r:b"]);
    expect(filterLibrary(items, "highlights", "depression")).toEqual([]);
  });
});

describe("countByTab", () => {
  it("counts each tab", () => {
    expect(countByTab(items)).toEqual({ all: 4, highlights: 1, notes: 1, bookmarks: 1, read: 2 });
  });
});
