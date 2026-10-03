//#region node_modules/.nitro/vite/services/ssr/assets/investments-rsCq6eP0.js
/**
* Parse a simulated-brokerage ledger note of the form
* "BUY RELIANCE × 10 @ ₹1,580" (see usePlaceOrder in lib/finance/orders.ts).
* Returns null for notes that aren't brokerage orders. The execution price is
* recovered from amount ÷ qty by the caller — formatINR rounds notes to
* whole rupees, so the note text alone can't carry exact paise.
*/
function parseOrderNote(note) {
	const m = /^(BUY|SELL)\s+([A-Z0-9.]+)\s+×\s+(\d+)\s+@/.exec(note.trim());
	if (!m) return null;
	return {
		side: m[1] === "BUY" ? "buy" : "sell",
		symbol: m[2],
		qty: Number.parseInt(m[3], 10)
	};
}
/**
* True for simulated-brokerage investment rows — BUY/SELL orders and SIP
* instalment posts — in BOTH ledger shapes: the current `transfer` shape and
* the legacy `expense`/`income` shape. These must never count as spending or
* income anywhere (dashboard cash flow, insights, expenses views, budgets).
*
* Deliberately narrow: a manually-categorized "investments" expense (e.g. a
* PPF deposit the user logged by hand) carries no simulated-brokerage tag
* and is NOT excluded — only system-written brokerage rows are.
*/
function isInvestmentOrder(t) {
	return t.category === "investments" && (t.tags ?? []).includes("simulated-brokerage");
}
/**
* Earliest BUY order date ("YYYY-MM-DD") per symbol, parsed from
* simulated-brokerage ledger notes. Symbols with no recorded buy (e.g.
* holdings added by hand) are absent — callers must treat "unknown" as
* unknown, never as "bought today".
*/
function firstBuyDateBySymbol(txns) {
	const out = /* @__PURE__ */ new Map();
	for (const t of txns) {
		if (!isInvestmentOrder(t)) continue;
		const parsed = parseOrderNote(t.note);
		if (!parsed || parsed.side !== "buy") continue;
		const prev = out.get(parsed.symbol);
		if (prev === void 0 || t.dateISO < prev) out.set(parsed.symbol, t.dateISO);
	}
	return out;
}
//#endregion
export { isInvestmentOrder as n, parseOrderNote as r, firstBuyDateBySymbol as t };
