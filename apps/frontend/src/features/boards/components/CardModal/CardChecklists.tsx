import { useState } from "react";
import { CheckSquare, Trash2 } from "lucide-react";
import type { ChecklistWithItems } from "@endlessbacklog/shared";
import {
  useCreateChecklist,
  useRemoveChecklist,
  useAddChecklistItem,
  useToggleChecklistItem,
  useRemoveChecklistItem,
} from "../../cardHooks.js";
import { Input } from "../../../../components/ui/Input.js";
import { Button } from "../../../../components/ui/Button.js";

export function CardChecklists({ boardId, cardId, checklists }: { boardId: string; cardId: string; checklists: ChecklistWithItems[] }) {
  const createChecklist = useCreateChecklist(boardId, cardId);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  return (
    <div className="space-y-5">
      {checklists.map((cl) => (
        <ChecklistSection key={cl.id} boardId={boardId} cardId={cardId} checklist={cl} />
      ))}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) createChecklist.mutate(title.trim());
            setTitle("");
            setAdding(false);
          }}
          className="flex gap-2"
        >
          <Input autoFocus placeholder="Checklist title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button type="submit" size="sm">
            Add
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <CheckSquare size={14} /> Add checklist
        </Button>
      )}
    </div>
  );
}

function ChecklistSection({ boardId, cardId, checklist }: { boardId: string; cardId: string; checklist: ChecklistWithItems }) {
  const removeChecklist = useRemoveChecklist(boardId, cardId);
  const addItem = useAddChecklistItem(boardId, cardId);
  const toggleItem = useToggleChecklistItem(boardId, cardId);
  const removeItem = useRemoveChecklistItem(boardId, cardId);
  const [newItemText, setNewItemText] = useState("");

  const checkedCount = checklist.items.filter((i) => i.isChecked).length;
  const total = checklist.items.length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{checklist.title}</p>
        <button
          onClick={() => removeChecklist.mutate(checklist.id)}
          className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-danger"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {total > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <span className="w-9 text-xs text-muted-foreground">{pct}%</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
            <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <div className="space-y-1">
        {checklist.items.map((item) => (
          <label key={item.id} className="group flex items-center gap-2 rounded px-1 py-0.5 hover:bg-surface-hover">
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={(e) => toggleItem.mutate({ itemId: item.id, isChecked: e.target.checked })}
              className="size-4 accent-primary-500"
            />
            <span className={item.isChecked ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm text-foreground"}>
              {item.text}
            </span>
            <button
              onClick={() => removeItem.mutate(item.id)}
              className="rounded p-0.5 text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
          </label>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newItemText.trim()) addItem.mutate({ checklistId: checklist.id, text: newItemText.trim() });
          setNewItemText("");
        }}
        className="mt-1.5"
      >
        <Input
          placeholder="Add an item"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="h-8 text-sm"
        />
      </form>
    </div>
  );
}
