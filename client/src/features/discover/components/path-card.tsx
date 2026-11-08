import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePathProgress } from "@/features/paths/hooks/use-path-progress";
import { formatMinutes } from "@/features/paths/lib/path-progress";
import type { Category, PathOutline } from "@/features/reading/types";
import { pathStats } from "../lib/catalog";
import { CategoryIcon } from "./category-icon";

interface PathCardProps {
  path: PathOutline;
  category: Category | undefined;
  /** Lesson titles that matched a search, shown under the description. */
  matchedLessons?: string[];
}

/** One path in a list. The whole card is a single link. */
export function PathCard({ path, category, matchedLessons }: PathCardProps) {
  const stats = pathStats(path);
  const progress = usePathProgress(path);
  const started = progress.percent > 0;

  return (
    <Link
      to={`/p/${path.pathId}`}
      className="block rounded-2xl border border-r-border bg-r-card p-4 text-r-text no-underline active:bg-r-accent-bg"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-r-accent-bg text-r-link">
          {category ? <CategoryIcon icon={category.icon} className="size-5" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-r-muted uppercase">
            {category?.name ?? "Path"} · {path.difficulty}
          </div>
          <h3 className="mt-0.5 font-serif text-[19px] leading-snug font-medium">{path.title}</h3>
        </div>
        <ChevronRight aria-hidden className="mt-2.5 size-[18px] shrink-0 text-r-muted" strokeWidth={2} />
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-normal text-r-muted">{path.description}</p>
      {matchedLessons && matchedLessons.length > 0 && (
        <p className="mt-1.5 truncate text-xs text-r-link">Includes: {matchedLessons.join(" · ")}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-r-muted tabular-nums">
        <span>{stats.lessons} lessons</span>
        <span aria-hidden>·</span>
        <span>{formatMinutes(stats.minutes)}</span>
        {stats.written < stats.lessons && (
          <>
            <span aria-hidden>·</span>
            <span>
              {stats.written === 0 ? "No lessons written yet" : `${stats.written} of ${stats.lessons} written`}
            </span>
          </>
        )}
      </div>
      {started && (
        <div className="mt-3 flex items-center gap-2.5">
          <div
            role="progressbar"
            aria-label={`${path.title} progress`}
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-r-border"
          >
            <div className="h-full rounded-full bg-r-primary" style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="text-xs font-medium text-r-muted tabular-nums">{progress.percent}%</span>
        </div>
      )}
    </Link>
  );
}
