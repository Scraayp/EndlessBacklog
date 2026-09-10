import { clsx } from "clsx";

/**
 * EndlessBacklog "Overflow" mark — a card list running off the bottom edge.
 * Pure SVG, currentColor-free (brand green is intrinsic); scales with `size`.
 * Use LogoMark alone in tight chrome, Logo for anything with room for the name.
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const small = size <= 32;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="EndlessBacklog"
      className={className}
    >
      <defs>
        <clipPath id="eb-logo-clip">
          <rect width="100" height="100" rx="26" />
        </clipPath>
      </defs>
      <rect width="100" height="100" rx="26" className="fill-primary-500" />
      <g clipPath="url(#eb-logo-clip)" fill="#fff">
        {small ? (
          <>
            <rect x="20" y="30" width="60" height="16" rx="8" />
            <rect x="20" y="58" width="42" height="16" rx="8" />
            <rect x="20" y="86" width="52" height="16" rx="8" fillOpacity="0.55" />
          </>
        ) : (
          <>
            <rect x="20" y="22" width="60" height="13" rx="6.5" />
            <rect x="20" y="44" width="44.4" height="13" rx="6.5" />
            <rect x="20" y="66" width="54" height="13" rx="6.5" fillOpacity="0.72" />
            <rect x="20" y="88" width="36" height="13" rx="6.5" fillOpacity="0.42" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark. `stacked` centers it for auth screens. */
export function Logo({
  size = 28,
  stacked = false,
  descriptor = false,
  className,
}: {
  size?: number;
  stacked?: boolean;
  descriptor?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "flex select-none",
        stacked ? "flex-col items-center gap-2" : "items-center gap-1.5",
        className,
      )}
    >
      <LogoMark size={size} />
      <span className="flex flex-col items-center">
        <span
          className="font-semibold tracking-tight text-foreground"
          style={{ fontSize: Math.round(size * 0.55) }}
        >
          EndlessBacklog
        </span>
        {descriptor && (
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            self-hosted boards
          </span>
        )}
      </span>
    </span>
  );
}
