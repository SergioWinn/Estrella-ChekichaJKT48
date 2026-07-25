# Design - Chekicha Archive Monitor

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page - extend or amend this file when the
system needs to grow.

## Genre
modern-minimal

## Macrostructure family

- Marketing pages: Ledger Hero with a masthead strip, one dominant metric deck, and alternating dense archive bands.
- App pages: Command Deck with a compressed top rail, one dominant tool surface, and secondary slabs for filters or summaries.
- Content pages: Quiet Letter with a tall intro column, one restrained form slab, and generous negative space.

## Theme

- `--color-paper` oklch(0.21 0.03 252)
- `--color-paper-2` oklch(0.26 0.025 252)
- `--color-ink` oklch(0.95 0.01 250)
- `--color-ink-2` oklch(0.78 0.02 248)
- `--color-rule` oklch(0.42 0.03 247 / 0.34)
- `--color-accent` oklch(0.72 0.11 235)
- `--color-focus` oklch(0.78 0.09 228)

## Typography

- Display: Geist, weight 600, style normal
- Body: Geist, weight 400
- Mono: IBM Plex Mono, weight 500
- Display tracking: -0.045em
- Type scale anchor: `--text-display` = `clamp(2.8rem, 4vw, 4.8rem)`

## Spacing

4-point scale. Reusable CSS uses named values from `tokens.css`; JSX may use
Tailwind spacing utilities only when they resolve to multiples of 4 px.

## Motion

- Easings: `--ease-out`, `--ease-in`, `--ease-in-out`
- Reveal pattern: fade + slide only on list items and cards
- Reduced-motion fallback: opacity-only, <= 150 ms

## Microinteractions stance

- Silent success
- Hover delay 800 ms, focus delay 0 ms
- One hover cue per element: border or lift, not both plus glow

## CTA voice

- Primary CTA: dense accent block with sentence-case labels and firm rectangular corners
- Secondary CTA: thin-outline block with soft fill on hover, never oversized pill chrome

## Per-page allowances

- Marketing pages MAY use restrained gradient bands, archive rails, and one oversized data slab.
- App pages MUST NOT use decorative enrichment and should rely on hierarchy, not ornament.
- Content pages stay typography-first with one supporting panel and one narrow evidence rail.

## What pages MUST share

- The wordmark and archive-monitor framing
- The accent colour and its small footprint
- The unified Geist display/body system
- The tighter rectangular border language
- The section heading rhythm with stacked kicker above the title

## What pages MAY differ on

- Macrostructure inside each page-type family
- Intro composition and rail placement
- Density of slabs and archive bands based on task complexity

## Exports

### tokens.css

The live source is [`tokens.css`](tokens.css). Core portable roles:

```css
:root {
  --color-paper: oklch(0.21 0.03 252);
  --color-paper-2: oklch(0.26 0.025 252);
  --color-ink: oklch(0.95 0.01 250);
  --color-ink-2: oklch(0.78 0.02 248);
  --color-rule: oklch(0.42 0.03 247 / 0.34);
  --color-accent: oklch(0.72 0.11 235);
  --color-accent-ink: oklch(0.2 0.03 252);
  --color-focus: oklch(0.78 0.09 228);
  --font-display: "Geist", "Segoe UI", sans-serif;
  --font-body: "Geist", "Segoe UI", sans-serif;
  --font-outlier: "IBM Plex Mono", "Cascadia Mono", monospace;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(0.21 0.03 252);
  --color-paper-2: oklch(0.26 0.025 252);
  --color-ink: oklch(0.95 0.01 250);
  --color-ink-2: oklch(0.78 0.02 248);
  --color-rule: oklch(0.42 0.03 247 / 0.34);
  --color-accent: oklch(0.72 0.11 235);
  --color-focus: oklch(0.78 0.09 228);
  --font-display: "Geist", "Segoe UI", sans-serif;
  --font-body: "Geist", "Segoe UI", sans-serif;
  --font-outlier: "IBM Plex Mono", "Cascadia Mono", monospace;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --radius-card: 1.1rem;
  --radius-input: 0.75rem;
  --radius-pill: 999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

The same portable roles are available in [`tokens.json`](tokens.json).

```json
{
  "color": {
    "paper": { "$value": "oklch(0.21 0.03 252)", "$type": "color" },
    "ink": { "$value": "oklch(0.95 0.01 250)", "$type": "color" },
    "accent": { "$value": "oklch(0.72 0.11 235)", "$type": "color" },
    "focus": { "$value": "oklch(0.78 0.09 228)", "$type": "color" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 21% 0.03 252;
  --foreground: 95% 0.01 250;
  --card: 26% 0.025 252;
  --card-foreground: 95% 0.01 250;
  --primary: 72% 0.11 235;
  --primary-foreground: 20% 0.03 252;
  --muted: 42% 0.03 247;
  --muted-foreground: 78% 0.02 248;
  --border: 42% 0.03 247;
  --input: 42% 0.03 247;
  --ring: 78% 0.09 228;
  --radius: 1.1rem;
}
```

