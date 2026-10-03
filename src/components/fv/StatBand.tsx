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
 * with the display grotesque + tabular numerals and tone coloring; labels
 * use the eyebrow treatment. Static 1px border with a 3px signature-accent
 * top edge.
 */
export function StatBand({ stats, className }: { stats: StatBandStat[]; className?: string }) {
  return (
    <div
      className={cn(
        "fv-card-static fv-top-accent grid grid-cols-3 divide-x divide-border rounded-[14px] bg-card shadow-card",
        className,
      )}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-1 px-3 py-3 sm:px-4 sm:py-4">
          <span className="fv-eyebrow truncate">{s.label}</span>
          <span
            className={cn(
              "fv-money truncate text-base font-bold sm:text-lg",
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
