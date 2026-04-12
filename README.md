# Ultimate Bun Starter v2

A full-stack starter with Bun, Hono, React, Drizzle ORM, and auth scaffolding.

## Features

- Bun backend with Hono
- React frontend with Vite
- Drizzle ORM with SQLite / Postgres support
- Local email/password auth + OAuth-ready routes
- Protected dashboard route with client-side guard
- Simple design system and starter pages
- One-command DB setup and dev scripts

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Prepare the database:

   ```bash
   bun run db:setup
   ```

4. Start local development:

   ```bash
   bun run dev
   ```

5. Open the frontend at `http://localhost:5173`.

## Environment

Set values in `.env` or use SQLite locally. If `DATABASE_URL` is unset, the starter uses SQLite by default.

- `DATABASE_URL` — Postgres connection string
- `SQLITE_FILE` — SQLite file path when using SQLite
- `JWT_SECRET` — secret used for auth tokens
- `GITHUB_CLIENT_ID` — optional GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` — optional GitHub OAuth client secret
- `OAUTH_REDIRECT_URI` — callback URL for OAuth providers
- `SEED_EMAIL` — optional seeded user email for `bun run db:seed`
- `SEED_PASSWORD` — optional seeded user password for `bun run db:seed`

### Seed a starter account

Create a default seeded account with:

```bash
bun run db:seed
```

The default account is:

- email: `hello@example.com`
- password: `password123`

Adjust `SEED_EMAIL` and `SEED_PASSWORD` in your `.env` before running the seed command if you want custom credentials.

## Targets

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Project Layout

- `src/server.ts` — Bun backend wrapper entrypoint that loads `src/backend/server.ts`
- `src/db` — Drizzle ORM client, schema, and setup
- `src/backend/routes` — API and auth routes
- `src/frontend` — React app and styles

## Commands

- `bun run dev` — run frontend + backend concurrently
- `bun run db:setup` — initialize the local database by applying migrations
- `bun run db:migrate` — apply new database migrations
- `bun run db:seed` — create a starter account if needed
- `bun run lint` — run ESLint checks
- `bun run lint:fix` — automatically fix lint issues
- `bun run format` — format code with Prettier
- `bun run build` — compile TypeScript and build the frontend

## Deployment

### Vercel

1. Connect the repo to Vercel.
2. Set the build command to:
   ```bash
   bun run build
   ```
3. Set the output directory to `dist`.
4. Configure environment variables in Vercel:
   - `JWT_SECRET`
   - `DATABASE_URL` (if using Postgres)
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `OAUTH_REDIRECT_URI`

### Bun Cloud

1. Deploy directly using Bun Cloud or any Bun-compatible platform.
2. Use `bun run build` as the build command.
3. Set the same environment variables as above.

### Local Production Preview

```bash
bun run build
bun run preview
```

### Notes

- If you are using SQLite locally, keep `SQLITE_FILE` in `.env`.
- For Postgres, set `DATABASE_URL`.
- Make sure `JWT_SECRET` is set in production.

## CI

This repo includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs:

- `bun install`
- `bun run tsc --noEmit`
- `bun run lint`
- `bun run db:setup`
- `bun run vite build`
# ultimate-bun-starter-v2
# JRoybalDevWeb
# JRoybalDevWeb
