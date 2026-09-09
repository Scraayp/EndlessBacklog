import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "../features/notifications/hooks.js";
import { notificationText, notificationLink } from "../features/notifications/notificationText.js";
import { Button } from "../components/ui/Button.js";
import { Spinner } from "../components/ui/Spinner.js";

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : (data?.notifications.length ?? 0) === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">You're all caught up.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {data!.notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.isRead) markRead.mutate(n.id);
                const link = notificationLink(n);
                if (link) navigate(link);
              }}
              className={clsx("flex w-full items-start justify-between gap-3 p-3 text-left hover:bg-surface-hover", !n.isRead && "bg-primary-50 dark:bg-primary-700/20")}
            >
              <p className="text-sm text-foreground">{notificationText(n)}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
