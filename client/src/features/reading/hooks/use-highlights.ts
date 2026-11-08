import { useSyncExternalStore } from "react";
import { getHighlights, subscribeHighlights } from "../lib/highlight-store";
import type { Highlight } from "../types";

/** All of the learner's highlights; re-renders when any is added, edited or removed. */
export function useHighlights(): Highlight[] {
  return useSyncExternalStore(subscribeHighlights, getHighlights, getHighlights);
}
