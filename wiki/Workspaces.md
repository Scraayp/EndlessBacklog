# Workspaces

A workspace is a container for boards and the people who can access them —
similar to a Trello "Workspace" or a Slack "org." You can belong to any
number of workspaces.

## Roles

| Role | Can do |
|---|---|
| **Admin** | Everything a member can, plus: invite/remove members, change member roles, update workspace settings, and (implicitly) manage every board in the workspace as a board admin |
| **Member** | Create boards, and access every board in the workspace as a board member (unless a board's own membership says otherwise) |
| **Guest** | No automatic access to any board — must be explicitly added to individual boards by a board admin. Useful for external collaborators who should only see one or two boards, not the whole workspace |

A workspace always has at least one admin — the UI won't let the last admin
be demoted or removed.

## Inviting members

1. Open the workspace, go to **Settings**.
2. Click **Invite**, enter their email, and pick a role.
3. They receive an email with a link valid for 7 days. If they don't have an
   account yet, they'll be prompted to create one before the invite is
   accepted — using the same email address the invite was sent to.

## Changing roles / removing members

From workspace **Settings**, admins can change any member's role via the
dropdown next to their name, or remove them entirely. You can't remove
yourself if you're the only remaining admin — promote someone else first.

## Board access inside a workspace

- Workspace **admins** and **members** automatically get access to every
  non-archived board in the workspace (as board admin / board member,
  respectively).
- Workspace **guests** only see boards they've been explicitly added to.
- A board's own member list can also grant someone a *higher* role on that
  specific board than their workspace role implies (e.g. a workspace member
  made a board admin for one board only) — the higher of the two always
  wins.

## Renaming or describing a workspace

Workspace admins can edit the name and description from **Settings**. The
URL slug is set once at creation and isn't editable from the UI currently.
