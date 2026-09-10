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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <LogoMark size={44} />
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
