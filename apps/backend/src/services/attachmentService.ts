import { attachmentRepository } from "../repositories/attachmentRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { storageService } from "./storageService.js";
import { AppError } from "../utils/AppError.js";
import { emitToBoard } from "../sockets/io.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";
import type { RequestAttachmentUploadInput, ConfirmAttachmentUploadInput } from "@endlessbacklog/shared";

export const attachmentService = {
  async requestUpload(input: RequestAttachmentUploadInput): Promise<{ uploadUrl: string; storageKey: string }> {
    const boardId = await attachmentRepository.getBoardIdForCard(input.cardId);
    if (!boardId) throw AppError.notFound("Card not found");

    const storageKey = storageService.buildObjectKey(input.cardId, input.fileName);
    const uploadUrl = await storageService.getUploadUrl(storageKey, input.mimeType);
    return { uploadUrl, storageKey };
  },

  async confirmUpload(userId: string, input: ConfirmAttachmentUploadInput) {
    const boardId = await attachmentRepository.getBoardIdForCard(input.cardId);
    if (!boardId) throw AppError.notFound("Card not found");

    const attachment = await attachmentRepository.create({
      cardId: input.cardId,
      uploadedById: userId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: input.storageKey,
    });

    await activityRepository.record({
      boardId,
      cardId: input.cardId,
      actorId: userId,
      type: "attachment.added",
      metadata: { fileName: input.fileName },
    });
    const url = await storageService.getDownloadUrl(attachment.storageKey);
    emitToBoard(boardId, SOCKET_EVENTS.ATTACHMENT_ADDED, { cardId: input.cardId, attachment: { ...attachment.toJSON(), url } });
    return attachment;
  },

  async remove(userId: string, attachmentId: string) {
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment) throw AppError.notFound("Attachment not found");
    const boardId = await attachmentRepository.getBoardIdForCard(attachment.cardId);

    await storageService.deleteObject(attachment.storageKey);
    await attachmentRepository.destroy(attachmentId);

    if (boardId) {
      await activityRepository.record({ boardId, cardId: attachment.cardId, actorId: userId, type: "attachment.removed", metadata: { fileName: attachment.fileName } });
      emitToBoard(boardId, SOCKET_EVENTS.ATTACHMENT_REMOVED, { cardId: attachment.cardId, attachmentId });
    }
  },
};
