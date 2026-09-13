import { getLabelColor } from "@endlessbacklog/shared";
import { clsx } from "clsx";

interface LabelChipProps {
  color: string;
  name?: string | null;
  size?: "sm" | "md";
  className?: string;
}

/** A single Trello-style label chip. Uses the light/dark hex pair from the
 *  shared label palette directly (inline style) rather than a Tailwind
 *  class, since the palette is data-driven and can't be a static utility. */
export function LabelChip({ color, name, size = "md", className }: LabelChipProps) {
  const def = getLabelColor(color);
  return (
    <span
      className={clsx(
        "inline-flex items-center overflow-hidden rounded-full font-medium text-white",
        size === "sm" ? "h-2 min-w-8" : "h-5 min-w-10 px-2 text-xs",
        className,
      )}
      style={{ backgroundColor: `var(--label-${color}, ${def.light})` }}
      title={name ?? def.name}
    >
      {size === "md" && (name || def.name)}
    </span>
  );
}
