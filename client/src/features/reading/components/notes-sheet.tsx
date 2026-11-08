import type { Highlight } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface NotesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlights: Highlight[];
  orphaned: Highlight[];
}

export function NotesSheet({ open, onOpenChange, highlights, orphaned }: NotesSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Notes & highlights">
      <div className="flex flex-col gap-2.5">
        {highlights.length === 0 && <p className="py-6 text-center text-sm text-r-muted">No highlights in this lesson yet.</p>}
        {highlights.map((h) => (
          <article key={h.id} className="rounded-[14px] border border-r-border bg-r-card p-3.5">
            <blockquote className="border-l-[3px] border-r-primary pl-2.5 font-serif text-[15px] leading-normal">{h.exact}</blockquote>
            {h.note && <p className="mt-2.5 text-sm leading-normal">{h.note}</p>}
            {orphaned.some((o) => o.id === h.id) && (
              <p className="mt-2 text-xs text-r-muted">The lesson text changed — this quote is kept here but no longer marked in the lesson.</p>
            )}
          </article>
        ))}
        <p className="text-xs leading-normal text-r-muted">Notes and highlights are private to you.</p>
      </div>
    </BottomSheet>
  );
}
