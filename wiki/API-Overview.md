# API Overview

The backend exposes a REST API under `/api`, plus a Socket.io endpoint at
`/socket.io` for real-time events. There's no separate public API-key system
yet — the same JWT-based auth used by the web app is what integrators use
today (see [Roadmap](Roadmap.md) for a dedicated API token / webhook system).

## Authentication

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — returns `{ accessToken, refreshToken, expiresIn }`,
  or `{ pendingToken, method: "totp" }` if 2FA is enabled
- `POST /api/auth/2fa/verify` — exchanges a `pendingToken` + TOTP code for tokens
- `POST /api/auth/refresh` — rotates a refresh token for a new access token
- `POST /api/auth/logout` / `POST /api/auth/logout-all`
- `GET /api/auth/me` / `PATCH /api/auth/me`
- `POST /api/auth/verify-email`, `/forgot-password`, `/reset-password`, `/change-password`
- `POST /api/auth/2fa/setup`, `/2fa/confirm`, `/2fa/disable`
- `GET /api/auth/oauth/providers` — which OAuth providers are configured
- `GET /api/auth/oauth/:provider` — kicks off the OAuth redirect flow
- `POST /api/auth/oauth/exchange` — exchanges a one-time code (from the
  OAuth callback redirect) for a token pair

Authenticated requests send `Authorization: Bearer <accessToken>`. Access
tokens expire quickly (15 minutes by default); use the refresh endpoint to
get a new one without re-authenticating.

## Workspaces

- `POST /api/workspaces` — create
- `GET /api/workspaces` — list yours
- `GET /api/workspaces/:id`, `PATCH /api/workspaces/:id`
- `GET /api/workspaces/:id/boards`
- `GET /api/workspaces/:id/members`
- `POST /api/workspaces/:id/members/invite`
- `POST /api/workspaces/accept-invite`
- `PATCH /api/workspaces/:id/members/:memberId`
- `DELETE /api/workspaces/:id/members/:memberId`

## Boards, lists, labels

- `POST /api/boards`, `GET /api/boards/:id`, `PATCH /api/boards/:id`
- `GET /api/boards/:id/members`, `POST /api/boards/:id/members`, `DELETE /api/boards/:id/members/:userId`
- `GET /api/boards/:id/lists`, `GET /api/boards/:id/cards`, `GET /api/boards/:id/labels`
- `POST /api/lists`, `PATCH /api/lists/:id`, `POST /api/lists/:id/reorder`
- `POST /api/labels`, `PATCH /api/labels/:id`, `DELETE /api/labels/:id`

## Cards and sub-resources

- `POST /api/cards`, `GET /api/cards/:id` (full detail), `PATCH /api/cards/:id`
- `POST /api/cards/:id/move`
- `POST /api/cards/:id/labels`, `DELETE /api/cards/:id/labels/:labelId`
- `POST /api/cards/:id/members`, `DELETE /api/cards/:id/members/:userId`
- `GET /api/cards/:id/activity`
- `POST /api/checklists`, `PATCH/DELETE /api/checklists/:id`
- `POST /api/checklists/items`, `PATCH/DELETE /api/checklists/items/:id`
- `POST /api/comments`, `PATCH/DELETE /api/comments/:id`
- `POST /api/attachments/request-upload` → presigned PUT URL
- `POST /api/attachments/confirm-upload` → creates the DB record once the
  file has been PUT directly to storage
- `DELETE /api/attachments/:id`

## Notifications

- `GET /api/notifications`
- `POST /api/notifications/:id/read`, `POST /api/notifications/read-all`

## Error shape

Every error response is JSON:

```json
{ "error": { "code": "NOT_FOUND", "message": "Board not found", "details": {} } }
```

`code` is a stable machine-readable string; `details` is present for
validation errors (zod's flattened field errors).

## Real-time events (Socket.io)

Connect to `/socket.io` with `{ auth: { token: <accessToken> } }`. Join a
board's room with the `board:join` event (boardId), and listen for
`card:created`, `card:updated`, `card:moved`, `list:reordered`,
`comment:added`, `notification:new`, and more. The full event catalog is in
[Architecture.md](Architecture.md#realtime-socketio) and
`packages/shared/src/constants/socketEvents.ts`.
