/**
 * Live market data client — the async layer over the `market-data` Supabase
 * Edge Function.
 *
 * The sync seams (`getQuote` / `genHistory` / `getLTP`) stay exactly as
 * they are: they are the SIMULATED fallback, deterministic and always
 * available. This module adds the live layer on top — every function here
 * fails soft (returns null / empty on any failure) so a missing function,
 * a dead network, or a Yahoo outage degrades to simulated data instead of
 * breaking a page.
 *
 * Units: the Edge Function speaks rupees (Yahoo-native); this module
 * converts to integer paise at the boundary, matching the repo's paise
 * convention everywhere else. A price is never invented: when the live
 * fetch fails, the resolvers return the simulated quote/history and say
 * so via the `source` field — the UI discloses which one it shows.
 */

import { getQuote, type MarketQuote } from "./quote";
import { genHistory, type PricePoint } from "./history";
import { toYahooSymbol } from "../../../supabase/functions/_shared/yahoo.ts";

/** A live quote, converted to the repo's integer-paise convention. */
export interface LiveQuote {
  /** FinVerse symbol, e.g. `RELIANCE` (not the Yahoo `RELIANCE.NS`). */
  symbol: string;
  /** Last-traded price, integer paise. */
  pricePaise: number;
  /** Previous trading day's close, integer paise. */
  prevClosePaise: number;
  /** Signed day change vs previous close, integer paise. */
  changePaise: number;
  /** Signed day change vs previous close, percent. */
  changePct: number;
  /** ISO timestamp of the quote (Yahoo's `regularMarketTime`). */
  asOf: string;
  source: "live";
}

/** Where a displayed price/history came from — the UI discloses this. */
export type MarketDataSource = "live" | "simulated";

/** History ranges the live layer supports, mapped to Yahoo ranges. */
export type LiveHistoryRange = "5D" | "1M" | "3M" | "6M" | "1Y" | "2Y" | "3Y" | "5Y";

const YAHOO_RANGE: Record<LiveHistoryRange, string> = {
  "5D": "5d",
  "1M": "1mo",
  "3M": "3mo",
  "6M": "6mo",
  "1Y": "1y",
  "2Y": "2y",
  "3Y": "3y",
  "5Y": "5y",
};

/** Per-request timeout for the Edge Function call (it caches 60s upstream). */
const LIVE_FETCH_TIMEOUT_MS = 10_000;

/** Max symbols per batch request — mirrors the Edge Function's cap. */
const LIVE_BATCH_MAX = 20;

const toPaise = (rupees: number): number => Math.round(rupees * 100);

function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Edge Function URL, derived from the existing Supabase env var — no new
 * env var. Returns null when Supabase is not configured, which disables
 * the live layer (every caller falls back to simulated data). Never
 * throws: unlike `getSupabase()`, this must stay silent — live prices are
 * best-effort, not a boot requirement.
 */
