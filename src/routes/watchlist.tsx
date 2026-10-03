import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, Clock3, Eye, Plus, RefreshCw, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, MarketRow, pressable } from "@/components/fv";
import { PageShell } from "@/components/markets/PageShell";
import { formatINR } from "@/lib/finance/format";
import { STOCKS, getStock } from "@/lib/market/data";
import { dayChange, genHistory, getLTP, refreshLTP } from "@/lib/market/history";
import {
  isAlertMet,
  useAddPriceAlert,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useRemovePriceAlert,
  useWatchlist,
  type AlertKind,
  type WatchlistEntry,
} from "@/lib/watchlist";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [{ title: "Watchlist — FinVerse AI" }],
  }),
  component: WatchlistPage,
});

function parseRupeesToPaise(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const paise = Math.round(Number(cleaned) * 100);
  return paise > 0 ? paise : null;
}

function WatchlistPage() {
  const navigate = useNavigate();
  const { data: entries, isPending, isError, error, refetch } = useWatchlist();
  const addStock = useAddToWatchlist();
  const removeStock = useRemoveFromWatchlist();
  const addAlert = useAddPriceAlert();
  const removeAlert = useRemovePriceAlert();
  const reducedMotion = usePrefersReducedMotion();

  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  /** When alert conditions were last evaluated (ms epoch). */
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState<number | null>(null);
  /** Which symbol's price-alert dialog is open. */
  const [alertDialogSymbol, setAlertDialogSymbol] = useState<string | null>(null);
  // Per-stock alert form state: symbol -> {kind, price}
  const [alertForm, setAlertForm] = useState<Record<string, { kind: AlertKind; price: string }>>(
    {},
  );

  // Alert conditions are evaluated ONLY here — on mount and on explicit price
  // refresh — never tick-by-tick, so a jittered simulated price can't flicker
  // an alert between met/unmet on its own.
  useEffect(() => {
    setPrices(Object.fromEntries((entries ?? []).map((e) => [e.symbol, getLTP(e.symbol)])));
    setLastEvaluatedAt(Date.now());
  }, [entries, tick]);

  const watched = useMemo(() => new Set((entries ?? []).map((e) => e.symbol)), [entries]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return STOCKS.filter(
      (s) =>
        !watched.has(s.symbol) &&
        (s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)),
    ).slice(0, 6);
  }, [query, watched]);

  const ready = !isPending && !isError && prices !== null;

  function handleRefresh() {
    (entries ?? []).forEach((e) => refreshLTP(e.symbol));
    setTick((t) => t + 1);
    toast.success("Prices refreshed.");
  }

  function handleAdd(symbol: string) {
    if (!getStock(symbol)) {
      toast.error(`"${symbol}" isn't in the FinVerse stock universe.`);
      return;
    }
    addStock.mutateAdd(symbol, {
      onSuccess: () => {
        setQuery("");
        toast.success(`${symbol} added to your watchlist.`);
      },
      onError: (e) => toast.error(e.message || "Couldn't add that stock — try again."),
    });
  }

  function handleRemove(symbol: string) {
    removeStock.mutateRemove(symbol, {
      onSuccess: () => {
        if (alertDialogSymbol === symbol) setAlertDialogSymbol(null);
        toast.success(`${symbol} removed from your watchlist.`);
      },
      onError: () => toast.error("Couldn't remove — try again."),
    });
  }

  function handleAddAlert(symbol: string) {
    const form = alertForm[symbol] ?? { kind: "above" as AlertKind, price: "" };
    const paise = parseRupeesToPaise(form.price);
    if (paise === null) {
      toast.error("Enter a valid alert price in ₹ (e.g. 1500).");
      return;
    }
    addAlert.mutateAddAlert(symbol, form.kind, paise, {
      onSuccess: () => {
        setAlertForm((f) => ({ ...f, [symbol]: { kind: "above", price: "" } }));
        toast.success(
          `Alert set: ${symbol} ${form.kind === "above" ? "≥" : "≤"} ${formatINR(paise)}.`,
        );
      },
      onError: () => toast.error("Couldn't save the alert — try again."),
    });
  }

  const dialogEntry: WatchlistEntry | undefined = (entries ?? []).find(
    (e) => e.symbol === alertDialogSymbol,
  );
  const dialogForm = alertDialogSymbol
    ? (alertForm[alertDialogSymbol] ?? { kind: "above" as AlertKind, price: "" })
    : null;
  const dialogLtp = alertDialogSymbol != null ? (prices?.[alertDialogSymbol] ?? 0) : 0;

  return (
    <PageShell
      title="Watchlist"
      subtitle="Track stocks you care about. All prices are simulated — not live market data. Set above/below price alerts and FinVerse flags them for you."
      active="Watchlist"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={!ready}
          className={pressable}
        >
          <RefreshCw className={cn("size-4", !reducedMotion && "transition-transform")} />
          Refresh prices
        </Button>
      }
    >
      {/* Add stock */}
      <div className="relative mb-5">
        <Label htmlFor="watchlist-add" className="sr-only">
          Add a stock to your watchlist
        </Label>
        <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-2 shadow-tile focus-within:border-ring">
          <Eye className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="watchlist-add"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add a stock — try RELIANCE, HDFCBANK, INFY…"
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-label="Add a stock to your watchlist"
            className="h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => setQuery("")}
              className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute inset-x-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-modal">
            {suggestions.map((s) => (
              <li key={s.symbol}>
                <button
                  type="button"
                  onClick={() => handleAdd(s.symbol)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Plus className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{s.symbol}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {s.name} · {s.sector}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    {formatINR(s.pricePaise)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Alert-evaluation honesty note */}
      <p className="mb-4 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
        <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          Price alerts are evaluated only when prices refresh — never tick-by-tick — so simulated
          price jitter can&apos;t flicker an alert on and off.{" "}
          {lastEvaluatedAt != null && (
            <span className="font-semibold text-foreground">
              Last checked{" "}
              {new Date(lastEvaluatedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              .
            </span>
          )}
        </span>
      </p>

      {isPending || prices === null ? (
        <div className="grid gap-2" aria-label="Loading watchlist">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load your watchlist"
          body={error instanceof Error ? error.message : "Check your connection and try again."}
          onRetry={() => refetch()}
        />
      ) : (entries ?? []).length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          body="Add stocks from the FinVerse universe and set price alerts so you never miss a move."
          actionLabel="Try adding RELIANCE"
          onAction={() => handleAdd("RELIANCE")}
        />
      ) : (
        <ul className="grid gap-2">
          {(entries ?? []).map((entry) => {
            const stock = getStock(entry.symbol);
            const ltp = prices?.[entry.symbol] ?? stock?.pricePaise ?? 0;
            const change = dayChange(genHistory(entry.symbol, 2));
            return (
              <li key={entry.symbol}>
                <MarketRow
                  symbol={entry.symbol}
                  name={stock?.name ?? entry.symbol}
                  pricePaise={ltp}
                  changePct={change.changePct}
                  starred
                  alerted={entry.alerts.length > 0}
                  onToggleStar={() => handleRemove(entry.symbol)}
                  onToggleAlert={() => setAlertDialogSymbol(entry.symbol)}
                  onClick={() =>
                    navigate({ to: "/stocks/$symbol", params: { symbol: entry.symbol } })
                  }
                  className="border border-border/60 bg-card shadow-card"
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* Price-alert sheet (bottom sheet on all viewports) */}
      <BottomSheet
        open={alertDialogSymbol !== null}
        onClose={() => setAlertDialogSymbol(null)}
        title={`Price alerts${alertDialogSymbol ? ` · ${alertDialogSymbol}` : ""}`}
        showCloseButton
      >
        <div className="px-1 pb-2">
          <p className="pb-4 text-sm leading-6 text-muted-foreground">
            FinVerse flags an alert the next time prices refresh and the condition is met. Simulated
            prices — not live market data.
          </p>

          {dialogEntry && dialogForm && (
            <div>
              {dialogEntry.alerts.length > 0 && (
                <ul className="mb-4 grid gap-2">
                  {dialogEntry.alerts.map((a) => {
                    const met = isAlertMet(a, dialogLtp);
                    return (
                      <li
                        key={a.id}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-xl border px-3 py-2",
                          met ? "border-success/50 bg-success-soft/60" : "border-border",
                        )}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          {met ? (
                            <BellRing className="size-4 shrink-0 text-success" aria-hidden />
                          ) : (
                            <Bell className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          )}
                          <span className="font-semibold text-foreground">
                            {a.kind === "above" ? "Above" : "Below"}{" "}
                            <span className="tabular-nums">{formatINR(a.pricePaise)}</span>
                          </span>
                          {met && <Badge className="bg-success text-white">Triggered</Badge>}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete alert ${a.kind} ${formatINR(a.pricePaise)}`}
                          className={pressable}
                          onClick={() =>
                            removeAlert.mutateRemoveAlert(dialogEntry.symbol, a.id, {
                              onError: () => toast.error("Couldn't delete the alert."),
                            })
                          }
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <Label className="sr-only" htmlFor="alert-kind">
                    Alert direction
                  </Label>
                  <Select
                    value={dialogForm.kind}
                    onValueChange={(v: AlertKind) =>
                      setAlertForm((f) => ({
                        ...f,
                        [dialogEntry.symbol]: { ...dialogForm, kind: v },
                      }))
                    }
                  >
                    <SelectTrigger id="alert-kind" className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above ₹</SelectItem>
                      <SelectItem value="below">Below ₹</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="sr-only" htmlFor="alert-price">
                    Alert price in rupees
                  </Label>
                  <Input
                    id="alert-price"
                    inputMode="decimal"
                    placeholder="e.g. 1600"
                    value={dialogForm.price}
                    onChange={(e) =>
                      setAlertForm((f) => ({
                        ...f,
                        [dialogEntry.symbol]: { ...dialogForm, price: e.target.value },
                      }))
                    }
                    className="w-32"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddAlert(dialogEntry.symbol)}
                  className={pressable}
                >
                  <Plus className="size-4" aria-hidden /> Set alert
                </Button>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      <Card className="mt-5 shadow-card">
        <CardContent className="py-4 text-xs leading-5 text-muted-foreground">
          Prices are simulated from the FinVerse demo market feed and jitter slightly on refresh —
          for learning, not trading.
        </CardContent>
      </Card>
    </PageShell>
  );
}
