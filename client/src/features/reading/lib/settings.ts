import type { LineSpacing, ReaderTheme, TypePairing, Typeface } from "../types";

export const FONT_SIZES = [16, 18, 20, 22, 24] as const;
export const LINE_HEIGHTS: Record<LineSpacing, number> = { compact: 1.5, comfort: 1.7, airy: 1.9 };
export const THEMES: ReaderTheme[] = ["dark", "dim", "light", "tidepool"];
export const SETTINGS_KEY = "curio.reader.settings.v1";

export const PAIRINGS: { id: TypePairing; name: string; serif: string; sans: string }[] = [
  { id: "tidepool", name: "Tidepool", serif: "Newsreader", sans: "DM Sans" },
  { id: "fern", name: "Fern & Fiction", serif: "Lora", sans: "Manrope" },
  { id: "bookmark", name: "Bookmark No. 3", serif: "Fraunces", sans: "Plus Jakarta Sans" },
];

export interface ReaderSettings {
  theme: ReaderTheme;
  pairing: TypePairing;
  /** Index into FONT_SIZES. */
  fontStep: number;
  /** Body text in the pairing's serif or its sans. */
  typeface: Typeface;
  spacing: LineSpacing;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "dark",
  pairing: "tidepool",
  fontStep: 1,
  typeface: "serif",
  spacing: "comfort",
};

const isTheme = (v: unknown): v is ReaderTheme => THEMES.includes(v as ReaderTheme);
const isPairing = (v: unknown): v is TypePairing => PAIRINGS.some((p) => p.id === v);
const isStep = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) < FONT_SIZES.length;
const isTypeface = (v: unknown): v is Typeface => v === "serif" || v === "sans";
const isSpacing = (v: unknown): v is LineSpacing => v === "compact" || v === "comfort" || v === "airy";

/**
 * Read whatever was stored on the device, keeping every valid field and
 * defaulting the rest, so adding or renaming an option never wipes a
 * reader's other preferences. The retired "sepia" theme maps to "tidepool".
 */
export function migrateSettings(stored: unknown): ReaderSettings {
  if (typeof stored !== "object" || stored === null) return DEFAULT_SETTINGS;
  const v = stored as Record<string, unknown>;
  const theme = v.theme === "sepia" ? "tidepool" : v.theme;
  return {
    theme: isTheme(theme) ? theme : DEFAULT_SETTINGS.theme,
    pairing: isPairing(v.pairing) ? v.pairing : DEFAULT_SETTINGS.pairing,
    fontStep: isStep(v.fontStep) ? v.fontStep : DEFAULT_SETTINGS.fontStep,
    typeface: isTypeface(v.typeface) ? v.typeface : DEFAULT_SETTINGS.typeface,
    spacing: isSpacing(v.spacing) ? v.spacing : DEFAULT_SETTINGS.spacing,
  };
}

export function stepFont(settings: ReaderSettings, delta: 1 | -1): ReaderSettings {
  const fontStep = Math.min(FONT_SIZES.length - 1, Math.max(0, settings.fontStep + delta));
  return { ...settings, fontStep };
}
