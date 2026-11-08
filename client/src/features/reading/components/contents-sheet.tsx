import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import type { LessonStatus } from "@/features/paths/lib/path-progress";
import { cn } from "@/lib/cn";
import { SAMPLE_LESSONS } from "../data/sample";
import type { PathOutline } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface ContentsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: PathOutline;
  currentLessonKey: string;
  /** Live completion of the lesson on screen (stored statuses lag until it re-reads). */
  currentCompleted: boolean;
  statuses: Record<string, LessonStatus>;
}

export function ContentsSheet({ open, onOpenChange, path, currentLessonKey, currentCompleted, statuses }: ContentsSheetProps) {
  const lessons = path.stages.flatMap((s) => s.lessons);
  const isDone = (key: string) => (key === currentLessonKey ? currentCompleted : statuses[key] === "done");
  const done = lessons.filter((l) => isDone(l.lessonKey)).length;
  const numberOf = new Map(lessons.map((l, i) => [l.lessonKey, i + 1]));
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Contents">
      <p className="mb-1.5 text-[13px] text-r-muted">
        {path.title} · {done} of {lessons.length} complete
      </p>
      {path.stages.map((stage) => (
        <section key={stage.number}>
          <h3 className="mt-3.5 mb-1 text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
            Stage {stage.number} · {stage.title}
          </h3>
          <ol>
            {stage.lessons.map((l) => {
              const current = l.lessonKey === currentLessonKey;
              const finished = isDone(l.lessonKey);
              const readable = l.lessonKey in SAMPLE_LESSONS;
              const body = (
                <>
                  <span
                    className={cn(
                      "grid size-6.5 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      finished
                        ? "bg-r-ok text-r-on-status"
                        : current
                          ? "border-2 border-r-primary text-r-link"
                          : "border border-r-border-strong text-r-muted",
                    )}
                  >
                    {finished ? <Check className="size-3.5" strokeWidth={3} aria-label="Completed" /> : numberOf.get(l.lessonKey)}
                  </span>
                  <span className={cn("flex-1 text-sm", current ? "font-semibold" : "font-normal", !readable && !finished && "text-r-muted")}>
                    {l.title}
                  </span>
                  <span className="text-xs text-r-muted">{l.minutes} min</span>
                </>
              );
              const rowClass = cn("-mx-2.5 flex min-h-12 items-center gap-3 rounded-xl px-2.5 text-r-text no-underline", current && "bg-r-accent-bg");
              return (
                <li key={l.lessonKey} aria-current={current ? "step" : undefined}>
                  {readable && !current ? (
                    <Link to={`/read/${path.pathId}/${l.lessonKey}`} className={rowClass} onClick={() => onOpenChange(false)}>
                      {body}
                    </Link>
                  ) : (
                    <div className={rowClass}>{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <Link
        to={`/p/${path.pathId}`}
        className="mt-3.5 block rounded-xl border border-r-border-strong p-3 text-center text-sm font-medium text-r-text no-underline"
      >
        Open path overview
      </Link>
    </BottomSheet>
  );
}
