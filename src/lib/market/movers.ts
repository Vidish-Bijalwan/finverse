import type { PricePoint } from "./history";

/**
 * Pure market-mover + sparkline math for the market snapshot and watchlist
 * cards. All functions are deterministic and side-effect free; the simulated
 * price engine (`@/lib/market/history`) supplies the inputs.
 */

export interface MoverRow {
  symbol: string;
  name: string;
  /** Integer paise per unit. */
  pricePaise: number;
  /** Signed day change in percent. */
  changePct: number;
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
 * "Most active" by largest absolute day % move — the demo feed has no
 * traded-volume data, so swing size is the activity proxy. Biggest movers
 * first.
 */
export function mostActive(rows: MoverRow[], n = 3): MoverRow[] {
  return [...rows]
    .sort(
      (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct) || a.symbol.localeCompare(b.symbol),
    )
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
