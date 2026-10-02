import { r as formatINR } from "./utils-CLFOCKAi.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as getStock } from "./data-_btm06jU.mjs";
import { r as getLTP } from "./history-CDM6LAry.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-D6Z63jok.js
var WATCHLIST_KEY = "finverse:watchlist:v1";
var isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
function isValidEntry(v) {
	if (typeof v !== "object" || v === null) return false;
	const e = v;
	if (typeof e["symbol"] !== "string" || e["symbol"].length === 0) return false;
	if (!Array.isArray(e["alerts"])) return false;
	return e["alerts"].every((a) => {
		if (typeof a !== "object" || a === null) return false;
		const al = a;
		return typeof al["id"] === "string" && (al["kind"] === "above" || al["kind"] === "below") && typeof al["pricePaise"] === "number" && Number.isInteger(al["pricePaise"]) && al["pricePaise"] > 0;
	});
}
/** Load the watchlist. SSR-safe: returns [] on the server. */
function loadWatchlist() {
	if (!isBrowser()) return [];
	try {
		const raw = window.localStorage.getItem(WATCHLIST_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isValidEntry);
	} catch {
		return [];
	}
}
/** Persist the watchlist. No-op on the server. */
function saveWatchlist(entries) {
	if (!isBrowser()) return;
	window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(entries));
}
function newId() {
	return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function assertPaise(amountPaise) {
	if (!Number.isInteger(amountPaise) || amountPaise <= 0) throw new Error(`Alert price must be a positive integer number of paise, got ${amountPaise}`);
}
/** Add a stock from the market universe. Throws on unknown symbols. Idempotent. */
function addToWatchlist(entries, symbol) {
	const upper = symbol.trim().toUpperCase();
	if (!getStock(upper)) throw new Error(`Unknown stock symbol: ${symbol}`);
	if (entries.some((e) => e.symbol === upper)) return entries;
	return [...entries, {
		symbol: upper,
		alerts: [],
		addedAt: (/* @__PURE__ */ new Date()).toISOString()
	}];
}
function removeFromWatchlist(entries, symbol) {
	return entries.filter((e) => e.symbol !== symbol.trim().toUpperCase());
}
function addPriceAlert(entries, symbol, kind, pricePaise) {
	assertPaise(pricePaise);
	const upper = symbol.trim().toUpperCase();
	return entries.map((e) => e.symbol === upper ? {
		...e,
		alerts: [...e.alerts, {
			id: newId(),
			kind,
			pricePaise,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}]
	} : e);
}
function removePriceAlert(entries, symbol, alertId) {
	const upper = symbol.trim().toUpperCase();
	return entries.map((e) => e.symbol === upper ? {
		...e,
		alerts: e.alerts.filter((a) => a.id !== alertId)
	} : e);
}
/** Is this alert's condition currently met at the given LTP? */
function isAlertMet(alert, ltpPaise) {
	return alert.kind === "above" ? ltpPaise >= alert.pricePaise : ltpPaise <= alert.pricePaise;
}
/**
* Evaluate every watchlist alert against current mock LTPs and return one
* notification-shaped object per alert whose condition is currently met.
* The `db` param keeps the signature compatible with a notifications
* aggregator that passes the finance DB (the watchlist itself is stored
* separately under WATCHLIST_KEY).
*/
function watchlistAlerts(_db) {
	const entries = loadWatchlist();
	const out = [];
	const now = (/* @__PURE__ */ new Date()).toISOString();
	for (const entry of entries) {
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
function useWatchlist() {
	return useQuery({
		queryKey: QK_WATCHLIST,
		queryFn: loadWatchlist
	});
}
function useMutateWatchlist() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (fn) => {
			const next = fn(loadWatchlist());
			saveWatchlist(next);
			return next;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK_WATCHLIST })
	});
}
function useAddToWatchlist() {
	const m = useMutateWatchlist();
	return {
		...m,
		mutateAdd: (symbol, options) => m.mutate((e) => addToWatchlist(e, symbol), options)
	};
}
function useRemoveFromWatchlist() {
	const m = useMutateWatchlist();
	return {
		...m,
		mutateRemove: (symbol, options) => m.mutate((e) => removeFromWatchlist(e, symbol), options)
	};
}
function useAddPriceAlert() {
	const m = useMutateWatchlist();
	return {
		...m,
		mutateAddAlert: (symbol, kind, pricePaise, options) => m.mutate((e) => addPriceAlert(e, symbol, kind, pricePaise), options)
	};
}
function useRemovePriceAlert() {
	const m = useMutateWatchlist();
	return {
		...m,
		mutateRemoveAlert: (symbol, alertId, options) => m.mutate((e) => removePriceAlert(e, symbol, alertId), options)
	};
}
//#endregion
export { useRemovePriceAlert as a, useRemoveFromWatchlist as i, useAddPriceAlert as n, useWatchlist as o, useAddToWatchlist as r, watchlistAlerts as s, isAlertMet as t };
