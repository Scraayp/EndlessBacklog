# Database layer

EndlessBacklog runs unmodified against **either PostgreSQL or MariaDB**, chosen
at deploy time via `DB_DIALECT` + `DATABASE_URL`. That only works because
every model and migration in this codebase sticks to a small set of
dialect-neutral rules. Follow these for any new migration/model:

1. **Primary keys**: `DataTypes.UUID` with the default generated in JS
   (`DataTypes.UUIDV4`), never a DB-side function (`gen_random_uuid()` is
   Postgres-only, `UUID()` is MySQL/MariaDB-only).
2. **No native enum types.** Postgres `ENUM` creates a real DB type that's
   painful to alter later, and MariaDB's enum semantics differ. Store the
   value as `STRING` and validate it with the shared zod schema /
   `as const` union in `packages/shared`.
3. **No `JSONB`, no Postgres arrays.** Use generic `DataTypes.JSON` (Sequelize
   maps it to the right underlying type per dialect) and join tables instead
   of arrays (see `card_labels`, `card_members`, `comment_mentions`).
4. **Booleans**: `DataTypes.BOOLEAN` — Sequelize normalizes Postgres
   `boolean` vs MariaDB `tinyint(1)` for you.
5. **Timestamps**: `DataTypes.DATE`, using Sequelize's built-in
   `createdAt`/`updatedAt` handling (mapped to `created_at`/`updated_at` via
   the global `underscored: true` model option).
6. **Case-insensitive uniqueness** (e.g. email): normalize to lowercase in
   application code (see `User`'s `beforeValidate` hook) and put a plain
   unique index on the column, rather than relying on Postgres's `citext`
   extension, which MariaDB doesn't have.
7. **Circular foreign keys** (e.g. `cards.cover_attachment_id` ->
   `attachments.id`, while `attachments.card_id` -> `cards.id`): create the
   column without a constraint in the first migration, then add the FK
   constraint in a later migration once both tables exist (see
   `20260101000008-create-cards.cjs` + `20260101000015-add-cards-cover-attachment-fk.cjs`).
8. If a migration truly cannot avoid raw SQL, branch explicitly on
   `queryInterface.sequelize.getDialect()` inside that one migration only —
   never scatter dialect checks through application code.

## Running migrations

```bash
pnpm --filter @endlessbacklog/backend migrate          # apply all pending migrations
pnpm --filter @endlessbacklog/backend migrate:undo      # roll back the last migration
pnpm --filter @endlessbacklog/backend seed:demo         # load demo data (optional, local dev only)
```

The Docker image runs `migrate` automatically on container start (see
`docker/backend.Dockerfile`'s entrypoint), so `docker compose up` always
brings the schema up to date — for either dialect.

**Switching dialects on a database that already has data is not supported.**
Pick MariaDB or PostgreSQL when you first set up the instance. Migrating
existing data between the two engines would need a dedicated export/import
tool — tracked as a Phase 2+ item in the [Roadmap wiki page](../wiki/Roadmap.md).
