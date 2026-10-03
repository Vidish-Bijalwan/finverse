//#region node_modules/.nitro/vite/services/ssr/assets/format-DIQ2AWaF.js
/** Indian-style number grouping: 8,42,310 */
var EN_IN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
/**
* Format integer paise as INR, e.g. 84231000 -> "₹8,42,310".
* Throws on non-finite input; rounds non-integer paise to the nearest rupee.
* Normalizes negative zero: float P&L math can produce -0.4 paise, which
* Intl would otherwise render as "-0" ("₹-0", the live-QA "−₹0" nit).
*/
function formatINR(paise) {
	if (!Number.isFinite(paise)) throw new Error("formatINR: amount must be a finite number");
	const rupeeInt = Math.round(Math.round(paise) / 100);
	return `₹${EN_IN.format(rupeeInt === 0 ? 0 : rupeeInt)}`;
}
/**
* Short human form, e.g. 84000000 -> "₹8.4L", 95000 -> "₹950".
* Indian units: K (thousand), L (lakh), Cr (crore).
*/
function formatINRShort(paise) {
	if (!Number.isFinite(paise)) throw new Error("formatINRShort: amount must be a finite number");
	const rupees = Math.round(paise) / 100;
	const sign = rupees < 0 && Math.round(Math.abs(rupees)) !== 0 ? "-" : "";
	const abs = Math.abs(rupees);
	const trim = (v) => Number.isInteger(v) ? `${v}` : v.toFixed(1);
	if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7)}Cr`;
	if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5)}L`;
	if (abs >= 1e3) return `${sign}₹${trim(abs / 1e3)}K`;
	return `${sign}₹${EN_IN.format(abs)}`;
}
/** "YYYY-MM" for a Date or "YYYY-MM-DD" string. Uses local calendar date. */
function monthKey(d) {
	if (typeof d === "string") return d.slice(0, 7);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
/** "2026-10" -> "Oct 2026" */
function monthLabel(key) {
	const [y, m] = key.split("-").map(Number);
	return `${[
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][m - 1]} ${y}`;
}
/** Today's local date as "YYYY-MM-DD". */
function todayISO() {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
//#endregion
export { todayISO as a, monthLabel as i, formatINRShort as n, monthKey as r, formatINR as t };
