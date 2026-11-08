export interface QuoteSelector {
  exact: string;
  prefix?: string | undefined;
  suffix?: string | undefined;
}

/** Characters of context stored either side of a quote. */
export const CONTEXT_CHARS = 32;

/** Length of the common tail of a and b. */
function commonSuffix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n += 1;
  return n;
}
/** Length of the common head of a and b. */
function commonPrefix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

/**
 * Where `quote.exact` sits in `text`, or -1. With several occurrences, the
 * one whose surrounding text best matches the stored prefix/suffix wins
 * (first occurrence on a tie), so "the war" picks the right "the war".
 */
export function locateQuote(text: string, quote: QuoteSelector): number {
  if (!quote.exact) return -1;
  const hits: number[] = [];
  for (let i = text.indexOf(quote.exact); i !== -1; i = text.indexOf(quote.exact, i + 1)) hits.push(i);
  if (hits.length <= 1) return hits[0] ?? -1;

  let best = hits[0] as number;
  let bestScore = -1;
  for (const start of hits) {
    const before = text.slice(Math.max(0, start - CONTEXT_CHARS), start);
    const after = text.slice(start + quote.exact.length, start + quote.exact.length + CONTEXT_CHARS);
    const score = commonSuffix(before, quote.prefix ?? "") + commonPrefix(after, quote.suffix ?? "");
    if (score > bestScore) {
      best = start;
      bestScore = score;
    }
  }
  return best;
}

/** Build a selector for text[start, end): the exact words plus context either side. */
export function quoteAt(text: string, start: number, end: number): QuoteSelector {
  return {
    exact: text.slice(start, end),
    prefix: text.slice(Math.max(0, start - CONTEXT_CHARS), start),
    suffix: text.slice(end, end + CONTEXT_CHARS),
  };
}
