import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { HIGHLIGHT_COLORS, NOTE_MAX } from "../lib/highlight-store";
import type { Highlight, HighlightColor } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface NoteSheetProps {
  highlight: Highlight | null;
  onClose: () => void;
  onSave: (id: string, patch: { color: HighlightColor; note: string }) => void;
  onDelete: (id: string) => void;
}

/** Edit a highlight's note and colour, or delete it. */
export function NoteSheet({ highlight, onClose, onSave, onDelete }: NoteSheetProps) {
  return (
    <BottomSheet open={highlight !== null} onOpenChange={(o) => !o && onClose()} title={highlight?.note ? "Edit note" : "Add a note"}>
      {highlight && <NoteForm key={highlight.id} highlight={highlight} onClose={onClose} onSave={onSave} onDelete={onDelete} />}
    </BottomSheet>
  );
}

function NoteForm({ highlight, onClose, onSave, onDelete }: NoteSheetProps & { highlight: Highlight }) {
  const [note, setNote] = useState(highlight.note ?? "");
  const [color, setColor] = useState<HighlightColor>(highlight.color);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(highlight.id, { color, note });
        onClose();
      }}
      className="flex flex-col gap-4"
    >
      <blockquote className="max-h-28 overflow-y-auto rounded-r-lg border-l-[3px] pl-3 font-serif text-[15px] leading-normal" style={{ borderColor: `var(--hl-solid-${color})` }}>
        {highlight.exact}
      </blockquote>

      <div>
        <label htmlFor="note-text" className="mb-2 flex justify-between text-xs text-r-muted">
          <span>Note</span>
          <span className="tabular-nums">
            {note.length}/{NOTE_MAX}
          </span>
        </label>
        <textarea
          id="note-text"
          value={note}
          maxLength={NOTE_MAX}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="What do you want to remember about this?"
          className="w-full resize-none rounded-xl border border-r-border-strong bg-r-card px-3.5 py-3 text-base leading-normal text-r-text placeholder:text-r-muted focus:border-r-primary focus:outline-none"
        />
      </div>

      <div>
        <div id="color-label" className="mb-2 text-xs text-r-muted">
          Colour
        </div>
        <div role="radiogroup" aria-labelledby="color-label" className="flex gap-2">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className={cn("grid size-11 place-items-center rounded-full", color === c && "ring-2 ring-r-primary ring-offset-2 ring-offset-r-sheet")}
            >
              <span aria-hidden className="grid size-8 place-items-center rounded-full text-[#183349]" style={{ background: `var(--hl-solid-${c})` }}>
                {color === c && <Check className="size-4" strokeWidth={3} />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => (confirmDelete ? (onDelete(highlight.id), onClose()) : setConfirmDelete(true))}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold",
            confirmDelete ? "border-r-bad bg-r-bad text-r-on-status" : "border-r-border-strong text-r-bad",
          )}
        >
          <Trash2 className="size-4" strokeWidth={2} aria-hidden />
          {confirmDelete ? "Tap again to delete" : "Delete"}
        </button>
        <button type="submit" className="h-12 flex-1 rounded-xl bg-r-primary text-[15px] font-semibold text-r-on-primary active:bg-r-primary-hover">
          Save
        </button>
      </div>
    </form>
  );
}
