import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardApi, listApi, cardApi, labelApi } from "./api.js";
import { queryKeys } from "../../lib/queryKeys.js";
import type { CardSummary, List, UpdateCardInput, BoardRole, BoardBackgroundType } from "@endlessbacklog/shared";

export const useBoard = (boardId: string) =>
  useQuery({ queryKey: queryKeys.board(boardId), queryFn: () => boardApi.get(boardId), enabled: !!boardId });

export const useBoardLists = (boardId: string) =>
  useQuery({
    queryKey: queryKeys.boardLists(boardId),
    queryFn: () => boardApi.listLists(boardId).then((r) => r.lists),
    enabled: !!boardId,
  });

export const useBoardCards = (boardId: string) =>
  useQuery({
    queryKey: queryKeys.boardCards(boardId),
    queryFn: () => boardApi.listCards(boardId).then((r) => r.cards),
    enabled: !!boardId,
  });

export const useBoardLabels = (boardId: string) =>
  useQuery({
    queryKey: queryKeys.boardLabels(boardId),
    queryFn: () => boardApi.listLabels(boardId).then((r) => r.labels),
    enabled: !!boardId,
  });

export const useBoardMembers = (boardId: string) =>
  useQuery({
    queryKey: queryKeys.boardMembers(boardId),
    queryFn: () => boardApi.listMembers(boardId).then((r) => r.members),
    enabled: !!boardId,
  });

export const useBoardActivity = (boardId: string) =>
  useQuery({
    queryKey: queryKeys.boardActivity(boardId),
    queryFn: () => boardApi.listActivity(boardId).then((r) => r.activity),
    enabled: !!boardId,
  });

export function useUpdateBoard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ name: string; backgroundType: BoardBackgroundType; backgroundValue: string; isArchived: boolean }>) =>
      boardApi.update(boardId, data),
    onSuccess: ({ board }) => {
      qc.setQueryData(queryKeys.board(boardId), (prev: { board: typeof board; myRole: BoardRole } | undefined) =>
        prev ? { ...prev, board } : prev,
      );
    },
  });
}

export function useAddBoardMember(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: BoardRole }) => boardApi.addMember(boardId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardMembers(boardId) }),
  });
}

export function useUpdateBoardMemberRole(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: BoardRole }) => boardApi.updateMemberRole(boardId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardMembers(boardId) }),
  });
}

export function useRemoveBoardMember(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => boardApi.removeMember(boardId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardMembers(boardId) }),
  });
}

export function useCreateList(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => listApi.create(boardId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) }),
  });
}

export function useUpdateList(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: Partial<{ name: string; isArchived: boolean }> }) =>
      listApi.update(listId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) }),
  });
}

interface ReorderListVars {
  listId: string;
  beforeId: string | null;
  afterId: string | null;
  /** Full new list-id order, for the optimistic local reorder — computed by
   *  the caller from the visible (already-sorted) list array. */
  orderedIds: string[];
}

/** Optimistically reorders the lists cache immediately (for instant drag
 *  feedback), then persists via the fractional-position API. Reconciles
 *  with the server response (and rolls back on error). */
export function useReorderList(boardId: string) {
  const qc = useQueryClient();
  const key = queryKeys.boardLists(boardId);
  return useMutation<List, Error, ReorderListVars, { previous?: List[] }>({
    mutationFn: ({ listId, beforeId, afterId }) => listApi.reorder(listId, beforeId, afterId).then((r) => r.list),
    onMutate: async ({ orderedIds }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<List[]>(key);
      if (previous) {
        const byId = new Map(previous.map((l) => [l.id, l]));
        const reordered = orderedIds.map((id) => byId.get(id)).filter((l): l is List => !!l);
        qc.setQueryData(key, reordered);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useCreateCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) => cardApi.create(listId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) }),
  });
}

export function useUpdateCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: UpdateCardInput }) => cardApi.update(cardId, data),
    onSuccess: (_res, { cardId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
      qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });
    },
  });
}

interface MoveCardVars {
  cardId: string;
  fromListId: string;
  toListId: string;
  beforeId: string | null;
  afterId: string | null;
  /** Full new position of the card within the destination list's cards, for
   *  the optimistic local reorder — computed by the caller from the visible
   *  (already-sorted) card list. */
  newIndex: number;
}

/** Optimistically moves a card between/within lists in the boardCards cache
 *  so the drag feels instant, then persists and reconciles with the server. */
export function useMoveCard(boardId: string) {
  const qc = useQueryClient();
  const key = queryKeys.boardCards(boardId);
  return useMutation({
    mutationFn: (vars: MoveCardVars) => cardApi.move(vars.cardId, vars.toListId, vars.beforeId, vars.afterId),
    onMutate: async (vars: MoveCardVars) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CardSummary[]>(key);
      if (previous) {
        const card = previous.find((c) => c.id === vars.cardId);
        if (card) {
          const withoutCard = previous.filter((c) => c.id !== vars.cardId);
          const destCards = withoutCard
            .filter((c) => c.listId === vars.toListId)
            .sort((a, b) => a.position - b.position);
          destCards.splice(vars.newIndex, 0, { ...card, listId: vars.toListId });
          const rest = withoutCard.filter((c) => c.listId !== vars.toListId);
          // Re-derive a monotonic local `position` just for optimistic sort
          // stability — the server response (reconciled on settle) is the
          // source of truth for real positions.
          const renumbered = destCards.map((c, i) => ({ ...c, position: i }));
          qc.setQueryData(key, [...rest, ...renumbered]);
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useAddCardLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) => cardApi.addLabel(cardId, labelId),
    onSuccess: (_r, { cardId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
      qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });
    },
  });
}

export function useRemoveCardLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) => cardApi.removeLabel(cardId, labelId),
    onSuccess: (_r, { cardId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
      qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });
    },
  });
}

export function useAddCardMember(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, userId }: { cardId: string; userId: string }) => cardApi.addMember(cardId, userId),
    onSuccess: (_r, { cardId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
      qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });
    },
  });
}

export function useRemoveCardMember(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, userId }: { cardId: string; userId: string }) => cardApi.removeMember(cardId, userId),
    onSuccess: (_r, { cardId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
      qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });
    },
  });
}

export function useCreateLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string | null; color: string }) => labelApi.create(boardId, name, color),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardLabels(boardId) }),
  });
}
