import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { Clock, X } from "lucide-react";
import { Popover } from "../../../../components/ui/Popover.js";
import { Button } from "../../../../components/ui/Button.js";

interface Props {
  dueDate: string | null;
  onChange: (iso: string | null) => void;
}

export function CardDueDatePicker({ dueDate, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = dueDate ? new Date(dueDate) : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="secondary" size="sm">
          <Clock size={14} />
          {selected ? format(selected, "MMM d, yyyy") : "Add due date"}
        </Button>
      }
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => {
          onChange(date ? date.toISOString() : null);
          setOpen(false);
        }}
      />
      {selected && (
        <button
          onClick={() => {
            onChange(null);
            setOpen(false);
          }}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-full border border-[var(--rule)] py-1.5 text-xs text-muted-foreground hover:bg-[var(--sunken)]"
        >
          <X size={12} /> Remove due date
        </button>
      )}
    </Popover>
  );
}
