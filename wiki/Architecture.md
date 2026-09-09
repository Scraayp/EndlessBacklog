# Architecture

## Monorepo layout

pnpm workspaces + Turborepo:

```text
apps/
  frontend/   React + Vite SPA
  backend/    Express API + Socket.io + BullMQ workers
packages/
  shared/               types, zod schemas, constants shared by both apps
  config-typescript/    shared tsconfig bases
  config-eslint/        shared eslint flat config
```

`packages/shared` is a real built package (`tsc` emits `dist/`) — both apps
depend on it as `workspace:*` and import compiled output, not raw source,
which keeps each app's own TypeScript project boundaries (`rootDir`)
correct. See [Contributing.md](Contributing.md#building-the-shared-package)
if you're iterating on it locally.

## Backend layering

```text
routes/       Express Router — path + middleware wiring only
controllers/  parse req, call a service, shape the HTTP response
services/     business logic — transactions, socket emits, job enqueues
repositories/ Sequelize query encapsulation, no HTTP concerns
models/       Sequelize model definitions + associations
```

Cross-cutting middleware: `auth.ts` (JWT verification → `req.user`),
`rbac.ts` (workspace/board role checks → `req.workspaceMembership` /
`req.board` / `req.boardEffectiveRole`), `validate.ts` (zod, using the same
schemas from `packages/shared` the frontend uses for form validation),
`errorHandler.ts` (maps `AppError`/`ZodError`/Sequelize errors to a
consistent JSON error shape).

## Request lifecycle (example: moving a card)

1. `POST /api/cards/:id/move` hits `routes/cards.ts`.
2. `requireAuth` verifies the JWT; `requireBoardRole("member", ...)` resolves
   the card → board → checks the caller's effective role (see
   `middleware/rbac.ts`).
3. `validate(moveCardSchema)` parses the body.
4. `cardController.move` calls `cardService.move`.
5. The service computes a new fractional `position` (see
   `utils/position.ts`), persists it, records an `ActivityLog` row, and
   emits `card:moved` to the board's Socket.io room.
6. Every other browser with that board open has a `useBoardSocket` hook
   listening for `card:moved` and patches its local TanStack Query cache —
   no refetch needed.

## Real-time (Socket.io)

- One Socket.io `Server` per API process, using `@socket.io/redis-adapter`
  so events fan out correctly across multiple backend replicas.
- Clients authenticate on connect via `{ auth: { token } }` (JWT).
- Rooms: `board:{boardId}` (joined explicitly after a server-side membership
  check), `user:{userId}` (auto-joined on connect, used for personal
  notifications), `workspace:{workspaceId}`.
- The **worker** process (background jobs) has no Socket.io `Server` of its
  own — it pushes events into the same Redis pub/sub channel via
  `@socket.io/redis-emitter` (see `src/sockets/emitter.ts`), which the API
  process's connected clients receive transparently.

Full event catalog: `packages/shared/src/constants/socketEvents.ts`.

## Background jobs (BullMQ)

| Queue | Purpose |
|---|---|
| `email` | Every outbound transactional email (verify, reset, invite, due-soon, digest) |
| `notification` | Creates a `Notification` row + emits `notification:new` — decouples notification fan-out from the request that triggered it |
| `due-date-scan` | Repeatable (every 15 min): finds cards due soon, enqueues reminders |
| `digest` | Repeatable (daily, 08:00): emails anyone with unread notifications |

The worker process (`src/worker.ts`) runs one `Worker` per queue, built from
the same Docker image as the API but started with a different container
command (`worker` vs `api` — see `docker/backend-entrypoint.sh`).

## Auth flow

- **Access tokens**: short-lived JWTs (15 min default), stateless
  verification (no Redis round-trip per request).
- **Refresh tokens**: opaque, stored hashed in Redis by "family," rotated on
  every use. Presenting a stale (already-rotated) token revokes the whole
  family — a theft-detection signal that forces re-login on every device
  sharing that family. See `src/utils/refreshTokens.ts`.
- **2FA**: TOTP via `otplib`; the secret is only persisted (AES-256-GCM
  encrypted) after the user proves they scanned it correctly. See
  `src/services/twoFactorService.ts`.
- **OAuth**: Passport strategies handle the provider redirect; the callback
  mints a one-time exchange code in Redis (60s TTL) and redirects the
  browser to the frontend, which exchanges that code for a real token pair
  over a normal JSON POST — keeps JWTs out of browser history/referrers. See
  `src/services/oauthService.ts`.

## Frontend architecture

- **Routing**: React Router v7 (library mode). The card detail view is a
  nested route (`/boards/:boardId/cards/:cardId`) rendered as an overlay
  dialog so the board underneath stays mounted.
- **Server state**: TanStack Query owns everything from the API — boards,
  lists, cards, members, notifications — with optimistic updates on
  drag/move mutations (`features/boards/hooks.ts`) for instant feedback.
  `useBoardSocket` merges incoming Socket.io events into the *same* query
  cache, so local optimism and remote updates share one source of truth.
- **Client state**: Zustand for state with no server counterpart — auth
  tokens in memory (`stores/authStore.ts`), theme preference
  (`stores/themeStore.ts`).
- **Drag and drop**: dnd-kit. Lists live in one horizontal `SortableContext`;
  each list's cards live in their own vertical `SortableContext`. Cross-list
  card drags are handled by reparenting the card into the query cache during
  `onDragOver` (dnd-kit's standard multi-container pattern), then persisting
  the final position on `onDragEnd`.
- **Theming**: Tailwind v4 CSS-variable tokens (`src/styles/theme.css`), a
  `.dark`/`.light` class on `<html>` toggled by `themeStore`, with a
  `prefers-color-scheme` fallback when no explicit choice has been made.
