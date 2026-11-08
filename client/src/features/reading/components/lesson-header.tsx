import { Check, Clock } from "lucide-react";
import type { LessonView } from "../types";

const chip = "inline-flex items-center gap-1.5 rounded-full border border-r-border bg-r-chip px-2.5 py-1 text-xs text-r-muted";

export function LessonHeader({ lesson, sourceCount }: { lesson: LessonView; sourceCount: number }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-1.5 rounded-full bg-r-primary" />
        <span className="text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
          {lesson.pathTitle} · {lesson.category}
        </span>
      </div>
      <h1 className="mt-2.5 mb-2 font-serif text-[32px] leading-[1.12] font-medium tracking-[-0.01em]">{lesson.title}</h1>
      <p className="text-[15px] leading-normal text-r-muted">{lesson.subtitle}</p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <span className={chip}>
          <Clock className="size-3.5" strokeWidth={2} aria-hidden />
          {lesson.estimatedMinutes} min read
        </span>
        <span className={chip}>{lesson.difficulty}</span>
        <span className={chip}>{sourceCount} sources</span>
      </div>

      {lesson.buildsOn && (
        <div className="mt-4.5 flex items-center gap-3 rounded-[14px] border border-r-border bg-r-card px-3.5 py-3">
          <div
            className={
              lesson.buildsOn.completed
                ? "grid size-[30px] shrink-0 place-items-center rounded-full bg-r-ok-bg text-r-ok"
                : "grid size-[30px] shrink-0 place-items-center rounded-full bg-r-accent-bg text-r-link"
            }
          >
            {lesson.buildsOn.completed ? (
              <Check className="size-4" strokeWidth={2.4} aria-label="Completed" />
            ) : (
              <span className="text-sm font-semibold" aria-hidden>!</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-r-muted">{lesson.buildsOn.completed ? "Builds on" : "Read this first"}</div>
            <div className="text-sm font-medium">{lesson.buildsOn.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}
