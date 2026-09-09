# Self-Hosting Configuration

Everything is configured through environment variables, set in `.env`
(copy from `.env.example` at the repo root) and read by `docker-compose.yml`.

## Full environment variable reference

### General

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `production` | `development`, `test`, or `production` |
| `BASE_URL` | — | Public URL of the backend API, as reachable from browsers |
| `FRONTEND_URL` | — | Public URL of the frontend |
| `FRONTEND_PORT` | `3000` | Host port mapped to the frontend container |
| `BACKEND_PORT` | `4000` | Host port mapped to the backend container |
| `VITE_API_URL` | — | Baked into the frontend bundle at *build* time — must match `BASE_URL` |
| `VITE_SOCKET_URL` | — | Baked into the frontend bundle at *build* time — must match `BASE_URL` |
| `CORS_ORIGIN` | `FRONTEND_URL` | Comma-separated list of allowed CORS origins |

### Database

| Variable | Default | Description |
|---|---|---|
| `DB_DIALECT` | `postgres` | `postgres` or `mariadb` — must match the `--profile` flag |
| `DB_SSL` | `false` | Set `true` to require TLS to the database |
| `DATABASE_URL` | — | Full connection string, e.g. `postgres://user:pass@postgres:5432/db` |
| `POSTGRES_DB/USER/PASSWORD` | — | Used only by the `postgres` container itself |
| `MARIADB_DATABASE/USER/PASSWORD/ROOT_PASSWORD` | — | Used only by the `mariadb` container itself |

See [Database-Schema.md](Database-Schema.md) and
[apps/backend/database/README.md](../apps/backend/database/README.md) for
how dialect-neutrality works.

### Redis

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://redis:6379` | Used for caching, sessions/refresh-tokens, rate limiting, and BullMQ job queues |

### Object storage (MinIO / S3)

| Variable | Default | Description |
|---|---|---|
| `S3_ENDPOINT` | `http://minio:9000` | S3-compatible endpoint |
| `S3_REGION` | `us-east-1` | Arbitrary for MinIO; matters for real S3 |
| `S3_BUCKET` | `endlessbacklog-attachments` | Bucket for attachments/avatars |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | — | Credentials |
| `S3_FORCE_PATH_STYLE` | `true` | Required for MinIO; set `false` for real AWS S3 |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | — | MinIO server's own admin credentials (should match `S3_ACCESS_KEY`/`S3_SECRET_KEY`) |
| `MINIO_API_PORT` / `MINIO_CONSOLE_PORT` | `9000` / `9001` | Host ports for the MinIO API and web console |

**Migrating to real AWS S3 later**: set `S3_ENDPOINT` to your S3 regional
endpoint, `S3_FORCE_PATH_STYLE=false`, and real IAM credentials — no code
changes needed (see `apps/backend/src/services/storageService.ts`).

### Email (SMTP)

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | `smtp.purelymail.com` | Any SMTP host works |
| `SMTP_PORT` | `465` | `465` for implicit TLS, `587` for STARTTLS |
| `SMTP_SECURE` | `true` | `true` for port 465, `false` for port 587 |
| `SMTP_USER` / `SMTP_PASS` | — | SMTP credentials |
| `MAIL_FROM` | — | e.g. `"EndlessBacklog <you@yourdomain.com>"` |

**Purelymail specifics**: IMAP/POP3 aren't used by EndlessBacklog (outbound
mail only). Use port 465 with `SMTP_SECURE=true`, or port 587 with
`SMTP_SECURE=false` if your network blocks 465.

### Auth secrets

| Variable | Description |
|---|---|
| `JWT_ACCESS_SECRET` | Signs short-lived access tokens — 32+ random characters |
| `JWT_REFRESH_SECRET` | Signs the 2FA "pending" token — 32+ random characters, different from the above |
| `JWT_ACCESS_TTL_SECONDS` | Access token lifetime (default 900 = 15 min) |
| `JWT_REFRESH_TTL_SECONDS` | Refresh token lifetime (default 2592000 = 30 days) |
| `TOTP_ENCRYPTION_KEY` | Encrypts stored TOTP secrets at rest — 32+ random characters |

