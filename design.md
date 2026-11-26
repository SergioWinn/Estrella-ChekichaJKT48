# JKT48 Chekicha! Archive

Retain the Chekicha Pop palette and put event search and Roulette results first. All archive, collection, and admin pages are meant for quick lookup and editing.

## Visual system
- Chekicha icon-inspired palette: coral (#f57587), turquoise focus (#48cbd2; #147f86 on light surfaces), and a small lime (#c4ff00) underline on FIGHT!. Light uses near-white (#fffafb), white cards, blush (#fff0f3), charcoal text (#29252b), and accessible deep coral text (#b93652). Dark uses charcoal (#201d24), plum cards (#2b2630), and coral accents. Active navigation and filters use soft backgrounds. Existing team/status colors retain their meaning.
- Geist throughout: semibold headings and dates, regular body and metadata. Tabular numerals for dates/ranks; no editorial serif. No decorative gradients or glass panels.
- `app/collector.css` supplies the Chekicha palette and layouts on top of the shared primitives. Base spacing, status colors, and motion tokens live in `tokens.css`.
- Real member portraits and original event artwork, never generated mockup portraits. Directory, ranking and participant thumbnails use square frames matching the 1:1 assets; contain images without adding portrait-shaped empty space. Contain show logos; crop special-event portraits carefully.
- 14px card corners, compact 8px controls, clear focus states, minimum 44px interaction targets.

## Navigation and Timeline

- Timeline, Members, and My collection are visible in the top navigation at every viewport size. Accounts with the admin role also see Admin. Active destinations have a coral underline and `aria-current`.
- The Timeline heading pairs the JKT48 FIGHT! label with the January 2026 archive start. Search, category shortcuts, and the Filters disclosure sit above the results. The disclosure holds member, member status, and event team filters. Series appears for Roulette. Member status applies to the selected member when one is selected. Reset clears search and filters.
- Events appear as compact rows grouped from newest month to oldest. The desktop month index jumps directly to each group. Each mobile row stacks the result below the event thumbnail, full title, and date.
- Roulette results display labeled Slot A and Slot B when those slots exist. Pending slots display “Awaiting result.” Birthday and Graduation display their single member. Use original artwork or portraits in square thumbnail spaces.

## Members and Collection

- Members opens to an alphabetical list with name search, status and Roulette series filters, Chekicha type controls, and Compare. Selecting a series shows its participants. The Chekicha type selection controls the row count and last date. Ranking at `/members#ranking` uses a vertical list with rank, portrait, name, and count for every qualifying member. Name search, member status, and Roulette series filter the list together and keep the overall ranks and counts. Each Reset clears the controls in its own view.
- Members and My collection use compact rows with square portraits on the left, names and metadata beside them, and right-aligned counts. Thin dividers use the same treatment as Timeline.
- My collection puts the owned count and Add Chekicha action above its list. Name search combines with event type and member status filters. Each row opens a per-member history with a Manage copies action. Both editor panels support member or event search. The main list and both editor panels show a series filter when Roulette is selected. Each Reset clears the search and filters in its own view.
- Compare filters member choices by name, member status, and Roulette series. Selected members stay selected while filters change, and Reset clears the search, filters, and selection. History opens as a right-side dialog on desktop and fills the viewport on mobile. The history, Compare, and collection editor headers keep their close buttons visible while scrolling on mobile.

## Admin and account

- Admin opens to Fill results, which groups the pending selectors and Save action by event. Fill results and Events combine event search, event type, Roulette series, and assigned member status. The series control is available for All event types and Roulette. Fill results uses saved slot results for the status filter and keeps unsaved selections while filtering the queue. Members combines name search with a member status filter. Reset clears the search and filters for the current list. Mobile displays the record list or editor as a full-width screen with a return action.
- The shared event label displays Sebagian terisi when an event has both a saved result and an empty active slot. Member pickers in Fill results, Create Event, and Edit Event combine name search and member status. The picker Reset restores all options and keeps the current slot selection.
- Sign in and Create account use a single compact column with the form directly after the heading and a link back to Timeline.

## Review constraints

Avoid modifying stored events or collections during visual QA. Preview with real data at desktop and mobile widths; verify filters, overflow, dialogs and both theme settings.
