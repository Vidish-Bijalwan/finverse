import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Pause, Pencil, Play, Plus, RefreshCw, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/shell/BottomSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteHolding,
  useHoldings,
  useRecurringRules,
  useToggleRecurringRule,
  useTransactions,
} from "@/lib/finance/hooks";
import { formatINR } from "@/lib/finance/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getStock, STOCKS } from "@/lib/market/data";
import { dayChange, genHistory, getLTP, refreshLTP } from "@/lib/market/history";
import { PageShell } from "@/components/markets/PageShell";
import { HoldingDialog } from "@/components/markets/HoldingDialog";
import { SipSheet } from "@/components/markets/SipSheet";
import { useWatchlist } from "@/components/markets/useWatchlist";
import {
  holdingTotals,
  longDateLabel,
  parseOrderNote,
  portfolioTotals,
  todayReturnPaise,
} from "@/components/markets/portfolio-math";
import {
  EmptyState,
  ErrorState,
  MarketRow,
  NumberDisplay,
  Pill,
  PullToRefresh,
  SearchDropdown,
  Tabs,
  TickerStrip,
  pressable,
} from "@/components/fv";
import { ChartSkeleton } from "@/components/charts/shared";

// Recharts is heavy: keep it out of the portfolio route chunk and stream it
// in client-side after mount. SSR-safe: the chartsReady gate + the client-
// resolved `prices` state mean the lazy component never renders on the server.
const PortfolioChart = lazy(() =>
  import("@/components/markets/PortfolioChart").then((m) => ({
    default: m.PortfolioChart,
  })),
);
const DonutAllocation = lazy(() =>
  import("@/components/fv/DonutAllocation").then((m) => ({ default: m.DonutAllocation })),
);
import type { Holding } from "@/lib/finance/types";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [{ title: "Portfolio — FinVerse AI" }],
  }),
  component: PortfolioPage,
});

/** "+₹4,210 (+3.24%)" / "−₹380 (−0.41%)" in gain/loss tokens. */
function ReturnsLine({ paise, pct }: { paise: number; pct: number }) {
  const up = paise >= 0;
  return (
    <span className={cn("font-bold tabular-nums", up ? "text-gain" : "text-loss")}>
      {up ? "+" : "−"}
      {formatINR(Math.abs(paise))} ({up ? "+" : "−"}
      {Math.abs(pct).toFixed(2)}%)
    </span>
  );
}

/** "+₹380" / "−₹380" in gain/loss tokens. */
function SignedAmount({ paise, className }: { paise: number; className?: string }) {
  const up = paise >= 0;
  return (
    <span className={cn("font-bold tabular-nums", up ? "text-gain" : "text-loss", className)}>
      {up ? "+" : "−"}
      {formatINR(Math.abs(paise))}
    </span>
  );
}

type InvestMode = "order" | "sip";

