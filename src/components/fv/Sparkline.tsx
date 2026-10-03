import { useId } from "react";
import { cn } from "@/lib/utils";
import { directionForChangePct, sparklinePath, type SparklineDirection } from "@/lib/market/movers";

const STROKE_FOR_DIRECTION: Record<SparklineDirection, string> = {
  up: "var(--gain)",
  down: "var(--loss)",
  flat: "var(--muted-foreground)",
};

/**
 * Tiny SVG sparkline for price series (watchlist rows, market snapshot).
 * The stroke reflects the DAY's direction: pass `direction` derived from the
 * day's changePct (vs previous close) via `directionForChangePct` — an
 * intraday series can end above its start on a down day, which must still
 * paint down-colored.
 */
export function Sparkline({
  values,
  width = 72,
  height = 28,
  direction,
  strokeWidth = 1.5,
  ariaLabel,
  className,
}: {
  /** Price series in paise (already downsampled via sparklineValues). */
  values: number[];
  width?: number;
  height?: number;
  /** Day direction (vs previous close); see directionForChangePct. */
  direction: SparklineDirection;
  strokeWidth?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const id = useId();
  const d = sparklinePath(values, width, height);
  const stroke = STROKE_FOR_DIRECTION[direction];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {d ? (
        <>
          <path
            d={`${d} L${width - 2},${height - 2} L2,${height - 2} Z`}
            fill={`url(#spark-${id})`}
          />
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}
    </svg>
  );
}
