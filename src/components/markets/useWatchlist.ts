import { useCallback, useEffect, useState } from "react";

const KEY = "finverse:watchlist";

function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Watchlist of stock symbols, persisted to localStorage.
 * SSR-safe: reads storage lazily and only writes on the client.
 */
export function useWatchlist(): {
  watchlist: string[];
  isWatched: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
} {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    setWatchlist(readWatchlist());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(watchlist));
    } catch {
      // Storage full or unavailable — watchlist simply won't persist.
    }
  }, [watchlist]);

  const toggle = useCallback((symbol: string) => {
    const s = symbol.toUpperCase();
    setWatchlist((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }, []);

  const isWatched = useCallback(
    (symbol: string) => watchlist.includes(symbol.toUpperCase()),
    [watchlist],
  );

  return { watchlist, isWatched, toggle };
}
