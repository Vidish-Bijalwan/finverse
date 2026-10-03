import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as ReceiptIndianRupee, D as ShieldCheck, Et as Eye, O as Settings, S as Sparkles, Wt as ChevronRight, _ as Target, a as Wallet, an as Bot, cn as Bell, in as BriefcaseBusiness, l as User, nn as Calculator, o as WalletCards, ut as Landmark } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as APP_VERSION } from "./AppHeader-DSoPt694.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/more-CbpTS-db.js
var import_jsx_runtime = require_jsx_runtime();
var MENU_ROWS = [
	{
		label: "Profile",
		description: "Your account, photo and sign out",
		to: "/profile",
		icon: User
	},
	{
		label: "Bills",
		description: "Recurring bills and upcoming dues",
		to: "/bills",
		icon: ReceiptIndianRupee
	},
	{
		label: "Budgets",
		description: "Monthly spending limits by category",
		to: "/budgets",
		icon: WalletCards
	},
	{
		label: "Goals",
		description: "Savings goals and milestones",
		to: "/goals",
		icon: Target
	},
	{
		label: "AI Chat",
		description: "Ask FinVerse about your money",
		to: "/chat",
		icon: Bot
	},
	{
		label: "Accounts",
		description: "Cash, UPI and bank wallets with live balances",
		to: "/accounts",
		icon: Wallet
	},
	{
		label: "Calculators",
		description: "SIP, EMI, FD, tax, emergency fund and forecasts",
		to: "/tools",
		icon: Calculator
	},
	{
		label: "Notifications",
		description: "Bill dues, budget alerts, price alerts and more",
		to: "/notifications",
		icon: Bell
	},
	{
		label: "Watchlist",
		description: "Track stocks and set price alerts",
		to: "/watchlist",
		icon: Eye
	},
	{
		label: "Settings",
		description: "Theme, data controls and about",
		to: "/settings",
		icon: Settings
	},
	{
		label: "Screener",
		description: "Screen stocks by fundamentals",
		to: "/screener",
		icon: BriefcaseBusiness
	},
	{
		label: "Readiness",
		description: "Financial readiness score",
		to: "/readiness",
		icon: ShieldCheck
	}
];
function MorePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-dashboard px-4 py-6 sm:px-5 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-center gap-2 text-sm font-bold text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " BROWSE"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-black tracking-tight text-primary-dark",
				children: "More"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Every FinVerse AI feature, one tap away."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "All features",
				className: "mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card",
				children: MENU_ROWS.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: row.to,
					className: `${`flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/60 ${index > 0 ? "border-t border-border/60" : ""}`} ${pressable}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(row.icon, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-semibold text-foreground",
								children: row.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: row.description
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5 shrink-0 text-muted-foreground" })
					]
				}, row.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-2xl border border-border bg-surface-soft p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-md bg-primary-dark",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5 text-primary-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-foreground",
							children: "About FinVerse"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-muted-foreground",
						children: "FinVerse AI is a college major project that turns raw money data into clear, explainable insights. Track spending, manage budgets and bills, set goals, and understand your investments — with AI that always shows its reasoning."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs font-medium text-muted-foreground",
						children: [
							"FinVerse AI ",
							APP_VERSION,
							" · Your data syncs securely to your account."
						]
					})
				]
			})
		]
	});
}
//#endregion
export { MorePage as component };
