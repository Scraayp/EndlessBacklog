import type { ActivityType, NotificationType } from "../constants/notifications.js";
import type { UserPublic } from "./auth.js";

export interface ActivityLogEntry {
  id: string;
  boardId: string;
  cardId: string | null;
  actorId: string;
  type: ActivityType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityLogEntryWithActor extends ActivityLogEntry {
  actor: UserPublic;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
