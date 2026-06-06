# Supabase + Next.js + Expo Template

A starter monorepo combining a Next.js web app, Supabase backend (migrations and config), and an Expo template app.

## Overview

- `nextjs/` — Next.js 14 app with Tailwind, Supabase integration, and an admin/student/teacher area.
- `supabase/` — Supabase project files: `config.toml` and SQL migrations.
- `supabase-expo-template/` — Minimal Expo app integrated with Supabase for mobile clients.

## Quickstart

Prerequisites:

- Node.js (v18+ recommended)
- npm or yarn
- Supabase CLI (optional, for running migrations)

Run the web app (Next.js):

```bash
cd nextjs
npm install
npm run dev
```

Run the Expo app:

```bash
cd supabase-expo-template
npm install
npx expo start
```

## Supabase (local/dev)

The `supabase/` folder contains `config.toml` and SQL migrations used to provision the database and storage policies.

To apply migrations locally (using the Supabase CLI):

```bash
cd supabase
supabase db push
# or run each migration with your preferred workflow
```

See `supabase/migrations/` for migration files (timestamped SQL files).

## Environment variables

The Next.js and Expo apps expect Supabase credentials in environment variables. Typical variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

For the Next.js app, add them to `.env.local` in `nextjs/`.

## Project layout (high level)

- `nextjs/src/app/` — App routes, auth flows, admin/student/teacher areas and components.
- `nextjs/src/lib/` — Utilities, Supabase client, types, and context.
- `supabase/migrations/` — SQL migrations for schema + storage policies.
- `supabase/config.toml` — Supabase project configuration.

## Development tips

- The Next.js app includes middleware and server-side auth; run the repo with the Next.js dev server during feature work.
- Keep Supabase migrations in source control and run them when provisioning new environments.

## Contributing

Feel free to open PRs. Follow existing code style in `nextjs/` (TypeScript + Tailwind). Add migrations when changing DB schema.

## License

See the `LICENSE` file at repository root.
