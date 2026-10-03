import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { n as Sheet, r as SheetContent } from "./sheet-B4iSeRDW.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as useAddRecurringRule, r as useAccounts } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SipSheet-BtZmmlnJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var toPaise = (rupeesText) => {
	const v = Number.parseFloat(rupeesText);
	if (!Number.isFinite(v) || v <= 0) return 0;
	return Math.round(v * 100);
};
/**
* "Start SIP" sheet for a stock. Creates a `recurring_rules` row
* (category "investments", note `SIP SYMBOL`) — the existing
* `ensureRecurringPosted()` auto-posts each occurrence as a ledger
* transaction. Pause/resume happens in the existing recurring UI
* (Expenses → Recurring).
*/
function SipSheet({ open, onOpenChange, symbol, name }) {
	const { data: accounts } = useAccounts();
	const addRule = useAddRecurringRule();
	const [amountText, setAmountText] = (0, import_react.useState)("5000");
	const [frequency, setFrequency] = (0, import_react.useState)("monthly");
	const [date, setDate] = (0, import_react.useState)(todayISO());
	(0, import_react.useEffect)(() => {
		if (open) {
			setDate(todayISO());
			addRule.reset();
		}
	}, [open, symbol]);
	const amountPaise = toPaise(amountText);
	const valid = amountPaise > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);
	const pending = addRule.isPending;
	function handleStart() {
		if (!valid || pending) return;
		const defaultAccount = accounts?.find((a) => a.isDefault) ?? accounts?.[0];
		addRule.mutate({
			type: "expense",
			amountPaise,
			category: "investments",
			note: `SIP ${symbol.toUpperCase()}`,
			payMode: "Bank",
			...defaultAccount ? { accountId: defaultAccount.id } : {},
			tags: ["sip", "simulated-brokerage"],
			frequency,
			startDateISO: date,
			isPaused: false
		}, {
			onSuccess: () => {
				toast.success(`SIP started · ${formatINR(amountPaise)} ${frequency} in ${symbol.toUpperCase()}`);
				onOpenChange(false);
			},
			onError: (e) => toast.error(e.message || "Couldn't start the SIP — try again.")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "bottom",
			className: "mx-auto w-full max-w-lg rounded-t-3xl border-t px-6 pt-3 pb-8",
			"aria-label": `Start SIP in ${symbol}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "mx-auto mb-4 block h-1.5 w-12 rounded-full bg-muted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-base font-bold text-foreground",
					children: ["Start SIP ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: ["· ", symbol]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground uppercase",
								children: "Amount per instalment (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								inputMode: "decimal",
								value: amountText,
								onChange: (e) => setAmountText(e.target.value.replace(/[^0-9.]/g, "")),
								placeholder: "5,000.00",
								className: "h-14 rounded-2xl border border-input bg-card px-4 text-2xl font-bold text-foreground tabular-nums"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "group",
							"aria-label": "SIP frequency",
							className: "flex rounded-full bg-muted p-1",
							children: [{
								value: "monthly",
								label: "Monthly"
							}, {
								value: "weekly",
								label: "Weekly"
							}].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": frequency === o.value,
								onClick: () => setFrequency(o.value),
								className: cn("flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors", frequency === o.value ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"),
								children: o.label
							}, o.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground uppercase",
								children: "First instalment"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: date,
								onChange: (e) => setDate(e.target.value),
								className: "h-12 rounded-2xl border border-input bg-card px-4 text-sm font-semibold text-foreground"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-2xl bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground",
							children: [
								"Each instalment posts an ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-foreground",
									children: "Investments"
								}),
								" ",
								"expense transaction to your shared ledger automatically. Pause or resume anytime in",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/expenses",
									search: {},
									className: "font-bold text-primary hover:underline",
									children: "Expenses → Recurring"
								}),
								". Note: SIP instalments don't change your holding quantity — that updates when you place buy orders."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-13 w-full rounded-full py-3.5 text-base font-bold",
							disabled: !valid || pending,
							onClick: handleStart,
							children: pending ? "Starting…" : `Start ${frequency} SIP`
						})
					]
				})
			]
		})
	});
}
//#endregion
export { SipSheet as t };
