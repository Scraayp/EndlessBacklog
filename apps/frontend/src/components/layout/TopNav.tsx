import { Link, useNavigate } from "react-router-dom";
import { KanbanSquare, ChevronDown, LogOut, UserCog, Sun, Moon, Laptop } from "lucide-react";
import { useAuthStore } from "../../stores/authStore.js";
import { useThemeStore } from "../../stores/themeStore.js";
import { useAuth } from "../../features/auth/useAuth.js";
import { useWorkspaces } from "../../features/workspaces/hooks.js";
import { NotificationDropdown } from "../../features/notifications/NotificationDropdown.js";
import { Avatar } from "../ui/Avatar.js";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "../ui/DropdownMenu.js";

const THEME_ICONS = { light: Sun, dark: Moon, system: Laptop };

function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const order = ["light", "dark", "system"] as const;
  const Icon = THEME_ICONS[preference];

  return (
    <button
      title={`Theme: ${preference}`}
      onClick={() => setPreference(order[(order.indexOf(preference) + 1) % order.length]!)}
      className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
    >
      <Icon size={18} />
    </button>
  );
}

function WorkspaceSwitcher() {
  const { data: workspaces } = useWorkspaces();
  const navigate = useNavigate();

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover">
          Workspaces <ChevronDown size={14} />
        </button>
      }
    >
      {(workspaces ?? []).map((ws) => (
        <DropdownItem key={ws.id} onSelect={() => navigate(`/workspaces/${ws.id}`)}>
          {ws.name}
        </DropdownItem>
      ))}
      <DropdownSeparator />
      <DropdownItem onSelect={() => navigate("/workspaces")}>All workspaces</DropdownItem>
    </DropdownMenu>
  );
}

export function TopNav() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-13 shrink-0 items-center gap-2 border-b border-border bg-background px-3 py-2">
      <Link to="/workspaces" className="flex items-center gap-1.5 pr-2 font-semibold text-foreground">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary-500 text-white">
          <KanbanSquare size={16} />
        </span>
        EndlessBacklog
      </Link>
      <WorkspaceSwitcher />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationDropdown />
        {user && (
          <DropdownMenu
            trigger={
              <button className="ml-1 rounded-full">
                <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />
              </button>
            }
          >
            <div className="px-2.5 py-1.5">
              <p className="text-sm font-medium text-foreground">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownSeparator />
            <DropdownItem onSelect={() => navigate("/settings/profile")}>
              <UserCog size={14} /> Profile settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onSelect={() => void logout()}>
              <LogOut size={14} /> Log out
            </DropdownItem>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
