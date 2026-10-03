import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as MoneyTooltip, t as ChartSkeleton } from "./shared-CjfpD6Q-.mjs";
import { t as axisTick } from "./money-BQoZl1tz.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as XAxis, f as ResponsiveContainer, i as YAxis, o as Area, p as Tooltip, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NetWorthSpark-BannTItE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Cumulative net-worth sparkline (area) for the last six months. */
function NetWorthSparkInner({ data, ready, loading }) {
	const reducedMotion = usePrefersReducedMotion();
	if (loading || !ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-48" });
	if (data.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-48 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground",
			children: "No history to chart yet"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-5 text-muted-foreground",
			children: "Your cumulative balance over time will appear here once you add transactions."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-48",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 4,
					bottom: 0,
					left: -8
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "netWorthFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-primary)",
							stopOpacity: .35
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-primary)",
							stopOpacity: .03
						})]
					}) }),
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
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tickFormatter: axisTick,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						},
						width: 56
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}),
						cursor: { stroke: "var(--color-border)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						name: "Net worth",
						type: "monotone",
						dataKey: "net",
						stroke: "var(--color-primary)",
						strokeWidth: 2.5,
						fill: "url(#netWorthFill)",
						dot: false,
						activeDot: {
							r: 4,
							fill: "var(--color-primary)"
						},
						isAnimationActive: !reducedMotion
					})
				]
			})
		})
	});
}
/** Memoized: parents re-render on unrelated state (sheet open, refresh) with stable data refs. */
var NetWorthSpark = (0, import_react.memo)(NetWorthSparkInner);
//#endregion
export { NetWorthSpark };
