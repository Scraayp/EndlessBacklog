import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import type { ReactNode, ComponentPropsWithoutRef } from "react";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
}

export function DropdownMenu({ trigger, children, align = "end" }: DropdownMenuProps) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align={align}
          sideOffset={6}
          className="glass z-50 min-w-48 rounded-[var(--r-xl)] p-1.5 shadow-[var(--shadow-lg)] focus:outline-none"
        >
          {children}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}

export function DropdownItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdown.Item>) {
  return (
    <RadixDropdown.Item
      className={clsx(
        "flex cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors",
        "data-[highlighted]:bg-[var(--accent-soft)]",
        className,
      )}
      {...props}
    />
  );
}

export const DropdownSeparator = () => <RadixDropdown.Separator className="my-1 h-px bg-[var(--rule)]" />;
