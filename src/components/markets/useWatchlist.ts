import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  WATCHLIST_QUERY_KEY,
} from "@/lib/watchlist";
import { FINVERSE_QUERY_DEFAULTS } from "@/lib/query";

/**
 * Watchlist of stock symbols, backed by Supabase through the shared watchlist
 * query from @/lib/watchlist. Same return shape as before; toggling now goes
 * through the Supabase mutations (requires a signed-in user). Unresolved or
 * unauthenticated state simply reads as an empty list.
 *
 * Toggling gives explicit feedback: success/error toasts on the mutation
 * result (the star/bookmark visuals flip optimistically via the query cache
 * invalidation, the toast confirms it stuck).
 */
export function useWatchlist(): {
  watchlist: string[];
  isWatched: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
} {
  const { data: entries } = useQuery({
    ...FINVERSE_QUERY_DEFAULTS,
    queryKey: WATCHLIST_QUERY_KEY,
    queryFn: fetchWatchlist,
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
        removeStock.mutateRemove(s, {
          onSuccess: () => toast.success(`${s} removed from watchlist`),
          onError: () => toast.error(`Couldn't remove ${s} — try again.`),
        });
      } else {
        addStock.mutateAdd(s, {
          onSuccess: () => toast.success(`${s} added to watchlist`),
          onError: () => toast.error(`Couldn't watch ${s} — try again.`),
        });
      }
    },
    [addStock, isWatched, removeStock],
  );

  return { watchlist, isWatched, toggle };
}
