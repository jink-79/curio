import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import type { PathLesson, SourceRef } from "../types";

interface LessonEndProps {
  pathId: string;
  completed: boolean;
  onToggleComplete: () => void;
  next: (PathLesson & { readable: boolean }) | null;
  sources: SourceRef[];
}

/**
 * The end of a lesson: the one place to finish it and move on, then the
 * attribution the source licences require, kept to a quiet footnote.
 */
export function LessonEnd({ pathId, completed, onToggleComplete, next, sources }: LessonEndProps) {
  return (
    <footer className="mt-12">
      <div aria-hidden className="mx-auto mb-8 w-12 border-t border-r-border-strong" />

      {completed ? (
        <p className="flex items-center justify-center gap-2 text-sm text-r-ok">
          <Check className="size-4" strokeWidth={2.6} aria-hidden />
          Finished
          <button type="button" onClick={onToggleComplete} className="ml-1 rounded px-1 text-r-muted underline underline-offset-2">
            Undo
          </button>
        </p>
      ) : (
        <button
          type="button"
          onClick={onToggleComplete}
          className="mx-auto flex h-12 items-center gap-2 rounded-full border border-r-border-strong px-6 text-[15px] font-medium text-r-text active:bg-r-accent-bg"
        >
          <Check className="size-[18px]" strokeWidth={2.2} aria-hidden />
          Finish lesson
        </button>
      )}

      {next && (
        <Link
          to={next.readable ? `/read/${pathId}/${next.lessonKey}` : `/p/${pathId}`}
          className="mt-8 flex items-center gap-3 rounded-2xl border border-r-border px-4 py-4 text-r-text no-underline active:bg-r-accent-bg"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-r-muted">
              Up next · {next.readable ? `${next.minutes} min` : "not written yet"}
            </span>
            <span className="mt-0.5 block font-serif text-[19px] leading-snug font-medium">{next.title}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-r-muted" strokeWidth={1.8} aria-hidden />
        </Link>
      )}

      {sources.length > 0 && (
        <section aria-label="Sources" className="mt-10 text-xs leading-relaxed text-r-muted">
          <h2 className="mb-1 font-semibold">Sources</h2>
          <ul>
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-r-muted underline underline-offset-2">
                  {s.provider}: {s.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{" "}
                · {s.licence.url ? (
                  <a href={s.licence.url} target="_blank" rel="noopener noreferrer" className="text-r-muted underline underline-offset-2">
                    {s.licence.label}
                  </a>
                ) : (
                  s.licence.label
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </footer>
  );
}
