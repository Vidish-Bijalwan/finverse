/**
 * React Query hooks for the live market layer (`./live.ts`).
 *
 * Live prices are best-effort: these hooks retry only once and never
 * surface an error state to the UI — on failure `data` stays undefined
 * and every caller falls back to the simulated feed. `staleTime` matches
 * the Edge Function's 60s server cache, and `refetchOnWindowFocus` is
 * off so tab-switching never refetch-storms Yahoo.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchLiveHistory,
  fetchLiveQuote,
  fetchLiveQuotes,
  getMarketDataFunctionUrl,
  type LiveHistoryRange,
  type LiveQuote,
} from "./live";
import type { PricePoint } from "./history";

/** Matches the Edge Function's 60s server-side cache. */
const LIVE_STALE_TIME_MS = 60_000;

const LIVE_QUERY_OPTIONS = {
  staleTime: LIVE_STALE_TIME_MS,
  gcTime: 5 * 60_000,
  retry: 1,
  retryDelay: 1000,
  refetchOnWindowFocus: false,
} as const;

/** Stable empty map returned when no live history is available. */
const EMPTY_HISTORY_MAP: Map<string, PricePoint[]> = new Map();

/** Normalize a symbol list for a stable query key (sorted, deduped, upper). */
function symbolKey(symbols: string[]): string {
  return [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter((s) => s.length > 0))]
    .sort()
    .join(",");
}

/** Live quote for one symbol. `data` is undefined while loading or on failure. */
export function useLiveQuote(symbol: string) {
  const url = getMarketDataFunctionUrl();
  const sym = symbol.trim().toUpperCase();
  return useQuery({
    queryKey: ["market-live", "quote", sym],
    queryFn: () => fetchLiveQuote(sym),
    ...LIVE_QUERY_OPTIONS,
    enabled: url !== null && sym.length > 0,
  });
}

/**
 * Live quotes for many symbols via the batch endpoint (chunked to the
 * function's cap by the fetcher). `data` is a map of the symbols that
 * resolved; symbols that failed are absent (not errors).
 */
export function useLiveQuotes(symbols: string[]) {
  const url = getMarketDataFunctionUrl();
  const key = symbolKey(symbols);
  const list = useMemo(() => (key ? key.split(",") : []), [key]);
  return useQuery({
    queryKey: ["market-live", "quotes", key],
    queryFn: () => fetchLiveQuotes(list),
    ...LIVE_QUERY_OPTIONS,
    enabled: url !== null && list.length > 0,
  });
}

/** Live daily history for one symbol. `data` is undefined while loading or on failure. */
export function useLiveHistory(symbol: string, range: LiveHistoryRange) {
  const url = getMarketDataFunctionUrl();
  const sym = symbol.trim().toUpperCase();
  return useQuery({
    queryKey: ["market-live", "history", sym, range],
    queryFn: () => fetchLiveHistory(sym, range),
    ...LIVE_QUERY_OPTIONS,
    enabled: url !== null && sym.length > 0,
  });
}

/**
 * Live daily histories for many symbols — one query fanning out with
 * `Promise.all`, so the returned map is referentially stable (React Query
 * keeps `data` stable between renders). Symbols that fail are absent.
 * Returns a shared frozen empty map when nothing is available.
 */
export function useLiveHistories(
  symbols: string[],
  range: LiveHistoryRange,
): Map<string, PricePoint[]> {
  const url = getMarketDataFunctionUrl();
  const key = symbolKey(symbols);
  const list = useMemo(() => (key ? key.split(",") : []), [key]);
  const query = useQuery({
    queryKey: ["market-live", "histories", key, range],
    queryFn: async (): Promise<Map<string, PricePoint[]>> => {
      const entries = await Promise.all(
        list.map(async (s) => [s, await fetchLiveHistory(s, range)] as const),
      );
      const map = new Map<string, PricePoint[]>();
      for (const [symbol, history] of entries) {
        if (history && history.length > 0) map.set(symbol, history);
      }
      return map;
    },
    ...LIVE_QUERY_OPTIONS,
    enabled: url !== null && list.length > 0,
  });
  return query.data ?? EMPTY_HISTORY_MAP;
}

export type { LiveQuote, LiveHistoryRange };
