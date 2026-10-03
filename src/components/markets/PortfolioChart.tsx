import { useMemo, useState } from "react";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/finance/format";
import { paiseAxisTick, paiseTicks } from "@/components/charts/money";
import { genHistory } from "@/lib/market/history";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { Pill } from "@/components/fv/Pill";
import {
  combineSeries,
  genIntraday,
  portfolioValueSeries,
  PORTFOLIO_RANGES,
  RANGE_TRADING_DAYS,
  shortDateLabel,
  type PortfolioRange,
  type SeriesPoint,
} from "./portfolio-math";

export interface PortfolioPosition {
  symbol: string;
  /** Whole units held. */
  qty: number;
}

function tooltipContent(
  active: boolean | undefined,
  label: string | undefined,
  points: SeriesPoint[],
) {
  if (!active || label === undefined) return null;
  const index = points.findIndex((p) => p.label === label);
  const p = points[index];
  if (!p) return null;
  const prev = index > 0 ? points[index - 1] : undefined;
  const changePct =
    prev && prev.valuePaise > 0 ? ((p.valuePaise - prev.valuePaise) / prev.valuePaise) * 100 : null;
  const up = changePct === null || changePct >= 0;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-card">
      <p className="font-semibold text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-bold text-foreground tabular-nums">{formatINR(p.valuePaise)}</p>
      {changePct !== null && (
        <p className={cn("font-bold tabular-nums", up ? "text-gain" : "text-loss")}>
          {up ? "+" : "−"}
          {Math.abs(changePct).toFixed(2)}%
        </p>
      )}
    </div>
  );
}

/**
 * Compact portfolio-value chart for the /portfolio summary card.
 *
 * Series semantics (labelled honestly below the chart): the value of the
 * *current* portfolio composition through each range — for daily ranges,
 * each holding's deterministic demo history multiplied by today's qty, but
 * starting at each holding's first recorded purchase (no fabricated
 * pre-purchase history); for 1D, a deterministic intraday path from the
 * last demo close to the current simulated LTP. The final point is always
 * the live simulated value ("Now").
 *
 * Rendered client-side only (lazy route-level gate): LTPs are jittered demo
 * prices resolved in an effect, so they must never feed SSR HTML.
 */
export function PortfolioChart({
  positions,
  ltpBySymbol,
  firstBuyDateISOBySymbol,
}: {
  positions: PortfolioPosition[];
  /** Simulated LTP per symbol, paise (client-resolved; null while loading). */
  ltpBySymbol: Record<string, number> | null;
  /**
   * First recorded BUY date ("YYYY-MM-DD") per symbol, parsed from the
   * ledger. Symbols without a recorded buy keep their full simulated
   * history ("unknown" is never presented as "bought today").
   */
  firstBuyDateISOBySymbol?: Record<string, string>;
}) {
  const [range, setRange] = useState<PortfolioRange>("1M");
  const reducedMotion = usePrefersReducedMotion();
  const gradId = useId();

  const points = useMemo<SeriesPoint[]>(() => {
    if (!ltpBySymbol || positions.length === 0) return [];
    const qtyBySymbol: Record<string, number> = {};
    const seriesBySymbol: Record<string, SeriesPoint[]> = {};
    const historyItems: {
      symbol: string;
      qty: number;
      closes: { date: string; closePaise: number }[];
      firstBuyDateISO?: string;
    }[] = [];
    for (const p of positions) {
      qtyBySymbol[p.symbol] = p.qty;
      const ltp = ltpBySymbol[p.symbol];
      if (ltp === undefined) continue;
      if (range === "1D") {
        const daily = genHistory(p.symbol, RANGE_TRADING_DAYS["1M"]);
        const prevClose = daily.length > 1 ? daily[daily.length - 2]!.closePaise : ltp;
        seriesBySymbol[p.symbol] = genIntraday(p.symbol, prevClose, ltp);
      } else {
        historyItems.push({
          symbol: p.symbol,
          qty: p.qty,
          closes: genHistory(p.symbol, RANGE_TRADING_DAYS[range]),
          ...(firstBuyDateISOBySymbol?.[p.symbol]
            ? { firstBuyDateISO: firstBuyDateISOBySymbol[p.symbol] }
            : {}),
        });
      }
    }
    // Anchor the series to the live simulated value: the last plotted point
    // is always what the summary card shows.
    const nowPaise = positions.reduce(
      (a, p) => a + Math.round(p.qty * (ltpBySymbol[p.symbol] ?? 0)),
      0,
    );
    if (range === "1D") {
      const combined = combineSeries(seriesBySymbol, qtyBySymbol);
      if (combined.length === 0) return combined;
      return [...combined, { label: "Now", valuePaise: nowPaise }];
    }
    // Daily ranges: date-aligned portfolio value; each holding contributes
    // only on/after its first recorded purchase — the series starts at the
    // first purchase, never with a fabricated pre-purchase past.
    const combined = portfolioValueSeries(historyItems).map((d) => ({
      label: shortDateLabel(d.date),
      valuePaise: d.valuePaise,
    }));
    if (combined.length === 0) return combined;
    return [...combined, { label: "Now", valuePaise: nowPaise }];
  }, [positions, ltpBySymbol, range, firstBuyDateISOBySymbol]);

  const first = points[0];
  const last = points[points.length - 1];
  const up = !first || !last || last.valuePaise >= first.valuePaise;
  const stroke = up ? "var(--gain)" : "var(--loss)";

  // Explicit ticks with deduped labels: recharts' auto ticks on a flat
  // series emit values that round to identical "₹X" labels. The domain is
  // pinned to the tick extent so every tick renders inside the axis.
  const yTicks = useMemo(() => paiseTicks(points.map((p) => p.valuePaise)), [points]);
  const yDomain: [number, number] | ["auto", "auto"] =
    yTicks.length >= 2 ? [yTicks[0]!, yTicks[yTicks.length - 1]!] : ["auto", "auto"];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <div role="group" aria-label="Portfolio value range" className="flex flex-wrap gap-1.5">
          {PORTFOLIO_RANGES.map((r) => (
            <Pill
              key={r}
              size="sm"
              variant={range === r ? "accent" : "neutral"}
              onClick={() => setRange(r)}
              label={`Show ${r} range`}
              className={cn(range !== r && "cursor-pointer hover:bg-muted")}
            >
              {r}
            </Pill>
          ))}
        </div>
      </div>

      <div
        className="h-44 sm:h-52"
        role="img"
        aria-label={
          first && last
            ? `Portfolio value, ${range}, ${first.label} to ${last.label}, ${up ? "up" : "down"} from ${formatINR(first.valuePaise)} to ${formatINR(last.valuePaise)}. Simulated demo data, not live prices.`
            : "Portfolio value chart loading"
        }
      >
        {points.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 5, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                minTickGap={48}
              />
              <YAxis
                domain={yDomain}
                {...(yTicks.length >= 2 ? { ticks: yTicks } : {})}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                // Values are integer paise — paiseAxisTick converts to rupees.
                // (A previous version formatted raw paise as ₹, inflating
                // every label 100×.)
                tickFormatter={paiseAxisTick}
                width={64}
              />
              <Tooltip
                content={({ active, label }) =>
                  tooltipContent(active, label as string | undefined, points)
                }
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="valuePaise"
                name="Value"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Building chart…
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Value of your current holdings at simulated prices — history starts at your first recorded
        purchase per stock. Not live market data.
      </p>
    </div>
  );
}
