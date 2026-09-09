# Deploying on Dokploy

[Dokploy](https://dokploy.com) is a self-hosted PaaS (Heroku/Vercel-style)
that can deploy a `docker-compose.yml` straight from a git repo, with
Traefik reverse-proxying and automatic Let's Encrypt HTTPS built in. This
repo's compose stack works there with no changes — you configure everything
through Dokploy's UI.

## 1. Point DNS at your Dokploy server first

Decide your domain(s) before deploying, since the frontend's API URL is
**baked into its build** (Vite inlines `VITE_API_URL`/`VITE_SOCKET_URL` at
build time — see [Self-Hosting-Configuration.md](Self-Hosting-Configuration.md)).
Two common layouts:

- One host, two subdomains: `app.yourdomain.com` (frontend) and
  `api.yourdomain.com` (backend)
- Point both at your Dokploy server's IP with an A record before deploying.

## 2. Create the Compose application

In Dokploy: **Create Project** → **Create Service → Compose** → connect this
repo (GitHub/GitLab/Bitbucket, or a plain git URL) → set **Compose Path** to
`docker-compose.yml` at the repo root. Dokploy clones the whole repo, which
is required — the Dockerfiles build from the repo root as context (they pull
in `packages/shared` alongside `apps/backend`/`apps/frontend`).

## 3. Set environment variables

Open the **Environment** tab and paste in a filled-out copy of
`.env.example` (see [Self-Hosting-Configuration.md](Self-Hosting-Configuration.md)
for what every variable means), with these Dokploy-specific points:

- `BASE_URL` → `https://api.yourdomain.com`
- `FRONTEND_URL` → `https://app.yourdomain.com`
- `VITE_API_URL` → `https://api.yourdomain.com` (must match `BASE_URL` —
  this gets baked into the frontend image at build time)
- `VITE_SOCKET_URL` → same as `VITE_API_URL`
- `DATABASE_URL` → keep the service name as the host (`postgres` or
  `mariadb`), e.g. `postgres://endlessbacklog:<password>@postgres:5432/endlessbacklog`
  — Dokploy runs the whole compose stack on one internal network, so
  service-name resolution works exactly like plain `docker compose up`.
- Generate real secrets for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and
  `TOTP_ENCRYPTION_KEY` (`openssl rand -base64 48`) — don't deploy with the
  `changeme`-style placeholders from `.env.example`.

### Picking the database profile

`docker-compose.yml` gates PostgreSQL/MariaDB behind Compose **profiles**
(`--profile postgres` / `--profile mariadb`) so only one starts. Dokploy's UI
doesn't currently expose a way to pass `--profile` to its `docker compose up`
call ([tracked upstream](https://github.com/Dokploy/dokploy/issues/2327)).
The workaround: Compose also activates profiles via the `COMPOSE_PROFILES`
environment variable, and Dokploy writes everything from its Environment tab
into a real `.env` file next to `docker-compose.yml` — which Compose loads
automatically. So just add one line to the environment variables above:

```dotenv
COMPOSE_PROFILES=postgres
# or: COMPOSE_PROFILES=mariadb
```

If that doesn't take effect on your Dokploy version, the alternative is to
use **Dokploy's own native Postgres/MySQL database** (Create Service →
Database) instead of the bundled `postgres`/`mariadb` compose service, and
point `DATABASE_URL` at that service's internal hostname — remove/ignore the
`postgres`/`mariadb` blocks in the compose file in that case.

## 4. Deploy

Click **Deploy**. Dokploy builds the `frontend` and `backend` images from
their Dockerfiles and starts every service. Backend startup runs pending
migrations automatically (see `docker/backend-entrypoint.sh`) — first boot
creates the whole schema.

## 5. Add domains

In the Compose application's **Domains** tab, add two domains (enable HTTPS
on both — Dokploy provisions Let's Encrypt certs automatically):

| Domain | Service | Port |
|---|---|---|
| `app.yourdomain.com` | `frontend` | `80` |
| `api.yourdomain.com` | `backend` | `4000` |

These must match `FRONTEND_URL`/`BASE_URL`/`VITE_API_URL`/`VITE_SOCKET_URL`
from step 3. Socket.io traffic rides over the same `backend`/port-4000
route as the REST API — no separate WebSocket configuration is needed,
Traefik upgrades the connection automatically.

MinIO's API (9000) and console (9001) don't need a domain — the backend
reaches MinIO over Dokploy's internal compose network by service name
(`minio`), and end users never talk to it directly (uploads/downloads go
through short-lived presigned URLs proxied by... no — see note below).

> **Note**: because attachments use presigned URLs the *browser* uploads to
> directly (see [Architecture.md](Architecture.md)), MinIO's API port does
> need to be reachable from your users' browsers if you want attachments to
> work from outside your server. Either add a third domain (e.g.
> `storage.yourdomain.com` → `minio` service → port `9000`) and set
> `S3_ENDPOINT=https://storage.yourdomain.com`, or swap MinIO for real AWS
> S3 (already supported — see
> [Self-Hosting-Configuration.md](Self-Hosting-Configuration.md)) which is
> publicly reachable by design.

## 6. Redeploying after changing public URLs

If you ever change `VITE_API_URL`/`VITE_SOCKET_URL`, you must redeploy (not
just restart) the `frontend` service — those values are compiled into the
static JS bundle at build time, not read at container runtime.

## Volumes and backups

The named volumes in `docker-compose.yml` (`postgres-data`, `mariadb-data`,
`redis-data`, `minio-data`) are created and managed by Dokploy like any
other compose deployment. Dokploy's built-in backup feature (S3-compatible
target) can be pointed at these — see Dokploy's own docs for volume backup
configuration, and [Self-Hosting-Configuration.md](Self-Hosting-Configuration.md#backups)
for what to back up and why.

---

Sources consulted while writing this page: [Dokploy Docker Compose docs](https://docs.dokploy.com/docs/core/docker-compose),
[Dokploy Domains docs](https://docs.dokploy.com/docs/core/docker-compose/domains),
[Dokploy issue #2327 on `--profile` support](https://github.com/Dokploy/dokploy/issues/2327).
This page hasn't been tested against a live Dokploy instance — if a step
doesn't match what you see in your Dokploy version, please open an issue
(see [Contributing.md](Contributing.md)) so it can be corrected.
