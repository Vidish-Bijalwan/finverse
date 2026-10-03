import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PageShell-FB39N1OW.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Shared page shell for Markets routes: title + subtitle + content container.
* The global AppHeader / BottomTabBar come from the app shell (__root.tsx),
* so this wrapper deliberately renders no nav header of its own.
*/
function PageShell({ title, subtitle, actions, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-dashboard px-5 py-8 lg:px-8 lg:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-7 flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-black tracking-tight text-primary-dark sm:text-3xl",
					children: title
				}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base",
					children: subtitle
				})] }), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: actions
				})]
			}), children]
		})
	});
}
//#endregion
export { PageShell as t };
