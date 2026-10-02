import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, Plus, RefreshCw, Star } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import {
  getStock,
  mcapBandOf,
  sectorMedianPE,
  sectorMedianReturn,
  MCAP_BANDS,
  type StockInfo,
} from "@/lib/market/data";
import {
  dayChange,
  genHistory,
  getLTP,
  refreshLTP,
  sliceRange,
  type PricePoint,
  type RangeKey,
} from "@/lib/market/history";
import { EmptyState } from "@/components/markets/shared";
import { PageShell } from "@/components/markets/PageShell";
import { HoldingDialog } from "@/components/markets/HoldingDialog";
import { useWatchlist } from "@/components/markets/useWatchlist";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stocks/$symbol")({
  head: ({ params }) => ({
    meta: [{ title: `${params.symbol} — FinVerse AI` }],
  }),
  component: StockDetailPage,
});

const RANGES: RangeKey[] = ["1M", "6M", "1Y"];

/** "2026-09-14" -> "14 Sep". Parsed manually to avoid TZ shifts. */
function shortDate(iso: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]}`;
}

type Verdict = "positive" | "neutral" | "negative";

interface AnalysisPoint {
  title: string;
  verdict: Verdict;
  verdictLabel: string;
  evidence: string[];
  confidence: "High" | "Medium" | "Low";
}

/** Deterministic rule-based analysis — explainable, no model involved. */
function analyze(stock: StockInfo): AnalysisPoint[] {
  const medianPE = sectorMedianPE(stock.sector);
  const medianRet = sectorMedianReturn(stock.sector);
  const points: AnalysisPoint[] = [];

  // 1. Valuation: P/E vs sector median
  const ratio = medianPE > 0 ? stock.pe / medianPE : 1;
  points.push(
    ratio < 0.8
      ? {
          title: "Valuation",
          verdict: "positive",
          verdictLabel: "Attractive vs peers",
          evidence: [
            `P/E ${stock.pe.toFixed(1)} is ${((1 - ratio) * 100).toFixed(0)}% below the ${stock.sector} sector median of ${medianPE.toFixed(1)} — you pay less per rupee of earnings than peers.`,
            `EPS of ${formatINR(stock.epsPaise)} with a ${stock.divYield.toFixed(2)}% dividend yield adds cash return on top of price.`,
          ],
          confidence: "Medium",
        }
      : ratio > 1.25
        ? {
            title: "Valuation",
            verdict: "negative",
            verdictLabel: "Expensive vs peers",
            evidence: [
              `P/E ${stock.pe.toFixed(1)} is ${((ratio - 1) * 100).toFixed(0)}% above the ${stock.sector} sector median of ${medianPE.toFixed(1)} — high growth expectations are already priced in.`,
              `At this multiple the stock needs sustained earnings growth to justify the price.`,
            ],
            confidence: "Medium",
          }
        : {
            title: "Valuation",
            verdict: "neutral",
            verdictLabel: "Fairly valued vs peers",
            evidence: [
              `P/E ${stock.pe.toFixed(1)} sits within ±25% of the ${stock.sector} sector median (${medianPE.toFixed(1)}).`,
              `Dividend yield ${stock.divYield.toFixed(2)}% provides a modest income component.`,
            ],
            confidence: "High",
          },
  );

  // 2. Momentum: 1Y return vs peers and vs zero
  const r = stock.oneYReturnPct;
  points.push(
    r > medianRet + 5 && r > 10
      ? {
          title: "Momentum",
          verdict: "positive",
          verdictLabel: "Strong momentum",
          evidence: [
            `1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% beats the ${stock.sector} sector median of ${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% by ${(r - medianRet).toFixed(1)} points.`,
            `The stock is closer to its 52-week high (${formatINR(stock.high52wPaise)}) than its low (${formatINR(stock.low52wPaise)}).`,
          ],
          confidence: "Medium",
        }
      : r < medianRet - 5 || r < -10
        ? {
            title: "Momentum",
            verdict: "negative",
            verdictLabel: "Weak momentum",
            evidence: [
              `1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% trails the ${stock.sector} sector median of ${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% — the market has been de-rating it.`,
              `Weak momentum can persist; check whether earnings, not just sentiment, are recovering before averaging down.`,
            ],
            confidence: "Medium",
          }
        : {
            title: "Momentum",
            verdict: "neutral",
            verdictLabel: "Moving with peers",
            evidence: [
              `1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% is within 5 points of the ${stock.sector} sector median (${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}%) — no strong trend either way.`,
            ],
            confidence: "High",
          },
  );

  // 3. Quality: ROE + leverage
  const roe = stock.roe;
  const de = stock.debtEquity;
  const lowLeverage = de === null || de <= 1;
  if (roe !== null && roe >= 15 && lowLeverage) {
    points.push({
      title: "Quality",
      verdict: "positive",
      verdictLabel: "High-quality business",
      evidence: [
        `ROE of ${roe.toFixed(1)}% shows strong returns on shareholder capital.`,
        de === null
          ? `Leverage is not meaningful for this ${stock.sector} business.`
          : `Debt-to-equity of ${de.toFixed(2)} keeps balance-sheet risk low.`,
      ],
      confidence: "High",
    });
  } else if ((roe !== null && roe < 8) || (de !== null && de > 1.5)) {
    const flags: string[] = [];
    if (roe !== null && roe < 8)
      flags.push(
        `ROE of ${roe.toFixed(1)}% is below the 8% quality bar — capital is not compounding well.`,
      );
    if (de !== null && de > 1.5)
      flags.push(
        `Debt-to-equity of ${de.toFixed(2)} is elevated — interest costs can eat earnings in a downturn.`,
      );
    points.push({
      title: "Quality",
      verdict: "negative",
      verdictLabel: "Quality flags",
      evidence: flags,
      confidence: "Medium",
    });
  } else {
    const parts: string[] = [];
    if (roe !== null)
      parts.push(`ROE of ${roe.toFixed(1)}% is decent but below the 15% high-quality bar.`);
    else
      parts.push(
        `ROE is not disclosed for this ${stock.sector} listing, so quality is judged on leverage alone.`,
      );
    if (de !== null) parts.push(`Debt-to-equity of ${de.toFixed(2)} is manageable.`);
    points.push({
      title: "Quality",
      verdict: "neutral",
      verdictLabel: "Average quality",
      evidence: parts,
      confidence: "Medium",
    });
  }

  return points;
}

const VERDICT_STYLE: Record<Verdict, string> = {
  positive: "bg-success-soft text-success",
  neutral: "bg-tint text-primary-dark",
  negative: "bg-destructive/10 text-destructive",
};

function Fundamentals({ stock }: { stock: StockInfo }) {
  const band = mcapBandOf(stock.marketCapCr);
  const items: Array<[string, string]> = [
    ["P/E ratio", stock.pe.toFixed(1)],
    ["EPS", formatINR(stock.epsPaise)],
    ["ROE", stock.roe === null ? "—" : `${stock.roe.toFixed(1)}%`],
    ["Debt / Equity", stock.debtEquity === null ? "—" : stock.debtEquity.toFixed(2)],
    [
      "Market cap",
      `${formatINRShort(stock.marketCapCr * 1_00_00_00_000)} (${MCAP_BANDS[band].label})`,
    ],
    ["Dividend yield", `${stock.divYield.toFixed(2)}%`],
    ["52-week high", formatINR(stock.high52wPaise)],
    ["52-week low", formatINR(stock.low52wPaise)],
    [
      "1-year return",
      `${stock.oneYReturnPct >= 0 ? "+" : "−"}${Math.abs(stock.oneYReturnPct).toFixed(1)}%`,
    ],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-surface-soft px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-bold text-primary-dark tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

function StockDetailPage() {
  const { symbol } = Route.useParams();
  const sym = symbol.toUpperCase();
  const stock = getStock(sym);
  const { isWatched, toggle } = useWatchlist();

  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [dialogOpen, setDialogOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  // Jittered LTP is client-only so SSR/hydration stay identical.
  const [ltp, setLtp] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (stock) setLtp(getLTP(sym));
  }, [stock, sym]);

  const history = useMemo(() => genHistory(sym), [sym]);
  const visible = useMemo(() => sliceRange(history, range), [history, range]);
  const change = useMemo(() => dayChange(history), [history]);

  if (!stock) {
    return (
      <PageShell title="Stock not found" active="Screener">
        <EmptyState
          title={`No data for "${symbol}"`}
          body="This symbol isn't in the FinVerse demo dataset. Try the screener to browse the 40 covered stocks."
        />
        <div className="mt-4 text-center">
          <Link to="/screener" className="text-sm font-bold text-primary hover:underline">
            ← Back to screener
          </Link>
        </div>
      </PageShell>
    );
  }

  const analysis = analyze(stock);
  const watched = isWatched(sym);
  const displayPrice = ltp ?? stock.pricePaise;
  const posInRange =
    stock.high52wPaise > stock.low52wPaise
      ? Math.max(
          0,
          Math.min(
            100,
            ((displayPrice - stock.low52wPaise) / (stock.high52wPaise - stock.low52wPaise)) * 100,
          ),
        )
      : 50;

  function handleRefresh() {
    setLtp(refreshLTP(sym));
  }

  const chartData = visible.map((p: PricePoint) => ({
    ...p,
    label: shortDate(p.date),
    rupees: p.closePaise / 100,
  }));
  const first = visible[0]?.closePaise ?? displayPrice;
  const up = displayPrice >= first;
  const stroke = up ? "var(--success)" : "var(--destructive)";

  return (
    <PageShell
      title={stock.name}
      active="Screener"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            aria-pressed={watched}
            aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
            onClick={() => toggle(sym)}
          >
            <Star className={watched ? "size-4 fill-amber-400 text-amber-400" : "size-4"} />
            <span className="hidden sm:inline">{watched ? "Watching" : "Watch"}</span>
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Add to portfolio
          </Button>
        </>
      }
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          to="/screener"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Screener
        </Link>
        <Badge variant="secondary">{stock.symbol}</Badge>
        <Badge variant="outline">{stock.sector}</Badge>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {ltp === null ? (
              <Skeleton className="h-10 w-44" />
            ) : (
              <p className="text-4xl font-black text-primary-dark tabular-nums">{formatINR(ltp)}</p>
            )}
            <button
              onClick={handleRefresh}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              aria-label="Refresh price"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
          <p
            className={cn(
              "mt-1 text-sm font-bold tabular-nums",
              change.changePaise >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {change.changePaise >= 0 ? "+" : "−"} {formatINR(Math.abs(change.changePaise))} (
            {change.changePaise >= 0 ? "+" : "−"}
            {Math.abs(change.changePct).toFixed(2)}% today)
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatINR(stock.low52wPaise)}</span>
            <span className="font-semibold text-foreground">52-week range</span>
            <span>{formatINR(stock.high52wPaise)}</span>
          </div>
          <div className="relative mt-1.5 h-2 rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary/40"
              style={{ width: `${posInRange}%` }}
            />
            <div
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary-dark"
              style={{ left: `${posInRange}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-primary-dark">Price history</h2>
          <div className="flex gap-1" role="tablist" aria-label="Chart range">
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {mounted ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  minTickGap={40}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`}
                  width={70}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [
                    v !== undefined
                      ? `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : "",
                    "Close",
                  ]}
                  labelFormatter={(label: string) => label}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Area
                  type="monotone"
                  dataKey="rupees"
                  stroke={stroke}
                  strokeWidth={2}
                  fill="url(#priceFill)"
                  isAnimationActive={!reducedMotion}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Skeleton className="h-72 rounded-lg" />
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Demo series generated deterministically per stock — not live market data.
        </p>
      </section>

      {/* Fundamentals */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
        <h2 className="mb-4 text-base font-bold text-primary-dark">Fundamentals</h2>
        <Fundamentals stock={stock} />
      </section>

      {/* AI analysis */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-tint">
            <Bot className="size-4.5 text-primary" />
          </span>
          <h2 className="text-base font-bold text-primary-dark">AI analysis</h2>
        </div>
        <p className="mb-5 text-xs text-muted-foreground">
          Rule-based reasoning over the figures above. Transparent by design — every claim cites its
          evidence.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {analysis.map((a) => (
            <Card key={a.title} className="border-border">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wide text-primary-dark">
                    {a.title}
                  </h3>
                  <Badge className={cn("whitespace-nowrap", VERDICT_STYLE[a.verdict])}>
                    {a.verdictLabel}
                  </Badge>
                </div>
                <ul className="mt-3 grid gap-2.5">
                  {a.evidence.map((e, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] leading-5.5 text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {e}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Confidence: <span className="text-foreground">{a.confidence}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-5 rounded-md bg-tint px-4 py-3 text-xs leading-5 text-muted-foreground">
          This is automated analysis of demo data for a college project — analysis, not financial
          advice. Real investing decisions should consider your full financial picture and, where
          needed, a registered investment adviser.
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Add {sym} to portfolio
        </Button>
        <Link to="/portfolio" className="text-sm font-bold text-primary hover:underline">
          View portfolio →
        </Link>
      </div>

      <HoldingDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultSymbol={sym} />
    </PageShell>
  );
}
