import { describe, expect, it } from "vitest";
import type { PathOutline } from "@/features/reading/types";
import { computePathProgress, formatMinutes } from "./path-progress";

const path: PathOutline = {
  pathId: "p",
  title: "P",
  description: "",
  categorySlug: "",
  difficulty: "",
  objectives: [],
  stages: [
    { number: 1, title: "A", lessons: [
      { lessonKey: "a1", title: "A1", minutes: 10, summary: "" },
      { lessonKey: "a2", title: "A2", minutes: 20, summary: "" },
    ] },
    { number: 2, title: "B", lessons: [{ lessonKey: "b1", title: "B1", minutes: 30, summary: "" }] },
  ],
};

describe("computePathProgress", () => {
  it("picks the first unfinished readable lesson as next", () => {
    const p = computePathProgress(path, (l) => l.lessonKey === "a1", () => true);
    expect(p.next?.lessonKey).toBe("a2");
    expect(p.statuses).toEqual({ a1: "done", a2: "next", b1: "todo" });
    expect(p).toMatchObject({ doneCount: 1, total: 3, percent: 33, minutesLeft: 50 });
  });

  it("skips lessons that cannot be read yet", () => {
    const p = computePathProgress(path, () => false, (l) => l.lessonKey === "b1");
    expect(p.next).toMatchObject({ lessonKey: "b1", stageNumber: 2 });
  });

  it("has no next lesson when everything readable is done", () => {
    const p = computePathProgress(path, (l) => l.lessonKey !== "b1", (l) => l.lessonKey !== "b1");
    expect(p.next).toBeNull();
    expect(p.statuses.b1).toBe("todo");
  });

  it("reports 100% and no time left when complete", () => {
    const p = computePathProgress(path, () => true, () => true);
    expect(p).toMatchObject({ percent: 100, minutesLeft: 0, next: null });
  });
});

describe("formatMinutes", () => {
  it("formats hours and minutes", () => {
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(120)).toBe("2h");
    expect(formatMinutes(100)).toBe("1h 40m");
  });
});
