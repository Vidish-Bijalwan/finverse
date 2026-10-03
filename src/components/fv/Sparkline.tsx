import { useId } from "react";
import { cn } from "@/lib/utils";
import { sparklinePath } from "@/lib/market/movers";

/**
 * Tiny SVG sparkline for price series (watchlist rows, market snapshot).
 * Direction color comes from the first→last value (gain/loss tokens) unless
 * `up` is given explicitly. SSR-safe: the path is pure math on the values.
 */
export function Sparkline({
  values,
  width = 72,
  height = 28,
  up,
  strokeWidth = 1.5,
  ariaLabel,
  className,
}: {
  /** Price series in paise (already downsampled via sparklineValues). */
  values: number[];
  width?: number;
  height?: number;
  /** Force direction color; defaults to last >= first. */
  up?: boolean;
  strokeWidth?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const id = useId();
  const d = sparklinePath(values, width, height);
  const direction = up ?? (values.length < 2 || values[values.length - 1]! >= values[0]!);
  const stroke = direction ? "var(--gain)" : "var(--loss)";

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
