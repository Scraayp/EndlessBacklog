import { formatDistanceToNow } from "date-fns";
import { useCardActivity } from "../../cardHooks.js";
import { Avatar } from "../../../../components/ui/Avatar.js";
import { Spinner } from "../../../../components/ui/Spinner.js";

const ACTIVITY_LABELS: Record<string, (m: Record<string, unknown>) => string> = {
  "card.created": () => "created this card",
  "card.updated": () => "updated this card",
  "card.moved": () => "moved this card",
  "card.archived": () => "archived this card",
  "card.label_added": () => "added a label",
  "card.label_removed": () => "removed a label",
  "card.member_added": () => "added a member",
  "card.member_removed": () => "removed a member",
  "checklist.created": (m) => `added checklist "${m.title ?? ""}"`,
  "checklist.item_added": (m) => `added checklist item "${m.text ?? ""}"`,
  "checklist.item_toggled": (m) => (m.isChecked ? "checked an item" : "unchecked an item"),
  "comment.added": () => "commented",
  "comment.deleted": () => "deleted a comment",
  "attachment.added": (m) => `attached "${m.fileName ?? ""}"`,
  "attachment.removed": (m) => `removed attachment "${m.fileName ?? ""}"`,
};

export function CardActivityLog({ cardId }: { cardId: string }) {
  const { data, isLoading } = useCardActivity(cardId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <Spinner size={16} />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {(data ?? []).map((entry) => (
        <div key={entry.id} className="flex items-start gap-2 text-sm">
          <Avatar name={entry.actor.displayName} src={entry.actor.avatarUrl} size="sm" />
          <p className="text-foreground">
            <span className="font-medium">{entry.actor.displayName}</span>{" "}
            <span className="text-muted-foreground">
              {(ACTIVITY_LABELS[entry.type] ?? (() => entry.type))(entry.metadata)} ·{" "}
              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
