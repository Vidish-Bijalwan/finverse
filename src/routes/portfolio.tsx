import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { getStock } from "@/lib/market/data";
import { getLTP, refreshLTP } from "@/lib/market/history";
import { EmptyState, PnlBadge, SectionCard } from "@/components/markets/shared";
import { PageShell } from "@/components/markets/PageShell";
import { HoldingDialog } from "@/components/markets/HoldingDialog";
import type { Holding } from "@/lib/finance/types";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [{ title: "Portfolio — FinVerse AI" }],
  }),
  component: PortfolioPage,
});

const DONUT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--success)",
  "#8b5cf6",
];

function PortfolioPage() {
  const { data: holdings, isPending } = useHoldings();
  const deleteHolding = useDeleteHolding();
  const reducedMotion = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [priceTick, setPriceTick] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | undefined>(undefined);
  const [deleting, setDeleting] = useState<Holding | undefined>(undefined);
  // LTPs are jittered demo prices (Math.random) — resolved client-side only so
  // SSR and hydration render identically.
  const [prices, setPrices] = useState<Record<string, number> | null>(null);

  useEffect(() => setMounted(true), []);

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

  function handleRefresh() {
    rows.forEach((r) => refreshLTP(r.holding.symbol));
    setPriceTick((t) => t + 1);
  }

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
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
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> Add holding
          </Button>
        </>
      }
    >
      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No holdings yet"
          body="Add the stocks you own — quantity and average buy price — and FinVerse will track their live value and profit or loss."
          actionLabel="Add your first holding"
          onAction={openAdd}
        />
      ) : (
        <div className="grid gap-5">
          {/* Totals */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-card">
              <CardContent className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Invested
                </p>
                <p className="mt-1.5 text-2xl font-black text-primary-dark tabular-nums">
                  {formatINR(totals.invested)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current value
                </p>
                <p className="mt-1.5 text-2xl font-black text-primary-dark tabular-nums">
                  {formatINR(totals.value)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total P&L
                </p>
                <div className="mt-1.5">
                  <PnlBadge pnlPaise={totals.pnl} pct={totals.pnlPct} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
            {/* Allocation donut */}
            <SectionCard title="Allocation by value">
              {mounted ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rows}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="58%"
                        outerRadius="88%"
                        paddingAngle={2}
                        strokeWidth={0}
                        isAnimationActive={!reducedMotion}
                      >
                        {rows.map((r, i) => (
                          <Cell key={r.holding.id} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number | undefined, name: string | undefined) => [
                          formatINR(v ?? 0),
                          name ?? "",
                        ]}
                        contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Skeleton className="h-64 rounded-lg" />
              )}
              <ul className="mt-3 grid gap-1.5">
                {rows.map((r, i) => (
                  <li key={r.holding.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      />
                      <span className="font-semibold">{r.holding.symbol}</span>
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {totals.value > 0 ? ((r.value / totals.value) * 100).toFixed(1) : "0.0"}% ·{" "}
                      {formatINRShort(r.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Holdings table */}
            <SectionCard title={`Holdings (${rows.length})`}>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Avg price</TableHead>
                      <TableHead className="text-right">LTP</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
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
                        <TableCell className="text-right tabular-nums">{r.holding.qty}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatINR(r.holding.avgPricePaise)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatINR(r.ltp)}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatINR(r.value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <PnlBadge pnlPaise={r.pnl} pct={r.pnlPct} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
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
                              aria-label={`Delete ${r.holding.symbol}`}
                              onClick={() => setDeleting(r.holding)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 md:hidden">
                {rows.map((r) => (
                  <Card key={r.holding.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to="/stocks/$symbol"
                            params={{ symbol: r.holding.symbol }}
                            className="font-bold text-primary"
                          >
                            {r.holding.symbol}
                          </Link>
                          <div className="text-xs text-muted-foreground">{r.name}</div>
                        </div>
                        <div className="flex gap-1">
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
                            aria-label={`Delete ${r.holding.symbol}`}
                            onClick={() => setDeleting(r.holding)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">Qty × Avg</dt>
                          <dd className="font-semibold tabular-nums">
                            {r.holding.qty} × {formatINR(r.holding.avgPricePaise)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">LTP</dt>
                          <dd className="font-semibold tabular-nums">{formatINR(r.ltp)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Value</dt>
                          <dd className="font-semibold tabular-nums">{formatINR(r.value)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">P&L</dt>
                          <dd>
                            <PnlBadge pnlPaise={r.pnl} pct={r.pnlPct} />
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      <HoldingDialog open={dialogOpen} onOpenChange={setDialogOpen} holding={editing} />

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
