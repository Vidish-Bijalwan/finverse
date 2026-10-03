import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as MoneyTooltip, t as ChartSkeleton } from "./shared-CjfpD6Q-.mjs";
import { t as axisTick } from "./money-BQoZl1tz.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as XAxis, f as ResponsiveContainer, i as YAxis, l as Bar, p as Tooltip, r as BarChart, s as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CashFlowChart-C80rGEpV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Compact income-vs-expenses bar chart for the cash-flow card.
* Deliberately small (h-44) with a tight axis: no giant bars on empty
* backgrounds. Income renders in the gain token, expenses in the loss
* token; the shared MoneyTooltip makes values readable on hover/focus.
*/
function CashFlowChartInner({ data, ready, loading }) {
	const reducedMotion = usePrefersReducedMotion();
	if (loading || !ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-44" });
	if (data.every((d) => d.income === 0 && d.expense === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-44 flex-col items-center justify-center gap-1 rounded-md bg-muted/40 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground",
			children: "No cash flow in this period"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Add transactions to see income vs expenses."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-44",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data,
				barGap: 2,
				margin: {
					top: 8,
					right: 4,
					bottom: 0,
					left: -12
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						vertical: false,
						stroke: "var(--color-border)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tickLine: false,
						axisLine: false,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						},
						interval: "preserveStartEnd",
						minTickGap: 24
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tickFormatter: axisTick,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						},
						width: 52,
						tickCount: 4
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}),
						cursor: {
							fill: "var(--color-muted)",
							opacity: .35
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						name: "Income",
						dataKey: "income",
						fill: "var(--gain)",
						radius: [
							3,
							3,
							0,
							0
						],
						maxBarSize: 14,
						isAnimationActive: !reducedMotion
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						name: "Spent",
						dataKey: "expense",
						fill: "var(--loss)",
						radius: [
							3,
							3,
							0,
							0
						],
						maxBarSize: 14,
						isAnimationActive: !reducedMotion
					})
				]
			})
		})
	});
}
/** Memoized: parents re-render on unrelated state with stable data refs. */
var CashFlowChart = (0, import_react.memo)(CashFlowChartInner);
//#endregion
export { CashFlowChart };
