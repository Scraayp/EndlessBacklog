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
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-300">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(boards ?? []).map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="group relative flex h-28 flex-col justify-end overflow-hidden rounded-xl bg-cover bg-center p-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-black/10"
              style={boardBackgroundStyle(board.backgroundType, board.backgroundValue)}
            >
              <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/40 to-transparent" />
              <span className="relative truncate text-sm font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]">
                {board.name}
              </span>
            </Link>
          ))}
          <button
            onClick={() => setCreating(true)}
            className="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300"
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
