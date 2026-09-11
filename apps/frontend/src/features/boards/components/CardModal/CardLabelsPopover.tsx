import { useState } from "react";
import { Tag, Plus } from "lucide-react";
import type { Label } from "@endlessbacklog/shared";
import { LABEL_COLORS } from "@endlessbacklog/shared";
import { useBoardLabels, useCreateLabel } from "../../hooks.js";
import { Popover } from "../../../../components/ui/Popover.js";
import { Button } from "../../../../components/ui/Button.js";
import { Input } from "../../../../components/ui/Input.js";
import { LabelChip } from "../../../../components/ui/LabelChip.js";
import { clsx } from "clsx";

interface Props {
  boardId: string;
  selectedLabels: Label[];
  onToggle: (label: Label) => void;
}

export function CardLabelsPopover({ boardId, selectedLabels, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const labelsQuery = useBoardLabels(boardId);
  const createLabel = useCreateLabel(boardId);
  const selectedIds = new Set(selectedLabels.map((l) => l.id));

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="secondary" size="sm">
          <Tag size={14} /> Labels
        </Button>
      }
    >
      <p className="kicker mb-2">Labels</p>
      <div className="space-y-1">
        {(labelsQuery.data ?? []).map((label) => (
          <button
            key={label.id}
            onClick={() => onToggle(label)}
            className={clsx(
              "flex w-full items-center gap-2 rounded-[var(--r-sm)] p-1 hover:bg-[var(--sunken)]",
              selectedIds.has(label.id) && "ring-1 ring-[var(--accent)]",
            )}
          >
            <LabelChip color={label.color} name={label.name} className="flex-1 justify-start" />
          </button>
        ))}
      </div>

      {creating ? (
        <div className="mt-2 space-y-1.5 border-t border-[var(--rule)] pt-2">
          <Input placeholder="Label name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div className="flex flex-wrap gap-1">
            {LABEL_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  createLabel.mutate({ name: newName || null, color: c.key });
                  setNewName("");
                  setCreating(false);
                }}
                className="size-6 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c.light }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mt-2 flex w-full items-center gap-1.5 border-t border-[var(--rule)] pt-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Plus size={14} /> Create a new label
        </button>
      )}
    </Popover>
  );
}
