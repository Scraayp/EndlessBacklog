import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";
import { notificationApi } from "./api.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { getSocket } from "../../lib/socket.js";

export const useNotifications = () =>
  useQuery({ queryKey: queryKeys.notifications, queryFn: () => notificationApi.list() });

/** Subscribes to the personal `notification:new` socket event and merges it
 *  straight into the notifications query cache — mounted once near the app
 *  root so the bell badge updates live regardless of which page is open. */
export function useNotificationSocket() {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getSocket();
    const handler = () => qc.invalidateQueries({ queryKey: queryKeys.notifications });
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handler);
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handler);
    };
  }, [qc]);
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
