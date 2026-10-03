import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/goals-CGCV0tVQ.js
var $$splitComponentImporter = () => import("./goals-CC7M-hDQ.mjs");
var Route = createFileRoute("/goals")({
	/** `?add=1` deep-link opens the goal form (dashboard quick action). */
	validateSearch: (search) => ({ ...search["add"] === "1" ? { add: "1" } : {} }),
	head: () => ({ meta: [{ title: "Goals — FinVerse AI" }, {
		name: "description",
		content: "Set savings goals, add funds, and track your pace."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
