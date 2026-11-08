import type { Highlight } from "../types";

/**
 * Authored lesson text is a tiny, safe Markdown subset:
 *   - paragraphs separated by a blank line
 *   - *emphasis* and **strong**
 * Nothing else is interpreted, and output is plain data rendered as React
 * text nodes, so authored content can never inject HTML.
 */

export interface Segment {
  text: string;
  em: boolean;
  strong: boolean;
  /** Set when this run of text is inside a user highlight. */
  highlightId?: string;
}

export function splitParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p.length > 0);
}

/** Tokenise one paragraph into styled runs. Unmatched markers stay literal. */
export function parseInline(paragraph: string): Segment[] {
  const out: Segment[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  for (let m = re.exec(paragraph); m !== null; m = re.exec(paragraph)) {
    if (m.index > last) out.push({ text: paragraph.slice(last, m.index), em: false, strong: false });
    if (m[1] !== undefined) out.push({ text: m[1], em: false, strong: true });
    else if (m[2] !== undefined) out.push({ text: m[2], em: true, strong: false });
    last = m.index + m[0].length;
  }
  if (last < paragraph.length) out.push({ text: paragraph.slice(last), em: false, strong: false });
  return out;
}

interface Range {
  start: number;
  end: number;
  id: string;
}

/**
 * Locate each highlight's quoted text in the paragraph's plain text. A quote
 * that is not found (the text changed) is simply not drawn here; the caller
 * reports it as orphaned instead of losing it.
 */
export function findRanges(plain: string, highlights: Highlight[]): Range[] {
  const ranges: Range[] = [];
  for (const h of highlights) {
    if (h.exact.length === 0) continue;
    const start = plain.indexOf(h.exact);
    if (start === -1) continue;
    const range = { start, end: start + h.exact.length, id: h.id };
    if (ranges.some((r) => range.start < r.end && r.start < range.end)) continue; // overlap: first wins
    ranges.push(range);
  }
  return ranges.sort((a, b) => a.start - b.start);
}

/** Split styled runs at highlight boundaries and tag the highlighted pieces. */
export function applyHighlights(segments: Segment[], highlights: Highlight[]): Segment[] {
  const plain = segments.map((s) => s.text).join("");
  const ranges = findRanges(plain, highlights);
  if (ranges.length === 0) return segments;

  const cuts = new Set<number>();
  for (const r of ranges) {
    cuts.add(r.start);
    cuts.add(r.end);
  }

  const out: Segment[] = [];
  let offset = 0;
  for (const seg of segments) {
    let pieceStart = 0;
    const points = [...cuts].filter((c) => c > offset && c < offset + seg.text.length).sort((a, b) => a - b);
    for (const point of [...points, offset + seg.text.length]) {
      const text = seg.text.slice(pieceStart, point - offset);
      if (text.length > 0) {
        const absStart = offset + pieceStart;
        const hit = ranges.find((r) => absStart >= r.start && absStart < r.end);
        out.push(hit ? { ...seg, text, highlightId: hit.id } : { ...seg, text });
      }
      pieceStart = point - offset;
    }
    offset += seg.text.length;
  }
  return out;
}

/** Highlights whose quote no longer appears anywhere in the block. */
export function orphanedHighlights(markdown: string, highlights: Highlight[]): Highlight[] {
  const plain = splitParagraphs(markdown)
    .map((p) => parseInline(p).map((s) => s.text).join(""))
    .join("\n");
  return highlights.filter((h) => !plain.includes(h.exact));
}
