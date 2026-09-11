import type { ReactNode } from "react";
import { LogoMark } from "../../../components/ui/Logo.js";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <LogoMark size={44} className="rounded-[var(--r-md)] shadow-[0_8px_24px_var(--accent-soft)]" />
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="glass rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]">{children}</div>
      </div>
    </div>
  );
}
