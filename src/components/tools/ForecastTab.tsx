import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResultRow, ResultStat } from "./Stat";
import { forecastCashFlow } from "@/lib/calc/forecast";
import { formatINR, formatINRShort, monthKey, todayISO } from "@/lib/finance/format";
import { categoryById } from "@/lib/finance/categories";
import { useBills, useTransactions } from "@/lib/finance/hooks";
import { axisTick } from "@/components/charts/money";
import { MoneyTooltip } from "@/components/charts/shared";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const toPaise = (rupees: number) => Math.round(rupees * 100);

export function ForecastTab() {
  const { data: transactions = [], isLoading: txnsLoading } = useTransactions();
  const { data: bills = [], isLoading: billsLoading } = useBills();
  const loading = txnsLoading || billsLoading;
  const reducedMotion = usePrefersReducedMotion();

  const forecast = useMemo(
    () => forecastCashFlow(transactions, bills, monthKey(todayISO())),
    [transactions, bills],
  );

  const chartData = useMemo(() => {
    const hist = forecast.history.slice(-3).map((h) => ({
      label: h.label,
      income: toPaise(h.income),
      expenses: toPaise(h.expenses),
      projected: false as boolean,
    }));
    const proj = forecast.projection.map((p) => ({
      label: `${p.label}*`,
      income: toPaise(p.income),
      expenses: toPaise(p.expenses),
      projected: true as boolean,
    }));
    return [...hist, ...proj];
  }, [forecast]);

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading cash-flow forecast">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (forecast.insufficientData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10">
            <TrendingUp className="size-7 text-primary" />
          </span>
          <p className="text-lg font-medium">Not enough history yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The forecast needs at least one month of income or expenses. Add transactions and this
            page will project your next 3 months automatically.
          </p>
          <Button asChild>
            <Link to="/expenses">Add your first transaction</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const projectedNet = forecast.projection.reduce((s, p) => s + p.net, 0);

  return (
    <div className="space-y-5">
      {forecast.historyMonths < 3 && (
        <Alert>
          <CalendarClock className="size-4" aria-hidden />
          <AlertTitle>Limited history</AlertTitle>
          <AlertDescription>
            Based on only {forecast.historyMonths} month
            {forecast.historyMonths === 1 ? "" : "s"} of data — projections will sharpen as you
            record more transactions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ResultStat
          label="Avg monthly income"
          value={formatINR(toPaise(forecast.avgMonthlyIncome))}
          accent="success"
          icon={<Wallet className="size-5" aria-hidden />}
        />
        <ResultStat
          label="Avg monthly expenses"
          value={formatINR(toPaise(forecast.avgMonthlyExpenses))}
          accent="danger"
          icon={<PiggyBank className="size-5" aria-hidden />}
        />
        <ResultStat
          label="Projected net · next 3 mo"
          value={`${projectedNet >= 0 ? "+" : "−"}${formatINR(toPaise(Math.abs(projectedNet)))}`}
          accent={projectedNet >= 0 ? "success" : "warning"}
          icon={<TrendingUp className="size-5" aria-hidden />}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Income vs expenses
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              last {Math.min(3, forecast.historyMonths)} mo actual + 3 mo projected (*)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64" role="img" aria-label="Cash-flow history and forecast chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                barGap={3}
                margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
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
                  isAnimationActive={!reducedMotion}
                />
                <Bar
                  name="Expenses"
                  dataKey="expenses"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive={!reducedMotion}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Next 3 months</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecast.projection.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-medium">{p.label}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatINRShort(toPaise(p.income))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-red-600 dark:text-red-400">
                    {formatINRShort(toPaise(p.expenses))}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      p.net >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {p.net >= 0 ? "+" : "−"}
                    {formatINRShort(toPaise(Math.abs(p.net)))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-2 pt-3">
            <ResultRow
              label="Committed monthly bills"
              value={formatINR(toPaise(forecast.monthlyBillOutflow))}
            />
            <ResultRow
              label="Avg monthly net"
              value={`${forecast.avgMonthlyIncome - forecast.avgMonthlyExpenses >= 0 ? "+" : "−"}${formatINR(toPaise(Math.abs(forecast.avgMonthlyIncome - forecast.avgMonthlyExpenses)))}`}
              strong
            />
          </div>
        </CardContent>
      </Card>

      {forecast.categories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where the money goes (monthly avg)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {forecast.categories.slice(0, 6).map((c) => {
              const cat = categoryById(c.category);
              const Icon = cat?.icon;
              const max = forecast.categories[0]?.avgMonthly || 1;
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-lg"
                    style={{
                      backgroundColor: `${cat?.color ?? "#64748B"}1A`,
                      color: cat?.color ?? "#64748B",
                    }}
                    aria-hidden
                  >
                    {Icon && <Icon className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium">{cat?.label ?? c.category}</p>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatINR(toPaise(c.avgMonthly))}
                      </p>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (c.avgMonthly / max) * 100)}%`,
                          backgroundColor: cat?.color ?? "#64748B",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Projected from your per-category monthly averages over {forecast.historyMonths} month
        {forecast.historyMonths === 1 ? "" : "s"} of history, excluding transfers. One-off spikes
        are smoothed into the averages — treat this as a planning guide, not a promise.
      </p>
    </div>
  );
}
