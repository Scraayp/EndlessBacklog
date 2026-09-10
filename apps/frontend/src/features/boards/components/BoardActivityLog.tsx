import { formatDistanceToNow } from "date-fns";
import { useBoardActivity } from "../hooks.js";
import { activityLabel } from "../activityLabels.js";
import { Avatar } from "../../../components/ui/Avatar.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function BoardActivityLog({ boardId }: { boardId: string }) {
  const { data, isLoading } = useBoardActivity(boardId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size={18} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {data.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2 text-sm">
          <Avatar name={entry.actor.displayName} src={entry.actor.avatarUrl} size="sm" />
          <p className="text-foreground">
            <span className="font-medium">{entry.actor.displayName}</span>{" "}
            <span className="text-muted-foreground">
              {activityLabel(entry.type, entry.metadata)} · {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
