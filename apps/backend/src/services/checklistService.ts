import { checklistRepository } from "../repositories/checklistRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { AppError } from "../utils/AppError.js";
import { positionAtEnd } from "../utils/position.js";
import { emitToBoard } from "../sockets/io.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";

async function requireCardBoardId(cardId: string): Promise<string> {
  const boardId = await checklistRepository.getBoardIdForCard(cardId);
  if (!boardId) throw AppError.notFound("Card not found");
  return boardId;
}

export const checklistService = {
  async create(cardId: string, userId: string, title: string) {
    const boardId = await requireCardBoardId(cardId);
    const last = await checklistRepository.lastPosition(cardId);
    const checklist = await checklistRepository.create({ cardId, title, position: positionAtEnd(last) });
    await activityRepository.record({ boardId, cardId, actorId: userId, type: "checklist.created", metadata: { title } });
    emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CHANGED, { cardId, checklistId: checklist.id, action: "created" });
    return checklist;
  },

  async update(checklistId: string, data: { title?: string; position?: number }) {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw AppError.notFound("Checklist not found");
    Object.assign(checklist, data);
    await checklist.save();
    const boardId = await requireCardBoardId(checklist.cardId);
    emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CHANGED, { cardId: checklist.cardId, checklistId, action: "updated" });
    return checklist;
  },

  async remove(checklistId: string) {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw AppError.notFound("Checklist not found");
    const boardId = await requireCardBoardId(checklist.cardId);
    await checklistRepository.destroy(checklistId);
    emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CHANGED, { cardId: checklist.cardId, checklistId, action: "removed" });
  },

  async addItem(checklistId: string, userId: string, text: string, dueDate?: string | null, assigneeId?: string | null) {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw AppError.notFound("Checklist not found");
    const boardId = await requireCardBoardId(checklist.cardId);
    const last = await checklistRepository.lastItemPosition(checklistId);
    const item = await checklistRepository.createItem({
      checklistId,
      text,
      position: positionAtEnd(last),
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId ?? null,
    });
    await activityRepository.record({ boardId, cardId: checklist.cardId, actorId: userId, type: "checklist.item_added", metadata: { text } });
    emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CHANGED, { cardId: checklist.cardId, checklistId, action: "item_added" });
    return item;
  },

  async updateItem(itemId: string, userId: string, data: { text?: string; isChecked?: boolean; position?: number; dueDate?: string | null; assigneeId?: string | null }) {
    const item = await checklistRepository.findItemById(itemId);
    if (!item) throw AppError.notFound("Checklist item not found");
    if (data.text !== undefined) item.text = data.text;
    if (data.isChecked !== undefined) item.isChecked = data.isChecked;
    if (data.position !== undefined) item.position = data.position;
    if (data.dueDate !== undefined) item.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assigneeId !== undefined) item.assigneeId = data.assigneeId;
    await item.save();

    const cardId = await checklistRepository.getCardIdForItem(itemId);
    if (cardId) {
      const boardId = await requireCardBoardId(cardId);
      await activityRepository.record({
        boardId,
        cardId,
        actorId: userId,
        type: "checklist.item_toggled",
        metadata: { itemId, isChecked: item.isChecked },
      });
      emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CHANGED, { cardId, checklistId: item.checklistId, action: "item_updated" });
    }
    return item;
  },

  async removeItem(itemId: string) {
    const cardId = await checklistRepository.getCardIdForItem(itemId);
    const item = await checklistRepository.findItemById(itemId);
    if (!item) throw AppError.notFound("Checklist item not found");
    await checklistRepository.destroyItem(itemId);
    if (cardId) {
      const boardId = await requireCardBoardId(cardId);
      emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CHANGED, { cardId, checklistId: item.checklistId, action: "item_removed" });
    }
  },
};
