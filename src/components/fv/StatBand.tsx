import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatBandStat {
  label: string;
  /** Rendered value — usually a NumberDisplay with signed/colored P&L. */
  value: ReactNode;
  sub?: ReactNode;
  tone?: "gain" | "loss" | "neutral";
}

const toneClass: Record<NonNullable<StatBandStat["tone"]>, string> = {
  gain: "text-gain",
  loss: "text-loss",
  neutral: "text-foreground",
};

/**
 * 3-stat summary band (Current value | Invested | P&L). Values are rendered
 * with tabular numerals and tone coloring.
 */
export function StatBand({ stats, className }: { stats: StatBandStat[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-card",
        className,
      )}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-1 px-4 py-4">
          <span className="truncate text-xs font-medium text-muted-foreground">{s.label}</span>
          <span
            className={cn(
              "truncate text-lg font-bold tabular-nums",
              toneClass[s.tone ?? "neutral"],
            )}
          >
            {s.value}
          </span>
          {s.sub != null && (
            <span className="truncate text-xs text-muted-foreground tabular-nums">{s.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}
