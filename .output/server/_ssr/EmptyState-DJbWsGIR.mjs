import { i as __toESM } from "../_runtime.mjs";
import { a as performance_default } from "../_libs/h3+rou3+srvx+unenv.mjs";
import { n as formatINRShort, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { pt as Inbox } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmptyState-DJbWsGIR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COUNT_UP_MS = 800;
/**
* Money display with guaranteed tabular numerals. Formats integer paise via
* the existing finance formatters — always use this instead of hand-rolled
* `tabular-nums` spans.
*/
function NumberDisplay({ paise, short = false, signed = false, animate = false, className }) {
	const reducedMotion = usePrefersReducedMotion();
	const shouldAnimate = animate && !reducedMotion;
	const [shownPaise, setShownPaise] = (0, import_react.useState)(shouldAnimate ? 0 : paise);
	const fromRef = (0, import_react.useRef)(shouldAnimate ? 0 : paise);
	(0, import_react.useEffect)(() => {
		if (!shouldAnimate) {
			fromRef.current = paise;
			setShownPaise(paise);
			return;
		}
		const from = fromRef.current;
		if (from === paise) return;
		let raf = 0;
		const start = performance_default.now();
		const tick = (now) => {
			const p = Math.min(1, (now - start) / COUNT_UP_MS);
			const eased = 1 - Math.pow(1 - p, 3);
			const value = from + (paise - from) * eased;
			fromRef.current = value;
			setShownPaise(value);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [paise, shouldAnimate]);
	const roundedShown = Math.round(shownPaise);
	const displaySign = roundedShown < 0 ? "−" : signed && roundedShown > 0 ? "+" : "";
	const displayText = short ? formatINRShort(Math.abs(roundedShown)) : formatINR(Math.abs(roundedShown));
	const roundedPaise = Math.round(paise);
	const safePaise = roundedPaise === 0 ? 0 : roundedPaise;
	const finalSign = safePaise < 0 ? "−" : signed && safePaise > 0 ? "+" : "";
	const finalText = short ? formatINRShort(Math.abs(safePaise)) : formatINR(Math.abs(safePaise));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("fv-money", className),
		"aria-label": `${finalSign}${finalText}`,
		children: [displaySign, displayText]
	});
}
/**
* Compact empty state with at most one call-to-action.
* Promoted from `components/markets/shared.tsx` (which re-exports it).
*
* Brief §23: empty states stay compact (≤220px tall) — small icon, short
* copy, one small CTA. Callers that need only a single line can omit `body`.
*/
function EmptyState({ title, body, actionLabel, onAction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center rounded-xl border border-border/60 bg-card px-4 py-5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-10 place-items-center rounded-xl bg-tint",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, {
					className: "size-5 text-primary",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2.5 text-sm font-bold text-foreground",
				children: title
			}),
			body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xs text-xs leading-5 text-muted-foreground",
				children: body
			}),
			actionLabel && onAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "mt-3",
				onClick: onAction,
				children: actionLabel
			})
		]
	});
}
//#endregion
export { NumberDisplay as n, EmptyState as t };
