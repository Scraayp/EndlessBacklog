# Boards

A board is where the actual Kanban work happens — lists of cards you drag
between columns.

## Creating a board

From a workspace dashboard, click **New board**, pick a background color and
a name. New boards start with three default lists (**To Do**, **In
Progress**, **Done**) as a starting point — treat them as a template, not a
requirement.

## Lists

- **Add a list**: click **Add another list** at the right edge of the board.
- **Rename a list**: click its title.
- **Reorder lists**: drag a list by its header.
- **Archive a list**: open the `⋯` menu on the list header. Archiving a list
  archives it (and it disappears from the board) without deleting its cards'
  history — full delete/restore flows for archived items are on the
  [Roadmap](Roadmap.md).

## Board membership

Every board has its own member list, separate from (but usually implied by)
workspace membership — see [Workspaces](Workspaces.md#board-access-inside-a-workspace).
Board roles are **admin**, **member**, and **observer** (read-only). Manage
board members from the board's member list.

## Board background

Set at creation from a small palette of colors; editing it afterward isn't
exposed in the UI yet (planned — see [Roadmap](Roadmap.md) for
image backgrounds).

## Archiving a board

Board admins can archive a board from its settings — it's hidden from the
workspace dashboard but not deleted. Un-archiving and permanent deletion are
on the [Roadmap](Roadmap.md).

## Searching and filtering

The filter bar at the top of a board lets you narrow the visible cards by:

- **Text** — matches card titles
- **Labels** — one or more
- **Members** — one or more
- **Due date** — overdue, due in the next 3 days, or no due date set

Filters are client-side and don't change what's on the board for anyone
else — they're purely a personal view.
