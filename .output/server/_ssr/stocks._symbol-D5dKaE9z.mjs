import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stocks._symbol-D5dKaE9z.js
var $$splitComponentImporter = () => import("./stocks._symbol-EpxTP7Ii.mjs");
var Route = createFileRoute("/stocks/$symbol")({
	head: ({ params }) => ({ meta: [{ title: `${params.symbol} — FinVerse AI` }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
