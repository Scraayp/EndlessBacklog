import { z } from "zod";
import { uuidSchema } from "./common.js";

export const createCardSchema = z.object({
  listId: uuidSchema,
  title: z.string().trim().min(1).max(255),
  position: z.number().optional(),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  descriptionHtml: z.string().max(50_000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isArchived: z.boolean().optional(),
  coverAttachmentId: uuidSchema.nullable().optional(),
});
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

/** The server computes a fractional position between these two neighbors
 *  (which live in the destination list `listId`) — see utils/position.ts. */
export const moveCardSchema = z.object({
  listId: uuidSchema,
  beforeId: uuidSchema.nullable().optional(),
  afterId: uuidSchema.nullable().optional(),
});
export type MoveCardInput = z.infer<typeof moveCardSchema>;

export const cardLabelSchema = z.object({
  labelId: uuidSchema,
});

export const cardMemberSchema = z.object({
  userId: uuidSchema,
});

export const createChecklistSchema = z.object({
  cardId: uuidSchema,
  title: z.string().trim().min(1).max(150).default("Checklist"),
  position: z.number().optional(),
});

export const updateChecklistSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  position: z.number().optional(),
});

export const createChecklistItemSchema = z.object({
  checklistId: uuidSchema,
  text: z.string().trim().min(1).max(500),
  position: z.number().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: uuidSchema.nullable().optional(),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().trim().min(1).max(500).optional(),
  isChecked: z.boolean().optional(),
  position: z.number().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: uuidSchema.nullable().optional(),
});

export const createCommentSchema = z.object({
  cardId: uuidSchema,
  bodyHtml: z.string().trim().min(1).max(20_000),
  mentionedUserIds: z.array(uuidSchema).max(50).default([]),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  bodyHtml: z.string().trim().min(1).max(20_000),
  mentionedUserIds: z.array(uuidSchema).max(50).default([]),
});

export const requestAttachmentUploadSchema = z.object({
  cardId: uuidSchema,
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(150),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024, "Attachments are limited to 25MB"),
});
export type RequestAttachmentUploadInput = z.infer<typeof requestAttachmentUploadSchema>;

export const confirmAttachmentUploadSchema = z.object({
  cardId: uuidSchema,
  storageKey: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(150),
  sizeBytes: z.number().int().positive(),
});
export type ConfirmAttachmentUploadInput = z.infer<typeof confirmAttachmentUploadSchema>;

export const boardFilterQuerySchema = z.object({
  labelIds: z.array(uuidSchema).optional(),
  memberIds: z.array(uuidSchema).optional(),
  dueFilter: z.enum(["overdue", "due_soon", "no_due_date"]).optional(),
  text: z.string().max(200).optional(),
});
