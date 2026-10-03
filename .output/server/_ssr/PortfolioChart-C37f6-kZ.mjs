import { i as __toESM } from "../_runtime.mjs";
import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as paiseAxisTick } from "./money-BQoZl1tz.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as XAxis, f as ResponsiveContainer, i as YAxis, o as Area, p as Tooltip, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { r as genHistory } from "./history-mUmaAsie.mjs";
import { t as Pill$1 } from "./sheet-B4iSeRDW.mjs";
import { c as portfolioValueSeries, i as genIntraday, l as shortDateLabel, n as RANGE_TRADING_DAYS, r as combineSeries, t as PORTFOLIO_RANGES } from "./portfolio-math-C7WOnwVa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PortfolioChart-C37f6-kZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function tooltipContent(active, label, points) {
	if (!active || label === void 0) return null;
	const index = points.findIndex((p) => p.label === label);
	const p = points[index];
	if (!p) return null;
	const prev = index > 0 ? points[index - 1] : void 0;
	const changePct = prev && prev.valuePaise > 0 ? (p.valuePaise - prev.valuePaise) / prev.valuePaise * 100 : null;
	const up = changePct === null || changePct >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 font-bold text-foreground tabular-nums",
				children: formatINR(p.valuePaise)
			}),
			changePct !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("font-bold tabular-nums", up ? "text-gain" : "text-loss"),
				children: [
					up ? "+" : "−",
					Math.abs(changePct).toFixed(2),
					"%"
				]
			})
		]
	});
}
/**
* Compact portfolio-value chart for the /portfolio summary card.
*
* Series semantics (labelled honestly below the chart): the value of the
* *current* portfolio composition through each range — for daily ranges,
* each holding's deterministic demo history multiplied by today's qty, but
* starting at each holding's first recorded purchase (no fabricated
* pre-purchase history); for 1D, a deterministic intraday path from the
* last demo close to the current simulated LTP. The final point is always
* the live simulated value ("Now").
*
* Rendered client-side only (lazy route-level gate): LTPs are jittered demo
* prices resolved in an effect, so they must never feed SSR HTML.
*/
function PortfolioChart({ positions, ltpBySymbol, firstBuyDateISOBySymbol }) {
	const [range, setRange] = (0, import_react.useState)("1M");
	const reducedMotion = usePrefersReducedMotion();
	const gradId = (0, import_react.useId)();
	const points = (0, import_react.useMemo)(() => {
		if (!ltpBySymbol || positions.length === 0) return [];
		const qtyBySymbol = {};
		const seriesBySymbol = {};
		const historyItems = [];
		for (const p of positions) {
			qtyBySymbol[p.symbol] = p.qty;
			const ltp = ltpBySymbol[p.symbol];
			if (ltp === void 0) continue;
			if (range === "1D") {
				const daily = genHistory(p.symbol, RANGE_TRADING_DAYS["1M"]);
				const prevClose = daily.length > 1 ? daily[daily.length - 2].closePaise : ltp;
				seriesBySymbol[p.symbol] = genIntraday(p.symbol, prevClose, ltp);
			} else historyItems.push({
				symbol: p.symbol,
				qty: p.qty,
				closes: genHistory(p.symbol, RANGE_TRADING_DAYS[range]),
				...firstBuyDateISOBySymbol?.[p.symbol] ? { firstBuyDateISO: firstBuyDateISOBySymbol[p.symbol] } : {}
			});
		}
		const nowPaise = positions.reduce((a, p) => a + Math.round(p.qty * (ltpBySymbol[p.symbol] ?? 0)), 0);
		if (range === "1D") {
			const combined = combineSeries(seriesBySymbol, qtyBySymbol);
			if (combined.length === 0) return combined;
			return [...combined, {
				label: "Now",
				valuePaise: nowPaise
			}];
		}
		const combined = portfolioValueSeries(historyItems).map((d) => ({
			label: shortDateLabel(d.date),
			valuePaise: d.valuePaise
		}));
		if (combined.length === 0) return combined;
		return [...combined, {
			label: "Now",
			valuePaise: nowPaise
		}];
	}, [
		positions,
		ltpBySymbol,
		range,
		firstBuyDateISOBySymbol
	]);
	const first = points[0];
	const last = points[points.length - 1];
	const up = !first || !last || last.valuePaise >= first.valuePaise;
	const stroke = up ? "var(--gain)" : "var(--loss)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex flex-wrap items-center justify-end gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "group",
				"aria-label": "Portfolio value range",
				className: "flex flex-wrap gap-1.5",
				children: PORTFOLIO_RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
					size: "sm",
					variant: range === r ? "accent" : "neutral",
					onClick: () => setRange(r),
					label: `Show ${r} range`,
					className: cn(range !== r && "cursor-pointer hover:bg-muted"),
					children: r
				}, r))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-44 sm:h-52",
			role: "img",
			"aria-label": first && last ? `Portfolio value, ${range}, ${first.label} to ${last.label}, ${up ? "up" : "down"} from ${formatINR(first.valuePaise)} to ${formatINR(last.valuePaise)}. Simulated demo data, not live prices.` : "Portfolio value chart loading",
			children: points.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: points,
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
								stopOpacity: .3
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
							dataKey: "label",
							tickLine: false,
							axisLine: false,
							tick: {
								fontSize: 11,
								fill: "var(--muted-foreground)"
							},
							minTickGap: 48
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							domain: ["auto", "auto"],
							tickLine: false,
							axisLine: false,
							tick: {
								fontSize: 11,
								fill: "var(--muted-foreground)"
							},
							tickFormatter: paiseAxisTick,
							width: 64
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: ({ active, label }) => tooltipContent(active, label, points),
							cursor: { stroke: "var(--border)" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "valuePaise",
							name: "Value",
							stroke,
							strokeWidth: 2,
							fill: `url(#${gradId})`,
							isAnimationActive: !reducedMotion
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-full place-items-center text-sm text-muted-foreground",
				children: "Building chart…"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Value of your current holdings at simulated prices — history starts at your first recorded purchase per stock. Not live market data."
		})
	] });
}
//#endregion
export { PortfolioChart };
