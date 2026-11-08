import { Copy, StickyNote } from "lucide-react";
import { HIGHLIGHT_COLORS } from "../lib/highlight-store";
import type { PendingSelection } from "../lib/selection";
import type { HighlightColor } from "../types";

interface SelectionBarProps {
  selection: PendingSelection;
  onHighlight: (color: HighlightColor) => void;
  onNote: () => void;
  onCopy: () => void;
}

/*
 * Appears above the lesson's bottom bar while text is selected. It sits low
 * on purpose: iOS draws its own Copy/Look Up bubble above the selection.
 * onPointerDown preventDefault keeps the selection alive while tapping.
 */
export function SelectionBar({ selection, onHighlight, onNote, onCopy }: SelectionBarProps) {
  const keep = (e: React.PointerEvent) => e.preventDefault();
  if (selection.status !== "ready") {
    return (
      <div role="status" className="mx-auto w-fit rounded-full bg-r-text px-4 py-2 text-[13px] font-medium text-r-bg shadow-lg">
        {selection.status === "multi" ? "Select text within one paragraph to highlight it" : "Part of this is already highlighted"}
      </div>
    );
  }
  return (
    <div role="toolbar" aria-label="Highlight selection" className="mx-auto flex w-fit items-center gap-1 rounded-2xl border border-r-border bg-r-sheet p-1.5 shadow-lg">
      {HIGHLIGHT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onPointerDown={keep}
          onClick={() => onHighlight(c)}
          aria-label={`Highlight ${c}`}
          className="grid size-11 place-items-center rounded-xl"
        >
          <span aria-hidden className="size-6 rounded-full ring-1 ring-black/10" style={{ background: `var(--hl-solid-${c})` }} />
        </button>
      ))}
      <span aria-hidden className="mx-0.5 h-7 w-px bg-r-border" />
      <button type="button" onPointerDown={keep} onClick={onNote} aria-label="Highlight and add a note" className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 text-[10px] font-medium text-r-text">
        <StickyNote className="size-[18px]" strokeWidth={1.8} aria-hidden />
        Note
      </button>
      <button type="button" onPointerDown={keep} onClick={onCopy} aria-label="Copy with citation" className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 text-[10px] font-medium text-r-text">
        <Copy className="size-[18px]" strokeWidth={1.8} aria-hidden />
        Copy
      </button>
    </div>
  );
}
