import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteHolding, useHoldings } from "@/lib/finance/hooks";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { toast } from "sonner";
import { getStock, STOCKS } from "@/lib/market/data";
import { getLTP, refreshLTP } from "@/lib/market/history";
import { PageShell } from "@/components/markets/PageShell";
import { HoldingDialog } from "@/components/markets/HoldingDialog";
import {
  DonutAllocation,
  EmptyState,
  ErrorState,
  HoldingRow,
  NumberDisplay,
  SearchDropdown,
  StatBand,
  TestModeBanner,
  TickerStrip,
  type StatBandStat,
} from "@/components/fv";
import type { Holding } from "@/lib/finance/types";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [{ title: "Portfolio — FinVerse AI" }],
  }),
  component: PortfolioPage,
});

/** Per-holding dividend-yield overrides (percent), persisted by holding id. */
const DIVIDEND_KEY = "finverse:dividends:v1";

function loadDividendYields(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DIVIDEND_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function useDividendYields() {
  const [yields, setYields] = useState<Record<string, number>>({});
  useEffect(() => setYields(loadDividendYields()), []);
  const setYield = (holdingId: string, pct: number) => {
    if (!Number.isFinite(pct)) return;
    const clamped = Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
    setYields((prev) => {
      const next = { ...prev, [holdingId]: clamped };
      try {
        window.localStorage.setItem(DIVIDEND_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable — keep the in-memory value.
      }
      return next;
    });
  };
  return { yields, setYield };
}

function PortfolioPage() {
  const navigate = useNavigate();
  const { data: holdings, isPending, isError, refetch } = useHoldings();
  const deleteHolding = useDeleteHolding();
  const { yields: dividendYields, setYield: setDividendYield } = useDividendYields();

  const [priceTick, setPriceTick] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | undefined>(undefined);
  const [deleting, setDeleting] = useState<Holding | undefined>(undefined);
  const [investOpen, setInvestOpen] = useState(false);
  const [investQuery, setInvestQuery] = useState("");
  // LTPs are jittered demo prices (Math.random) — resolved client-side only so
  // SSR and hydration render identically.
  const [prices, setPrices] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    setPrices(Object.fromEntries((holdings ?? []).map((h) => [h.symbol, getLTP(h.symbol)])));
  }, [holdings, priceTick]);

  const rows = useMemo(() => {
    if (!prices) return [];
    return (holdings ?? []).map((h) => {
      const stock = getStock(h.symbol);
      const ltp = prices[h.symbol] ?? stock?.pricePaise ?? 0;
      const invested = Math.round(h.qty * h.avgPricePaise);
      const value = Math.round(h.qty * ltp);
      const pnl = value - invested;
      return {
        holding: h,
        stock,
        name: stock?.name ?? h.symbol,
        ltp,
        invested,
        value,
        pnl,
        pnlPct: invested > 0 ? (pnl / invested) * 100 : 0,
      };
    });
  }, [holdings, prices]);

  const ready = !isPending && prices !== null;

  const totals = useMemo(() => {
    const invested = rows.reduce((a, r) => a + r.invested, 0);
    const value = rows.reduce((a, r) => a + r.value, 0);
    const pnl = value - invested;
    return { invested, value, pnl, pnlPct: invested > 0 ? (pnl / invested) * 100 : 0 };
  }, [rows]);

  /** Per-holding dividend yield (editable override, else the stock's listed
   *  yield, else 1%) and the expected annual dividend at the current LTP. */
  const dividendRows = useMemo(
    () =>
      rows.map((r) => {
        const yieldPct = dividendYields[r.holding.id] ?? r.stock?.divYield ?? 1.0;
        const annualPaise = Math.round(r.holding.qty * r.ltp * (yieldPct / 100));
        return { ...r, yieldPct, annualPaise };
      }),
    [rows, dividendYields],
  );

  const dividendTotals = useMemo(() => {
    const annual = dividendRows.reduce((a, r) => a + r.annualPaise, 0);
    return {
      annual,
      avgYieldPct: totals.value > 0 ? (annual / totals.value) * 100 : 0,
    };
  }, [dividendRows, totals.value]);

  /** "Invest" entry: stock search over the demo dataset -> stock detail page. */
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

  const stats: StatBandStat[] = [
    {
      label: "Current value",
      value: <NumberDisplay paise={totals.value} className="text-lg font-bold" />,
    },
    {
      label: "Invested",
      value: <NumberDisplay paise={totals.invested} className="text-lg font-bold" />,
    },
    {
      label: "Total P&L",
      value: <NumberDisplay paise={totals.pnl} signed className="text-lg font-bold" />,
      sub: `${totals.pnl >= 0 ? "+" : "−"}${Math.abs(totals.pnlPct).toFixed(2)}%`,
      tone: totals.pnl >= 0 ? "gain" : "loss",
    },
  ];

  function handleRefresh() {
    rows.forEach((r) => refreshLTP(r.holding.symbol));
    setPriceTick((t) => t + 1);
  }

  function openInvest() {
    setInvestQuery("");
    setInvestOpen(true);
  }

  function goToStock(symbol: string) {
    setInvestOpen(false);
    navigate({ to: "/stocks/$symbol", params: { symbol } });
  }

  return (
    <PageShell
      title="Portfolio"
      subtitle="Your equity holdings, valued at demo last-traded prices. Prices jitter slightly on refresh to simulate a live market feed."
      active="Portfolio"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!ready || rows.length === 0}
          >
            <RefreshCw className="size-4" /> Refresh prices
          </Button>
          <Button size="sm" onClick={openInvest}>
            <Plus className="size-4" /> Invest
          </Button>
        </>
      }
    >
      <TickerStrip className="mb-5" />
      <TestModeBanner className="mb-5" />

      {isError ? (
        <ErrorState
          title="Couldn't load your portfolio"
          body="Your holdings couldn't be fetched. Check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : !ready ? (
        <div className="grid gap-5">
          <Skeleton className="h-24 rounded-2xl" />
          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No holdings yet"
          body="Invest in a stock to start building your portfolio — every order is simulated and posts to your shared ledger, so your money view always stays in sync."
          actionLabel="Invest in a stock"
          onAction={openInvest}
        />
      ) : (
        <div className="grid gap-5">
          <StatBand stats={stats} />

          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <DonutAllocation
              items={rows.map((r) => ({ label: r.holding.symbol, paise: r.value }))}
            />

            <section
              aria-label={`Holdings (${rows.length})`}
              className="rounded-2xl border border-border bg-card p-3 shadow-card sm:p-4"
            >
              <h2 className="px-2 pt-1 text-base font-bold text-primary-dark">
                Holdings ({rows.length})
              </h2>
              <ul className="mt-1 grid gap-1">
                {rows.map((r) => (
                  <li key={r.holding.id} className="flex items-center gap-1">
                    <HoldingRow
                      className="min-w-0 flex-1"
                      symbol={r.holding.symbol}
                      name={r.name}
                      qty={r.holding.qty}
                      avgPaise={Math.round(r.holding.avgPricePaise)}
                      ltpPaise={r.ltp}
                      onClick={() =>
                        navigate({
                          to: "/stocks/$symbol",
                          params: { symbol: r.holding.symbol },
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${r.holding.symbol}`}
                      onClick={() => {
                        setEditing(r.holding);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${r.holding.symbol}`}
                      onClick={() => setDeleting(r.holding)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Dividends */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="mb-1 text-base font-bold text-primary-dark">Dividends</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Expected annual dividends at current prices. Tap a yield to adjust it per holding —
              FinVerse remembers your overrides.
            </p>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <Card className="shadow-card">
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Expected annual dividends
                  </p>
                  <p className="mt-1.5 text-2xl font-black text-primary-dark tabular-nums">
                    {formatINR(dividendTotals.annual)}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Portfolio dividend yield
                  </p>
                  <p className="mt-1.5 text-2xl font-black text-primary-dark tabular-nums">
                    {dividendTotals.avgYieldPct.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Yield %</TableHead>
                    <TableHead className="text-right">Est. annual dividend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividendRows.map((r) => (
                    <TableRow key={r.holding.id}>
                      <TableCell>
                        <Link
                          to="/stocks/$symbol"
                          params={{ symbol: r.holding.symbol }}
                          className="font-bold text-primary hover:underline"
                        >
                          {r.holding.symbol}
                        </Link>
                        <div className="text-xs text-muted-foreground">{r.name}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <label
                          className="sr-only"
                          htmlFor={`div-yield-${r.holding.id}`}
                        >{`Dividend yield for ${r.holding.symbol}`}</label>
                        <input
                          id={`div-yield-${r.holding.id}`}
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={r.yieldPct}
                          onChange={(e) => setDividendYield(r.holding.id, Number(e.target.value))}
                          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-right text-sm tabular-nums text-foreground focus:border-ring focus:outline-none"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatINR(r.annualPaise)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      )}

      {/* Invest: stock search -> stock detail */}
      <Dialog open={investOpen} onOpenChange={setInvestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invest</DialogTitle>
            <DialogDescription>
              Pick a stock to open its detail page and place a simulated order.
            </DialogDescription>
          </DialogHeader>
          <SearchDropdown
            groups={investGroups}
            value={investQuery}
            onChange={setInvestQuery}
            onSelect={(item) => goToStock(item.id)}
            placeholder="Search stocks by name, symbol, sector…"
          />
          <p className="text-xs text-muted-foreground">
            Prices shown are simulated demo prices — not live market data.
          </p>
        </DialogContent>
      </Dialog>

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
  );
}
