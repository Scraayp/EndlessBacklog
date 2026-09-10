import { boardRepository } from "../repositories/boardRepository.js";
import { listRepository } from "../repositories/listRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { AppError } from "../utils/AppError.js";
import { positionAtEnd } from "../utils/position.js";
import { emitToBoard } from "../sockets/io.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";
import type { BoardBackgroundType, BoardRole } from "@endlessbacklog/shared";

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

  listActivity(boardId: string) {
    return activityRepository.listForBoard(boardId);
  },

  async addMember(boardId: string, actorId: string, userId: string, role: BoardRole = "member") {
    const existing = await boardRepository.getMembership(boardId, userId);
    if (existing) throw AppError.conflict("That person is already on the board");
    const member = await boardRepository.addMember(boardId, userId, role);
    await activityRepository.record({ boardId, actorId, type: "board.member_added", metadata: { userId, role } });
    emitToBoard(boardId, SOCKET_EVENTS.BOARD_MEMBER_CHANGED, { boardId, userId, action: "added" });
    return member;
  },

  async updateMemberRole(boardId: string, actorId: string, userId: string, role: BoardRole) {
    const existing = await boardRepository.getMembership(boardId, userId);
    if (!existing) throw AppError.notFound("Member not found");
    if (existing.role === "admin" && role !== "admin") {
      const adminCount = await boardRepository.countAdmins(boardId);
      if (adminCount <= 1) throw AppError.badRequest("A board must have at least one admin");
    }
    await boardRepository.updateMemberRole(boardId, userId, role);
    await activityRepository.record({ boardId, actorId, type: "board.member_role_changed", metadata: { userId, role } });
    emitToBoard(boardId, SOCKET_EVENTS.BOARD_MEMBER_CHANGED, { boardId, userId, action: "roleChanged" });
    return boardRepository.getMembership(boardId, userId);
  },

  async removeMember(boardId: string, actorId: string, userId: string) {
    const existing = await boardRepository.getMembership(boardId, userId);
    if (existing?.role === "admin") {
      const adminCount = await boardRepository.countAdmins(boardId);
      if (adminCount <= 1) throw AppError.badRequest("A board must have at least one admin");
    }
    const result = await boardRepository.removeMember(boardId, userId);
    await activityRepository.record({ boardId, actorId, type: "board.member_removed", metadata: { userId } });
    emitToBoard(boardId, SOCKET_EVENTS.BOARD_MEMBER_CHANGED, { boardId, userId, action: "removed" });
    return result;
  },
};
