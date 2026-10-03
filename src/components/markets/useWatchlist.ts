import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  WATCHLIST_QUERY_KEY,
} from "@/lib/watchlist";

/**
 * Watchlist of stock symbols, backed by Supabase through the shared watchlist
 * query from @/lib/watchlist. Same return shape as before; toggling now goes
 * through the Supabase mutations (requires a signed-in user). Unresolved or
 * unauthenticated state simply reads as an empty list.
 */
export function useWatchlist(): {
  watchlist: string[];
  isWatched: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
} {
  const { data: entries } = useQuery({
    queryKey: WATCHLIST_QUERY_KEY,
    queryFn: fetchWatchlist,
    retry: false,
  });
  const addStock = useAddToWatchlist();
  const removeStock = useRemoveFromWatchlist();

  const watchlist = (entries ?? []).map((e) => e.symbol);

  const isWatched = useCallback(
    (symbol: string) => watchlist.includes(symbol.toUpperCase()),
    [watchlist],
  );

  const toggle = useCallback(
    (symbol: string) => {
      const s = symbol.toUpperCase();
      if (isWatched(s)) {
        removeStock.mutateRemove(s);
      } else {
        addStock.mutateAdd(s);
      }
    },
    [addStock, isWatched, removeStock],
  );

  return { watchlist, isWatched, toggle };
}
