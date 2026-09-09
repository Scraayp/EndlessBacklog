# Database Schema

Full column-level detail lives in the migrations
(`apps/backend/database/migrations/`) and models (`apps/backend/src/models/`)
— this page is the map, not a copy of the DDL.

## Entity overview

```text
User ──< OAuthAccount
User ──< WorkspaceMember >── Workspace ──< Board ──< List ──< Card
User ──< BoardMember     >── Board
Board ──< Label
Card >──< Label            (via CardLabel)
Card >──< User              (via CardMember — assigned members)
Card ──< Checklist ──< ChecklistItem
Card ──< Attachment
Card ──< Comment ──< CommentMention >── User
Board ──< ActivityLog >── Card (optional)
User ──< Notification
```

## Tables

| Table | Key columns | Notes |
|---|---|---|
| `users` | email (unique, lowercased), password_hash (nullable — OAuth-only accounts), totp_* | |
| `oauth_accounts` | user_id, provider, provider_account_id (unique per provider) | |
| `workspaces` | slug (unique), created_by_id | |
| `workspace_members` | workspace_id, user_id (nullable — pending invite), invited_email, role, status | Unique on (workspace_id, user_id) |
| `boards` | workspace_id, background_type, background_value, position | |
| `board_members` | board_id, user_id, role | Unique on (board_id, user_id) |
| `lists` | board_id, position | |
| `cards` | list_id, board_id (denormalized for query/socket routing), position, due_date, cover_attachment_id | |
| `labels` | board_id, name (nullable), color (palette key, not a DB enum) | |
| `card_labels` / `card_members` | join tables | |
| `checklists` / `checklist_items` | cascade from card | |
| `attachments` | card_id, storage_key (MinIO/S3 object key), is_cover | |
| `comments` / `comment_mentions` | cascade from card | |
| `activity_logs` | board_id, card_id (nullable), actor_id, type, metadata (JSON) | Append-only |
| `notifications` | user_id, type, payload (JSON), is_read | |

## Dialect neutrality

Every table above works unmodified against both PostgreSQL and MariaDB — see
[apps/backend/database/README.md](../apps/backend/database/README.md) for the
specific rules (JS-generated UUIDs, no native enums, no JSONB/arrays,
app-layer lowercase email uniqueness, etc.) every migration follows.

## Ordering: fractional positions

`position` columns (on `boards`, `lists`, `cards`, `checklists`,
`checklist_items`) are floats, not integers. Moving an item between two
neighbors sets its position to the midpoint of theirs — an O(1) write with
no need to renumber siblings. When repeated inserts exhaust the available
floating-point precision between two neighbors, a rebalance pass
renormalizes the whole list. See `apps/backend/src/utils/position.ts`.

## Ephemeral data lives in Redis, not SQL

Email verification tokens, password reset tokens, workspace invite tokens,
OAuth exchange codes, and refresh tokens are **not** SQL tables — they're
Redis keys with a TTL (self-expiring, no cleanup job needed). See
`apps/backend/src/utils/ephemeralTokens.ts` and
`apps/backend/src/utils/refreshTokens.ts`.

## Migrations

```bash
pnpm --filter @endlessbacklog/backend migrate          # apply pending migrations
pnpm --filter @endlessbacklog/backend migrate:undo      # roll back the last one
pnpm --filter @endlessbacklog/backend seed:demo         # optional demo data
```

New migrations: add a paired up/down file to
`apps/backend/database/migrations/`, following the dialect-neutrality rules
in `apps/backend/database/README.md`.
