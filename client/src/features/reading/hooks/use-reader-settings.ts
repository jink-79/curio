import { useCallback, useState } from "react";
import { writeJson } from "@/lib/storage";
import { migrateSettings, type ReaderSettings, SETTINGS_KEY } from "../lib/settings";

function readStored(): unknown {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Reader preferences, remembered on this device (server sync comes with accounts). */
export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(() => migrateSettings(readStored()));

  const update = useCallback((next: ReaderSettings) => {
    setSettings(next);
    writeJson(SETTINGS_KEY, next);
  }, []);

  return [settings, update] as const;
}
