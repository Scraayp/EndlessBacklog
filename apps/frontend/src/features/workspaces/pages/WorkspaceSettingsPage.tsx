import { useState } from "react";
import { useParams } from "react-router-dom";
import { UserPlus, Trash2 } from "lucide-react";
import { WORKSPACE_ROLES, type WorkspaceRole } from "@endlessbacklog/shared";
import { useWorkspace, useWorkspaceMembers, useUpdateMemberRole, useRemoveMember } from "../hooks.js";
import { useAuthStore } from "../../../stores/authStore.js";
import { InviteMemberDialog } from "../components/InviteMemberDialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Avatar } from "../../../components/ui/Avatar.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data } = useWorkspace(workspaceId!);
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId!);
  const updateRole = useUpdateMemberRole(workspaceId!);
  const removeMember = useRemoveMember(workspaceId!);
  const currentUser = useAuthStore((s) => s.user);
  const [inviting, setInviting] = useState(false);

  const isAdmin = data?.myRole === "admin";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-foreground">{data?.workspace.name} settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">Manage members and their roles.</p>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Members</h2>
        {isAdmin && (
          <Button size="sm" onClick={() => setInviting(true)}>
            <UserPlus size={14} /> Invite
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size={22} />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {(members ?? []).map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3">
              {m.user ? (
                <Avatar name={m.user.displayName} src={m.user.avatarUrl} size="sm" />
              ) : (
                <Avatar name={m.invitedEmail ?? "?"} size="sm" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{m.user?.displayName ?? m.invitedEmail}</p>
                <p className="text-xs text-muted-foreground">{m.status === "invited" ? "Invite pending" : m.user?.email}</p>
              </div>
              {isAdmin ? (
                <>
                  <select
                    value={m.role}
                    onChange={(e) => updateRole.mutate({ memberId: m.id, role: e.target.value as WorkspaceRole })}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                  >
                    {WORKSPACE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {m.userId !== currentUser?.id && (
                    <button
                      onClick={() => removeMember.mutate(m.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs capitalize text-muted-foreground">{m.role}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {workspaceId && <InviteMemberDialog workspaceId={workspaceId} open={inviting} onOpenChange={setInviting} />}
    </div>
  );
}
