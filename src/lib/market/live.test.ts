import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isValidYahooSymbol,
  parseYahooChart,
  toYahooSymbol,
  YahooParseError,
} from "../../../supabase/functions/_shared/yahoo.ts";
import {
  fetchLiveHistory,
  fetchLiveQuote,
  fetchLiveQuotes,
  getMarketDataFunctionUrl,
  parseLiveHistoryResponse,
  parseLiveQuoteResponse,
  resolveHistory,
  resolveQuote,
} from "./live";
import { genHistory } from "./history";

/**
 * Real Yahoo v8 chart payload for RELIANCE.NS (fetched 22 Nov 2026,
 * trimmed to the fields the parser reads). 5 daily bars; the last close
 * is the live price 1377.5 and the second-to-last is 1375.6, so the day
 * change is +1.9 — matching Yahoo's own `fulldayChange` of 1.9.
 */
const RELIANCE_CHART_FIXTURE = {
  chart: {
    result: [
      {
        meta: {
          currency: "INR",
          symbol: "RELIANCE.NS",
          regularMarketPrice: 1377.5,
          regularMarketTime: 1795168690,
          chartPreviousClose: 1344.8,
          fiftyTwoWeekHigh: 1611.8,
          fiftyTwoWeekLow: 1152.2,
        },
        timestamp: [1794800700, 1794887100, 1794973500, 1795059900, 1795146300],
        indicators: {
          quote: [
            {
              close: [1344.800048828125, 1367.0, 1363.0, 1375.5999755859375, 1377.5],
              volume: [7653528, 15905595, 18228940, 14486599, 13167730],
            },
          ],
        },
      },
    ],
    error: null,
  },
};

/** Edge Function quote response for RELIANCE.NS (rupees, Yahoo-native). */
const RELIANCE_QUOTE_RESPONSE = {
  symbol: "RELIANCE.NS",
  price: 1377.5,
  prevClose: 1375.6,
  change: 1.9,
  changePct: 0.138,
  currency: "INR",
  asOf: "2026-11-22T10:00:00.000Z",
  history: [
    { date: "2026-11-20", close: 1377.5, volume: 13167730 },
    { date: "2026-11-19", close: 1375.6, volume: 14486599 },
  ],
};

describe("toYahooSymbol — FinVerse symbol to Yahoo symbol", () => {
  it("suffixes plain NSE symbols with .NS", () => {
    expect(toYahooSymbol("RELIANCE")).toBe("RELIANCE.NS");
    expect(toYahooSymbol("TCS")).toBe("TCS.NS");
  });

  it("normalizes case and whitespace", () => {
    expect(toYahooSymbol(" reliance ")).toBe("RELIANCE.NS");
  });

  it("maps the three demo indices to Yahoo index tickers", () => {
    expect(toYahooSymbol("NIFTY50")).toBe("^NSEI");
    expect(toYahooSymbol("SENSEX")).toBe("^BSESN");
    expect(toYahooSymbol("BANKNIFTY")).toBe("^NSEBANK");
  });

  it("passes already-suffixed symbols through", () => {
    expect(toYahooSymbol("RELIANCE.NS")).toBe("RELIANCE.NS");
  });

  it("rejects unmappable symbols (null → simulated fallback)", () => {
    expect(toYahooSymbol("")).toBeNull();
    expect(toYahooSymbol("BAD SYMBOL")).toBeNull();
    expect(toYahooSymbol("RELIANCE!")).toBeNull();
    expect(toYahooSymbol("A".repeat(13))).toBeNull();
  });
});

describe("isValidYahooSymbol — query-param validation", () => {
  it("accepts Yahoo-shaped symbols", () => {
    expect(isValidYahooSymbol("RELIANCE.NS")).toBe(true);
    expect(isValidYahooSymbol("^NSEI")).toBe(true);
  });

  it("rejects anything that could smuggle URL content", () => {
    expect(isValidYahooSymbol("reliance.ns")).toBe(false);
    expect(isValidYahooSymbol("A B")).toBe(false);
    expect(isValidYahooSymbol("A/B")).toBe(false);
    expect(isValidYahooSymbol("A?x=1")).toBe(false);
    expect(isValidYahooSymbol("")).toBe(false);
    expect(isValidYahooSymbol("A".repeat(21))).toBe(false);
  });
});

