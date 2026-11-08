import { SAMPLE_CATEGORIES, SAMPLE_LESSONS, SAMPLE_PATHS } from "@/features/reading/data/sample";
import type { Category, PathOutline } from "@/features/reading/types";

/*
 * Read-only catalog access. Backed by sample data today; the same functions
 * become API calls (GET /categories, GET /paths) later, so screens don't
 * change.
 */

export function listCategories(): Category[] {
  return SAMPLE_CATEGORIES;
}

export function getCategory(slug: string): Category | undefined {
  return SAMPLE_CATEGORIES.find((c) => c.slug === slug);
}

export function listPaths(): PathOutline[] {
  return Object.values(SAMPLE_PATHS);
}

export function pathsInCategory(slug: string): PathOutline[] {
  return listPaths().filter((p) => p.categorySlug === slug);
}

export interface PathStats {
  lessons: number;
  minutes: number;
  /** Lessons with written content (sample data is partly written). */
  written: number;
}

export function pathStats(path: PathOutline): PathStats {
  const lessons = path.stages.flatMap((s) => s.lessons);
  return {
    lessons: lessons.length,
    minutes: lessons.reduce((m, l) => m + l.minutes, 0),
    written: lessons.filter((l) => l.lessonKey in SAMPLE_LESSONS).length,
  };
}
