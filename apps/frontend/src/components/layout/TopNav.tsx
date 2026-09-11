import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserCog, Sun, Moon, Laptop } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "../../stores/authStore.js";
import { useThemeStore } from "../../stores/themeStore.js";
import { useAuth } from "../../features/auth/useAuth.js";
import { useWorkspaces } from "../../features/workspaces/hooks.js";
import { NotificationDropdown } from "../../features/notifications/NotificationDropdown.js";
import { Avatar } from "../ui/Avatar.js";
import { LogoMark } from "../ui/Logo.js";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "../ui/DropdownMenu.js";

const THEME_OPTIONS = [
  { value: "light", icon: Sun },
  { value: "system", icon: Laptop },
  { value: "dark", icon: Moon },
] as const;

function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[var(--sunken)] p-0.5" role="group" aria-label="Theme">
      {THEME_OPTIONS.map(({ value, icon: Icon }) => (
        <button
          key={value}
          title={`Theme: ${value}`}
          aria-pressed={preference === value}
          onClick={() => setPreference(value)}
          className={clsx(
            "flex size-7 items-center justify-center rounded-full transition-colors",
            preference === value
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

function WorkspaceSwitcher() {
  const { data: workspaces } = useWorkspaces();
  const navigate = useNavigate();

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-foreground hover:bg-[var(--sunken)]">
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
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--rule-strong)] bg-[var(--surface)] px-3 py-2 backdrop-blur-xl">
      <Link to="/workspaces" className="flex items-center gap-1.5 pr-2 font-semibold text-foreground">
        <LogoMark size={26} className="rounded-[var(--r-sm)] shadow-[0_4px_14px_var(--accent-soft)]" />
        EndlessBacklog
      </Link>
      <WorkspaceSwitcher />

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationDropdown />
        {user && (
          <DropdownMenu
            trigger={
              <button className="ml-1 rounded-full transition-transform hover:scale-105">
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
