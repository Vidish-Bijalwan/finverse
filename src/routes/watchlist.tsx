import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BellRing,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { EmptyState, SectionCard } from "@/components/markets/shared";
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
  const { data: entries, isPending } = useWatchlist();
  const addStock = useAddToWatchlist();
  const removeStock = useRemoveFromWatchlist();
  const addAlert = useAddPriceAlert();
  const removeAlert = useRemovePriceAlert();
  const reducedMotion = usePrefersReducedMotion();

  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  // Per-stock inline alert form state: symbol -> {kind, price}
  const [alertForm, setAlertForm] = useState<Record<string, { kind: AlertKind; price: string }>>(
    {},
  );

  useEffect(() => {
    setPrices(Object.fromEntries((entries ?? []).map((e) => [e.symbol, getLTP(e.symbol)])));
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

  const ready = !isPending && prices !== null;

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

  return (
    <PageShell
      title="Watchlist"
      subtitle="Track stocks you care about at mock live prices. Set above/below price alerts and FinVerse flags them for you."
      active="Watchlist"
      actions={
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={!ready}>
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
        <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5 shadow-tile focus-within:border-ring">
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
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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

      {!ready ? (
        <div className="grid gap-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (entries ?? []).length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          body="Add stocks from the 41-stock FinVerse universe and set price alerts so you never miss a move."
          actionLabel="Try adding RELIANCE"
          onAction={() => handleAdd("RELIANCE")}
        />
      ) : (
        <div className="grid gap-4">
          {(entries ?? []).map((entry) => {
            const stock = getStock(entry.symbol);
            const ltp = prices?.[entry.symbol] ?? stock?.pricePaise ?? 0;
            const change = dayChange(genHistory(entry.symbol, 2));
            const up = change.changePaise >= 0;
            const form = alertForm[entry.symbol] ?? { kind: "above" as AlertKind, price: "" };
            return (
              <SectionCard
                key={entry.symbol}
                title={entry.symbol}
                action={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${entry.symbol} from watchlist`}
                    onClick={() =>
                      removeStock.mutateRemove(entry.symbol, {
                        onSuccess: () => toast.success(`${entry.symbol} removed.`),
                        onError: () => toast.error("Couldn't remove — try again."),
                      })
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <Link
                      to="/stocks/$symbol"
                      params={{ symbol: entry.symbol }}
                      className="font-bold text-primary hover:underline"
                    >
                      {entry.symbol}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {stock?.name ?? entry.symbol}
                      {stock ? ` · ${stock.sector}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {formatINR(ltp)}
                    </p>
                    <p
                      className={cn(
                        "flex items-center justify-end gap-1 text-xs font-bold tabular-nums",
                        up ? "text-success" : "text-destructive",
                      )}
                    >
                      {up ? (
                        <ArrowUpRight className="size-3.5" />
                      ) : (
                        <ArrowDownRight className="size-3.5" />
                      )}
                      {up ? "+" : "−"}₹
                      {Math.abs(Math.round(change.changePaise / 100)).toLocaleString("en-IN")} (
                      {up ? "+" : ""}
                      {change.changePct.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* Alerts */}
                <div className="mt-4 border-t border-border/60 pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Bell className="size-3.5" /> Price alerts ({entry.alerts.length})
                  </p>
                  {entry.alerts.length > 0 && (
                    <ul className="mb-3 grid gap-2">
                      {entry.alerts.map((a) => {
                        const met = isAlertMet(a, ltp);
                        return (
                          <li
                            key={a.id}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2",
                              met ? "border-success/50 bg-success-soft/60" : "border-border",
                            )}
                          >
                            <span className="flex items-center gap-2 text-sm">
                              {met ? (
                                <BellRing className="size-4 shrink-0 text-success" />
                              ) : (
                                <Bell className="size-4 shrink-0 text-muted-foreground" />
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
                              onClick={() =>
                                removeAlert.mutateRemoveAlert(entry.symbol, a.id, {
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
                      <Label className="sr-only" htmlFor={`alert-kind-${entry.symbol}`}>
                        Alert direction
                      </Label>
                      <Select
                        value={form.kind}
                        onValueChange={(v: AlertKind) =>
                          setAlertForm((f) => ({
                            ...f,
                            [entry.symbol]: { ...form, kind: v },
                          }))
                        }
                      >
                        <SelectTrigger id={`alert-kind-${entry.symbol}`} className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above ₹</SelectItem>
                          <SelectItem value="below">Below ₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="sr-only" htmlFor={`alert-price-${entry.symbol}`}>
                        Alert price in rupees
                      </Label>
                      <Input
                        id={`alert-price-${entry.symbol}`}
                        inputMode="decimal"
                        placeholder="e.g. 1600"
                        value={form.price}
                        onChange={(e) =>
                          setAlertForm((f) => ({
                            ...f,
                            [entry.symbol]: { ...form, price: e.target.value },
                          }))
                        }
                        className="w-32"
                      />
                    </div>
                    <Button size="sm" onClick={() => handleAddAlert(entry.symbol)}>
                      <Plus className="size-4" /> Set alert
                    </Button>
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      <Card className="mt-5 shadow-card">
        <CardContent className="py-4 text-xs leading-5 text-muted-foreground">
          Prices are simulated from the FinVerse demo market feed and jitter slightly on refresh —
          for learning, not trading.
        </CardContent>
      </Card>
    </PageShell>
  );
}
