import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { UserPublic } from "@endlessbacklog/shared";
import { useBoardMembers } from "../../hooks.js";
import { Popover } from "../../../../components/ui/Popover.js";
import { Button } from "../../../../components/ui/Button.js";
import { Avatar } from "../../../../components/ui/Avatar.js";
import { clsx } from "clsx";

interface Props {
  boardId: string;
  selectedMembers: UserPublic[];
  onToggle: (userId: string) => void;
}

export function CardMembersPopover({ boardId, selectedMembers, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const membersQuery = useBoardMembers(boardId);
  const selectedIds = new Set(selectedMembers.map((m) => m.id));

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="secondary" size="sm">
          <UserPlus size={14} /> Members
        </Button>
      }
    >
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Board members</p>
      <div className="space-y-1">
        {(membersQuery.data ?? []).map((m) => (
          <button
            key={m.userId}
            onClick={() => onToggle(m.userId)}
            className={clsx(
              "flex w-full items-center gap-2 rounded-md p-1.5 text-left text-sm hover:bg-surface-hover",
              selectedIds.has(m.userId) && "bg-primary-50 dark:bg-primary-700/30",
            )}
          >
            <Avatar name={m.user.displayName} src={m.user.avatarUrl} size="sm" />
            <span className="flex-1 truncate">{m.user.displayName}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
