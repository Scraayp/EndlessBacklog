# Cards and Checklists

Click any card to open its detail view.

## Title and description

Click the title to rename it inline. The description supports rich text
(bold, italic, bulleted/numbered lists, links) via a small formatting
toolbar that appears while editing — click **Save** or click away to commit,
or **Cancel** to discard.

## Due dates

Click **Add due date** to open a calendar picker. Cards with a due date show
a small clock badge on the board; it turns red once the date has passed.
Due-soon and overdue cards can also trigger [notifications](Notifications.md).

## Labels

Click **Labels** to toggle any of the board's existing labels on the card, or
create a new one on the fly (name optional, color required) — see
[Labels and Members](Labels-and-Members.md) for the full color palette.

## Members

Click **Members** to assign or unassign anyone who has access to the board.
Assigning someone notifies them (in-app and, depending on their preferences,
by email).

## Checklists

Click **Add checklist**, give it a title (or accept the default
"Checklist"), then add items one per line. Check items off as you go — the
progress bar above the list updates live. Delete a checklist or an item with
the trash icon that appears on hover.

## Attachments

Click **Add attachment** to upload a file (up to 25MB). Images show a
thumbnail; any file type is supported. Hover an attachment to:

- **Set as cover** (star icon) — shows the image on the card's board tile
- **Remove** (trash icon)

Uploads go straight from your browser to the object storage backing your
instance (MinIO or S3) via a short-lived signed URL — the file never passes
through the API server itself.

## Comments and @mentions

Type in the comment box at the bottom of the card. Type `@` to open a
dropdown of board members and pick one — this both inserts their name and
notifies them of the mention. You can delete your own comments; board admins
can delete anyone's.

## Activity log

Below the comments, the activity log shows a chronological record of
everything that's happened on the card — created, moved, labeled, checklist
changes, comments, attachments — with who did it and when.

## Archiving a card

Click **Archive** in the card detail view. Archived cards are hidden from
the board; full restore/permanent-delete flows are on the
[Roadmap](Roadmap.md).
