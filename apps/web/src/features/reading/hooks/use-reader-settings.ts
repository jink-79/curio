import { useCallback, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { DEFAULT_SETTINGS, isReaderSettings, type ReaderSettings, SETTINGS_KEY } from "../lib/settings";

/** Reader preferences, remembered on this device (server sync comes with accounts). */
export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(
    () => readJson(SETTINGS_KEY, isReaderSettings) ?? DEFAULT_SETTINGS,
  );

  const update = useCallback((next: ReaderSettings) => {
    setSettings(next);
    writeJson(SETTINGS_KEY, next);
  }, []);

  return [settings, update] as const;
}
