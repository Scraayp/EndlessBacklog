import { api } from "../../lib/apiClient.js";
import type { Notification } from "@endlessbacklog/shared";

export const notificationApi = {
  list: () => api.get<{ notifications: Notification[]; unreadCount: number }>("/notifications"),
  markRead: (id: string) => api.post<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>("/notifications/read-all"),
};
