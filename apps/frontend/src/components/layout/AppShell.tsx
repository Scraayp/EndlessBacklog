import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav.js";
import { useNotificationSocket } from "../../features/notifications/hooks.js";

export function AppShell() {
  useNotificationSocket();

  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <main className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
