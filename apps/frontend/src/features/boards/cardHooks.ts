import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cardApi, checklistApi, commentApi, attachmentApi } from "./api.js";
import { queryKeys } from "../../lib/queryKeys.js";

export const useCardDetail = (cardId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.card(cardId ?? ""),
    queryFn: () => cardApi.getDetail(cardId!).then((r) => r.card),
    enabled: !!cardId,
  });

export const useCardActivity = (cardId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.cardActivity(cardId ?? ""),
    queryFn: () => cardApi.listActivity(cardId!).then((r) => r.activity),
    enabled: !!cardId,
  });

function invalidateCard(qc: ReturnType<typeof useQueryClient>, boardId: string, cardId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.card(cardId) });
  qc.invalidateQueries({ queryKey: queryKeys.boardCards(boardId) });
  qc.invalidateQueries({ queryKey: queryKeys.cardActivity(cardId) });
}

export function useCreateChecklist(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => checklistApi.create(cardId, title),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useRemoveChecklist(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checklistId: string) => checklistApi.remove(checklistId),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useAddChecklistItem(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, text }: { checklistId: string; text: string }) => checklistApi.addItem(checklistId, text),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useToggleChecklistItem(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, isChecked }: { itemId: string; isChecked: boolean }) =>
      checklistApi.updateItem(itemId, { isChecked }),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useRemoveChecklistItem(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => checklistApi.removeItem(itemId),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useCreateComment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bodyHtml, mentionedUserIds }: { bodyHtml: string; mentionedUserIds: string[] }) =>
      commentApi.create(cardId, bodyHtml, mentionedUserIds),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useRemoveComment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentApi.remove(commentId),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useUploadAttachment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const { uploadUrl, storageKey } = await attachmentApi.requestUpload(cardId, file.name, file.type, file.size);
      const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) throw new Error("Upload to storage failed");
      return attachmentApi.confirmUpload(cardId, storageKey, file.name, file.type, file.size);
    },
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}

export function useRemoveAttachment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentApi.remove(attachmentId),
    onSuccess: () => invalidateCard(qc, boardId, cardId),
  });
}
