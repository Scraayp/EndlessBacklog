import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare, MessageSquare, Paperclip, Clock } from "lucide-react";
import { clsx } from "clsx";
import { format, isPast } from "date-fns";
import type { CardSummary } from "@endlessbacklog/shared";
import { LabelChip } from "../../../components/ui/LabelChip.js";
import { AvatarStack } from "../../../components/ui/Avatar.js";

interface CardTileProps {
  card: CardSummary;
  onOpen: () => void;
}

export function CardTile({ card, onOpen }: CardTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = { transform: CSS.Translate.toString(transform), transition };
  const overdue = card.dueDate && !card.isArchived && isPast(new Date(card.dueDate));
  const hasChecklist = card.checklistItemCount > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={clsx(
        "cursor-pointer rounded-md border border-border bg-background p-2.5 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-40",
      )}
    >
      {card.coverUrl && (
        <img src={card.coverUrl} alt="" className="mb-2 h-24 w-full rounded object-cover" />
      )}
      {card.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {card.labels.map((l) => (
            <LabelChip key={l.id} color={l.color} name={l.name} size="sm" />
          ))}
        </div>
      )}
      <p className="text-sm text-foreground">{card.title}</p>

      {(card.dueDate || hasChecklist || card.commentCount > 0 || card.attachmentCount > 0 || card.members.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
          {card.dueDate && (
            <span className={clsx("inline-flex items-center gap-1 rounded px-1.5 py-0.5", overdue && "bg-danger/10 text-danger")}>
              <Clock size={12} />
              {format(new Date(card.dueDate), "MMM d")}
            </span>
          )}
          {hasChecklist && (
            <span className="inline-flex items-center gap-1">
              <CheckSquare size={12} />
              {card.checklistCheckedCount}/{card.checklistItemCount}
            </span>
          )}
          {card.commentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={12} />
              {card.commentCount}
            </span>
          )}
          {card.attachmentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip size={12} />
              {card.attachmentCount}
            </span>
          )}
          {card.members.length > 0 && (
            <span className="ml-auto">
              <AvatarStack users={card.members} max={3} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
