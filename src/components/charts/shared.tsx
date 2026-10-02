import { formatINRShort } from "@/lib/finance/format";

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: { color?: string };
}

interface MoneyTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  title?: string;
}

/**
 * Shared dark-friendly tooltip for the dashboard charts. Values are always
 * rendered in short INR form (₹8.4L) since the raw data is integer paise.
 */
export function MoneyTooltip({ active, payload, label, title }: MoneyTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const heading = title ?? label;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-modal">
      {heading ? <p className="mb-1.5 text-xs font-bold text-foreground">{heading}</p> : null}
      <div className="grid gap-1">
        {payload.map((entry, i) => {
          const color = entry.color ?? entry.payload?.color ?? "#8884d8";
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="ml-auto pl-3 font-bold text-foreground">
                {formatINRShort(Number(entry.value ?? 0))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Skeleton placeholder used while queries or the client mount resolve. */
export function ChartSkeleton({ className = "h-56" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading chart"
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
    />
  );
}
