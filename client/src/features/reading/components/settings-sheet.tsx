import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { FONT_SIZES, PAIRINGS, type ReaderSettings, stepFont, THEMES } from "../lib/settings";
import type { LineSpacing, ReaderTheme, TypePairing, Typeface } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReaderSettings;
  onChange: (next: ReaderSettings) => void;
}

const SWATCH: Record<ReaderTheme, string> = {
  dark: "bg-[#080D12] text-[#E8ECF1] border-[#27313D]",
  dim: "bg-[#1C232D] text-[#E6E9EE] border-[#34404F]",
  light: "bg-[#FAFAF7] text-[#1F2937] border-[#E3E5E8]",
  tidepool: "bg-[#F5F8FC] text-[#183349] border-[#DCE8F2]",
};

/** Each pairing's preview is set in its own faces, whatever pairing is active. */
const PAIRING_FONTS: Record<TypePairing, { serif: string; sans: string }> = {
  tidepool: { serif: '"Newsreader Variable", Georgia, serif', sans: '"DM Sans Variable", sans-serif' },
  fern: { serif: '"Lora Variable", Georgia, serif', sans: '"Manrope Variable", sans-serif' },
  bookmark: { serif: '"Fraunces Variable", Georgia, serif', sans: '"Plus Jakarta Sans Variable", sans-serif' },
};

function SectionLabel({ children, id }: { children: string; id?: string }) {
  return (
    <div id={id} className="mb-2 text-xs text-r-muted">
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-xl border border-r-border bg-r-card p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-10 rounded-[9px] text-[13px] font-medium transition-colors",
            value === o.value ? "bg-r-primary text-r-on-primary" : "text-r-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsSheet({ open, onOpenChange, settings, onChange }: SettingsSheetProps) {
  const size = FONT_SIZES[settings.fontStep];
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Reading settings">
      <div className="flex flex-col gap-4.5">
        <div>
          <SectionLabel id="pairing-label">Type pairing</SectionLabel>
          <div role="radiogroup" aria-labelledby="pairing-label" className="flex flex-col gap-2">
            {PAIRINGS.map((p) => {
              const on = settings.pairing === p.id;
              const fonts = PAIRING_FONTS[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange({ ...settings, pairing: p.id })}
                  className={cn(
                    "flex min-h-16 items-center gap-3.5 rounded-[14px] border bg-r-card px-3.5 py-2.5 text-left transition-colors",
                    on ? "border-r-primary ring-1 ring-r-primary" : "border-r-border",
                  )}
                >
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-r-accent-bg text-[22px] text-r-text"
                    style={{ fontFamily: fonts.serif }}
                  >
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] leading-tight text-r-text" style={{ fontFamily: fonts.serif }}>
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-r-muted" style={{ fontFamily: fonts.sans }}>
                      {p.serif} + {p.sans}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5.5 shrink-0 place-items-center rounded-full",
                      on ? "bg-r-primary text-r-on-primary" : "border border-r-border-strong",
                    )}
                  >
                    {on && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>Body text</SectionLabel>
          <Segmented<Typeface>
            label="Body text"
            value={settings.typeface}
            onChange={(typeface) => onChange({ ...settings, typeface })}
            options={[
              { value: "serif", label: "Serif" },
              { value: "sans", label: "Sans" },
            ]}
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs text-r-muted">
            <span id="size-label">Text size</span>
            <span>{size}px</span>
          </div>
          <div className="flex items-center gap-2" role="group" aria-labelledby="size-label">
            <button
              type="button"
              onClick={() => onChange(stepFont(settings, -1))}
              disabled={settings.fontStep === 0}
              aria-label="Smaller text"
              className="h-11 w-13 rounded-xl border border-r-border-strong bg-r-card text-sm font-semibold disabled:opacity-40"
            >
              A−
            </button>
            <div aria-hidden className="flex flex-1 justify-center gap-1.5">
              {FONT_SIZES.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === settings.fontStep ? "w-4.5" : "w-2",
                    i <= settings.fontStep ? "bg-r-primary" : "bg-r-border-strong",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange(stepFont(settings, 1))}
              disabled={settings.fontStep === FONT_SIZES.length - 1}
              aria-label="Larger text"
              className="h-11 w-13 rounded-xl border border-r-border-strong bg-r-card text-lg font-semibold disabled:opacity-40"
            >
              A+
            </button>
          </div>
        </div>

        <div>
          <SectionLabel>Line spacing</SectionLabel>
          <Segmented<LineSpacing>
            label="Line spacing"
            value={settings.spacing}
            onChange={(spacing) => onChange({ ...settings, spacing })}
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfort", label: "Comfort" },
              { value: "airy", label: "Airy" },
            ]}
          />
        </div>

        <div>
          <SectionLabel>Theme</SectionLabel>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                role="radio"
                aria-checked={settings.theme === theme}
                onClick={() => onChange({ ...settings, theme })}
                className="flex flex-col items-center gap-1.5 py-1.5 text-xs capitalize"
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-13 place-items-center rounded-full border font-serif text-lg",
                    SWATCH[theme],
                    settings.theme === theme && "ring-2 ring-r-primary ring-offset-2 ring-offset-r-sheet",
                  )}
                >
                  Aa
                </span>
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
