import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "./api.js";
import { queryKeys } from "../../lib/queryKeys.js";
import type { CreateWorkspaceInput, InviteWorkspaceMemberInput, WorkspaceRole } from "@endlessbacklog/shared";

export const useWorkspaces = () =>
  useQuery({ queryKey: queryKeys.workspaces, queryFn: () => workspaceApi.list().then((r) => r.workspaces) });

export const useWorkspace = (id: string) =>
  useQuery({ queryKey: queryKeys.workspace(id), queryFn: () => workspaceApi.get(id), enabled: !!id });

export const useWorkspaceBoards = (id: string) =>
  useQuery({
    queryKey: queryKeys.workspaceBoards(id),
    queryFn: () => workspaceApi.listBoards(id).then((r) => r.boards),
    enabled: !!id,
  });

export const useWorkspaceMembers = (id: string) =>
  useQuery({
    queryKey: queryKeys.workspaceMembers(id),
    queryFn: () => workspaceApi.listMembers(id).then((r) => r.members),
    enabled: !!id,
  });

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspaceApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workspaces }),
  });
}

export function useInviteMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteWorkspaceMemberInput) => workspaceApi.invite(workspaceId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workspaceMembers(workspaceId) }),
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      workspaceApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workspaceMembers(workspaceId) }),
  });
}

export function useRemoveMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => workspaceApi.removeMember(workspaceId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workspaceMembers(workspaceId) }),
  });
}
