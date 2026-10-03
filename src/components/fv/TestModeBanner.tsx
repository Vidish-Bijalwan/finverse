import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Amber banner shown on every simulated-money surface (test-mode payments,
 * simulated market data). role="status" so it is announced.
 */
export function TestModeBanner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-center",
        className,
      )}
    >
      <FlaskConical className="size-4 shrink-0 text-warning" aria-hidden />
      <p className="text-xs font-bold tracking-wide text-warning uppercase">
        Test mode — simulated, no real money
      </p>
    </div>
  );
}
