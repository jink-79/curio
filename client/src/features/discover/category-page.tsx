import { ChevronLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CategoryIcon } from "./components/category-icon";
import { PathCard } from "./components/path-card";
import { getCategory, pathsInCategory } from "./lib/catalog";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const category = getCategory(slug);
  if (!category) return <Navigate to="/discover" replace />;
  const paths = pathsInCategory(category.slug);

  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center gap-1 bg-r-bg px-1.5 pt-[env(safe-area-inset-top)]">
        <Link to="/discover" aria-label="Back to Discover" className="grid size-11 place-items-center rounded-xl text-r-text">
          <ChevronLeft className="size-[22px]" strokeWidth={1.8} />
        </Link>
        <span className="text-[13px] font-medium text-r-muted">Discover</span>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-xl px-[18px] pt-2 pb-8 font-reading">
          <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-r-accent-bg text-r-link">
            <CategoryIcon icon={category.icon} className="size-6" />
          </span>
          <h1 className="mt-3 font-serif text-[32px] leading-tight font-medium tracking-[-0.01em]">{category.name}</h1>
          <p className="mt-1.5 text-[15px] leading-normal text-r-muted">{category.description}</p>

          <h2 className="mt-7 mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
            {paths.length === 0 ? "Paths" : `${paths.length} ${paths.length === 1 ? "path" : "paths"}`}
          </h2>
          {paths.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-r-border-strong px-4 py-8 text-center">
              <p className="font-serif text-lg font-medium">No paths in {category.name} yet</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm leading-normal text-r-muted">
                Paths you and others create will appear here.
              </p>
              <Link to="/discover" className="mt-4 inline-block rounded-xl border border-r-border-strong px-4 py-2.5 text-sm font-medium text-r-text no-underline">
                Browse all paths
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {paths.map((p) => (
                <PathCard key={p.pathId} path={p} category={category} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
