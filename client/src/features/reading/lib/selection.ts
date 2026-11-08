import { findRanges } from "./segments";
import { type QuoteSelector, quoteAt } from "./quote";
import type { Highlight } from "../types";

export type PendingSelection =
  | { status: "ready"; blockId: string; quote: QuoteSelector }
  | { status: "overlap" }
  | { status: "multi" };

const isSpace = (c: string | undefined) => c !== undefined && /\s/.test(c);

/**
 * Turn the browser's current text selection inside `root` into a quote on a
 * single lesson paragraph. Returns null when nothing usable is selected,
 * "multi" when it spans paragraphs, and "overlap" when it touches an
 * existing highlight (highlights never overlap).
 */
export function readSelection(root: HTMLElement, highlights: Highlight[]): PendingSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const paraOf = (n: Node) => (n instanceof Element ? n : n.parentElement)?.closest<HTMLElement>("[data-para]") ?? null;
  const startPara = paraOf(range.startContainer);
  const endPara = paraOf(range.endContainer);
  if (!startPara && !endPara) return null;
  if (!startPara || startPara !== endPara) return { status: "multi" };

  const text = startPara.textContent ?? "";
  const pre = document.createRange();
  pre.setStart(startPara, 0);
  pre.setEnd(range.startContainer, range.startOffset);
  let start = pre.toString().length;
  let end = start + range.toString().length;
  while (start < end && isSpace(text[start])) start += 1;
  while (end > start && isSpace(text[end - 1])) end -= 1;
  if (end - start < 2) return null;

  const blockId = startPara.dataset.blockId ?? "";
  const existing = findRanges(text, highlights.filter((h) => h.blockId === blockId));
  if (existing.some((r) => start < r.end && r.start < end)) return { status: "overlap" };

  return { status: "ready", blockId, quote: quoteAt(text, start, end) };
}

export function clearSelection(): void {
  window.getSelection()?.removeAllRanges();
}
