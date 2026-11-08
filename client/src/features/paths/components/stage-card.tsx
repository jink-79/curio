import { Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { SAMPLE_LESSONS } from "@/features/reading/data/sample";
import type { PathOutline } from "@/features/reading/types";
import { cn } from "@/lib/cn";
import { lessonReadPercent } from "../hooks/use-path-progress";
import type { LessonStatus } from "../lib/path-progress";

interface StageCardProps {
  pathId: string;
  stage: PathOutline["stages"][number];
  /** Number of the stage's first lesson within the whole path. */
  firstLessonNumber: number;
  statuses: Record<string, LessonStatus>;
  open: boolean;
  onToggle: () => void;
}

export function StageCard({ pathId, stage, firstLessonNumber, statuses, open, onToggle }: StageCardProps) {
  const total = stage.lessons.length;
  const done = stage.lessons.filter((l) => statuses[l.lessonKey] === "done").length;
  const minutes = stage.lessons.reduce((m, l) => m + l.minutes, 0);
  const active = stage.lessons.some((l) => statuses[l.lessonKey] === "next");
  const complete = done === total;
  const panelId = `stage-${stage.number}-lessons`;

  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-r-card", active ? "border-r-primary/50" : "border-r-border")}>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span
            aria-hidden
            className={cn(
              "grid size-[34px] shrink-0 place-items-center rounded-full text-[13px] font-semibold",
              complete ? "bg-r-ok text-r-on-status" : "text-r-text",
            )}
            style={
              complete
                ? undefined
                : {
                    background: `conic-gradient(var(--r-primary) ${Math.round((done / total) * 360)}deg, var(--r-border) 0)`,
                    boxShadow: "inset 0 0 0 3px var(--r-card)",
                  }
            }
          >
            {complete ? <Check className="size-4" strokeWidth={3} /> : stage.number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold tracking-[0.12em] text-r-muted uppercase">Stage {stage.number}</span>
            <span className="mt-0.5 block font-serif text-[17px] font-medium">{stage.title}</span>
          </span>
          <span className="text-xs whitespace-nowrap text-r-muted tabular-nums">
            {done}/{total} · {minutes}m
          </span>
          <ChevronDown
            aria-hidden
            className={cn("size-[18px] shrink-0 text-r-muted transition-transform duration-150", open && "rotate-180")}
            strokeWidth={2}
          />
        </button>
      </h3>

      {open && (
        <ol id={panelId} className="px-2 pb-2">
          {stage.lessons.map((l, i) => {
            const status = statuses[l.lessonKey] ?? "todo";
            const readable = l.lessonKey in SAMPLE_LESSONS;
            const readPct = status === "next" ? lessonReadPercent(l.lessonKey) : 0;
            const sub =
              status === "done"
                ? "Completed"
                : !readable
                  ? "Not written yet"
                  : status === "next"
                    ? readPct > 0
                      ? `In progress · ${readPct}% read`
                      : "Up next"
                    : l.summary;
            const row = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-[26px] shrink-0 place-items-center rounded-full text-xs font-semibold",
                    status === "done"
                      ? "bg-r-ok text-r-on-status"
                      : status === "next"
                        ? "border-2 border-r-primary text-r-link"
                        : "border border-r-border-strong text-r-muted",
                  )}
                >
                  {status === "done" ? <Check className="size-3.5" strokeWidth={3} /> : firstLessonNumber + i}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", status === "next" ? "font-semibold" : "font-medium", !readable && status !== "done" && "text-r-muted")}>
                    {l.title}
                  </span>
                  <span className={cn("mt-px block truncate text-xs", status === "next" && readable ? "text-r-link" : "text-r-muted")}>{sub}</span>
                </span>
                <span className="text-xs text-r-muted tabular-nums">{l.minutes} min</span>
              </>
            );
            const rowClass = cn(
              "flex min-h-14 items-center gap-3 rounded-xl px-2 py-1.5 no-underline text-r-text",
              status === "next" && "bg-r-accent-bg",
            );
            return (
              <li key={l.lessonKey}>
                {readable ? (
                  <Link to={`/read/${pathId}/${l.lessonKey}`} className={rowClass} aria-current={status === "next" ? "step" : undefined}>
                    {row}
                  </Link>
                ) : (
                  <div className={rowClass}>{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
