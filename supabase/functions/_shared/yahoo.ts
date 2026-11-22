/**
 * Yahoo Finance helpers shared by the `market-data` Edge Function and the
 * FinVerse client — runtime-agnostic pure TypeScript (no Deno, no Node, no
 * `import.meta.env`), so both the Deno function and the vitest suite import
 * this one file instead of duplicating the symbol map and the parser.
 *
 * Ported from the old repo's Yahoo provider
 * (`reference/nestjs-backend/src/market/market.provider.ts`): the same
 * defensive rules — every number is checked finite before it is trusted,
 * rows without a close are skipped, bars are sorted ascending by date, and
 * a price is never invented when Yahoo returns nothing usable.
 */

/** One daily bar from Yahoo's chart API, in rupees. */
export interface YahooHistoryPoint {
  /** Calendar date "YYYY-MM-DD" in the exchange timezone (Asia/Kolkata). */
  date: string;
  /** Closing price, rupees. */
  close: number;
  /** Traded volume, null when Yahoo reports none for the day. */
  volume: number | null;
}

/** A parsed Yahoo chart response — the single source of truth for a symbol. */
export interface YahooChartData {
  /** Yahoo symbol as returned, e.g. `RELIANCE.NS`. */
  symbol: string;
  /** Currency code from Yahoo's meta, e.g. `INR`. */
  currency: string;
  /** Current price, rupees — `regularMarketPrice`, else the last close. */
  price: number;
  /** Previous trading day's close, rupees. */
  prevClose: number;
  /** ISO timestamp of the quote (`regularMarketTime`, else last bar). */
  asOf: string;
  /** Daily bars, ascending by date. */
  points: YahooHistoryPoint[];
}

/** Yahoo's index symbols for the three FinVerse demo indices. */
const YAHOO_INDEX_SYMBOLS: Record<string, string> = {
  NIFTY50: "^NSEI",
  SENSEX: "^BSESN",
  BANKNIFTY: "^NSEBANK",
};

/**
 * Map a FinVerse symbol to its Yahoo Finance symbol, or null when the
 * symbol cannot be mapped. Plain NSE symbols get the `.NS` suffix;
 * already-suffixed symbols pass through; the three demo indices map to
 * Yahoo's index tickers. Anything else (spaces, lowercase junk, too long)
 * is rejected — the caller falls back to simulated data.
 */
export function toYahooSymbol(symbol: string): string | null {
  const sym = symbol.trim().toUpperCase();
  if (sym.length === 0) return null;
  const index = YAHOO_INDEX_SYMBOLS[sym];
  if (index) return index;
  if (sym.endsWith(".NS") || sym.endsWith(".BO")) {
    return /^[A-Z0-9.]{1,20}$/.test(sym) ? sym : null;
  }
  if (/^[A-Z0-9]{1,12}$/.test(sym)) return `${sym}.NS`;
  return null;
}

/**
 * Validate a raw Yahoo symbol from an API query param. Yahoo symbols are
 * letters, digits, `.` and `^` only — anything else is rejected before it
 * ever reaches the upstream URL (no URL injection via the symbol).
 */
export function isValidYahooSymbol(symbol: string): boolean {
  return /^[A-Z0-9.^]{1,20}$/.test(symbol);
}

function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Thrown when a Yahoo chart payload cannot be parsed into usable data. */
export class YahooParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YahooParseError";
  }
}

/**
 * Format a unix timestamp as a YYYY-MM-DD date in the NSE timezone.
 * Yahoo's timestamps are market-day opens in exchange local time; using
 * Asia/Kolkata (not UTC) keeps the calendar day correct for NSE symbols.
 * `en-CA` formats as YYYY-MM-DD.
 */
const istDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function unixToISTDate(unixSeconds: number): string {
  return istDateFormat.format(new Date(unixSeconds * 1000));
}

