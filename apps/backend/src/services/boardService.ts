import { boardRepository } from "../repositories/boardRepository.js";
import { listRepository } from "../repositories/listRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { AppError } from "../utils/AppError.js";
import { positionAtEnd } from "../utils/position.js";
import { emitToBoard } from "../sockets/io.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";
import type { BoardBackgroundType } from "@endlessbacklog/shared";

export const boardService = {
  async create(
    userId: string,
    input: { workspaceId: string; name: string; backgroundType?: BoardBackgroundType; backgroundValue?: string },
  ) {
    const last = await boardRepository.lastPosition(input.workspaceId);
    const board = await boardRepository.create({
      workspaceId: input.workspaceId,
      name: input.name,
      backgroundType: input.backgroundType,
      backgroundValue: input.backgroundValue,
      position: positionAtEnd(last),
      createdById: userId,
    });
    await boardRepository.addMember(board.id, userId, "admin");
    await activityRepository.record({ boardId: board.id, actorId: userId, type: "board.created" });

    // Seed three default lists so a new board isn't a blank void — mirrors
    // Trello's "To Do / Doing / Done" starter template.
    const defaults = ["To Do", "In Progress", "Done"];
    for (let i = 0; i < defaults.length; i++) {
      await listRepository.create({ boardId: board.id, name: defaults[i]!, position: (i + 1) * 65536 });
    }

    return board;
  },

  async listForWorkspace(workspaceId: string) {
    return boardRepository.listForWorkspace(workspaceId);
  },

  async get(boardId: string) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw AppError.notFound("Board not found");
    return board;
  },

  async update(boardId: string, userId: string, data: Partial<{ name: string; backgroundType: BoardBackgroundType; backgroundValue: string; isArchived: boolean }>) {
    const board = await boardService.get(boardId);
    Object.assign(board, data);
    await board.save();
    await activityRepository.record({
      boardId,
      actorId: userId,
      type: data.isArchived !== undefined ? "board.archived" : "board.updated",
    });
    emitToBoard(boardId, data.isArchived !== undefined ? SOCKET_EVENTS.BOARD_ARCHIVED : SOCKET_EVENTS.BOARD_UPDATED, { board });
    return board;
  },

  listMembers(boardId: string) {
    return boardRepository.listMembers(boardId);
  },

  addMember(boardId: string, userId: string, role: "admin" | "member" | "observer" = "member") {
    return boardRepository.addMember(boardId, userId, role);
  },

  removeMember(boardId: string, userId: string) {
    return boardRepository.removeMember(boardId, userId);
  },
};