export function getMarketDataFunctionUrl(): string | null {
  const base = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)
    ?.trim()
    .replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/functions/v1/market-data`;
}

/**
 * Validate + convert one Edge Function quote response into a `LiveQuote`.
 * Returns null on any shape problem — the function is an external boundary
 * and its JSON is never trusted blindly.
 */
export function parseLiveQuoteResponse(json: unknown, symbol: string): LiveQuote | null {
  if (!json || typeof json !== "object") return null;
  const record = json as Record<string, unknown>;
  const price = finite(record["price"]);
  const prevClose = finite(record["prevClose"]);
  const change = finite(record["change"]);
  const changePct = finite(record["changePct"]);
  const asOf = text(record["asOf"]);
  if (
    price === undefined ||
    price <= 0 ||
    prevClose === undefined ||
    prevClose <= 0 ||
    change === undefined ||
    changePct === undefined ||
    !asOf
  ) {
    return null;
  }
  return {
    symbol: symbol.toUpperCase(),
    pricePaise: toPaise(price),
    prevClosePaise: toPaise(prevClose),
    changePaise: toPaise(change),
    changePct,
    asOf,
    source: "live",
  };
}

/**
 * Validate + convert an Edge Function history array into `PricePoint[]`.
 * Bars with a missing/invalid close are skipped; an empty result is null
 * (the caller falls back to simulated history).
 */
export function parseLiveHistoryResponse(json: unknown): PricePoint[] | null {
  if (!json || typeof json !== "object") return null;
  const history = (json as Record<string, unknown>)["history"];
  if (!Array.isArray(history)) return null;
  const points: PricePoint[] = [];
  for (const raw of history) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const date = text(row["date"]);
    const close = finite(row["close"]);
    if (!date || close === undefined || close <= 0) continue;
    points.push({ date, closePaise: toPaise(close) });
  }
  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return points.length > 0 ? points : null;
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(LIVE_FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

/** Fetch one live quote. Null on any failure — the caller falls back. */
export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  const yahoo = toYahooSymbol(symbol);
  const base = getMarketDataFunctionUrl();
  if (!yahoo || !base) return null;
  const json = await fetchJson(`${base}?symbol=${encodeURIComponent(yahoo)}`);
  return json === null ? null : parseLiveQuoteResponse(json, symbol);
}

/**
 * Fetch live quotes for many symbols via the batch endpoint (chunked to
 * the function's 20-symbol cap, merged into one map). Symbols that fail
 * (unknown, Yahoo error) are simply absent from the map — partial
 * failure, never a thrown error.
 */
export async function fetchLiveQuotes(symbols: string[]): Promise<Map<string, LiveQuote>> {
  const empty = new Map<string, LiveQuote>();
  const base = getMarketDataFunctionUrl();
  if (!base) return empty;
  const wanted = new Map<string, string>(); // Yahoo symbol -> FinVerse symbol
  for (const symbol of symbols) {
    const yahoo = toYahooSymbol(symbol);
    if (yahoo) wanted.set(yahoo, symbol.toUpperCase());
  }
  if (wanted.size === 0) return empty;
  const yahooSymbols = [...wanted.keys()];
  const chunks: string[][] = [];
  for (let i = 0; i < yahooSymbols.length; i += LIVE_BATCH_MAX) {
    chunks.push(yahooSymbols.slice(i, i + LIVE_BATCH_MAX));
  }
  const responses = await Promise.all(
    chunks.map((chunk) => fetchJson(`${base}?symbols=${encodeURIComponent(chunk.join(","))}`)),
  );
  const out = new Map<string, LiveQuote>();
  for (const json of responses) {
    if (!json || typeof json !== "object") continue;
    const quotes = (json as Record<string, unknown>)["quotes"];
    if (!quotes || typeof quotes !== "object") continue;
    for (const [yahooSymbol, raw] of Object.entries(quotes as Record<string, unknown>)) {
      const finverseSymbol = wanted.get(yahooSymbol);
      if (!finverseSymbol) continue;
      const quote = parseLiveQuoteResponse(raw, finverseSymbol);
      if (quote) out.set(finverseSymbol, quote);
    }
  }
  return out;
}

/** Fetch live daily history. Null on any failure — the caller falls back. */
export async function fetchLiveHistory(
  symbol: string,
  range: LiveHistoryRange,
): Promise<PricePoint[] | null> {
  const yahoo = toYahooSymbol(symbol);
  const base = getMarketDataFunctionUrl();
  if (!yahoo || !base) return null;
  const json = await fetchJson(
    `${base}?symbol=${encodeURIComponent(yahoo)}&range=${YAHOO_RANGE[range]}&interval=1d`,
  );
  return json === null ? null : parseLiveHistoryResponse(json);
}

/**
 * Resolve the quote to display: the live quote when one was fetched,
 * otherwise the simulated `getQuote`. Returns undefined only for unknown
 * symbols (same contract as `getQuote`). The `source` tells the UI what
 * to disclose.
 */
export function resolveQuote(
  symbol: string,
  live: LiveQuote | null | undefined,
): { quote: MarketQuote; source: MarketDataSource } | undefined {
  if (live) {
    return {
      quote: {
        symbol: live.symbol,
        pricePaise: live.pricePaise,
        changePaise: live.changePaise,
        changePct: live.changePct,
      },
      source: "live",
    };
  }
  const simulated = getQuote(symbol);
  return simulated ? { quote: simulated, source: "simulated" } : undefined;
}

/**
 * Resolve the history to display: live bars when fetched (trimmed to the
 * requested length), otherwise the deterministic simulated `genHistory`.
 */
export function resolveHistory(
  symbol: string,
  tradingDays: number,
  live: PricePoint[] | null | undefined,
): { history: PricePoint[]; source: MarketDataSource } {
  if (live && live.length > 0) {
    return { history: live.slice(-tradingDays), source: "live" };
  }
  return { history: genHistory(symbol, tradingDays), source: "simulated" };
}