/**
 * Parse a Yahoo v8 chart response (`query1/2.finance.yahoo.com/v8/finance/
 * chart/{symbol}`) into `YahooChartData`.
 *
 * - Throws `YahooParseError` when the payload carries a Yahoo error, has no
 *   result, or yields no usable price — the caller turns that into an
 *   honest 404/502, never an invented price.
 * - Bars with a missing/null close are skipped (Yahoo returns null closes
 *   for holidays and halted days), exactly like the old provider skipped
 *   dividend/split rows with no OHLC.
 * - `prevClose` is the second-to-last close when the series has ≥2 bars —
 *   that is the previous trading day's close for a quote fetch. Yahoo's
 *   `meta.chartPreviousClose` is only a fallback for single-bar series:
 *   for multi-day ranges it is the close *before the range*, not the
 *   previous day, and using it would report the multi-day move as the
 *   day change.
 */
export function parseYahooChart(json: unknown): YahooChartData {
  if (!json || typeof json !== "object") {
    throw new YahooParseError("Yahoo returned an empty or non-object response.");
  }
  const chart = (json as Record<string, unknown>)["chart"];
  if (!chart || typeof chart !== "object") {
    throw new YahooParseError("Yahoo response has no chart object.");
  }
  const chartRecord = chart as Record<string, unknown>;
  const error = chartRecord["error"];
  if (error && typeof error === "object") {
    const description = text((error as Record<string, unknown>)["description"]);
    throw new YahooParseError(
      description ? `Yahoo error: ${description}` : "Yahoo returned an error.",
    );
  }
  const result = chartRecord["result"];
  if (!Array.isArray(result) || result.length === 0) {
    throw new YahooParseError("Yahoo returned no data for this symbol.");
  }
  const first = result[0] as Record<string, unknown> | undefined;
  if (!first || typeof first !== "object") {
    throw new YahooParseError("Yahoo returned an empty result.");
  }
  const meta = first["meta"];
  if (!meta || typeof meta !== "object") {
    throw new YahooParseError("Yahoo result has no meta object.");
  }
  const metaRecord = meta as Record<string, unknown>;
  const symbol = text(metaRecord["symbol"]);
  if (!symbol) {
    throw new YahooParseError("Yahoo result has no symbol.");
  }

  const timestamps = first["timestamp"];
  const indicators = first["indicators"];
  const quote =
    indicators && typeof indicators === "object"
      ? (indicators as Record<string, unknown>)["quote"]
      : undefined;
  const firstQuote =
    Array.isArray(quote) && quote.length > 0
      ? (quote[0] as Record<string, unknown> | undefined)
      : undefined;
  const closes =
    firstQuote && Array.isArray(firstQuote["close"]) ? (firstQuote["close"] as unknown[]) : [];
  const volumes =
    firstQuote && Array.isArray(firstQuote["volume"]) ? (firstQuote["volume"] as unknown[]) : [];

  const points: YahooHistoryPoint[] = [];
  if (Array.isArray(timestamps)) {
    for (let i = 0; i < timestamps.length; i++) {
      const ts = finite(timestamps[i]);
      const close = finite(closes[i]);
      if (ts === undefined || close === undefined || close <= 0) continue;
      const volume = finite(volumes[i]);
      points.push({
        date: unixToISTDate(ts),
        close,
        volume: volume === undefined ? null : volume,
      });
    }
  }
  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const last = points.length > 0 ? points[points.length - 1] : undefined;
  const marketPrice = finite(metaRecord["regularMarketPrice"]);
  const price =
    marketPrice !== undefined && marketPrice > 0 ? marketPrice : (last?.close ?? undefined);
  if (price === undefined || price <= 0) {
    throw new YahooParseError(`Yahoo returned no usable price for ${symbol}.`);
  }

  const secondLast = points.length >= 2 ? points[points.length - 2] : undefined;
  const chartPrevClose = finite(metaRecord["chartPreviousClose"]);
  const prevClose =
    secondLast !== undefined
      ? secondLast.close
      : chartPrevClose !== undefined && chartPrevClose > 0
        ? chartPrevClose
        : price;

  const marketTime = finite(metaRecord["regularMarketTime"]);
  const asOf =
    marketTime !== undefined
      ? new Date(marketTime * 1000).toISOString()
      : last !== undefined
        ? `${last.date}T00:00:00.000Z`
        : new Date().toISOString();

  return {
    symbol,
    currency: text(metaRecord["currency"]) ?? "INR",
    price,
    prevClose,
    asOf,
    points,
  };
}
