import { workspaceRepository } from "../repositories/workspaceRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { toPublicUser } from "../mappers/userMapper.js";
import { AppError } from "../utils/AppError.js";
import { issueToken, consumeToken, TOKEN_NAMESPACES } from "../utils/ephemeralTokens.js";
import { sha256 } from "../utils/crypto.js";
import { emailQueue } from "../jobs/queues.js";
import { workspaceInviteTemplate } from "../jobs/emailTemplates.js";
import { WorkspaceMember } from "../models/index.js";
import type {
  CreateWorkspaceInput,
  InviteWorkspaceMemberInput,
  WorkspaceRole,
  WorkspaceWithMembership,
  WorkspaceMemberWithUser,
} from "@endlessbacklog/shared";

export const workspaceService = {
  async create(userId: string, input: CreateWorkspaceInput) {
    const slugTaken = await workspaceRepository.findBySlug(input.slug);
    if (slugTaken) throw AppError.conflict("That workspace URL is already taken");

    const workspace = await workspaceRepository.create({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      createdById: userId,
    });
    await WorkspaceMember.create({ workspaceId: workspace.id, userId, role: "admin", status: "active" });
    return workspace;
  },

  async listForUser(userId: string): Promise<WorkspaceWithMembership[]> {
    const rows = await workspaceRepository.listForUser(userId);
    return rows.map(({ workspace, role, boardCount }) => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      avatarUrl: workspace.avatarUrl,
      createdById: workspace.createdById,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
      myRole: role,
      boardCount,
    }));
  },

  async get(workspaceId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw AppError.notFound("Workspace not found");
    return workspace;
  },

  async update(workspaceId: string, data: { name?: string; description?: string | null; avatarUrl?: string | null }) {
    const workspace = await workspaceService.get(workspaceId);
    if (data.name !== undefined) workspace.name = data.name;
    if (data.description !== undefined) workspace.description = data.description;
    if (data.avatarUrl !== undefined) workspace.avatarUrl = data.avatarUrl;
    await workspace.save();
    return workspace;
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMemberWithUser[]> {
    const members = await workspaceRepository.listMembers(workspaceId);
    return members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      invitedEmail: m.invitedEmail,
      role: m.role,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      user: m.user ? toPublicUser(m.user) : null,
    }));
  },

  async invite(workspaceId: string, inviterName: string, input: InviteWorkspaceMemberInput) {
    const workspace = await workspaceService.get(workspaceId);
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      const existingMembership = await workspaceRepository.getMembership(workspaceId, existingUser.id);
      if (existingMembership) throw AppError.conflict("That user is already a member");
    }
    const existingInvite = await workspaceRepository.findPendingInviteByEmail(workspaceId, input.email);
    if (existingInvite) throw AppError.conflict("An invite is already pending for that email");

    const inviteToken = await issueToken(
      TOKEN_NAMESPACES.WORKSPACE_INVITE,
      { workspaceId, email: input.email, role: input.role },
      60 * 60 * 24 * 7,
    );

    await workspaceRepository.createInvite({
      workspaceId,
      invitedEmail: input.email,
      role: input.role,
      inviteTokenHash: sha256(inviteToken),
      inviteExpiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    });

    const { subject, html } = workspaceInviteTemplate({
      token: inviteToken,
      workspaceName: workspace.name,
      inviterName,
    });
    await emailQueue.add("workspace-invite", { to: input.email, subject, html });
  },

  async acceptInvite(userId: string, userEmail: string, token: string) {
    const payload = await consumeToken<{ workspaceId: string; email: string; role: WorkspaceRole }>(
      TOKEN_NAMESPACES.WORKSPACE_INVITE,
      token,
    );
    if (!payload) throw AppError.badRequest("Invalid or expired invite");
    if (payload.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw AppError.forbidden("This invite was sent to a different email address");
    }

    const invite = await workspaceRepository.findPendingInviteByEmail(payload.workspaceId, payload.email);
    if (invite) {
      invite.userId = userId;
      invite.status = "active";
      invite.inviteTokenHash = null;
      invite.inviteExpiresAt = null;
      await invite.save();
      return invite;
    }

    return WorkspaceMember.create({
      workspaceId: payload.workspaceId,
      userId,
      role: payload.role,
      status: "active",
    });
  },

  async updateMemberRole(workspaceId: string, memberId: string, role: WorkspaceRole) {
    const member = await workspaceRepository.findMemberById(memberId);
    if (!member || member.workspaceId !== workspaceId) throw AppError.notFound("Member not found");

    if (member.role === "admin" && role !== "admin") {
      const adminCount = await workspaceRepository.countAdmins(workspaceId);
      if (adminCount <= 1) throw AppError.badRequest("A workspace must have at least one admin");
    }
    member.role = role;
    await member.save();
    return member;
  },

  async removeMember(workspaceId: string, memberId: string) {
    const member = await workspaceRepository.findMemberById(memberId);
    if (!member || member.workspaceId !== workspaceId) throw AppError.notFound("Member not found");
    if (member.role === "admin") {
      const adminCount = await workspaceRepository.countAdmins(workspaceId);
      if (adminCount <= 1) throw AppError.badRequest("A workspace must have at least one admin");
    }
    await member.destroy();
  },
};
