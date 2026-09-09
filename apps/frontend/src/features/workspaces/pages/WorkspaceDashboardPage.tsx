import { useState } from "react";
import { Link, useParams, Outlet } from "react-router-dom";
import { Plus, Settings } from "lucide-react";
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
        <div>
          <h1 className="text-xl font-semibold text-foreground">{data?.workspace.name}</h1>
          {data?.workspace.description && <p className="text-sm text-muted-foreground">{data.workspace.description}</p>}
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
              className="flex h-24 items-end rounded-lg p-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: board.backgroundType === "color" ? board.backgroundValue : undefined }}
            >
              <span className="drop-shadow">{board.name}</span>
            </Link>
          ))}
          <button
            onClick={() => setCreating(true)}
            className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary-500 hover:text-primary-500"
          >
            <Plus size={16} className="mr-1" /> Create board
          </button>
        </div>
      )}

      {workspaceId && <CreateBoardDialog workspaceId={workspaceId} open={creating} onOpenChange={setCreating} />}
      <Outlet />
    </div>
  );
}
