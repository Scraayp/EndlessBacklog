<p align="center">
  <img src="apps/frontend/public/png/logo-mark-512.png" width="88" height="88" alt="EndlessBacklog logo">
</p>

<h1 align="center">EndlessBacklog</h1>

<p align="center"><strong>A free, self-hosted Trello alternative and agile planning board.</strong></p>

Boards, lists, cards, checklists, labels, comments, attachments, real-time
collaboration, notifications, two-factor auth, OAuth login — without anyone's
workspace or seat limits. Run it on your own server with Docker Compose.

[![License: MIT](https://img.shields.io/badge/license-MIT-4bce97.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-4bce97.svg)](package.json)
[![Docker Compose](https://img.shields.io/badge/deploy-docker%20compose-4bce97.svg)](docker-compose.yml)

---

## Why

Trello (and similar hosted tools) cap how many boards you can create and how
many people you can invite into a workspace. EndlessBacklog has no such
limits — it's your server, your database, your users.

## Features

- **Workspaces & boards** — organizations with admin/member/guest roles, each
  holding any number of Kanban boards
- **Lists & cards** with live drag-and-drop, synced instantly to every open
  browser via WebSockets
- **Card details** — rich-text descriptions, due dates, checklists with
  progress bars, colored labels, member assignment, file attachments,
  threaded comments with @mentions, and a full activity log
- **Search & filter** boards by label, member, due date, or text
- **Notifications** — in-app and email (assignment, mentions, due-date
  reminders), plus a daily digest
- **Auth** — email/password (with email verification and password reset),
  optional TOTP two-factor authentication, and optional OAuth/SSO login via
  Google, GitHub, Microsoft, or Discord
- **Light & dark themes**, green branding throughout, switchable per-user
- **Self-hosted end to end** — your choice of PostgreSQL or MariaDB, Redis
  for caching/sessions/jobs, MinIO (S3-compatible) for attachments, and your
  own SMTP provider for outbound mail

See [wiki/Roadmap.md](wiki/Roadmap.md) for what's planned next (calendar/table
views, automation rules, sprints & story points, board templates, guest share
links, and more).

## Screenshots

> _Board view (light) · Board view (dark) · Card detail_
>
> Add screenshots here once you have a running instance — `docker compose
> --profile postgres up -d`, log in, and drop PNGs into `docs/screenshots/`.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Query, Zustand, dnd-kit, TipTap |
| Backend | Node.js, Express 5, TypeScript, Socket.io |
| Database | PostgreSQL **or** MariaDB, via Sequelize (dialect chosen at deploy time) |
| Cache / queue | Redis, BullMQ |
| Object storage | MinIO (S3-compatible) |
| Email | SMTP (nodemailer) |
| Auth | JWT access/refresh, TOTP 2FA, OAuth (Google/GitHub/Microsoft/Discord) |
| Deployment | Docker Compose |

## Architecture

```text
Browser ── HTTP/WS ──▶ frontend (nginx, static SPA)
Browser ── HTTP/WS ──▶ backend  (Express API + Socket.io)
                              │
                              ├──▶ PostgreSQL or MariaDB (durable data)
                              ├──▶ Redis (cache, sessions, job queue, socket scaling)
                              ├──▶ MinIO (attachments, presigned upload/download)
                              └──▶ SMTP (transactional email)
backend-worker (same image, different process) ──▶ Redis (BullMQ jobs) ──▶ SMTP / DB
```

The frontend and backend are separate containers on separate ports — there's
no bundled reverse proxy, so front them with whatever you already run
(nginx, Caddy, Traefik, a cloud load balancer) if you want a single domain
and TLS. See [wiki/Self-Hosting-Configuration.md](wiki/Self-Hosting-Configuration.md).

For the full request/data-flow breakdown, socket room design, and background
job layout, see [wiki/Architecture.md](wiki/Architecture.md).

## Quickstart

Requires Docker and Docker Compose.

```bash
git clone https://github.com/<you>/EndlessBacklog.git
cd EndlessBacklog
cp .env.example .env
# Edit .env: set real secrets (JWT/TOTP keys), your SMTP credentials, and
# confirm DB_DIALECT/DATABASE_URL match the profile you're about to start.

docker compose --profile postgres up -d --build
# ...or: docker compose --profile mariadb up -d --build

# First run only: seed a demo workspace/board (optional)
docker compose exec backend pnpm seed:demo
```

Open `http://localhost:3000`. If you ran the demo seed, log in with
`demo@endlessbacklog.local` / `DemoPass123!`.

## Choosing your database

`DB_DIALECT` (`postgres` or `mariadb`) and the matching `--profile` flag
control everything — the backend runs unmodified against either engine (see
[apps/backend/database/README.md](apps/backend/database/README.md) for how).
Pick one at first setup; switching dialects on a database that already has
data isn't supported (tracked as a roadmap item).

## Configuration

All configuration lives in `.env` (copy from `.env.example`). Key variables:

| Variable | Description |
|---|---|
| `DB_DIALECT`, `DATABASE_URL` | `postgres` or `mariadb`, and the connection string |
| `REDIS_URL` | Redis connection string |
| `S3_*`, `MINIO_ROOT_USER/PASSWORD` | MinIO/S3 endpoint and credentials |
| `SMTP_*`, `MAIL_FROM` | Outbound email (Purelymail or any SMTP provider) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `TOTP_ENCRYPTION_KEY` | Random 32+ character secrets — generate with `openssl rand -base64 48` |
| `OAUTH_*_CLIENT_ID/SECRET` | Optional — omit a provider to hide its login button |
| `BASE_URL`, `FRONTEND_URL`, `VITE_API_URL`, `VITE_SOCKET_URL` | Public URLs the browser and backend use to reach each other |

Full reference with every variable: [wiki/Self-Hosting-Configuration.md](wiki/Self-Hosting-Configuration.md).

## Local development (without Docker)

```bash
pnpm install
cp .env.example .env   # point DATABASE_URL/REDIS_URL/S3_ENDPOINT at local services
pnpm --filter @endlessbacklog/shared build
pnpm --filter @endlessbacklog/backend migrate
pnpm dev                # runs frontend + backend + worker via Turborepo
```

You'll still need Postgres/MariaDB, Redis, and MinIO running somewhere
reachable — the quickest way is `docker compose --profile postgres up -d
postgres redis minio minio-init` and pointing `.env` at `localhost` instead
of the service names.

## Documentation

- [wiki/Getting-Started.md](wiki/Getting-Started.md) — first login, first board
- [wiki/Self-Hosting-Configuration.md](wiki/Self-Hosting-Configuration.md) — every env var, OAuth app setup, backups
- [wiki/Deploying-on-Dokploy.md](wiki/Deploying-on-Dokploy.md) — running the stack on Dokploy specifically
- [wiki/Architecture.md](wiki/Architecture.md) — how the pieces fit together
- [wiki/API-Overview.md](wiki/API-Overview.md) — REST endpoint map
- [wiki/Database-Schema.md](wiki/Database-Schema.md) — tables and relationships
- [wiki/Roadmap.md](wiki/Roadmap.md) — what's next
- Full index: [wiki/Home.md](wiki/Home.md)

These files are written to be pasted directly into this repo's GitHub Wiki —
see [wiki/README.md](wiki/README.md) for how.

## Contributing

See [wiki/Contributing.md](wiki/Contributing.md) for the branch/PR workflow,
coding standards, and how to run the test suite.

## License

[MIT](LICENSE)
