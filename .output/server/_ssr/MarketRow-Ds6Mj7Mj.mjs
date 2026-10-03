import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { cn as Bell, x as Star } from "../_libs/lucide-react.mjs";
import { n as NumberDisplay } from "./EmptyState-DJbWsGIR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MarketRow-Ds6Mj7Mj.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Market instrument row: symbol + name | price → change% chip, with watchlist
* star toggle (aria-pressed) and price-alert bell button.
*/
function MarketRow({ symbol, name, pricePaise, changePct, starred, alerted = false, onToggleStar, onToggleAlert, onClick, className }) {
	const up = changePct >= 0;
	const action = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex shrink-0 items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: (e) => {
				e.stopPropagation();
				onToggleStar();
			},
			"aria-pressed": starred,
			"aria-label": starred ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`,
			className: cn("grid size-9 place-items-center rounded-full transition-colors hover:bg-muted/60", starred ? "text-warning" : "text-muted-foreground"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
				className: "size-4",
				fill: starred ? "currentColor" : "none",
				"aria-hidden": true
			})
		}), onToggleAlert && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: (e) => {
				e.stopPropagation();
				onToggleAlert();
			},
			"aria-pressed": alerted,
			"aria-label": alerted ? `Edit price alert for ${symbol}` : `Set price alert for ${symbol}`,
			className: cn("grid size-9 place-items-center rounded-full transition-colors hover:bg-muted/60", alerted ? "text-info" : "text-muted-foreground"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
				className: "size-4",
				"aria-hidden": true
			})
		})]
	});
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-sm font-bold text-foreground",
				children: symbol
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-xs text-muted-foreground",
				children: name
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex shrink-0 flex-col items-end gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
				paise: pricePaise,
				className: "text-sm font-bold text-foreground"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums", up ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"),
				children: [
					up ? "+" : "−",
					Math.abs(changePct).toFixed(2),
					"%"
				]
			})]
		}),
		action
	] });
	const classes = cn("flex w-full items-center gap-2 rounded-2xl px-3 py-2.5", onClick && "transition-colors hover:bg-muted/60", className);
	if (onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "button",
		tabIndex: 0,
		onClick,
		onKeyDown: (e) => {
			if (e.target !== e.currentTarget) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onClick();
			}
		},
		className: cn(classes, "cursor-pointer focus-visible:outline-2 focus-visible:outline-ring"),
		"aria-label": `${name} (${symbol}), ${up ? "up" : "down"} ${Math.abs(changePct).toFixed(2)} percent`,
		children: content
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: classes,
		children: content
	});
}
//#endregion
export { MarketRow as t };
