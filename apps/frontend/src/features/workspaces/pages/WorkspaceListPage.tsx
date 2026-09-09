import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { useWorkspaces } from "../hooks.js";
import { CreateWorkspaceDialog } from "../components/CreateWorkspaceDialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function WorkspaceListPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Your workspaces</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> New workspace
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/workspaces/${ws.id}`}
              className="rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-primary-500 text-sm font-bold text-white">
                {ws.name.slice(0, 1).toUpperCase()}
              </div>
              <p className="font-medium text-foreground">{ws.name}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Users size={12} /> {ws.boardCount} board{ws.boardCount === 1 ? "" : "s"} · {ws.myRole}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">You're not in any workspaces yet.</p>
          <Button className="mt-3" onClick={() => setCreating(true)}>
            <Plus size={16} /> Create your first workspace
          </Button>
        </div>
      )}

      <CreateWorkspaceDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
