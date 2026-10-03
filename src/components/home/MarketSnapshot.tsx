import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Sparkline, pressable } from "@/components/fv";
import { INDICES } from "@/lib/market/indices";
import { STOCKS } from "@/lib/market/data";
import { genHistory } from "@/lib/market/history";
import { getQuote } from "@/lib/market/quote";
import {
  changePctLabel,
  directionForChangePct,
  mostActive,
  rangePctOf,
  sparklineValues,
  splitMovers,
  type MoverRow,
} from "@/lib/market/movers";
import { formatINR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

const CARD = "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5";

interface IndexCard {
  name: string;
  pricePaise: number;
  changePct: number;
  spark: number[];
}

function IndexCards({ indices }: { indices: IndexCard[] }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="list" aria-label="Market indices">
      {indices.map((idx) => {
        const up = idx.changePct >= 0;
        return (
          <div
            key={idx.name}
            role="listitem"
            className="min-w-0 rounded-xl border border-border/60 bg-surface-soft px-2.5 py-2"
          >
            <p className="truncate text-[11px] font-bold tracking-wide text-muted-foreground">
              {idx.name}
            </p>
            <p className="mt-0.5 truncate text-sm font-bold tabular-nums text-foreground">
              {formatINR(idx.pricePaise)}
            </p>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span
                className={cn("text-[11px] font-bold tabular-nums", up ? "text-gain" : "text-loss")}
              >
                {changePctLabel(idx.changePct)}
              </span>
              <Sparkline
                values={idx.spark}
                width={56}
                height={22}
                direction={directionForChangePct(idx.changePct)}
                className="hidden min-[420px]:block"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MoverRows({ rows }: { rows: MoverRow[] }) {
  return (
    <ul className="space-y-0.5">
      {rows.map((r) => {
        const up = r.changePct >= 0;
        return (
          <li key={r.symbol}>
            <Link
              to="/stocks/$symbol"
              params={{ symbol: r.symbol }}
              aria-label={`${r.name} (${r.symbol}), simulated price ${formatINR(r.pricePaise)}, ${up ? "up" : "down"} ${Math.abs(r.changePct).toFixed(2)} percent — open details`}
              className={cn(
                pressable,
                "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-foreground">{r.name}</span>
                <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground">
                  {r.symbol}
                </span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {formatINR(r.pricePaise)}
                </span>
                <span
                  className={cn(
                    "min-w-16 text-right text-sm font-bold tabular-nums",
                    up ? "text-gain" : "text-loss",
                  )}
                >
                  {changePctLabel(r.changePct)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MoverGroup({ label, rows }: { label: string; rows: MoverRow[] }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <MoverRows rows={rows} />
    </div>
  );
}

/**
 * Market snapshot (brief §9): index cards for NIFTY 50 / SENSEX / BANK NIFTY
 * with sparklines, then Top Gainers / Top Losers / Most Active lists. Every
 * stock row navigates to the stock detail page. Indices have no detail page
 * (same as the market strip) and render as static cards.
 *
 * One quiet muted line marks the section as simulated — the seeded demo
 * engine, never live prices.
 */
export function MarketSnapshot() {
  const { indices, gainers, losers, active } = useMemo(() => {
    // Index cards read the ONE shared quote (lib/market/quote.ts) — the same
    // source the market strip uses — so the two can never show different %
    // values for one index.
    const idx: IndexCard[] = INDICES.map((i) => {
      const q = getQuote(i.symbol)!;
      const h = genHistory(i.symbol, 22);
      return {
        name: i.name,
        pricePaise: q.pricePaise,
        changePct: q.changePct,
        spark: sparklineValues(h, 20),
      };
    });
    const seen = new Set<string>();
    const rows: MoverRow[] = [];
    for (const s of STOCKS) {
      // Defensive dedupe: one row per symbol, so a symbol can never appear
      // twice in the mover lists even if the dataset ever duplicates one.
      if (seen.has(s.symbol)) continue;
      seen.add(s.symbol);
      const q = getQuote(s.symbol);
      if (!q) continue;
      // genHistory is deterministic per symbol; the 22-day history feeds the
      // sparkline/range while price + % come from the shared quote.
      const h = genHistory(s.symbol, 22);
      rows.push({
        symbol: s.symbol,
        name: s.name,
        pricePaise: q.pricePaise,
        changePct: q.changePct,
        rangePct: rangePctOf(sparklineValues(h, 20)),
      });
    }
    // Gainers + losers are split from this ONE rows array — mutually
    // exclusive by construction (see splitMovers).
    const { gainers, losers } = splitMovers(rows, 3);
    return {
      indices: idx,
      gainers,
      losers,
      active: mostActive(rows, 3),
    };
  }, []);

  return (
    <section aria-label="Market snapshot" className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold text-foreground">Market snapshot</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Simulated prices — not live market data
          </p>
        </div>
        <Link
          to="/screener"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          All stocks <span aria-hidden>→</span>
        </Link>
      </div>
      <IndexCards indices={indices} />
      <div className="mt-4 space-y-3.5">
        <MoverGroup label="Top gainers" rows={gainers} />
        <MoverGroup label="Top losers" rows={losers} />
        <MoverGroup label="Most active" rows={active} />
      </div>
    </section>
  );
}
