import { listCategories } from "@/features/discover/lib/catalog";
import { readJson, writeJson } from "@/lib/storage";

export type ArticleLength = "any" | "short" | "standard" | "in-depth";

export interface Preferences {
  /** Preferred lesson length. "any" = no preference (optional by design). */
  articleLength: ArticleLength;
  /** Category slugs the learner cares about; shown first in Discover. */
  interests: string[];
  /** Mark a lesson complete once it's read to the end (see shouldAutoComplete). */
  autoComplete: boolean;
}

/** Words per option, at ~230 words a minute. */
export const ARTICLE_LENGTHS: { id: ArticleLength; label: string; words?: number; minutes?: number }[] = [
  { id: "any", label: "No preference" },
  { id: "short", label: "Short", words: 500, minutes: 2 },
  { id: "standard", label: "Standard", words: 1000, minutes: 4 },
  { id: "in-depth", label: "In-depth", words: 2000, minutes: 9 },
];

export const DEFAULT_PREFERENCES: Preferences = { articleLength: "any", interests: [], autoComplete: true };
const KEY = "curio.preferences.v1";

/** Keep every valid stored field, default the rest; unknown interests are dropped. */
export function migratePreferences(stored: unknown, knownCategories: string[]): Preferences {
  if (typeof stored !== "object" || stored === null) return DEFAULT_PREFERENCES;
  const v = stored as Record<string, unknown>;
  const interests = Array.isArray(v.interests) ? v.interests.filter((i): i is string => typeof i === "string" && knownCategories.includes(i)) : [];
  return {
    articleLength: ARTICLE_LENGTHS.some((a) => a.id === v.articleLength) ? (v.articleLength as ArticleLength) : DEFAULT_PREFERENCES.articleLength,
    interests: [...new Set(interests)],
    autoComplete: typeof v.autoComplete === "boolean" ? v.autoComplete : DEFAULT_PREFERENCES.autoComplete,
  };
}

/* A tiny external store, like the highlight store: read with useSyncExternalStore. */
let cache: Preferences | null = null;
let known: string[] | null = null;
const listeners = new Set<() => void>();

/** Override the valid category slugs (tests). Defaults to the catalog's categories. */
export function setKnownCategories(slugs: string[]): void {
  known = slugs;
  cache = null;
}

export function getPreferences(): Preferences {
  if (cache === null) {
    known ??= listCategories().map((c) => c.slug);
    cache = migratePreferences(readJson(KEY, (v): v is unknown => v !== undefined), known);
  }
  return cache;
}

export function updatePreferences(patch: Partial<Preferences>): void {
  cache = { ...getPreferences(), ...patch };
  writeJson(KEY, cache);
  for (const l of listeners) l();
}

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetPreferencesCache(): void {
  cache = null;
}

/** Items whose key is in `first` come first, keeping the original order within each group. */
export function interestsFirst<T>(items: T[], keyOf: (item: T) => string, first: string[]): T[] {
  if (first.length === 0) return items;
  const set = new Set(first);
  return [...items.filter((i) => set.has(keyOf(i))), ...items.filter((i) => !set.has(keyOf(i)))];
}
