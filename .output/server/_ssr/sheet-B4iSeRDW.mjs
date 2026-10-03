import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, d as DialogContent, f as DialogDescription, h as DialogTitle, l as Dialog, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { n as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheet-B4iSeRDW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var variantClass = {
	neutral: "bg-muted text-muted-foreground",
	gain: "bg-gain/10 text-gain",
	loss: "bg-loss/10 text-loss",
	info: "bg-info/10 text-info",
	accent: "bg-tint text-primary"
};
var sizeClass = {
	sm: "px-2 py-0.5 text-[11px] gap-1",
	md: "px-2.5 py-1 text-xs gap-1.5"
};
var dotClass = {
	neutral: "bg-faint",
	gain: "bg-gain",
	loss: "bg-loss",
	info: "bg-info",
	accent: "bg-primary"
};
/**
* Pill tag for status labels, section tags and filter pills.
*
* Semantics are honest: plain content renders as a <span>; with `onClick` it
* becomes a <button>. With `onClose` the pill stays a <span> wrapping an
* explicit close <button>, so a11y tree never nests buttons. Colors use the
* high-saturation money/status tokens — never pastel.
*/
function Pill$1({ children, variant = "neutral", size = "sm", dot = false, onClose, onClick, label, className }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		dot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: cn("size-1.5 shrink-0 rounded-full", dotClass[variant])
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children
		}),
		onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: (e) => {
				e.stopPropagation();
				onClose();
			},
			"aria-label": label ?? `Remove ${typeof children === "string" ? children : "filter"}`,
			className: "-mr-1 grid size-4 shrink-0 place-items-center rounded-full transition-colors hover:bg-foreground/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
				className: "size-3",
				"aria-hidden": true
			})
		})
	] });
	const classes = cn("inline-flex max-w-full items-center rounded-full font-semibold whitespace-nowrap", variantClass[variant], sizeClass[size], onClick && "cursor-pointer transition-colors hover:brightness-95 focus-visible:outline-2", className);
	if (onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-label": label,
		className: classes,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: classes,
		children: inner
	});
}
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-280 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
//#endregion
export { Sheet as n, SheetContent as r, Pill$1 as t };
