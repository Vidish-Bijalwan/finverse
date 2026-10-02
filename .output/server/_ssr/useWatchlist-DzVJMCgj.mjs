import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useWatchlist-DzVJMCgj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "finverse:watchlist";
function readWatchlist() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
	} catch {
		return [];
	}
}
/**
* Watchlist of stock symbols, persisted to localStorage.
* SSR-safe: reads storage lazily and only writes on the client.
*/
function useWatchlist() {
	const [watchlist, setWatchlist] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setWatchlist(readWatchlist());
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(KEY, JSON.stringify(watchlist));
		} catch {}
	}, [watchlist]);
	const toggle = (0, import_react.useCallback)((symbol) => {
		const s = symbol.toUpperCase();
		setWatchlist((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
	}, []);
	return {
		watchlist,
		isWatched: (0, import_react.useCallback)((symbol) => watchlist.includes(symbol.toUpperCase()), [watchlist]),
		toggle
	};
}
//#endregion
export { useWatchlist as t };
