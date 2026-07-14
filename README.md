# CHEKICHA ARCHIVE MONITOR

CHEKICHA ARCHIVE MONITOR is a full-stack web application for browsing, managing, and tracking archived JKT48 chekicha event data through a fast, focused, and mobile-friendly interface. Instead of digging through raw tables or scattered event records, the app reorganizes archive rows into a clearer view that highlights recent assignments, member frequency, timeline history, and user collection data in one place.

From a technical perspective, the project is built as a Next.js application backed by Supabase for authentication, storage, and server-side data access. The interface combines responsive pages for overview, timeline, members, and collection tracking, while admin-only flows handle member and event maintenance. The result is a compact but practical product that emphasizes usability, defensive server-side access, and a clean separation between UI, page logic, and data helpers.

## Why This Project

Archive data becomes much more useful when it is easy to scan, compare, and update. For event-heavy tracking workflows, raw records are technically sufficient but not ideal for quickly answering questions like who appears most often, which draws are still unresolved, or what a specific member has appeared in recently.

This project was built as a focused monitoring and archive layer on top of that need. Rather than acting as a generic database viewer, CHEKICHA ARCHIVE MONITOR turns archived JKT48 chekicha data into a more readable dashboard with role-based access, member history browsing, and collection management. It also serves as a portfolio project that demonstrates practical Next.js app-router work, Supabase-backed auth, and clean server/client separation.

## Highlights

- Overview dashboard with archive counts, ranking, and recent member assignments.
- Timeline page with event-type filters and Roulette series grouping, including a shared Ramadhan series.
- Member browser with search, status filters, full-name ordering, and recent history per member.
- Authenticated collection page with event/status filters and quantity management for collectible slots.
- Admin workspace for managing members, event presets, and archive rows.
- Supabase-backed auth with route protection for collection and admin pages.
- Shared responsive design system documented in `design.md` and implemented through `tokens.css`.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Data access: Supabase SSR, Supabase REST, server actions
- Auth and storage: Supabase
- Tooling: ESLint, Node.js test runner
- Deployment target: Vercel

## Architecture Overview

The application is intentionally kept small and split by responsibility inside one Next.js codebase:

- `app/` contains the route-level pages for overview, timeline, members, login, signup, collection, and admin.
- `components/` contains interactive client components and reusable UI pieces.
- `lib/` contains Supabase clients, archive transforms, server-side loaders, and server actions.
- `proxy.ts` protects authenticated and role-gated routes.
- `design.md` defines the locked visual system and page-family rules.
- `tokens.css` contains shared typography, spacing, color, motion, radius, and shadow tokens.

This keeps the browser-facing UI simple while centralizing data access, auth checks, and mutation logic in a small set of server-side helpers.

## Core Features

- Archive overview with leaderboard and recent assignments
- Event timeline browsing across Roulette, birthday, and graduation rows
- Roulette timeline filtering by `event_series`, allowing multiple Ramadhan events to share one option
- Member-centric browsing with status filters, full-name ordering, and searchable archive history
- Personal collection tracking with event-type and member-status filters
- Collection desk for adding slots, updating quantities, and removing saved entries
- Admin-only member and event management flows
- Server-side auth and role checks for protected routes

## Project Structure

```text
.
|-- app/          # Next.js app-router pages
|-- components/   # Client and shared UI components
|-- lib/          # Data loaders, Supabase clients, server actions
|-- tests/        # Node-based tests
|-- design.md     # Locked design-system documentation
|-- tokens.css    # Shared visual design tokens
|-- proxy.ts      # Route protection
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase project with the required tables and auth enabled

### Environment Variables

Create a local `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by browser-safe and SSR flows.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in client code.

### Supabase Requirements

The application currently reads and writes these primary tables:

- `profiles` for usernames and role-based access.
- `members` for nickname, full name, status, generation, and avatar data.
- `event_presets` for reusable event definitions.
- `chekicha` for archived event rows and resolved member slots.
- `user_collection_entries` for per-user collection quantities.

Roulette grouping requires an optional `event_series` text column on both event tables:

```sql
alter table public.event_presets
add column if not exists event_series text;

alter table public.chekicha
add column if not exists event_series text;
```

For regular shows, `event_series` should normally match the show name. Events that belong to the same seasonal group should share one value. For example, different Ramadhan event names use `event_series = 'Ramadhan'`. The Timeline dropdown groups by this field while each card continues to display its original `event_name`.

Existing Roulette rows should be backfilled before deploying the application. Rows without `event_series` remain compatible and fall back to `event_name`, but newly created event presets should always define the intended series.

### Local Development

```bash
npm install
npm run dev
```

The app runs locally at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

### Verification

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
```

The Node.js test suite covers archive aggregation, timeline series filtering, collection hydration, authentication helpers, and admin event payload behavior.

## Deployment

This project is designed to deploy cleanly on Vercel.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Apply the required Supabase schema, including both `event_series` columns.
4. Backfill `event_series` for existing Roulette rows and presets.
5. Add the three environment variables from `.env.local` to the Vercel project.
6. Deploy.

For production, keep `SUPABASE_SERVICE_ROLE_KEY` only in Vercel environment settings and never commit it into the repository.

## What This Project Demonstrates

- Building a focused full-stack product with Next.js App Router
- Separating page rendering, client UI, and server-side data access
- Using Supabase for auth, storage, and admin workflows
- Protecting routes with proxy and role-aware redirects
- Turning archive-style operational data into a cleaner, faster interface

## Potential Improvements

- Add more test coverage for server actions and archive transforms
- Add seed data or migration scripts for faster onboarding
- Add screenshots and deployment notes for public presentation

## License

No license has been added yet. If this repository is intended for public reuse, add a license file.
