import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/skeleton-BrNYuekK.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Loading placeholder. The fill is a neutral gray shimmer sweep at ~8%
* opacity (see `fv-shimmer` in styles.css) — quiet by design; geometry stays
* the caller's via className so it keeps matching the content it stands in
* for.
*/
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("fv-shimmer rounded-md motion-reduce:animate-none", className),
		"aria-hidden": "true",
		...props
	});
}
//#endregion
export { Skeleton as t };
