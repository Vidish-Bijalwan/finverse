import { TrendingDown, TrendingUp } from "lucide-react";
import { NumberDisplay } from "@/components/fv/NumberDisplay";
import { monthLabel } from "@/lib/finance/format";
import type { CategoryMover } from "@/components/home/home-data";

/**
 * Home insight (§25): renders ONLY when `mover` is derived from real
 * ledger data. When there is nothing to say, this renders null — insights
 * are never invented to fill the card.
 */
export function HomeInsight({
  mover,
  prevMonthKey,
}: {
  mover: CategoryMover | null;
  /** "YYYY-MM" of the comparison month, for honest labeling. */
  prevMonthKey: string;
}) {
  if (!mover) return null;

  const up = mover.direction === "up";
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint">
        {up ? (
          <TrendingUp className="size-4 text-loss" aria-hidden />
        ) : (
          <TrendingDown className="size-4 text-gain" aria-hidden />
        )}
      </span>
      <p className="text-sm leading-6 text-muted-foreground">
        <span className="font-bold text-foreground">{mover.label}</span> {up ? "rose" : "fell"}{" "}
        <NumberDisplay
          paise={Math.abs(mover.delta)}
          className={up ? "font-bold text-loss" : "font-bold text-gain"}
        />
        {mover.pct !== null ? <> ({`${Math.abs(mover.pct)}% ${up ? "more" : "less"}`})</> : ""} vs{" "}
        {monthLabel(prevMonthKey)}.
      </p>
    </div>
  );
}
