import { i as __toESM } from "../_runtime.mjs";
import { i as monthLabel, r as monthKey, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as ChartSkeleton } from "./shared-CjfpD6Q-.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { B as ReceiptIndianRupee, C as Smartphone, Dt as EyeOff, Et as Eye, Gt as ChevronLeft, H as Plus, V as QrCode, Wt as ChevronRight, _ as Target, c as Users, fn as AtSign, hn as ArrowRight, lt as LayoutGrid, m as TrendingDown, p as TrendingUp, ut as Landmark, vt as HandCoins } from "../_libs/lucide-react.mjs";
import { n as NumberDisplay, t as EmptyState } from "./EmptyState-DJbWsGIR.mjs";
import { i as getStock, r as STOCKS } from "./data-_btm06jU.mjs";
import { i as getLTP, n as dayChange, r as genHistory, t as INDICES } from "./history-mUmaAsie.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { o as categoryById } from "./categories-BtDQEnJC.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as FINVERSE_QUERY_DEFAULTS } from "./query-BmyAv6X-.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as useMonth, I as useUpdateTransaction, S as useHoldings, b as useDeleteTransaction, k as useTransactions, n as useAccountSummaries } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { n as isInvestmentOrder } from "./investments-rsCq6eP0.mjs";
import { s as useSettings } from "./settings-Cxv5Jbfq.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
import { n as greetingName, t as greetingFor } from "./greeting-CuN0KH0P.mjs";
import { n as fetchWatchlist, t as QK_WATCHLIST } from "./watchlist-G_EWDB_C.mjs";
import { a as QrScannerDialog, f as extractPeople, i as PeopleStrip, m as initialsOf, o as RechargeDialog, s as TxnRow, t as CategorizeSheet } from "./payment-contacts-YqMqNSe2.mjs";
import { t as ErrorState } from "./ErrorState-Bx1fnWBD.mjs";
import { t as PullToRefresh } from "./PullToRefresh-l_u7bH81.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-45QNLFNG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Market strip: two labeled groups — "Indices" (NIFTY 50 / SENSEX / BANK
* NIFTY) and "Watchlist" (user stocks) — each in its own compact,
* horizontally scrollable row with scroll-snap.
*
* Each item shows symbol, price, absolute move and % move in muted
* green/red. One quiet muted line labels the strip as simulated — the
* feed is the seeded demo engine (`getLTP` / `genHistory`), never live
* prices.
*
* Deliberately static: the old auto-scroll marquee rendered the first card
* half-scrolled with overlapping text on load, so manual snap-scroll is the
* only motion here.
*/
function MarketStrip({ symbols, className }) {
	const { indices, stocks } = (0, import_react.useMemo)(() => {
		const indices = INDICES.map((idx) => {
			const change = dayChange(genHistory(idx.symbol, 2));
			return {
				symbol: idx.symbol,
				name: idx.name,
				pricePaise: getLTP(idx.symbol),
				changePaise: change.changePaise,
				changePct: change.changePct,
				kind: "index"
			};
		});
		const seen = new Set(indices.map((i) => i.symbol));
		const stocks = [];
		for (const sym of symbols ?? []) {
			const stock = getStock(sym);
			if (!stock || seen.has(stock.symbol)) continue;
			seen.add(stock.symbol);
			const change = dayChange(genHistory(stock.symbol, 2));
			stocks.push({
				symbol: stock.symbol,
				name: stock.name,
				pricePaise: getLTP(stock.symbol),
				changePaise: change.changePaise,
				changePct: change.changePct,
				kind: "stock"
			});
		}
		return {
			indices,
			stocks
		};
	}, [symbols]);
	const card = (it) => {
		const up = it.changePct >= 0;
		const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5",
				children: [up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
					className: "size-3.5 text-gain",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, {
					className: "size-3.5 text-loss",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-bold tracking-wide text-foreground",
					children: it.symbol
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
				paise: it.pricePaise,
				className: "text-sm font-bold tabular-nums text-foreground"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-baseline gap-1.5 text-[11px] tabular-nums",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("font-semibold", up ? "text-gain" : "text-loss"),
					children: [up ? "+" : "−", formatINR(Math.abs(it.changePaise)).replace("₹", "")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("font-bold", up ? "text-gain" : "text-loss"),
					children: [
						"(",
						up ? "+" : "−",
						Math.abs(it.changePct).toFixed(2),
						"%)"
					]
				})]
			})
		] });
		const cls = cn(pressable, "flex w-40 shrink-0 snap-start flex-col gap-1 rounded-xl border border-border/70 bg-card px-3 py-2.5", "hover:border-primary/30");
		const label = `${it.name}, simulated price ${formatINR(it.pricePaise)}, ${up ? "up" : "down"} ${Math.abs(it.changePct).toFixed(2)} percent`;
		return it.kind === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/stocks/$symbol",
			params: { symbol: it.symbol },
			"aria-label": label,
			className: cls,
			children: inner
		}, it.symbol) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "img",
			"aria-label": label,
			className: cn(cls, "cursor-default"),
			children: inner
		}, it.symbol);
	};
	const snapRow = "flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Market strip — simulated data",
		className: cn("rounded-2xl border border-border/70 bg-card p-3", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold text-foreground",
					children: "Markets"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-medium text-muted-foreground",
					children: "Simulated prices — not live data"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-labelledby": "market-strip-indices-heading",
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					id: "market-strip-indices-heading",
					className: "mb-1 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
					children: "Indices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-label": "Market indices",
					className: snapRow,
					children: indices.map(card)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-labelledby": "market-strip-watchlist-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					id: "market-strip-watchlist-heading",
					className: "mb-1 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
					children: "Watchlist"
				}), stocks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-label": "Watched stocks",
					className: snapRow,
					children: stocks.map(card)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-1 py-2 text-xs text-muted-foreground",
					children: "No watched stocks yet — watch a stock to pin it here."
				})]
			})
		]
	});
}
/**
* Map a day changePct to the sparkline's direction color. Near-zero moves
* (|changePct| < 0.05) render muted-flat so a −0.01% day doesn't scream green
* or red.
*/
function directionForChangePct(changePct) {
	if (Math.abs(changePct) < .05) return "flat";
	return changePct > 0 ? "up" : "down";
}
/** Stable ordering: primary key, then symbol (ascending) for determinism. */
function byChangeDesc(a, b) {
	return b.changePct - a.changePct || a.symbol.localeCompare(b.symbol);
}
/**
* Day change of a displayed (possibly jittered) LTP vs the previous close,
* in percent: `(ltp − prevClose) / prevClose × 100`. 0 when the previous
* close is 0 or missing (falls back to the LTP itself).
*
* Mover rows must compute changePct on the SAME price basis they display.
* Mixing a jittered LTP price with a changePct computed against the static
* listed close shows a price and a % that disagree with each other (they can
* even point in opposite directions), so every consumer builds its rows
* with this helper.
*/
function ltpChangePct(ltpPaise, prevClosePaise) {
	const prev = prevClosePaise ?? ltpPaise;
	if (prev === 0) return 0;
	return (ltpPaise - prev) / prev * 100;
}
/**
* Split ONE consistent snapshot into top gainers + top losers.
*
* Both lists are derived from the same `rows` array in a single sort, so
* they are mutually exclusive by construction: a symbol appears in at most
* one list, with the same price/change everywhere it appears. (Naively
* slicing both ends of a small universe can put the middle row in both
* lists — the losers side explicitly excludes gainer symbols.)
*/
function splitMovers(rows, n = 3) {
	const k = Math.max(0, n);
	if (k === 0 || rows.length === 0) return {
		gainers: [],
		losers: []
	};
	const sorted = [...rows].sort(byChangeDesc);
	const gainers = sorted.slice(0, k);
	const gainerSymbols = new Set(gainers.map((r) => r.symbol));
	return {
		gainers,
		losers: sorted.filter((r) => !gainerSymbols.has(r.symbol)).slice(-k).reverse()
	};
}
/**
* Intraday range of a price series as % of its first value:
* `(max − min) / first × 100`. The demo engine exposes no high/low candles
* or traded volume, so the swing of the recent series is the activity proxy.
* Returns 0 for series shorter than 2 points or a zero first value.
*/
function rangePctOf(values) {
	if (values.length < 2) return 0;
	const first = values[0];
	if (first === 0) return 0;
	return (Math.max(...values) - Math.min(...values)) / first * 100;
}
/**
* "Most active" by largest intraday range — the demo engine has no
* traded-volume data, so series swing (max−min over the recent series, via
* `rangePct`) is the activity proxy. Rows without `rangePct` fall back to
* |changePct| so the function stays total on plain MoverRows. Biggest swing
* first; deterministic tiebreak on symbol. Genuinely distinct from
* `topGainers`: a steady climber ranks high there but low here, while a
* volatile stock that closed near flat ranks high here but low there.
*/
function mostActive(rows, n = 3) {
	const activity = (r) => r.rangePct ?? Math.abs(r.changePct);
	return [...rows].sort((a, b) => activity(b) - activity(a) || a.symbol.localeCompare(b.symbol)).slice(0, Math.max(0, n));
}
/**
* Downsample a price history to at most `points` values (paise) for a tiny
* sparkline. Always keeps the first and last points so the spark's direction
* matches the series' direction; evenly spaced in between.
*/
function sparklineValues(history, points = 20) {
	if (points <= 0) return [];
	if (history.length <= points) return history.map((p) => p.closePaise);
	const out = [];
	for (let i = 0; i < points; i++) {
		const idx = Math.round(i * (history.length - 1) / (points - 1));
		out.push(history[idx].closePaise);
	}
	return out;
}
/**
* Map values to an SVG path within a `width`×`height` viewport (padding
* `pad` on each side). Y is inverted for SVG. A flat series (all values
* equal) renders as a horizontal midline — never NaN.
*/
function sparklinePath(values, width, height, pad = 2) {
	if (values.length === 0 || width <= 2 * pad || height <= 2 * pad) return "";
	const min = Math.min(...values);
	const max = Math.max(...values);
	const flat = max === min;
	const span = flat ? 1 : max - min;
	const xStep = values.length === 1 ? 0 : (width - 2 * pad) / (values.length - 1);
	const round1 = (v) => Math.round(v * 10) / 10;
	return `M${values.map((v, i) => {
		const x = pad + i * xStep;
		const y = flat ? height / 2 : pad + (max - v) / span * (height - 2 * pad);
		return `${round1(x)},${round1(y)}`;
	}).join(" L")}`;
}
/** Signed percent label with an Indian minus sign, e.g. "+2.34%" / "−2.34%". */
function changePctLabel(changePct) {
	return `${changePct >= 0 ? "+" : "−"}${Math.abs(changePct).toFixed(2)}%`;
}
var STROKE_FOR_DIRECTION = {
	up: "var(--gain)",
	down: "var(--loss)",
	flat: "var(--muted-foreground)"
};
/**
* Tiny SVG sparkline for price series (watchlist rows, market snapshot).
* The stroke reflects the DAY's direction: pass `direction` derived from the
* day's changePct (vs previous close) via `directionForChangePct` — an
* intraday series can end above its start on a down day, which must still
* paint down-colored.
*/
function Sparkline({ values, width = 72, height = 28, direction, strokeWidth = 1.5, ariaLabel, className }) {
	const id = (0, import_react.useId)();
	const d = sparklinePath(values, width, height);
	const stroke = STROKE_FOR_DIRECTION[direction];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		className: cn("shrink-0", className),
		role: ariaLabel ? "img" : void 0,
		"aria-label": ariaLabel,
		"aria-hidden": ariaLabel ? void 0 : true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
			id: `spark-${id}`,
			x1: "0",
			y1: "0",
			x2: "0",
			y2: "1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
				offset: "0%",
				stopColor: stroke,
				stopOpacity: .25
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
				offset: "100%",
				stopColor: stroke,
				stopOpacity: 0
			})]
		}) }), d ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `${d} L${width - 2},${height - 2} L2,${height - 2} Z`,
			fill: `url(#spark-${id})`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke,
			strokeWidth,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})] }) : null]
	});
}
/**
* Pure dashboard helpers for the home screen (cash flow, recent activity,
* derived insights). Everything here is deterministic over ledger data —
* no invented numbers, no fake insights.
*/
/** "2026-10" shifted by delta months, e.g. shiftMonthKey("2026-10", -1) -> "2026-09". */
function shiftMonthKey(key, delta) {
	const parts = key.split("-").map(Number);
	const y = parts[0] ?? 0;
	const m = parts[1] ?? 1;
	const d = new Date(y, m - 1 + delta, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
/** "2026-10" -> "Oct" for compact chart axis labels. */
function shortMonthLabel(key) {
	const [y, m] = key.split("-").map(Number);
	return [
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
	][(m ?? 1) - 1] ?? String(y ?? "");
}
/** "2026-10-03" -> "3 Oct 2026". */
function dateLabel(dateISO) {
	return (/* @__PURE__ */ new Date(`${dateISO}T00:00:00`)).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
/** "2026-10-03T14:30:00" -> "2:30 PM". Empty string when unparseable. */
function timeLabel(dateTimeISO) {
	const d = new Date(dateTimeISO);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleTimeString("en-IN", {
		hour: "numeric",
		minute: "2-digit"
	});
}
/**
* Trailing `count` monthly income/expense bars ending at `anchorKey`
* (inclusive). Months with no activity yield zero bars — never synthesized.
*/
function buildMonthFlows(txns, anchorKey, count) {
	const flows = [];
	for (let i = count - 1; i >= 0; i--) {
		const key = shiftMonthKey(anchorKey, -i);
		let income = 0;
		let expense = 0;
		for (const t of txns) {
			if (t.dateISO.slice(0, 7) !== key) continue;
			if (isInvestmentOrder(t)) continue;
			if (t.type === "income") income += t.amountPaise;
			else if (t.type === "expense") expense += t.amountPaise;
		}
		flows.push({
			key,
			label: shortMonthLabel(key),
			income,
			expense
		});
	}
	return flows;
}
/**
* Weekly income/expense bars for one month ("1M" view). Weeks are
* day-of-month buckets (1–7, 8–14, …), so every transaction in the month
* lands in exactly one bar and labels stay honest.
*/
function buildWeekFlows(txns, monthKey) {
	const [y, m] = monthKey.split("-").map(Number);
	const lastDay = new Date(y ?? 1970, (m ?? 1) - 1 + 1, 0).getDate();
	const weekCount = Math.ceil(lastDay / 7);
	const weeks = [];
	for (let w = 0; w < weekCount; w++) {
		const start = w * 7 + 1;
		const end = Math.min((w + 1) * 7, lastDay);
		weeks.push({
			key: `${monthKey}-w${w + 1}`,
			label: `${start}–${end}`,
			income: 0,
			expense: 0
		});
	}
	for (const t of txns) {
		if (t.dateISO.slice(0, 7) !== monthKey) continue;
		if (isInvestmentOrder(t)) continue;
		const day = Number(t.dateISO.slice(8, 10));
		const w = weeks[Math.min(Math.ceil(day / 7) - 1, weeks.length - 1)];
		if (!w) continue;
		if (t.type === "income") w.income += t.amountPaise;
		else if (t.type === "expense") w.expense += t.amountPaise;
	}
	return weeks;
}
/**
* Top spending categories (expenses only) for an inclusive month range,
* largest first. `fromKey`/`toKey` are "YYYY-MM" strings. Investment orders
* are excluded — a stock buy is a transfer, not spending.
*/
function topSpendingCategories(txns, fromKey, toKey, limit = 4) {
	const totals = /* @__PURE__ */ new Map();
	for (const t of txns) {
		if (t.type !== "expense") continue;
		if (isInvestmentOrder(t)) continue;
		const key = t.dateISO.slice(0, 7);
		if (key < fromKey || key > toKey) continue;
		totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountPaise);
	}
	return [...totals.entries()].map(([id, value]) => {
		const cat = categoryById(id);
		return {
			id,
			label: cat?.label ?? id,
			color: cat?.color ?? "#64748B",
			value
		};
	}).sort((a, b) => b.value - a.value).slice(0, limit);
}
/**
* The category whose month-over-month spend moved the most (by absolute
* paise), expenses only. Investment orders are excluded (transfers, not
* spending). Returns null when there is no movement at all —
* callers must not render an insight card in that case.
*/
function categoryMover(txns, month, prev) {
	const current = /* @__PURE__ */ new Map();
	const previous = /* @__PURE__ */ new Map();
	for (const t of txns) {
		if (t.type !== "expense") continue;
		if (isInvestmentOrder(t)) continue;
		const key = t.dateISO.slice(0, 7);
		if (key === month) current.set(t.category, (current.get(t.category) ?? 0) + t.amountPaise);
		else if (key === prev) previous.set(t.category, (previous.get(t.category) ?? 0) + t.amountPaise);
	}
	let best = null;
	for (const id of /* @__PURE__ */ new Set([...current.keys(), ...previous.keys()])) {
		const cur = current.get(id) ?? 0;
		const prv = previous.get(id) ?? 0;
		const delta = cur - prv;
		if (delta === 0) continue;
		if (!best || Math.abs(delta) > Math.abs(best.delta)) best = {
			label: categoryById(id)?.label ?? id,
			delta,
			pct: prv > 0 ? Math.round(delta / prv * 100) : null,
			direction: delta > 0 ? "up" : "down"
		};
	}
	return best;
}
/** Most recent transactions first (date desc, id desc tiebreak). */
function recentTransactions(txns, limit = 7) {
	return [...txns].sort((a, b) => b.dateISO.localeCompare(a.dateISO) || b.id.localeCompare(a.id)).slice(0, limit);
}
/** Signed paise for list rendering: income positive, expenses negative.
* Transfers are money-out (negative) except inbound transfers with no source
* account — e.g. sell proceeds landing in cash — which are money-in. */
function signedAmountPaise(t) {
	if (t.type === "income") return t.amountPaise;
	if (t.type === "transfer" && t.toAccountId && !t.accountId) return t.amountPaise;
	return -t.amountPaise;
}
/**
* Second line for a payment-app-style row:
* "3 Oct 2026 · 2:30 PM · Dining · UPI". The category is included only when
* the merchant/name line already shows the note, so context is never lost.
*/
function txnSecondary(t, showCategory) {
	const parts = [dateLabel(t.dateISO)];
	const time = timeLabel(t.createdAt);
	if (time) parts.push(time);
	if (showCategory) parts.push(categoryById(t.category)?.label ?? t.category);
	if (t.payMode) parts.push(payModeLabel(t.payMode));
	return parts.join(" · ");
}
/** "upi_test" -> "UPI · test" — never show raw enum tokens to users. */
function payModeLabel(mode) {
	switch (mode) {
		case "upi_test": return "UPI · test";
		case "razorpay_test": return "Razorpay · test";
		case "bank_test": return "Bank · test";
		default: return mode;
	}
}
/** Net worth = cash + investments + other assets − liabilities. */
function netWorthPaise(inputs) {
	const { cashPaise, investmentsPaise } = inputs;
	const other = inputs.otherAssetsPaise ?? 0;
	const liabilities = inputs.liabilitiesPaise ?? 0;
	return cashPaise + investmentsPaise + other - liabilities;
}
/** Investment returns (P&L) = current value − invested cost. */
function investmentReturnsPaise(currentValuePaise, investedCostPaise) {
	return currentValuePaise - investedCostPaise;
}
/** Monthly cash flow = income − expenses. */
function monthlyCashFlowPaise(incomePaise, expensePaise) {
	return incomePaise - expensePaise;
}
/**
* Percentage change of `current` vs `previous`.
* Returns null when there is no meaningful base (previous === 0 and current
* === 0 → 0; previous === 0 and current !== 0 → null).
*/
function pctChange(current, previous) {
	if (previous === 0) return current === 0 ? 0 : null;
	return (current - previous) / Math.abs(previous) * 100;
}
var CashFlowChart = (0, import_react.lazy)(() => import("./CashFlowChart-C80rGEpV.mjs").then((m) => ({ default: m.CashFlowChart })));
var PERIODS = [
	"1M",
	"3M",
	"6M",
	"1Y"
];
var PERIOD_MONTHS = {
	"1M": 1,
	"3M": 3,
	"6M": 6,
	"1Y": 12
};
function periodLabel(period, anchorMonth) {
	return period === "1M" ? monthLabel(anchorMonth) : `Last ${PERIOD_MONTHS[period]} months`;
}
/**
* Cash flow card (§13): header with period pills, an Income / Spent / Net
* summary row, a compact income-vs-expenses chart, and the top spending
* categories for the selected period. Everything derives from the ledger —
* nothing is synthesized.
*/
function CashFlowCard({ txns, loading, anchorMonth, ready, hideAmounts = false, onAddExpense }) {
	const [period, setPeriod] = (0, import_react.useState)("6M");
	const { flows, fromKey, toKey } = (0, import_react.useMemo)(() => {
		if (period === "1M") return {
			flows: buildWeekFlows(txns, anchorMonth),
			fromKey: anchorMonth,
			toKey: anchorMonth
		};
		const n = PERIOD_MONTHS[period];
		const from = shiftMonthKey(anchorMonth, -(n - 1));
		return {
			flows: buildMonthFlows(txns, anchorMonth, n),
			fromKey: from,
			toKey: anchorMonth
		};
	}, [
		txns,
		anchorMonth,
		period
	]);
	const summary = (0, import_react.useMemo)(() => {
		let income = 0;
		let expense = 0;
		for (const f of flows) {
			income += f.income;
			expense += f.expense;
		}
		return {
			income,
			expense,
			net: monthlyCashFlowPaise(income, expense)
		};
	}, [flows]);
	const topCategories = (0, import_react.useMemo)(() => topSpendingCategories(txns, fromKey, toKey, 4), [
		txns,
		fromKey,
		toKey
	]);
	const netUp = summary.net >= 0;
	const hasActivity = txns.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Cash flow",
		className: "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[15px] font-bold text-foreground",
					children: "Cash flow"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: periodLabel(period, anchorMonth)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "group",
				"aria-label": "Cash flow period",
				className: "flex rounded-full bg-muted p-0.5",
				children: PERIODS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": period === p,
					onClick: () => setPeriod(p),
					className: cn("rounded-full px-3 py-1 text-xs font-bold transition-colors", period === p ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"),
					children: p
				}, p))
			})]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			"aria-label": "Loading cash flow",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					"Income",
					"Spent",
					"Net"
				].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/40 p-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-10 animate-pulse rounded bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1.5 h-5 w-16 animate-pulse rounded bg-muted" })]
				}, l))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-44" })]
		}) : !hasActivity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No transactions yet",
			body: "Add income or expenses and your cash flow will show up here.",
			actionLabel: "Add expense",
			onAction: onAddExpense
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFlowStat, {
						label: "Income",
						paise: summary.income,
						hideAmounts,
						tone: "text-gain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFlowStat, {
						label: "Spent",
						paise: summary.expense,
						hideAmounts,
						tone: "text-loss"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFlowStat, {
						label: "Net",
						paise: summary.net,
						signed: true,
						hideAmounts,
						tone: netUp ? "text-gain" : "text-loss"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1.5 flex items-center gap-4 text-xs font-semibold text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 rounded-full",
							style: { background: "var(--gain)" },
							"aria-hidden": true
						}), "Income"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 rounded-full",
							style: { background: "var(--loss)" },
							"aria-hidden": true
						}), "Spent"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-44" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFlowChart, {
						data: flows,
						ready,
						loading: false
					})
				})]
			}),
			topCategories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-border/60 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
					children: "Top spending"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2.5",
					children: topCategories.map((c) => {
						const pct = summary.expense > 0 ? c.value / summary.expense * 100 : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex min-w-0 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-2.5 shrink-0 rounded-full",
										style: { background: c.color },
										"aria-hidden": true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-semibold text-foreground",
										children: c.label
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 font-bold tabular-nums text-foreground",
									children: hideAmounts ? "₹ ••••••" : formatINR(c.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 h-1 overflow-hidden rounded-full bg-muted",
								role: "img",
								"aria-label": `${c.label}: ${Math.round(pct)}% of spending`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full",
									style: {
										width: `${Math.min(100, Math.max(0, pct))}%`,
										background: c.color
									}
								})
							})]
						}, c.id);
					})
				})]
			})
		] })]
	});
}
function CashFlowStat({ label, paise, signed = false, hideAmounts, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 rounded-xl bg-muted/40 px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs font-medium text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("mt-0.5 truncate text-base font-bold tabular-nums", tone),
			children: hideAmounts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-label": `${label} hidden`,
				children: "₹ ••••••"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
				paise,
				signed
			})
		})]
	});
}
/**
* Recent activity (§14): 5–7 payment-app-style rows — merchant avatar
* (initials), name, date/time/category context, signed tabular amount.
* Recorded transactions are settled, so no status badges are shown
* (no badge-stuffing). Tapping a row opens the receipt/detail sheet;
* swipe left still reveals categorize/delete.
*/
function RecentActivity({ txns, loading, onCategorize, onDelete, onOpenDetail, onAddExpense }) {
	const recent = recentTransactions(txns, 7);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Recent activity",
		className: "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "truncate text-[15px] font-bold text-foreground",
				children: "Recent activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/expenses",
				search: {},
				className: "inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline",
				children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
					className: "size-4",
					"aria-hidden": true
				})]
			})]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-1",
			"aria-label": "Loading transactions",
			children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3 px-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-11 shrink-0 rounded-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/3 rounded-lg" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20 rounded-lg" })
				]
			}, i))
		}) : recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No transactions yet",
			actionLabel: "Add expense",
			onAction: onAddExpense
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: recent.map((t) => {
				const cat = categoryById(t.category);
				const name = t.note || cat?.label || t.category;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnRow, {
					name,
					secondary: txnSecondary(t, t.note.trim().length > 0),
					amountPaise: signedAmountPaise(t),
					onClick: () => onOpenDetail(t),
					swipeActions: {
						onCategorize: () => onCategorize(t),
						onDelete: () => onDelete(t)
					}
				}) }, t.id);
			})
		})]
	});
}
/**
* Receipt-style detail for a single ledger transaction, opened by tapping a
* row in Recent activity. Every field comes from the real transaction —
* no synthesized rows. Edit happens in /expenses, so the sheet offers one
* CTA: "Open in expenses".
*/
function TxnDetailSheet({ txn, accountName, hideAmounts = false, onClose, onOpenExpenses }) {
	const open = txn !== null;
	const cat = txn ? categoryById(txn.category) : void 0;
	const name = txn ? txn.note || cat?.label || txn.category : "";
	const signed = txn ? signedAmountPaise(txn) : 0;
	const inFlow = signed >= 0;
	const time = txn ? timeLabel(txn.createdAt) : "";
	const CatIcon = cat?.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
		open,
		onClose,
		title: "Transaction",
		showCloseButton: true,
		children: txn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3.5 pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "grid size-14 shrink-0 place-items-center rounded-full bg-tint text-lg font-bold text-primary-dark",
							children: initialsOf(name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate text-base font-bold text-foreground",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: txn.type === "income" ? "Money in" : txn.type === "transfer" ? "Transfer" : "Money out"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("shrink-0 text-xl font-bold tabular-nums", inFlow ? "text-gain" : "text-loss"),
							children: hideAmounts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-label": "Amount hidden",
								children: "₹ ••••••"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [inFlow ? "+" : "−", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, { paise: Math.abs(signed) })] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 divide-y divide-border/60 rounded-2xl border border-border bg-card text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailRow, {
							label: "Date & time",
							children: [dateLabel(txn.dateISO), time ? ` · ${time}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Category",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [CatIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatIcon, {
									className: "size-4 text-muted-foreground",
									"aria-hidden": true
								}), cat?.label ?? txn.category]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Paid via",
							children: payModeLabel(txn.payMode)
						}),
						accountName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Account",
							children: accountName
						}),
						txn.goalId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Linked goal",
							children: "Savings goal contribution"
						}),
						txn.billId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Linked bill",
							children: "Bill payment"
						}),
						txn.tags && txn.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Tags",
							children: txn.tags.join(", ")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpenExpenses,
					className: "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover",
					children: ["Open in expenses ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						className: "size-4",
						"aria-hidden": true
					})]
				})
			]
		})
	});
}
function DetailRow({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "min-w-0 truncate text-right font-semibold text-foreground",
			children
		})]
	});
}
/**
* Home insight (§25): renders ONLY when `mover` is derived from real
* ledger data. When there is nothing to say, this renders null — insights
* are never invented to fill the card.
*/
function HomeInsight({ mover, prevMonthKey }) {
	if (!mover) return null;
	const up = mover.direction === "up";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-9 shrink-0 place-items-center rounded-full bg-tint",
			children: up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
				className: "size-4 text-loss",
				"aria-hidden": true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, {
				className: "size-4 text-gain",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm leading-6 text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-foreground",
					children: mover.label
				}),
				" ",
				up ? "rose" : "fell",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
					paise: Math.abs(mover.delta),
					className: up ? "font-bold text-loss" : "font-bold text-gain"
				}),
				mover.pct !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					" (",
					`${Math.abs(mover.pct)}% ${up ? "more" : "less"}`,
					")"
				] }) : "",
				" vs",
				" ",
				monthLabel(prevMonthKey),
				"."
			]
		})]
	});
}
/**
* The full quick-action set. Route targets are cross-checked against the
* file routes in `src/routes/`:
*
* - /payments supports `?flow=recipient|upi-id|upi&upiId&name&amount` and
*   `?tab=send|razorpay|history` (deep-links into its real UPI phases).
*   `?flow=request` opens the in-payments Requests tracker (the real
*   request-money rail); the Razorpay tab is only for test-mode links.
* - /accounts supports `?transfer=1` (opens the real TransferDialog).
* - /expenses supports `?add=1` (opens the real add-expense sheet).
* - /goals supports `?add=1` (opens the real goal form).
*/
var QUICK_ACTIONS = [
	{
		id: "scan-qr",
		label: "Scan QR",
		target: {
			kind: "dialog",
			dialog: "qr-scan"
		}
	},
	{
		id: "pay-contact",
		label: "Pay contact",
		target: {
			kind: "route",
			to: "/payments",
			search: { flow: "recipient" }
		}
	},
	{
		id: "upi-id",
		label: "UPI ID",
		target: {
			kind: "route",
			to: "/payments",
			search: { flow: "upi-id" }
		}
	},
	{
		id: "bank-transfer",
		label: "Bank transfer",
		target: {
			kind: "route",
			to: "/accounts",
			search: { transfer: "1" }
		}
	},
	{
		id: "recharge",
		label: "Recharge",
		target: {
			kind: "dialog",
			dialog: "recharge"
		}
	},
	{
		id: "bills",
		label: "Bills",
		target: {
			kind: "route",
			to: "/bills"
		}
	},
	{
		id: "request",
		label: "Request",
		target: {
			kind: "route",
			to: "/payments",
			search: { flow: "request" }
		}
	},
	{
		id: "more",
		label: "More",
		target: {
			kind: "route",
			to: "/more"
		}
	},
	{
		id: "invest",
		label: "Invest",
		target: {
			kind: "route",
			to: "/portfolio"
		}
	},
	{
		id: "add-expense",
		label: "Add expense",
		target: {
			kind: "route",
			to: "/expenses",
			search: { add: "1" }
		}
	},
	{
		id: "add-goal",
		label: "Add goal",
		target: {
			kind: "route",
			to: "/goals",
			search: { add: "1" }
		}
	}
];
new Map(QUICK_ACTIONS.map((a) => [a.id, a]));
var ICONS = {
	"scan-qr": QrCode,
	"pay-contact": Users,
	"upi-id": AtSign,
	"bank-transfer": Landmark,
	recharge: Smartphone,
	bills: ReceiptIndianRupee,
	request: HandCoins,
	more: LayoutGrid,
	invest: TrendingUp,
	"add-expense": Plus,
	"add-goal": Target
};
/**
* Compact quick-action grid (icon container + short label).
*
* Desktop: compact grid · mobile: 4 columns. Every action resolves through
* the `quick-actions` routing table to a real destination — route deep-links
* into existing flows, or a working dialog (QR scanner / recharge).
*/
function QuickActions({ className }) {
	const navigate = useNavigate();
	const [dialog, setDialog] = (0, import_react.useState)(null);
	const handleScan = (payload) => {
		setDialog(null);
		navigate({
			to: "/payments",
			search: {
				flow: "upi",
				upiId: payload.upiId,
				...payload.name ? { name: payload.name } : {},
				...payload.amountPaise !== null ? { amount: String(payload.amountPaise) } : {}
			}
		});
	};
	const activate = (id) => {
		const action = QUICK_ACTIONS.find((a) => a.id === id);
		if (!action) return;
		const target = action.target;
		if (target.kind === "dialog") {
			setDialog(target.dialog);
			return;
		}
		const s = target.search ?? {};
		switch (target.to) {
			case "/payments":
				navigate({
					to: "/payments",
					search: {
						flow: s["flow"],
						tab: s["tab"],
						upiId: s["upiId"],
						name: s["name"],
						amount: s["amount"]
					}
				});
				break;
			case "/accounts":
				navigate({
					to: "/accounts",
					search: s["transfer"] === "1" ? { transfer: "1" } : {}
				});
				break;
			case "/expenses":
				navigate({
					to: "/expenses",
					search: s["add"] === "1" ? { add: "1" } : {}
				});
				break;
			case "/goals":
				navigate({
					to: "/goals",
					search: s["add"] === "1" ? { add: "1" } : {}
				});
				break;
			default: navigate({ to: target.to });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			"aria-label": "Quick actions",
			className,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-11",
				children: [QUICK_ACTIONS.map(({ id, label }) => {
					const Icon = ICONS[id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => activate(id),
						"aria-label": label,
						className: cn(pressable, "group flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2", "hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: cn("grid size-12 place-items-center rounded-2xl border border-border/70 bg-card text-primary", "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors group-hover:border-primary/40 group-hover:bg-primary/10"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: 2.1
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-full truncate text-[11px] font-semibold leading-tight text-foreground",
							children: label
						})]
					}) }, id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					"aria-hidden": "true",
					className: "hidden sm:block lg:hidden"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScannerDialog, {
			open: dialog === "qr-scan",
			onOpenChange: (o) => !o && setDialog(null),
			onScan: handleScan
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RechargeDialog, {
			open: dialog === "recharge",
			onOpenChange: (o) => !o && setDialog(null)
		})
	] });
}
var CARD$1 = "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5";
var MAX_ROWS = 5;
/**
* Compact watchlist card for the dashboard secondary column (brief §10):
* ~5 rows of icon / name / ticker / price / daily change / tiny sparkline.
* Tapping a row opens the stock detail page; full management lives on the
* /watchlist page. Compact empty state stays ≤220px.
*/
function WatchlistCard() {
	const navigate = useNavigate();
	const { data: entries, isLoading, isError, refetch } = useQuery({
		queryKey: QK_WATCHLIST,
		queryFn: fetchWatchlist,
		...FINVERSE_QUERY_DEFAULTS
	});
	const rows = (0, import_react.useMemo)(() => (entries ?? []).slice(0, MAX_ROWS).map((e) => {
		const stock = getStock(e.symbol);
		const h = genHistory(e.symbol, 22);
		return {
			symbol: e.symbol,
			name: stock?.name ?? e.symbol,
			initial: (stock?.name ?? e.symbol).charAt(0).toUpperCase(),
			pricePaise: getLTP(e.symbol),
			changePct: dayChange(h).changePct,
			spark: sparklineValues(h, 20)
		};
	}), [entries]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Watchlist",
		className: CARD$1,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "truncate text-[15px] font-bold text-foreground",
					children: "Watchlist"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-xs text-muted-foreground",
					children: "Simulated prices — not live market data"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/watchlist",
				className: "inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline",
				children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: "→"
				})]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			"aria-label": "Loading watchlist",
			children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-9 shrink-0 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/3 rounded-lg" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20 rounded-lg" })
				]
			}, i))
		}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			title: "Couldn't load your watchlist",
			body: "Check your connection and try again.",
			onRetry: () => void refetch()
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Build your watchlist",
			body: "Track stocks you care about.",
			actionLabel: "Explore stocks",
			onAction: () => void navigate({ to: "/watchlist" })
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border/60",
			children: rows.map((r) => {
				const up = r.changePct >= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/stocks/$symbol",
					params: { symbol: r.symbol },
					"aria-label": `${r.name} (${r.symbol}), simulated price ${formatINR(r.pricePaise)}, ${up ? "up" : "down"} ${Math.abs(r.changePct).toFixed(2)} percent — open details`,
					className: cn(pressable, "-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/60"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "grid size-9 shrink-0 place-items-center rounded-lg bg-tint text-sm font-black text-primary",
							children: r.initial
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-bold text-foreground",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[11px] font-semibold tracking-wide text-muted-foreground",
								children: r.symbol
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
							values: r.spark,
							width: 64,
							height: 26,
							direction: directionForChangePct(r.changePct)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex w-20 shrink-0 flex-col items-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold tabular-nums text-foreground",
								children: formatINR(r.pricePaise)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[11px] font-bold tabular-nums", up ? "text-gain" : "text-loss"),
								children: changePctLabel(r.changePct)
							})]
						})
					]
				}) }, r.symbol);
			})
		})]
	});
}
var CARD = "min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5";
function IndexCards({ indices }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2",
		role: "list",
		"aria-label": "Market indices",
		children: indices.map((idx) => {
			const up = idx.changePct >= 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "listitem",
				className: "min-w-0 rounded-xl border border-border/60 bg-surface-soft px-2.5 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] font-bold tracking-wide text-muted-foreground",
						children: idx.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-sm font-bold tabular-nums text-foreground",
						children: formatINR(idx.pricePaise)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center justify-between gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-[11px] font-bold tabular-nums", up ? "text-gain" : "text-loss"),
							children: changePctLabel(idx.changePct)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
							values: idx.spark,
							width: 56,
							height: 22,
							direction: directionForChangePct(idx.changePct),
							className: "hidden min-[420px]:block"
						})]
					})
				]
			}, idx.name);
		})
	});
}
function MoverRows({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-0.5",
		children: rows.map((r) => {
			const up = r.changePct >= 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/stocks/$symbol",
				params: { symbol: r.symbol },
				"aria-label": `${r.name} (${r.symbol}), simulated price ${formatINR(r.pricePaise)}, ${up ? "up" : "down"} ${Math.abs(r.changePct).toFixed(2)} percent — open details`,
				className: cn(pressable, "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-bold text-foreground",
						children: r.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[11px] font-semibold tracking-wide text-muted-foreground",
						children: r.symbol
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 items-baseline gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold tabular-nums text-foreground",
						children: formatINR(r.pricePaise)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("min-w-16 text-right text-sm font-bold tabular-nums", up ? "text-gain" : "text-loss"),
						children: changePctLabel(r.changePct)
					})]
				})]
			}) }, r.symbol);
		})
	});
}
function MoverGroup({ label, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverRows, { rows })] });
}
/**
* Market snapshot (brief §9): index cards for NIFTY 50 / SENSEX / BANK NIFTY
* with sparklines, then Top Gainers / Top Losers / Most Active lists. Every
* stock row navigates to the stock detail page. Indices have no detail page
* (same as the market strip) and render as static cards.
*
* One quiet muted line marks the section as simulated — the seeded demo
* engine, never live prices.
*/
function MarketSnapshot() {
	const { indices, gainers, losers, active } = (0, import_react.useMemo)(() => {
		const idx = INDICES.map((i) => {
			const h = genHistory(i.symbol, 22);
			const ltp = getLTP(i.symbol);
			const prevClose = h.length > 1 ? h[h.length - 2].closePaise : void 0;
			return {
				name: i.name,
				pricePaise: ltp,
				changePct: ltpChangePct(ltp, prevClose),
				spark: sparklineValues(h, 20)
			};
		});
		const seen = /* @__PURE__ */ new Set();
		const rows = [];
		for (const s of STOCKS) {
			if (seen.has(s.symbol)) continue;
			seen.add(s.symbol);
			const h = genHistory(s.symbol, 22);
			const ltp = getLTP(s.symbol);
			const prevClose = h.length > 1 ? h[h.length - 2].closePaise : void 0;
			rows.push({
				symbol: s.symbol,
				name: s.name,
				pricePaise: ltp,
				changePct: ltpChangePct(ltp, prevClose),
				rangePct: rangePctOf(sparklineValues(h, 20))
			});
		}
		const { gainers, losers } = splitMovers(rows, 3);
		return {
			indices: idx,
			gainers,
			losers,
			active: mostActive(rows, 3)
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Market snapshot",
		className: CARD,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate text-[15px] font-bold text-foreground",
						children: "Market snapshot"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: "Simulated prices — not live market data"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/screener",
					className: "inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline",
					children: ["All stocks ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "→"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndexCards, { indices }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverGroup, {
						label: "Top gainers",
						rows: gainers
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverGroup, {
						label: "Top losers",
						rows: losers
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverGroup, {
						label: "Most active",
						rows: active
					})
				]
			})
		]
	});
}
var NetWorthSpark = (0, import_react.lazy)(() => import("./NetWorthSpark-BannTItE.mjs").then((m) => ({ default: m.NetWorthSpark })));
var SpendDonut = (0, import_react.lazy)(() => import("./SpendDonut-iIYTGeDa.mjs").then((m) => ({ default: m.SpendDonut })));
/** Money display that honors the persisted privacy preference. */
function PrivateMoney({ paise, signed = false, short = false, animate = false, className }) {
	const [settings] = useSettings();
	if (settings.balancePrivate) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("fv-money tabular-nums", className),
		"aria-label": "Hidden balance",
		children: "₹\xA0••••••"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
		paise,
		signed,
		short,
		animate,
		className: cn("tabular-nums", className)
	});
}
function FinVerseDashboard() {
	const [month, setMonth] = useMonth();
	const [chartsReady, setChartsReady] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const { user, profile } = useAuth();
	const [settings, updateSettings] = useSettings();
	const private_ = settings.balancePrivate ?? false;
	(0, import_react.useEffect)(() => {
		setChartsReady(true);
	}, []);
	const { data: txns, isLoading: txnsLoading, isError: txnsError, refetch: refetchTxns } = useTransactions();
	const { data: holdings, isLoading: holdingsLoading, isError: holdingsError, refetch: refetchHoldings } = useHoldings();
	const { data: summaries, isLoading: accountsLoading, isError: accountsError, refetch: refetchAccounts } = useAccountSummaries();
	const { data: watchEntries, refetch: refetchWatch } = useQuery({
		queryKey: QK_WATCHLIST,
		queryFn: fetchWatchlist,
		...FINVERSE_QUERY_DEFAULTS
	});
	const currentKey = monthKey(/* @__PURE__ */ new Date());
	const prevKey = shiftMonthKey(month, -1);
	const canGoForward = month < currentKey;
	const greeting = greetingFor(/* @__PURE__ */ new Date());
	const displayName = greetingName(profile?.full_name, user?.email);
	const people = (0, import_react.useMemo)(() => extractPeople(txns ?? [], []), [txns]);
	const stats = (0, import_react.useMemo)(() => {
		const all = txns ?? [];
		const byMonth = /* @__PURE__ */ new Map();
		const monthCatSpend = /* @__PURE__ */ new Map();
		for (const t of all) {
			const key = t.dateISO.slice(0, 7);
			let entry = byMonth.get(key);
			if (!entry) {
				entry = {
					income: 0,
					expense: 0
				};
				byMonth.set(key, entry);
			}
			if (isInvestmentOrder(t)) continue;
			if (t.type === "income") entry.income += t.amountPaise;
			else if (t.type === "expense") {
				entry.expense += t.amountPaise;
				if (key === month) monthCatSpend.set(t.category, (monthCatSpend.get(t.category) ?? 0) + t.amountPaise);
			}
		}
		const monthEntry = byMonth.get(month) ?? {
			income: 0,
			expense: 0
		};
		const prevEntry = byMonth.get(prevKey) ?? {
			income: 0,
			expense: 0
		};
		const monthIncome = monthEntry.income;
		const monthExpense = monthEntry.expense;
		const cashFlow = monthlyCashFlowPaise(monthIncome, monthExpense);
		const prevCashFlow = monthlyCashFlowPaise(prevEntry.income, prevEntry.expense);
		const donut = [...monthCatSpend.entries()].map(([id, value]) => {
			const cat = categoryById(id);
			return {
				id,
				label: cat?.label ?? id,
				value,
				color: cat?.color ?? "#64748B"
			};
		}).sort((a, b) => b.value - a.value);
		const keys = [...byMonth.keys()].filter((k) => k <= month).sort();
		const spark = [];
		let running = 0;
		for (const key of keys) {
			const e = byMonth.get(key);
			if (!e) continue;
			running += e.income - e.expense;
			spark.push({
				key,
				label: shortMonthLabel(key),
				net: running
			});
		}
		return {
			monthIncome,
			monthExpense,
			cashFlow,
			prevCashFlow,
			cashFlowPct: pctChange(cashFlow, prevCashFlow),
			donut,
			spark: spark.slice(-6)
		};
	}, [
		txns,
		month,
		prevKey
	]);
	const cashPaise = (0, import_react.useMemo)(() => (summaries ?? []).reduce((sum, s) => sum + s.balancePaise, 0), [summaries]);
	const investmentsPaise = (0, import_react.useMemo)(() => (holdings ?? []).reduce((sum, h) => sum + h.qty * getLTP(h.symbol), 0), [holdings]);
	const investedCostPaise = (0, import_react.useMemo)(() => (holdings ?? []).reduce((sum, h) => sum + h.qty * h.avgPricePaise, 0), [holdings]);
	const investmentPnl = investmentReturnsPaise(investmentsPaise, investedCostPaise);
	const netWorth = netWorthPaise({
		cashPaise,
		investmentsPaise
	});
	const mover = (0, import_react.useMemo)(() => categoryMover(txns ?? [], month, prevKey), [
		txns,
		month,
		prevKey
	]);
	const accountNameById = (0, import_react.useMemo)(() => new Map((summaries ?? []).map((s) => [s.account.id, s.account.name])), [summaries]);
	const watchSymbols = (0, import_react.useMemo)(() => (watchEntries ?? []).map((e) => e.symbol), [watchEntries]);
	const hasTxns = (txns?.length ?? 0) > 0;
	const statsLoading = txnsLoading || accountsLoading || holdingsLoading;
	const lastSpark = stats.spark[stats.spark.length - 1];
	const deleteTxn = useDeleteTransaction();
	const updateTxn = useUpdateTransaction();
	const [categorizing, setCategorizing] = (0, import_react.useState)(null);
	const [detailTxn, setDetailTxn] = (0, import_react.useState)(null);
	const refreshAll = (0, import_react.useCallback)(async () => {
		await Promise.allSettled([
			refetchTxns(),
			refetchHoldings(),
			refetchAccounts(),
			refetchWatch()
		]);
	}, [
		refetchTxns,
		refetchHoldings,
		refetchAccounts,
		refetchWatch
	]);
	const handleDeleteTxn = (t) => {
		deleteTxn.mutate(t.id, {
			onSuccess: () => toast.success("Transaction deleted"),
			onError: () => toast.error("Couldn't delete — try again.")
		});
	};
	const handleCategorize = (categoryId) => {
		const target = categorizing;
		setCategorizing(null);
		if (!target) return;
		updateTxn.mutate({
			id: target.id,
			patch: { category: categoryId }
		}, {
			onSuccess: () => toast.success("Transaction recategorized"),
			onError: () => toast.error("Couldn't update — try again.")
		});
	};
	const openAddExpense = (0, import_react.useCallback)(() => void navigate({
		to: "/expenses",
		search: { add: "1" }
	}), [navigate]);
	const togglePrivacy = () => updateSettings({ balancePrivate: !private_ });
	if (txnsError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-dashboard px-4 pb-16 pt-10 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Couldn't load your dashboard",
				body: "Your transactions failed to load. Check your connection and try again.",
				onRetry: () => void refetchTxns()
			})
		})
	});
	const cashFlowUp = stats.cashFlow >= 0;
	const pnlUp = investmentPnl >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullToRefresh, {
				onRefresh: refreshAll,
				className: "min-h-screen",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "mx-auto w-full max-w-dashboard px-4 pb-16 pt-5 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "hidden text-sm text-muted-foreground md:block",
								children: [
									greeting,
									displayName ? `, ${displayName}` : "",
									"."
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1 rounded-full border border-border bg-card px-1 py-0.5 shadow-card md:ml-0",
								"aria-label": "Select month",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMonth(shiftMonthKey(month, -1)),
										className: cn(pressable, "grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground md:size-8"),
										"aria-label": "Previous month",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-24 px-1 text-center text-sm font-bold text-foreground",
										children: monthLabel(month)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMonth(shiftMonthKey(month, 1)),
										disabled: !canGoForward,
										className: cn(pressable, "grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 md:size-8"),
										"aria-label": "Next month",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "Balance overview",
							className: "mt-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-[13px] font-semibold uppercase tracking-wider text-muted-foreground",
												children: "Net worth"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: togglePrivacy,
												"aria-pressed": private_,
												"aria-label": private_ ? "Show balances" : "Hide balances",
												className: cn(pressable, "grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"),
												children: private_ ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
													className: "size-4",
													"aria-hidden": true
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
													className: "size-4",
													"aria-hidden": true
												})
											})]
										}),
										statsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
											className: "mt-2 h-10 w-44 rounded-lg",
											"aria-label": "Loading net worth"
										}) : accountsError || holdingsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-2xl font-bold text-muted-foreground",
											children: "—"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
											paise: netWorth,
											animate: true,
											className: "mt-1 block text-[32px] font-bold leading-tight text-foreground sm:text-4xl"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-xs text-muted-foreground",
											children: statsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-56 rounded" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												"Cash",
												" ",
												private_ ? "••••••" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
													paise: cashPaise,
													className: "font-semibold text-foreground"
												}),
												" ",
												"+ investments",
												" ",
												private_ ? "••••••" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
													paise: investmentsPaise,
													className: "font-semibold text-foreground"
												}),
												" ",
												"− liabilities ₹0"
											] })
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "shrink-0 text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-semibold uppercase tracking-wider text-muted-foreground",
										children: monthLabel(month)
									}), txnsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto mt-2 h-6 w-24 rounded" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: cn("mt-1 text-lg font-bold tabular-nums", cashFlowUp ? "text-gain" : "text-loss"),
										children: [cashFlowUp ? "+" : "−", private_ ? "••••••" : formatINR(Math.abs(stats.cashFlow))]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["net cash flow", stats.cashFlowPct !== null && ` · ${stats.cashFlowPct >= 0 ? "+" : "−"}${Math.abs(stats.cashFlowPct).toFixed(1)}% vs ${shortMonthLabel(prevKey)}`]
									})] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroMetric, {
										label: "Investments",
										loading: holdingsLoading,
										error: holdingsError,
										onRetry: () => void refetchHoldings(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
											paise: investmentsPaise,
											className: "text-[15px] font-bold"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroMetric, {
										label: "Cash",
										loading: accountsLoading,
										error: accountsError,
										onRetry: () => void refetchAccounts(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
											paise: cashPaise,
											className: "text-[15px] font-bold"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroMetric, {
										label: "Monthly cash flow",
										loading: txnsLoading,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn(cashFlowUp ? "text-gain" : "text-loss"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
												paise: stats.cashFlow,
												signed: true,
												className: "text-[15px] font-bold"
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HeroMetric, {
										label: "Investment P&L",
										loading: holdingsLoading,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn(pnlUp ? "text-gain" : "text-loss"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
												paise: investmentPnl,
												signed: true,
												className: "text-[15px] font-bold"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: "current value minus invested cost"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActions, { className: "mt-5" }),
						people.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "Pay again",
							className: "mt-5 md:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-bold text-foreground",
									children: "Pay again"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/payments",
									className: `flex min-h-[44px] items-center gap-1 px-2 text-xs font-semibold text-primary transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
									children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										className: "size-3.5",
										"aria-hidden": true
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleStrip, {
								people,
								onSelect: (p) => navigate({
									to: "/payments",
									search: {
										flow: "upi",
										name: p.name
									}
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketStrip, {
							symbols: watchSymbols,
							className: "mt-5"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-6 xl:grid-cols-12 xl:items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-col gap-6 xl:col-span-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentActivity, {
										txns: txns ?? [],
										loading: txnsLoading,
										onCategorize: setCategorizing,
										onDelete: handleDeleteTxn,
										onOpenDetail: setDetailTxn,
										onAddExpense: openAddExpense
									}),
									!txnsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeInsight, {
										mover,
										prevMonthKey: prevKey
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFlowCard, {
										txns: txns ?? [],
										loading: txnsLoading,
										anchorMonth: month,
										ready: chartsReady,
										hideAmounts: private_,
										onAddExpense: openAddExpense
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										"aria-label": "Spending analytics",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-4 flex items-end justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-lg font-bold text-foreground",
												children: "Where your money went"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-semibold text-muted-foreground",
												children: monthLabel(month)
											})]
										}), txnsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 rounded-2xl" })]
										}) : !hasTxns ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
											title: "No transactions yet",
											body: "Add your first expense or income and this dashboard will come alive with your cash flow, spending breakdown, and net-worth trend.",
											actionLabel: "Add your first expense",
											onAction: openAddExpense
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
												title: "Spend by category",
												sub: monthLabel(month),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
													fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-64" }),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendDonut, {
														data: stats.donut,
														totalPaise: stats.monthExpense,
														ready: chartsReady,
														loading: false
													})
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
												title: "Net worth trend",
												sub: "Cumulative income minus expenses",
												action: lastSpark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
													paise: lastSpark.net,
													className: cn("text-sm font-bold", lastSpark.net >= 0 ? "text-gain" : "text-loss")
												}),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
													fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-48" }),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetWorthSpark, {
														data: stats.spark,
														ready: chartsReady,
														loading: false
													})
												})
											})]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-col gap-6 xl:col-span-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
										title: "Portfolio snapshot",
										action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/portfolio",
											className: "inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline",
											children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												className: "size-4",
												"aria-hidden": true
											})]
										}),
										children: holdingsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2.5",
											"aria-label": "Loading portfolio",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-3/4 rounded" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-2/3 rounded" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-1/2 rounded" })
											]
										}) : holdingsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
											title: "Couldn't load your portfolio",
											body: "Check your connection and try again.",
											onRetry: () => void refetchHoldings()
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "space-y-2.5 text-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-muted-foreground",
														children: "Current value"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
														paise: investmentsPaise,
														className: "font-bold"
													}) })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-muted-foreground",
														children: "Invested cost"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
														paise: investedCostPaise,
														className: "font-semibold"
													}) })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between border-t border-border/60 pt-2.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-muted-foreground",
														children: "Returns (P&L)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
														className: cn("font-bold", pnlUp ? "text-gain" : "text-loss"),
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateMoney, {
															paise: investmentPnl,
															signed: true
														})
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "pt-1 text-xs text-muted-foreground",
													children: [
														holdings?.length ?? 0,
														" holding",
														(holdings?.length ?? 0) === 1 ? "" : "s",
														" · simulated prices"
													]
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchlistCard, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketSnapshot, {})
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorizeSheet, {
				open: categorizing !== null,
				onOpenChange: (o) => {
					if (!o) setCategorizing(null);
				},
				currentCategory: categorizing?.category,
				onPick: handleCategorize
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnDetailSheet, {
				txn: detailTxn,
				accountName: detailTxn?.accountId ? accountNameById.get(detailTxn.accountId) : void 0,
				hideAmounts: private_,
				onClose: () => setDetailTxn(null),
				onOpenExpenses: () => {
					setDetailTxn(null);
					navigate({
						to: "/expenses",
						search: {}
					});
				}
			})
		]
	});
}
/** One compact hero metric (label + value). Keeps the hero's second row small. */
function HeroMetric({ label, loading, error, onRetry, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "truncate text-xs font-medium text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-0.5 truncate tabular-nums text-foreground",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
				className: "h-5 w-16 rounded",
				"aria-label": `Loading ${label}`
			}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRetry,
				className: "text-xs font-bold text-primary hover:underline",
				children: "Retry"
			}) : children
		})]
	});
}
/** Consistent card chrome (mirrors ChartCard's radius/border/shadow/heading). */
function SectionCard({ title, sub, action, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "truncate text-[15px] font-bold text-foreground",
					children: title
				}), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-xs text-muted-foreground",
					children: sub
				})]
			}), action]
		}), children]
	});
}
//#endregion
export { FinVerseDashboard as component };
