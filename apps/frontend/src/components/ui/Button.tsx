import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-[0_6px_18px_var(--accent-soft)] hover:bg-[var(--accent-press)] disabled:opacity-50 disabled:shadow-none",
  secondary:
    "bg-[var(--surface)] text-foreground border border-[var(--rule)] backdrop-blur-xl hover:bg-[var(--sunken)] disabled:opacity-50",
  ghost: "text-foreground hover:bg-[var(--sunken)] disabled:opacity-50",
  danger: "bg-danger text-white shadow-[0_6px_18px_rgba(220,38,38,0.25)] hover:opacity-90 disabled:opacity-50 disabled:shadow-none",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-5 py-2.5 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-medium transition-[transform,box-shadow,border-color,background-color] duration-150",
        "active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
