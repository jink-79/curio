import { ArrowRight, Check, ChevronDown, Share } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { SAMPLE_PATHS } from "@/features/reading/data/sample";
import type { PathOutline } from "@/features/reading/types";
import { cn } from "@/lib/cn";
import { StageCard } from "./components/stage-card";
import { lessonReadPercent, usePathProgress } from "./hooks/use-path-progress";
import { formatMinutes } from "./lib/path-progress";

export function PathOverviewPage() {
  const { pathId = "" } = useParams();
  const path = SAMPLE_PATHS[pathId];
  if (!path) return <Navigate to="/" replace />;
  return <PathOverview path={path} />;
}

function CurioMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-7" role="img" aria-label="CURIO">
      <rect width="64" height="64" rx="14" fill="#080D12" />
      <g transform="translate(-2 2)">
        <path d="M47.5 27.9 A16 16 0 1 1 36.1 16.5" fill="none" stroke="#4C7FF5" strokeWidth="8" strokeLinecap="round" />
        <circle cx="47" cy="17" r="5" fill="#4C7FF5" />
      </g>
    </svg>
  );
}

function PathOverview({ path }: { path: PathOutline }) {
  const progress = usePathProgress(path);
  const totalMinutes = path.stages.flatMap((s) => s.lessons).reduce((m, l) => m + l.minutes, 0);
  const nextStage = progress.next?.stageNumber;
  const [openStages, setOpenStages] = useState<Set<number>>(() => new Set(nextStage ? [nextStage] : [1]));
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [shareNote, setShareNote] = useState("");

  const share = async () => {
    const url = `${window.location.origin}/p/${path.pathId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${path.title} · CURIO`, text: path.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
    } catch (err) {
      if ((err as Error).name !== "AbortError") setShareNote("Couldn’t share — copy the address instead");
    }
    window.setTimeout(() => setShareNote(""), 2500);
  };

  // Number of each stage's first lesson within the whole path (1-based).
  const stageStarts = path.stages.map((_, i) => 1 + path.stages.slice(0, i).reduce((n, s) => n + s.lessons.length, 0));

  const readPct = progress.next ? lessonReadPercent(progress.next.lessonKey) : 0;

  return (
    <div className="fixed inset-0 flex flex-col bg-r-bg text-r-text">
      <header className="flex h-[52px] shrink-0 items-center justify-between bg-r-bg px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2">
          <CurioMark />
          <span className="font-display text-[15px] font-semibold tracking-[0.08em]">CURIO</span>
        </div>
        <button type="button" onClick={share} aria-label="Share path" className="-mr-2.5 grid size-11 place-items-center rounded-xl text-r-text">
          <Share className="size-5" strokeWidth={1.8} />
        </button>
      </header>
      <p role="status" aria-live="polite" className="sr-only">
        {shareNote}
      </p>
      {shareNote && (
        <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+60px)] z-30 flex justify-center">
          <span className="rounded-full bg-r-text px-3.5 py-1.5 text-xs font-medium text-r-bg">{shareNote}</span>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-xl px-[18px] pt-2 pb-8 font-reading">
          {/* hero */}
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-r-primary" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
              {path.category} · {path.difficulty}
            </span>
          </div>
          <h1 className="mt-2.5 mb-2 font-serif text-[34px] leading-[1.08] font-medium tracking-[-0.01em]">{path.title}</h1>
          <p className="text-[15px] leading-normal text-r-muted">{path.description}</p>

          {/* progress */}
          <section aria-label="Your progress" className="mt-5 rounded-2xl border border-r-border bg-r-card p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-r-muted uppercase">Your progress</div>
                <div className="mt-1 font-serif text-[34px] leading-none font-medium tabular-nums">{progress.percent}%</div>
              </div>
              <div className="pb-1 text-right text-[13px] text-r-muted">
                <span className="font-semibold text-r-text">{progress.doneCount}</span> of {progress.total} lessons
                <div className="mt-0.5 text-xs">{formatMinutes(progress.minutesLeft)} left</div>
              </div>
            </div>
            <div
              role="progressbar"
              aria-label="Path progress"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-r-border"
            >
              <div className="h-full rounded-full bg-r-primary" style={{ width: `${progress.percent}%` }} />
            </div>

            {progress.next ? (
              <Link
                to={`/read/${path.pathId}/${progress.next.lessonKey}`}
                className="mt-3.5 flex min-h-[52px] items-center gap-3 rounded-[14px] bg-r-primary px-4 py-2 text-r-on-primary no-underline active:bg-r-primary-hover"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase opacity-80">
                    {readPct > 0 ? "Continue" : "Start"} · {progress.next.minutes} min
                  </span>
                  <span className="block truncate text-[15px] font-semibold">{progress.next.title}</span>
                </span>
                <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
              </Link>
            ) : (
              <p className="mt-3.5 flex items-center gap-2 rounded-[14px] bg-r-ok-bg px-4 py-3 text-sm text-r-ok">
                <Check className="size-4" strokeWidth={2.4} aria-hidden />
                You’ve read every lesson written so far.
              </p>
            )}
          </section>

          {/* stats */}
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Lessons", value: String(progress.total) },
              { label: "Total time", value: formatMinutes(totalMinutes) },
              { label: "Level", value: path.difficulty },
            ].map((s) => (
              <div key={s.label} className="min-w-0 rounded-xl border border-r-border bg-r-card px-2 py-2.5 text-center">
                <dt className="text-[10px] font-semibold tracking-[0.1em] text-r-muted uppercase">{s.label}</dt>
                <dd className="mt-1 truncate text-[15px] font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>

          {/* objectives */}
          <section className="mt-3 rounded-2xl border border-r-border bg-r-card">
            <h2>
              <button
                type="button"
                onClick={() => setObjectivesOpen((o) => !o)}
                aria-expanded={objectivesOpen}
                aria-controls="objectives"
                className="flex min-h-[52px] w-full items-center gap-2.5 px-4 py-2.5 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold tracking-[0.12em] text-r-muted uppercase">What you’ll learn</span>
                  <span className={cn("mt-0.5 block text-sm", !objectivesOpen && "truncate")}>
                    {objectivesOpen ? `${path.objectives.length} objectives` : path.objectives[0]}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn("size-[18px] shrink-0 text-r-muted transition-transform duration-150", objectivesOpen && "rotate-180")}
                  strokeWidth={2}
                />
              </button>
            </h2>
            {objectivesOpen && (
              <ul id="objectives" className="flex flex-col gap-2.5 px-4 pb-4">
                {path.objectives.map((o) => (
                  <li key={o} className="flex gap-2.5 text-sm leading-normal">
                    <Check className="mt-[3px] size-4 shrink-0 text-r-primary" strokeWidth={2.4} aria-hidden />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* curriculum */}
          <div className="mt-7 mb-2.5 flex items-baseline justify-between">
            <h2 className="font-serif text-[22px] font-medium">Curriculum</h2>
            <span className="text-xs text-r-muted">
              {path.stages.length} stages · {progress.total} lessons
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {path.stages.map((stage, i) => (
              <StageCard
                key={stage.number}
                pathId={path.pathId}
                stage={stage}
                firstLessonNumber={stageStarts[i] ?? 1}
                statuses={progress.statuses}
                open={openStages.has(stage.number)}
                onToggle={() =>
                  setOpenStages((cur) => {
                    const next = new Set(cur);
                    if (next.has(stage.number)) next.delete(stage.number);
                    else next.add(stage.number);
                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
