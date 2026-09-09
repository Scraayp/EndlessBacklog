# Labels and Members

## Label colors

Every board shares the same fixed palette of 10 colors (matching Trello's
familiar set), each with a name you can override per-label:

| Color | Default use |
|---|---|
| 🟢 Green | commonly "feature" / "done" |
| 🟡 Yellow | commonly "in review" / "blocked" |
| 🟠 Orange | |
| 🔴 Red | commonly "bug" / "urgent" |
| 🟣 Purple | |
| 🔵 Blue | |
| Sky | |
| Lime | |
| Pink | |
| Black/Grey | |

Colors are chosen to stay legible in both light and dark mode — each has a
distinct hex value per theme, swapped automatically when you toggle themes.

## Creating and managing labels

Labels belong to a board, not a workspace. Create one from the **Labels**
popover on any card ("Create a new label"), or manage existing ones (rename,
recolor, delete) from the same popover. Deleting a label removes it from
every card it was on.

## Assigning members

Any board member/admin can be assigned to a card via the **Members** popover
in the card detail view. Assigning someone:

- Shows their avatar on the card's board tile (up to a few, then a "+N"
  overflow)
- Sends them a [notification](Notifications.md)

## Filtering by label or member

The board's filter bar (top-right) lets you show only cards matching one or
more selected labels and/or members, combined with a due-date filter and
free-text search. See [Boards](Boards.md#searching-and-filtering).
