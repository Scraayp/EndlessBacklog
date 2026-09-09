import type { WorkspaceRole, WorkspaceMemberStatus } from "../constants/roles.js";
import type { UserPublic } from "./auth.js";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string | null;
  invitedEmail: string | null;
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
  createdAt: string;
}

export interface WorkspaceMemberWithUser extends WorkspaceMember {
  user: UserPublic | null;
}

export interface WorkspaceWithMembership extends Workspace {
  /** The requesting user's own role in this workspace. */
  myRole: WorkspaceRole;
  boardCount: number;
}
