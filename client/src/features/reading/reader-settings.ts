import { createContext, useContext } from "react";
import type { ReaderSettings } from "./lib/settings";

export type ReaderSettingsValue = readonly [ReaderSettings, (next: ReaderSettings) => void];

export const ReaderSettingsContext = createContext<ReaderSettingsValue | null>(null);

/** The reader's theme, type pairing and text preferences, shared app-wide. */
export function useReaderSettings(): ReaderSettingsValue {
  const value = useContext(ReaderSettingsContext);
  if (!value) throw new Error("useReaderSettings must be used inside <ReaderSettingsProvider>");
  return value;
}
