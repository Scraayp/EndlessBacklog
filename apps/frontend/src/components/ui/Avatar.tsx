import * as RadixAvatar from "@radix-ui/react-avatar";
import { clsx } from "clsx";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

const sizeClasses = { sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-10 text-sm" };

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <RadixAvatar.Root
      className={clsx(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-700",
        "dark:bg-primary-700 dark:text-primary-50",
        sizeClasses[size],
        className,
      )}
      title={name}
    >
      {src && <RadixAvatar.Image src={src} alt={name} className="h-full w-full object-cover" />}
      <RadixAvatar.Fallback>{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

export function AvatarStack({ users, max = 4 }: { users: { id: string; displayName: string; avatarUrl?: string | null }[]; max?: number }) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((u) => (
        <Avatar key={u.id} name={u.displayName} src={u.avatarUrl} size="sm" className="ring-2 ring-background" />
      ))}
      {overflow > 0 && (
        <span className="flex size-6 items-center justify-center rounded-full bg-surface-hover text-[10px] font-semibold text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </div>
  );
}
