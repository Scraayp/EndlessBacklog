import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "../../components/ui/DropdownMenu.js";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "./hooks.js";
import { notificationText, notificationLink } from "./notificationText.js";

export function NotificationDropdown() {
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DropdownMenu
      trigger={
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} className="text-xs text-primary-600 hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <DropdownSeparator />
      <div className="max-h-80 w-72 overflow-y-auto">
        {notifications.length === 0 && <p className="p-3 text-center text-sm text-muted-foreground">You're all caught up.</p>}
        {notifications.slice(0, 20).map((n) => (
          <DropdownItem
            key={n.id}
            className={n.isRead ? "" : "bg-primary-50 dark:bg-primary-700/20"}
            onSelect={() => {
              if (!n.isRead) markRead.mutate(n.id);
              const link = notificationLink(n);
              if (link) navigate(link);
            }}
          >
            <div className="flex-1">
              <p className="text-sm text-foreground">{notificationText(n)}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
            </div>
          </DropdownItem>
        ))}
      </div>
    </DropdownMenu>
  );
}
