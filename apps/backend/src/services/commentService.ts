import { commentRepository } from "../repositories/commentRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { notificationService } from "./notificationService.js";
import { AppError } from "../utils/AppError.js";
import { emitToBoard } from "../sockets/io.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";

export const commentService = {
  async create(cardId: string, authorId: string, bodyHtml: string, mentionedUserIds: string[]) {
    const boardId = await commentRepository.getBoardIdForCard(cardId);
    if (!boardId) throw AppError.notFound("Card not found");

    const comment = await commentRepository.create({ cardId, authorId, bodyHtml });
    if (mentionedUserIds.length > 0) await commentRepository.setMentions(comment.id, mentionedUserIds);

    await activityRepository.record({ boardId, cardId, actorId: authorId, type: "comment.added", metadata: { commentId: comment.id } });

    const full = await commentRepository.findById(comment.id);
    emitToBoard(boardId, SOCKET_EVENTS.COMMENT_ADDED, { cardId, comment: full });

    for (const userId of mentionedUserIds) {
      if (userId === authorId) continue;
      await notificationService.notify(userId, "comment_mention", { cardId, commentId: comment.id, boardId });
    }
    return full;
  },

  async update(commentId: string, userId: string, bodyHtml: string, mentionedUserIds: string[]) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw AppError.notFound("Comment not found");
    if (comment.authorId !== userId) throw AppError.forbidden("You can only edit your own comments");

    comment.bodyHtml = bodyHtml;
    comment.editedAt = new Date();
    await comment.save();
    await commentRepository.setMentions(commentId, mentionedUserIds);

    const boardId = await commentRepository.getBoardIdForCard(comment.cardId);
    if (boardId) emitToBoard(boardId, SOCKET_EVENTS.COMMENT_UPDATED, { cardId: comment.cardId, comment });
    return comment;
  },

  async remove(commentId: string, userId: string, isBoardAdmin: boolean) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw AppError.notFound("Comment not found");
    if (comment.authorId !== userId && !isBoardAdmin) throw AppError.forbidden("You can only delete your own comments");

    const boardId = await commentRepository.getBoardIdForCard(comment.cardId);
    await commentRepository.destroy(commentId);
    await activityRepository.record({ boardId: boardId!, cardId: comment.cardId, actorId: userId, type: "comment.deleted" });
    if (boardId) emitToBoard(boardId, SOCKET_EVENTS.COMMENT_DELETED, { cardId: comment.cardId, commentId });
  },
};
