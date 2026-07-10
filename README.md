# CHEKICHA ARCHIVE MONITOR

CHEKICHA ARCHIVE MONITOR is a full-stack web application for browsing, managing, and tracking archived JKT48 chekicha event data through a fast, focused, and mobile-friendly interface. Instead of digging through raw tables or scattered event records, the app reorganizes archive rows into a clearer view that highlights recent assignments, member frequency, timeline history, and user collection data in one place.

From a technical perspective, the project is built as a Next.js application backed by Supabase for authentication, storage, and server-side data access. The interface combines responsive pages for overview, timeline, members, and collection tracking, while admin-only flows handle member and event maintenance. The result is a compact but practical product that emphasizes usability, defensive server-side access, and a clean separation between UI, page logic, and data helpers.

## Why This Project

Archive data becomes much more useful when it is easy to scan, compare, and update. For event-heavy tracking workflows, raw records are technically sufficient but not ideal for quickly answering questions like who appears most often, which draws are still unresolved, or what a specific member has appeared in recently.

This project was built as a focused monitoring and archive layer on top of that need. Rather than acting as a generic database viewer, CHEKICHA ARCHIVE MONITOR turns archived JKT48 chekicha data into a more readable dashboard with role-based access, member history browsing, and collection management. It also serves as a portfolio project that demonstrates practical Next.js app-router work, Supabase-backed auth, and clean server/client separation.

## Highlights

- Overview dashboard with archive counts, ranking, and recent member assignments.
- Timeline page for browsing completed and still-pending event rows in date order.
- Member browser with search and recent history per member.
- Authenticated collection page for storing personal collectible slot ownership.
- Admin workspace for managing members, event presets, and archive rows.
- Supabase-backed auth with route protection for collection and admin pages.

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

This keeps the browser-facing UI simple while centralizing data access, auth checks, and mutation logic in a small set of server-side helpers.

## Core Features

- Archive overview with leaderboard and recent assignments
- Event timeline browsing across show, birthday, and graduation rows
- Member-centric browsing with searchable archive history
- Personal collection tracking for signed-in users
- Admin-only member and event management flows
- Server-side auth and role checks for protected routes

## Project Structure

```text
.
|-- app/          # Next.js app-router pages
|-- components/   # Client and shared UI components
|-- lib/          # Data loaders, Supabase clients, server actions
|-- tests/        # Node-based tests
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

## Deployment

This project is designed to deploy cleanly on Vercel.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the three environment variables from `.env.local` to the Vercel project.
4. Deploy.

For production, keep `SUPABASE_SERVICE_ROLE_KEY` only in Vercel environment settings and never commit it into the repository.

## What This Project Demonstrates

- Building a focused full-stack product with Next.js App Router
- Separating page rendering, client UI, and server-side data access
- Using Supabase for auth, storage, and admin workflows
- Protecting routes with proxy and role-aware redirects
- Turning archive-style operational data into a cleaner, faster interface

## Potential Improvements

- Add more test coverage for server actions and archive transforms
- Document the expected Supabase schema in detail
- Add seed data or migration scripts for faster onboarding
- Add screenshots and deployment notes for public presentation

## License

No license has been added yet. If this repository is intended for public reuse, add a license file.
