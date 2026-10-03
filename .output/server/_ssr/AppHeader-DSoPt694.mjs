import { i as __toESM } from "../_runtime.mjs";
import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { B as ReceiptIndianRupee, M as Search, Wt as ChevronRight, Yt as ChartNoAxesCombined, _ as Target, at as LogOut, c as Users, cn as Bell, l as User, lt as LayoutGrid, n as X, p as TrendingUp, qt as Check, tt as Moon, y as Sun, z as Receipt, zt as Circle } from "../_libs/lucide-react.mjs";
import { r as STOCKS } from "./data-_btm06jU.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { o as categoryById } from "./categories-BtDQEnJC.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as loadFinanceDB } from "./db-36JnVPiF.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { s as useSettings } from "./settings-Cxv5Jbfq.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
import { t as avatarInitials } from "./names-ss5cWm2R.mjs";
import { n as greetingName, t as greetingFor } from "./greeting-CuN0KH0P.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-zibXeSp6.mjs";
import { t as useNotifications } from "./notify-B4KX_gM_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppHeader-DSoPt694.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var GROUP_ICON = {
	Transactions: Receipt,
	Contacts: Users,
	Bills: ReceiptIndianRupee,
	Goals: Target,
	Stocks: TrendingUp,
	Features: LayoutGrid
};
/** App destinations searchable as "features". Real routes only. */
var FEATURES = [
	{
		title: "Dashboard",
		keywords: "home overview net worth",
		to: "/"
	},
	{
		title: "Payments",
		keywords: "upi send pay qr scan razorpay request money",
		to: "/payments"
	},
	{
		title: "Invest · Portfolio",
		keywords: "invest stocks holdings buy sell portfolio sip",
		to: "/portfolio"
	},
	{
		title: "Markets · Watchlist",
		keywords: "markets watchlist stocks screener nifty sensex",
		to: "/watchlist"
	},
	{
		title: "Activity · Transactions",
		keywords: "activity transactions expenses income history",
		to: "/expenses"
	},
	{
		title: "Insights",
		keywords: "insights ai analysis spending",
		to: "/insights"
	},
	{
		title: "Goals",
		keywords: "goals savings target emergency fund",
		to: "/goals"
	},
	{
		title: "Bills",
		keywords: "bills utilities recharge due recurring",
		to: "/bills"
	},
	{
		title: "Budgets",
		keywords: "budgets limits monthly",
		to: "/budgets"
	},
	{
		title: "Accounts",
		keywords: "accounts cash upi bank transfer balance",
		to: "/accounts"
	},
	{
		title: "Screener",
		keywords: "screener stocks filter pe market cap",
		to: "/screener"
	},
	{
		title: "Chat",
		keywords: "chat assistant ask ai",
		to: "/chat"
	},
	{
		title: "Settings",
		keywords: "settings theme app lock profile preferences",
		to: "/settings"
	},
	{
		title: "More",
		keywords: "more tools calculators emi fd tax",
		to: "/more"
	}
];
var MAX_PER_GROUP = 5;
/** Parse a rupee amount out of the query ("₹1,500", "1500", "1500.50"). */
function parseRupees(q) {
	const cleaned = q.replace(/[₹,\s]/g, "");
	if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}
