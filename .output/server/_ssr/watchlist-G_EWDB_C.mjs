import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { i as getStock } from "./data-_btm06jU.mjs";
import { i as getLTP } from "./history-mUmaAsie.mjs";
import { n as getSupabase, t as getSessionUserId } from "./supabase-D8cuRV3S.mjs";
import { t as FINVERSE_QUERY_DEFAULTS } from "./query-BmyAv6X-.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-G_EWDB_C.js
function isAlertDirection(v) {
	return v === "above" || v === "below";
}
/** Signed-in user id, or a clear error when there is no session. */
async function requireUserId() {
	return getSessionUserId();
}
function toPriceAlert(row) {
	return {
		id: row.id,
		kind: isAlertDirection(row.direction) ? row.direction : "above",
		pricePaise: Number(row.target_price_paise),
		createdAt: row.created_at
	};
}
/**
* Last snapshot returned by {@link fetchWatchlist}. The notifications
* aggregator (src/lib/notify.ts) calls {@link watchlistAlerts} synchronously,
* so it reads this snapshot — empty until the first successful fetch.
*/
var cachedEntries = [];
/** Load the signed-in user's watchlist with its alerts (oldest first). New users get []. */
async function fetchWatchlist() {
	const supabase = getSupabase();
	const userId = await requireUserId();
	const { data: itemRows, error: itemsError } = await supabase.from("watchlist_items").select("id,user_id,symbol,created_at").eq("user_id", userId).order("created_at", { ascending: true });
	if (itemsError) throw new Error(`Couldn't load your watchlist: ${itemsError.message}`);
	const { data: alertRows, error: alertsError } = await supabase.from("price_alerts").select("id,user_id,symbol,target_price_paise,direction,created_at").eq("user_id", userId).order("created_at", { ascending: true });
	if (alertsError) throw new Error(`Couldn't load your price alerts: ${alertsError.message}`);
	const alertsBySymbol = /* @__PURE__ */ new Map();
	for (const row of alertRows ?? []) {
		if (!isAlertDirection(row.direction)) continue;
		const list = alertsBySymbol.get(row.symbol);
		if (list) list.push(toPriceAlert(row));
		else alertsBySymbol.set(row.symbol, [toPriceAlert(row)]);
	}
	const entries = (itemRows ?? []).map((row) => ({
		symbol: row.symbol,
		alerts: alertsBySymbol.get(row.symbol) ?? [],
		addedAt: row.created_at
	}));
	cachedEntries = entries;
	return entries;
}
/** Add a stock to the signed-in user's watchlist. Throws on unknown symbols. Idempotent. */
async function insertWatchlistItem(symbol) {
	const upper = symbol.trim().toUpperCase();
	if (!getStock(upper)) throw new Error(`Unknown stock symbol: ${symbol}`);
	const supabase = getSupabase();
	const userId = await requireUserId();
	const { data, error } = await supabase.from("watchlist_items").upsert({
		user_id: userId,
		symbol: upper
	}, { onConflict: "user_id,symbol" }).select("id,user_id,symbol,created_at").single();
	if (error) throw new Error(`Couldn't add ${upper} to your watchlist: ${error.message}`);
	const row = data;
	return {
		symbol: row.symbol,
		alerts: [],
		addedAt: row.created_at
	};
}
/** Remove a stock — and all of its price alerts — from the signed-in user's watchlist. */
async function removeWatchlistItem(symbol) {
	const upper = symbol.trim().toUpperCase();
	const supabase = getSupabase();
	const userId = await requireUserId();
	const { error: alertsError } = await supabase.from("price_alerts").delete().eq("user_id", userId).eq("symbol", upper);
	if (alertsError) throw new Error(`Couldn't remove ${upper} from your watchlist: ${alertsError.message}`);
	const { error: itemError } = await supabase.from("watchlist_items").delete().eq("user_id", userId).eq("symbol", upper);
	if (itemError) throw new Error(`Couldn't remove ${upper} from your watchlist: ${itemError.message}`);
}
/** Add a price alert for a watched stock. */
async function insertPriceAlert(input) {
	assertPaise(input.pricePaise);
	const upper = input.symbol.trim().toUpperCase();
	const supabase = getSupabase();
	const userId = await requireUserId();
	const { data, error } = await supabase.from("price_alerts").insert({
		user_id: userId,
		symbol: upper,
		target_price_paise: input.pricePaise,
		direction: input.kind
	}).select("id,user_id,symbol,target_price_paise,direction,created_at").single();
	if (error) throw new Error(`Couldn't save your price alert: ${error.message}`);
	return toPriceAlert(data);
}
/**
* Delete a price alert by id. Named delete* to avoid clashing with the pure
* `removePriceAlert(entries, symbol, alertId)` helper below, whose signature
* must stay unchanged.
*/
async function deletePriceAlert(id) {
	const supabase = getSupabase();
	const userId = await requireUserId();
	const { error } = await supabase.from("price_alerts").delete().eq("id", id).eq("user_id", userId);
	if (error) throw new Error(`Couldn't delete that price alert: ${error.message}`);
}
function assertPaise(amountPaise) {
	if (!Number.isInteger(amountPaise) || amountPaise <= 0) throw new Error(`Alert price must be a positive integer number of paise, got ${amountPaise}`);
}
/** Is this alert's condition currently met at the given LTP? */
function isAlertMet(alert, ltpPaise) {
	return alert.kind === "above" ? ltpPaise >= alert.pricePaise : ltpPaise <= alert.pricePaise;
}
/**
* Evaluate every watchlist alert against current mock LTPs and return one
* notification-shaped object per alert whose condition is currently met.
* Reads the last snapshot loaded by {@link fetchWatchlist} (empty until the
* first successful fetch) so this stays synchronous for the notifications
* aggregator. The `db` param keeps the signature compatible with a
* notifications aggregator that passes the finance DB.
*/
function watchlistAlerts(_db) {
	const out = [];
	const now = (/* @__PURE__ */ new Date()).toISOString();
	for (const entry of cachedEntries) {
		const ltp = getLTP(entry.symbol);
		if (ltp <= 0) continue;
		const name = getStock(entry.symbol)?.name ?? entry.symbol;
		for (const alert of entry.alerts) {
			if (!isAlertMet(alert, ltp)) continue;
			const direction = alert.kind === "above" ? "rose above" : "fell below";
			out.push({
				id: `watchlist-${entry.symbol}-${alert.id}`,
				kind: "price",
				title: `${entry.symbol} price alert`,
				body: `${name} ${direction} your ${alert.kind} alert of ${formatINR(alert.pricePaise)} — now at ${formatINR(ltp)}.`,
				to: "/watchlist",
				createdAt: now
			});
		}
	}
	return out;
}
var QK_WATCHLIST = ["finverse", "watchlist"];
function useInvalidateWatchlist() {
	const qc = useQueryClient();
	return () => qc.invalidateQueries({ queryKey: QK_WATCHLIST });
}
function useWatchlist() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK_WATCHLIST,
		queryFn: fetchWatchlist
	});
}
function useAddToWatchlist() {
	const invalidate = useInvalidateWatchlist();
	const m = useMutation({
		mutationFn: insertWatchlistItem,
		onSuccess: invalidate
	});
	return {
		...m,
		mutateAdd: (symbol, options) => m.mutate(symbol, options)
	};
}
function useRemoveFromWatchlist() {
	const invalidate = useInvalidateWatchlist();
	const m = useMutation({
		mutationFn: removeWatchlistItem,
		onSuccess: invalidate
	});
	return {
		...m,
		mutateRemove: (symbol, options) => m.mutate(symbol, options)
	};
}
function useAddPriceAlert() {
	const invalidate = useInvalidateWatchlist();
	const m = useMutation({
		mutationFn: insertPriceAlert,
		onSuccess: invalidate
	});
	return {
		...m,
		mutateAddAlert: (symbol, kind, pricePaise, options) => m.mutate({
			symbol,
			kind,
			pricePaise
		}, options)
	};
}
function useRemovePriceAlert() {
	const invalidate = useInvalidateWatchlist();
	const m = useMutation({
		mutationFn: ({ alertId }) => deletePriceAlert(alertId),
		onSuccess: invalidate
	});
	return {
		...m,
		mutateRemoveAlert: (symbol, alertId, options) => m.mutate({
			symbol,
			alertId
		}, options)
	};
}
//#endregion
export { useAddToWatchlist as a, useWatchlist as c, useAddPriceAlert as i, watchlistAlerts as l, fetchWatchlist as n, useRemoveFromWatchlist as o, isAlertMet as r, useRemovePriceAlert as s, QK_WATCHLIST as t };
