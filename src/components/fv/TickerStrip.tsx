import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";
import { STOCKS } from "@/lib/market/data";
import { dayChange, genHistory, getLTP } from "@/lib/market/history";
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
 * Auto-scrolls via a CSS marquee, but renders as a plain scrollable strip
 * when the user prefers reduced motion (or pauses on hover/focus).
 * Tap/click a symbol → `/stocks/$symbol`.
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

  const items: TickerItem[] = useMemo(() => {
    return (symbols ?? DEFAULT_SYMBOLS).flatMap((sym) => {
      const stock = STOCKS.find((s) => s.symbol === sym);
      if (!stock) return [];
      const change = dayChange(genHistory(stock.symbol, 2));
      return [
        {
          symbol: stock.symbol,
          name: stock.name,
          pricePaise: getLTP(stock.symbol),
          changePct: change.changePct,
        },
      ];
    });
  }, [symbols]);

  const duration = Math.max(24, items.length * 4);

  const row = (hidden: boolean) => (
    <div className="flex w-max shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((it) => {
        const up = it.changePct >= 0;
        return (
          <Link
            key={`${hidden ? "dup-" : ""}${it.symbol}`}
            to="/stocks/$symbol"
            params={{ symbol: it.symbol }}
            tabIndex={hidden ? -1 : 0}
            aria-label={`${it.name} (${it.symbol}), simulated price, ${up ? "up" : "down"} ${Math.abs(it.changePct).toFixed(2)} percent`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5",
              "transition-colors hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-ring",
            )}
          >
            <span className="text-xs font-bold text-foreground">{it.symbol}</span>
            <NumberDisplay
              paise={it.pricePaise}
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
      className={cn("rounded-2xl border border-border bg-card shadow-card", className)}
    >
      <style>{`@keyframes fv-ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      {reducedMotion ? (
        <div className="flex gap-1 overflow-x-auto px-2 py-2">{row(false)}</div>
      ) : (
        <div className="overflow-hidden px-2 py-2 [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
          <div
            className="flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
            style={{ animation: `fv-ticker-scroll ${duration}s linear infinite` }}
          >
            {row(false)}
            {row(true)}
          </div>
        </div>
      )}
      <p className="border-t border-border/60 px-4 py-1.5 text-[11px] font-medium text-muted-foreground">
        Simulated prices — not live market data. For learning, not trading.
      </p>
    </section>
  );
}
