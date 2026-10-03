/**
 * Simulated index instruments for the market strip.
 *
 * FinVerse has no live market feed: index values are illustrative, seeded
 * around plausible NIFTY/SENSEX/BANK NIFTY levels so the strip reads like a
 * real market surface. They are ALWAYS presented with the "Simulated data"
 * label — never as live prices.
 *
 * Prices feed the same deterministic history/jitter engine as stocks
 * (see ./history.ts), so indices support day-change and sparkline math.
 */

export interface IndexInfo {
  symbol: string;
  name: string;
  /** Integer paise per index point, e.g. ₹25,842 -> 2_584_200. */
  pricePaise: number;
}

export const INDICES: IndexInfo[] = [
  { symbol: "NIFTY50", name: "NIFTY 50", pricePaise: 2_584_200 },
  { symbol: "SENSEX", name: "SENSEX", pricePaise: 8_448_800 },
  { symbol: "BANKNIFTY", name: "BANK NIFTY", pricePaise: 5_872_400 },
];

const BY_SYMBOL = new Map(INDICES.map((i) => [i.symbol, i]));

/** Case-insensitive lookup. */
export function getIndex(symbol: string): IndexInfo | undefined {
  return BY_SYMBOL.get(symbol.toUpperCase());
}
