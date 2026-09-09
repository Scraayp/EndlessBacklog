import { useState, useRef, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Textarea } from "../../../components/ui/Input.js";
import { Button } from "../../../components/ui/Button.js";

export function AddCardComposer({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const title = value.trim();
    if (title) onAdd(title);
    setValue("");
    ref.current?.focus();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      >
        <Plus size={16} /> Add a card
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <Textarea
        ref={ref}
        autoFocus
        rows={2}
        placeholder="Enter a title…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) submit(e);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <div className="flex items-center gap-1.5">
        <Button type="submit" size="sm">
          Add card
        </Button>
        <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-hover">
          <X size={16} />
        </button>
      </div>
    </form>
  );
}
