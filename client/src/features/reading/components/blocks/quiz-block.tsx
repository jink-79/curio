import { useState } from "react";
import { cn } from "@/lib/cn";
import type { QuizQuestion } from "../../types";

/** Lesson knowledge check. One attempt per question per visit; answers are not stored yet. */
export function QuizBlock({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <section className="mt-3.5 rounded-2xl border border-r-border bg-r-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">Knowledge check</h2>
        <span className="text-[11px] text-r-muted">
          {Object.keys(answers).length} of {questions.length}
        </span>
      </div>
      {questions.map((q) => {
        const picked = answers[q.id];
        const answered = picked !== undefined;
        const correct = picked === q.correctOptionId;
        return (
          <fieldset key={q.id} className="mt-2.5">
            <legend className="mb-3 text-base leading-snug font-medium">{q.prompt}</legend>
            <div className="flex flex-col gap-2">
              {q.options.map((o, i) => {
                const isRight = answered && o.id === q.correctOptionId;
                const isWrongPick = answered && o.id === picked && !correct;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={answered}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm leading-[1.4] text-r-text disabled:cursor-default",
                      isRight ? "border-r-ok bg-r-ok-bg" : isWrongPick ? "border-r-bad" : "border-r-border-strong",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-[7px] border text-xs font-semibold",
                        isRight
                          ? "border-r-ok bg-r-ok text-r-on-status"
                          : isWrongPick
                            ? "border-r-bad bg-r-bad text-r-on-status"
                            : "border-r-border-strong text-r-muted",
                      )}
                    >
                      {isRight ? "✓" : isWrongPick ? "✕" : String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{o.text}</span>
                    {isRight && <span className="sr-only">(correct answer)</span>}
                    {isWrongPick && <span className="sr-only">(your answer, incorrect)</span>}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p role="status" className="mt-3 text-[13px] leading-normal text-r-muted">
                <strong className={correct ? "text-r-ok" : "text-r-bad"}>{correct ? "Correct." : "Not quite."}</strong>{" "}
                {q.explanation}
              </p>
            )}
          </fieldset>
        );
      })}
    </section>
  );
}
