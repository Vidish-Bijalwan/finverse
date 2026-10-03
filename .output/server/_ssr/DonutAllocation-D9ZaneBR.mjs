import { i as __toESM } from "../_runtime.mjs";
import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as Cell, f as ResponsiveContainer, n as PieChart, p as Tooltip, u as Pie } from "../_libs/recharts+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { n as NumberDisplay } from "./EmptyState-DJbWsGIR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DonutAllocation-D9ZaneBR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_COLORS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)"
];
/**
* Allocation donut (recharts Pie) with a legend list (label, %, value).
* Donut hole shows the total.
*/
function DonutAllocationInner({ items, className }) {
	const total = items.reduce((s, i) => s + i.paise, 0);
	const data = items.map((i, idx) => ({
		...i,
		color: i.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border border-border bg-card p-5 shadow-card", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto h-52 w-52",
			role: "img",
			"aria-label": `Allocation: ${items.map((i) => `${i.label} ${total > 0 ? Math.round(i.paise / total * 100) : 0} percent`).join(", ")}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
					data,
					dataKey: "paise",
					nameKey: "label",
					innerRadius: "68%",
					outerRadius: "100%",
					paddingAngle: 2,
					strokeWidth: 0,
					isAnimationActive: false,
					children: data.map((d, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: d.color }, idx))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (value) => [formatINR(Number(value) || 0), "Value"] })] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Total"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
						paise: total,
						short: true,
						className: "text-lg font-bold text-foreground"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-col gap-2",
			children: data.map((d) => {
				const pct = total > 0 ? d.paise / total * 100 : 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "size-3 shrink-0 rounded-full",
							style: { backgroundColor: d.color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm text-foreground",
							children: d.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-bold text-muted-foreground tabular-nums",
							children: [pct.toFixed(1), "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
							paise: d.paise,
							className: "w-24 shrink-0 text-right text-sm font-bold text-foreground"
						})
					]
				}, d.label);
			})
		})]
	});
}
/** Memoized: parents re-render on unrelated state (sheet open, refresh) with stable data refs. */
var DonutAllocation = (0, import_react.memo)(DonutAllocationInner);
//#endregion
export { DonutAllocation };
