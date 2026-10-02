import { i as getStock } from "./data-_btm06jU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-CDM6LAry.js
var RANGE_DAYS = {
	"1M": 22,
	"6M": 126,
	"1Y": 252
};
/** FNV-1a-ish string hash -> unsigned 32-bit int. */
function hashSymbol(symbol) {
	let h = 2166136261;
	for (let i = 0; i < symbol.length; i++) {
		h ^= symbol.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return h;
}
/** Deterministic PRNG. */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function stepBackTradingDay(d) {
	do
		d.setDate(d.getDate() - 1);
	while (d.getDay() === 0 || d.getDay() === 6);
}
/**
* Generate `tradingDays` of history for a symbol, ending today at the stock's
* listed pricePaise. Deterministic per symbol. Returns [] for unknown symbols.
*/
function genHistory(symbol, tradingDays = RANGE_DAYS["1Y"]) {
	const stock = getStock(symbol);
	if (!stock || tradingDays <= 0) return [];
	const rand = mulberry32(hashSymbol(symbol.toUpperCase()));
	const points = [];
	const d = /* @__PURE__ */ new Date();
	let price = stock.pricePaise;
	for (let i = 0; i < tradingDays; i++) {
		points.unshift({
			date: isoDay(d),
			closePaise: Math.max(1, Math.round(price))
		});
		stepBackTradingDay(d);
		const shock = (rand() - .5) * 2 * .022;
		price = price / (1 + shock);
	}
	return points;
}
/** Slice a full history down to a display range. */
function sliceRange(history, range) {
	return history.slice(-RANGE_DAYS[range]);
}
/** Last-traded price with a tiny market-like jitter, cached per symbol. */
var ltpCache = /* @__PURE__ */ new Map();
function jittered(symbol) {
	const stock = getStock(symbol);
	if (!stock) return 0;
	const jitter = (Math.random() - .5) * 2 * .006;
	return Math.max(1, Math.round(stock.pricePaise * (1 + jitter)));
}
/** Stable LTP for a symbol within this session (SSR-safe: pure function of cache). */
function getLTP(symbol) {
	const cached = ltpCache.get(symbol);
	if (cached !== void 0) return cached;
	const v = jittered(symbol);
	ltpCache.set(symbol, v);
	return v;
}
/** Force a fresh jittered LTP — powers the portfolio "refresh prices" button. */
function refreshLTP(symbol) {
	const v = jittered(symbol);
	ltpCache.set(symbol, v);
	return v;
}
/** Day change vs previous close, in paise and percent. */
function dayChange(history) {
	if (history.length < 2) return {
		changePaise: 0,
		changePct: 0
	};
	const last = history[history.length - 1].closePaise;
	const prev = history[history.length - 2].closePaise;
	return {
		changePaise: last - prev,
		changePct: prev === 0 ? 0 : (last - prev) / prev * 100
	};
}
//#endregion
export { sliceRange as a, refreshLTP as i, genHistory as n, getLTP as r, dayChange as t };
