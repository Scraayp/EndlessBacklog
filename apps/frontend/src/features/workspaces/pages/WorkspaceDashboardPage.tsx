import { useState } from "react";
import { Link, useParams, Outlet } from "react-router-dom";
import { Plus, Settings, LayoutGrid } from "lucide-react";
import { boardBackgroundStyle } from "@endlessbacklog/shared";
import { useWorkspace, useWorkspaceBoards } from "../hooks.js";
import { CreateBoardDialog } from "../components/CreateBoardDialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function WorkspaceDashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data } = useWorkspace(workspaceId!);
  const { data: boards, isLoading } = useWorkspaceBoards(workspaceId!);
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[var(--r-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <LayoutGrid size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{data?.workspace.name}</h1>
            {data?.workspace.description && <p className="text-sm text-muted-foreground">{data.workspace.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/workspaces/${workspaceId}/settings`}>
            <Button variant="secondary">
              <Settings size={16} /> Settings
            </Button>
          </Link>
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> New board
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
          {(boards ?? []).map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="glass group relative flex h-28 flex-col justify-end overflow-hidden rounded-[var(--r-md)] p-3 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[var(--accent)] hover:shadow-[var(--shadow-lg)]"
            >
              <span
                className="absolute inset-x-0 top-0 h-1.5 rounded-t-[var(--r-md)] bg-cover bg-center"
                style={boardBackgroundStyle(board.backgroundType, board.backgroundValue)}
              />
              <span className="relative truncate text-sm font-semibold text-foreground">{board.name}</span>
            </Link>
          ))}
          <button
            onClick={() => setCreating(true)}
            className="flex h-28 flex-col items-center justify-center gap-1 rounded-[var(--r-md)] border border-dashed border-[var(--rule-strong)] text-sm text-muted-foreground transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={18} />
            Create board
          </button>
        </div>
      )}

      {boards && boards.length === 0 && !isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">No boards yet — create your first one to get started.</p>
      )}

      {workspaceId && <CreateBoardDialog workspaceId={workspaceId} open={creating} onOpenChange={setCreating} />}
      <Outlet />
    </div>
  );
}
