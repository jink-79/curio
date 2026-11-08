import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { writeJson } from "@/lib/storage";
import { migrateSettings, type ReaderSettings, SETTINGS_KEY } from "./lib/settings";
import { ReaderSettingsContext } from "./reader-settings";

function readStored(): unknown {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/**
 * Holds reader preferences (remembered on this device) and applies the theme
 * and type pairing to <html>, so every screen and every portalled sheet uses
 * the same look.
 */
export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(() => migrateSettings(readStored()));

  const update = useCallback((next: ReaderSettings) => {
    setSettings(next);
    writeJson(SETTINGS_KEY, next);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.readerTheme = settings.theme;
    root.dataset.readerPairing = settings.pairing;
    const bar = getComputedStyle(root).getPropertyValue("--r-bar").trim();
    if (bar) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bar);
  }, [settings.theme, settings.pairing]);

  const value = useMemo(() => [settings, update] as const, [settings, update]);
  return <ReaderSettingsContext.Provider value={value}>{children}</ReaderSettingsContext.Provider>;
}
