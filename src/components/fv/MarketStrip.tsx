import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
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
 * scrollable row.
 *
 * Each item shows symbol, price, absolute move and % move in muted
 * green/red. One compact "SIMULATED DATA" pill labels the whole strip — the
 * feed is the seeded demo engine (`getLTP` / `genHistory`), never live
 * prices.
 *
 * Motion: the row auto-scrolls as a marquee that pauses on hover or focus;
 * prefers-reduced-motion renders a plain scrollable row instead.
 */
export function MarketStrip({
  symbols,
  className,
}: {
  /** Watched stock symbols appended after the indices. */
  symbols?: string[];
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

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

  // Reduced motion: a plain horizontally-scrollable row, no auto-scroll.
  if (reducedMotion) {
    return (
      <section
        aria-label="Market strip — simulated data"
        className={cn("rounded-2xl border border-border/70 bg-card p-3", className)}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-foreground">Markets</h2>
          <SimulatedPill />
        </div>
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">{items.map(card)}</div>
      </section>
    );
  }

  return (
    <section
      aria-label="Market strip — simulated data"
      className={cn(
        "group/strip overflow-hidden rounded-2xl border border-border/70 bg-card p-3",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-foreground">Markets</h2>
        <SimulatedPill />
      </div>
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "fv-marquee flex w-max gap-2",
            paused && "[animation-play-state:paused]",
            "group-focus-within/strip:[animation-play-state:paused]",
          )}
        >
          {items.map(card)}
          {/* Seamless-loop duplicate: decorative, never interactive. */}
          <div aria-hidden="true" className="flex w-max gap-2">
            {items.map((it) => (
              <div
                key={`dup-${it.symbol}`}
                className="flex w-40 shrink-0 flex-col gap-1 rounded-xl border border-border/70 bg-card px-3 py-2.5"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-wide text-foreground">
                    {it.symbol}
                  </span>
                </span>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {formatINR(it.pricePaise)}
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {it.changePct >= 0 ? "+" : "−"}
                  {Math.abs(it.changePct).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** One compact pill labels the whole strip — never a full-width disclaimer. */
function SimulatedPill() {
  return (
    <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      Simulated data
    </span>
  );
}
