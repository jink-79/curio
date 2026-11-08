import { cn } from "@/lib/cn";
import { FONT_SIZES, type ReaderSettings, stepFont, THEMES } from "../lib/settings";
import type { LineSpacing, Typeface } from "../types";
import { BottomSheet } from "./bottom-sheet";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReaderSettings;
  onChange: (next: ReaderSettings) => void;
}

const SWATCH: Record<ReaderSettings["theme"], string> = {
  dark: "bg-[#080D12] text-[#E8ECF1] border-[#27313D]",
  dim: "bg-[#1C232D] text-[#E6E9EE] border-[#34404F]",
  light: "bg-[#FAFAF7] text-[#1F2937] border-[#E3E5E8]",
  sepia: "bg-[#F4ECD8] text-[#3B3024] border-[#E2D6BC]",
};

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; className?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 rounded-xl border border-r-border bg-r-card p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-10 rounded-[9px] text-[13px] font-medium transition-colors",
            value === o.value ? "bg-brand text-on-brand" : "text-r-text",
            o.className,
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
                  className={cn("h-2 rounded-full transition-all", i === settings.fontStep ? "w-4.5" : "w-2", i <= settings.fontStep ? "bg-brand" : "bg-r-border-strong")}
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
          <div className="mb-2 text-xs text-r-muted">Typeface</div>
          <Segmented<Typeface>
            label="Typeface"
            value={settings.typeface}
            onChange={(typeface) => onChange({ ...settings, typeface })}
            options={[
              { value: "serif", label: "Serif", className: "font-serif text-[15px]" },
              { value: "sans", label: "Sans" },
            ]}
          />
        </div>

        <div>
          <div className="mb-2 text-xs text-r-muted">Line spacing</div>
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
          <div className="mb-2 text-xs text-r-muted">Theme</div>
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
                  className={cn(
                    "grid size-13 place-items-center rounded-full border font-serif text-base font-semibold",
                    SWATCH[theme],
                    settings.theme === theme && "ring-2 ring-brand ring-offset-2 ring-offset-r-sheet",
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
