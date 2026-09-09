# FAQ

**Is this really free?**
Yes — MIT licensed, no seat limits, no board limits. You pay only for the
server you run it on.

**Do I need both PostgreSQL and MariaDB?**
No — pick one. See [Self-Hosting-Configuration.md](Self-Hosting-Configuration.md#choosing-postgresql-vs-mariadb).

**Can I import my existing Trello boards?**
Not yet — a Trello JSON import tool is on the [Roadmap](Roadmap.md).

**Does it support mobile?**
The web app is responsive-ish but not yet polished for small screens; a
dedicated mobile pass is on the [Roadmap](Roadmap.md).

**Can guests outside my organization use it?**
Yes — invite them to a workspace with the **guest** role and add them to
specific boards only. See [Admin-Guide.md](Admin-Guide.md#guests-and-board-scoped-access).

**Is there an API for automation / integrations?**
The REST API used by the web app works today (JWT auth) — see
[API-Overview.md](API-Overview.md). A dedicated API-token + webhook system
for third-party integrations is on the [Roadmap](Roadmap.md).

**Why do I need to run a separate worker container?**
Emails and notifications are processed by a background job queue (BullMQ)
so a slow SMTP send never blocks an API request. The worker container runs
those jobs; if it's down, the app still works, but emails/reminders queue up
until it's back.

**Can I switch from PostgreSQL to MariaDB later?**
Not with existing data — see
[Self-Hosting-Configuration.md](Self-Hosting-Configuration.md) and
[apps/backend/database/README.md](../apps/backend/database/README.md). A
dedicated migration tool is on the [Roadmap](Roadmap.md).

**How do file uploads work — does the server proxy them?**
No — the backend hands your browser a short-lived signed URL, and the
browser uploads (and later downloads) directly against your object storage
(MinIO or S3). The API server never sees the file bytes.

**Something's broken — where do I report it?**
Open an issue on the GitHub repo. See [Contributing.md](Contributing.md).
