import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, N as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-295GU9cE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
			outline: "border border-primary bg-background text-primary hover:bg-tint",
			ghost: "text-foreground hover:bg-muted",
			icon: "size-10 px-0 text-foreground hover:bg-muted"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-11 px-6",
			icon: "size-10 px-0"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(function Button({ className, variant, size, asChild = false, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
//#endregion
export { buttonVariants as n, Button as t };
