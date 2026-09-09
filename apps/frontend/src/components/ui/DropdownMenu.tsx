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
          className="z-50 min-w-48 rounded-lg border border-border bg-background p-1 shadow-lg focus:outline-none"
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
        "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground outline-none",
        "data-[highlighted]:bg-surface-hover",
        className,
      )}
      {...props}
    />
  );
}

export const DropdownSeparator = () => <RadixDropdown.Separator className="my-1 h-px bg-border" />;