Generate each with `openssl rand -base64 48`. Use a **different** value for
each secret.

### OAuth / SSO (optional)

Leave a provider's client ID blank to hide its login button entirely — no
other configuration is needed to disable it.

| Variable | Description |
|---|---|
| `OAUTH_GOOGLE_CLIENT_ID` / `OAUTH_GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` | From a GitHub OAuth App |
| `OAUTH_MICROSOFT_CLIENT_ID` / `OAUTH_MICROSOFT_CLIENT_SECRET` | From Azure App Registrations |
| `OAUTH_DISCORD_CLIENT_ID` / `OAUTH_DISCORD_CLIENT_SECRET` | From a Discord Developer Portal application |

For each provider, register an app with a callback URL of:

```text
<BASE_URL>/api/auth/oauth/<provider>/callback
```

e.g. `https://api.yourdomain.com/api/auth/oauth/google/callback`.

- **Google**: [console.cloud.google.com](https://console.cloud.google.com) →
  APIs & Services → Credentials → Create OAuth client ID (Web application) →
  add the callback URL under "Authorized redirect URIs".
- **GitHub**: Settings → Developer settings → OAuth Apps → New OAuth App →
  set "Authorization callback URL" to the URL above.
- **Microsoft**: [Azure Portal](https://portal.azure.com) → App
  registrations → New registration → add the callback URL as a "Web"
  redirect URI, then create a client secret under "Certificates & secrets".
- **Discord**: [Discord Developer Portal](https://discord.com/developers/applications)
  → New Application → OAuth2 → add the callback URL under "Redirects" →
  the Client ID is on the OAuth2 page, and "Reset Secret" generates the
  Client Secret.

## Choosing PostgreSQL vs. MariaDB

Both are supported equally — pick whichever you already run or prefer
operating. Start the stack with the matching profile:

```bash
docker compose --profile postgres up -d --build
# or
docker compose --profile mariadb up -d --build
```

`DB_DIALECT` and `DATABASE_URL` in `.env` must agree with whichever profile
you chose. See [apps/backend/database/README.md](../apps/backend/database/README.md).

## Backups

- **Database**: back up the named Docker volume (`endlessbacklog_postgres-data`
  or `endlessbacklog_mariadb-data`), or use your engine's native dump tool
  against the running container, e.g.:

  ```bash
  docker compose exec postgres pg_dump -U endlessbacklog endlessbacklog > backup.sql
  # or
  docker compose exec mariadb mysqldump -u endlessbacklog -p endlessbacklog > backup.sql
  ```

- **Attachments**: back up the `endlessbacklog_minio-data` volume, or use
  `mc mirror` against the running MinIO container to copy objects out.
- **Redis** holds only caches, sessions, and in-flight job data — nothing
  that needs backing up (losing it just logs everyone out and clears
  pending background jobs).

## Reverse proxy / HTTPS

EndlessBacklog's Docker Compose stack doesn't include a reverse proxy or TLS
termination — the `frontend` and `backend` containers each expose a plain
HTTP port. If you want a single public domain with HTTPS, put your own
reverse proxy (nginx, Caddy, Traefik, a cloud load balancer) in front of
both, proxying `/` to `frontend:80` and `/api`, `/socket.io` to
`backend:4000` — or run them on separate subdomains and point `VITE_API_URL`
/`VITE_SOCKET_URL` at the API's subdomain.

## Updating / re-running migrations

`docker compose --profile <postgres|mariadb> up -d --build` rebuilds and
restarts everything; the backend's entrypoint always runs any pending
migrations before starting, so upgrades are just "pull, rebuild, restart."
