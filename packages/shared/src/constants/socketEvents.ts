/**
 * Centralized Socket.io event name constants. Both the backend (emitters in
 * services/sockets) and the frontend (useBoardSocket listeners) import these
 * so the string literals can never drift out of sync.
 */
export const SOCKET_EVENTS = {
  // Connection / rooms
  BOARD_JOIN: "board:join",
  BOARD_LEAVE: "board:leave",
  PRESENCE_JOINED: "presence:joined",
  PRESENCE_LEFT: "presence:left",

  // Board
  BOARD_UPDATED: "board:updated",
  BOARD_ARCHIVED: "board:archived",
  BOARD_MEMBER_CHANGED: "board:memberChanged",

  // Lists
  LIST_CREATED: "list:created",
  LIST_UPDATED: "list:updated",
  LIST_REORDERED: "list:reordered",
  LIST_ARCHIVED: "list:archived",

  // Cards
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_MOVED: "card:moved",
  CARD_REORDERED: "card:reordered",
  CARD_ARCHIVED: "card:archived",
  CARD_LABEL_CHANGED: "card:labelChanged",
  CARD_MEMBER_CHANGED: "card:memberChanged",

  // Card sub-resources
  CHECKLIST_CHANGED: "checklist:changed",
  COMMENT_ADDED: "comment:added",
  COMMENT_UPDATED: "comment:updated",
  COMMENT_DELETED: "comment:deleted",
  ATTACHMENT_ADDED: "attachment:added",
  ATTACHMENT_REMOVED: "attachment:removed",

  // Notifications (personal room: user:{userId})
  NOTIFICATION_NEW: "notification:new",
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export function boardRoom(boardId: string): string {
  return `board:${boardId}`;
}

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function workspaceRoom(workspaceId: string): string {
  return `workspace:${workspaceId}`;
}
