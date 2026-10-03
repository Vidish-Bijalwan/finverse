import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
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
  NumberDisplay,
  PullToRefresh,
  StatBand,
  TickerStrip,
  TxnRow,
  pressable,
  type StatBandStat,
} from "@/components/fv";
import { useWatchlist as useWatchlistUI } from "@/components/markets/useWatchlist";
import { categoryById } from "@/lib/finance/categories";
import { formatINR, formatINRShort, monthKey, monthLabel } from "@/lib/finance/format";
import {
  useAccountSummaries,
  useHoldings,
  useMonth,
  useTransactions,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/lib/finance/hooks";
import type { Transaction } from "@/lib/finance/types";
import { getStock } from "@/lib/market/data";
import { dayChange, genHistory, getLTP } from "@/lib/market/history";
import { fetchWatchlist, WATCHLIST_QUERY_KEY } from "@/lib/watchlist";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinVerse AI — Dashboard" },
      {
        name: "description",
        content:
          "Your money in one clear view: net worth, monthly P&L, investments, and recent activity.",
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

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { label: "Add expense", icon: Plus, to: "/expenses" },
  { label: "Pay", icon: Send, to: "/payments" },
  { label: "Invest", icon: TrendingUp, to: "/portfolio" },
  { label: "Add goal", icon: Target, to: "/goals" },
] as const;

interface Mover {
  label: string;
  delta: number;
  pct: number | null;
}

function FinVerseDashboard() {
  const [month, setMonth] = useMonth();
  const [chartsReady, setChartsReady] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

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
    retry: false,
  });
  const { toggle: toggleWatch } = useWatchlistUI();

  const currentKey = monthKey(new Date());
  const prevKey = shiftMonth(month, -1);
  const canGoForward = month < currentKey;

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const greeting = greetingFor(new Date());

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
    const monthIncome = monthEntry.income;
    const monthExpense = monthEntry.expense;

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
      pnl: monthIncome - monthExpense,
      monthExpense,
      donut,
      bars,
      spark: spark.slice(-6),
      mover,
      topCategory: topSlice ? { label: topSlice.label, value: topSlice.value } : null,
    };
  }, [txns, month, prevKey]);

  // Net worth = derived account balances + holdings at session LTP.
  const accountsTotal = useMemo(
    () => (summaries ?? []).reduce((sum, s) => sum + s.balancePaise, 0),
    [summaries],
  );
  const holdingsLtpValue = useMemo(
    () => (holdings ?? []).reduce((sum, h) => sum + h.qty * getLTP(h.symbol), 0),
    [holdings],
  );
  const investedPaise = useMemo(
    () => (holdings ?? []).reduce((sum, h) => sum + h.qty * h.avgPricePaise, 0),
    [holdings],
  );
  const netWorth = accountsTotal + holdingsLtpValue;

  const recentTxns = useMemo(
    () =>
      [...(txns ?? [])]
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO) || b.id.localeCompare(a.id))
        .slice(0, 5),
    [txns],
  );

  const watchPreview = useMemo(
    () =>
      (watchEntries ?? []).slice(0, 3).map((e) => {
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

  const statBandStats: StatBandStat[] = [
    {
      label: "Net worth",
      tone: netWorth < 0 ? "loss" : "neutral",
      value: statsLoading ? (
        <Skeleton className="h-7 w-24 rounded-lg" />
      ) : accountsError || holdingsError ? (
        <span className="text-base text-muted-foreground">—</span>
      ) : (
        <NumberDisplay paise={netWorth} animate />
      ),
      sub:
        accountsError || holdingsError ? (
          <button
            type="button"
            onClick={() => {
              if (accountsError) void refetchAccounts();
              if (holdingsError) void refetchHoldings();
            }}
            className="font-bold text-primary hover:underline"
          >
            Couldn&apos;t load · Retry
          </button>
        ) : (
          "Accounts + investments"
        ),
    },
    {
      label: `${monthLabel(month)} P&L`,
      tone: stats.pnl >= 0 ? "gain" : "loss",
      value: txnsLoading ? (
        <Skeleton className="h-7 w-24 rounded-lg" />
      ) : (
        <NumberDisplay paise={stats.pnl} signed />
      ),
      sub: "Income minus expenses",
    },
    {
      label: "Invested value",
      value: holdingsLoading ? (
        <Skeleton className="h-7 w-24 rounded-lg" />
      ) : holdingsError ? (
        <span className="text-base text-muted-foreground">—</span>
      ) : (
        <NumberDisplay paise={investedPaise} />
      ),
      sub: holdingsError ? (
        <button
          type="button"
          onClick={() => void refetchHoldings()}
          className="font-bold text-primary hover:underline"
        >
          Couldn&apos;t load · Retry
        </button>
      ) : (
        `${holdings?.length ?? 0} holding${(holdings?.length ?? 0) === 1 ? "" : "s"}`
      ),
    },
  ];

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PullToRefresh onRefresh={refreshAll} className="min-h-screen">
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {/* ── Header: greeting + month switcher ──────────────────────── */}
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-primary-dark sm:text-3xl">
                {greeting}
                {firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Here&apos;s your money at a glance.
              </p>
            </div>
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
          </header>

          {/* ── Stat band ──────────────────────────────────────────────── */}
          <StatBand stats={statBandStats} className="mt-5" />

          {/* ── Market ticker (simulated prices) ───────────────────────── */}
          <TickerStrip className="mt-4" />

          {/* ── Desktop: stats | activity | markets grid ───────────────── */}
          <div className="mt-6 flex flex-col gap-8 xl:grid xl:grid-cols-12 xl:items-start xl:gap-6">
            {/* ── Quick actions: snap rail on mobile, stacked on xl ────── */}
            <nav
              aria-label="Quick actions"
              className="order-1 -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 xl:col-span-3 xl:row-start-1 xl:overflow-visible"
            >
              <div className="flex snap-x gap-2.5 sm:flex-wrap xl:flex-col xl:items-stretch">
                {quickActions.map(({ label, icon: Icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className={cn(
                      pressable,
                      "inline-flex shrink-0 snap-start items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-card hover:border-primary/40 hover:text-primary",
                    )}
                  >
                    <Icon className="size-4 text-primary" aria-hidden />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* ── Markets: watchlist ───────────────────────────────────── */}
            <SectionCard
              title="Watchlist"
              className="order-2 xl:col-span-4 xl:col-start-9 xl:row-start-1"
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
                  {Array.from({ length: 3 }).map((_, i) => (
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
                <>
                  {/* Mobile: horizontal snap-scroll rail of stock cards. */}
                  <div className="-mx-4 overflow-x-auto px-4 pb-1 xl:hidden">
                    <div className="flex snap-x gap-2.5">
                      {watchPreview.map((w) => {
                        const up = w.changePct >= 0;
                        return (
                          <Link
                            key={w.symbol}
                            to="/stocks/$symbol"
                            params={{ symbol: w.symbol }}
                            aria-label={`${w.name} (${w.symbol}), ${up ? "up" : "down"} ${Math.abs(w.changePct).toFixed(2)} percent`}
                            className={cn(
                              pressable,
                              "flex w-36 shrink-0 snap-start flex-col gap-0.5 rounded-[14px] border border-border bg-background p-3",
                            )}
                          >
                            <span className="truncate text-sm font-bold text-foreground">
                              {w.symbol}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">{w.name}</span>
                            <NumberDisplay
                              paise={w.pricePaise}
                              className="mt-1 text-sm font-bold text-foreground"
                            />
                            <span
                              className={cn(
                                "mt-1 w-fit rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                                up ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
                              )}
                            >
                              {up ? "+" : "−"}
                              {Math.abs(w.changePct).toFixed(2)}%
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  {/* Desktop: full rows. */}
                  <ul className="hidden divide-y divide-border/60 xl:block">
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
                </>
              )}
            </SectionCard>

            {/* ── Activity: insight + charts ───────────────────────────── */}
            <div className="order-3 flex min-w-0 flex-col gap-8 xl:col-span-5 xl:col-start-4 xl:row-span-2 xl:row-start-1">
              {!txnsLoading && stats.mover && (
                <div className="flex items-start gap-3 rounded-[14px] border border-border bg-card p-4 shadow-card">
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

              <section aria-label="Analytics">
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-lg font-black text-primary-dark">Where your money went</h2>
                  <span className="text-sm font-bold text-muted-foreground">
                    {monthLabel(month)}
                  </span>
                </div>

                {txnsLoading ? (
                  <div className="grid gap-4">
                    <Skeleton className="h-72 rounded-[14px]" />
                    <Skeleton className="h-72 rounded-[14px]" />
                  </div>
                ) : !hasTxns ? (
                  <EmptyState
                    title="No transactions yet"
                    body="Add your first expense or income and this dashboard will come alive with your cash flow, spending breakdown, and net-worth trend."
                    actionLabel="Add your first expense"
                    onAction={() => void navigate({ to: "/expenses" })}
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

            {/* ── Recent transactions ──────────────────────────────────── */}
            <SectionCard
              title="Recent transactions"
              className="order-4 xl:col-span-4 xl:col-start-9 xl:row-start-2"
              action={
                <Link
                  to="/expenses"
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
                  onAction={() => void navigate({ to: "/expenses" })}
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
                          onClick={() => void navigate({ to: "/expenses" })}
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

            {/* ── Deep-link cards: 3-up on mobile, stacked on xl ───────── */}
            <section
              aria-label="Explore"
              className="order-5 xl:col-span-3 xl:col-start-1 xl:row-start-2"
            >
              <div className="grid grid-cols-3 gap-2.5 xl:grid-cols-1 xl:gap-4">
                <DeepLinkCard
                  icon={<Wallet className="size-5 sm:size-6" aria-hidden />}
                  title="Expenses"
                  to="/expenses"
                  loading={txnsLoading}
                  stat={formatINRShort(stats.monthExpense)}
                  statLabel={`Spent in ${monthLabel(month)}`}
                  sub={
                    stats.topCategory
                      ? `Top: ${stats.topCategory.label} · ${formatINRShort(stats.topCategory.value)}`
                      : "No spending recorded yet"
                  }
                />
                <DeepLinkCard
                  icon={<BriefcaseBusiness className="size-5 sm:size-6" aria-hidden />}
                  title="Portfolio"
                  to="/portfolio"
                  loading={holdingsLoading}
                  error={holdingsError}
                  onRetry={() => void refetchHoldings()}
                  stat={formatINRShort(investedPaise)}
                  statLabel="Invested value"
                  sub={`${holdings?.length ?? 0} holding${(holdings?.length ?? 0) === 1 ? "" : "s"} at avg. buy price`}
                />
                <DeepLinkCard
                  icon={<Sparkles className="size-5 sm:size-6" aria-hidden />}
                  title="Insights"
                  to="/insights"
                  loading={txnsLoading}
                  stat={stats.mover ? `+${formatINRShort(stats.mover.delta)}` : "—"}
                  statLabel="Biggest riser"
                  sub={
                    stats.mover
                      ? `${stats.mover.label} vs ${monthLabel(prevKey)}`
                      : "No category rose this month"
                  }
                />
              </div>
            </section>
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
        "min-w-0 rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-primary-dark">{title}</h2>
          {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function DeepLinkCard({
  icon,
  title,
  to,
  loading,
  error,
  onRetry,
  stat,
  statLabel,
  sub,
}: {
  icon: ReactNode;
  title: string;
  to: string;
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  stat: string;
  statLabel: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        pressable,
        "group flex min-w-0 flex-col rounded-[14px] border border-border bg-card p-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-modal sm:p-5",
      )}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-12 sm:rounded-2xl">
        {icon}
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:mt-4 sm:text-xs">
        {title}
      </p>
      {loading ? (
        <>
          <Skeleton
            className="mt-2 h-7 w-20 rounded-lg sm:h-8 sm:w-28"
            aria-label={`Loading ${title}`}
          />
          <Skeleton className="mt-2 h-3 w-16 rounded-lg sm:w-20" />
          <Skeleton className="mt-3 hidden h-3 w-36 rounded-lg sm:block" />
        </>
      ) : error ? (
        <>
          <p className="mt-1 text-lg font-black text-muted-foreground sm:text-2xl">—</p>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{statLabel}</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRetry?.();
            }}
            className="mt-3 w-fit text-xs font-bold text-primary hover:underline"
          >
            Couldn&apos;t load · Retry
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 truncate text-lg font-black tabular-nums text-primary-dark sm:text-2xl">
            {stat}
          </p>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{statLabel}</p>
          <p className="mt-3 hidden min-h-8 text-xs leading-5 text-muted-foreground sm:block">
            {sub}
          </p>
        </>
      )}
      <span className="mt-3 hidden items-center gap-1 text-sm font-bold text-primary group-hover:text-primary-hover sm:flex">
        Open{" "}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
