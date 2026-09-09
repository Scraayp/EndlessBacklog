import { z } from "zod";
import { WORKSPACE_ROLES } from "../constants/roles.js";
import { emailSchema } from "./auth.js";
import { slugSchema } from "./common.js";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slugSchema,
  description: z.string().trim().max(500).optional(),
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const inviteWorkspaceMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(WORKSPACE_ROLES).default("member"),
});
export type InviteWorkspaceMemberInput = z.infer<typeof inviteWorkspaceMemberSchema>;

export const updateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(WORKSPACE_ROLES),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});
