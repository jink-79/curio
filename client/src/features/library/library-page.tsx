import { Search, X } from "lucide-react";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { MenuButton } from "@/app/menu-button";
import { listPaths } from "@/features/discover/lib/catalog";
import { SAMPLE_LESSONS } from "@/features/reading/data/sample";
import { useHighlights } from "@/features/reading/hooks/use-highlights";
import { readLessonProgress } from "@/features/reading/hooks/use-lesson-progress";
import { cn } from "@/lib/cn";
import { LibraryItemCard } from "./components/library-item-card";
import { buildLibrary, countByTab, filterLibrary, LIBRARY_TABS, type LibraryTab } from "./lib/library";

const EMPTY_HINT: Record<LibraryTab, string> = {
  all: "Highlights, notes, bookmarks and the lessons you read will collect here.",
  highlights: "Passages you highlight while reading will appear here.",
  notes: "Notes you add to highlights will appear here.",
  bookmarks: "Tap the bookmark icon at the top of a lesson to save it here.",
  read: "Lessons you start or finish will appear here.",
};

const isTab = (v: string | null): v is LibraryTab => LIBRARY_TABS.some((t) => t.id === v);

export function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab: LibraryTab = isTab(rawTab) ? rawTab : "all";
  const query = params.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: { tab?: LibraryTab; q?: string }) => {
    const t = next.tab ?? tab;
    const q = next.q ?? query;
    setParams({ ...(t !== "all" ? { tab: t } : {}), ...(q ? { q } : {}) }, { replace: true });
  };

  const highlights = useHighlights();
  const items = buildLibrary({ paths: listPaths(), lessons: SAMPLE_LESSONS, highlights, progressOf: readLessonProgress });
  const counts = countByTab(items);
  const shown = filterLibrary(items, tab, query);
  const searching = query.trim().length > 0;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-xl px-[18px] pt-[calc(env(safe-area-inset-top)+18px)] pb-8 font-reading">
        <div className="flex items-start justify-between gap-2">
          <h1 className="font-serif text-[34px] leading-tight font-medium tracking-[-0.01em]">Library</h1>
          <MenuButton className="-mr-2.5" />
        </div>
        <p className="mt-1 text-[15px] text-r-muted">
          {counts.highlights} {counts.highlights === 1 ? "highlight" : "highlights"} · {counts.bookmarks}{" "}
          {counts.bookmarks === 1 ? "bookmark" : "bookmarks"} · {counts.read} {counts.read === 1 ? "lesson" : "lessons"} read
        </p>

        <form role="search" className="relative mt-4" onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur(); }}>
          <label htmlFor="library-search" className="sr-only">
            Search your library
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-r-muted" strokeWidth={2} />
          <input
            ref={inputRef}
            id="library-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search highlights, notes, lessons"
            className="h-12 w-full rounded-[14px] border border-r-border-strong bg-r-card pr-11 pl-11 text-base text-r-text placeholder:text-r-muted focus:border-r-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button
              type="button"
              onClick={() => {
                update({ q: "" });
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-r-muted"
            >
              <X className="size-[18px]" strokeWidth={2} />
            </button>
          )}
        </form>

        <div role="tablist" aria-label="Filter" className="-mx-[18px] mt-3.5 flex gap-2 overflow-x-auto px-[18px] pb-1 [scrollbar-width:none]">
          {LIBRARY_TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="library-list"
                onClick={() => update({ tab: t.id })}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                  on ? "border-r-primary bg-r-primary text-r-on-primary" : "border-r-border bg-r-card text-r-text",
                )}
              >
                {t.label}
                <span className={cn("tabular-nums", on ? "opacity-80" : "text-r-muted")}>{counts[t.id]}</span>
              </button>
            );
          })}
        </div>

        <section id="library-list" role="tabpanel" aria-live="polite" className="mt-4 flex flex-col gap-2.5">
          {shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-r-border-strong px-5 py-8 text-center">
              <p className="font-serif text-lg font-medium">{searching ? `Nothing matches “${query.trim()}”` : "Nothing here yet"}</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm leading-normal text-r-muted">
                {searching ? "Try another word, or switch to All." : EMPTY_HINT[tab]}
              </p>
            </div>
          ) : (
            shown.map((item) => <LibraryItemCard key={item.id} item={item} />)
          )}
        </section>
      </div>
    </main>
  );
}
