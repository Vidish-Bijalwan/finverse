import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import type { MonthFlow } from "@/components/charts/MonthBars";
import type { NetWorthPoint } from "@/components/charts/NetWorthSpark";
import type { DonutSlice } from "@/components/charts/SpendDonut";
import { ChartSkeleton } from "@/components/charts/shared";

// Recharts is heavy (~400KB): split it out of the dashboard route chunk and
// stream it in after mount. Charts already render client-side only
// (chartsReady gate below), so this is SSR-safe.
const MonthBars = lazy(() =>
  import("@/components/charts/MonthBars").then((m) => ({ default: m.MonthBars })),
);
const NetWorthSpark = lazy(() =>
  import("@/components/charts/NetWorthSpark").then((m) => ({ default: m.NetWorthSpark })),
);
const SpendDonut = lazy(() =>
  import("@/components/charts/SpendDonut").then((m) => ({ default: m.SpendDonut })),
);
import {
  CategorizeSheet,
  ChartCard,
  EmptyState,
  ErrorState,
  MarketRow,
  MarketStrip,
  NumberDisplay,
  PullToRefresh,
  TxnRow,
  pressable,
} from "@/components/fv";
import { QuickActions } from "@/components/home/QuickActions";
import { useWatchlist as useWatchlistUI } from "@/components/markets/useWatchlist";
import { categoryById } from "@/lib/finance/categories";
import { formatINR, formatINRShort, monthKey, monthLabel } from "@/lib/finance/format";
import {
  investmentReturnsPaise,
  monthlyCashFlowPaise,
  netWorthPaise,
  pctChange,
} from "@/lib/finance/money-math";
import {
  useAccountSummaries,
  useHoldings,
  useMonth,
  useTransactions,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/lib/finance/hooks";
import type { Transaction } from "@/lib/finance/types";
import { getStock, STOCKS } from "@/lib/market/data";
import { dayChange, genHistory, getLTP } from "@/lib/market/history";
import { fetchWatchlist, WATCHLIST_QUERY_KEY } from "@/lib/watchlist";
import { FINVERSE_QUERY_DEFAULTS } from "@/lib/query";
import { greetingFor, greetingName } from "@/lib/greeting";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinVerse AI — Dashboard" },
      {
        name: "description",
        content:
          "Your money in one clear view: net worth, monthly cash flow, investments, and recent activity.",
      },
      { property: "og:title", content: "FinVerse AI — Dashboard" },
      {
        property: "og:description",
        content: "Net worth, spending, investments, and AI insights in one clear view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinVerseDashboard,
});

