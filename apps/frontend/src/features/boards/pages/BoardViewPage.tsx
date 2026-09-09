import { useMemo, useState } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { CardSummary, List } from "@endlessbacklog/shared";
import { useBoard, useBoardLists, useBoardCards, useBoardLabels, useCreateList, useUpdateList, useReorderList, useCreateCard, useMoveCard } from "../hooks.js";
import { useBoardSocket } from "../useBoardSocket.js";
import { queryKeys } from "../../../lib/queryKeys.js";
import { ListColumn } from "../components/ListColumn.js";
import { CardTile } from "../components/CardTile.js";
import { useCardFilter } from "../components/SearchFilterBar.js";
import { Spinner } from "../../../components/ui/Spinner.js";
import { Button } from "../../../components/ui/Button.js";
import { Input } from "../../../components/ui/Input.js";

// Stable empty-array references so `data ?? EMPTY_*` doesn't change identity
// on every render while a query is still loading (which would otherwise
// invalidate the useMemo below on each render).
const EMPTY_LISTS: List[] = [];
const EMPTY_CARDS: CardSummary[] = [];

export function BoardViewPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const boardQuery = useBoard(boardId!);
  const listsQuery = useBoardLists(boardId!);
  const cardsQuery = useBoardCards(boardId!);
  useBoardLabels(boardId!); // pre-warm cache for filter bar / card modal
  useBoardSocket(boardId);

  const createList = useCreateList(boardId!);
  const updateList = useUpdateList(boardId!);
  const reorderList = useReorderList(boardId!);
  const createCard = useCreateCard(boardId!);
  const moveCard = useMoveCard(boardId!);

  const { FilterBar, applyFilter } = useCardFilter(boardId!);

  const [activeCard, setActiveCard] = useState<CardSummary | null>(null);
  const [activeList, setActiveList] = useState<List | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const lists = listsQuery.data ?? EMPTY_LISTS;
  const allCards = cardsQuery.data ?? EMPTY_CARDS;
  const cards = useMemo(() => applyFilter(allCards), [allCards, applyFilter]);

  const cardsByList = useMemo(() => {
    const map = new Map<string, CardSummary[]>();
    for (const list of lists) map.set(list.id, []);
    for (const card of cards) {
      if (!map.has(card.listId)) map.set(card.listId, []);
      map.get(card.listId)!.push(card);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.position - b.position);
    return map;
  }, [lists, cards]);

  function findContainerId(cardId: string): string | undefined {
    for (const [listId, listCards] of cardsByList) {
      if (listCards.some((c) => c.id === cardId)) return listId;
    }
    return undefined;
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "card") setActiveCard(data.card as CardSummary);
    if (data?.type === "list") setActiveList(data.list as List);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "card") return;

    const activeCardId = String(active.id);
    const fromListId = findContainerId(activeCardId);
    const overData = over.data.current;
    const toListId =
      overData?.type === "card" ? findContainerId(String(over.id)) : (overData?.listId as string | undefined);
    if (!fromListId || !toListId || fromListId === toListId) return;

    // Reparent the card into the hovered list immediately, in the live
    // (unfiltered) query cache, so the drag visually crosses into the new
    // column — dnd-kit's own animation then handles in-column reordering.
    qc.setQueryData<CardSummary[]>(queryKeys.boardCards(boardId!), (prev) =>
      prev?.map((c) => (c.id === activeCardId ? { ...c, listId: toListId } : c)),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);
    if (!over) return;

    if (active.data.current?.type === "list") {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(lists, oldIndex, newIndex);
      reorderList.mutate({
        listId: String(active.id),
        beforeId: reordered[newIndex - 1]?.id ?? null,
        afterId: reordered[newIndex + 1]?.id ?? null,
        orderedIds: reordered.map((l) => l.id),
      });
      return;
    }

    if (active.data.current?.type === "card") {
      const cardId = String(active.id);
      const toListId = findContainerId(cardId);
      if (!toListId) return;
      const siblings = cardsByList.get(toListId) ?? [];
      const index = siblings.findIndex((c) => c.id === cardId);
      const before = siblings[index - 1];
      const after = siblings[index + 1];
      const card = allCards.find((c) => c.id === cardId);

      moveCard.mutate({
        cardId,
        fromListId: card?.listId ?? toListId,
        toListId,
        beforeId: before?.id ?? null,
        afterId: after?.id ?? null,
        newIndex: index,
      });
    }
  }

  function submitNewList() {
    const name = newListName.trim();
    if (name) createList.mutate(name);
    setNewListName("");
    setAddingList(false);
  }

  if (boardQuery.isLoading || listsQuery.isLoading || cardsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  const board = boardQuery.data?.board;

  return (
    <div className="flex h-full flex-col" style={board?.backgroundType === "color" ? { backgroundColor: `${board.backgroundValue}22` } : undefined}>
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background/70 px-4 py-2.5 backdrop-blur">
        <h1 className="truncate text-base font-semibold text-foreground">{board?.name}</h1>
        <FilterBar />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 items-start gap-3 overflow-x-auto p-4">
          <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                cards={cardsByList.get(list.id) ?? []}
                onAddCard={(title) => createCard.mutate({ listId: list.id, title })}
                onRename={(name) => updateList.mutate({ listId: list.id, data: { name } })}
                onArchive={() => updateList.mutate({ listId: list.id, data: { isArchived: true } })}
                onOpenCard={(cardId) => navigate(`/boards/${boardId}/cards/${cardId}`)}
              />
            ))}
          </SortableContext>

          <div className="w-72 shrink-0">
            {addingList ? (
              <div className="space-y-1.5 rounded-lg bg-surface p-2.5">
                <Input
                  autoFocus
                  placeholder="List name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitNewList();
                    if (e.key === "Escape") setAddingList(false);
                  }}
                  onBlur={submitNewList}
                />
              </div>
            ) : (
              <Button variant="secondary" className="w-full justify-start" onClick={() => setAddingList(true)}>
                <Plus size={16} /> Add another list
              </Button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && <CardTile card={activeCard} onOpen={() => {}} />}
          {activeList && (
            <div className="w-72 rounded-lg bg-surface p-2.5 shadow-lg">
              <p className="text-sm font-semibold text-foreground">{activeList.name}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Outlet />
    </div>
  );
}
