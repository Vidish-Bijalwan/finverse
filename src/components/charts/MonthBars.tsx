import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartSkeleton, MoneyTooltip } from "./shared";
import { axisTick } from "./money";

export interface MonthFlow {
  /** e.g. "2026-10". */
  key: string;
  /** Short label, e.g. "Oct". */
  label: string;
  /** Integer paise. */
  income: number;
  /** Integer paise. */
  expense: number;
}

interface MonthBarsProps {
  data: MonthFlow[];
  ready: boolean;
  loading: boolean;
}

/** Grouped income-vs-expense bars for the six months ending at the selected month. */
export function MonthBars({ data, ready, loading }: MonthBarsProps) {
  if (loading || !ready) return <ChartSkeleton className="h-64" />;
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center">
        <p className="text-sm font-bold text-foreground">No income or expenses yet</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Record transactions and this chart will compare your cash flow month by month.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={3} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
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
          <Tooltip
            content={<MoneyTooltip />}
            cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#16A34A"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            name="Expense"
            dataKey="expense"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