describe("parseYahooChart — Yahoo v8 chart payload", () => {
  it("parses the real RELIANCE.NS fixture", () => {
    const data = parseYahooChart(RELIANCE_CHART_FIXTURE);
    expect(data.symbol).toBe("RELIANCE.NS");
    expect(data.currency).toBe("INR");
    expect(data.price).toBe(1377.5);
    expect(data.points).toHaveLength(5);
    expect(data.points[0]?.date).toBe("2026-11-16");
    expect(data.points[4]?.date).toBe("2026-11-20");
    expect(data.points[4]?.close).toBe(1377.5);
    expect(data.points[4]?.volume).toBe(13167730);
  });

  it("derives prevClose from the second-to-last close (the real day change)", () => {
    // chartPreviousClose (1344.8) is the close BEFORE the 5d window — using
    // it would report the 5-day move (+32.7) as the day change. The real
    // day change is +1.9, matching Yahoo's own fulldayChange.
    const data = parseYahooChart(RELIANCE_CHART_FIXTURE);
    expect(data.prevClose).toBeCloseTo(1375.6, 3);
    expect(data.price - data.prevClose).toBeCloseTo(1.9, 3);
  });

  it("skips bars with a null close (holidays / halted days)", () => {
    const fixture = structuredClone(RELIANCE_CHART_FIXTURE);
    const quote = fixture.chart.result[0]!.indicators.quote[0]!;
    (quote.close as unknown[])[2] = null;
    const data = parseYahooChart(fixture);
    expect(data.points).toHaveLength(4);
    expect(data.points.map((p) => p.date)).not.toContain("2026-11-18");
  });

  it("falls back to chartPreviousClose for a single-bar series", () => {
    const fixture = structuredClone(RELIANCE_CHART_FIXTURE);
    const result = fixture.chart.result[0]!;
    result.timestamp = [1795146300];
    const quote = result.indicators.quote[0]!;
    quote.close = [1377.5];
    quote.volume = [13167730];
    const data = parseYahooChart(fixture);
    expect(data.points).toHaveLength(1);
    expect(data.prevClose).toBe(1344.8);
  });

  it("sorts out-of-order bars ascending by date", () => {
    const fixture = structuredClone(RELIANCE_CHART_FIXTURE);
    const result = fixture.chart.result[0]!;
    result.timestamp = [...result.timestamp].reverse();
    const quote = result.indicators.quote[0]!;
    quote.close = [...quote.close].reverse();
    quote.volume = [...quote.volume].reverse();
    const data = parseYahooChart(fixture);
    expect(data.points.map((p) => p.date)).toEqual([
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
    ]);
  });

  it("throws YahooParseError on Yahoo's own error payload", () => {
    expect(() =>
      parseYahooChart({
        chart: {
          result: [],
          error: { code: "Not Found", description: "No data found, symbol may be delisted" },
        },
      }),
    ).toThrow(YahooParseError);
  });

  it("throws on an empty result with no error object", () => {
    expect(() => parseYahooChart({ chart: { result: [], error: null } })).toThrow(YahooParseError);
  });

  it("throws when there is no usable price at all", () => {
    const fixture = structuredClone(RELIANCE_CHART_FIXTURE);
    const result = fixture.chart.result[0]!;
    delete (result.meta as unknown as Record<string, unknown>)["regularMarketPrice"];
    result.timestamp = [];
    const quote = result.indicators.quote[0]!;
    quote.close = [];
    quote.volume = [];
    expect(() => parseYahooChart(fixture)).toThrow(YahooParseError);
  });
});

describe("getMarketDataFunctionUrl — derived from VITE_SUPABASE_URL", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://txktgmzgpvymmostpmol.supabase.co");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("derives the functions URL from the Supabase URL", () => {
    expect(getMarketDataFunctionUrl()).toBe(
      "https://txktgmzgpvymmostpmol.supabase.co/functions/v1/market-data",
    );
  });

  it("trims a trailing slash on the Supabase URL", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://xyz.supabase.co/");
    expect(getMarketDataFunctionUrl()).toBe("https://xyz.supabase.co/functions/v1/market-data");
  });

  it("returns null when Supabase is not configured (live layer disabled)", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    expect(getMarketDataFunctionUrl()).toBeNull();
  });
});

describe("parseLiveQuoteResponse / parseLiveHistoryResponse — Edge Function JSON", () => {
  it("converts a quote response to integer paise", () => {
    const quote = parseLiveQuoteResponse(RELIANCE_QUOTE_RESPONSE, "RELIANCE");
    expect(quote).toEqual({
      symbol: "RELIANCE",
      pricePaise: 137750,
      prevClosePaise: 137560,
      changePaise: 190,
      changePct: 0.138,
      asOf: "2026-11-22T10:00:00.000Z",
      source: "live",
    });
  });

  it("returns null for a malformed quote response", () => {
    expect(parseLiveQuoteResponse({ price: "1377.5" }, "RELIANCE")).toBeNull();
    expect(
      parseLiveQuoteResponse({ ...RELIANCE_QUOTE_RESPONSE, price: -1 }, "RELIANCE"),
    ).toBeNull();
    expect(parseLiveQuoteResponse({ ...RELIANCE_QUOTE_RESPONSE, price: 0 }, "RELIANCE")).toBeNull();
    expect(parseLiveQuoteResponse(null, "RELIANCE")).toBeNull();
  });

  it("converts a history response to PricePoints in paise, sorted ascending", () => {
    const points = parseLiveHistoryResponse(RELIANCE_QUOTE_RESPONSE);
    expect(points).toEqual([
      { date: "2026-11-19", closePaise: 137560 },
      { date: "2026-11-20", closePaise: 137750 },
    ]);
  });

  it("returns null for an empty or malformed history", () => {
    expect(parseLiveHistoryResponse({ history: [] })).toBeNull();
    expect(parseLiveHistoryResponse({})).toBeNull();
    expect(parseLiveHistoryResponse({ history: [{ date: "2026-11-20" }] })).toBeNull();
  });
});

