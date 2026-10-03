import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, n as formatINRShort, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as XAxis, c as ReferenceLine, f as ResponsiveContainer, i as YAxis, o as Area, p as Tooltip, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { H as Plus, L as RefreshCw, _n as ArrowLeft, an as Bot, rt as Minus, x as Star } from "../_libs/lucide-react.mjs";
import { n as NumberDisplay, t as EmptyState } from "./EmptyState-DJbWsGIR.mjs";
import { a as mcapBandOf, i as getStock, o as sectorMedianPE, r as STOCKS, s as sectorMedianReturn, t as MCAP_BANDS } from "./data-_btm06jU.mjs";
import { a as refreshLTP, i as getLTP, n as dayChange, r as genHistory } from "./history-mUmaAsie.mjs";
import { n as Sheet, r as SheetContent, t as Pill$1 } from "./sheet-B4iSeRDW.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as insertTransaction, R as updateHolding, T as insertHolding, c as deleteHolding, r as defaultAccountId, v as fetchHoldings } from "./db-36JnVPiF.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as Badge } from "./badge-BTFnlnnm.mjs";
import { n as CardContent, t as Card } from "./card-DYllYZYI.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as SipSheet } from "./SipSheet-BtZmmlnJ.mjs";
import { t as useWatchlist } from "./useWatchlist-CrOaZuZW.mjs";
import { t as Route } from "./stocks._symbol-D5dKaE9z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stocks._symbol-EpxTP7Ii.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var toPaise = (rupeesText) => {
	const v = Number.parseFloat(rupeesText);
	if (!Number.isFinite(v) || v < 0) return 0;
	return Math.round(v * 100);
};
/**
* Bottom-sheet order ticket: Market/Limit segmented control, qty/amount
* toggle input, live estimated-cost readout. Confirm stays disabled until
* the order is valid.
*
* The summary footer (estimated cost + confirm CTA) is sticky — always
* visible even when the ticket content scrolls.
*/
function OrderSheet({ open, onOpenChange, symbol, name, ltpPaise, side = "buy", onConfirm }) {
	const [type, setType] = (0, import_react.useState)("market");
	const [mode, setMode] = (0, import_react.useState)("qty");
	const [qtyText, setQtyText] = (0, import_react.useState)("1");
	const [amountText, setAmountText] = (0, import_react.useState)("");
	const [limitText, setLimitText] = (0, import_react.useState)("");
	const pricePaise = type === "market" ? ltpPaise : toPaise(limitText);
	const qtyFromMode = mode === "qty" ? Math.max(0, Math.floor(Number.parseFloat(qtyText) || 0)) : pricePaise > 0 ? Math.floor(toPaise(amountText) / pricePaise) : 0;
	const estimatedPaise = qtyFromMode * pricePaise;
	const valid = qtyFromMode > 0 && pricePaise > 0;
	const segmented = (options, value, onChange, label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"aria-label": label,
		className: "flex rounded-full bg-muted p-1",
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": value === o.value,
			onClick: () => onChange(o.value),
			className: cn(pressable, "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors", value === o.value ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"),
			children: o.label
		}, o.label))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "bottom",
			className: "mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col gap-0 rounded-t-3xl border-t px-0 pt-3 pb-0",
			"aria-label": `Place ${side} order for ${symbol}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "mx-auto mb-2 block h-1.5 w-12 shrink-0 rounded-full bg-muted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-base font-bold text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("mr-2 capitalize", side === "buy" ? "text-gain" : "text-loss"),
									children: side
								}), symbol]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted-foreground",
								children: ["LTP ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
									paise: ltpPaise,
									className: "font-bold text-foreground"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-4",
							children: [
								segmented([{
									value: "market",
									label: "Market"
								}, {
									value: "limit",
									label: "Limit"
								}], type, setType, "Order type"),
								type === "limit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground uppercase",
										children: "Limit price (₹)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										inputMode: "decimal",
										value: limitText,
										onChange: (e) => setLimitText(e.target.value.replace(/[^0-9.]/g, "")),
										placeholder: "0.00",
										className: "h-12 rounded-[14px] border border-input bg-card px-4 text-lg font-bold text-foreground tabular-nums"
									})]
								}),
								segmented([{
									value: "qty",
									label: "Quantity"
								}, {
									value: "amount",
									label: "Amount"
								}], mode, setMode, "Entry mode"),
								mode === "qty" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "Decrease quantity",
											onClick: () => setQtyText(String(Math.max(1, (Number.parseInt(qtyText) || 1) - 1))),
											className: cn(pressable, "grid size-11 place-items-center rounded-full bg-muted text-foreground"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
												className: "size-5",
												"aria-hidden": true
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											inputMode: "numeric",
											"aria-label": "Quantity",
											value: qtyText,
											onChange: (e) => setQtyText(e.target.value.replace(/[^0-9]/g, "")),
											className: "h-14 w-32 rounded-[14px] border border-input bg-card text-center text-2xl font-bold text-foreground tabular-nums"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "Increase quantity",
											onClick: () => setQtyText(String((Number.parseInt(qtyText) || 0) + 1)),
											className: cn(pressable, "grid size-11 place-items-center rounded-full bg-muted text-foreground"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
												className: "size-5",
												"aria-hidden": true
											})
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground uppercase",
										children: "Amount (₹)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										inputMode: "decimal",
										value: amountText,
										onChange: (e) => setAmountText(e.target.value.replace(/[^0-9.]/g, "")),
										placeholder: "0.00",
										className: "h-14 rounded-[14px] border border-input bg-card px-4 text-2xl font-bold text-foreground tabular-nums"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-4",
							"aria-hidden": true
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 border-t border-border bg-background px-6 pt-3 pb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						role: "status",
						"aria-live": "polite",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								"Estimated cost · ",
								qtyFromMode,
								" qty"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
							paise: estimatedPaise,
							className: "text-lg font-bold text-foreground"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !valid,
						onClick: () => onConfirm({
							type,
							mode,
							qty: qtyFromMode,
							pricePaise
						}),
						className: cn(pressable, "mt-3 h-13 w-full rounded-full py-3.5 text-base font-bold text-white transition-colors", valid ? side === "buy" ? "bg-gain hover:opacity-90" : "bg-loss hover:opacity-90" : "cursor-not-allowed bg-muted text-muted-foreground"),
						children: [
							side === "buy" ? "Buy" : "Sell",
							" ",
							symbol
						]
					})]
				})
			]
		})
	});
}
var CHART_RANGES = [
	"1D",
	"1W",
	"1M",
	"1Y"
];
/**
* ChartCard: card wrapper with a 1D/1W/1M/1Y range selector and a render-prop
* chart slot (chart-lib agnostic; recharts works). Provides tooltip helpers:
* format a point's time + price + change vs the previous point.
*/
function ChartCard({ title, action, ranges = CHART_RANGES, defaultRange = "1M", seriesForRange, prevClose, children, className }) {
	const [range, setRange] = (0, import_react.useState)(defaultRange);
	const points = seriesForRange(range);
	const reducedMotion = usePrefersReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [
				title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-bold text-primary-dark",
					children: title
				}),
				action,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "group",
					"aria-label": "Chart range",
					className: "flex rounded-full bg-muted p-0.5",
					children: ranges.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": range === r,
						onClick: () => setRange(r),
						className: cn(pressable, "min-h-[44px] rounded-full px-3 text-xs font-bold transition-colors", range === r ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"),
						children: r
					}, r))
				})
			]
		}), children({
			points,
			range,
			prevClose,
			reducedMotion,
			formatValue: formatINR
		})]
	});
}
/** Tooltip line: time + price + change vs previous point. */
function chartTooltipLines(points, index) {
	const p = points[index];
	if (!p) return {
		time: "",
		price: ""
	};
	const prev = points[index - 1];
	const change = prev && prev.value !== 0 ? `${p.value >= prev.value ? "+" : "−"}${Math.abs((p.value - prev.value) / prev.value * 100).toFixed(2)}%` : void 0;
	return {
		time: p.time,
		price: formatINR(p.value),
		change
	};
}
/**
* recharts Tooltip `formatter` showing price + change vs the previous point.
* Usage: <Tooltip formatter={(value, _name, item) => tooltipFormatter(points, item?.payload)} />
*/
function chartTooltipFormatter(points, payload) {
	const index = points.findIndex((p) => payload && p.time === payload.time);
	const { price, change } = chartTooltipLines(points, index < 0 ? 0 : index);
	return [change ? `${price} (${change})` : price, "Price"];
}
/**
* Apply an order to an existing holding (or none, for a first buy).
*
* Returns the `{ qty, avgPricePaise }` values to upsert, or `null` when a
* sell closes the position (the caller deletes the row).
*
* Behavior contract (matches the legacy `usePlaceOrder` mutation):
*  - buy-new       → `{ qty, avgPricePaise: pricePaise }`
*  - buy-existing  → weighted average
*                    `Math.round((oldQty * oldAvg + qty * price) / newQty)`
*  - sell-partial  → reduced qty, average unchanged
*  - sell-all      → `null`
*  - sell-more-than-held → throw
*  - qty <= 0 / price <= 0 → throw
*/
function applyOrderToHolding(holding, side, qty, pricePaise, symbol) {
	const wholeQty = Math.floor(qty);
	const price = Math.round(pricePaise);
	if (wholeQty <= 0) throw new Error("Quantity must be at least 1.");
	if (price <= 0) throw new Error("Price must be greater than zero.");
	if (side === "buy") {
		if (holding) {
			const newQty = holding.qty + wholeQty;
			return {
				qty: newQty,
				avgPricePaise: Math.round((holding.qty * holding.avgPricePaise + wholeQty * price) / newQty)
			};
		}
		return {
			qty: wholeQty,
			avgPricePaise: price
		};
	}
	const owned = holding?.qty ?? 0;
	if (!holding || holding.qty < wholeQty) throw new Error(`You hold ${owned} × ${symbol} — reduce the quantity to place this sell.`);
	const newQty = holding.qty - wholeQty;
	if (newQty === 0) return null;
	return {
		qty: newQty,
		avgPricePaise: holding.avgPricePaise
	};
}
/**
* Simulated-brokerage order execution. Every order writes the shared ledger
* as a TRANSFER (brief §12: investment buys/sells are cash ↔ investments
* moves, never expenses/income):
*  - BUY  -> upsert `holdings` (weighted-average qty/avg_price) + a
*           "transfer" transaction (category "investments",
*           note `BUY SYMBOL × qty @ price`, accountId = cash account
*           debited, no toAccountId — the destination is the holdings
*           ledger, same shape as goal-saving transfers).
*  - SELL -> reduce the holding qty (honest error when insufficient; the
*           holding row is removed when qty reaches zero) + a "transfer"
*           transaction (category "investments", note `SELL SYMBOL × qty @
*           price`, toAccountId = cash account credited).
* Because the type is "transfer", no spend/income aggregation (dashboard
* cash flow, top categories, insights, budgets, AI engine — they all key on
* expense/income) ever counts an investment order as spending. Cash balances
* stay exact via balanceForAccount (transfer debits the source account and
* credits the destination account).
* All money is integer paise. Nothing here touches a real broker.
*/
function usePlaceOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const symbol = input.symbol.toUpperCase();
			const qty = Math.floor(input.qty);
			const pricePaise = Math.round(input.pricePaise);
			const costPaise = qty * pricePaise;
			const accountId = await defaultAccountId();
			const holding = (await fetchHoldings()).find((h) => h.symbol === symbol);
			const outcome = applyOrderToHolding(holding, input.side, qty, pricePaise, symbol);
			if (!holding) {
				if (outcome === null) throw new Error(`Unexpected: sell closed the missing ${symbol} position.`);
				await insertHolding({
					symbol,
					qty: outcome.qty,
					avgPricePaise: outcome.avgPricePaise
				});
			} else if (outcome === null) await deleteHolding(holding.id);
			else if (input.side === "buy") await updateHolding(holding.id, {
				qty: outcome.qty,
				avgPricePaise: outcome.avgPricePaise
			});
			else await updateHolding(holding.id, { qty: outcome.qty });
			const tag = input.side === "buy" ? "BUY" : "SELL";
			return { transactionId: (await insertTransaction({
				type: "transfer",
				amountPaise: costPaise,
				category: "investments",
				note: `${tag} ${symbol} × ${qty} @ ${formatINR(pricePaise)}`,
				dateISO: todayISO(),
				payMode: "Bank",
				...accountId ? input.side === "buy" ? { accountId } : { toAccountId: accountId } : {},
				tags: ["simulated-brokerage"]
			})).id };
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["finverse", "holdings"] });
			qc.invalidateQueries({ queryKey: ["finverse", "transactions"] });
			qc.invalidateQueries({ queryKey: ["finverse", "account-summaries"] });
			qc.invalidateQueries({ queryKey: ["finverse", "tags"] });
		}
	});
}
/** "2026-09-14" -> "14 Sep". Parsed manually to avoid TZ shifts. */
function shortDate(iso) {
	const months = [
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
	];
	const [, m, d] = iso.split("-").map(Number);
	return `${d} ${months[(m ?? 1) - 1] ?? ""}`;
}
/** FNV-1a-ish string hash -> unsigned 32-bit int (for the 1D intraday walk). */
function hashStr(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return h;
}
/**
* Deterministic intraday (1D) series: a seeded 15-minute walk from the
* previous close toward the current price. Demo data — not live ticks.
*/
function intradaySeries(sym, prevClosePaise, endPaise) {
	let seed = hashStr(`${sym.toUpperCase()}:1D`);
	const rand = () => {
		seed = Math.imul(seed ^ seed >>> 15, 1 | seed) + 1831565813 | 0;
		const t = Math.imul(seed ^ seed >>> 7, 61 | seed) ^ seed;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
	const steps = 26;
	const points = [];
	for (let i = 0; i < steps; i++) {
		const drift = prevClosePaise + (endPaise - prevClosePaise) * i / 25;
		const noise = (rand() - .5) * 2 * .004;
		const value = Math.max(1, Math.round(drift * (1 + noise)));
		const minutes = 555 + i * 15;
		const hh = Math.floor(minutes / 60);
		const mm = String(minutes % 60).padStart(2, "0");
		points.push({
			time: `${hh}:${mm}`,
			value
		});
	}
	points[25] = {
		time: points[25].time,
		value: endPaise
	};
	return points;
}
/** Deterministic rule-based analysis — explainable, no model involved. */
function analyze(stock) {
	const medianPE = sectorMedianPE(stock.sector);
	const medianRet = sectorMedianReturn(stock.sector);
	const points = [];
	const ratio = medianPE > 0 ? stock.pe / medianPE : 1;
	points.push(ratio < .8 ? {
		title: "Valuation",
		verdict: "positive",
		verdictLabel: "Attractive vs peers",
		evidence: [`P/E ${stock.pe.toFixed(1)} is ${((1 - ratio) * 100).toFixed(0)}% below the ${stock.sector} sector median of ${medianPE.toFixed(1)} — you pay less per rupee of earnings than peers.`, `EPS of ${formatINR(stock.epsPaise)} with a ${stock.divYield.toFixed(2)}% dividend yield adds cash return on top of price.`],
		confidence: "Medium"
	} : ratio > 1.25 ? {
		title: "Valuation",
		verdict: "negative",
		verdictLabel: "Expensive vs peers",
		evidence: [`P/E ${stock.pe.toFixed(1)} is ${((ratio - 1) * 100).toFixed(0)}% above the ${stock.sector} sector median of ${medianPE.toFixed(1)} — high growth expectations are already priced in.`, `At this multiple the stock needs sustained earnings growth to justify the price.`],
		confidence: "Medium"
	} : {
		title: "Valuation",
		verdict: "neutral",
		verdictLabel: "Fairly valued vs peers",
		evidence: [`P/E ${stock.pe.toFixed(1)} sits within ±25% of the ${stock.sector} sector median (${medianPE.toFixed(1)}).`, `Dividend yield ${stock.divYield.toFixed(2)}% provides a modest income component.`],
		confidence: "High"
	});
	const r = stock.oneYReturnPct;
	points.push(r > medianRet + 5 && r > 10 ? {
		title: "Momentum",
		verdict: "positive",
		verdictLabel: "Strong momentum",
		evidence: [`1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% beats the ${stock.sector} sector median of ${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% by ${(r - medianRet).toFixed(1)} points.`, `The stock is closer to its 52-week high (${formatINR(stock.high52wPaise)}) than its low (${formatINR(stock.low52wPaise)}).`],
		confidence: "Medium"
	} : r < medianRet - 5 || r < -10 ? {
		title: "Momentum",
		verdict: "negative",
		verdictLabel: "Weak momentum",
		evidence: [`1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% trails the ${stock.sector} sector median of ${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% — the market has been de-rating it.`, `Weak momentum can persist; check whether earnings, not just sentiment, are recovering before averaging down.`],
		confidence: "Medium"
	} : {
		title: "Momentum",
		verdict: "neutral",
		verdictLabel: "Moving with peers",
		evidence: [`1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% is within 5 points of the ${stock.sector} sector median (${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}%) — no strong trend either way.`],
		confidence: "High"
	});
	const roe = stock.roe;
	const de = stock.debtEquity;
	if (roe !== null && roe >= 15 && (de === null || de <= 1)) points.push({
		title: "Quality",
		verdict: "positive",
		verdictLabel: "High-quality business",
		evidence: [`ROE of ${roe.toFixed(1)}% shows strong returns on shareholder capital.`, de === null ? `Leverage is not meaningful for this ${stock.sector} business.` : `Debt-to-equity of ${de.toFixed(2)} keeps balance-sheet risk low.`],
		confidence: "High"
	});
	else if (roe !== null && roe < 8 || de !== null && de > 1.5) {
		const flags = [];
		if (roe !== null && roe < 8) flags.push(`ROE of ${roe.toFixed(1)}% is below the 8% quality bar — capital is not compounding well.`);
		if (de !== null && de > 1.5) flags.push(`Debt-to-equity of ${de.toFixed(2)} is elevated — interest costs can eat earnings in a downturn.`);
		points.push({
			title: "Quality",
			verdict: "negative",
			verdictLabel: "Quality flags",
			evidence: flags,
			confidence: "Medium"
		});
	} else {
		const parts = [];
		if (roe !== null) parts.push(`ROE of ${roe.toFixed(1)}% is decent but below the 15% high-quality bar.`);
		else parts.push(`ROE is not disclosed for this ${stock.sector} listing, so quality is judged on leverage alone.`);
		if (de !== null) parts.push(`Debt-to-equity of ${de.toFixed(2)} is manageable.`);
		points.push({
			title: "Quality",
			verdict: "neutral",
			verdictLabel: "Average quality",
			evidence: parts,
			confidence: "Medium"
		});
	}
	return points;
}
var VERDICT_STYLE = {
	positive: "bg-success-soft text-success",
	neutral: "bg-tint text-primary-dark",
	negative: "bg-destructive/10 text-destructive"
};
function Fundamentals({ stock }) {
	const band = mcapBandOf(stock.marketCapCr);
	const items = [
		["P/E ratio", stock.pe.toFixed(1)],
		["EPS", formatINR(stock.epsPaise)],
		["ROE", stock.roe === null ? "—" : `${stock.roe.toFixed(1)}%`],
		["Debt / Equity", stock.debtEquity === null ? "—" : stock.debtEquity.toFixed(2)],
		["Market cap", `${formatINRShort(stock.marketCapCr * 1e9)} (${MCAP_BANDS[band].label})`],
		["Dividend yield", `${stock.divYield.toFixed(2)}%`],
		["52-week high", formatINR(stock.high52wPaise)],
		["52-week low", formatINR(stock.low52wPaise)],
		["1-year return", `${stock.oneYReturnPct >= 0 ? "+" : "−"}${Math.abs(stock.oneYReturnPct).toFixed(1)}%`]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
		children: items.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border bg-surface-soft px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-bold text-primary-dark tabular-nums",
				children: value
			})]
		}, label))
	});
}
function Overview({ stock }) {
	const band = mcapBandOf(stock.marketCapCr);
	const medianPE = sectorMedianPE(stock.sector);
	const medianRet = sectorMedianReturn(stock.sector);
	const peers = STOCKS.filter((s) => s.sector === stock.sector && s.symbol !== stock.symbol).sort((a, b) => b.marketCapCr - a.marketCapCr).slice(0, 4);
	const facts = [
		["Sector", stock.sector],
		["Market-cap band", MCAP_BANDS[band].label],
		["Market cap", formatINRShort(stock.marketCapCr * 1e9)],
		[`Sector median P/E`, medianPE > 0 ? `${medianPE.toFixed(1)} (stock: ${stock.pe.toFixed(1)})` : "—"],
		["Sector median 1Y return", `${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% (stock: ${stock.oneYReturnPct >= 0 ? "+" : "−"}${Math.abs(stock.oneYReturnPct).toFixed(1)}%)`]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm leading-6 text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-foreground",
					children: stock.name
				}),
				" is a",
				" ",
				MCAP_BANDS[band].label.toLowerCase(),
				" ",
				stock.sector.toLowerCase(),
				" listing in the FinVerse demo stock universe of ",
				STOCKS.length,
				" instruments. Figures below are illustrative data for a college project — not company research."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3",
			children: facts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-surface-soft px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-xs font-medium text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 font-bold text-primary-dark tabular-nums",
					children: value
				})]
			}, label))
		}),
		peers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground",
				children: "Sector peers"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-wrap gap-2",
				children: peers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/stocks/$symbol",
					params: { symbol: p.symbol },
					className: cn("inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary", "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95"),
					children: [p.symbol, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tabular-nums text-muted-foreground",
						children: formatINR(p.pricePaise)
					})]
				}) }, p.symbol))
			})]
		})
	] });
}
/**
* Per-share and valuation ratios derived honestly from the demo dataset:
* earnings yield = EPS ÷ price, dividend per share = yield × price, implied
* book value per share = EPS ÷ ROE. No real company financials are involved.
*/
function Financials({ stock, pricePaise }) {
	const earningsYieldPct = pricePaise > 0 ? stock.epsPaise / pricePaise * 100 : 0;
	const dpsPaise = stock.divYield / 100 * pricePaise;
	const bvpsPaise = stock.roe !== null && stock.roe > 0 ? stock.epsPaise / stock.roe * 100 : null;
	const priceToBook = bvpsPaise !== null && bvpsPaise > 0 ? pricePaise / bvpsPaise : null;
	const items = [
		["Earnings per share", formatINR(stock.epsPaise)],
		["Earnings yield", `${earningsYieldPct.toFixed(2)}%`],
		["Dividend per share", formatINR(dpsPaise)],
		["Dividend yield", `${stock.divYield.toFixed(2)}%`],
		["Implied book value / share", bvpsPaise === null ? "—" : formatINR(bvpsPaise)],
		["Implied price / book", priceToBook === null ? "—" : `${priceToBook.toFixed(2)}×`],
		["P/E ratio", stock.pe.toFixed(1)],
		["ROE", stock.roe === null ? "—" : `${stock.roe.toFixed(1)}%`],
		["Debt / Equity", stock.debtEquity === null ? "—" : stock.debtEquity.toFixed(2)]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
		children: items.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border bg-surface-soft px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-bold text-primary-dark tabular-nums",
				children: value
			})]
		}, label))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-xs text-muted-foreground",
		children: "Illustrative ratios derived from the FinVerse demo dataset — not real company financials."
	})] });
}
function StockDetailPage() {
	const { symbol } = Route.useParams();
	const sym = symbol.toUpperCase();
	const stock = getStock(sym);
	const { isWatched, toggle } = useWatchlist();
	const placeOrder = usePlaceOrder();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [orderSide, setOrderSide] = (0, import_react.useState)(null);
	const [sipOpen, setSipOpen] = (0, import_react.useState)(false);
	const reducedMotion = usePrefersReducedMotion();
	const [ltp, setLtp] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setMounted(true), []);
	(0, import_react.useEffect)(() => {
		if (stock) setLtp(getLTP(sym));
	}, [stock, sym]);
	const history = (0, import_react.useMemo)(() => genHistory(sym, 1260), [sym]);
	const change = (0, import_react.useMemo)(() => dayChange(history), [history]);
	const prevClose = history.length >= 2 ? history[history.length - 2].closePaise : void 0;
	const displayPrice = ltp ?? stock?.pricePaise ?? 0;
	const seriesForRange = (0, import_react.useCallback)((range) => {
		if (range === "1D") return intradaySeries(sym, prevClose ?? displayPrice, displayPrice);
		const days = range === "1W" ? 5 : range === "1M" ? 22 : range === "3M" ? 63 : range === "5Y" ? 1260 : 252;
		return history.slice(-days).map((p) => ({
			time: shortDate(p.date),
			value: p.closePaise
		}));
	}, [
		sym,
		history,
		prevClose,
		displayPrice
	]);
	if (!stock) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Stock not found",
		active: "Screener",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: `No data for "${symbol}"`,
			body: "This symbol isn't in the FinVerse demo dataset. Try the screener to browse the 40 covered stocks."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/screener",
				className: "text-sm font-bold text-primary hover:underline",
				children: "← Back to screener"
			})
		})]
	});
	const analysis = analyze(stock);
	const watched = isWatched(sym);
	const posInRange = stock.high52wPaise > stock.low52wPaise ? Math.max(0, Math.min(100, (displayPrice - stock.low52wPaise) / (stock.high52wPaise - stock.low52wPaise) * 100)) : 50;
	function handleRefresh() {
		setLtp(refreshLTP(sym));
	}
	function handleConfirm(order) {
		if (placeOrder.isPending || orderSide === null) return;
		const side = orderSide;
		placeOrder.mutate({
			side,
			symbol: sym,
			qty: order.qty,
			pricePaise: order.pricePaise
		}, {
			onSuccess: () => {
				toast.success(`Simulated ${side} order placed · ${sym} × ${order.qty} @ ${formatINR(order.pricePaise)}`);
				setOrderSide(null);
			},
			onError: (e) => toast.error(e.message || "Order failed — try again.")
		});
	}
	const gradId = `priceFill-${sym}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: stock.name,
		active: "Screener",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			"aria-pressed": watched,
			"aria-label": watched ? "Remove from watchlist" : "Add to watchlist",
			onClick: () => toggle(sym),
			className: pressable,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: watched ? "size-4 fill-amber-400 text-amber-400" : "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: watched ? "Watching" : "Watch"
			})]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/screener",
						className: "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Screener"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						children: stock.symbol
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: stock.sector
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
						variant: "neutral",
						size: "sm",
						label: "Simulated data",
						children: "SIMULATION"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Simulated price — not live market data"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [ltp === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-44" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-4xl font-black text-primary-dark tabular-nums",
						children: formatINR(ltp)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleRefresh,
						className: `rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary ${pressable}`,
						"aria-label": "Refresh price",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 text-sm font-bold tabular-nums", change.changePaise >= 0 ? "text-success" : "text-destructive"),
					children: [
						change.changePaise >= 0 ? "+" : "−",
						" ",
						formatINR(Math.abs(change.changePaise)),
						" (",
						change.changePaise >= 0 ? "+" : "−",
						Math.abs(change.changePct).toFixed(2),
						"% today)"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatINR(stock.low52wPaise) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "52-week range"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatINR(stock.high52wPaise) })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-1.5 h-2 rounded-full bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-y-0 left-0 rounded-full bg-primary/40",
							style: { width: `${posInRange}%` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary-dark",
							style: { left: `${posInRange}%` }
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
				title: "Price history",
				ranges: [
					"1D",
					"1W",
					"1M",
					"3M",
					"1Y",
					"5Y"
				],
				defaultRange: "1D",
				seriesForRange,
				...prevClose !== void 0 ? { prevClose } : {},
				className: "mb-6",
				children: (ctx) => {
					const pts = ctx.points;
					const first = pts[0]?.value ?? displayPrice;
					const last = pts[pts.length - 1]?.value ?? displayPrice;
					const up = last >= first;
					const stroke = up ? "var(--gain)" : "var(--loss)";
					const data = pts.map((p) => ({
						...p,
						rupees: p.value / 100
					}));
					const firstLabel = pts[0]?.time ?? "";
					const lastLabel = pts[pts.length - 1]?.time ?? "";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 rounded-xl" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						role: "img",
						"aria-label": `${stock.name} price ${ctx.range}, ${firstLabel} to ${lastLabel}, ${up ? "up" : "down"} from ${formatINR(first)} to ${formatINR(last)}. Demo data, not live prices.`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data,
								margin: {
									top: 5,
									right: 8,
									bottom: 0,
									left: 8
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: gradId,
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: stroke,
											stopOpacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: stroke,
											stopOpacity: .02
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "time",
										tickLine: false,
										axisLine: false,
										tick: {
											fontSize: 11,
											fill: "var(--muted-foreground)"
										},
										minTickGap: 40
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										domain: ["auto", "auto"],
										tickLine: false,
										axisLine: false,
										tick: {
											fontSize: 11,
											fill: "var(--muted-foreground)"
										},
										tickFormatter: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
										width: 70
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (_v, _name, item) => chartTooltipFormatter(pts, item?.payload),
										labelFormatter: (label) => label,
										contentStyle: {
											borderRadius: 12,
											fontSize: 13
										}
									}),
									ctx.prevClose !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
										y: ctx.prevClose / 100,
										stroke: "var(--muted-foreground)",
										strokeDasharray: "5 4",
										strokeWidth: 1.5,
										label: {
											value: "Prev close",
											position: "insideTopRight",
											fontSize: 11,
											fill: "var(--muted-foreground)"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "rupees",
										stroke,
										strokeWidth: 2,
										fill: `url(#${gradId})`,
										isAnimationActive: !ctx.reducedMotion && !reducedMotion
									})
								]
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Demo series generated deterministically per stock — not live market data. Dashed line marks the previous close."
					})] });
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-base font-bold text-primary-dark",
					children: "Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, { stock })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-base font-bold text-primary-dark",
					children: "Fundamentals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fundamentals, { stock })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-base font-bold text-primary-dark",
					children: "Financials"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Financials, {
					stock,
					pricePaise: displayPrice
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-md bg-tint",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4.5 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-primary-dark",
							children: "AI analysis"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-5 text-xs text-muted-foreground",
						children: "Rule-based reasoning over the figures above. Transparent by design — every claim cites its evidence."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 lg:grid-cols-3",
						children: analysis.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-black uppercase tracking-wide text-primary-dark",
											children: a.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: cn("whitespace-nowrap", VERDICT_STYLE[a.verdict]),
											children: a.verdictLabel
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-3 grid gap-2.5",
										children: a.evidence.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex gap-2 text-[13px] leading-5.5 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }), e]
										}, i))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs font-semibold text-muted-foreground",
										children: ["Confidence: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground",
											children: a.confidence
										})]
									})
								]
							})
						}, a.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 rounded-md bg-tint px-4 py-3 text-xs leading-5 text-muted-foreground",
						children: "This is automated analysis of demo data for a college project — analysis, not financial advice. Real investing decisions should consider your full financial picture and, where needed, a registered investment adviser."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 mt-8 md:bottom-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-modal backdrop-blur",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOrderSide("buy"),
							className: `h-13 flex-1 rounded-full bg-gain py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90 ${pressable}`,
							children: "Buy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOrderSide("sell"),
							className: `h-13 flex-1 rounded-full border border-loss/40 py-3.5 text-base font-bold text-loss transition-colors hover:bg-loss/10 ${pressable}`,
							children: "Sell"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSipOpen(true),
							className: `h-13 rounded-full border border-border px-5 py-3.5 text-base font-bold text-foreground transition-colors hover:bg-muted/60 ${pressable}`,
							children: "Start SIP"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-[11px] text-muted-foreground",
					children: "Simulated brokerage · demo prices, not live market data"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderSheet, {
				open: orderSide !== null,
				onOpenChange: (o) => !o && setOrderSide(null),
				symbol: sym,
				name: stock.name,
				ltpPaise: displayPrice,
				side: orderSide ?? "buy",
				onConfirm: handleConfirm
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SipSheet, {
				open: sipOpen,
				onOpenChange: setSipOpen,
				symbol: sym,
				name: stock.name
			})
		]
	});
}
//#endregion
export { StockDetailPage as component };
