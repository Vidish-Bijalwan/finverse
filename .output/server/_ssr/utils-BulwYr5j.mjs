import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-BulwYr5j.js
var import_jsx_runtime = require_jsx_runtime();
/** Rupee text field that the caller parses with rupeesToPaise. */
function AmountField({ id, label, value, onChange, error, placeholder = "0.00", autoFocus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: id,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground",
					children: "₹"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id,
					inputMode: "decimal",
					autoComplete: "off",
					placeholder,
					value,
					autoFocus,
					onChange: (e) => onChange(e.target.value),
					className: "pl-7",
					"aria-invalid": error ? true : void 0,
					"aria-describedby": error ? `${id}-error` : void 0
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: `${id}-error`,
				role: "alert",
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
}
/**
* Shared helpers for the money routes (bills / budgets / goals).
* All money stays in integer paise; dates are "YYYY-MM-DD" / "YYYY-MM".
*/
var MONTH_SHORT = [
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
];
/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 11 -> "11th", 21 -> "21st" */
function ordinal(n) {
	const suffixes = [
		"th",
		"st",
		"nd",
		"rd"
	];
	const v = n % 100;
	return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
/** "2026-10" -> "Oct 2026" */
function monthLabel(key) {
	const [y, m] = key.split("-").map(Number);
	return `${MONTH_SHORT[m - 1]} ${y}`;
}
/** "2027-03-15" -> "15 Mar 2027" */
function formatDateLong(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return `${d} ${MONTH_SHORT[m - 1]} ${y}`;
}
/** Shift a "YYYY-MM" key by delta months. */
function addMonthsToKey(key, delta) {
	const [y, m] = key.split("-").map(Number);
	const total = y * 12 + (m - 1) + delta;
	const ny = Math.floor(total / 12);
	const nm = total % 12 + 1;
	return `${ny}-${String(nm).padStart(2, "0")}`;
}
/** Whole months from keyA to keyB ("2026-10" -> "2027-03" = 5). */
function monthDiff(keyA, keyB) {
	const [ya, ma] = keyA.split("-").map(Number);
	const [yb, mb] = keyB.split("-").map(Number);
	return yb * 12 + mb - (ya * 12 + ma);
}
/** Parse a "₹12,345.67"-ish string into integer paise. NaN when not parseable. */
function rupeesToPaise(input) {
	const cleaned = input.replace(/[,₹\s]/g, "");
	if (cleaned === "") return NaN;
	const rupees = Number(cleaned);
	if (!Number.isFinite(rupees) || rupees < 0) return NaN;
	return Math.round(rupees * 100);
}
/** Integer paise -> plain rupee string for form fields ("12345.67"). */
function paiseToRupees(paise) {
	const rupees = paise / 100;
	return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
}
var GOAL_COLORS = [
	"#3B82F6",
	"#10B981",
	"#F59E0B",
	"#EF4444",
	"#8B5CF6",
	"#EC4899"
];
//#endregion
export { monthDiff as a, paiseToRupees as c, formatDateLong as i, rupeesToPaise as l, GOAL_COLORS as n, monthLabel as o, addMonthsToKey as r, ordinal as s, AmountField as t };
