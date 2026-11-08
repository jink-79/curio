import { Fragment, type CSSProperties } from "react";
import { applyHighlights, parseInline, type Segment, splitParagraphs } from "../../lib/segments";
import type { Highlight } from "../../types";
import { SectionHeading } from "../section-heading";

interface AuthoredBlockProps {
  blockId: string;
  heading?: string;
  markdown: string;
  highlights: Highlight[];
  openHighlightId: string | null;
  onToggleHighlight: (id: string) => void;
  onEditHighlight: (id: string) => void;
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

export function AuthoredBlock(props: AuthoredBlockProps) {
  const { blockId, heading, markdown, highlights, openHighlightId, onToggleHighlight, onEditHighlight, textStyle } = props;
  return (
    <section>
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {splitParagraphs(markdown).map((paragraph, pi) => {
        const groups = group(applyHighlights(parseInline(paragraph), highlights));
        const openHere = groups.find((g) => g.highlightId !== undefined && g.highlightId === openHighlightId);
        const open = openHere ? highlights.find((h) => h.id === openHere.highlightId) : undefined;
        return (
          <Fragment key={pi}>
            {/* data-para: the selection logic maps a text selection to this paragraph's plain text. */}
            <p className="mb-4" style={textStyle} data-para="" data-block-id={blockId}>
              {groups.map((g, gi) => {
                if (!g.highlightId) return g.parts.map((s, si) => <Run key={`${gi}-${si}`} s={s} />);
                const h = highlights.find((x) => x.id === g.highlightId);
                return (
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
                    className="rounded-[3px] px-0.5 no-underline [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                    style={{ background: `var(--hl-${h?.color ?? "blue"})` }}
                  >
                    {g.parts.map((s, si) => (
                      <Run key={si} s={s} />
                    ))}
                  </a>
                );
              })}
            </p>
            {open && (
              <div id={`note-${open.id}`} className="-mt-1 mb-4 rounded-xl border border-r-border bg-r-card px-3.5 py-3 font-reading">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-r-muted uppercase">
                  <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: `var(--hl-solid-${open.color})` }} />
                  {open.note ? "Your note" : "Highlight"}
                </div>
                {open.note ? (
                  <p className="mt-1.5 text-sm leading-normal whitespace-pre-line">{open.note}</p>
                ) : (
                  <p className="mt-1.5 text-sm text-r-muted">No note yet.</p>
                )}
                <button
                  type="button"
                  onClick={() => onEditHighlight(open.id)}
                  className="mt-2 -ml-1 rounded-lg px-1 py-1 text-[13px] font-semibold text-r-link"
                >
                  {open.note ? "Edit note or colour" : "Add a note"}
                </button>
              </div>
            )}
          </Fragment>
        );
      })}
    </section>
  );
}
