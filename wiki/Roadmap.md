# Roadmap

EndlessBacklog's first release (Phase 1) is a complete, production-quality
Kanban core: workspaces, boards, lists, cards, labels, checklists,
attachments, comments, activity logs, real-time sync, notifications, and
full auth (password + TOTP 2FA + OAuth). Everything below is deliberately
**not** in that first release — tracked here so the scope is explicit.

## Board views

- **Calendar view** — cards with due dates plotted on a month/week calendar
- **Table/spreadsheet view** — sortable, filterable grid of cards with
  inline editing
- **Swimlanes** — group cards by member or label within a board

## Agile / planning extras

- **Sprints** — time-boxed groupings of cards with start/end dates
- **Story points** — an estimate field on cards
- **Burndown / velocity charts** — derived from sprints + story points +
  checklist/card completion over time

## Automation

- **Butler-style rule engine** — "when a card is moved to Done, archive it
  after 7 days," "when a due date passes, move the card to Blocked," etc.

## Sharing & templates

- **Board and card templates** — save a board or card as a reusable starting
  point
- **Public/guest share links** — read-only link to a board for people
  without an account

## Search

- **Workspace-wide search** — currently search/filter is per-board only

## Import / migration

- **Trello JSON import**
- **Cross-dialect data migration tool** (PostgreSQL ⇄ MariaDB on an
  instance that already has data — currently unsupported, see
  [Self-Hosting-Configuration.md](Self-Hosting-Configuration.md))

## Platform

- **API tokens + webhooks** for third-party integrations, beyond the
  session-based JWT auth the web app uses today
- **Mobile-responsive polish / PWA** — installable, offline-tolerant
- **Per-user notification preferences** — currently digest emails are
  on for everyone with unread notifications, with no opt-out
- **Time tracking** on cards
- **Archived-item browser** — currently archiving hides items with no UI to
  view/restore/permanently delete them yet

Have a feature you want prioritized? Open an issue — see
[Contributing.md](Contributing.md).
