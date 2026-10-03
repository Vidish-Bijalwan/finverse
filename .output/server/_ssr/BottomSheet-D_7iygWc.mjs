import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { n as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BottomSheet-D_7iygWc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var DISMISS_THRESHOLD = 110;
/**
* Reusable bottom sheet: drag handle, swipe-down-to-dismiss on touch,
* overlay click closes, Escape closes. SSR-safe (renders only in the browser).
*/
function BottomSheet({ open, onClose, title, showCloseButton, children }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [visible, setVisible] = (0, import_react.useState)(false);
	const reducedMotion = usePrefersReducedMotion();
	const sheetRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mounted) return;
		if (open) {
			setVisible(true);
			const prev = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = prev;
			};
		}
		if (reducedMotion) {
			setVisible(false);
			return;
		}
		const t = window.setTimeout(() => setVisible(false), 240);
		return () => window.clearTimeout(t);
	}, [
		open,
		mounted,
		reducedMotion
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	const applyDragOffset = (0, import_react.useCallback)((offset) => {
		const el = sheetRef.current;
		if (el && !reducedMotion) {
			el.style.transition = "none";
			el.style.transform = `translateY(${Math.max(0, offset)}px)`;
		}
	}, [reducedMotion]);
	const endDrag = (0, import_react.useCallback)(() => {
		const drag = dragRef.current;
		const el = sheetRef.current;
		dragRef.current = null;
		if (!drag) return;
		const velocity = drag.offset / Math.max(1, Date.now() - drag.startTime);
		if (drag.offset > DISMISS_THRESHOLD || velocity > .6) onClose();
		else if (el && !reducedMotion) {
			el.style.transition = "";
			el.style.transform = "";
		}
	}, [onClose, reducedMotion]);
	(0, import_react.useEffect)(() => {
		if (!open || !mounted) return;
		if (!sheetRef.current || reducedMotion) return;
		const onMove = (e) => {
			const drag = dragRef.current;
			if (!drag) return;
			drag.offset = e.touches[0].clientY - drag.startY;
			applyDragOffset(drag.offset);
		};
		const onUp = () => endDrag();
		window.addEventListener("touchmove", onMove, { passive: true });
		window.addEventListener("touchend", onUp);
		window.addEventListener("touchcancel", onUp);
		return () => {
			window.removeEventListener("touchmove", onMove);
			window.removeEventListener("touchend", onUp);
			window.removeEventListener("touchcancel", onUp);
		};
	}, [
		open,
		mounted,
		reducedMotion,
		applyDragOffset,
		endDrag
	]);
	if (!mounted || !visible) return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80]",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title ?? "Sheet",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			onClick: onClose,
			className: cn("absolute inset-0 bg-black/55", reducedMotion ? "opacity-100" : "transition-opacity duration-240"),
			style: reducedMotion ? void 0 : { opacity: open ? 1 : 0 }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: sheetRef,
			onTouchStart: (e) => {
				dragRef.current = {
					startY: e.touches[0].clientY,
					offset: 0,
					startTime: Date.now()
				};
			},
			className: cn("absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] w-full max-w-lg", "overflow-hidden rounded-t-3xl bg-card shadow-2xl", !reducedMotion && "transition-transform duration-240 ease-[cubic-bezier(0.32,0.72,0,1)]"),
			style: reducedMotion ? void 0 : { transform: open ? "translateY(0)" : "translateY(100%)" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 pb-2 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 w-11 rounded-full bg-muted",
						"aria-hidden": "true"
					})
				}), (title || showCloseButton) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between gap-3",
					children: [title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-foreground",
						children: title
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close sheet",
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[calc(88dvh-4rem)] overflow-y-auto px-5 pb-8",
				children
			})]
		})]
	}), document.body);
}
//#endregion
export { BottomSheet as t };
