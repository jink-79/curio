import { useMemo } from "react";
import { SAMPLE_LESSONS } from "@/features/reading/data/sample";
import { readLessonProgress } from "@/features/reading/hooks/use-lesson-progress";
import type { PathOutline } from "@/features/reading/types";
import { computePathProgress } from "../lib/path-progress";

/** Path progress from this device's stored lesson progress (API-backed later). */
export function usePathProgress(path: PathOutline) {
  return useMemo(
    () =>
      computePathProgress(
        path,
        (l) => l.seedCompleted === true || readLessonProgress(l.lessonKey).completed,
        (l) => l.lessonKey in SAMPLE_LESSONS,
      ),
    [path],
  );
}

/** How far into a lesson the reader has scrolled (0–100), for "In progress" labels. */
export function lessonReadPercent(lessonKey: string): number {
  return readLessonProgress(lessonKey).maxScrollPct;
}
