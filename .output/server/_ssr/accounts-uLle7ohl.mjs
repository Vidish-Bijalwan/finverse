import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts-uLle7ohl.js
var $$splitComponentImporter = () => import("./accounts-DzR9cvqE.mjs");
var Route = createFileRoute("/accounts")({
	/** `?transfer=1` deep-link opens the transfer dialog (dashboard quick action). */
	validateSearch: (search) => ({ ...search["transfer"] === "1" ? { transfer: "1" } : {} }),
	head: () => ({ meta: [{ title: "Accounts — FinVerse AI" }, {
		name: "description",
		content: "Cash, UPI, and bank accounts with live balances. Transfer between them."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
