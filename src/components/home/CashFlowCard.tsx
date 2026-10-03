import { lazy, Suspense, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatINR, monthLabel } from "@/lib/finance/format";
import { monthlyCashFlowPaise } from "@/lib/finance/money-math";
import type { Transaction } from "@/lib/finance/types";
import { buildMonthFlows, buildWeekFlows, shiftMonthKey, topSpendingCategories } from "./home-data";
import { ChartSkeleton } from "@/components/charts/shared";
import { EmptyState, NumberDisplay } from "@/components/fv";

const CashFlowChart = lazy(() =>
  import("@/components/charts/CashFlowChart").then((m) => ({ default: m.CashFlowChart })),
);

type CashFlowPeriod = "1M" | "3M" | "6M" | "1Y";
const PERIODS: CashFlowPeriod[] = ["1M", "3M", "6M", "1Y"];
const PERIOD_MONTHS: Record<CashFlowPeriod, number> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };

function periodLabel(period: CashFlowPeriod, anchorMonth: string): string {
  return period === "1M" ? monthLabel(anchorMonth) : `Last ${PERIOD_MONTHS[period]} months`;
}

/**
 * Cash flow card (§13): header with period pills, an Income / Spent / Net
 * summary row, a compact income-vs-expenses chart, and the top spending
 * categories for the selected period. Everything derives from the ledger —
 * nothing is synthesized.
 */
export function CashFlowCard({
  txns,
  loading,
  anchorMonth,
  ready,
  hideAmounts = false,
  onAddExpense,
}: {
  txns: Transaction[];
  loading: boolean;
  /** Selected month ("YYYY-MM") from the dashboard's month switcher. */
  anchorMonth: string;
  /** Client-side mount gate for recharts layout (SSR-safe). */
  ready: boolean;
  /** Privacy mode: mask every amount. */
  hideAmounts?: boolean;
  onAddExpense: () => void;
}) {
  const [period, setPeriod] = useState<CashFlowPeriod>("6M");

  const { flows, fromKey, toKey } = useMemo(() => {
    if (period === "1M") {
      return { flows: buildWeekFlows(txns, anchorMonth), fromKey: anchorMonth, toKey: anchorMonth };
    }
    const n = PERIOD_MONTHS[period];
    const from = shiftMonthKey(anchorMonth, -(n - 1));
    return { flows: buildMonthFlows(txns, anchorMonth, n), fromKey: from, toKey: anchorMonth };
  }, [txns, anchorMonth, period]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const f of flows) {
      income += f.income;
      expense += f.expense;
    }
    return { income, expense, net: monthlyCashFlowPaise(income, expense) };
  }, [flows]);

  const topCategories = useMemo(
    () => topSpendingCategories(txns, fromKey, toKey, 4),
    [txns, fromKey, toKey],
  );

  const netUp = summary.net >= 0;
  const hasActivity = txns.length > 0;

  return (
    <section
      aria-label="Cash flow"
      className="min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-foreground">Cash flow</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{periodLabel(period, anchorMonth)}</p>
        </div>
        <div
          role="group"
          aria-label="Cash flow period"
          className="flex rounded-full bg-muted p-0.5"
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                period === p
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" aria-label="Loading cash flow">
          <div className="grid grid-cols-3 gap-2">
            {["Income", "Spent", "Net"].map((l) => (
              <div key={l} className="rounded-xl bg-muted/40 p-2.5">
                <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                <div className="mt-1.5 h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <ChartSkeleton className="h-44" />
        </div>
      ) : !hasActivity ? (
        <EmptyState
          title="No transactions yet"
          body="Add income or expenses and your cash flow will show up here."
          actionLabel="Add expense"
          onAction={onAddExpense}
        />
      ) : (
        <>
          {/* Summary row */}
          <dl className="mt-3 grid grid-cols-3 gap-2">
            <CashFlowStat
              label="Income"
              paise={summary.income}
              hideAmounts={hideAmounts}
              tone="text-gain"
            />
            <CashFlowStat
              label="Spent"
              paise={summary.expense}
              hideAmounts={hideAmounts}
              tone="text-loss"
            />
            <CashFlowStat
              label="Net"
              paise={summary.net}
              signed
              hideAmounts={hideAmounts}
              tone={netUp ? "text-gain" : "text-loss"}
            />
          </dl>

          {/* Chart + legend */}
          <div className="mt-3">
            <div className="mb-1.5 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: "var(--gain)" }}
                  aria-hidden
                />
                Income
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: "var(--loss)" }}
                  aria-hidden
                />
                Spent
              </span>
            </div>
            <Suspense fallback={<ChartSkeleton className="h-44" />}>
              <CashFlowChart data={flows} ready={ready} loading={false} />
            </Suspense>
          </div>

          {/* Top spending categories */}
          {topCategories.length > 0 && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Top spending
              </h3>
              <ul className="mt-2 space-y-2.5">
                {topCategories.map((c) => {
                  const pct = summary.expense > 0 ? (c.value / summary.expense) * 100 : 0;
                  return (
                    <li key={c.id} className="min-w-0">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ background: c.color }}
                            aria-hidden
                          />
                          <span className="truncate font-semibold text-foreground">{c.label}</span>
                        </span>
                        <span className="shrink-0 font-bold tabular-nums text-foreground">
                          {hideAmounts ? "₹ ••••••" : formatINR(c.value)}
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`${c.label}: ${Math.round(pct)}% of spending`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, pct))}%`,
                            background: c.color,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function CashFlowStat({
  label,
  paise,
  signed = false,
  hideAmounts,
  tone,
}: {
  label: string;
  paise: number;
  signed?: boolean;
  hideAmounts: boolean;
  tone: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-base font-bold tabular-nums", tone)}>
        {hideAmounts ? (
          <span aria-label={`${label} hidden`}>₹ ••••••</span>
        ) : (
          <NumberDisplay paise={paise} signed={signed} />
        )}
      </dd>
    </div>
  );
}
