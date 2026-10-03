import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/expenses-dMEzUyFz.js
var $$splitComponentImporter = () => import("./expenses-BHITVOAM.mjs");
var Route = createFileRoute("/expenses")({
	/** `?add=1` deep-link opens the add-expense sheet (dashboard quick action). */
	validateSearch: (search) => ({ ...search["add"] === "1" ? { add: "1" } : {} }),
	head: () => ({ meta: [{ title: "Expenses — FinVerse AI" }, {
		name: "description",
		content: "Track every rupee: add, edit, and search your expenses and income."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
