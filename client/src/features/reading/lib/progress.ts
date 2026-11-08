/** Percentage (0–100) of the lesson scrolled through. Short lessons that fit on screen count as fully seen. */
export function scrollProgress(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const max = scrollHeight - clientHeight;
  if (max <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((scrollTop / max) * 100)));
}

/**
 * Auto-complete rule (docs/02 F8): the reader reached 90% of the lesson AND
 * spent at least 40% of its estimated reading time on it, so skimming to the
 * bottom does not count as reading.
 */
export function shouldAutoComplete(maxScrollPct: number, activeSeconds: number, estimatedMinutes: number): boolean {
  return maxScrollPct >= 90 && activeSeconds >= estimatedMinutes * 60 * 0.4;
}
