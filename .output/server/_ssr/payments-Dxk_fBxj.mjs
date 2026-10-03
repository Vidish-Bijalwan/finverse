import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-Dxk_fBxj.js
var $$splitComponentImporter = () => import("./payments-D8p0dIqQ.mjs");
var Route = createFileRoute("/payments")({
	validateSearch: (search) => ({
		flow: typeof search["flow"] === "string" ? search["flow"] : void 0,
		tab: typeof search["tab"] === "string" ? search["tab"] : void 0,
		upiId: typeof search["upiId"] === "string" ? search["upiId"] : void 0,
		name: typeof search["name"] === "string" ? search["name"] : void 0,
		amount: typeof search["amount"] === "string" ? search["amount"] : void 0
	}),
	head: () => ({ meta: [{ title: "Payments — FinVerse AI" }, {
		name: "description",
		content: "Send simulated UPI and bank payments, request money, pay bills, and try Razorpay test-mode payments. No real money moves."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