/** "2026-10" shifted by delta months, e.g. shiftMonth("2026-10", -1) -> "2026-09". */
function shiftMonth(key: string, delta: number): string {
  const parts = key.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-10" -> "Oct" for compact chart axis labels. */
function shortMonthLabel(key: string): string {
  return monthLabel(key).split(" ")[0] ?? "";
}

/** "2026-10-03" -> "3 Oct 2026". */
function dateLabel(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Mover {
  label: string;
  delta: number;
  pct: number | null;
}

/** Money display that honors the persisted privacy preference. */
function PrivateMoney({
  paise,
  signed = false,
  short = false,
  className,
}: {
  paise: number;
  signed?: boolean;
  short?: boolean;
  className?: string;
}) {
  const [settings] = useSettings();
  if (settings.balancePrivate) {
    return (
      <span className={cn("fv-money tabular-nums", className)} aria-label="Hidden balance">
        ₹&nbsp;••••••
      </span>
    );
  }
  return (
    <NumberDisplay
      paise={paise}
      signed={signed}
      short={short}
      className={cn("tabular-nums", className)}
    />
  );
}

function FinVerseDashboard() {
  const [month, setMonth] = useMonth();
  const [chartsReady, setChartsReady] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [settings, updateSettings] = useSettings();
  const private_ = settings.balancePrivate ?? false;

  // Recharts needs layout measurements; mount charts client-side only (SSR-safe).
  useEffect(() => {
    setChartsReady(true);
  }, []);

  const {
    data: txns,
    isLoading: txnsLoading,
    isError: txnsError,
    refetch: refetchTxns,
  } = useTransactions();
  const {
    data: holdings,
    isLoading: holdingsLoading,
    isError: holdingsError,
    refetch: refetchHoldings,
  } = useHoldings();
  const {
    data: summaries,
    isLoading: accountsLoading,
    isError: accountsError,
    refetch: refetchAccounts,
  } = useAccountSummaries();

  // Watchlist preview shares the watchlist page's query cache (same key + options).
  const {
    data: watchEntries,
    isLoading: watchLoading,
    isError: watchError,
    refetch: refetchWatch,
  } = useQuery({
    queryKey: WATCHLIST_QUERY_KEY,
    queryFn: fetchWatchlist,
    ...FINVERSE_QUERY_DEFAULTS,
  });
  const { toggle: toggleWatch } = useWatchlistUI();

  const currentKey = monthKey(new Date());
  const prevKey = shiftMonth(month, -1);
  const canGoForward = month < currentKey;

  const greeting = greetingFor(new Date());
  const displayName = greetingName(profile?.full_name, user?.email);

  const stats = useMemo(() => {
    const all = txns ?? [];
    const byMonth = new Map<string, { income: number; expense: number }>();
    const monthCatSpend = new Map<string, number>();
    const prevCatSpend = new Map<string, number>();

    for (const t of all) {
      const key = t.dateISO.slice(0, 7);
      let entry = byMonth.get(key);
      if (!entry) {
        entry = { income: 0, expense: 0 };
        byMonth.set(key, entry);
      }
      if (t.type === "income") {
        entry.income += t.amountPaise;
      } else if (t.type === "expense") {
        entry.expense += t.amountPaise;
        if (key === month)
          monthCatSpend.set(t.category, (monthCatSpend.get(t.category) ?? 0) + t.amountPaise);
        else if (key === prevKey)
          prevCatSpend.set(t.category, (prevCatSpend.get(t.category) ?? 0) + t.amountPaise);
      }
    }

    const monthEntry = byMonth.get(month) ?? { income: 0, expense: 0 };
    const prevEntry = byMonth.get(prevKey) ?? { income: 0, expense: 0 };
    const monthIncome = monthEntry.income;
    const monthExpense = monthEntry.expense;
    const cashFlow = monthlyCashFlowPaise(monthIncome, monthExpense);
    const prevCashFlow = monthlyCashFlowPaise(prevEntry.income, prevEntry.expense);

    // Spend-by-category donut slices, largest first.
    const donut: DonutSlice[] = [...monthCatSpend.entries()]
      .map(([id, value]) => {
        const cat = categoryById(id);
        return {
          id,
          label: cat?.label ?? id,
          value,
          color: cat?.color ?? "#64748B",
        };
      })
      .sort((a, b) => b.value - a.value);

    // Six months ending at the selected month.
    const bars: MonthFlow[] = [];
    for (let i = 5; i >= 0; i--) {
      const key = shiftMonth(month, -i);
      const e = byMonth.get(key) ?? { income: 0, expense: 0 };
      bars.push({ key, label: shortMonthLabel(key), income: e.income, expense: e.expense });
    }

    // Cumulative (income − expenses) by month, up to the selection.
    const keys = [...byMonth.keys()].filter((k) => k <= month).sort();
    const spark: NetWorthPoint[] = [];
    let running = 0;
    for (const key of keys) {
      const e = byMonth.get(key);
      if (!e) continue;
      running += e.income - e.expense;
      spark.push({ key, label: shortMonthLabel(key), net: running });
    }

    // Biggest month-over-month category increase.
    let mover: Mover | null = null;
    for (const id of new Set([...monthCatSpend.keys(), ...prevCatSpend.keys()])) {
      const current = monthCatSpend.get(id) ?? 0;
      const previous = prevCatSpend.get(id) ?? 0;
      const delta = current - previous;
      if (delta > 0 && (!mover || delta > mover.delta)) {
        const cat = categoryById(id);
        mover = {
          label: cat?.label ?? id,
          delta,
          pct: previous > 0 ? Math.round((delta / previous) * 100) : null,
        };
      }
    }

    const topSlice = donut[0];

    return {
      monthIncome,
      monthExpense,
      cashFlow,
      prevCashFlow,
      cashFlowPct: pctChange(cashFlow, prevCashFlow),
      donut,
      bars,
      spark: spark.slice(-6),
      mover,
      topCategory: topSlice ? { label: topSlice.label, value: topSlice.value } : null,
    };
  }, [txns, month, prevKey]);

  // Honest financial math (see lib/finance/money-math.ts for the label contract):
  // net worth = cash + investments − liabilities; returns = value − cost.
  const cashPaise = useMemo(
    () => (summaries ?? []).reduce((sum, s) => sum + s.balancePaise, 0),
    [summaries],
  );
  const investmentsPaise = useMemo(
    () => (holdings ?? []).reduce((sum, h) => sum + h.qty * getLTP(h.symbol), 0),
    [holdings],
  );
  const investedCostPaise = useMemo(
    () => (holdings ?? []).reduce((sum, h) => sum + h.qty * h.avgPricePaise, 0),
    [holdings],
  );
  const investmentPnl = investmentReturnsPaise(investmentsPaise, investedCostPaise);
  const netWorth = netWorthPaise({ cashPaise, investmentsPaise });

  const recentTxns = useMemo(
    () =>
      [...(txns ?? [])]
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO) || b.id.localeCompare(a.id))
        .slice(0, 7),
    [txns],
  );

  const watchPreview = useMemo(
    () =>
      (watchEntries ?? []).slice(0, 4).map((e) => {
        const stock = getStock(e.symbol);
        return {
          symbol: e.symbol,
          name: stock?.name ?? e.symbol,
          pricePaise: getLTP(e.symbol),
          changePct: dayChange(genHistory(e.symbol, 2)).changePct,
          alerted: e.alerts.length > 0,
        };
      }),
    [watchEntries],
  );

  const watchSymbols = useMemo(() => (watchEntries ?? []).map((e) => e.symbol), [watchEntries]);

  // Market snapshot: biggest day-movers in the stock universe (simulated feed).
  const topMovers = useMemo(() => {
    const rows = STOCKS.map((s) => {
      const change = dayChange(genHistory(s.symbol, 2));
      return {
        symbol: s.symbol,
        name: s.name,
        pricePaise: getLTP(s.symbol),
        changePct: change.changePct,
      };
    }).sort((a, b) => b.changePct - a.changePct);
    return {
      gainers: rows.slice(0, 3),
      losers: rows.slice(-3).reverse(),
    };
  }, []);

  const hasTxns = (txns?.length ?? 0) > 0;
  const statsLoading = txnsLoading || accountsLoading || holdingsLoading;
  const lastSpark = stats.spark[stats.spark.length - 1];

  const deleteTxn = useDeleteTransaction();
  const updateTxn = useUpdateTransaction();
  const [categorizing, setCategorizing] = useState<Transaction | null>(null);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([refetchTxns(), refetchHoldings(), refetchAccounts(), refetchWatch()]);
  }, [refetchTxns, refetchHoldings, refetchAccounts, refetchWatch]);

  const handleDeleteTxn = (t: Transaction) => {
    deleteTxn.mutate(t.id, {
      onSuccess: () => toast.success("Transaction deleted"),
      onError: () => toast.error("Couldn't delete — try again."),
    });
  };

  const handleCategorize = (categoryId: string) => {
    const target = categorizing;
    setCategorizing(null);
    if (!target) return;
    updateTxn.mutate(
      { id: target.id, patch: { category: categoryId } },
      {
        onSuccess: () => toast.success("Transaction recategorized"),
        onError: () => toast.error("Couldn't update — try again."),
      },
    );
  };

  const togglePrivacy = () => updateSettings({ balancePrivate: !private_ });

  // A failed transactions query breaks the whole dashboard — full-page error.
  if (txnsError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-dashboard px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <ErrorState
            title="Couldn't load your dashboard"
            body="Your transactions failed to load. Check your connection and try again."
            onRetry={() => void refetchTxns()}
          />
        </main>
      </div>
    );
  }

  const cashFlowUp = stats.cashFlow >= 0;
  const pnlUp = investmentPnl >= 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PullToRefresh onRefresh={refreshAll} className="min-h-screen">
        <main className="mx-auto w-full max-w-dashboard px-4 pb-16 pt-5 sm:px-6 lg:px-8">
          {/* ── Compact greeting + month switcher ──────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {greeting}
              {displayName ? `, ${displayName}` : ""} · Here&apos;s your money at a glance.
            </p>
            <div
              className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-0.5 shadow-card"
              aria-label="Select month"
            >
              <button
                type="button"
                onClick={() => setMonth(shiftMonth(month, -1))}
                className={cn(
                  pressable,
                  "grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-24 px-1 text-center text-sm font-bold text-foreground">
                {monthLabel(month)}
              </span>
              <button
                type="button"
                onClick={() => setMonth(shiftMonth(month, 1))}
                disabled={!canGoForward}
                className={cn(
                  pressable,
                  "grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30",
                )}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Balance hero ───────────────────────────────────────── */}
          <section
            aria-label="Balance overview"
            className="mt-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Net worth
                  </h2>
                  <button
                    type="button"
                    onClick={togglePrivacy}
                    aria-pressed={private_}
                    aria-label={private_ ? "Show balances" : "Hide balances"}
                    className={cn(
                      pressable,
                      "grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {private_ ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
                {statsLoading ? (
                  <Skeleton className="mt-2 h-10 w-44 rounded-lg" aria-label="Loading net worth" />
                ) : accountsError || holdingsError ? (
                  <p className="mt-1 text-2xl font-bold text-muted-foreground">—</p>
                ) : (
                  <PrivateMoney
                    paise={netWorth}
                    className="mt-1 block text-[32px] font-bold leading-tight text-foreground sm:text-4xl"
                  />
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {statsLoading ? (
                    <Skeleton className="h-4 w-56 rounded" />
                  ) : (
                    <>
                      Cash{" "}
                      {private_ ? (
                        "••••••"
                      ) : (
                        <NumberDisplay
                          paise={cashPaise}
                          className="font-semibold text-foreground"
                        />
                      )}{" "}
                      + investments{" "}
                      {private_ ? (
                        "••••••"
                      ) : (
                        <NumberDisplay
                          paise={investmentsPaise}
                          className="font-semibold text-foreground"
                        />
                      )}{" "}
                      − liabilities ₹0
                    </>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {monthLabel(month)}
                </p>
                {txnsLoading ? (
                  <Skeleton className="ml-auto mt-2 h-6 w-24 rounded" />
                ) : (
                  <>
                    <p
                      className={cn(
                        "mt-1 text-lg font-bold tabular-nums",
                        cashFlowUp ? "text-gain" : "text-loss",
                      )}
                    >
                      {cashFlowUp ? "+" : "−"}
                      {private_ ? "••••••" : formatINR(Math.abs(stats.cashFlow))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      net cash flow
                      {stats.cashFlowPct !== null &&
                        ` · ${stats.cashFlowPct >= 0 ? "+" : "−"}${Math.abs(stats.cashFlowPct).toFixed(1)}% vs ${shortMonthLabel(prevKey)}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Compact secondary metrics row */}
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-4">
              <HeroMetric
                label="Investments"
                loading={holdingsLoading}
                error={holdingsError}
                onRetry={() => void refetchHoldings()}
              >
                <PrivateMoney paise={investmentsPaise} className="text-[15px] font-bold" />
              </HeroMetric>
              <HeroMetric
                label="Cash"
                loading={accountsLoading}
                error={accountsError}
                onRetry={() => void refetchAccounts()}
              >
                <PrivateMoney paise={cashPaise} className="text-[15px] font-bold" />
              </HeroMetric>
              <HeroMetric label="Monthly cash flow" loading={txnsLoading}>
                <span className={cn(cashFlowUp ? "text-gain" : "text-loss")}>
                  <PrivateMoney paise={stats.cashFlow} signed className="text-[15px] font-bold" />
                </span>
              </HeroMetric>
              <HeroMetric label="Investment P&L" loading={holdingsLoading}>
                <span className={cn(pnlUp ? "text-gain" : "text-loss")}>
                  <PrivateMoney paise={investmentPnl} signed className="text-[15px] font-bold" />
                </span>
                <span className="sr-only">current value minus invested cost</span>
              </HeroMetric>
            </dl>
          </section>

          {/* ── Quick actions ──────────────────────────────────────── */}
          <QuickActions className="mt-5" />

          {/* ── Market strip (simulated) ───────────────────────────── */}
          <MarketStrip symbols={watchSymbols} className="mt-5" />

          {/* ── Main grid: primary | secondary ─────────────────────── */}
          <div className="mt-6 grid gap-6 xl:grid-cols-12 xl:items-start">
            {/* PRIMARY: recent activity, cash flow, insights */}
            <div className="flex min-w-0 flex-col gap-6 xl:col-span-8">
              <SectionCard
                title="Recent activity"
                action={
                  <Link
                    to="/expenses"
                    search={{}}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    View all <ArrowRight className="size-4" aria-hidden />
                  </Link>
                }
              >
                {txnsLoading ? (
                  <ul className="space-y-1" aria-label="Loading transactions">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-3">
                        <Skeleton className="size-11 shrink-0 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-2/3 rounded-lg" />
                          <Skeleton className="h-3 w-1/3 rounded-lg" />
                        </div>
                        <Skeleton className="h-4 w-20 rounded-lg" />
                      </li>
                    ))}
                  </ul>
                ) : recentTxns.length === 0 ? (
                  <EmptyState
                    title="No transactions yet"
                    body="Your latest activity will show up here."
                    actionLabel="Add expense"
                    onAction={() => void navigate({ to: "/expenses", search: { add: "1" } })}
                  />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {recentTxns.map((t) => {
                      const cat = categoryById(t.category);
                      return (
                        <li key={t.id}>
                          <TxnRow
                            name={t.note || cat?.label || t.category}
                            secondary={`${dateLabel(t.dateISO)}${t.payMode ? ` · ${t.payMode}` : ""}`}
                            amountPaise={t.type === "income" ? t.amountPaise : -t.amountPaise}
                            onClick={() => void navigate({ to: "/expenses", search: {} })}
                            swipeActions={{
                              onCategorize: () => setCategorizing(t),
                              onDelete: () => handleDeleteTxn(t),
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>

              {!txnsLoading && stats.mover && (
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">
                    <span className="font-bold text-foreground">{stats.mover.label}</span> rose{" "}
                    <NumberDisplay
                      paise={stats.mover.delta}
                      signed
                      className="font-bold text-loss"
                    />
                    {stats.mover.pct !== null ? ` (${stats.mover.pct}% more)` : ""} vs{" "}
                    {monthLabel(prevKey)} — your biggest jump this month. That&apos;s the first
                    place to look if you want to save.
                  </p>
                </div>
              )}

              <section aria-label="Spending analytics">
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-lg font-bold text-foreground">Where your money went</h2>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {monthLabel(month)}
                  </span>
                </div>

                {txnsLoading ? (
                  <div className="grid gap-4">
                    <Skeleton className="h-72 rounded-2xl" />
                    <Skeleton className="h-72 rounded-2xl" />
                  </div>
                ) : !hasTxns ? (
                  <EmptyState
                    title="No transactions yet"
                    body="Add your first expense or income and this dashboard will come alive with your cash flow, spending breakdown, and net-worth trend."
                    actionLabel="Add your first expense"
                    onAction={() => void navigate({ to: "/expenses", search: { add: "1" } })}
                  />
                ) : (
                  <div className="grid gap-4">
                    <ChartCard
                      title="Cash flow"
                      ranges={["1M", "1Y"]}
                      defaultRange="1Y"
                      seriesForRange={() => []}
                    >
                      {({ range }) => (
                        <Suspense fallback={<ChartSkeleton className="h-64" />}>
                          <MonthBars
                            data={range === "1M" ? stats.bars.slice(-3) : stats.bars}
                            ready={chartsReady}
                            loading={false}
                          />
                        </Suspense>
                      )}
                    </ChartCard>

                    <SectionCard title="Spend by category" sub={monthLabel(month)}>
                      <Suspense fallback={<ChartSkeleton className="h-64" />}>
                        <SpendDonut
                          data={stats.donut}
                          totalPaise={stats.monthExpense}
                          ready={chartsReady}
                          loading={false}
                        />
                      </Suspense>
                    </SectionCard>

                    <SectionCard
                      title="Net worth trend"
                      sub="Cumulative income minus expenses"
                      action={
                        lastSpark && (
                          <NumberDisplay
                            paise={lastSpark.net}
                            className={cn(
                              "text-sm font-bold",
                              lastSpark.net >= 0 ? "text-gain" : "text-loss",
                            )}
                          />
                        )
                      }
                    >
                      <Suspense fallback={<ChartSkeleton className="h-48" />}>
                        <NetWorthSpark data={stats.spark} ready={chartsReady} loading={false} />
                      </Suspense>
                    </SectionCard>
                  </div>
                )}
              </section>
            </div>

            {/* SECONDARY: portfolio snapshot, watchlist, market snapshot */}
            <div className="flex min-w-0 flex-col gap-6 xl:col-span-4">
              <SectionCard
                title="Portfolio snapshot"
                action={
                  <Link
                    to="/portfolio"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    Open <ArrowRight className="size-4" aria-hidden />
                  </Link>
                }
              >
                {holdingsLoading ? (
                  <div className="space-y-2.5" aria-label="Loading portfolio">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-5 w-2/3 rounded" />
                    <Skeleton className="h-5 w-1/2 rounded" />
                  </div>
                ) : holdingsError ? (
                  <ErrorState
                    title="Couldn't load your portfolio"
                    body="Check your connection and try again."
                    onRetry={() => void refetchHoldings()}
                  />
                ) : (
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Current value</dt>
                      <dd>
                        <PrivateMoney paise={investmentsPaise} className="font-bold" />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Invested cost</dt>
                      <dd>
                        <PrivateMoney paise={investedCostPaise} className="font-semibold" />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                      <dt className="text-muted-foreground">Returns (P&L)</dt>
                      <dd className={cn("font-bold", pnlUp ? "text-gain" : "text-loss")}>
                        <PrivateMoney paise={investmentPnl} signed />
                      </dd>
                    </div>
                    <p className="pt-1 text-xs text-muted-foreground">
                      {holdings?.length ?? 0} holding{(holdings?.length ?? 0) === 1 ? "" : "s"} ·
                      simulated prices
                    </p>
                  </dl>
                )}
              </SectionCard>

              <SectionCard
                title="Watchlist"
                action={
                  <Link
                    to="/watchlist"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    View all <ArrowRight className="size-4" aria-hidden />
                  </Link>
                }
              >
                {watchLoading ? (
                  <ul className="space-y-1" aria-label="Loading watchlist">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-3">
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-1/3 rounded-lg" />
                          <Skeleton className="h-3 w-1/2 rounded-lg" />
                        </div>
                        <Skeleton className="h-4 w-20 rounded-lg" />
                      </li>
                    ))}
                  </ul>
                ) : watchError ? (
                  <ErrorState
                    title="Couldn't load your watchlist"
                    body="Check your connection and try again."
                    onRetry={() => void refetchWatch()}
                  />
                ) : watchPreview.length === 0 ? (
                  <EmptyState
                    title="Your watchlist is empty"
                    body="Track stocks you care about and they'll appear here."
                    actionLabel="Browse stocks"
                    onAction={() => void navigate({ to: "/watchlist" })}
                  />
                ) : (
                  <ul className="divide-y divide-border/60">
                    {watchPreview.map((w) => (
                      <li key={w.symbol}>
                        <MarketRow
                          symbol={w.symbol}
                          name={w.name}
                          pricePaise={w.pricePaise}
                          changePct={w.changePct}
                          starred
                          alerted={w.alerted}
                          onToggleStar={() => toggleWatch(w.symbol)}
                          // Alert management (target prices) lives on the watchlist page.
                          onToggleAlert={() => void navigate({ to: "/watchlist" })}
                          onClick={() => void navigate({ to: "/watchlist" })}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                title="Market snapshot"
                sub="Top movers today · simulated"
                action={
                  <Link
                    to="/watchlist"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    Markets <ArrowRight className="size-4" aria-hidden />
                  </Link>
                }
              >
                <div className="space-y-4">
                  <MoverList label="Gainers" rows={topMovers.gainers} />
                  <MoverList label="Losers" rows={topMovers.losers} />
                </div>
              </SectionCard>
            </div>
          </div>
        </main>
      </PullToRefresh>

      <CategorizeSheet
        open={categorizing !== null}
        onOpenChange={(o) => {
          if (!o) setCategorizing(null);
        }}
        currentCategory={categorizing?.category}
        onPick={handleCategorize}
      />
    </div>
  );
}

/** One compact hero metric (label + value). Keeps the hero's second row small. */
function HeroMetric({
  label,
  loading,
  error,
  onRetry,
  children,
}: {
  label: string;
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate tabular-nums text-foreground">
        {loading ? (
          <Skeleton className="h-5 w-16 rounded" aria-label={`Loading ${label}`} />
        ) : error ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-bold text-primary hover:underline"
          >
            Retry
          </button>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

/** Gainers/losers list inside the market-snapshot card. */
function MoverList({
  label,
  rows,
}: {
  label: string;
  rows: { symbol: string; name: string; pricePaise: number; changePct: number }[];
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <ul className="space-y-1">
        {rows.map((r) => {
          const up = r.changePct >= 0;
          return (
            <li key={r.symbol}>
              <Link
                to="/stocks/$symbol"
                params={{ symbol: r.symbol }}
                className={cn(
                  pressable,
                  "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60",
                )}
                aria-label={`${r.name}, simulated, ${up ? "up" : "down"} ${Math.abs(r.changePct).toFixed(2)} percent`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-foreground">
                    {r.symbol}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {formatINRShort(r.pricePaise)}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-sm font-bold tabular-nums",
                    up ? "text-gain" : "text-loss",
                  )}
                >
                  {up ? "+" : "−"}
                  {Math.abs(r.changePct).toFixed(2)}%
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Consistent card chrome (mirrors ChartCard's radius/border/shadow/heading). */
function SectionCard({
  title,
  sub,
  action,
  className,
  children,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold text-foreground">{title}</h2>
          {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
