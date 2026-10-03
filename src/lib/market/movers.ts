import type { PricePoint } from "./history";

/**
 * Pure market-mover + sparkline math for the market snapshot and watchlist
 * cards. All functions are deterministic and side-effect free; the simulated
 * price engine (`@/lib/market/history`) supplies the inputs.
 */

/** Sparkline stroke direction: the day's direction vs previous close. */
export type SparklineDirection = "up" | "down" | "flat";

/**
 * Map a day changePct to the sparkline's direction color. Near-zero moves
 * (|changePct| < 0.05) render muted-flat so a −0.01% day doesn't scream green
 * or red.
 */
export function directionForChangePct(changePct: number): SparklineDirection {
  if (Math.abs(changePct) < 0.05) return "flat";
  return changePct > 0 ? "up" : "down";
}

export interface MoverRow {
  symbol: string;
  name: string;
  /** Integer paise per unit. */
  pricePaise: number;
  /** Signed day change in percent. */
  changePct: number;
  /**
   * Intraday range as % of the series' first value (max − min over the recent
   * sparkline series). Powers `mostActive`'s activity ranking; rows without
   * it fall back to |changePct|.
   */
  rangePct?: number;
}

/** Stable ordering: primary key, then symbol (ascending) for determinism. */
function byChangeDesc(a: MoverRow, b: MoverRow): number {
  return b.changePct - a.changePct || a.symbol.localeCompare(b.symbol);
}

/** Top `n` day-gainers, largest % move first. */
export function topGainers(rows: MoverRow[], n = 3): MoverRow[] {
  return [...rows].sort(byChangeDesc).slice(0, Math.max(0, n));
}

/** Top `n` day-losers, worst % move first. */
export function topLosers(rows: MoverRow[], n = 3): MoverRow[] {
  return [...rows]
    .sort((a, b) => a.changePct - b.changePct || a.symbol.localeCompare(b.symbol))
    .slice(0, Math.max(0, n));
}

/**
 * Day change of a displayed (possibly jittered) LTP vs the previous close,
 * in percent: `(ltp − prevClose) / prevClose × 100`. 0 when the previous
 * close is 0 or missing (falls back to the LTP itself).
 *
 * Mover rows must compute changePct on the SAME price basis they display.
 * Mixing a jittered LTP price with a changePct computed against the static
 * listed close shows a price and a % that disagree with each other (they can
 * even point in opposite directions), so every consumer builds its rows
 * with this helper.
 */
export function ltpChangePct(ltpPaise: number, prevClosePaise: number | undefined): number {
  const prev = prevClosePaise ?? ltpPaise;
  if (prev === 0) return 0;
  return ((ltpPaise - prev) / prev) * 100;
}

export interface MoverSplit {
  gainers: MoverRow[];
  losers: MoverRow[];
}

/**
 * Split ONE consistent snapshot into top gainers + top losers.
 *
 * Both lists are derived from the same `rows` array in a single sort, so
 * they are mutually exclusive by construction: a symbol appears in at most
 * one list, with the same price/change everywhere it appears. (Naively
 * slicing both ends of a small universe can put the middle row in both
 * lists — the losers side explicitly excludes gainer symbols.)
 */
export function splitMovers(rows: MoverRow[], n = 3): MoverSplit {
  const k = Math.max(0, n);
  if (k === 0 || rows.length === 0) return { gainers: [], losers: [] };
  const sorted = [...rows].sort(byChangeDesc);
  const gainers = sorted.slice(0, k);
  const gainerSymbols = new Set(gainers.map((r) => r.symbol));
  const losers = sorted
    .filter((r) => !gainerSymbols.has(r.symbol))
    .slice(-k)
    .reverse();
  return { gainers, losers };
}

/**
 * Intraday range of a price series as % of its first value:
 * `(max − min) / first × 100`. The demo engine exposes no high/low candles
 * or traded volume, so the swing of the recent series is the activity proxy.
 * Returns 0 for series shorter than 2 points or a zero first value.
 */
export function rangePctOf(values: number[]): number {
  if (values.length < 2) return 0;
  const first = values[0]!;
  if (first === 0) return 0;
  return ((Math.max(...values) - Math.min(...values)) / first) * 100;
}

/**
 * "Most active" by largest intraday range — the demo engine has no
 * traded-volume data, so series swing (max−min over the recent series, via
 * `rangePct`) is the activity proxy. Rows without `rangePct` fall back to
 * |changePct| so the function stays total on plain MoverRows. Biggest swing
 * first; deterministic tiebreak on symbol. Genuinely distinct from
 * `topGainers`: a steady climber ranks high there but low here, while a
 * volatile stock that closed near flat ranks high here but low there.
 */
export function mostActive(rows: MoverRow[], n = 3): MoverRow[] {
  const activity = (r: MoverRow) => r.rangePct ?? Math.abs(r.changePct);
  return [...rows]
    .sort((a, b) => activity(b) - activity(a) || a.symbol.localeCompare(b.symbol))
    .slice(0, Math.max(0, n));
}

/**
 * Downsample a price history to at most `points` values (paise) for a tiny
 * sparkline. Always keeps the first and last points so the spark's direction
 * matches the series' direction; evenly spaced in between.
 */
export function sparklineValues(history: PricePoint[], points = 20): number[] {
  if (points <= 0) return [];
  if (history.length <= points) return history.map((p) => p.closePaise);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const idx = Math.round((i * (history.length - 1)) / (points - 1));
    out.push(history[idx]!.closePaise);
  }
  return out;
}

/**
 * Map values to an SVG path within a `width`×`height` viewport (padding
 * `pad` on each side). Y is inverted for SVG. A flat series (all values
 * equal) renders as a horizontal midline — never NaN.
 */
export function sparklinePath(values: number[], width: number, height: number, pad = 2): string {
  if (values.length === 0 || width <= 2 * pad || height <= 2 * pad) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max === min;
  const span = flat ? 1 : max - min;
  const xStep = values.length === 1 ? 0 : (width - 2 * pad) / (values.length - 1);
  const round1 = (v: number) => Math.round(v * 10) / 10;
  const pts = values.map((v, i) => {
    const x = pad + i * xStep;
    // A flat series sits on the midline rather than the top edge.
    const y = flat ? height / 2 : pad + ((max - v) / span) * (height - 2 * pad);
    return `${round1(x)},${round1(y)}`;
  });
  return `M${pts.join(" L")}`;
}

/** Signed percent label with an Indian minus sign, e.g. "+2.34%" / "−2.34%". */
export function changePctLabel(changePct: number): string {
  const up = changePct >= 0;
  return `${up ? "+" : "−"}${Math.abs(changePct).toFixed(2)}%`;
}
