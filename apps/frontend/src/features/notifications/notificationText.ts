import type { Notification } from "@endlessbacklog/shared";

export function notificationText(n: Notification): string {
  const p = n.payload as Record<string, unknown>;
  switch (n.type) {
    case "card_assigned":
      return `You were added to "${p.cardTitle ?? "a card"}"`;
    case "card_unassigned":
      return `You were removed from "${p.cardTitle ?? "a card"}"`;
    case "comment_mention":
      return "You were mentioned in a comment";
    case "due_soon":
      return `"${p.cardTitle ?? "A card"}" is due soon`;
    case "due_overdue":
      return `"${p.cardTitle ?? "A card"}" is overdue`;
    case "workspace_invite":
      return "You were invited to a workspace";
    case "board_invite":
      return "You were added to a board";
    default:
      return "New notification";
  }
}

export function notificationLink(n: Notification): string | null {
  const p = n.payload as Record<string, unknown>;
  if (p.boardId && p.cardId) return `/boards/${p.boardId}/cards/${p.cardId}`;
  if (p.boardId) return `/boards/${p.boardId}`;
  return null;
}
