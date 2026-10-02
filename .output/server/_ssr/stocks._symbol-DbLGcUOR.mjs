import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stocks._symbol-DbLGcUOR.js
var $$splitComponentImporter = () => import("./stocks._symbol-B1HX7OdX.mjs");
var Route = createFileRoute("/stocks/$symbol")({
	head: ({ params }) => ({ meta: [{ title: `${params.symbol} — FinVerse AI` }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
