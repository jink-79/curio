import type { Highlight } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface NotesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlights: Highlight[];
  orphaned: Highlight[];
  onSelect: (highlight: Highlight) => void;
}

/** This lesson's highlights and notes; tapping one opens it for editing. */
export function NotesSheet({ open, onOpenChange, highlights, orphaned, onSelect }: NotesSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Notes & highlights">
      <div className="flex flex-col gap-2.5">
        {highlights.length === 0 && (
          <p className="py-6 text-center text-sm leading-normal text-r-muted">
            No highlights yet. Select any text in the lesson to highlight it or add a note.
          </p>
        )}
        {highlights.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => onSelect(h)}
            className="rounded-[14px] border border-r-border bg-r-card p-3.5 text-left"
          >
            <blockquote className="border-l-[3px] pl-2.5 font-serif text-[15px] leading-normal" style={{ borderColor: `var(--hl-solid-${h.color})` }}>
              {h.exact}
            </blockquote>
            {h.note && <p className="mt-2.5 text-sm leading-normal whitespace-pre-line">{h.note}</p>}
            {orphaned.some((o) => o.id === h.id) && (
              <p className="mt-2 text-xs text-r-muted">The lesson text changed — this quote is kept here but no longer marked in the lesson.</p>
            )}
          </button>
        ))}
        <p className="text-xs leading-normal text-r-muted">Notes and highlights are private to you.</p>
      </div>
    </BottomSheet>
  );
}
