# Contributing

## Getting set up

```bash
git clone https://github.com/<you>/EndlessBacklog.git
cd EndlessBacklog
pnpm install
cp .env.example .env   # point at local services — see below
```

You need PostgreSQL (or MariaDB), Redis, and MinIO reachable somewhere. The
easiest way locally is to start just the infrastructure via Docker and run
the apps on your host:

```bash
docker compose --profile postgres up -d postgres redis minio minio-init
# edit .env: DATABASE_URL/REDIS_URL/S3_ENDPOINT → localhost instead of
# the in-compose service names (postgres/redis/minio)

pnpm --filter @endlessbacklog/shared build
pnpm --filter @endlessbacklog/backend migrate
pnpm dev   # runs frontend + backend + worker together via Turborepo
```

### Building the shared package

`packages/shared` is a real built package (types, zod schemas, constants
used by both apps) — both apps import its compiled `dist/` output, not raw
source, to keep each app's own TypeScript `rootDir` boundaries correct. If
you change anything under `packages/shared/src`, rebuild it (or run
`pnpm --filter @endlessbacklog/shared dev` in a separate terminal to
watch-rebuild) before the frontend/backend will pick it up.

## Project structure

See [Architecture.md](Architecture.md) for the full layout and reasoning.
Short version: `apps/frontend` (React SPA), `apps/backend` (Express API +
Socket.io + BullMQ worker), `packages/shared` (types/schemas/constants),
`packages/config-*` (shared tsconfig/eslint bases).

## Coding standards

- **TypeScript strict mode** everywhere — no new `any` without a comment
  explaining why (a few exist today for Sequelize's dynamic association
  access and loosely-typed OAuth profile objects; keep new ones to genuine
  cases like that, not convenience).
- **Layering is enforced by convention, not tooling** — routes stay thin,
  business logic lives in services, Sequelize queries stay in repositories.
  See [Architecture.md](Architecture.md#backend-layering).
- **Shared validation** — request/response shapes belong in
  `packages/shared/src/schemas` (zod) so the frontend's forms and the
  backend's `validate()` middleware can never disagree.
- Run `pnpm lint` and `pnpm typecheck` (via Turborepo, from the repo root)
  before opening a PR — both must be clean.

## Running tests

```bash
pnpm test              # unit tests across every package, via Turborepo
pnpm --filter @endlessbacklog/backend test    # backend only
pnpm --filter @endlessbacklog/frontend test   # frontend only
```

Backend unit tests run against dummy env values (see
`apps/backend/vitest.config.ts`) and don't need a live database/Redis —
they cover pure logic (fractional positioning, token encryption, etc).
Service/repository-level integration tests against a real database, and
Playwright end-to-end tests for the full register → board → drag → live
-update flow, are part of ongoing hardening work — see
[Roadmap.md](Roadmap.md) and feel free to contribute more coverage.

## Branch / PR workflow

1. Branch off `main` — `git checkout -b <short-description>`.
2. Keep commits focused; a clear message beats a squashed wall of "wip".
3. Open a PR against `main`. Describe *why*, not just *what*, if the change
   isn't obvious from the diff.
4. Make sure `pnpm lint`, `pnpm typecheck`, and `pnpm test` all pass.
5. One approving review before merge.

## Reporting bugs / requesting features

Open a GitHub issue. For bugs, include: what you did, what you expected,
what happened instead, and your `DB_DIALECT` (Postgres vs. MariaDB issues
sometimes differ). For features, check [Roadmap.md](Roadmap.md) first — it
may already be tracked.
