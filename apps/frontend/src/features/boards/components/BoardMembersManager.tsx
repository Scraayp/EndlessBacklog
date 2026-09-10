import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { BOARD_ROLES, type BoardRole } from "@endlessbacklog/shared";
import { useBoardMembers, useAddBoardMember, useUpdateBoardMemberRole, useRemoveBoardMember } from "../hooks.js";
import { useWorkspaceMembers } from "../../workspaces/hooks.js";
import { Popover } from "../../../components/ui/Popover.js";
import { Button } from "../../../components/ui/Button.js";
import { Avatar } from "../../../components/ui/Avatar.js";
import { Spinner } from "../../../components/ui/Spinner.js";
import { ApiError } from "../../../lib/apiClient.js";

interface Props {
  boardId: string;
  workspaceId: string;
  currentUserId: string | undefined;
  /** Whether the viewer can manage membership (board admin). */
  canManage: boolean;
}

export function BoardMembersManager({ boardId, workspaceId, currentUserId, canManage }: Props) {
  const membersQuery = useBoardMembers(boardId);
  const addMember = useAddBoardMember(boardId);
  const updateRole = useUpdateBoardMemberRole(boardId);
  const removeMember = useRemoveBoardMember(boardId);
  const [error, setError] = useState<string | null>(null);

  const members = membersQuery.data ?? [];

  async function handleRemove(userId: string) {
    setError(null);
    try {
      await removeMember.mutateAsync(userId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove that member.");
    }
  }

  async function handleRoleChange(userId: string, role: BoardRole) {
    setError(null);
    try {
      await updateRole.mutateAsync({ userId, role });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update that member's role.");
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
        {canManage && (
          <AddMemberPopover
            workspaceId={workspaceId}
            existingUserIds={members.map((m) => m.userId)}
            onAdd={async (userId) => {
              setError(null);
              try {
                await addMember.mutateAsync({ userId });
              } catch (err) {
                setError(err instanceof ApiError ? err.message : "Couldn't add that member.");
              }
            }}
          />
        )}
      </div>

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {membersQuery.isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner size={18} />
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2.5 p-2.5">
              <Avatar name={m.user.displayName} src={m.user.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {m.user.displayName}
                  {m.userId === currentUserId && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              {canManage ? (
                <>
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.userId, e.target.value as BoardRole)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs capitalize text-foreground"
                  >
                    {BOARD_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(m.userId)}
                    title="Remove from board"
                    className="rounded p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-danger"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <span className="text-xs capitalize text-muted-foreground">{m.role}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddMemberPopover({
  workspaceId,
  existingUserIds,
  onAdd,
}: {
  workspaceId: string;
  existingUserIds: string[];
  onAdd: (userId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const workspaceMembersQuery = useWorkspaceMembers(workspaceId);
  const existing = new Set(existingUserIds);
  const candidates = (workspaceMembersQuery.data ?? []).filter((m) => m.user && !existing.has(m.user.id));

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      trigger={
        <Button variant="secondary" size="sm">
          <UserPlus size={14} /> Add member
        </Button>
      }
    >
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Workspace members</p>
      {candidates.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Everyone in the workspace is already on this board.</p>
      ) : (
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {candidates.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onAdd(m.user!.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md p-1.5 text-left text-sm hover:bg-surface-hover"
            >
              <Avatar name={m.user!.displayName} src={m.user!.avatarUrl} size="sm" />
              <span className="flex-1 truncate">{m.user!.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
