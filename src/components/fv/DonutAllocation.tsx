import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";
import { formatINR } from "@/lib/finance/format";

export interface AllocationSlice {
  label: string;
  /** Value in paise. */
  paise: number;
  color?: string;
}

const FALLBACK_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

/**
 * Allocation donut (recharts Pie) with a legend list (label, %, value).
 * Donut hole shows the total.
 */
export function DonutAllocation({
  items,
  className,
}: {
  items: AllocationSlice[];
  className?: string;
}) {
  const total = items.reduce((s, i) => s + i.paise, 0);
  const data = items.map((i, idx) => ({
    ...i,
    color: i.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
  }));

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>
      <div
        className="relative mx-auto h-52 w-52"
        role="img"
        aria-label={`Allocation: ${items.map((i) => `${i.label} ${total > 0 ? Math.round((i.paise / total) * 100) : 0} percent`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="paise"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((d, idx) => (
                <Cell key={idx} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [formatINR(Number(value) || 0), "Value"]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total</div>
            <NumberDisplay paise={total} short className="text-lg font-bold text-foreground" />
          </div>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {data.map((d) => {
          const pct = total > 0 ? (d.paise / total) * 100 : 0;
          return (
            <li key={d.label} className="flex items-center gap-3">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{d.label}</span>
              <span className="text-sm font-bold text-muted-foreground tabular-nums">
                {pct.toFixed(1)}%
              </span>
              <NumberDisplay
                paise={d.paise}
                className="w-24 shrink-0 text-right text-sm font-bold text-foreground"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
