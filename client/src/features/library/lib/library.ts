import { normalize } from "@/features/discover/lib/search";
import type { LessonProgress } from "@/features/reading/hooks/use-lesson-progress";
import type { Highlight, HighlightColor, LessonView, PathOutline } from "@/features/reading/types";

export interface LessonRef {
  pathId: string;
  pathTitle: string;
  lessonKey: string;
  lessonTitle: string;
  minutes: number;
}

export type LibraryItem =
  | { kind: "highlight"; id: string; lesson: LessonRef; blockId: string; quote: string; color: HighlightColor; note?: string; at?: number }
  | { kind: "bookmark"; id: string; lesson: LessonRef; at?: number }
  | { kind: "read"; id: string; lesson: LessonRef; completed: boolean; percent: number; at?: number };

export type LibraryTab = "all" | "highlights" | "notes" | "bookmarks" | "read";

export const LIBRARY_TABS: { id: LibraryTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "highlights", label: "Highlights" },
  { id: "notes", label: "Notes" },
  { id: "bookmarks", label: "Bookmarks" },
  { id: "read", label: "Read" },
];

interface Sources {
  paths: PathOutline[];
  lessons: Record<string, LessonView>;
  highlights: Highlight[];
  progressOf: (lessonKey: string) => LessonProgress;
}

/**
 * Everything the learner has kept: highlights (with notes), bookmarks and
 * reading history. Newest first; items without a timestamp (saved before
 * timestamps existed) follow, in path order.
 */
export function buildLibrary({ paths, lessons, highlights, progressOf }: Sources): LibraryItem[] {
  const items: (LibraryItem & { order: number })[] = [];
  let order = 0;

  for (const path of paths) {
    for (const stage of path.stages) {
      for (const l of stage.lessons) {
        order += 1;
        const ref: LessonRef = { pathId: path.pathId, pathTitle: path.title, lessonKey: l.lessonKey, lessonTitle: l.title, minutes: l.minutes };
        const p = progressOf(l.lessonKey);

        const lesson = lessons[l.lessonKey];
        if (lesson) {
          for (const h of highlights) {
            if (h.lessonKey !== l.lessonKey || !lesson.blocks.some((b) => b.id === h.blockId)) continue;
            items.push({
              kind: "highlight",
              id: `h:${h.id}`,
              lesson: ref,
              blockId: h.blockId,
              quote: h.exact,
              color: h.color,
              ...(h.note ? { note: h.note } : {}),
              at: h.updatedAt ?? h.createdAt,
              order,
            });
          }
        }
        if (p.bookmarked) items.push({ kind: "bookmark", id: `b:${l.lessonKey}`, lesson: ref, ...(p.bookmarkedAt ? { at: p.bookmarkedAt } : {}), order });
        if (p.completed || p.maxScrollPct > 0) {
          const at = p.completed ? (p.completedAt ?? p.lastReadAt) : p.lastReadAt;
          items.push({
            kind: "read",
            id: `r:${l.lessonKey}`,
            lesson: ref,
            completed: p.completed,
            percent: p.completed ? 100 : p.maxScrollPct,
            ...(at ? { at } : {}),
            order,
          });
        }
      }
    }
  }

  return items
    .sort((a, b) => (b.at ?? -1) - (a.at ?? -1) || a.order - b.order)
    .map(({ order: _order, ...item }) => item as LibraryItem);
}

function inTab(item: LibraryItem, tab: LibraryTab): boolean {
  switch (tab) {
    case "all":
      return true;
    case "highlights":
      return item.kind === "highlight";
    case "notes":
      return item.kind === "highlight" && item.note !== undefined;
    case "bookmarks":
      return item.kind === "bookmark";
    case "read":
      return item.kind === "read";
  }
}

function searchableText(item: LibraryItem): string {
  const base = `${item.lesson.lessonTitle} ${item.lesson.pathTitle}`;
  return normalize(item.kind === "highlight" ? `${item.quote} ${item.note ?? ""} ${base}` : base);
}

/** Items in a tab whose text contains every word of the query. */
export function filterLibrary(items: LibraryItem[], tab: LibraryTab, query: string): LibraryItem[] {
  const words = normalize(query).split(" ").filter(Boolean);
  return items.filter((i) => inTab(i, tab) && (words.length === 0 || words.every((w) => searchableText(i).includes(w))));
}

export function countByTab(items: LibraryItem[]): Record<LibraryTab, number> {
  return Object.fromEntries(LIBRARY_TABS.map((t) => [t.id, items.filter((i) => inTab(i, t.id)).length])) as Record<LibraryTab, number>;
}
