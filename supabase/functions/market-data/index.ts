/**
 * `market-data` — live Yahoo Finance quotes + history for FinVerse.
 *
 * A Supabase Edge Function (Deno). The TanStack app is going static on
 * GitHub Pages, where no server functions exist, so all server-side work
 * lives here (see docs/MIGRATION.md §7). The browser calls this function
 * and falls back to the simulated demo feed whenever it is unavailable.
 *
 * API (all GET, all prices in RUPEES — the client converts to paise):
 * - `?symbol=RELIANCE.NS` → quote + 5-day history
 * - `?symbol=RELIANCE.NS&range=1y&interval=1d` → quote + full history
 * - `?symbols=RELIANCE.NS,TCS.NS` → batch quotes (max 20 symbols)
 *
 * Single response:
 * `{ symbol, price, prevClose, change, changePct, currency, asOf,
 *    history: [{ date, close, volume }] }`
 * Batch response:
 * `{ quotes: { [symbol]: <single> }, errors: { [symbol]: string } }`
 * Error response (never a stack trace):
 * `{ error: string, code: "BAD_REQUEST" | "NO_DATA" | "UPSTREAM_ERROR" |
 *   "INTERNAL" }`
 *
 * `verify_jwt = false` (see supabase/config.toml): market data is public
 * — Yahoo quotes carry no user data and this function holds no secrets,
 * so requiring a JWT would add a failure mode (expired/invalid token →
 * market surfaces break) for zero security benefit. The anon key is
 * public by design, so JWT verification would not keep anyone out
 * anyway. Rate pressure on Yahoo is bounded by the 60s cache below.
 *
 * Deploy (owner action — needs the Supabase CLI + access token):
 *   supabase functions deploy market-data
 */

import {
  isValidYahooSymbol,
  parseYahooChart,
  YahooParseError,
  type YahooChartData,
} from "../_shared/yahoo.ts";

/** Origins allowed to call this function from a browser. */
const CORS_ALLOWLIST = new Set([
  "https://vidish-bijalwan.github.io", // GitHub Pages (target host)
  "https://finverse-nu.vercel.app", // Vercel (current host, until cutover)
  "http://localhost:8080", // vite dev (this repo's dev port)
  "http://localhost:5173", // vite default dev port
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
]);

/** Yahoo ranges the function accepts (passed straight through). */
const VALID_RANGES = new Set(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "max"]);

/** Yahoo intervals the function accepts. */
const VALID_INTERVALS = new Set(["1d", "1wk", "1mo"]);

/** Max symbols per batch request — bounds the Yahoo fan-out. */
const MAX_BATCH_SYMBOLS = 20;

/** Per-request timeout for the Yahoo fetch. */
const YAHOO_TIMEOUT_MS = 10_000;

/**
 * In-memory response cache (60s). NOTE: per-instance — Supabase runs many
 * isolates, so this is a best-effort throttle on Yahoo calls, not a
 * guarantee. Errors are never cached: a transient Yahoo blip must not
 * poison the next minute.
 */
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; body: unknown; status: number }>();

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (origin && CORS_ALLOWLIST.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(
  body: unknown,
  status: number,
  origin: string | null,
  cacheable = false,
): Response {
  const headers: Record<string, string> = {
    ...corsHeaders(origin),
    "Content-Type": "application/json",
  };
  if (cacheable) headers["Cache-Control"] = "public, max-age=60";
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(
  message: string,
  code: string,
  status: number,
  origin: string | null,
): Response {
  return jsonResponse({ error: message, code }, status, origin);
}

function getCached(key: string): { body: unknown; status: number } | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return { body: entry.body, status: entry.status };
}

function setCached(key: string, body: unknown, status: number): void {
  cache.set(key, { at: Date.now(), body, status });
}

/** Thrown when Yahoo itself is unreachable or returns a non-OK status. */
class YahooUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YahooUpstreamError";
  }
}

