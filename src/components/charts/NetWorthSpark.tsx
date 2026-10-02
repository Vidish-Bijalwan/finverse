import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton, MoneyTooltip } from "./shared";
import { axisTick } from "./money";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface NetWorthPoint {
  /** e.g. "2026-10". */
  key: string;
  /** Short label, e.g. "Oct". */
  label: string;
  /** Cumulative (income − expenses) in paise up to and including this month. */
  net: number;
}

interface NetWorthSparkProps {
  data: NetWorthPoint[];
  ready: boolean;
  loading: boolean;
}

/** Cumulative net-worth sparkline (area) for the last six months. */
export function NetWorthSpark({ data, ready, loading }: NetWorthSparkProps) {
  const reducedMotion = usePrefersReducedMotion();
  if (loading || !ready) return <ChartSkeleton className="h-48" />;
  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center">
        <p className="text-sm font-bold text-foreground">No history to chart yet</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Your cumulative balance over time will appear here once you add transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={axisTick}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            width={56}
          />
          <Tooltip content={<MoneyTooltip />} cursor={{ stroke: "var(--color-border)" }} />
          <Area
            name="Net worth"
            type="monotone"
            dataKey="net"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fill="url(#netWorthFill)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-primary)" }}
            isAnimationActive={!reducedMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
