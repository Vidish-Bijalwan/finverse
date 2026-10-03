import { n as formatINRShort, t as formatINR } from "./format-DIQ2AWaF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/money-BQoZl1tz.js
/** Format full paise as compact tick labels, e.g. ₹40K on a chart axis. */
function axisTick(paise) {
	return formatINRShort(paise);
}
/**
* Full-rupee axis labels from integer paise, e.g. 157800 -> "₹1,578".
* Use for charts whose dataKey is paise — formatting raw paise with a plain
* ₹ prefix inflates every label 100× (portfolio chart bug, Phase 4 review).
*/
function paiseAxisTick(paise) {
	return formatINR(paise);
}
//#endregion
export { paiseAxisTick as n, axisTick as t };
