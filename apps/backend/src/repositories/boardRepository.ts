import { Board, BoardMember, User, Workspace } from "../models/index.js";
import type { BoardRole } from "@endlessbacklog/shared";

export const boardRepository = {
  findById(id: string) {
    return Board.findByPk(id);
  },
  create(data: {
    workspaceId: string;
    name: string;
    backgroundType?: "color" | "image";
    backgroundValue?: string;
    position: number;
    createdById: string;
  }) {
    return Board.create(data);
  },
  listForWorkspace(workspaceId: string, includeArchived = false) {
    return Board.findAll({
      where: includeArchived ? { workspaceId } : { workspaceId, isArchived: false },
      order: [["position", "ASC"]],
    });
  },
  async lastPosition(workspaceId: string): Promise<number | null> {
    const last = await Board.findOne({ where: { workspaceId }, order: [["position", "DESC"]] });
    return last?.position ?? null;
  },
  getMembership(boardId: string, userId: string) {
    return BoardMember.findOne({ where: { boardId, userId } });
  },
  addMember(boardId: string, userId: string, role: BoardRole = "member") {
    return BoardMember.create({ boardId, userId, role });
  },
  removeMember(boardId: string, userId: string) {
    return BoardMember.destroy({ where: { boardId, userId } });
  },
  listMembers(boardId: string) {
    return BoardMember.findAll({ where: { boardId }, include: [{ model: User, as: "user" }] });
  },
  findWithWorkspace(id: string) {
    return Board.findByPk(id, { include: [{ model: Workspace, as: "workspace" }] });
  },
};
