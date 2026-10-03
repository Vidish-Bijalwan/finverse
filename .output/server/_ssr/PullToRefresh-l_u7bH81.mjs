import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { st as LoaderCircle, vn as ArrowDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PullToRefresh-l_u7bH81.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var THRESHOLD = 80;
var MAX_PULL = 160;
/**
* Pull-to-refresh wrapper (custom, no dependency). On touch devices, dragging
* down while the page is scrolled to the top reveals a progress indicator;
* releasing past ~80px fires `onRefresh` and shows a spinner until it settles.
* No-ops on desktop (touch-only) and never hijacks upward/inner scrolling.
*/
function PullToRefresh({ onRefresh, children, className, label = "Pull to refresh" }) {
	const [pull, setPull] = (0, import_react.useState)(0);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const rootRef = (0, import_react.useRef)(null);
	const startY = (0, import_react.useRef)(null);
	const startX = (0, import_react.useRef)(0);
	const pullPx = (0, import_react.useRef)(0);
	const refreshingRef = (0, import_react.useRef)(false);
	const onRefreshRef = (0, import_react.useRef)(onRefresh);
	onRefreshRef.current = onRefresh;
	(0, import_react.useEffect)(() => {
		const el = rootRef.current;
		if (!el) return;
		const onStart = (e) => {
			if (refreshingRef.current || window.scrollY > 0) {
				startY.current = null;
				return;
			}
			const t = e.touches[0];
			startY.current = t ? t.clientY : null;
			startX.current = t ? t.clientX : 0;
		};
		const onMove = (e) => {
			if (startY.current === null || refreshingRef.current) return;
			const t = e.touches[0];
			if (!t) return;
			const dy = t.clientY - startY.current;
			const dx = t.clientX - startX.current;
			if (dy > 8 && dy > Math.abs(dx) && window.scrollY <= 0) {
				if (e.cancelable) e.preventDefault();
				pullPx.current = Math.min(MAX_PULL, dy * .5);
				setPull(pullPx.current);
			} else if (dy <= 0 || Math.abs(dx) >= dy) {
				startY.current = null;
				pullPx.current = 0;
				setPull(0);
			}
		};
		const onEnd = () => {
			if (startY.current === null) return;
			startY.current = null;
			const released = pullPx.current;
			pullPx.current = 0;
			setPull(0);
			if (released >= THRESHOLD && !refreshingRef.current) {
				refreshingRef.current = true;
				setRefreshing(true);
				Promise.resolve().then(() => onRefreshRef.current()).catch(() => {}).finally(() => {
					refreshingRef.current = false;
					setRefreshing(false);
				});
			}
		};
		el.addEventListener("touchstart", onStart, { passive: true });
		el.addEventListener("touchmove", onMove, { passive: false });
		el.addEventListener("touchend", onEnd);
		el.addEventListener("touchcancel", onEnd);
		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
			el.removeEventListener("touchend", onEnd);
			el.removeEventListener("touchcancel", onEnd);
		};
	}, []);
	const progress = Math.min(1, pull / THRESHOLD);
	const shown = refreshing || pull > 4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: cn("relative", className),
		"aria-label": label,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: cn("pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center transition-opacity duration-150", shown ? "opacity-100" : "opacity-0"),
				style: { transform: `translateY(${refreshing ? 14 : pull * .6 - 44}px)` },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-10 place-items-center rounded-full border border-border bg-card shadow-modal",
					children: refreshing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-5 animate-spin text-primary",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
						className: "size-5 text-primary transition-transform duration-150",
						style: { transform: `rotate(${progress >= 1 ? 180 : 0}deg)` },
						"aria-hidden": true
					})
				})
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				role: "status",
				children: refreshing ? "Refreshing…" : ""
			})
		]
	});
}
//#endregion
export { PullToRefresh as t };
