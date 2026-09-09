# Admin Guide

For workspace **admins** — see [Workspaces](Workspaces.md) for what
distinguishes admin/member/guest roles.

## Responsibilities

- Inviting and removing members
- Assigning and adjusting member roles
- Keeping at least one admin at all times (the UI enforces this — you can't
  demote or remove the last admin)
- Creating/archiving boards, and managing board-level membership for guests
  who shouldn't have blanket workspace access
- Keeping workspace details (name, description) up to date

## Inviting members

Workspace **Settings → Invite**. See
[Workspaces → Inviting members](Workspaces.md#inviting-members) for the
details and email flow.

## Managing roles

From **Settings**, use the role dropdown next to any member to promote or
demote them between admin/member/guest. Guests keep whatever board-level
access they've already been individually granted even after a role change —
role changes only affect *implicit* access via workspace membership.

## Removing a member

From **Settings**, use the trash icon next to a member. This removes their
workspace membership; it does **not** delete their user account (which may
belong to other workspaces) or their authored content (cards, comments stay
attributed to them).

## Transferring ownership / the "last admin" rule

There's no single "owner" concept beyond the admin role — any admin can
promote another member to admin. To fully step back from a workspace,
promote at least one other member to admin first, then have them remove you
(or demote yourself once someone else is admin).

## Guests and board-scoped access

Workspace guests are the right fit for external collaborators (contractors,
clients) who should see specific boards only:

1. Invite them to the workspace with the **guest** role.
2. Open the board(s) they need, and add them from the board's member list
   (**Boards → \[board\] → member list → add**) with an appropriate board
   role (member or observer).

They'll see only the boards they've been explicitly added to, never the full
workspace board list.

## Server-level administration

Day-to-day workspace administration is entirely in-app — there's currently
no separate "super admin" panel across workspaces. Server operators manage
the underlying infrastructure (database, backups, SMTP, OAuth apps) via
environment configuration — see
[Self-Hosting-Configuration](Self-Hosting-Configuration.md).
