import { cn } from "@/lib/utils";

/**
 * Quiet disclosure pill for simulated-money surfaces (test-mode payments,
 * simulated market data). Muted and inline — it sits in the relevant section
 * header rather than shouting as a full-width banner. The disclosure stays
 * truthful ("Simulated"); it is only visually quieter. role="status" so it
 * is announced.
 */
export function TestModeBanner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/60" aria-hidden />
      Simulated
    </span>
  );
}
