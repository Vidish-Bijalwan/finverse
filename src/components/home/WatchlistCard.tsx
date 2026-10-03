import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { EmptyState, ErrorState, Sparkline, pressable } from "@/components/fv";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWatchlist, WATCHLIST_QUERY_KEY } from "@/lib/watchlist";
import { FINVERSE_QUERY_DEFAULTS } from "@/lib/query";
import { getStock } from "@/lib/market/data";
import { dayChange, genHistory, getLTP } from "@/lib/market/history";
import { changePctLabel, directionForChangePct, sparklineValues } from "@/lib/market/movers";
import { formatINR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

const CARD = "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5";
const MAX_ROWS = 5;

interface WatchRow {
  symbol: string;
  name: string;
  initial: string;
  pricePaise: number;
  changePct: number;
  spark: number[];
}

/**
 * Compact watchlist card for the dashboard secondary column (brief §10):
 * ~5 rows of icon / name / ticker / price / daily change / tiny sparkline.
 * Tapping a row opens the stock detail page; full management lives on the
 * /watchlist page. Compact empty state stays ≤220px.
 */
export function WatchlistCard() {
  const navigate = useNavigate();
  const {
    data: entries,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: WATCHLIST_QUERY_KEY,
    queryFn: fetchWatchlist,
    ...FINVERSE_QUERY_DEFAULTS,
  });

  const rows: WatchRow[] = useMemo(
    () =>
      (entries ?? []).slice(0, MAX_ROWS).map((e) => {
        const stock = getStock(e.symbol);
        const h = genHistory(e.symbol, 22);
        return {
          symbol: e.symbol,
          name: stock?.name ?? e.symbol,
          initial: (stock?.name ?? e.symbol).charAt(0).toUpperCase(),
          pricePaise: getLTP(e.symbol),
          changePct: dayChange(h).changePct,
          spark: sparklineValues(h, 20),
        };
      }),
    [entries],
  );

  return (
    <section aria-label="Watchlist" className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold text-foreground">Watchlist</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Simulated prices — not live market data
          </p>
        </div>
        <Link
          to="/watchlist"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      {isLoading ? (
        <ul className="space-y-2" aria-label="Loading watchlist">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-3 w-1/3 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-20 rounded-lg" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <ErrorState
          title="Couldn't load your watchlist"
          body="Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Build your watchlist"
          body="Track stocks you care about."
          actionLabel="Explore stocks"
          onAction={() => void navigate({ to: "/watchlist" })}
        />
      ) : (
        <ul className="divide-y divide-border/60">
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
                    "-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/60",
                  )}
                >
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-tint text-sm font-black text-primary"
                  >
                    {r.initial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {r.name}
                    </span>
                    <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground">
                      {r.symbol}
                    </span>
                  </span>
                  <Sparkline
                    values={r.spark}
                    width={64}
                    height={26}
                    direction={directionForChangePct(r.changePct)}
                  />
                  <span className="flex w-20 shrink-0 flex-col items-end">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {formatINR(r.pricePaise)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-bold tabular-nums",
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
      )}
    </section>
  );
}
