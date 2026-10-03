import { getIndex } from "./indices";
import { getStock } from "./data";

/**
 * Deterministic demo price history.
 *
 * A mulberry32 PRNG seeded from the symbol hash drives a geometric random walk
 * that runs BACKWARDS from the stock's current pricePaise, so every series
 * ends exactly at the listed price. Same symbol + same day count => same
 * series, which keeps SSR and the browser in agreement.
 */

export interface PricePoint {
  /** Calendar date "YYYY-MM-DD" (trading days only). */
  date: string;
  /** Integer paise. */
  closePaise: number;
}

export type RangeKey = "1M" | "6M" | "1Y";

export const RANGE_DAYS: Record<RangeKey, number> = {
  "1M": 22,
  "6M": 126,
  "1Y": 252,
};

/** FNV-1a-ish string hash -> unsigned 32-bit int. */
function hashSymbol(symbol: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const isoDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function stepBackTradingDay(d: Date): void {
  do {
    d.setDate(d.getDate() - 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
}

/**
 * Generate `tradingDays` of history for a symbol, ending today at the stock's
 * listed pricePaise. Deterministic per symbol. Returns [] for unknown symbols.
 */
export function genHistory(symbol: string, tradingDays = RANGE_DAYS["1Y"]): PricePoint[] {
  const instrument = getStock(symbol) ?? getIndex(symbol);
  if (!instrument || tradingDays <= 0) return [];
  const rand = mulberry32(hashSymbol(symbol.toUpperCase()));
  const points: PricePoint[] = [];
  const d = new Date();
  let price = instrument.pricePaise;
  for (let i = 0; i < tradingDays; i++) {
    points.unshift({ date: isoDay(d), closePaise: Math.max(1, Math.round(price)) });
    stepBackTradingDay(d);
    // Reverse of a forward log-normal step with ~2.2% daily vol.
    const shock = (rand() - 0.5) * 2 * 0.022;
    price = price / (1 + shock);
  }
  return points;
}

/** Slice a full history down to a display range. */
export function sliceRange(history: PricePoint[], range: RangeKey): PricePoint[] {
  return history.slice(-RANGE_DAYS[range]);
}

/** Last-traded price with a tiny market-like jitter, cached per symbol. */
const ltpCache = new Map<string, number>();

function jittered(symbol: string): number {
  const instrument = getStock(symbol) ?? getIndex(symbol);
  if (!instrument) return 0;
  const jitter = (Math.random() - 0.5) * 2 * 0.006; // ±0.6%
  return Math.max(1, Math.round(instrument.pricePaise * (1 + jitter)));
}

/** Stable LTP for a symbol within this session (SSR-safe: pure function of cache). */
export function getLTP(symbol: string): number {
  const cached = ltpCache.get(symbol);
  if (cached !== undefined) return cached;
  const v = jittered(symbol);
  ltpCache.set(symbol, v);
  return v;
}

/** Force a fresh jittered LTP — powers the portfolio "refresh prices" button. */
export function refreshLTP(symbol: string): number {
  const v = jittered(symbol);
  ltpCache.set(symbol, v);
  return v;
}

/** Day change vs previous close, in paise and percent. */
export function dayChange(history: PricePoint[]): { changePaise: number; changePct: number } {
  if (history.length < 2) return { changePaise: 0, changePct: 0 };
  const last = history[history.length - 1].closePaise;
  const prev = history[history.length - 2].closePaise;
  return {
    changePaise: last - prev,
    changePct: prev === 0 ? 0 : ((last - prev) / prev) * 100,
  };
}
