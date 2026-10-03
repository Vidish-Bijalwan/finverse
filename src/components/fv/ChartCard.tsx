import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/finance/format";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { pressable } from "./press";

export type ChartRangeKey = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";

export const CHART_RANGES: ChartRangeKey[] = ["1D", "1W", "1M", "1Y"];

export interface ChartPoint {
  /** Axis label, e.g. "10:30" or "12 Jan". */
  time: string;
  /** Price in paise. */
  value: number;
}

export interface ChartRenderContext {
  points: ChartPoint[];
  range: ChartRangeKey;
  /** Previous close in paise — render as a dashed reference line when set. */
  prevClose?: number | undefined;
  reducedMotion: boolean;
  formatValue: (paise: number) => string;
}

/**
 * ChartCard: card wrapper with a 1D/1W/1M/1Y range selector and a render-prop
 * chart slot (chart-lib agnostic; recharts works). Provides tooltip helpers:
 * format a point's time + price + change vs the previous point.
 */
export function ChartCard({
  title,
  action,
  ranges = CHART_RANGES,
  defaultRange = "1M",
  seriesForRange,
  prevClose,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  ranges?: ChartRangeKey[];
  defaultRange?: ChartRangeKey;
  seriesForRange: (range: ChartRangeKey) => ChartPoint[];
  prevClose?: number;
  children: (ctx: ChartRenderContext) => React.ReactNode;
  className?: string;
}) {
  const [range, setRange] = useState<ChartRangeKey>(defaultRange);
  const points = seriesForRange(range);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      className={cn(
        "rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        {title && <h2 className="text-base font-bold text-primary-dark">{title}</h2>}
        {action}
        <div role="group" aria-label="Chart range" className="flex rounded-full bg-muted p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn(
                pressable,
                "min-h-[44px] rounded-full px-3 text-xs font-bold transition-colors",
                range === r
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {children({
        points,
        range,
        prevClose,
        reducedMotion,
        formatValue: formatINR,
      })}
    </section>
  );
}

/** Tooltip line: time + price + change vs previous point. */
export function chartTooltipLines(
  points: ChartPoint[],
  index: number,
): { time: string; price: string; change?: string | undefined } {
  const p = points[index];
  if (!p) return { time: "", price: "" };
  const prev = points[index - 1];
  const change =
    prev && prev.value !== 0
      ? `${p.value >= prev.value ? "+" : "−"}${Math.abs(((p.value - prev.value) / prev.value) * 100).toFixed(2)}%`
      : undefined;
  return { time: p.time, price: formatINR(p.value), change };
}

/**
 * recharts Tooltip `formatter` showing price + change vs the previous point.
 * Usage: <Tooltip formatter={(value, _name, item) => tooltipFormatter(points, item?.payload)} />
 */
export function chartTooltipFormatter(
  points: ChartPoint[],
  payload?: { time?: string } & Record<string, unknown>,
): [string, string] {
  const index = points.findIndex((p) => payload && p.time === payload.time);
  const { price, change } = chartTooltipLines(points, index < 0 ? 0 : index);
  return [change ? `${price} (${change})` : price, "Price"];
}
