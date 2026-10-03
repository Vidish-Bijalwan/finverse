import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartSkeleton, MoneyTooltip } from "./shared";
import { axisTick } from "./money";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { FlowBar } from "@/components/home/home-data";

/**
 * Compact income-vs-expenses bar chart for the cash-flow card.
 * Deliberately small (h-44) with a tight axis: no giant bars on empty
 * backgrounds. Income renders in the gain token, expenses in the loss
 * token; the shared MoneyTooltip makes values readable on hover/focus.
 */
function CashFlowChartInner({
  data,
  ready,
  loading,
}: {
  data: FlowBar[];
  ready: boolean;
  loading: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  if (loading || !ready) return <ChartSkeleton className="h-44" />;
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex h-44 flex-col items-center justify-center gap-1 rounded-md bg-muted/40 px-6 text-center">
        <p className="text-sm font-bold text-foreground">No cash flow in this period</p>
        <p className="text-xs text-muted-foreground">Add transactions to see income vs expenses.</p>
      </div>
    );
  }

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={axisTick}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            width={52}
            tickCount={4}
          />
          <Tooltip
            content={<MoneyTooltip />}
            cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="var(--gain)"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
            isAnimationActive={!reducedMotion}
          />
          <Bar
            name="Spent"
            dataKey="expense"
            fill="var(--loss)"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
            isAnimationActive={!reducedMotion}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Memoized: parents re-render on unrelated state with stable data refs. */
export const CashFlowChart = memo(CashFlowChartInner);
