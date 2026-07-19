# Design - Chekicha Archive Monitor

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page - extend or amend this file when the
system needs to grow.

## Genre
modern-minimal

## Macrostructure family

- Marketing pages: Stat-Led with an off-axis overview lead, a narrow context rail, and denser data sections below.
- App pages: Workbench with a slim command header, one primary work surface, and compact supporting cards.
- Content pages: Letter with a split intro and restrained form panels.

## Theme

- `--color-paper` oklch(0.21 0.03 252)
- `--color-paper-2` oklch(0.26 0.025 252)
- `--color-ink` oklch(0.95 0.01 250)
- `--color-ink-2` oklch(0.78 0.02 248)
- `--color-rule` oklch(0.42 0.03 247 / 0.34)
- `--color-accent` oklch(0.72 0.11 235)
- `--color-focus` oklch(0.78 0.09 228)

## Typography

- Display: Space Grotesk, weight 600, style normal
- Body: Source Sans 3, weight 400
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

- Primary CTA: soft-fill capsule, sentence-case labels, compact horizontal padding
- Secondary CTA: hairline outline capsule, tinted hover fill

## Per-page allowances

- Marketing pages MAY use restrained gradient bands and summary rails.
- App pages MUST NOT use decorative enrichment.
- Content pages stay typography-first with one supporting panel.

## What pages MUST share

- The wordmark and archive-monitor framing
- The accent colour and its small footprint
- The display and body fonts
- The button shape and border language
- The section heading rhythm

## What pages MAY differ on

- Macrostructure inside each page-type family
- Intro composition
- Density of cards and rails based on task complexity

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
  --font-display: "Space Grotesk", "Segoe UI", sans-serif;
  --font-body: "Source Sans 3", "Segoe UI", sans-serif;
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
  --font-display: "Space Grotesk", "Segoe UI", sans-serif;
  --font-body: "Source Sans 3", "Segoe UI", sans-serif;
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

