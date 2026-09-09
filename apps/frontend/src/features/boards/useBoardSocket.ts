import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SOCKET_EVENTS, type CardSummary } from "@endlessbacklog/shared";
import { getSocket } from "../../lib/socket.js";
import { queryKeys } from "../../lib/queryKeys.js";

/**
 * Joins the board's socket room and merges every incoming event into the
 * same TanStack Query cache that local optimistic mutations update — one
 * source of truth for the board UI, whether a change came from this tab or
 * another user's. Kept intentionally coarse (invalidate-on-event) for
 * anything that isn't cheap to patch in place; card/list moves are patched
 * directly since those fire constantly during active collaboration.
 */
export function useBoardSocket(boardId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!boardId) return;
    const socket = getSocket();

    socket.emit(SOCKET_EVENTS.BOARD_JOIN, boardId);

    const invalidateLists = () => qc.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) });
    const invalidateCards = () => qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
    const invalidateBoard = () => qc.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    const invalidateCard = (cardId: string) => qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });

    const onBoardUpdated = () => invalidateBoard();
    const onListChanged = () => invalidateLists();

    const onCardCreated = ({ card }: { card: CardSummary }) => {
      qc.setQueryData<CardSummary[]>(queryKeys.boardCards(boardId), (prev) =>
        prev?.some((c) => c.id === card.id) ? prev : [...(prev ?? []), card],
      );
    };
    const onCardUpdated = ({ card }: { card: CardSummary }) => {
      qc.setQueryData<CardSummary[]>(queryKeys.boardCards(boardId), (prev) =>
        prev?.map((c) => (c.id === card.id ? card : c)),
      );
      invalidateCard(card.id);
    };
    const onCardMoved = ({ cardId, toListId, position }: { cardId: string; toListId: string; position: number }) => {
      qc.setQueryData<CardSummary[]>(queryKeys.boardCards(boardId), (prev) =>
        prev?.map((c) => (c.id === cardId ? { ...c, listId: toListId, position } : c)),
      );
    };
    const onCardArchived = ({ card }: { card: CardSummary }) => {
      qc.setQueryData<CardSummary[]>(queryKeys.boardCards(boardId), (prev) =>
        card.isArchived ? prev?.filter((c) => c.id !== card.id) : prev?.map((c) => (c.id === card.id ? card : c)),
      );
    };
    const onCardSubResourceChanged = (payload: { cardId: string }) => {
      invalidateCards();
      invalidateCard(payload.cardId);
    };

    socket.on(SOCKET_EVENTS.BOARD_UPDATED, onBoardUpdated);
    socket.on(SOCKET_EVENTS.LIST_CREATED, onListChanged);
    socket.on(SOCKET_EVENTS.LIST_UPDATED, onListChanged);
    socket.on(SOCKET_EVENTS.LIST_REORDERED, onListChanged);
    socket.on(SOCKET_EVENTS.LIST_ARCHIVED, onListChanged);
    socket.on(SOCKET_EVENTS.CARD_CREATED, onCardCreated);
    socket.on(SOCKET_EVENTS.CARD_UPDATED, onCardUpdated);
    socket.on(SOCKET_EVENTS.CARD_MOVED, onCardMoved);
    socket.on(SOCKET_EVENTS.CARD_ARCHIVED, onCardArchived);
    socket.on(SOCKET_EVENTS.CARD_LABEL_CHANGED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.CARD_MEMBER_CHANGED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.CHECKLIST_CHANGED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.COMMENT_ADDED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.COMMENT_UPDATED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.COMMENT_DELETED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.ATTACHMENT_ADDED, onCardSubResourceChanged);
    socket.on(SOCKET_EVENTS.ATTACHMENT_REMOVED, onCardSubResourceChanged);

    return () => {
      socket.emit(SOCKET_EVENTS.BOARD_LEAVE, boardId);
      socket.off(SOCKET_EVENTS.BOARD_UPDATED, onBoardUpdated);
      socket.off(SOCKET_EVENTS.LIST_CREATED, onListChanged);
      socket.off(SOCKET_EVENTS.LIST_UPDATED, onListChanged);
      socket.off(SOCKET_EVENTS.LIST_REORDERED, onListChanged);
      socket.off(SOCKET_EVENTS.LIST_ARCHIVED, onListChanged);
      socket.off(SOCKET_EVENTS.CARD_CREATED, onCardCreated);
      socket.off(SOCKET_EVENTS.CARD_UPDATED, onCardUpdated);
      socket.off(SOCKET_EVENTS.CARD_MOVED, onCardMoved);
      socket.off(SOCKET_EVENTS.CARD_ARCHIVED, onCardArchived);
      socket.off(SOCKET_EVENTS.CARD_LABEL_CHANGED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.CARD_MEMBER_CHANGED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.CHECKLIST_CHANGED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.COMMENT_ADDED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.COMMENT_UPDATED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.COMMENT_DELETED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.ATTACHMENT_ADDED, onCardSubResourceChanged);
      socket.off(SOCKET_EVENTS.ATTACHMENT_REMOVED, onCardSubResourceChanged);
    };
  }, [boardId, qc]);
}
