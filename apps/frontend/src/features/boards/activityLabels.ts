import type { ActivityType } from "@endlessbacklog/shared";

/** Human-readable phrasing for every ActivityType (see
 *  packages/shared/src/constants/notifications.ts), shared between the
 *  per-card activity log and the board-wide one — a board's activity feed
 *  includes every card/list event underneath it, not just board.* events. */
export const ACTIVITY_LABELS: Record<ActivityType, (m: Record<string, unknown>) => string> = {
  "board.created": () => "created this board",
  "board.updated": () => "updated the board",
  "board.archived": () => "archived the board",
  "board.member_added": () => "added a member to the board",
  "board.member_removed": () => "removed a member from the board",
  "board.member_role_changed": (m) => `changed a member's role to ${m.role ?? ""}`,
  "list.created": (m) => `added list "${m.name ?? ""}"`,
  "list.updated": () => "renamed a list",
  "list.archived": () => "archived a list",
  "list.reordered": () => "reordered the lists",
  "card.created": () => "created this card",
  "card.updated": () => "updated this card",
  "card.moved": () => "moved this card",
  "card.archived": () => "archived this card",
  "card.label_added": () => "added a label",
  "card.label_removed": () => "removed a label",
  "card.member_added": () => "added a member",
  "card.member_removed": () => "removed a member",
  "checklist.created": (m) => `added checklist "${m.title ?? ""}"`,
  "checklist.item_added": (m) => `added checklist item "${m.text ?? ""}"`,
  "checklist.item_toggled": (m) => (m.isChecked ? "checked an item" : "unchecked an item"),
  "comment.added": () => "commented",
  "comment.updated": () => "edited a comment",
  "comment.deleted": () => "deleted a comment",
  "attachment.added": (m) => `attached "${m.fileName ?? ""}"`,
  "attachment.removed": (m) => `removed attachment "${m.fileName ?? ""}"`,
};

export function activityLabel(type: string, metadata: Record<string, unknown>): string {
  const fn = ACTIVITY_LABELS[type as ActivityType];
  return fn ? fn(metadata) : type;
}
