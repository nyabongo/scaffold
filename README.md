# scaffold

[![CI](https://github.com/nyabongo/scaffold/actions/workflows/ci.yml/badge.svg)](https://github.com/nyabongo/scaffold/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A template repository for new projects: **NestJS** backend + **Angular** frontend, **Firebase** Google sign-in with custom `@username` profiles, full test coverage, VS Code debugging, devcontainers, and linting — all wired together as a pnpm monorepo.

## Using this as a template

1. Click **Use this template** on GitHub (or `git clone` and re-point the remote).
2. Rename the root package (`package.json` `name`), and update `README.md` — including the CI/license badge URLs above, which currently point at this template's own repo.
3. Update `DATABASE_URL` to point at your own Postgres instance.
4. That's it for local dev — `pnpm dev` runs against the local Firebase Auth emulator out of the box, no Firebase project required. See [Local dev: Firebase Auth emulator](#local-dev-firebase-auth-emulator) and [Deploying with a real Firebase project](#deploying-with-a-real-firebase-project) when you're ready to ship.

## Stack

| Layer           | Choice                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Backend         | NestJS 11, Prisma + PostgreSQL                                                                        |
| Frontend        | Angular 22 (standalone components, signals, `@if`/`@for`, esbuild/Vite)                               |
| Auth            | Firebase Auth (Google sign-in) — frontend gets an ID token, backend verifies it with `firebase-admin` |
| Unit tests      | Jest (backend), Vitest via Angular's built-in test builder (frontend)                                 |
| E2E tests       | Supertest (backend), Playwright (frontend)                                                            |
| Lint/format     | ESLint (flat config) + Prettier, enforced via Husky + lint-staged + commitlint                        |
| Dev environment | VS Code devcontainer (Node 24 + Postgres 15), `.vscode/launch.json` debug configs                     |

## Why Firebase Auth (not Auth.js)

Auth.js is built around full-stack frameworks (Next.js/SvelteKit/Solid) that own both the UI and the session/cookie handling. This repo is a decoupled SPA (Angular) talking to a separate API (NestJS) — Firebase Auth fits that shape natively: the Angular app gets a signed ID token from the Firebase Client SDK, and NestJS just verifies that token statelessly with `firebase-admin`. No shared sessions, no cross-origin cookie gymnastics.

## Auth + onboarding flow

1. User clicks **Continue with Google** → Firebase Client SDK popup → ID token.
2. Angular's `authInterceptor` attaches `Authorization: Bearer <idToken>` to every API call.
3. `GET /auth/me`: NestJS verifies the token, looks up the Firebase UID.
   - Found → profile returned, user lands on `/@username`.
   - Not found (404) → Angular redirects to `/onboard`.
4. `POST /auth/register` creates the user row with a chosen unique `username`.
5. Public profiles are served at `GET /profiles/:username` (backend) and rendered at `/@username` in Angular via a custom [`usernameMatcher`](apps/frontend/src/app/core/username.matcher.ts) route matcher.

## Getting started

### Option A — devcontainer (recommended)

Open the folder in VS Code and **Reopen in Container**. This provisions Node 24 + Postgres 15 and runs `pnpm install` automatically.

### Option B — bare metal

Requires Node ≥24 and a local (or remote) Postgres instance.

```sh
corepack enable
pnpm install
cp apps/backend/.env.example apps/backend/.env   # defaults already point at the local Auth emulator; just check DATABASE_URL
pnpm --filter backend exec prisma migrate deploy
pnpm dev   # runs backend (:3000), frontend (:4200), and the Firebase Auth emulator (:9099, UI on :4000) together
```

## Local dev: Firebase Auth emulator

No Firebase project, Google Cloud account, or real credentials are needed for local development. `pnpm dev` starts the [Firebase Auth emulator](https://firebase.google.com/docs/emulator-suite) alongside backend and frontend, using the `demo-scaffold` project ID (the `demo-` prefix puts it in a fully offline mode). Sign-in still goes through the normal **Continue with Google** button, but the emulator shows its own fake account picker instead of a real Google OAuth screen — pick or create a test user there.

- Config lives in `firebase.json` / `.firebaserc` (repo root), `apps/backend/.env.example` (`FIREBASE_AUTH_EMULATOR_HOST`), and `apps/frontend/src/environments/environment.ts` (`useAuthEmulator`, `authEmulatorHost`).
- The emulator UI (test users, etc.) is at [http://localhost:4000](http://localhost:4000).
- Emulator data resets each time it restarts — nothing persists between `pnpm dev` runs.

## Deploying with a real Firebase project

1. Create a Firebase project and enable the **Google** sign-in provider.
2. Copy the web app config into `apps/frontend/src/environments/environment.prod.ts`, and set `useAuthEmulator: false`.
3. Generate a service account key (Project Settings → Service Accounts) and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in your deployment environment — and remove `FIREBASE_AUTH_EMULATOR_HOST` so the backend uses real credentials instead of the emulator.

## Common scripts (from the repo root)

| Command                             | What it does                                        |
| ----------------------------------- | --------------------------------------------------- |
| `pnpm dev`                          | Run backend + frontend + Firebase Auth emulator     |
| `pnpm emulators`                    | Run only the Firebase Auth emulator                 |
| `pnpm build`                        | Build all workspace packages                        |
| `pnpm test` / `pnpm test:coverage`  | Run unit tests (with coverage) across all packages  |
| `pnpm e2e`                          | Backend Supertest e2e, then frontend Playwright e2e |
| `pnpm lint` / `pnpm lint:fix`       | Lint all packages                                   |
| `pnpm format` / `pnpm format:check` | Prettier across the repo                            |

Coverage thresholds are enforced at 90% (branches/functions/lines/statements) for the backend via Jest, and via Angular's coverage reporter for the frontend.

## Git hooks

- **pre-commit**: formats staged files (Prettier) and runs `pnpm -r lint`.
- **commit-msg**: enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint.
- **pre-push**: runs the full unit test suite.

## Project layout

```
apps/
  backend/    NestJS API — auth, users, profiles, Prisma schema/migrations
  frontend/   Angular app — login, onboarding, public @username profile pages
packages/
  shared-types/   Types shared between backend and frontend (User/Profile shapes, username validation)
```