function buildResults(query, db) {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const rupees = parseRupees(query.trim());
	const paise = rupees !== null ? Math.round(rupees * 100) : null;
	const out = [];
	if (db) {
		const txns = db.transactions.filter((t) => {
			const cat = categoryById(t.category);
			if (`${t.note} ${t.category} ${cat?.label ?? ""} ${t.type} ${t.payMode} ${t.dateISO}`.toLowerCase().includes(q)) return true;
			if (paise !== null && t.amountPaise === paise) return true;
			if (formatINR(t.amountPaise).toLowerCase().includes(q)) return true;
			return false;
		}).slice(0, MAX_PER_GROUP);
		for (const t of txns) {
			const cat = categoryById(t.category);
			out.push({
				key: `txn-${t.id}`,
				group: "Transactions",
				title: t.note || cat?.label || t.category,
				subtitle: `${t.dateISO} · ${formatINR(t.amountPaise)}`,
				to: "/expenses"
			});
		}
		const seen = /* @__PURE__ */ new Map();
		for (const t of db.transactions) {
			if (t.payMode !== "upi_test") continue;
			const name = t.note.trim();
			if (!name) continue;
			const key = name.toLowerCase();
			if (!seen.has(key) && key.includes(q)) seen.set(key, name);
			if (seen.size >= MAX_PER_GROUP) break;
		}
		for (const name of seen.values()) out.push({
			key: `contact-${name.toLowerCase()}`,
			group: "Contacts",
			title: name,
			subtitle: "Recent UPI payee",
			to: "/payments"
		});
		const bills = db.bills.filter((b) => {
			if (`${b.name} ${b.category} ${b.dueDay}`.toLowerCase().includes(q)) return true;
			if (paise !== null && b.amountPaise === paise) return true;
			return false;
		}).slice(0, MAX_PER_GROUP);
		for (const b of bills) out.push({
			key: `bill-${b.id}`,
			group: "Bills",
			title: b.name,
			subtitle: `${formatINR(b.amountPaise)} · due day ${b.dueDay}`,
			to: "/bills"
		});
		const goals = db.goals.filter((g) => {
			if (`${g.name} ${g.deadline}`.toLowerCase().includes(q)) return true;
			if (paise !== null && (g.targetPaise === paise || g.savedPaise === paise)) return true;
			return false;
		}).slice(0, MAX_PER_GROUP);
		for (const g of goals) out.push({
			key: `goal-${g.id}`,
			group: "Goals",
			title: g.name,
			subtitle: `${formatINR(g.savedPaise)} of ${formatINR(g.targetPaise)}`,
			to: "/goals"
		});
	}
	const stocks = STOCKS.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)).slice(0, MAX_PER_GROUP);
	for (const s of stocks) out.push({
		key: `stock-${s.symbol}`,
		group: "Stocks",
		title: s.symbol,
		subtitle: `${s.name} · ${s.sector}`,
		to: "/stocks/$symbol",
		params: { symbol: s.symbol }
	});
	for (const f of FEATURES.filter((f) => f.title.toLowerCase().includes(q) || f.keywords.toLowerCase().includes(q)).slice(0, MAX_PER_GROUP)) out.push({
		key: `feature-${f.to}`,
		group: "Features",
		title: f.title,
		subtitle: "Open in FinVerse",
		to: f.to
	});
	return out;
}
/**
* Standalone global search. Mounted by the coordinator in the app header.
* Searches transactions, contacts, bills, goals, the stock universe and app
* destinations with grouped, keyboard-accessible results; activating a result
* navigates to the right page.
*/
function GlobalSearch({ placeholder = "Search FinVerse…", onNavigate }) {
	const navigate = useNavigate();
	const listId = (0, import_react.useId)();
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(0);
	const inputRef = (0, import_react.useRef)(null);
	const dbQuery = useQuery({
		queryKey: ["finverse", "db"],
		queryFn: loadFinanceDB
	});
	const results = (0, import_react.useMemo)(() => buildResults(query, dbQuery.data), [query, dbQuery.data]);
	const showPanel = open && query.trim().length > 0;
	function go(r) {
		setOpen(false);
		setQuery("");
		setActive(0);
		onNavigate?.();
		inputRef.current?.blur();
		if (r.params) navigate({
			to: r.to,
			params: r.params
		});
		else navigate({ to: r.to });
	}
	function onKeyDown(e) {
		if (e.key === "Escape") {
			setOpen(false);
			inputRef.current?.blur();
			return;
		}
		if (!showPanel || results.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((a) => (a + 1) % results.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((a) => (a - 1 + results.length) % results.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const target = results[active] ?? results[0];
			if (target) go(target);
		}
	}
	let lastGroup = null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 rounded-full border border-input bg-card py-2 pl-3 pr-2 shadow-tile transition-colors focus-within:border-ring",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "size-4 shrink-0 text-muted-foreground",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					role: "combobox",
					"aria-expanded": showPanel,
					"aria-controls": listId,
					"aria-activedescendant": showPanel && results.length > 0 ? `gs-opt-${active}` : void 0,
					"aria-label": "Global search",
					type: "search",
					value: query,
					placeholder,
					autoComplete: "off",
					onChange: (e) => {
						setQuery(e.target.value);
						setOpen(true);
						setActive(0);
					},
					onFocus: () => setOpen(true),
					onKeyDown,
					className: "w-40 bg-transparent text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:w-52 sm:w-48 sm:focus:w-64 [&::-webkit-search-cancel-button]:hidden"
				}),
				query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Clear search",
					onClick: () => {
						setQuery("");
						setActive(0);
						inputRef.current?.focus();
					},
					className: "grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
				})
			]
		}), showPanel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close search results",
			tabIndex: -1,
			className: "fixed inset-0 z-40 cursor-default bg-transparent",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-modal sm:w-96",
			children: [results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-3 py-8 text-center text-sm text-muted-foreground",
				children: [
					"No results for “",
					query.trim(),
					"”."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				role: "listbox",
				id: listId,
				"aria-label": "Search results",
				children: results.map((r, i) => {
					const showHeader = r.group !== lastGroup;
					lastGroup = r.group;
					const Icon = GROUP_ICON[r.group];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [showHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-hidden": true,
						className: "px-2.5 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
						children: r.group
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "option",
						id: `gs-opt-${i}`,
						"aria-selected": i === active,
						onMouseEnter: () => setActive(i),
						onClick: () => go(r),
						className: cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors", i === active ? "bg-accent text-accent-foreground" : "text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("grid size-8 shrink-0 place-items-center rounded-lg", i === active ? "bg-background/20" : "bg-primary/10 text-primary"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-semibold",
								children: r.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("block truncate text-xs", i === active ? "opacity-80" : "text-muted-foreground"),
								children: r.subtitle
							})]
						})]
					})] }, r.key);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground",
				children: "↑↓ to navigate · Enter to open · Esc to close"
			})]
		})] })]
	});
}
/**
* Standalone notification bell with an unread badge.
*
* Mounted by the app header (coordinator-owned); this component only reads
* notification state via useNotifications() and links to /notifications.
* It mounts no providers and touches no header internals.
*/
function NotificationBell() {
	const { unread } = useNotifications();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/notifications",
		"aria-label": unread > 0 ? `${unread} unread notifications` : "Notifications",
		className: cn(pressable, "relative grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white",
			children: unread > 9 ? "9+" : unread
		})]
	});
}
/**
* Resolve a ThemeMode to a concrete dark/light boolean. "system" follows the
* OS via matchMedia. SSR-safe: on the server (or where matchMedia is
* unavailable) a "system" theme resolves to light — the ThemeApplier
* reconciles on the client after mount.
*/
function resolveIsDark(theme) {
	if (theme === "dark") return true;
	if (theme === "light") return false;
	if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
/**
* Pure: one tap on the header theme toggle flips the RESOLVED theme. Called
* with the theme as it is right now (system resolved via matchMedia at click
* time), returns the theme to persist. Light -> dark, dark -> light.
*/
function toggledTheme(currentlyDark) {
	return currentlyDark ? "light" : "dark";
}
/**
* Sun/moon toggle for the app header. Reads and writes the SAME theme setting
* as Settings → Appearance (`finverse:settings:v1` via useSettings), so both
* stay in sync and the choice persists across reloads (ThemeApplier flips the
* `dark` class on documentElement from this same setting).
*
* The icon reflects the RESOLVED theme (a "system" setting shows the sun/moon
* that matches the OS). SSR-safe: the server and first client paint both
* render the light icon; the effect reconciles after mount, so there is no
* hydration mismatch.
*/
function ThemeToggle() {
	const [settings, updateSettings] = useSettings();
	const [dark, setDark] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const apply = () => setDark(resolveIsDark(settings.theme));
		apply();
		if (settings.theme === "system") {
			mq.addEventListener("change", apply);
			return () => mq.removeEventListener("change", apply);
		}
	}, [settings.theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => updateSettings({ theme: toggledTheme(resolveIsDark(settings.theme)) }),
		"aria-label": dark ? "Switch to light mode" : "Switch to dark mode",
		"aria-pressed": dark,
		title: dark ? "Switch to light mode" : "Switch to dark mode",
		className: cn(pressable, "grid size-11 place-items-center rounded-full text-foreground", "transition-colors hover:bg-muted"),
		children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
			className: "size-5",
			"aria-hidden": true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
			className: "size-5",
			"aria-hidden": true
		})
	});
}
/** App version, shown on the More and Settings pages. */
var APP_VERSION = "v1.0.0";
var NAV_ITEMS = [
	{
		label: "Home",
		to: "/"
	},
	{
		label: "Payments",
		to: "/payments"
	},
	{
		label: "Invest",
		to: "/portfolio"
	},
	{
		label: "Markets",
		to: "/watchlist"
	},
	{
		label: "Activity",
		to: "/expenses"
	}
];
function Logo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "flex items-center gap-2.5",
		"aria-label": "FinVerse home",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid size-9 place-items-center rounded-md bg-primary-dark shadow-logo",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesCombined, {
				className: "size-5 text-primary-foreground",
				strokeWidth: 2.5
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-xl font-black text-primary-dark",
			children: ["Fin", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-primary",
				children: "Verse"
			})]
		})]
	});
}
/** Avatar initials via the shared rule (`@/lib/names`): first letters of the
* first two words, uppercased — "QA Test Beneficiary" -> "QT". */
function initialsOf(name, email) {
	const src = (name ?? "").trim() || (email ?? "").trim();
	return avatarInitials(src || null);
}
/** Avatar button that opens the account menu (profile + sign out). */
function ProfileMenu() {
	const { user, profile, signOut } = useAuth();
	const navigate = useNavigate();
	const name = profile?.full_name?.trim() || user?.email || "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Open account menu",
			className: cn(pressable, "grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-muted"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-8",
				children: [profile?.avatar_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: profile.avatar_url,
					alt: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-primary text-xs font-bold text-primary-foreground",
					children: initialsOf(profile?.full_name ?? null, user?.email)
				})]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-56",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-semibold",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs font-normal text-muted-foreground",
				children: user?.email ?? "FinVerse AI"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => navigate({ to: "/profile" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }), "Profile"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: async () => {
					try {
						await signOut();
					} finally {
						navigate({ to: "/login" });
					}
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Log out"]
			})
		]
	})] });
}
/**
* Compact greeting for the mobile header: "Good morning," over the display
* name. The page-level greeting (dashboard) hides on mobile so this is the
* single source of the hello.
*/
function MobileGreeting() {
	const { user, profile } = useAuth();
	const greeting = greetingFor(/* @__PURE__ */ new Date());
	const displayName = greetingName(profile?.full_name, user?.email);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-[11px] font-medium leading-tight text-muted-foreground",
			children: greeting
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-[15px] font-bold leading-tight text-foreground",
			children: displayName || "Welcome"
		})]
	});
}
/**
* Sticky top header.
*
* Desktop: brand, the five product sections, global search, notifications,
* theme toggle, and the account menu.
*
* Mobile (native-app feel): avatar + compact greeting + search, notification
* bell, theme toggle — the section nav moves to the bottom tab bar.
*
* The active section gets a pill + aria-current="page". No SaaS-admin
* decoration — every control is product-level.
*/
function AppHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-header backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-dashboard px-4 sm:px-5 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-16 items-center gap-2 md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenu, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileGreeting, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex shrink-0 items-center gap-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/expenses",
								search: {},
								"aria-label": "Search transactions",
								className: cn(pressable, "grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden h-16 items-center justify-between gap-3 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "hidden items-center gap-1 md:flex",
						"aria-label": "Main navigation",
						children: NAV_ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							...item.to === "/" ? { activeOptions: { exact: true } } : {},
							activeProps: {
								className: "bg-primary/10 text-primary",
								"aria-current": "page"
							},
							inactiveProps: { className: "text-muted-foreground" },
							className: cn(pressable, "rounded-full px-4 py-2 text-sm font-semibold transition-colors", "hover:bg-muted/70 hover:text-foreground"),
							children: item.label
						}, item.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalSearch, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenu, {})
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { AppHeader as n, resolveIsDark as r, APP_VERSION as t };
