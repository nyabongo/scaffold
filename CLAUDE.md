# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is `scaffold` — a template repository (NestJS + Angular + Firebase auth + Prisma/Postgres), meant to be used as a starting point for new projects, not a product with users. Prefer patterns already established here over inventing new ones.

pnpm monorepo (Node >=24, pinned via `packageManager` in root `package.json`; use `corepack enable`):

- `apps/backend` — NestJS 11 API, Prisma 6 + PostgreSQL, Firebase Admin SDK verifies ID tokens
- `apps/frontend` — Angular 22 SPA (standalone components, signals, `@if`/`@for` control flow), Firebase client SDK
- `packages/shared-types` (`@scaffold/shared-types`) — plain TS interfaces/constants shared between the two apps (e.g. `UserProfile`, `USERNAME_PATTERN`), consumed via `workspace:*` and built with `tsc`. It's rebuilt automatically by the root `postinstall` script — run `pnpm install` after changing it so backend/frontend pick up the new build.

## Commands

All commands run from the repo root using pnpm workspace filtering unless noted.

```bash
# Setup
corepack enable && pnpm install          # installs deps, builds shared-types via postinstall
cp apps/backend/.env.example apps/backend/.env   # set DATABASE_URL, Firebase project vars
pnpm --filter backend exec prisma migrate deploy # apply migrations to your Postgres

# Dev servers (backend :3000, frontend :4200)
pnpm dev                                 # runs both in parallel

# Build / lint / format (recurse across all packages)
pnpm build
pnpm lint            # pnpm lint:fix to auto-fix
pnpm format:check     # pnpm format to write

# Tests (recurse across all packages)
pnpm test
pnpm test:coverage
pnpm e2e              # backend e2e then frontend (Playwright) e2e

# Single package / single test
pnpm --filter backend test -- auth.controller.spec.ts   # backend: jest, spec files colocated with source
pnpm --filter backend test:e2e                            # backend e2e (needs a live Postgres + migrations applied)
pnpm --filter frontend test                                # frontend: Vitest via Angular's test builder
pnpm --filter frontend e2e                                 # Playwright

# Prisma (backend)
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate     # prisma migrate dev
```

Notes:

- The recommended dev setup is the VS Code devcontainer (`.devcontainer/`), which provisions Node 24 + Postgres 15 and runs `pnpm install` automatically. Bare-metal setup needs its own local Postgres.
- **Prisma client must be generated (`prisma:generate`) before linting or building the backend** — Nest/TS code imports `@prisma/client` types that only exist post-generation. CI does this explicitly before every lint/test/build job.
- Coverage thresholds are enforced (backend via Jest config, frontend via `angular.json`): statements/functions/lines at 90%, branches capped at 80% (NestJS DI constructor helpers create branches Istanbul can't fully reach).
- Git hooks (Husky): pre-commit runs lint-staged (Prettier) + `pnpm -r lint`; commit-msg enforces Conventional Commits (commitlint); pre-push runs the full unit test suite. Don't bypass these with `--no-verify`.

## Architecture

### Auth flow (spans both apps)

Firebase Auth was chosen over session-based auth (e.g. Auth.js) because the SPA + separate API split fits Firebase's stateless ID-token model better than server-rendered sessions.

1. Frontend: Google sign-in popup → Firebase ID token → `authInterceptor` (`apps/frontend/src/app/core/auth/`) attaches it as a Bearer token to API requests.
2. Backend: `FirebaseAuthGuard` (`apps/backend/src/auth/firebase-auth.guard.ts`) verifies the token via `firebase-admin` (provider in `firebase-admin.provider.ts`); verified user is exposed to handlers via `@CurrentUser()` (`current-user.decorator.ts`).
3. `GET /auth/me` — if a matching user exists, frontend routes to their profile at `/@username`; a 404 sends the user to `/onboard` to pick a username, which calls `POST /auth/register` to create the user (uniqueness enforced on `username`).
4. Public profiles: `GET /profiles/:username` (backend, `profiles/`) ↔ Angular route `/@username` (frontend), matched via a custom route matcher (`apps/frontend/src/app/core/username.matcher.ts`) rather than a static path segment.

### Backend module layout (`apps/backend/src/`)

Standard Nest module-per-feature: `auth/` (guard, decorator, firebase provider, DTOs with class-validator), `users/` (service + mapper — mapper separates Prisma model shape from API/shared-types shape), `profiles/` (public-facing controller), `prisma/` (`PrismaModule`/`PrismaService` wrapping `@prisma/client`). Single Prisma model currently: `User` (`prisma/schema.prisma`).

### Frontend layout (`apps/frontend/src/app/`)

`core/` holds cross-cutting singletons: `firebase.ts` (SDK init), `auth/` (service, guard, interceptor), `api.service.ts`, `username.matcher.ts`. `pages/` holds routed feature components (`home`, `login`, `onboard`, `profile`), all standalone.

### Shared types boundary

Anything that crosses the backend/frontend HTTP boundary (request/response DTOs, the `User`/`Profile` shapes, the username regex) belongs in `packages/shared-types`, not duplicated in each app. When changing an API contract, update `shared-types` first, then both consumers.
