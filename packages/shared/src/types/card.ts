import type { UserPublic } from "./auth.js";
import type { Label } from "./board.js";

export interface Card {
  id: string;
  listId: string;
  boardId: string;
  title: string;
  descriptionHtml: string | null;
  position: number;
  dueDate: string | null;
  dueReminderSentAt: string | null;
  isArchived: boolean;
  coverAttachmentId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/** Card shape as rendered on the board (list) view — summary only, no full activity/comments. */
export interface CardSummary extends Card {
  labels: Label[];
  members: UserPublic[];
  checklistItemCount: number;
  checklistCheckedCount: number;
  commentCount: number;
  attachmentCount: number;
  coverUrl: string | null;
}

export interface Checklist {
  id: string;
  cardId: string;
  title: string;
  position: number;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  text: string;
  isChecked: boolean;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
  createdAt: string;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}

export interface Attachment {
  id: string;
  cardId: string;
  uploadedById: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  isCover: boolean;
  createdAt: string;
}

export interface AttachmentWithUrl extends Attachment {
  /** Short-lived presigned GET URL, resolved server-side per request. */
  url: string;
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  bodyHtml: string;
  editedAt: string | null;
  createdAt: string;
}

export interface CommentWithAuthor extends Comment {
  author: UserPublic;
  mentionedUserIds: string[];
}

/** Full card payload returned by GET /cards/:id for the card detail modal. */
export interface CardDetail extends Card {
  labels: Label[];
  members: UserPublic[];
  checklists: ChecklistWithItems[];
  attachments: AttachmentWithUrl[];
  comments: CommentWithAuthor[];
}
