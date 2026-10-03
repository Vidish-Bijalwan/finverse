import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import type { NetWorthPoint } from "@/components/charts/NetWorthSpark";
import type { DonutSlice } from "@/components/charts/SpendDonut";
import { ChartSkeleton } from "@/components/charts/shared";
import { categoryMover, shiftMonthKey, shortMonthLabel } from "@/components/home/home-data";
import { isInvestmentOrder } from "@/lib/finance/investments";
import { CashFlowCard } from "@/components/home/CashFlowCard";
import { RecentActivity } from "@/components/home/RecentActivity";
import { TxnDetailSheet } from "@/components/home/TxnDetailSheet";
import { HomeInsight } from "@/components/ai/HomeInsight";

// Recharts is heavy (~400KB): split it out of the dashboard route chunk and
// stream it in after mount. Charts already render client-side only
// (chartsReady gate below), so this is SSR-safe.
const NetWorthSpark = lazy(() =>
  import("@/components/charts/NetWorthSpark").then((m) => ({ default: m.NetWorthSpark })),
);
const SpendDonut = lazy(() =>
  import("@/components/charts/SpendDonut").then((m) => ({ default: m.SpendDonut })),
);
import {
  CategorizeSheet,
  EmptyState,
  ErrorState,
  MarketStrip,
  NumberDisplay,
  PullToRefresh,
  pressable,
} from "@/components/fv";
import { QuickActions } from "@/components/home/QuickActions";
import { PeopleStrip } from "@/components/payments/PeopleStrip";
import { extractPeople } from "@/lib/payment-contacts";
import { WatchlistCard } from "@/components/home/WatchlistCard";
import { MarketSnapshot } from "@/components/home/MarketSnapshot";
import { categoryById } from "@/lib/finance/categories";
import { formatINR, monthKey, monthLabel } from "@/lib/finance/format";
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
import { getLTP } from "@/lib/market/history";
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

