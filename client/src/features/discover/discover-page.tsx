import { ArrowRight, Search, X } from "lucide-react";
import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { lastPathId } from "@/app/last-path";
import { MenuButton } from "@/app/menu-button";
import { usePreferences } from "@/features/preferences/hooks/use-preferences";
import { interestsFirst } from "@/features/preferences/lib/preferences";
import { usePathProgress } from "@/features/paths/hooks/use-path-progress";
import { SAMPLE_PATHS } from "@/features/reading/data/sample";
import type { Category, PathOutline } from "@/features/reading/types";
import { CategoryIcon } from "./components/category-icon";
import { PathCard } from "./components/path-card";
import { listCategories, listPaths, pathsInCategory } from "./lib/catalog";
import { searchCategories, searchPaths } from "./lib/search";

const sectionTitle = "mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase";

export function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const prefs = usePreferences();
  const categories = interestsFirst(listCategories(), (c) => c.slug, prefs.interests);
  const paths = interestsFirst(listPaths(), (p) => p.categorySlug, prefs.interests);
  const categoryOf = (p: PathOutline) => categories.find((c) => c.slug === p.categorySlug);

  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true });
  const results = searchPaths(query, paths, categories);
  const categoryResults = searchCategories(query, categories);
  const searching = query.trim().length > 0;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-xl px-[18px] pt-[calc(env(safe-area-inset-top)+18px)] pb-8 font-reading">
        <div className="flex items-start justify-between gap-2">
          <h1 className="font-serif text-[34px] leading-tight font-medium tracking-[-0.01em]">Discover</h1>
          <MenuButton className="-mr-2.5" />
        </div>
        <p className="mt-1 text-[15px] text-r-muted">Explore. Learn. Remember.</p>

        <form role="search" className="relative mt-4" onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur(); }}>
          <label htmlFor="discover-search" className="sr-only">
            Search paths and lessons
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-r-muted" strokeWidth={2} />
          <input
            ref={inputRef}
            id="discover-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to learn?"
            className="h-12 w-full rounded-[14px] border border-r-border-strong bg-r-card pr-11 pl-11 text-base text-r-text placeholder:text-r-muted focus:border-r-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-r-muted"
            >
              <X className="size-[18px]" strokeWidth={2} />
            </button>
          )}
        </form>

        {searching ? (
          <section aria-live="polite" className="mt-6">
            {categoryResults.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {categoryResults.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/discover/c/${c.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-r-border bg-r-card px-3.5 py-2 text-[13px] font-medium text-r-text no-underline"
                  >
                    <CategoryIcon icon={c.icon} className="size-4 text-r-link" />
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            <h2 className={sectionTitle}>
              {results.length === 0 ? "No paths found" : `${results.length} ${results.length === 1 ? "path" : "paths"}`}
            </h2>
            {results.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-r-border-strong px-4 py-6 text-center text-sm leading-normal text-r-muted">
                Nothing matches “{query.trim()}”. Try a broader word, or clear the search to browse categories.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {results.map((m) => (
                  <PathCard key={m.path.pathId} path={m.path} category={categoryOf(m.path)} matchedLessons={m.matchedLessons} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <ContinueCard />

            <section className="mt-7">
              <h2 className={sectionTitle}>Categories</h2>
              <ul className="grid grid-cols-2 gap-2.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <CategoryTile category={c} count={pathsInCategory(c.slug).length} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-7">
              <h2 className={sectionTitle}>All paths</h2>
              <div className="flex flex-col gap-2.5">
                {paths.map((p) => (
                  <PathCard key={p.pathId} path={p} category={categoryOf(p)} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function CategoryTile({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      to={`/discover/c/${category.slug}`}
      className="flex h-full min-h-[92px] flex-col justify-between gap-3 rounded-2xl border border-r-border bg-r-card p-3.5 text-r-text no-underline active:bg-r-accent-bg"
    >
      <span aria-hidden className="grid size-9 place-items-center rounded-[10px] bg-r-accent-bg text-r-link">
        <CategoryIcon icon={category.icon} className="size-[18px]" />
      </span>
      <span>
        <span className="block text-sm leading-tight font-semibold">{category.name}</span>
        <span className="mt-0.5 block text-xs text-r-muted">{count === 0 ? "No paths yet" : `${count} ${count === 1 ? "path" : "paths"}`}</span>
      </span>
    </Link>
  );
}

/** "Continue learning": the last path you opened, if it is started and has a readable next lesson. */
function ContinueCard() {
  const path = SAMPLE_PATHS[lastPathId()];
  if (!path) return null;
  return <ContinueCardFor path={path} />;
}

function ContinueCardFor({ path }: { path: PathOutline }) {
  const progress = usePathProgress(path);
  if (!progress.next) return null;
  return (
    <section className="mt-6">
      <h2 className={sectionTitle}>Continue learning</h2>
      <Link
        to={`/read/${path.pathId}/${progress.next.lessonKey}`}
        className="flex items-center gap-3.5 rounded-2xl bg-r-primary p-4 text-r-on-primary no-underline active:bg-r-primary-hover"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase opacity-80">
            {path.title} · {progress.percent}%
          </span>
          <span className="mt-0.5 block truncate text-base font-semibold">{progress.next.title}</span>
          <span className="mt-0.5 block text-xs opacity-80">{progress.next.minutes} min read</span>
        </span>
        <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      </Link>
    </section>
  );
}
