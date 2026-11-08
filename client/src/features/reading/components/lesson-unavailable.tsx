import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

/** Shown for lessons that exist in a path's outline but have no written content yet, or unknown links. */
export function LessonUnavailable({ pathId, title }: { pathId: string | null; title?: string | undefined }) {
  const back = pathId ? `/p/${pathId}` : "/";
  return (
    <div className="fixed inset-0 flex flex-col bg-r-bg text-r-text">
      <header className="flex h-[52px] shrink-0 items-center px-1.5 pt-[env(safe-area-inset-top)]">
        <Link to={back} aria-label="Back to path" className="grid size-11 place-items-center rounded-xl text-r-text">
          <ChevronLeft className="size-[22px]" strokeWidth={1.8} />
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-24 text-center font-reading">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">{title ? "Not written yet" : "Lesson not found"}</p>
        <h1 className="font-serif text-[26px] leading-tight font-medium">{title ?? "This lesson doesn’t exist"}</h1>
        <p className="max-w-xs text-sm leading-normal text-r-muted">
          {title ? "This lesson is part of the path, but its content hasn’t been written yet." : "The link may be out of date."}
        </p>
        <Link to={back} className="mt-3 rounded-xl bg-r-primary px-5 py-3 text-sm font-semibold text-r-on-primary no-underline">
          Back to the path
        </Link>
      </main>
    </div>
  );
}
