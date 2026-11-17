# Collector's Album — Chekicha Archive

User-approved direction: Collector's Album layout with the Chekicha Pop palette. Operate mode: quick scanning and usable forms take precedence over decoration.

## Visual system
- Chekicha icon-inspired palette: coral (#f57587), turquoise focus (#48cbd2; #147f86 on light surfaces), and a small lime (#c4ff00) underline on FIGHT!. Light uses near-white (#fffafb), white cards, blush (#fff0f3), charcoal text (#29252b), and accessible deep coral text (#b93652). Dark uses charcoal (#201d24), plum cards (#2b2630), and coral accents. Active navigation and filters use soft backgrounds. Existing team/status colors retain their meaning.
- Geist throughout: semibold headings and dates, regular body and metadata. Tabular numerals for dates/ranks; no editorial serif. No decorative gradients or glass panels.
- `app/collector.css` owns the new theme/layout layer over the existing shared primitives. Base spacing, status colors and motion tokens remain in tokens.css.
- Real member portraits and original event artwork, never generated mockup portraits. Directory, ranking and participant thumbnails use square frames matching the 1:1 assets; contain images without adding portrait-shaped empty space. Contain show logos; crop special-event portraits carefully.
- 14px card corners, compact 8px controls, clear focus states, minimum 44px interaction targets.

## Timeline
- Subtitle identifies the JKT48 FIGHT! era alongside the January 2026 archive start. Emphasize FIGHT! with restrained berry typography; keep member imagery dominant and avoid repeating campaign labels on cards.
- Equal card footprints within each breakpoint. Desktop two columns, narrow screens one column.
- Birthday/Graduation: portrait on left, member and event metadata on right.
- Show: compact artwork thumbnail and metadata above a dominant participant area. Member names are larger than show titles, with equally sized square portraits and labels/names below. Two slots get equal columns; a genuine single slot is centered without an empty second slot. Missing member stays visible as awaiting; missing photograph uses a fallback.
- Titles use a reserved two-line area, vertically centered when short and ellipsized when long. Full title remains available via title attribute.
- Filter by category, series, team, member and case-insensitive text. Display empty result state with reset action.

## Other surfaces
- Members: portrait-led alphabetical cards, history dialog, comparison dialog; retain all existing count semantics. Ranking remains a horizontal auto-scroll rail with compact pause/play, hover/focus pause and reduced-motion support. Decorative duplicate entries remain inaccessible.
- Collection: member portrait and quantity, existing Add/Manage and history dialogs. No new upload, shop or trading features.
- Sign in/Create account: restrained berry/ivory forms, same fields and validation as before.
- Admin: existing role-protected tabs, forms and slot semantics; shared theme applies without changing actions.
- Header and footer preserve navigation, auth, theme, credit and support links.

## Review constraints
Avoid modifying stored events or collections during visual QA. Preview with real data at desktop and mobile widths; verify filters, overflow, dialogs and both theme settings.