async function fetchYahooChart(
  yahooSymbol: string,
  range: string,
  interval: string,
): Promise<YahooChartData> {
  const path =
    `/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` + `?range=${range}&interval=${interval}`;
  // query1 first, query2 as fallback — both serve the same chart API.
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  let lastError: unknown = null;
  for (const host of hosts) {
    try {
      const res = await fetch(`https://${host}${path}`, {
        headers: {
          // Yahoo 429s bare fetch user-agents; a browser UA keeps the
          // public chart endpoint answering.
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(YAHOO_TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new YahooUpstreamError(`Yahoo returned HTTP ${res.status}.`);
      }
      const json: unknown = await res.json();
      return parseYahooChart(json);
    } catch (e) {
      // A parse failure means Yahoo answered but the payload is unusable —
      // retrying the other host won't help, so fail fast with the real
      // reason instead of masking it as an upstream error.
      if (e instanceof YahooParseError) throw e;
      lastError = e;
    }
  }
  console.error(`market-data: Yahoo unreachable for ${yahooSymbol}`, lastError);
  throw new YahooUpstreamError("Yahoo Finance is unreachable right now.");
}

interface QuoteResponse {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  currency: string;
  asOf: string;
  history: Array<{ date: string; close: number; volume: number | null }>;
}

function toQuoteResponse(data: YahooChartData): QuoteResponse {
  const change = data.price - data.prevClose;
  return {
    symbol: data.symbol,
    price: data.price,
    prevClose: data.prevClose,
    change,
    changePct: data.prevClose > 0 ? (change / data.prevClose) * 100 : 0,
    currency: data.currency,
    asOf: data.asOf,
    history: data.points.map((p) => ({ date: p.date, close: p.close, volume: p.volume })),
  };
}

async function handleSingle(
  yahooSymbol: string,
  range: string,
  interval: string,
  cacheKey: string,
  origin: string | null,
): Promise<Response> {
  const cached = getCached(cacheKey);
  if (cached) return jsonResponse(cached.body, cached.status, origin, true);
  try {
    const data = await fetchYahooChart(yahooSymbol, range, interval);
    const body = toQuoteResponse(data);
    setCached(cacheKey, body, 200);
    return jsonResponse(body, 200, origin, true);
  } catch (e) {
    if (e instanceof YahooParseError) {
      return errorResponse(e.message, "NO_DATA", 404, origin);
    }
    if (e instanceof YahooUpstreamError) {
      return errorResponse(e.message, "UPSTREAM_ERROR", 502, origin);
    }
    console.error("market-data: unexpected error", e);
    return errorResponse("Unexpected error.", "INTERNAL", 500, origin);
  }
}

async function handleBatch(
  symbols: string[],
  cacheKey: string,
  origin: string | null,
): Promise<Response> {
  const cached = getCached(cacheKey);
  if (cached) return jsonResponse(cached.body, cached.status, origin, true);
  const quotes: Record<string, QuoteResponse> = {};
  const errors: Record<string, string> = {};
  // Fan out in parallel; each symbol resolves independently so one bad
  // symbol never fails the whole batch.
  const settled = await Promise.allSettled(symbols.map((s) => fetchYahooChart(s, "5d", "1d")));
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i] as string;
    const result = settled[i];
    if (result && result.status === "fulfilled") {
      quotes[symbol] = toQuoteResponse(result.value);
    } else {
      const reason = result && result.status === "rejected" ? result.reason : undefined;
      errors[symbol] =
        reason instanceof YahooParseError
          ? reason.message
          : "Yahoo Finance is unreachable right now.";
    }
  }
  const body = { quotes, errors };
  setCached(cacheKey, body, 200);
  return jsonResponse(body, 200, origin, true);
}

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "GET") {
    return errorResponse("Only GET is supported.", "BAD_REQUEST", 405, origin);
  }

  const url = new URL(req.url);
  const symbolParam = url.searchParams.get("symbol");
  const symbolsParam = url.searchParams.get("symbols");
  const range = url.searchParams.get("range") ?? "5d";
  const interval = url.searchParams.get("interval") ?? "1d";

  if (!VALID_RANGES.has(range)) {
    return errorResponse(
      `Invalid range "${range}". Use one of: ${[...VALID_RANGES].join(", ")}.`,
      "BAD_REQUEST",
      400,
      origin,
    );
  }
  if (!VALID_INTERVALS.has(interval)) {
    return errorResponse(
      `Invalid interval "${interval}". Use one of: ${[...VALID_INTERVALS].join(", ")}.`,
      "BAD_REQUEST",
      400,
      origin,
    );
  }

  if (symbolsParam) {
    const symbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
    if (symbols.length === 0) {
      return errorResponse("No symbols provided.", "BAD_REQUEST", 400, origin);
    }
    if (symbols.length > MAX_BATCH_SYMBOLS) {
      return errorResponse(
        `Too many symbols (max ${MAX_BATCH_SYMBOLS}).`,
        "BAD_REQUEST",
        400,
        origin,
      );
    }
    const invalid = symbols.filter((s) => !isValidYahooSymbol(s));
    if (invalid.length > 0) {
      return errorResponse(`Invalid symbol(s): ${invalid.join(", ")}.`, "BAD_REQUEST", 400, origin);
    }
    return handleBatch(symbols, url.toString(), origin);
  }

  if (symbolParam) {
    const yahooSymbol = symbolParam.trim().toUpperCase();
    if (!isValidYahooSymbol(yahooSymbol)) {
      return errorResponse(`Invalid symbol "${symbolParam}".`, "BAD_REQUEST", 400, origin);
    }
    return handleSingle(yahooSymbol, range, interval, url.toString(), origin);
  }

  return errorResponse(
    "Provide ?symbol=RELIANCE.NS or ?symbols=RELIANCE.NS,TCS.NS.",
    "BAD_REQUEST",
    400,
    origin,
  );
});
