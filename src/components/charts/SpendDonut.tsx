import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { ChartSkeleton, MoneyTooltip } from "./shared";

export interface DonutSlice {
  id: string;
  label: string;
  /** Integer paise. */
  value: number;
  color: string;
}

interface SpendDonutProps {
  data: DonutSlice[];
  totalPaise: number;
  /** True once the client has mounted (charts are client-only). */
  ready: boolean;
  loading: boolean;
}

/**
 * Spend-by-category donut for the selected month. Colors come from
 * categories.ts; the center label shows total spend; a legend below lists
 * every category with its amount. Renders an empty state when there is no
 * spend for the month.
 */
export function SpendDonut({ data, totalPaise, ready, loading }: SpendDonutProps) {
  if (loading || !ready) return <ChartSkeleton className="h-64" />;

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center">
        <p className="text-sm font-bold text-foreground">No spending this month</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Add your first expense and this donut will break it down by category.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<MoneyTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={2}
              stroke="var(--color-card)"
            >
              {data.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total spent
          </span>
          <span className="mt-1 text-2xl font-black text-primary-dark">
            {formatINRShort(totalPaise)}
          </span>
        </div>
      </div>
      <ul className="mt-2 grid max-h-44 gap-1 overflow-y-auto pr-1">
        {data.map((slice) => (
          <li
            key={slice.id}
            className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/50"
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: slice.color }} />
            <span className="min-w-0 flex-1 truncate text-foreground">{slice.label}</span>
            <span className="font-bold text-primary-dark">{formatINR(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
