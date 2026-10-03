import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { F as RotateCcw, f as TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ErrorState-Bx1fnWBD.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Error state with an optional retry action. Use in place of silent
* loading/empty renders when a query fails (role="alert").
*/
function ErrorState({ title = "Something went wrong", body = "We couldn't load this. Check your connection and try again.", retryLabel = "Try again", onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "grid place-items-center rounded-2xl border border-danger/30 bg-danger-soft/40 px-6 py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-14 place-items-center rounded-full bg-danger-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-6 text-danger",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-bold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm leading-6 text-muted-foreground",
				children: body
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "mt-5",
				onClick: onRetry,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
						className: "size-4",
						"aria-hidden": true
					}),
					" ",
					retryLabel
				]
			})
		]
	});
}
//#endregion
export { ErrorState as t };
