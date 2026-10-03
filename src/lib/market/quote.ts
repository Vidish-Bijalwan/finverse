import { genHistory, getLTP } from "./history";
import { ltpChangePct } from "./movers";

export interface MarketQuote {
  symbol: string;
  /** Displayed last-traded price (jittered demo LTP), integer paise. */
  pricePaise: number;
  /** Signed day change vs previous close, integer paise. */
  changePaise: number;
  /** Signed day change vs previous close, percent. */
  changePct: number;
}

/**
 * THE single consistent quote for a symbol — the only sanctioned way for a
 * market surface to read price + day change.
 *
 * Root cause of the strip-vs-snapshot contradiction (fixed here): the market
 * strip computed `changePct` from the STATIC listed close
 * (`dayChange(genHistory(sym, 2))`) while DISPLAYING the jittered LTP, and the
 * Market snapshot computed it from the jittered LTP (`ltpChangePct`). Same
 * index, two different % values on one screen — e.g. BANK NIFTY +0.10% in the
 * strip vs −0.32% in the snapshot.
 *
 * Every consumer (MarketStrip, MarketSnapshot, WatchlistCard, the /markets
 * page rows) reads price AND change from this one function, so the displayed
 * price and its % can never disagree — within one surface or across
 * surfaces. `getLTP` is session-cached, so quotes are stable per session and
 * refresh coherently via `refreshLTP`.
 */
export function getQuote(symbol: string): MarketQuote | undefined {
  const pricePaise = getLTP(symbol);
  if (pricePaise <= 0) return undefined;
  // genHistory is deterministic per symbol: the last two points of ANY
  // requested length are identical, so this penultimate close is the same
  // one every surface would derive — the only variable is the LTP, which is
  // session-cached and therefore identical for all callers too.
  const prevClose = genHistory(symbol, 2)[0]?.closePaise;
  const prev = prevClose ?? pricePaise;
  return {
    symbol,
    pricePaise,
    changePaise: pricePaise - prev,
    changePct: ltpChangePct(pricePaise, prev),
  };
}
