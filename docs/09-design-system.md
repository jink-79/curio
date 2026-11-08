# 09 — Design System & Component Guidelines

## 1. Colour: the brief's palette tested against WCAG 2.2

Contrast ratios below were computed with the WCAG relative-luminance formula.

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| Primary text `#F5F7FA` on bg `#080D12` | 18.17 | 4.5 | ✅ |
| Primary text on card `#171F29` | 15.47 | 4.5 | ✅ |
| Secondary text `#9BA6B5` on card | 6.73 | 4.5 | ✅ |
| Electric blue `#4C7FF5` text on bg | 5.26 | 4.5 | ✅ |
| Electric blue text on **card** | **4.48** | 4.5 | ❌ (barely) |
| **White text on electric-blue button** | **3.46** | 4.5 | ❌ |
| **Border `#27313D` vs card** (input outline) | **1.26** | 3.0 (non-text UI, 1.4.11) | ❌ |
| Error `#EF4444` text on card | 4.41 | 4.5 | ❌ |
| Success `#22C55E` on card | 7.29 | 4.5 | ✅ |
| Warning `#F59E0B` on card | 7.73 | 4.5 | ✅ |

**Fix [PROPOSED, Q7]:** keep every brand hex. Add *role tokens* so text and controls use accessible variants.

## 2. Tokens

```css
:root, [data-theme="dark"] {
  /* brand (unchanged) */
  --brand-blue: #4C7FF5;
  --bg: #080D12;            --bg-elevated: #111820;    --card: #171F29;
  --text: #F5F7FA;          --text-muted: #9BA6B5;
  --border: #27313D;        /* decorative dividers only */
  --success: #22C55E;       --warning: #F59E0B;        --error: #EF4444;

  /* role tokens (accessible) */
  --primary-bg: #4C7FF5;    --primary-fg: #080D12;     /* 5.26:1 — dark label on brand blue */
  --primary-bg-hover: #6B95F7;                          /* 6.75:1 with dark label */
  --link: #6B95F7;          /* 5.75 on card, 6.75 on bg */
  --border-control: #64708A;/* 3.34 on card — inputs, checkboxes, toggles */
  --error-text: #F87171;    /* 6.0 on card; --error stays for icons/fills */
  --focus-ring: #4C7FF5;    /* 2px ring + 2px offset; ≥3:1 vs adjacent bg */
  --highlight-blue: rgb(76 127 245 / .28);  --highlight-yellow: rgb(245 158 11 / .28);
  --highlight-green: rgb(34 197 94 / .25);  --highlight-pink: rgb(236 72 153 / .25);
}
```

*Design choice:* a primary button with a **dark label on brand blue** keeps the exact brand colour. The alternative is a darker fill such as `#2F5FD6` with a white label (5.63:1), which dilutes the "electric" feel. The dark-label option is recommended.

### Reader themes (Q5)
| Theme | bg | text | link | Ratio (text/link) |
|---|---|---|---|---|
| Dark (default) | `#080D12` | `#F5F7FA` | `#6B95F7` | 18.2 / 6.8 |
| Dim | `#1C232D` | `#E6E9EE` | `#7AA0F8` | 13.0 / 6.2 |
| Light | `#FAFAF7` | `#1F2937` | `#2F5FD6` | 14.0 / 5.4 |
| Sepia | `#F4ECD8` | `#3B3024` | `#2B59CC` | 10.9 / 5.2 |

The rest of the app stays dark. Only the reader content area switches theme.

## 3. Typography

- **UI:** Inter (OFL, self-hosted, no Google Fonts runtime call so it works offline). Weights 400, 500 and 600.
- **Reading body:** Source Serif 4 (OFL), with Inter available as an option. Long-form reading in serif is a preference, so the user can toggle it.
- **Mono:** JetBrains Mono (OFL), for code in programming paths.
- **Scale** (rem): 0.75 · 0.875 · 1 · 1.125 · 1.25 · 1.5 · 1.875 · 2.25. Reader body defaults to 1.125 rem with line-height 1.7.
- **Reader font-size steps:** 16 / 18 / 20 / 22 / 24 px. Measure (line length): 60 / 70 / 80 ch.

## 4. Spacing, radius, elevation, motion

- **Spacing:** 4 px base (Tailwind default scale).
- **Radius:** 6 px for controls, 10 px for cards, 16 px for dialogs. The icon tile uses about 22% of its width.
- **Elevation:** use background steps (`bg` → `bg-elevated` → `card`) rather than shadows. A single soft shadow is used for popovers and dialogs only.
- **Motion:** 120–180 ms ease-out for state changes only. No decorative animation. Respect `prefers-reduced-motion` by disabling transitions except opacity.
- **Gradients:** none in UI. The only glow is in the brand mark.

## 5. Component guidelines (shadcn/ui based)

| Component | Rules |
|---|---|
| Button | Variants: `primary` (brand fill, dark label) — one per view; `secondary` (card bg + control border); `ghost`; `destructive` (error fill, white label → use `#DC2626` fill: 4.83:1). Min target 40×40 px (44 on touch). |
| Input/Select/Textarea | `--border-control` outline, `--focus-ring` focus; error text below with `--error-text`, linked via `aria-describedby`. |
| PathCard | Category chip, title (2-line clamp), difficulty, minutes, lessons count, followers, progress bar if enrolled. Whole card is one link. |
| ProgressBar | Brand blue on `--border`; always paired with text ("4 of 12 lessons"). |
| LicenceBadge | Short code (CC BY-SA 4.0, PD, CC0, Link only) + tooltip with full licence + link. Never colour-only. |
| AttributionFooter | Provider icon, "Title" by Author, licence link, "Retrieved 8 Nov 2026", "View original ↗". Required under every excerpt/image. |
| ConfidenceBadge | Generation only: High/Medium/Low + why-tooltip. |
| PrereqNotice | Non-blocking callout (`info` tone) with link to the earlier lesson. |
| EmptyState / ErrorState / Skeleton | Every data view must use these; skeletons for >300 ms loads. |
| Toast | Only for async results the user triggered; not for errors that need action (use inline). |
| Highlighter popover | Keyboard reachable (select text → `Shift+H` highlight, `Shift+N` note). |

Icons use Lucide only, at 16/20/24 px with stroke width 1.75.

## 6. Brand mark

Files: [`brand/curio-mark.svg`](brand/curio-mark.svg) (app icon, with glow), [`brand/curio-favicon.svg`](brand/curio-favicon.svg) (no glow, heavier stroke for 16–32 px), [`brand/preview-sizes.png`](brand/preview-sizes.png).

**Concept:** an open ring (the known) with a point of light leaving through the gap. That stands for curiosity, stepping beyond what you already know, and progression. It has no text, no graduation cap, and is a single colour on near-black.

**Honest critique (Q8):**
- The dot sitting above the ring's right end reads as a lowercase **"i"**, so the mark can read as "Ci". Some will see "C + information," which is defensible. Others may read it as a power or "info" glyph. Test it with five people before committing.
- Open-ring-plus-dot is a common geometric motif. A trademark search is needed before any public launch.
- The glow is suppressed at favicon sizes on purpose, because blur turns to mud below 32 px.

**iOS / PWA export (milestone M1):** 180×180 apple-touch-icon (opaque, no transparency, because iOS applies its own mask), 192 and 512 PWA icons, plus a maskable 512 version whose symbol fits inside the 80% safe zone.