/** Money display that honors the persisted privacy preference. */
function PrivateMoney({
  paise,
  signed = false,
  short = false,
  animate = false,
  className,
}: {
  paise: number;
  signed?: boolean;
  short?: boolean;
  /** Count up from 0 on mount (~800ms, reduced-motion safe). Hero use only. */
  animate?: boolean;
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
      animate={animate}
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

  // Watchlist symbols feed the market strip; the WatchlistCard below runs its
  // own identical query so both share the same React Query cache entry.
  const { data: watchEntries, refetch: refetchWatch } = useQuery({
    queryKey: WATCHLIST_QUERY_KEY,
    queryFn: fetchWatchlist,
    ...FINVERSE_QUERY_DEFAULTS,
  });

  const currentKey = monthKey(new Date());
  const prevKey = shiftMonthKey(month, -1);
  const canGoForward = month < currentKey;

  const greeting = greetingFor(new Date());
  const displayName = greetingName(profile?.full_name, user?.email);

  // Mobile "Pay again" row: recent payees derived from ledger notes.
  const people = useMemo(() => extractPeople(txns ?? [], []), [txns]);

  const stats = useMemo(() => {
    const all = txns ?? [];
    const byMonth = new Map<string, { income: number; expense: number }>();
    const monthCatSpend = new Map<string, number>();

    for (const t of all) {
      const key = t.dateISO.slice(0, 7);
      let entry = byMonth.get(key);
      if (!entry) {
        entry = { income: 0, expense: 0 };
        byMonth.set(key, entry);
      }
      // Investment orders are transfers (cash ↔ investments) — and legacy
      // expense/income-shaped brokerage rows must not pollute Spent either.
      if (isInvestmentOrder(t)) continue;
      if (t.type === "income") {
        entry.income += t.amountPaise;
      } else if (t.type === "expense") {
        entry.expense += t.amountPaise;
        if (key === month)
          monthCatSpend.set(t.category, (monthCatSpend.get(t.category) ?? 0) + t.amountPaise);
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

    return {
      monthIncome,
      monthExpense,
      cashFlow,
      prevCashFlow,
      cashFlowPct: pctChange(cashFlow, prevCashFlow),
      donut,
      spark: spark.slice(-6),
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

  // The insight card renders only when this is non-null — insights are
  // derived from real ledger data, never invented to fill the card.
  const mover = useMemo(() => categoryMover(txns ?? [], month, prevKey), [txns, month, prevKey]);

  const accountNameById = useMemo(
    () => new Map((summaries ?? []).map((s) => [s.account.id, s.account.name])),
    [summaries],
  );

  // Watchlist symbols feed the market strip.
  const watchSymbols = useMemo(() => (watchEntries ?? []).map((e) => e.symbol), [watchEntries]);

  const hasTxns = (txns?.length ?? 0) > 0;
  const statsLoading = txnsLoading || accountsLoading || holdingsLoading;
  const lastSpark = stats.spark[stats.spark.length - 1];

  const deleteTxn = useDeleteTransaction();
  const updateTxn = useUpdateTransaction();
  const [categorizing, setCategorizing] = useState<Transaction | null>(null);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);

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

  const openAddExpense = useCallback(
    () => void navigate({ to: "/expenses", search: { add: "1" } }),
    [navigate],
  );

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
            {/* Hidden on mobile — the mobile header carries the greeting. */}
            <p className="hidden text-sm text-muted-foreground md:block">
              {greeting}
              {displayName ? `, ${displayName}` : ""}.
            </p>
            <div
              className="ml-auto flex items-center gap-1 rounded-full border border-border bg-card px-1 py-0.5 shadow-card md:ml-0"
              aria-label="Select month"
            >
              <button
                type="button"
                onClick={() => setMonth(shiftMonthKey(month, -1))}
                className={cn(
                  pressable,
                  "grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground md:size-8",
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
                onClick={() => setMonth(shiftMonthKey(month, 1))}
                disabled={!canGoForward}
                className={cn(
                  pressable,
                  "grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 md:size-8",
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
                    animate
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

          {/* ── Pay again (mobile only; GPay-style people row) ───────── */}
          {people.length > 0 && (
            <section aria-label="Pay again" className="mt-5 md:hidden">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Pay again</h2>
                <Link
                  to="/payments"
                  className={`flex min-h-[44px] items-center gap-1 px-2 text-xs font-semibold text-primary ${pressable}`}
                >
                  View all <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <PeopleStrip
                people={people}
                onSelect={(p) =>
                  navigate({ to: "/payments", search: { flow: "upi", name: p.name } })
                }
              />
            </section>
          )}

          {/* ── Market strip (simulated) ───────────────────────────── */}
          <MarketStrip symbols={watchSymbols} className="mt-5" />

          {/* ── Main grid: primary | secondary ─────────────────────── */}
          <div className="mt-6 grid gap-6 xl:grid-cols-12 xl:items-start">
            {/* PRIMARY: recent activity, cash flow, insights */}
            <div className="flex min-w-0 flex-col gap-6 xl:col-span-8">
              <RecentActivity
                txns={txns ?? []}
                loading={txnsLoading}
                onCategorize={setCategorizing}
                onDelete={handleDeleteTxn}
                onOpenDetail={setDetailTxn}
                onAddExpense={openAddExpense}
              />

              {!txnsLoading && <HomeInsight mover={mover} prevMonthKey={prevKey} />}

              <CashFlowCard
                txns={txns ?? []}
                loading={txnsLoading}
                anchorMonth={month}
                ready={chartsReady}
                hideAmounts={private_}
                onAddExpense={openAddExpense}
              />

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
                    onAction={openAddExpense}
                  />
                ) : (
                  <div className="grid gap-4">
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

              {/* Phase 3 cards: compact watchlist + market snapshot. */}
              <WatchlistCard />
              <MarketSnapshot />
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

      <TxnDetailSheet
        txn={detailTxn}
        accountName={detailTxn?.accountId ? accountNameById.get(detailTxn.accountId) : undefined}
        hideAmounts={private_}
        onClose={() => setDetailTxn(null)}
        onOpenExpenses={() => {
          setDetailTxn(null);
          void navigate({ to: "/expenses", search: {} });
        }}
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