function PortfolioPage() {
  const navigate = useNavigate();
  const { data: holdings, isPending, isError, failureCount, refetch } = useHoldings();
  const { data: transactions } = useTransactions();
  const { data: recurringRules } = useRecurringRules();
  const toggleRule = useToggleRecurringRule();
  const deleteHolding = useDeleteHolding();
  const { watchlist, toggle: toggleWatch } = useWatchlist();

  const [tab, setTab] = useState("holdings");
  const [priceTick, setPriceTick] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | undefined>(undefined);
  const [deleting, setDeleting] = useState<Holding | undefined>(undefined);
  const [investOpen, setInvestOpen] = useState(false);
  const [investMode, setInvestMode] = useState<InvestMode>("order");
  const [investQuery, setInvestQuery] = useState("");
  const [sipTarget, setSipTarget] = useState<{ symbol: string; name: string } | null>(null);
  // LTPs are jittered demo prices (Math.random) — resolved client-side only so
  // SSR and hydration render identically.
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  // Charts mount client-side only (SSR-safe for the lazy recharts chunks).
  const [chartsReady, setChartsReady] = useState(false);
  useEffect(() => {
    setChartsReady(true);
  }, []);

  // Failsafe: skeletons must never spin forever. This is a LAST RESORT, not
  // the common path to it:
  //  - every Supabase request is bounded by a 10s fetch timeout (see
  //    src/lib/supabase.ts), so a stalled connection fails fast instead of
  //    hanging, and React Query's built-in retry recovers transparently;
  //  - the timer below restarts on every failed attempt (failureCount), so it
  //    only fires when the query is pending with NO failures for 20s — i.e.
  //    a genuinely silent hang. Retry resets everything.
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  useEffect(() => {
    if (!isPending) return;
    const t = window.setTimeout(() => setLoadTimedOut(true), 20_000);
    return () => window.clearTimeout(t);
  }, [isPending, failureCount, retryNonce]);

  function retryLoad() {
    setLoadTimedOut(false);
    setRetryNonce((n) => n + 1);
    void refetch();
  }

  useEffect(() => {
    setPrices(Object.fromEntries((holdings ?? []).map((h) => [h.symbol, getLTP(h.symbol)])));
  }, [holdings, priceTick]);

  const priceOf = useCallback(
    (symbol: string) => prices?.[symbol] ?? getStock(symbol)?.pricePaise ?? 0,
    [prices],
  );

  const rows = useMemo(
    () =>
      (holdings ?? []).map((h) => {
        const stock = getStock(h.symbol);
        const ltp = priceOf(h.symbol);
        const totals = holdingTotals(
          { symbol: h.symbol, qty: h.qty, avgPricePaise: h.avgPricePaise },
          ltp,
        );
        return {
          holding: h,
          stock,
          name: stock?.name ?? h.symbol,
          ltp,
          ...totals,
        };
      }),
    [holdings, priceOf],
  );

  const ready = !isPending;
  const totals = useMemo(() => portfolioTotals(rows), [rows]);

  /** Today's returns: value change between the last demo close and the
   *  current simulated LTP, summed across holdings. */
  const todayReturns = useMemo(
    () =>
      rows.reduce((a, r) => {
        const daily = genHistory(r.holding.symbol, 22);
        const prevClose = daily.length > 1 ? daily[daily.length - 2]!.closePaise : r.ltp;
        return a + todayReturnPaise(r.holding.qty, r.ltp, prevClose);
      }, 0),
    [rows],
  );

  /** Simulated-brokerage orders, parsed from ledger notes. Every ledger row
   *  is an executed order — status is always the real "Executed". */
  const orders = useMemo(
    () =>
      (transactions ?? [])
        .map((t) => {
          const parsed = parseOrderNote(t.note);
          if (!parsed || t.category !== "investments") return null;
          if (!(t.tags ?? []).includes("simulated-brokerage")) return null;
          return {
            id: t.id,
            dateISO: t.dateISO,
            ...parsed,
            pricePaise: parsed.qty > 0 ? Math.round(t.amountPaise / parsed.qty) : 0,
            amountPaise: t.amountPaise,
          };
        })
        .filter((o): o is NonNullable<typeof o> => o !== null),
    [transactions],
  );

  /** Active SIP rules created through the SipSheet flow. */
  const sips = useMemo(
    () =>
      (recurringRules ?? []).filter((r) => r.category === "investments" && /^SIP\s/i.test(r.note)),
    [recurringRules],
  );

  /** "Invest" entry: stock search over the demo dataset. In "order" mode it
   *  opens the stock detail page (orders placed there); in "sip" mode it
   *  opens the SipSheet for the picked stock. */
  const investGroups = useMemo(() => {
    const q = investQuery.trim().toLowerCase();
    const list = (
      q
        ? STOCKS.filter(
            (s) =>
              s.symbol.toLowerCase().includes(q) ||
              s.name.toLowerCase().includes(q) ||
              s.sector.toLowerCase().includes(q),
          )
        : STOCKS.slice(0, 8)
    ).slice(0, 12);
    return [
      {
        label: q ? "Stocks" : "Popular stocks",
        items: list.map((s) => ({
          id: s.symbol,
          title: s.symbol,
          subtitle: `${s.name} · ${s.sector}`,
          right: formatINR(getLTP(s.symbol)),
          rightTone: "neutral" as const,
        })),
      },
    ];
  }, [investQuery]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * "Refresh prices": jitter fresh demo LTPs AND refetch holdings from the
   * server query — shared by the header button and the PullToRefresh gesture.
   * Shows a spinner on the header button while the async refetch is in
   * flight; the button is hidden entirely when there are no holdings, so it
   * can never sit disabled with nothing to do.
   */
  const refreshPortfolio = useCallback(async () => {
    setIsRefreshing(true);
    try {
      (holdings ?? []).forEach((h) => refreshLTP(h.symbol));
      setPriceTick((t) => t + 1);
      await refetch();
      toast.success("Prices refreshed.");
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings, refetch]);

  function openInvest(mode: InvestMode = "order") {
    setInvestMode(mode);
    setInvestQuery("");
    setInvestOpen(true);
  }

  function pickInvestStock(symbol: string) {
    const stock = getStock(symbol);
    setInvestOpen(false);
    if (investMode === "sip") {
      setSipTarget({ symbol, name: stock?.name ?? symbol });
    } else {
      navigate({ to: "/stocks/$symbol", params: { symbol } });
    }
  }

  const tabs = [
    { id: "holdings", label: "Holdings", badge: rows.length },
    { id: "orders", label: "Orders", badge: orders.length },
    { id: "sips", label: "SIPs", badge: sips.length },
    { id: "watchlist", label: "Watchlist", badge: watchlist.length },
  ];

  return (
    <PullToRefresh onRefresh={refreshPortfolio} className="min-h-screen">
      <PageShell
        title="Portfolio"
        subtitle="Your investments, valued at simulated prices — not live market data."
        active="Portfolio"
        actions={
          <>
            {rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void refreshPortfolio();
                }}
                disabled={!ready || isRefreshing}
                aria-busy={isRefreshing}
                className={pressable}
              >
                <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
                Refresh prices
              </Button>
            )}
            <Button size="sm" onClick={() => openInvest("order")} className={pressable}>
              <Plus className="size-4" /> Invest
            </Button>
          </>
        }
      >
        <TickerStrip className="mb-5" />

        {isError || loadTimedOut ? (
          <ErrorState
            title="Couldn't load your portfolio"
            body={
              loadTimedOut && !isError
                ? "Loading is taking too long — your connection may be stuck. Try again."
                : "Your holdings couldn't be fetched. Check your connection and try again."
            }
            onRetry={retryLoad}
          />
        ) : !ready ? (
          <div className="grid gap-5">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Start investing"
            body="Buy your first stock to build a portfolio — every order is simulated and posts to your shared ledger, so your money view always stays in sync."
            actionLabel="Explore investments"
            onAction={() => openInvest("order")}
          />
        ) : (
          <div className="grid gap-5">
            {/* Investment summary */}
            <section
              aria-label="Investment summary"
              className="rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current value
                </h2>
                <Pill variant="neutral" size="sm">
                  Simulated
                </Pill>
              </div>
              <p className="mt-1 text-4xl font-black text-primary-dark tabular-nums">
                <NumberDisplay paise={totals.valuePaise} animate />
              </p>

              <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total invested
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-primary-dark tabular-nums">
                    {formatINR(totals.investedPaise)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total returns
                  </dt>
                  <dd className="mt-1 text-lg">
                    <ReturnsLine paise={totals.pnlPaise} pct={totals.pnlPct} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Today&apos;s returns
                  </dt>
                  <dd className="mt-1 text-lg">
                    <SignedAmount paise={todayReturns} />
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-border pt-4">
                {chartsReady && prices ? (
                  <Suspense fallback={<ChartSkeleton className="h-52" />}>
                    <PortfolioChart
                      positions={rows.map((r) => ({
                        symbol: r.holding.symbol,
                        qty: r.holding.qty,
                      }))}
                      ltpBySymbol={prices}
                    />
                  </Suspense>
                ) : (
                  <ChartSkeleton className="h-52" />
                )}
              </div>
            </section>

            {/* Holdings / Orders / SIPs / Watchlist */}
            <Tabs
              tabs={tabs.map((t) => ({
                ...t,
                badge: (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground tabular-nums">
                    {t.badge}
                  </span>
                ),
              }))}
              value={tab}
              onChange={setTab}
              ariaLabel="Portfolio sections"
            />

            {tab === "holdings" && (
              <div className="grid gap-5">
                {chartsReady && (
                  <Suspense fallback={<ChartSkeleton className="h-72" />}>
                    <DonutAllocation
                      items={rows.map((r) => ({ label: r.holding.symbol, paise: r.valuePaise }))}
                    />
                  </Suspense>
                )}
                <section
                  aria-label={`Holdings (${rows.length})`}
                  className="rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5"
                >
                  <h2 className="px-2 pt-1 text-base font-bold text-primary-dark">
                    Holdings ({rows.length})
                  </h2>
                  <div className="mt-2 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Avg price</TableHead>
                          <TableHead className="text-right">Current value</TableHead>
                          <TableHead className="text-right">Returns</TableHead>
                          <TableHead className="w-20">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow
                            key={r.holding.id}
                            className="cursor-pointer"
                            onClick={() =>
                              navigate({
                                to: "/stocks/$symbol",
                                params: { symbol: r.holding.symbol },
                              })
                            }
                          >
                            <TableCell>
                              <span className="font-bold text-foreground">{r.holding.symbol}</span>
                              <div className="max-w-40 truncate text-xs text-muted-foreground sm:max-w-none">
                                {r.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{r.qty}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatINR(Math.round(r.holding.avgPricePaise))}
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">
                              {formatINR(r.valuePaise)}
                            </TableCell>
                            <TableCell className="text-right">
                              <ReturnsLine paise={r.pnlPaise} pct={r.pnlPct} />
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center justify-end gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Edit ${r.holding.symbol}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(r.holding);
                                    setDialogOpen(true);
                                  }}
                                  className={pressable}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Remove ${r.holding.symbol}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleting(r.holding);
                                  }}
                                  className={pressable}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              </div>
            )}

            {tab === "orders" && (
              <section
                aria-label="Orders"
                className="rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5"
              >
                <h2 className="px-2 pt-1 text-base font-bold text-primary-dark">
                  Orders ({orders.length})
                </h2>
                <p className="mt-1 px-2 text-xs text-muted-foreground">
                  Every order fills instantly at simulated prices and posts to your shared ledger.
                </p>
                {orders.length === 0 ? (
                  <div className="mt-3">
                    <EmptyState
                      title="No orders yet"
                      body="Your simulated BUY and SELL orders will appear here."
                      actionLabel="Explore investments"
                      onAction={() => openInvest("order")}
                    />
                  </div>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead className="text-right">Qty × price</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow
                            key={o.id}
                            className="cursor-pointer"
                            onClick={() =>
                              navigate({ to: "/stocks/$symbol", params: { symbol: o.symbol } })
                            }
                          >
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {longDateLabel(o.dateISO)}
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <Pill variant={o.side === "buy" ? "gain" : "loss"} size="sm">
                                  {o.side === "buy" ? "Buy" : "Sell"}
                                </Pill>
                                <span className="font-bold text-foreground">{o.symbol}</span>
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap tabular-nums">
                              {o.qty} × {formatINR(o.pricePaise)}
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">
                              {formatINR(o.amountPaise)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Pill variant="neutral" size="sm">
                                Executed
                              </Pill>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            )}

            {tab === "sips" && (
              <section
                aria-label="SIPs"
                className="rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5"
              >
                <div className="flex items-center justify-between gap-3 px-2 pt-1">
                  <h2 className="text-base font-bold text-primary-dark">SIPs ({sips.length})</h2>
                  <Button size="sm" onClick={() => openInvest("sip")} className={pressable}>
                    <Plus className="size-4" /> Start SIP
                  </Button>
                </div>
                {sips.length === 0 ? (
                  <div className="mt-3">
                    <EmptyState
                      title="No SIPs yet"
                      body="Automate investing with a weekly or monthly simulated SIP."
                      actionLabel="Start a SIP"
                      onAction={() => openInvest("sip")}
                    />
                  </div>
                ) : (
                  <ul className="mt-3 grid gap-2">
                    {sips.map((s) => {
                      const m = /^SIP\s+([A-Z0-9.]+)/i.exec(s.note);
                      const symbol = m?.[1]?.toUpperCase() ?? "";
                      const stock = symbol ? getStock(symbol) : undefined;
                      const paused = s.isPaused;
                      return (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground">
                              {symbol || "SIP"}
                              {stock && (
                                <span className="ml-2 truncate text-xs font-normal text-muted-foreground">
                                  {stock.name}
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                              {formatINR(s.amountPaise)} {s.frequency} · started{" "}
                              {longDateLabel(s.startDateISO)}
                            </p>
                          </div>
                          <Pill variant={paused ? "neutral" : "gain"} size="sm" dot>
                            {paused ? "Paused" : "Active"}
                          </Pill>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleRule.mutate(
                                { id: s.id, isPaused: !paused },
                                {
                                  onError: () =>
                                    toast.error("Couldn't update the SIP — try again."),
                                },
                              )
                            }
                            disabled={toggleRule.isPending}
                            className={pressable}
                          >
                            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                            {paused ? "Resume" : "Pause"}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {tab === "watchlist" && (
              <section
                aria-label="Watchlist"
                className="rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5"
              >
                <h2 className="px-2 pt-1 text-base font-bold text-primary-dark">
                  Watchlist ({watchlist.length})
                </h2>
                {watchlist.length === 0 ? (
                  <div className="mt-3">
                    <EmptyState
                      title="Your watchlist is empty"
                      body="Star stocks to track them here."
                      actionLabel="Explore investments"
                      onAction={() => openInvest("order")}
                    />
                  </div>
                ) : (
                  <ul className="mt-2 grid gap-1">
                    {watchlist.map((symbol) => {
                      const stock = getStock(symbol);
                      const name = stock?.name ?? symbol;
                      const price = priceOf(symbol);
                      const changePct = dayChange(genHistory(symbol, 22)).changePct;
                      return (
                        <li key={symbol}>
                          <MarketRow
                            symbol={symbol}
                            name={name}
                            pricePaise={price}
                            changePct={changePct}
                            starred
                            onToggleStar={() => toggleWatch(symbol)}
                            onClick={() => navigate({ to: "/stocks/$symbol", params: { symbol } })}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}

        {/* Invest: stock search (bottom sheet on all viewports) */}
        <BottomSheet
          open={investOpen}
          onClose={() => setInvestOpen(false)}
          title={investMode === "sip" ? "Start SIP" : "Invest"}
          showCloseButton
        >
          <div className="px-1 pb-2">
            <p className="pb-3 text-sm text-muted-foreground">
              {investMode === "sip"
                ? "Pick a stock to start a simulated SIP in it."
                : "Pick a stock to open its detail page and place a simulated order."}
            </p>
            <SearchDropdown
              groups={investGroups}
              value={investQuery}
              onChange={setInvestQuery}
              onSelect={(item) => pickInvestStock(item.id)}
              placeholder="Search stocks by name, symbol, sector…"
            />
            <p className="pt-3 text-xs text-muted-foreground">
              Prices shown are simulated — not live market data.
            </p>
          </div>
        </BottomSheet>

        {/* Start-SIP flow: existing SipSheet */}
        {sipTarget && (
          <SipSheet
            open={!!sipTarget}
            onOpenChange={(o) => !o && setSipTarget(null)}
            symbol={sipTarget.symbol}
            name={sipTarget.name}
          />
        )}

        <HoldingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          {...(editing ? { holding: editing } : {})}
        />

        <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {deleting?.symbol}?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes the holding from your portfolio. It cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
                  deleting &&
                  deleteHolding.mutate(deleting.id, {
                    onSuccess: () => {
                      toast.success(`${deleting.symbol} removed from portfolio`);
                      setDeleting(undefined);
                    },
                    onError: () => toast.error("Couldn't remove — try again."),
                  })
                }
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageShell>
    </PullToRefresh>
  );
}
