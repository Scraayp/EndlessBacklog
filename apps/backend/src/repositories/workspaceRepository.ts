import { Op } from "sequelize";
import { Workspace, WorkspaceMember, Board, User } from "../models/index.js";
import type { WorkspaceRole } from "@endlessbacklog/shared";

export const workspaceRepository = {
  findById(id: string) {
    return Workspace.findByPk(id);
  },
  findBySlug(slug: string) {
    return Workspace.findOne({ where: { slug } });
  },
  create(data: { name: string; slug: string; description?: string | null; createdById: string }) {
    return Workspace.create(data);
  },

  async listForUser(userId: string) {
    const memberships = await WorkspaceMember.findAll({
      where: { userId, status: "active" },
      include: [{ model: Workspace, as: "workspace" }],
    });
    const boardCounts = await Board.findAll({
      attributes: ["workspaceId", [Board.sequelize!.fn("COUNT", Board.sequelize!.col("id")), "count"]],
      where: { workspaceId: memberships.map((m) => m.workspaceId), isArchived: false },
      group: ["workspace_id"],
      raw: true,
    });
    const countMap = new Map(boardCounts.map((r: any) => [r.workspaceId, Number(r.count)]));
    return memberships.map((m) => ({
      workspace: m.workspace!,
      role: m.role,
      boardCount: countMap.get(m.workspaceId) ?? 0,
    }));
  },

  getMembership(workspaceId: string, userId: string) {
    return WorkspaceMember.findOne({ where: { workspaceId, userId, status: "active" } });
  },

  listMembers(workspaceId: string) {
    return WorkspaceMember.findAll({
      where: { workspaceId },
      include: [{ model: User, as: "user" }],
      order: [["createdAt", "ASC"]],
    });
  },

  findMemberById(memberId: string) {
    return WorkspaceMember.findByPk(memberId);
  },

  findPendingInviteByEmail(workspaceId: string, email: string) {
    return WorkspaceMember.findOne({
      where: { workspaceId, invitedEmail: email.toLowerCase(), status: "invited" },
    });
  },

  createInvite(data: {
    workspaceId: string;
    invitedEmail: string;
    role: WorkspaceRole;
    inviteTokenHash: string;
    inviteExpiresAt: Date;
  }) {
    return WorkspaceMember.create({ ...data, status: "invited", userId: null });
  },

  findInviteByTokenHash(tokenHash: string) {
    return WorkspaceMember.findOne({
      where: { inviteTokenHash: tokenHash, status: "invited", inviteExpiresAt: { [Op.gt]: new Date() } },
    });
  },

  countAdmins(workspaceId: string) {
    return WorkspaceMember.count({ where: { workspaceId, role: "admin", status: "active" } });
  },
};
