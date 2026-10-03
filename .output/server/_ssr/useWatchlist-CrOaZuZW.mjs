import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as FINVERSE_QUERY_DEFAULTS } from "./query-BmyAv6X-.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useAddToWatchlist, n as fetchWatchlist, o as useRemoveFromWatchlist, t as QK_WATCHLIST } from "./watchlist-G_EWDB_C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useWatchlist-CrOaZuZW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
function useWatchlist() {
	const { data: entries } = useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK_WATCHLIST,
		queryFn: fetchWatchlist
	});
	const addStock = useAddToWatchlist();
	const removeStock = useRemoveFromWatchlist();
	const watchlist = (entries ?? []).map((e) => e.symbol);
	const isWatched = (0, import_react.useCallback)((symbol) => watchlist.includes(symbol.toUpperCase()), [watchlist]);
	return {
		watchlist,
		isWatched,
		toggle: (0, import_react.useCallback)((symbol) => {
			const s = symbol.toUpperCase();
			if (isWatched(s)) removeStock.mutateRemove(s, {
				onSuccess: () => toast.success(`${s} removed from watchlist`),
				onError: () => toast.error(`Couldn't remove ${s} — try again.`)
			});
			else addStock.mutateAdd(s, {
				onSuccess: () => toast.success(`${s} added to watchlist`),
				onError: () => toast.error(`Couldn't watch ${s} — try again.`)
			});
		}, [
			addStock,
			isWatched,
			removeStock
		])
	};
}
//#endregion
export { useWatchlist as t };
