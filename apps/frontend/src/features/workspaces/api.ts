import { api } from "../../lib/apiClient.js";
import type {
  Workspace,
  WorkspaceWithMembership,
  WorkspaceMemberWithUser,
  CreateWorkspaceInput,
  InviteWorkspaceMemberInput,
  Board,
  WorkspaceRole,
} from "@endlessbacklog/shared";

export const workspaceApi = {
  list: () => api.get<{ workspaces: WorkspaceWithMembership[] }>("/workspaces"),
  create: (input: CreateWorkspaceInput) => api.post<{ workspace: Workspace }>("/workspaces", input),
  get: (id: string) => api.get<{ workspace: Workspace; myRole: WorkspaceRole }>(`/workspaces/${id}`),
  update: (id: string, data: { name?: string; description?: string | null }) =>
    api.patch<{ workspace: Workspace }>(`/workspaces/${id}`, data),

  listMembers: (id: string) => api.get<{ members: WorkspaceMemberWithUser[] }>(`/workspaces/${id}/members`),
  invite: (id: string, input: InviteWorkspaceMemberInput) =>
    api.post<void>(`/workspaces/${id}/members/invite`, input),
  acceptInvite: (token: string) => api.post<{ member: unknown }>("/workspaces/accept-invite", { token }),
  updateMemberRole: (id: string, memberId: string, role: WorkspaceRole) =>
    api.patch<{ member: unknown }>(`/workspaces/${id}/members/${memberId}`, { role }),
  removeMember: (id: string, memberId: string) => api.delete<void>(`/workspaces/${id}/members/${memberId}`),

  listBoards: (id: string) => api.get<{ boards: Board[] }>(`/workspaces/${id}/boards`),
};
