import * as RadixPopover from "@radix-ui/react-popover";
import { clsx } from "clsx";
import type { ReactNode } from "react";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  className?: string;
}

export function Popover({ trigger, children, open, onOpenChange, align = "start", className }: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          sideOffset={6}
          className={clsx(
            "glass z-50 w-72 rounded-[var(--r-xl)] p-3 shadow-[var(--shadow-lg)] focus:outline-none",
            className,
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
