//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-math-C7WOnwVa.js
var PORTFOLIO_RANGES = [
	"1D",
	"1W",
	"1M",
	"1Y",
	"ALL"
];
/** Trading-day point counts for the daily ranges ("1D" is intraday). */
var RANGE_TRADING_DAYS = {
	"1W": 5,
	"1M": 22,
	"1Y": 252,
	/** ALL is bounded by how much deterministic demo history we generate. */
	ALL: 756
};
/**
* Per-holding totals: invested (cost basis), current value at the given LTP,
* and returns (value − invested) with percent.
*/
function holdingTotals(h, ltpPaise) {
	const investedPaise = Math.round(h.qty * h.avgPricePaise);
	const valuePaise = Math.round(h.qty * Math.round(ltpPaise));
	const pnlPaise = valuePaise - investedPaise;
	return {
		symbol: h.symbol,
		qty: h.qty,
		investedPaise,
		valuePaise,
		pnlPaise,
		pnlPct: investedPaise > 0 ? pnlPaise / investedPaise * 100 : 0
	};
}
/** Sum per-holding totals into portfolio-level totals. Returns math only —
*  current value − invested cost. */
function portfolioTotals(rows) {
	const investedPaise = rows.reduce((a, r) => a + r.investedPaise, 0);
	const valuePaise = rows.reduce((a, r) => a + r.valuePaise, 0);
	const pnlPaise = valuePaise - investedPaise;
	return {
		investedPaise,
		valuePaise,
		pnlPaise,
		pnlPct: investedPaise > 0 ? pnlPaise / investedPaise * 100 : 0
	};
}
/**
* Today's returns for one holding: the change in its value between the last
* demo close and the current simulated LTP. Summed across holdings for the
* portfolio-level "Today's returns" figure.
*/
function todayReturnPaise(qty, ltpPaise, prevClosePaise) {
	const v = Math.round(qty * (Math.round(ltpPaise) - Math.round(prevClosePaise)));
	return v === 0 ? 0 : v;
}
/** FNV-1a-ish string hash -> unsigned 32-bit int (local copy: lib/market/history
*  keeps its PRNG private, and this module imports nothing). */
function hashSeed(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return h;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
/**
* Deterministic intraday price path for the "1D" chart range: `steps` points
* across a 09:15–15:30 trading session. Starts exactly at `prevClosePaise`
* and ends exactly at `ltpPaise` (Brownian bridge), so the series agrees
* with the summary-card numbers. Same symbol + prices => same path.
*/
function genIntraday(symbol, prevClosePaise, ltpPaise, steps = 78) {
	if (steps < 2) throw new Error("genIntraday: steps must be >= 2");
	const rand = mulberry32(hashSeed(`${symbol.toUpperCase()}::1D`));
	const start = Math.round(prevClosePaise);
	const end = Math.round(ltpPaise);
	const walk = [0];
	for (let i = 1; i < steps; i++) walk.push(walk[i - 1] + (rand() - .5) * 2 * .0011 * start);
	const drift = walk[steps - 1] - walk[0];
	const points = [];
	for (let i = 0; i < steps; i++) {
		const t = i / (steps - 1);
		const value = Math.max(1, Math.round(start + (end - start) * t + (walk[i] - walk[0] - drift * t)));
		const minutes = 555 + Math.round(i * (375 / (steps - 1)));
		const label = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
		points.push({
			label,
			valuePaise: value
		});
	}
	return points;
}
/**
* Combine per-symbol price series into a portfolio-value series by zipping
* aligned points and summing qty × price. All input series must share the
* same length and alignment (intraday steps or daily closes ending today).
*/
function combineSeries(seriesBySymbol, qtyBySymbol) {
	const symbols = Object.keys(seriesBySymbol).filter((s) => (qtyBySymbol[s] ?? 0) > 0);
	if (symbols.length === 0) return [];
	const length = seriesBySymbol[symbols[0]].length;
	for (const s of symbols) if (seriesBySymbol[s].length !== length) throw new Error(`combineSeries: misaligned series for ${s}`);
	const out = [];
	for (let i = 0; i < length; i++) {
		let value = 0;
		for (const s of symbols) value += Math.round(qtyBySymbol[s] * seriesBySymbol[s][i].valuePaise);
		out.push({
			label: seriesBySymbol[symbols[0]][i].label,
			valuePaise: value
		});
	}
	return out;
}
/** "2026-09-12" -> "12 Sep"; passes through anything that doesn't look like
*  a YYYY-MM-DD date. */
function shortDateLabel(dateISO) {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateISO);
	if (!m) return dateISO;
	return `${Number.parseInt(m[3], 10)} ${[
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][Number.parseInt(m[2], 10) - 1]}`;
}
/** "2026-09-12" -> "12 Sep 2026". */
function longDateLabel(dateISO) {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateISO);
	if (!m) return dateISO;
	return `${shortDateLabel(dateISO)} ${m[1]}`;
}
/**
* Portfolio value per trading day from per-symbol close series.
*
* Each symbol contributes qty × close only on/after its firstBuyDateISO
* (unknown start = whole series). Leading dates where nothing was held yet
* are DROPPED — the series starts at the first purchase, so a holding bought
* today never renders a fabricated "down from ₹X" history. Dates are
* compared as YYYY-MM-DD strings (lexicographic = chronological).
*/
function portfolioValueSeries(items) {
	if (items.length === 0) return [];
	const closeBySymbol = /* @__PURE__ */ new Map();
	const dateSet = /* @__PURE__ */ new Set();
	for (const it of items) {
		const m = /* @__PURE__ */ new Map();
		for (const c of it.closes) {
			m.set(c.date, c.closePaise);
			dateSet.add(c.date);
		}
		closeBySymbol.set(it.symbol, m);
	}
	const dates = [...dateSet].sort();
	const out = [];
	for (const date of dates) {
		let value = 0;
		let held = false;
		for (const it of items) {
			if (it.qty <= 0) continue;
			if (it.firstBuyDateISO !== void 0 && date < it.firstBuyDateISO) continue;
			const close = closeBySymbol.get(it.symbol)?.get(date);
			if (close === void 0) continue;
			held = true;
			value += Math.round(it.qty * close);
		}
		if (!held && out.length === 0) continue;
		out.push({
			date,
			valuePaise: value
		});
	}
	return out;
}
//#endregion
export { holdingTotals as a, portfolioValueSeries as c, genIntraday as i, shortDateLabel as l, RANGE_TRADING_DAYS as n, longDateLabel as o, combineSeries as r, portfolioTotals as s, PORTFOLIO_RANGES as t, todayReturnPaise as u };
