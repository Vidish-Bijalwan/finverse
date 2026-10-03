import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";
import { STOCKS } from "@/lib/market/data";
import { getQuote } from "@/lib/market/quote";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Default strip: 12 largest Indian stocks by market cap. */
const DEFAULT_SYMBOLS = [...STOCKS]
  .sort((a, b) => b.marketCapCr - a.marketCapCr)
  .slice(0, 12)
  .map((s) => s.symbol);

interface TickerItem {
  symbol: string;
  name: string;
  pricePaise: number;
  changePct: number;
}

/**
 * Horizontally scrollable market ticker: symbol + simulated LTP + day-change
 * chip. Prices come from the seeded demo feed (`getLTP`) — the strip is always
 * labeled "Simulated prices", never presented as live market data.
 *
 * Prices refresh every 5s; changed rows flash green/red for 300ms and the
 * price glides to its new value via NumberDisplay's `animate` prop (both
 * skipped for prefers-reduced-motion).
 *
 * The strip is a plain horizontally-scrollable row — each symbol appears
 * exactly once. Tap/click a symbol → `/stocks/$symbol`.
 */
export function TickerStrip({
  symbols,
  className,
}: {
  /** Override the default top-12 symbols. */
  symbols?: string[];
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});
  const prevPrices = useRef<Record<string, number>>({});

  // Demo feed refresh — the interval itself isn't motion; the flash/tween are.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  const items: TickerItem[] = useMemo(() => {
    void tick; // 5s demo refresh — forces a recompute of simulated LTPs
    return (symbols ?? DEFAULT_SYMBOLS).flatMap((sym) => {
      const stock = STOCKS.find((s) => s.symbol === sym);
      if (!stock) return [];
      // Single quote source (lib/market/quote.ts): displayed price and %
      // share one basis, matching the market strip + snapshot.
      const q = getQuote(stock.symbol);
      if (!q) return [];
      return [
        {
          symbol: stock.symbol,
          name: stock.name,
          pricePaise: q.pricePaise,
          changePct: q.changePct,
        },
      ];
    });
  }, [symbols, tick]);

  // Diff against the previous tick → 300ms green/red flash on movers.
  useEffect(() => {
    const next: Record<string, number> = {};
    const f: Record<string, "up" | "down"> = {};
    for (const it of items) {
      next[it.symbol] = it.pricePaise;
      const prev = prevPrices.current[it.symbol];
      if (prev !== undefined && prev !== it.pricePaise && !reducedMotion) {
        f[it.symbol] = it.pricePaise > prev ? "up" : "down";
      }
    }
    prevPrices.current = next;
    if (Object.keys(f).length === 0) return;
    setFlash(f);
    const t = window.setTimeout(() => setFlash({}), 300);
    return () => window.clearTimeout(t);
  }, [items, reducedMotion]);

  /**
   * One row, each symbol exactly once. (A previous marquee implementation
   * rendered the list twice for a seamless loop — visually the same 12 stocks
   * appeared twice, which read as a bug. The strip is now a plain
   * horizontally-scrollable row.)
   */
  const row = () => (
    <div className="flex w-max shrink-0 items-center">
      {items.map((it) => {
        const up = it.changePct >= 0;
        const f = flash[it.symbol];
        return (
          <Link
            key={it.symbol}
            to="/stocks/$symbol"
            params={{ symbol: it.symbol }}
            aria-label={`${it.name} (${it.symbol}), simulated price, ${up ? "up" : "down"} ${Math.abs(it.changePct).toFixed(2)} percent`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5",
              "transition-colors duration-300 hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-ring",
              f === "up" && "bg-gain/25",
              f === "down" && "bg-loss/25",
            )}
          >
            <span className="text-xs font-bold text-foreground">{it.symbol}</span>
            <NumberDisplay
              paise={it.pricePaise}
              animate
              className="text-xs font-semibold text-muted-foreground"
            />
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                up ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
              )}
            >
              {up ? "+" : "−"}
              {Math.abs(it.changePct).toFixed(2)}%
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <section
      aria-label="Market ticker — simulated prices"
      className={cn("rounded-[14px] border border-border bg-card shadow-card", className)}
    >
      <div className="flex gap-1 overflow-x-auto px-2 py-2">{row()}</div>
      <p className="border-t border-border/60 px-4 py-1.5 text-[11px] font-medium text-muted-foreground">
        Simulated prices — not live market data. For learning, not trading.
      </p>
    </section>
  );
}
