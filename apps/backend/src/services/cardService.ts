import { Card, List } from "../models/index.js";
import { cardRepository } from "../repositories/cardRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { AppError } from "../utils/AppError.js";
import { positionAtEnd, positionBetween, needsRebalance, rebalancedPositions } from "../utils/position.js";
import { emitToBoard } from "../sockets/io.js";
import { toCardSummary, toCardDetail } from "../mappers/cardMapper.js";
import { notificationService } from "./notificationService.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";
import type { UpdateCardInput } from "@endlessbacklog/shared";

async function rebalanceListCards(listId: string): Promise<void> {
  const cards = await Card.findAll({ where: { listId }, order: [["position", "ASC"]] });
  const positions = rebalancedPositions(cards.length);
  await Promise.all(cards.map((card, i) => card.update({ position: positions[i] })));
}

export const cardService = {
  async getBoardIdForCard(cardId: string): Promise<string | undefined> {
    const card = await cardRepository.findById(cardId);
    return card?.boardId;
  },

  async create(listId: string, userId: string, title: string) {
    const list = await List.findByPk(listId);
    if (!list) throw AppError.notFound("List not found");

    const last = await cardRepository.lastPositionInList(listId);
    const card = await cardRepository.create({
      listId,
      boardId: list.boardId,
      title,
      position: positionAtEnd(last),
      createdById: userId,
    });
    await activityRepository.record({ boardId: list.boardId, cardId: card.id, actorId: userId, type: "card.created", metadata: { title } });

    const summary = await toCardSummary(await cardRepository.findById(card.id) as Card);
    emitToBoard(list.boardId, SOCKET_EVENTS.CARD_CREATED, { card: summary });
    return card;
  },

  async listForBoard(boardId: string) {
    const cards = await cardRepository.listForBoard(boardId);
    return Promise.all(cards.map(toCardSummary));
  },

  async getDetail(cardId: string) {
    const card = await cardRepository.findDetail(cardId);
    if (!card) throw AppError.notFound("Card not found");
    return toCardDetail(card);
  },

  async update(cardId: string, userId: string, data: UpdateCardInput) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card not found");

    if (data.title !== undefined) card.title = data.title;
    if (data.descriptionHtml !== undefined) card.descriptionHtml = data.descriptionHtml;
    if (data.dueDate !== undefined) {
      card.dueDate = data.dueDate ? new Date(data.dueDate) : null;
      card.dueReminderSentAt = null;
    }
    if (data.isArchived !== undefined) card.isArchived = data.isArchived;
    if (data.coverAttachmentId !== undefined) card.coverAttachmentId = data.coverAttachmentId;
    await card.save();

    await activityRepository.record({
      boardId: card.boardId,
      cardId: card.id,
      actorId: userId,
      type: data.isArchived !== undefined ? "card.archived" : "card.updated",
    });

    const summary = await toCardSummary(await cardRepository.findById(card.id) as Card);
    emitToBoard(card.boardId, data.isArchived !== undefined ? SOCKET_EVENTS.CARD_ARCHIVED : SOCKET_EVENTS.CARD_UPDATED, { card: summary });
    return summary;
  },

  async move(cardId: string, userId: string, destListId: string, beforeId?: string | null, afterId?: string | null): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card not found");
    const destList = await List.findByPk(destListId);
    if (!destList) throw AppError.notFound("Destination list not found");
    if (destList.boardId !== card.boardId) throw AppError.badRequest("Cannot move a card to a different board");

    const [before, after] = await Promise.all([
      beforeId ? Card.findByPk(beforeId) : null,
      afterId ? Card.findByPk(afterId) : null,
    ]);
    if ((before && before.listId !== destListId) || (after && after.listId !== destListId)) {
      throw AppError.badRequest("Reorder neighbors must be in the destination list");
    }

    if (before && after && needsRebalance(before.position, after.position)) {
      await rebalanceListCards(destListId);
      return cardService.move(cardId, userId, destListId, beforeId, afterId); // retry with fresh positions
    }

    const fromListId = card.listId;
    card.listId = destListId;
    card.position = positionBetween(before?.position, after?.position);
    await card.save();

    await activityRepository.record({
      boardId: card.boardId,
      cardId: card.id,
      actorId: userId,
      type: "card.moved",
      metadata: { fromListId, toListId: destListId },
    });

    emitToBoard(card.boardId, SOCKET_EVENTS.CARD_MOVED, {
      cardId,
      fromListId,
      toListId: destListId,
      position: card.position,
    });
    return card;
  },

  async addLabel(cardId: string, userId: string, labelId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card not found");
    await cardRepository.addLabel(cardId, labelId);
    await activityRepository.record({ boardId: card.boardId, cardId, actorId: userId, type: "card.label_added", metadata: { labelId } });
    emitToBoard(card.boardId, SOCKET_EVENTS.CARD_LABEL_CHANGED, { cardId, labelId, action: "added" });
  },

  async removeLabel(cardId: string, userId: string, labelId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card not found");
    await cardRepository.removeLabel(cardId, labelId);
    await activityRepository.record({ boardId: card.boardId, cardId, actorId: userId, type: "card.label_removed", metadata: { labelId } });
    emitToBoard(card.boardId, SOCKET_EVENTS.CARD_LABEL_CHANGED, { cardId, labelId, action: "removed" });
  },

  async addMember(cardId: string, actorId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card not found");
    await cardRepository.addMember(cardId, userId);
    await activityRepository.record({ boardId: card.boardId, cardId, actorId, type: "card.member_added", metadata: { userId } });
    emitToBoard(card.boardId, SOCKET_EVENTS.CARD_MEMBER_CHANGED, { cardId, userId, action: "added" });
    if (userId !== actorId) {
      await notificationService.notify(userId, "card_assigned", { cardId, cardTitle: card.title, boardId: card.boardId });
    }
  },

  async removeMember(cardId: string, actorId: string, userId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card not found");
    await cardRepository.removeMember(cardId, userId);
    await activityRepository.record({ boardId: card.boardId, cardId, actorId, type: "card.member_removed", metadata: { userId } });
    emitToBoard(card.boardId, SOCKET_EVENTS.CARD_MEMBER_CHANGED, { cardId, userId, action: "removed" });
  },

  listActivity(cardId: string) {
    return activityRepository.listForCard(cardId);
  },
};
