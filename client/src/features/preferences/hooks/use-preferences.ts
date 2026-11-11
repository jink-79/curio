import { useSyncExternalStore } from "react";
import { getPreferences, type Preferences, subscribePreferences } from "../lib/preferences";

/** The learner's preferences; re-renders when they change. */
export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribePreferences, getPreferences, getPreferences);
}
