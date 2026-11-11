import { Check, ChevronLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CategoryIcon } from "@/features/discover/components/category-icon";
import { listCategories } from "@/features/discover/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "./hooks/use-preferences";
import { ARTICLE_LENGTHS, updatePreferences } from "./lib/preferences";

const sectionTitle = "text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase";

/** Preferences: saved as soon as they change (no Save button). */
export function PreferencesPage() {
  const prefs = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = listCategories();
  // Arriving from the menu, put focus on the page title so screen readers announce the new screen.
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);

  const toggleInterest = (slug: string) =>
    updatePreferences({ interests: prefs.interests.includes(slug) ? prefs.interests.filter((s) => s !== slug) : [...prefs.interests, slug] });

  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center gap-1 bg-r-bg px-1.5 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={() => (location.key !== "default" ? navigate(-1) : navigate("/discover"))}
          aria-label="Back"
          className="grid size-11 place-items-center rounded-xl text-r-text"
        >
          <ChevronLeft className="size-[22px]" strokeWidth={1.8} />
        </button>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-xl px-[18px] pt-1 pb-10 font-reading">
          <h1 ref={titleRef} tabIndex={-1} className="font-serif text-[34px] leading-tight font-medium tracking-[-0.01em] outline-none">
            Preferences
          </h1>
          <p className="mt-1 text-[15px] text-r-muted">Saved as you change them.</p>

          {/* Article length */}
          <section className="mt-7" aria-labelledby="length-title">
            <h2 id="length-title" className={sectionTitle}>
              Article length
            </h2>
            <p className="mt-1.5 mb-3 text-[13px] leading-normal text-r-muted">
              How long lessons should be when CURIO writes or picks them for you. Optional. Lessons already written keep their length.
            </p>
            <div role="radiogroup" aria-labelledby="length-title" className="overflow-hidden rounded-2xl border border-r-border bg-r-card">
              {ARTICLE_LENGTHS.map((a, i) => {
                const on = prefs.articleLength === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => updatePreferences({ articleLength: a.id })}
                    className={cn("flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left active:bg-r-accent-bg", i > 0 && "border-t border-r-border")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{a.label}</span>
                      {a.words && (
                        <span className="mt-0.5 block text-xs text-r-muted tabular-nums">
                          About {a.words.toLocaleString("en")} words · {a.minutes} min read
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className={cn("grid size-5.5 shrink-0 place-items-center rounded-full", on ? "bg-r-primary text-r-on-primary" : "border border-r-border-strong")}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Interests */}
          <section className="mt-8" aria-labelledby="topics-title">
            <h2 id="topics-title" className={sectionTitle}>
              Topics you care about
            </h2>
            <p className="mt-1.5 mb-3 text-[13px] leading-normal text-r-muted">Shown first in Discover. Optional.</p>
            <div role="group" aria-labelledby="topics-title" className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = prefs.interests.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleInterest(c.slug)}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                      on ? "border-r-primary bg-r-primary text-r-on-primary" : "border-r-border bg-r-card text-r-text",
                    )}
                  >
                    <CategoryIcon icon={c.icon} className="size-4" />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Reading */}
          <section className="mt-8" aria-labelledby="reading-title">
            <h2 id="reading-title" className={sectionTitle}>
              Reading
            </h2>
            <div className="mt-3 rounded-2xl border border-r-border bg-r-card">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.autoComplete}
                onClick={() => updatePreferences({ autoComplete: !prefs.autoComplete })}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">Mark lessons complete automatically</span>
                  <span className="mt-0.5 block text-xs leading-normal text-r-muted">
                    When you reach the end after reading for a while. Off: only Mark complete counts.
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn("relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors duration-150", prefs.autoComplete ? "bg-r-primary" : "bg-r-border-strong")}
                >
                  <span
                    className={cn(
                      "absolute top-[3px] left-[3px] size-6 rounded-full bg-white shadow transition-transform duration-150",
                      prefs.autoComplete && "translate-x-5",
                    )}
                  />
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
