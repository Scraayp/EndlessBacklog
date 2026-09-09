import type { Card } from "../models/index.js";
import { storageService } from "../services/storageService.js";
import { toPublicUser } from "./userMapper.js";
import type { CardSummary, CardDetail, Label as SharedLabel } from "@endlessbacklog/shared";

function mapLabel(l: { id: string; boardId: string; name: string | null; color: string; createdAt: Date }): SharedLabel {
  return { id: l.id, boardId: l.boardId, name: l.name, color: l.color, createdAt: l.createdAt.toISOString() };
}

export async function toCardSummary(card: Card): Promise<CardSummary> {
  const labels = (card.get("labels") as any[] | undefined) ?? [];
  const members = (card.get("members") as any[] | undefined) ?? [];
  const checklists = (card.get("checklists") as any[] | undefined) ?? [];
  const attachments = (card.get("attachments") as any[] | undefined) ?? [];
  const comments = (card.get("comments") as any[] | undefined) ?? [];

  const checklistItems = checklists.flatMap((cl) => cl.items ?? []);
  const cover = attachments.find((a) => a.id === card.coverAttachmentId);

  return {
    id: card.id,
    listId: card.listId,
    boardId: card.boardId,
    title: card.title,
    descriptionHtml: card.descriptionHtml,
    position: card.position,
    dueDate: card.dueDate?.toISOString() ?? null,
    dueReminderSentAt: card.dueReminderSentAt?.toISOString() ?? null,
    isArchived: card.isArchived,
    coverAttachmentId: card.coverAttachmentId,
    createdById: card.createdById,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
    labels: labels.map(mapLabel),
    members: members.map(toPublicUser),
    checklistItemCount: checklistItems.length,
    checklistCheckedCount: checklistItems.filter((i) => i.isChecked).length,
    commentCount: comments.length,
    attachmentCount: attachments.length,
    coverUrl: cover ? await storageService.getDownloadUrl(cover.storageKey) : null,
  };
}

export async function toCardDetail(card: Card): Promise<CardDetail> {
  const labels = (card.get("labels") as any[] | undefined) ?? [];
  const members = (card.get("members") as any[] | undefined) ?? [];
  const checklists = (card.get("checklists") as any[] | undefined) ?? [];
  const attachments = (card.get("attachments") as any[] | undefined) ?? [];
  const comments = (card.get("comments") as any[] | undefined) ?? [];

  const attachmentsWithUrls = await Promise.all(
    attachments.map(async (a) => ({
      id: a.id,
      cardId: a.cardId,
      uploadedById: a.uploadedById,
      fileName: a.fileName,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      storageKey: a.storageKey,
      isCover: a.isCover,
      createdAt: a.createdAt.toISOString(),
      url: await storageService.getDownloadUrl(a.storageKey),
    })),
  );

  return {
    id: card.id,
    listId: card.listId,
    boardId: card.boardId,
    title: card.title,
    descriptionHtml: card.descriptionHtml,
    position: card.position,
    dueDate: card.dueDate?.toISOString() ?? null,
    dueReminderSentAt: card.dueReminderSentAt?.toISOString() ?? null,
    isArchived: card.isArchived,
    coverAttachmentId: card.coverAttachmentId,
    createdById: card.createdById,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
    labels: labels.map(mapLabel),
    members: members.map(toPublicUser),
    checklists: checklists.map((cl) => ({
      id: cl.id,
      cardId: cl.cardId,
      title: cl.title,
      position: cl.position,
      createdAt: cl.createdAt.toISOString(),
      items: (cl.items ?? []).map((it: any) => ({
        id: it.id,
        checklistId: it.checklistId,
        text: it.text,
        isChecked: it.isChecked,
        position: it.position,
        dueDate: it.dueDate?.toISOString() ?? null,
        assigneeId: it.assigneeId,
        createdAt: it.createdAt.toISOString(),
      })),
    })),
    attachments: attachmentsWithUrls,
    comments: comments.map((c) => ({
      id: c.id,
      cardId: c.cardId,
      authorId: c.authorId,
      bodyHtml: c.bodyHtml,
      editedAt: c.editedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      author: toPublicUser(c.author),
      mentionedUserIds: (c.mentionedUsers ?? []).map((u: any) => u.id),
    })),
  };
}
