import { List } from "../models/index.js";
import { listRepository } from "../repositories/listRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { AppError } from "../utils/AppError.js";
import { positionAtEnd, positionBetween, needsRebalance, rebalancedPositions } from "../utils/position.js";
import { emitToBoard } from "../sockets/io.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";

async function rebalanceBoardLists(boardId: string): Promise<void> {
  const lists = await listRepository.listForBoard(boardId, true);
  const positions = rebalancedPositions(lists.length);
  await Promise.all(lists.map((list, i) => list.update({ position: positions[i] })));
}

export const listService = {
  async create(boardId: string, userId: string, name: string) {
    const last = await listRepository.lastPosition(boardId);
    const list = await listRepository.create({ boardId, name, position: positionAtEnd(last) });
    await activityRepository.record({ boardId, actorId: userId, type: "list.created", metadata: { listId: list.id, name } });
    emitToBoard(boardId, SOCKET_EVENTS.LIST_CREATED, { list });
    return list;
  },

  async get(listId: string) {
    const list = await listRepository.findById(listId);
    if (!list) throw AppError.notFound("List not found");
    return list;
  },

  listForBoard(boardId: string) {
    return listRepository.listForBoard(boardId);
  },

  async update(listId: string, userId: string, data: Partial<{ name: string; isArchived: boolean }>) {
    const list = await listService.get(listId);
    Object.assign(list, data);
    await list.save();
    await activityRepository.record({
      boardId: list.boardId,
      actorId: userId,
      type: data.isArchived !== undefined ? "list.archived" : "list.updated",
      metadata: { listId },
    });
    emitToBoard(list.boardId, data.isArchived !== undefined ? SOCKET_EVENTS.LIST_ARCHIVED : SOCKET_EVENTS.LIST_UPDATED, { list });
    return list;
  },

  async reorder(listId: string, userId: string, beforeId?: string | null, afterId?: string | null): Promise<List> {
    const list = await listService.get(listId);

    const [before, after] = await Promise.all([
      beforeId ? List.findByPk(beforeId) : null,
      afterId ? List.findByPk(afterId) : null,
    ]);

    if ((before && before.boardId !== list.boardId) || (after && after.boardId !== list.boardId)) {
      throw AppError.badRequest("Reorder neighbors must be on the same board");
    }

    if (before && after && needsRebalance(before.position, after.position)) {
      await rebalanceBoardLists(list.boardId);
      return listService.reorder(listId, userId, beforeId, afterId); // retry with fresh positions
    }

    list.position = positionBetween(before?.position, after?.position);
    await list.save();
    await activityRepository.record({ boardId: list.boardId, actorId: userId, type: "list.reordered", metadata: { listId } });
    emitToBoard(list.boardId, SOCKET_EVENTS.LIST_REORDERED, { listId, position: list.position });
    return list;
  },
};
