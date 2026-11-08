import type { Category, PathOutline } from "@/features/reading/types";

/** Lowercase, strip accents and punctuation: "Mönch's" → "monchs". */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface PathMatch {
  path: PathOutline;
  /** Lesson titles that matched, to show why a path came up. */
  matchedLessons: string[];
  score: number;
}

/**
 * Every query word must appear somewhere in the path (title, description,
 * category name or a lesson title). Title hits rank above lesson hits.
 */
export function searchPaths(query: string, paths: PathOutline[], categories: Category[]): PathMatch[] {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return [];

  const results: PathMatch[] = [];
  for (const path of paths) {
    const title = normalize(path.title);
    const description = normalize(path.description);
    const category = normalize(categories.find((c) => c.slug === path.categorySlug)?.name ?? "");
    const lessons = path.stages.flatMap((s) => s.lessons.map((l) => ({ raw: l.title, norm: normalize(`${l.title} ${l.summary}`) })));

    let score = 0;
    let allFound = true;
    const matched = new Set<string>();
    for (const w of words) {
      const inTitle = title.includes(w);
      const inCategory = category.includes(w);
      const inDescription = description.includes(w);
      const lessonHits = lessons.filter((l) => l.norm.includes(w));
      if (!inTitle && !inCategory && !inDescription && lessonHits.length === 0) {
        allFound = false;
        break;
      }
      score += inTitle ? 10 : inCategory ? 6 : inDescription ? 3 : 2;
      for (const l of lessonHits) matched.add(l.raw);
    }
    if (allFound) results.push({ path, matchedLessons: [...matched].slice(0, 3), score });
  }
  return results.sort((a, b) => b.score - a.score || a.path.title.localeCompare(b.path.title));
}

export function searchCategories(query: string, categories: Category[]): Category[] {
  const q = normalize(query);
  if (!q) return [];
  return categories.filter((c) => normalize(c.name).includes(q));
}
