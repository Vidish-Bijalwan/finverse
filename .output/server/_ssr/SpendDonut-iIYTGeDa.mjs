import { i as __toESM } from "../_runtime.mjs";
import { n as formatINRShort, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as MoneyTooltip, t as ChartSkeleton } from "./shared-CjfpD6Q-.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { d as Cell, f as ResponsiveContainer, n as PieChart, p as Tooltip, u as Pie } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SpendDonut-iIYTGeDa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Spend-by-category donut for the selected month. Colors come from
* categories.ts; the center label shows total spend; a legend below lists
* every category with its amount. Renders an empty state when there is no
* spend for the month.
*/
function SpendDonutInner({ data, totalPaise, ready, loading }) {
	const reducedMotion = usePrefersReducedMotion();
	if (loading || !ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-64" });
	if (data.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-64 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground",
			children: "No spending this month"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-5 text-muted-foreground",
			children: "Add your first expense and this donut will break it down by category."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-64",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "value",
				nameKey: "label",
				innerRadius: "68%",
				outerRadius: "92%",
				paddingAngle: 2,
				strokeWidth: 2,
				stroke: "var(--color-card)",
				isAnimationActive: !reducedMotion,
				children: data.map((slice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: slice.color }, slice.id))
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
				children: "Total spent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 text-2xl font-black text-primary-dark",
				children: formatINRShort(totalPaise)
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 grid max-h-44 gap-1 overflow-y-auto pr-1",
		children: data.map((slice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/50",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2.5 shrink-0 rounded-full",
					style: { background: slice.color }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate text-foreground",
					children: slice.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-primary-dark",
					children: formatINR(slice.value)
				})
			]
		}, slice.id))
	})] });
}
/** Memoized: parents re-render on unrelated state (sheet open, refresh) with stable data refs. */
var SpendDonut = (0, import_react.memo)(SpendDonutInner);
//#endregion
export { SpendDonut };
