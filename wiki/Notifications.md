# Notifications

## What triggers a notification

| Event | In-app | Email |
|---|---|---|
| You're assigned to a card | ✅ | ✅ |
| You're mentioned in a comment (`@name`) | ✅ | ✅ (queued) |
| A card you're on is due soon (next 24h) | ✅ | ✅ |
| A workspace invite is sent to you | — | ✅ |

Emails are sent asynchronously through a background job queue, so there can
be a short delay (seconds, typically) between the event and the email
landing in your inbox — the in-app notification is near-instant, delivered
over the same WebSocket connection used for board updates.

## The notification bell

The bell icon in the top navigation shows a badge with your unread count.
Click it for a quick dropdown of your most recent notifications; click one
to jump straight to the relevant card or board and mark it read. **Mark all
read** clears the badge without navigating anywhere.

## The notifications page

For your full history, click **Notifications** (or the bell → view all) for
a dedicated page listing everything, oldest unread first.

## Daily digest

If you have unread notifications, EndlessBacklog emails a short daily digest
(once per day) summarizing how many you have and linking to the
notifications page. There's no per-user opt-out yet in the current release —
see [Roadmap](Roadmap.md).

## Due-date reminders

A background job scans for cards due within the next 24 hours every 15
minutes and notifies every assigned member exactly once per card (tracked so
you won't get duplicate reminders for the same due date).
