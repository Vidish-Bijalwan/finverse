import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { NumberDisplay, pressable } from "@/components/fv";
import { getStock } from "@/lib/market/data";
import { getIndex, INDICES } from "@/lib/market/indices";
import { dayChange, genHistory, getLTP } from "@/lib/market/history";
import { formatINR } from "@/lib/finance/format";

interface StripItem {
  symbol: string;
  name: string;
  pricePaise: number;
  changePaise: number;
  changePct: number;
  /** Index items link to the watchlist (indices have no detail page); stocks link to their page. */
  kind: "index" | "stock";
}

/**
 * Market strip: indices + watched instruments in one compact, horizontally
 * scrollable row with scroll-snap.
 *
 * Each item shows symbol, price, absolute move and % move in muted
 * green/red. One quiet muted line labels the strip as simulated — the
 * feed is the seeded demo engine (`getLTP` / `genHistory`), never live
 * prices.
 *
 * Deliberately static: the old auto-scroll marquee rendered the first card
 * half-scrolled with overlapping text on load, so manual snap-scroll is the
 * only motion here.
 */
export function MarketStrip({
  symbols,
  className,
}: {
  /** Watched stock symbols appended after the indices. */
  symbols?: string[];
  className?: string;
}) {
  const items: StripItem[] = useMemo(() => {
    const list: StripItem[] = INDICES.map((idx) => {
      const change = dayChange(genHistory(idx.symbol, 2));
      return {
        symbol: idx.symbol,
        name: idx.name,
        pricePaise: getLTP(idx.symbol),
        changePaise: change.changePaise,
        changePct: change.changePct,
        kind: "index" as const,
      };
    });
    for (const sym of symbols ?? []) {
      const stock = getStock(sym);
      if (!stock || list.some((i) => i.symbol === stock.symbol)) continue;
      const change = dayChange(genHistory(stock.symbol, 2));
      list.push({
        symbol: stock.symbol,
        name: stock.name,
        pricePaise: getLTP(stock.symbol),
        changePaise: change.changePaise,
        changePct: change.changePct,
        kind: "stock",
      });
    }
    return list;
  }, [symbols]);

  const card = (it: StripItem) => {
    const up = it.changePct >= 0;
    const inner = (
      <>
        <span className="flex items-center gap-1.5">
          {up ? (
            <TrendingUp className="size-3.5 text-gain" aria-hidden />
          ) : (
            <TrendingDown className="size-3.5 text-loss" aria-hidden />
          )}
          <span className="text-xs font-bold tracking-wide text-foreground">{it.symbol}</span>
        </span>
        <NumberDisplay
          paise={it.pricePaise}
          className="text-sm font-bold tabular-nums text-foreground"
        />
        <span className="flex items-baseline gap-1.5 text-[11px] tabular-nums">
          <span className={cn("font-semibold", up ? "text-gain" : "text-loss")}>
            {up ? "+" : "−"}
            {formatINR(Math.abs(it.changePaise)).replace("₹", "")}
          </span>
          <span className={cn("font-bold", up ? "text-gain" : "text-loss")}>
            ({up ? "+" : "−"}
            {Math.abs(it.changePct).toFixed(2)}%)
          </span>
        </span>
      </>
    );
    const cls = cn(
      pressable,
      "flex w-40 shrink-0 snap-start flex-col gap-1 rounded-xl border border-border/70 bg-card px-3 py-2.5",
      "hover:border-primary/30",
    );
    const label = `${it.name}, simulated price ${formatINR(it.pricePaise)}, ${up ? "up" : "down"} ${Math.abs(it.changePct).toFixed(2)} percent`;
    return it.kind === "stock" ? (
      <Link
        key={it.symbol}
        to="/stocks/$symbol"
        params={{ symbol: it.symbol }}
        aria-label={label}
        className={cls}
      >
        {inner}
      </Link>
    ) : (
      <div key={it.symbol} role="img" aria-label={label} className={cn(cls, "cursor-default")}>
        {inner}
      </div>
    );
  };

  return (
    <section
      aria-label="Market strip — simulated data"
      className={cn("rounded-2xl border border-border/70 bg-card p-3", className)}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-foreground">Markets</h2>
        <span className="text-[11px] font-medium text-muted-foreground">
          Simulated prices — not live data
        </span>
      </div>
      <div className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {items.map(card)}
      </div>
    </section>
  );
}
