import { at as Inbox } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-BnPbPY9-.js
var import_jsx_runtime = require_jsx_runtime();
/** Friendly empty state with an optional call-to-action. */
function EmptyState({ title, body, actionLabel, onAction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid place-items-center rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-14 place-items-center rounded-full bg-tint",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-6 text-primary" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-bold text-primary-dark",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm leading-6 text-muted-foreground",
				children: body
			}),
			actionLabel && onAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-5",
				onClick: onAction,
				children: actionLabel
			})
		]
	});
}
/** Coloured P&L pill: "+ ₹4,210 (+3.2%)". */
function PnlBadge({ pnlPaise, pct }) {
	const positive = pnlPaise >= 0;
	const sign = positive ? "+" : "−";
	const absRupees = Math.abs(Math.round(pnlPaise / 100)).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: positive ? "inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success" : "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive",
		children: [
			sign,
			" ₹",
			absRupees,
			" (",
			sign,
			Math.abs(pct).toFixed(1),
			"%)"
		]
	});
}
function SectionCard({ title, children, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-border bg-card p-5 shadow-card sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-bold text-primary-dark",
				children: title
			}), action]
		}), children]
	});
}
//#endregion
export { PnlBadge as n, SectionCard as r, EmptyState as t };
