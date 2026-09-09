import { api } from "../../lib/apiClient.js";
import type {
  Board,
  BoardMemberWithUser,
  List,
  CardSummary,
  CardDetail,
  Label,
  ChecklistWithItems,
  ChecklistItem,
  CommentWithAuthor,
  AttachmentWithUrl,
  ActivityLogEntryWithActor,
  BoardRole,
  UpdateCardInput,
} from "@endlessbacklog/shared";

export const boardApi = {
  get: (boardId: string) => api.get<{ board: Board; myRole: BoardRole }>(`/boards/${boardId}`),
  update: (boardId: string, data: Partial<{ name: string; backgroundType: string; backgroundValue: string; isArchived: boolean }>) =>
    api.patch<{ board: Board }>(`/boards/${boardId}`, data),
  create: (data: { workspaceId: string; name: string; backgroundType?: "color" | "image"; backgroundValue?: string }) =>
    api.post<{ board: Board }>("/boards", data),

  listMembers: (boardId: string) => api.get<{ members: BoardMemberWithUser[] }>(`/boards/${boardId}/members`),
  addMember: (boardId: string, userId: string, role: BoardRole = "member") =>
    api.post<void>(`/boards/${boardId}/members`, { userId, role }),
  removeMember: (boardId: string, userId: string) => api.delete<void>(`/boards/${boardId}/members/${userId}`),

  listLists: (boardId: string) => api.get<{ lists: List[] }>(`/boards/${boardId}/lists`),
  listCards: (boardId: string) => api.get<{ cards: CardSummary[] }>(`/boards/${boardId}/cards`),
  listLabels: (boardId: string) => api.get<{ labels: Label[] }>(`/boards/${boardId}/labels`),
};

export const listApi = {
  create: (boardId: string, name: string) => api.post<{ list: List }>("/lists", { boardId, name }),
  update: (listId: string, data: Partial<{ name: string; isArchived: boolean }>) =>
    api.patch<{ list: List }>(`/lists/${listId}`, data),
  reorder: (listId: string, beforeId: string | null, afterId: string | null) =>
    api.post<{ list: List }>(`/lists/${listId}/reorder`, { beforeId, afterId }),
};

export const cardApi = {
  create: (listId: string, title: string) => api.post<{ card: { id: string } }>("/cards", { listId, title }),
  getDetail: (cardId: string) => api.get<{ card: CardDetail }>(`/cards/${cardId}`),
  update: (cardId: string, data: UpdateCardInput) => api.patch<{ card: CardSummary }>(`/cards/${cardId}`, data),
  move: (cardId: string, listId: string, beforeId: string | null, afterId: string | null) =>
    api.post<{ card: { id: string } }>(`/cards/${cardId}/move`, { listId, beforeId, afterId }),
  addLabel: (cardId: string, labelId: string) => api.post<void>(`/cards/${cardId}/labels`, { labelId }),
  removeLabel: (cardId: string, labelId: string) => api.delete<void>(`/cards/${cardId}/labels/${labelId}`),
  addMember: (cardId: string, userId: string) => api.post<void>(`/cards/${cardId}/members`, { userId }),
  removeMember: (cardId: string, userId: string) => api.delete<void>(`/cards/${cardId}/members/${userId}`),
  listActivity: (cardId: string) => api.get<{ activity: ActivityLogEntryWithActor[] }>(`/cards/${cardId}/activity`),
};

export const labelApi = {
  create: (boardId: string, name: string | null, color: string) =>
    api.post<{ label: Label }>("/labels", { boardId, name, color }),
  update: (labelId: string, data: { name?: string | null; color?: string }) =>
    api.patch<{ label: Label }>(`/labels/${labelId}`, data),
  remove: (labelId: string) => api.delete<void>(`/labels/${labelId}`),
};

export const checklistApi = {
  create: (cardId: string, title: string) => api.post<{ checklist: ChecklistWithItems }>("/checklists", { cardId, title }),
  update: (checklistId: string, data: { title?: string }) =>
    api.patch<{ checklist: ChecklistWithItems }>(`/checklists/${checklistId}`, data),
  remove: (checklistId: string) => api.delete<void>(`/checklists/${checklistId}`),
  addItem: (checklistId: string, text: string) =>
    api.post<{ item: ChecklistItem }>("/checklists/items", { checklistId, text }),
  updateItem: (itemId: string, data: Partial<{ text: string; isChecked: boolean }>) =>
    api.patch<{ item: ChecklistItem }>(`/checklists/items/${itemId}`, data),
  removeItem: (itemId: string) => api.delete<void>(`/checklists/items/${itemId}`),
};

export const commentApi = {
  create: (cardId: string, bodyHtml: string, mentionedUserIds: string[] = []) =>
    api.post<{ comment: CommentWithAuthor }>("/comments", { cardId, bodyHtml, mentionedUserIds }),
  update: (commentId: string, bodyHtml: string, mentionedUserIds: string[] = []) =>
    api.patch<{ comment: CommentWithAuthor }>(`/comments/${commentId}`, { bodyHtml, mentionedUserIds }),
  remove: (commentId: string) => api.delete<void>(`/comments/${commentId}`),
};

export const attachmentApi = {
  requestUpload: (cardId: string, fileName: string, mimeType: string, sizeBytes: number) =>
    api.post<{ uploadUrl: string; storageKey: string }>("/attachments/request-upload", {
      cardId,
      fileName,
      mimeType,
      sizeBytes,
    }),
  confirmUpload: (cardId: string, storageKey: string, fileName: string, mimeType: string, sizeBytes: number) =>
    api.post<{ attachment: AttachmentWithUrl }>("/attachments/confirm-upload", {
      cardId,
      storageKey,
      fileName,
      mimeType,
      sizeBytes,
    }),
  remove: (attachmentId: string) => api.delete<void>(`/attachments/${attachmentId}`),
};
