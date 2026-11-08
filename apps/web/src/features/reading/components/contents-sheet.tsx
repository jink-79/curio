import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import type { PathOutline } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface ContentsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: PathOutline;
  currentLessonKey: string;
  currentCompleted: boolean;
}

export function ContentsSheet({ open, onOpenChange, path, currentLessonKey, currentCompleted }: ContentsSheetProps) {
  const lessons = path.stages.flatMap((s) => s.lessons);
  const done = lessons.filter((l) => l.status === "done" || (l.lessonKey === currentLessonKey && currentCompleted)).length;
  let n = 0;
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
              n += 1;
              const current = l.lessonKey === currentLessonKey;
              const status = current && currentCompleted ? "done" : l.status;
              return (
                <li
                  key={l.lessonKey}
                  aria-current={current ? "step" : undefined}
                  className={cn("-mx-2.5 flex min-h-12 items-center gap-3 rounded-xl px-2.5", current && "bg-r-accent-bg")}
                >
                  <span
                    className={cn(
                      "grid size-6.5 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      status === "done"
                        ? "bg-r-ok text-r-on-status"
                        : current
                          ? "border-2 border-brand text-r-link"
                          : "border border-r-border-strong text-r-muted",
                    )}
                  >
                    {status === "done" ? <Check className="size-3.5" strokeWidth={3} aria-label="Completed" /> : n}
                  </span>
                  <span className={cn("flex-1 text-sm", current ? "font-semibold" : "font-normal")}>{l.title}</span>
                  <span className="text-xs text-r-muted">{l.minutes} min</span>
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
