import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import type { List, CardSummary } from "@endlessbacklog/shared";
import { CardTile } from "./CardTile.js";
import { AddCardComposer } from "./AddCardComposer.js";
import { Input } from "../../../components/ui/Input.js";
import { DropdownMenu, DropdownItem } from "../../../components/ui/DropdownMenu.js";

interface ListColumnProps {
  list: List;
  cards: CardSummary[];
  onAddCard: (title: string) => void;
  onRename: (name: string) => void;
  onArchive: () => void;
  onOpenCard: (cardId: string) => void;
}

export function ListColumn({ list, cards, onAddCard, onRename, onArchive, onOpenCard }: ListColumnProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list", list },
  });
  const style = { transform: CSS.Translate.toString(transform), transition };

  // Registers the card-list region as a droppable target in its own right —
  // needed so a card can be dropped into an EMPTY list (no cards means no
  // sortable items to register a drop zone via useSortable).
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `list-container-${list.id}`,
    data: { type: "list-container", listId: list.id },
  });

  function commitRename() {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== list.name) onRename(trimmed);
    else setName(list.name);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "glass flex max-h-full w-72 shrink-0 flex-col rounded-[var(--r-md)]",
        isDragging && "opacity-40",
      )}
    >
      <div {...attributes} {...listeners} className="flex cursor-grab items-center justify-between gap-2 px-2.5 pt-2.5">
        {editing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setName(list.name);
                setEditing(false);
              }
            }}
            className="h-7 py-1 text-sm font-semibold"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="kicker min-w-0 flex-1 truncate rounded-[var(--r-sm)] px-1.5 py-1 text-left hover:bg-[var(--sunken)] hover:text-foreground"
          >
            {list.name}
          </button>
        )}
        {cards.length > 0 && (
          <span className="kicker rounded-full bg-[var(--sunken)] px-2 py-0.5 tabular-nums">{cards.length}</span>
        )}
        <DropdownMenu
          trigger={
            <button className="rounded-full p-1 text-muted-foreground hover:bg-[var(--sunken)]">
              <MoreHorizontal size={16} />
            </button>
          }
        >
          <DropdownItem onSelect={() => setEditing(true)}>Rename list</DropdownItem>
          <DropdownItem onSelect={onArchive}>Archive list</DropdownItem>
        </DropdownMenu>
      </div>

      <div ref={setDroppableRef} className="flex-1 space-y-2 overflow-y-auto px-2.5 py-2">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardTile key={card.id} card={card} onOpen={() => onOpenCard(card.id)} />
          ))}
        </SortableContext>
      </div>

      <div className="px-2.5 pb-2.5">
        <AddCardComposer onAdd={onAddCard} />
      </div>
    </div>
  );
}
