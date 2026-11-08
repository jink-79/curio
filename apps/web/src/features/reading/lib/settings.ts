import type { LineSpacing, ReaderTheme, Typeface } from "../types";

export const FONT_SIZES = [16, 18, 20, 22, 24] as const;
export const LINE_HEIGHTS: Record<LineSpacing, number> = { compact: 1.5, comfort: 1.7, airy: 1.9 };
export const THEMES: ReaderTheme[] = ["dark", "dim", "light", "sepia"];
export const SETTINGS_KEY = "curio.reader.settings.v1";

export interface ReaderSettings {
  theme: ReaderTheme;
  /** Index into FONT_SIZES. */
  fontStep: number;
  typeface: Typeface;
  spacing: LineSpacing;
}

export const DEFAULT_SETTINGS: ReaderSettings = { theme: "dark", fontStep: 1, typeface: "serif", spacing: "comfort" };

export function isReaderSettings(value: unknown): value is ReaderSettings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    THEMES.includes(v.theme as ReaderTheme) &&
    Number.isInteger(v.fontStep) &&
    (v.fontStep as number) >= 0 &&
    (v.fontStep as number) < FONT_SIZES.length &&
    (v.typeface === "serif" || v.typeface === "sans") &&
    (v.spacing === "compact" || v.spacing === "comfort" || v.spacing === "airy")
  );
}

export function stepFont(settings: ReaderSettings, delta: 1 | -1): ReaderSettings {
  const fontStep = Math.min(FONT_SIZES.length - 1, Math.max(0, settings.fontStep + delta));
  return { ...settings, fontStep };
}
