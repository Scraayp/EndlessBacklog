import { useState, type ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as RadixDialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { X, Users, Palette, Clock, Archive, ArrowUpRight, ArchiveRestore } from "lucide-react";
import { hasBoardRoleAtLeast, boardBackgroundStyle } from "@endlessbacklog/shared";
import { useBoard, useUpdateBoard } from "../hooks.js";
import { useWorkspace } from "../../workspaces/hooks.js";
import { useAuthStore } from "../../../stores/authStore.js";
import { BoardBackgroundPicker } from "./BoardBackgroundPicker.js";
import { BoardMembersManager } from "./BoardMembersManager.js";
import { BoardActivityLog } from "./BoardActivityLog.js";
import { Input } from "../../../components/ui/Input.js";
import { Button } from "../../../components/ui/Button.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function BoardDetailsPanel() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const boardQuery = useBoard(boardId!);
  const updateBoard = useUpdateBoard(boardId!);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");

  function close() {
    navigate(`/boards/${boardId}`);
  }

  const board = boardQuery.data?.board;
  const myRole = boardQuery.data?.myRole;
  const isAdmin = myRole ? hasBoardRoleAtLeast(myRole, "admin") : false;
  const workspaceQuery = useWorkspace(board?.workspaceId ?? "");

  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && close()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <RadixDialog.Content
          className="sheet-panel glass fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden rounded-l-[var(--r-xl)] rounded-r-none border-r-0 border-l-[var(--rule-strong)] shadow-[var(--shadow-lg)] focus:outline-none"
          aria-describedby={undefined}
        >
          {boardQuery.isLoading || !board ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size={24} />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-[var(--rule-strong)] p-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {workspaceQuery.data?.workspace.name && (
                      <Link to={`/workspaces/${board.workspaceId}`} className="inline-flex items-center gap-0.5 hover:text-foreground">
                        {workspaceQuery.data.workspace.name} <ArrowUpRight size={11} />
                      </Link>
                    )}
                  </p>
                  <RadixDialog.Title asChild>
                    {editingName ? (
                      <Input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => {
                          const trimmed = name.trim();
                          setEditingName(false);
                          if (trimmed && trimmed !== board.name) updateBoard.mutate({ name: trimmed });
                        }}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        className="text-lg font-semibold"
                      />
                    ) : (
                      <button
                        disabled={!isAdmin}
                        onClick={() => {
                          setName(board.name);
                          setEditingName(true);
                        }}
                        className="rounded-[var(--r-sm)] px-1 py-0.5 text-left text-lg font-semibold text-foreground enabled:hover:bg-[var(--sunken)]"
                      >
                        {board.name}
                      </button>
                    )}
                  </RadixDialog.Title>
                </div>
                <RadixDialog.Close className="rounded-full p-1.5 text-muted-foreground hover:bg-[var(--sunken)] hover:text-foreground">
                  <X size={18} />
                </RadixDialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <Section icon={<Palette size={15} />} title="Background">
                  {isAdmin ? (
                    <BoardBackgroundPicker
                      backgroundType={board.backgroundType}
                      backgroundValue={board.backgroundValue}
                      onChange={(backgroundType, backgroundValue) => updateBoard.mutate({ backgroundType, backgroundValue })}
                    />
                  ) : (
                    <div className="h-16 rounded-[var(--r-md)]" style={boardBackgroundStyle(board.backgroundType, board.backgroundValue)} />
                  )}
                </Section>

                <Section icon={<Users size={15} />} title="Members">
                  <BoardMembersManager
                    boardId={board.id}
                    workspaceId={board.workspaceId}
                    currentUserId={currentUser?.id}
                    canManage={isAdmin}
                  />
                </Section>

                <Section icon={<Clock size={15} />} title="Activity">
                  <BoardActivityLog boardId={board.id} />
                </Section>

                {isAdmin && (
                  <div className="mt-6 border-t border-[var(--rule)] pt-4">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(board.createdAt), { addSuffix: true })}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateBoard.mutate({ isArchived: !board.isArchived })}
                    >
                      {board.isArchived ? (
                        <>
                          <ArchiveRestore size={14} /> Restore board
                        </>
                      ) : (
                        <>
                          <Archive size={14} /> Archive board
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="kicker mb-2.5 flex items-center gap-1.5 text-[var(--accent)]">
        {icon}
        <span className="text-muted-foreground">{title}</span>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}
