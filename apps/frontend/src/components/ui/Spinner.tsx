import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function Spinner({ className, size = 18 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={clsx("animate-spin text-muted-foreground", className)} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Spinner size={28} />
    </div>
  );
}
