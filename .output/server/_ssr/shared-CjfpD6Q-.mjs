import { n as formatINRShort } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-CjfpD6Q-.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Shared dark-friendly tooltip for the dashboard charts. Values are always
* rendered in short INR form (₹8.4L) since the raw data is integer paise.
*/
function MoneyTooltip({ active, payload, label, title }) {
	if (!active || !payload || payload.length === 0) return null;
	const heading = title ?? label;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card px-3 py-2 shadow-modal",
		children: [heading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1.5 text-xs font-bold text-foreground",
			children: heading
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-1",
			children: payload.map((entry, i) => {
				const color = entry.color ?? entry.payload?.color ?? "#8884d8";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 shrink-0 rounded-full",
							style: { background: color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: entry.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto pl-3 font-bold text-foreground",
							children: formatINRShort(Number(entry.value ?? 0))
						})
					]
				}, i);
			})
		})]
	});
}
/** Skeleton placeholder used while queries or the client mount resolve. */
function ChartSkeleton({ className = "h-56" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "status",
		"aria-label": "Loading chart",
		className: `animate-pulse rounded-md bg-muted/60 ${className}`
	});
}
//#endregion
export { MoneyTooltip as n, ChartSkeleton as t };
