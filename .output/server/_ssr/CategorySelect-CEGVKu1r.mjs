import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as allCategories } from "./categories-BtDQEnJC.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BhFA3ek8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CategorySelect-CEGVKu1r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Category dropdown (built-in + custom categories) with icon + label rows.
* Custom categories resolve straight from the store, so newly created ones
* appear here immediately.
*/
function CategorySelect({ id, value, onChange, disabled, kind = "expense" }) {
	const categories = (0, import_react.useMemo)(() => allCategories().filter((c) => kind === "all" || c.kind === kind), [kind]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		disabled: disabled ?? false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			id,
			className: "w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select category" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: c.id,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex shrink-0",
					style: { color: c.color },
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-4 w-4" })
				}), c.label]
			})
		}, c.id)) })]
	});
}
//#endregion
export { CategorySelect as t };