describe("fetchers — fail soft, never throw", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://xyz.supabase.co");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function mockFetchOnce(body: unknown, ok = true, status = 200) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok,
        status,
        json: () => Promise.resolve(body),
      }),
    );
  }

  it("fetchLiveQuote returns the parsed quote on success", async () => {
    mockFetchOnce(RELIANCE_QUOTE_RESPONSE);
    const quote = await fetchLiveQuote("RELIANCE");
    expect(quote?.pricePaise).toBe(137750);
    expect(quote?.source).toBe("live");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/functions/v1/market-data?symbol=RELIANCE.NS"),
      expect.anything(),
    );
  });

  it("fetchLiveQuote returns null on non-OK, network failure, or bad shape", async () => {
    mockFetchOnce({ error: "nope" }, false, 502);
    expect(await fetchLiveQuote("RELIANCE")).toBeNull();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await fetchLiveQuote("RELIANCE")).toBeNull();

    mockFetchOnce({ price: "not-a-number" });
    expect(await fetchLiveQuote("RELIANCE")).toBeNull();
  });

  it("fetchLiveQuote returns null for an unmappable symbol without fetching", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await fetchLiveQuote("BAD SYMBOL")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetchLiveQuotes returns a map and tolerates partial failure", async () => {
    mockFetchOnce({
      quotes: { "RELIANCE.NS": RELIANCE_QUOTE_RESPONSE },
      errors: { "TCS.NS": "Yahoo returned no data for this symbol." },
    });
    const map = await fetchLiveQuotes(["RELIANCE", "TCS"]);
    expect(map.size).toBe(1);
    expect(map.get("RELIANCE")?.pricePaise).toBe(137750);
    expect(map.has("TCS")).toBe(false);
  });

  it("fetchLiveQuotes chunks to the 20-symbol batch cap", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ quotes: {}, errors: {} }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    const symbols = Array.from({ length: 41 }, (_, i) => `SYM${i}`);
    await fetchLiveQuotes(symbols);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    for (const call of fetchSpy.mock.calls) {
      const url = String(call[0]);
      const count = decodeURIComponent(url.split("symbols=")[1] ?? "").split(",").length;
      expect(count).toBeLessThanOrEqual(20);
    }
  });

  it("fetchLiveHistory returns PricePoints and null on failure", async () => {
    mockFetchOnce(RELIANCE_QUOTE_RESPONSE);
    const points = await fetchLiveHistory("RELIANCE", "5D");
    expect(points).toEqual([
      { date: "2026-11-19", closePaise: 137560 },
      { date: "2026-11-20", closePaise: 137750 },
    ]);

    mockFetchOnce({ error: "boom" }, false, 502);
    expect(await fetchLiveHistory("RELIANCE", "5D")).toBeNull();
  });
});

describe("resolvers — live when available, simulated otherwise", () => {
  const liveQuote = {
    symbol: "RELIANCE",
    pricePaise: 137750,
    prevClosePaise: 137560,
    changePaise: 190,
    changePct: 0.138,
    asOf: "2026-11-22T10:00:00.000Z",
    source: "live" as const,
  };

  it("resolveQuote prefers the live quote and reports source live", () => {
    const resolved = resolveQuote("RELIANCE", liveQuote);
    expect(resolved?.source).toBe("live");
    expect(resolved?.quote.pricePaise).toBe(137750);
    expect(resolved?.quote.changePct).toBe(0.138);
  });

  it("resolveQuote falls back to the simulated getQuote and reports it", () => {
    const resolved = resolveQuote("RELIANCE", null);
    expect(resolved?.source).toBe("simulated");
    expect(resolved?.quote.symbol).toBe("RELIANCE");
    expect(resolved?.quote.pricePaise).toBeGreaterThan(0);
  });

  it("resolveQuote returns undefined for unknown symbols", () => {
    expect(resolveQuote("NOPE_NOT_A_SYMBOL", null)).toBeUndefined();
  });

  it("resolveHistory prefers live bars, trimmed to the requested length", () => {
    const live = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-11-${String(i + 1).padStart(2, "0")}`,
      closePaise: 100000 + i,
    }));
    const resolved = resolveHistory("RELIANCE", 5, live);
    expect(resolved.source).toBe("live");
    expect(resolved.history).toHaveLength(5);
    expect(resolved.history[0]?.closePaise).toBe(100005);
  });

  it("resolveHistory falls back to genHistory on null or empty live data", () => {
    const fallback = resolveHistory("RELIANCE", 22, null);
    expect(fallback.source).toBe("simulated");
    expect(fallback.history).toEqual(genHistory("RELIANCE", 22));

    const empty = resolveHistory("RELIANCE", 22, []);
    expect(empty.source).toBe("simulated");
    expect(empty.history).toHaveLength(22);
  });
});
