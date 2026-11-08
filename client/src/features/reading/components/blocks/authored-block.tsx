import { Fragment, type CSSProperties } from "react";
import { applyHighlights, parseInline, type Segment, splitParagraphs } from "../../lib/segments";
import type { Highlight } from "../../types";
import { SectionHeading } from "../section-heading";

interface AuthoredBlockProps {
  heading?: string;
  markdown: string;
  highlights: Highlight[];
  openHighlightId: string | null;
  onToggleHighlight: (id: string) => void;
  textStyle: CSSProperties;
}

/** Consecutive runs belonging to the same highlight become one tappable group. */
function group(segments: Segment[]): { highlightId?: string; parts: Segment[] }[] {
  const groups: { highlightId?: string; parts: Segment[] }[] = [];
  for (const s of segments) {
    const last = groups[groups.length - 1];
    if (last && last.highlightId === s.highlightId) last.parts.push(s);
    else groups.push(s.highlightId ? { highlightId: s.highlightId, parts: [s] } : { parts: [s] });
  }
  return groups;
}

function Run({ s }: { s: Segment }) {
  if (s.strong) return <strong className="font-semibold">{s.text}</strong>;
  if (s.em) return <em>{s.text}</em>;
  return <>{s.text}</>;
}

export function AuthoredBlock({ heading, markdown, highlights, openHighlightId, onToggleHighlight, textStyle }: AuthoredBlockProps) {
  return (
    <section>
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {splitParagraphs(markdown).map((paragraph, pi) => {
        const groups = group(applyHighlights(parseInline(paragraph), highlights));
        const openHere = groups.find((g) => g.highlightId !== undefined && g.highlightId === openHighlightId);
        const openNote = openHere ? highlights.find((h) => h.id === openHere.highlightId)?.note : undefined;
        return (
          <Fragment key={pi}>
            <p className="mb-4" style={textStyle}>
              {groups.map((g, gi) =>
                g.highlightId ? (
                  // A <button> is always laid out as an inline-block box and would break the
                  // paragraph, so the tappable highlight is an inline link acting as a button.
                  <a
                    key={gi}
                    href={`#note-${g.highlightId}`}
                    role="button"
                    aria-expanded={openHighlightId === g.highlightId}
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleHighlight(g.highlightId as string);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                        onToggleHighlight(g.highlightId as string);
                      }
                    }}
                    className="rounded-[3px] bg-r-highlight px-0.5 no-underline [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                  >
                    {g.parts.map((s, si) => (
                      <Run key={si} s={s} />
                    ))}
                  </a>
                ) : (
                  g.parts.map((s, si) => <Run key={`${gi}-${si}`} s={s} />)
                ),
              )}
            </p>
            {openHere && (
              <div id={`note-${openHere.highlightId}`} className="-mt-1 mb-4 rounded-xl border border-r-border bg-r-card px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-r-muted uppercase">
                  <span aria-hidden className="size-2 rounded-[2px] bg-r-primary" />
                  {openNote ? "Your note" : "Highlight"}
                </div>
                <p className="mt-1.5 text-sm leading-normal">{openNote ?? "No note yet."}</p>
              </div>
            )}
          </Fragment>
        );
      })}
    </section>
  );
}
