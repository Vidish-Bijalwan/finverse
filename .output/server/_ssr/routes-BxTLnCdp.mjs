import { i as __toESM } from "../_runtime.mjs";
import { a as performance_default } from "../_libs/h3+rou3+srvx+unenv.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { A as BriefcaseBusiness, C as Clapperboard, D as ChartNoAxesCombined, E as ChevronLeft, M as Banknote, N as ArrowRight, O as Car, S as GraduationCap, T as ChevronRight, _ as Menu, a as TrendingUp, b as HeartPulse, c as Sparkles, d as ShieldCheck, f as Receipt, g as Package, h as PiggyBank, i as UtensilsCrossed, j as Bot, k as Briefcase, l as ShoppingBasket, m as Plane, n as Wallet, o as TrendingDown, p as Plus, r as WalletCards, s as Target, t as X, u as ShoppingBag, v as Lightbulb, w as CircleDollarSign, x as Headphones, y as House } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, o as Area, r as BarChart, s as CartesianGrid, t as AreaChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BxTLnCdp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
			outline: "border border-primary bg-background text-primary hover:bg-tint",
			ghost: "text-foreground hover:bg-muted",
			icon: "size-10 px-0 text-foreground hover:bg-muted"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-11 px-6",
			icon: "size-10 px-0"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(function Button({ className, variant, size, asChild = false, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
/** Indian-style number grouping: 8,42,310 */
var EN_IN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
/**
* Format integer paise as INR, e.g. 84231000 -> "₹8,42,310".
* Throws on non-finite input; rounds non-integer paise.
*/
function formatINR(paise) {
	if (!Number.isFinite(paise)) throw new Error("formatINR: amount must be a finite number");
	const rupees = Math.round(paise) / 100;
	return `₹${EN_IN.format(rupees)}`;
}
/**
* Short human form, e.g. 84000000 -> "₹8.4L", 95000 -> "₹950".
* Indian units: K (thousand), L (lakh), Cr (crore).
*/
function formatINRShort(paise) {
	if (!Number.isFinite(paise)) throw new Error("formatINRShort: amount must be a finite number");
	const rupees = Math.round(paise) / 100;
	const sign = rupees < 0 ? "-" : "";
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
/**
* Animated count-up number. Uses requestAnimationFrame with an ease-out cubic
* curve, and snaps instantly when the user prefers reduced motion. SSR-safe:
* the animation only runs in an effect, so the server renders the start value.
*/
function CountUp({ value, duration = 900, className, format = formatINR, from = 0 }) {
	const [display, setDisplay] = (0, import_react.useState)(from);
	const fromRef = (0, import_react.useRef)(from);
	const rafRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const startValue = fromRef.current;
		const target = value;
		if (startValue === target) {
			setDisplay(target);
			return;
		}
		if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches || duration <= 0) {
			fromRef.current = target;
			setDisplay(target);
			return;
		}
		const start = performance_default.now();
		const tick = (now) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			setDisplay(Math.round(startValue + (target - startValue) * eased));
			if (t < 1) rafRef.current = requestAnimationFrame(tick);
			else fromRef.current = target;
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [value, duration]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: format(display)
	});
}
/**
* Shared dark-friendly tooltip for the dashboard charts. Values are always
* rendered in short INR form (₹8.4L) since the raw data is integer paise.
*/
function MoneyTooltip({ active, payload, label, title }) {
	if (!active || !payload || payload.length === 0) return null;
	const heading = title ?? label;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card px-3 py-2 shadow-modal",
		children: [heading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1.5 text-xs font-bold text-foreground",
			children: heading
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-1",
			children: payload.map((entry, i) => {
				const color = entry.color ?? entry.payload?.color ?? "#8884d8";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 shrink-0 rounded-full",
							style: { background: color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: entry.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto pl-3 font-bold text-foreground",
							children: formatINRShort(Number(entry.value ?? 0))
						})
					]
				}, i);
			})
		})]
	});
}
/** Skeleton placeholder used while queries or the client mount resolve. */
function ChartSkeleton({ className = "h-56" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "status",
		"aria-label": "Loading chart",
		className: `animate-pulse rounded-md bg-muted/60 ${className}`
	});
}
/** Format full paise as compact tick labels, e.g. ₹40K on a chart axis. */
function axisTick(paise) {
	return formatINRShort(paise);
}
/** Grouped income-vs-expense bars for the six months ending at the selected month. */
function MonthBars({ data, ready, loading }) {
	if (loading || !ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-64" });
	if (data.every((d) => d.income === 0 && d.expense === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-64 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground",
			children: "No income or expenses yet"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-5 text-muted-foreground",
			children: "Record transactions and this chart will compare your cash flow month by month."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-64",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data,
				barGap: 3,
				margin: {
					top: 8,
					right: 4,
					bottom: 0,
					left: -8
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						vertical: false,
						stroke: "var(--color-border)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tickLine: false,
						axisLine: false,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tickFormatter: axisTick,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						},
						width: 56
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}),
						cursor: {
							fill: "var(--color-muted)",
							opacity: .35
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						name: "Income",
						dataKey: "income",
						fill: "#16A34A",
						radius: [
							4,
							4,
							0,
							0
						],
						maxBarSize: 22
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						name: "Expense",
						dataKey: "expense",
						fill: "#EF4444",
						radius: [
							4,
							4,
							0,
							0
						],
						maxBarSize: 22
					})
				]
			})
		})
	});
}
/** Cumulative net-worth sparkline (area) for the last six months. */
function NetWorthSpark({ data, ready, loading }) {
	if (loading || !ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-48" });
	if (data.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-48 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground",
			children: "No history to chart yet"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-5 text-muted-foreground",
			children: "Your cumulative balance over time will appear here once you add transactions."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-48",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 4,
					bottom: 0,
					left: -8
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "netWorthFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-primary)",
							stopOpacity: .35
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-primary)",
							stopOpacity: .03
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						vertical: false,
						stroke: "var(--color-border)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tickLine: false,
						axisLine: false,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tickFormatter: axisTick,
						tick: {
							fontSize: 11,
							fill: "var(--color-muted-foreground)"
						},
						width: 56
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}),
						cursor: { stroke: "var(--color-border)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						name: "Net worth",
						type: "monotone",
						dataKey: "net",
						stroke: "var(--color-primary)",
						strokeWidth: 2.5,
						fill: "url(#netWorthFill)",
						dot: false,
						activeDot: {
							r: 4,
							fill: "var(--color-primary)"
						}
					})
				]
			})
		})
	});
}
/**
* Spend-by-category donut for the selected month. Colors come from
* categories.ts; the center label shows total spend; a legend below lists
* every category with its amount. Renders an empty state when there is no
* spend for the month.
*/
function SpendDonut({ data, totalPaise, ready, loading }) {
	if (loading || !ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-64" });
	if (data.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-64 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground",
			children: "No spending this month"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-5 text-muted-foreground",
			children: "Add your first expense and this donut will break it down by category."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-64",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "value",
				nameKey: "label",
				innerRadius: "68%",
				outerRadius: "92%",
				paddingAngle: 2,
				strokeWidth: 2,
				stroke: "var(--color-card)",
				children: data.map((slice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: slice.color }, slice.id))
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
				children: "Total spent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 text-2xl font-black text-primary-dark",
				children: formatINRShort(totalPaise)
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 grid max-h-44 gap-1 overflow-y-auto pr-1",
		children: data.map((slice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/50",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2.5 shrink-0 rounded-full",
					style: { background: slice.color }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate text-foreground",
					children: slice.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-primary-dark",
					children: formatINR(slice.value)
				})
			]
		}, slice.id))
	})] });
}
var EXPENSE_CATEGORIES = [
	{
		id: "food",
		label: "Food & Dining",
		icon: UtensilsCrossed,
		color: "#F97316",
		kind: "expense"
	},
	{
		id: "groceries",
		label: "Groceries",
		icon: ShoppingBasket,
		color: "#22C55E",
		kind: "expense"
	},
	{
		id: "transport",
		label: "Transport",
		icon: Car,
		color: "#3B82F6",
		kind: "expense"
	},
	{
		id: "shopping",
		label: "Shopping",
		icon: ShoppingBag,
		color: "#EC4899",
		kind: "expense"
	},
	{
		id: "bills",
		label: "Bills & Utilities",
		icon: Receipt,
		color: "#A855F7",
		kind: "expense"
	},
	{
		id: "rent",
		label: "Rent",
		icon: House,
		color: "#8B5CF6",
		kind: "expense"
	},
	{
		id: "health",
		label: "Health",
		icon: HeartPulse,
		color: "#EF4444",
		kind: "expense"
	},
	{
		id: "entertainment",
		label: "Entertainment",
		icon: Clapperboard,
		color: "#EAB308",
		kind: "expense"
	},
	{
		id: "travel",
		label: "Travel",
		icon: Plane,
		color: "#06B6D4",
		kind: "expense"
	},
	{
		id: "education",
		label: "Education",
		icon: GraduationCap,
		color: "#6366F1",
		kind: "expense"
	},
	{
		id: "investments",
		label: "Investments",
		icon: TrendingUp,
		color: "#10B981",
		kind: "expense"
	},
	{
		id: "others",
		label: "Others",
		icon: Package,
		color: "#64748B",
		kind: "expense"
	}
];
var INCOME_CATEGORIES = [
	{
		id: "salary",
		label: "Salary",
		icon: Banknote,
		color: "#16A34A",
		kind: "income"
	},
	{
		id: "freelance",
		label: "Freelance",
		icon: BriefcaseBusiness,
		color: "#0EA5E9",
		kind: "income"
	},
	{
		id: "business",
		label: "Business",
		icon: Briefcase,
		color: "#F59E0B",
		kind: "income"
	},
	{
		id: "interest",
		label: "Interest",
		icon: PiggyBank,
		color: "#8B5CF6",
		kind: "income"
	},
	{
		id: "other-income",
		label: "Other Income",
		icon: CircleDollarSign,
		color: "#64748B",
		kind: "income"
	}
];
var ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
/** Returns the category for an id, or undefined when unknown (e.g. legacy free-form values). */
function categoryById(id) {
	return ALL_CATEGORIES.find((c) => c.id === id);
}
/**
* Realistic Indian seed data spanning Jun–Oct 2026 (~120 transactions).
* Deterministic PRNG so the seed is stable across loads.
*/
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = seed + 1831565813 | 0;
		let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var rand = mulberry32(20261002);
var pick = (arr) => arr[Math.floor(rand() * arr.length)];
var jitter = (base, spread) => Math.round(base + (rand() * 2 - 1) * spread);
var pad = (n) => String(n).padStart(2, "0");
var d = (month, day) => `2026-${pad(month)}-${pad(day)}`;
function makeTxn(s) {
	const dateISO = d(s.month, s.day);
	const createdAt = `${dateISO}T${pad(8 + Math.floor(rand() * 12))}:${pad(Math.floor(rand() * 60))}:00.000Z`;
	return {
		id: crypto.randomUUID(),
		type: s.type,
		amountPaise: Math.round(s.rupees * 100),
		category: s.category,
		note: s.note,
		dateISO,
		payMode: s.payMode,
		...s.goalId ? { goalId: s.goalId } : {},
		...s.billId ? { billId: s.billId } : {},
		createdAt,
		updatedAt: createdAt
	};
}
function buildTransactions() {
	const s = [];
	for (let m = 6; m <= 10; m++) {
		s.push({
			month: m,
			day: 1,
			type: "income",
			rupees: 85e3,
			category: "salary",
			note: "Monthly salary credit",
			payMode: "Bank"
		});
		if (m <= 9) {
			s.push({
				month: m,
				day: 5,
				type: "expense",
				rupees: 18e3,
				category: "rent",
				note: "House rent",
				payMode: "Bank",
				billId: "bill-rent"
			});
			s.push({
				month: m,
				day: 10,
				type: "transfer",
				rupees: 12e3,
				category: "investments",
				note: "Monthly SIP",
				payMode: "Bank",
				billId: "bill-sip"
			});
		}
		if (m === 10) {
			s.push({
				month: m,
				day: 1,
				type: "expense",
				rupees: jitter(2500, 300),
				category: "groceries",
				note: "BigBasket weekly groceries",
				payMode: "UPI"
			});
			continue;
		}
		s.push({
			month: m,
			day: m === 10 ? 1 : 20,
			type: "expense",
			rupees: 999,
			category: "bills",
			note: "Broadband bill",
			payMode: "Card",
			billId: "bill-broadband"
		});
		s.push({
			month: m,
			day: 15,
			type: "expense",
			rupees: jitter(1800, 350),
			category: "bills",
			note: "Electricity bill",
			payMode: "UPI",
			billId: "bill-electricity"
		});
		s.push({
			month: m,
			day: 28,
			type: "expense",
			rupees: 399,
			category: "bills",
			note: "Mobile recharge",
			payMode: "UPI",
			billId: "bill-mobile"
		});
		s.push({
			month: m,
			day: 8,
			type: "expense",
			rupees: jitter(1e3, 250),
			category: "transport",
			note: "Petrol",
			payMode: "Card"
		});
		s.push({
			month: m,
			day: 22,
			type: "expense",
			rupees: jitter(1e3, 250),
			category: "transport",
			note: "Petrol",
			payMode: "Card"
		});
		s.push({
			month: m,
			day: pick([
				3,
				9,
				16,
				24,
				30
			]),
			type: "expense",
			rupees: jitter(750, 150),
			category: "entertainment",
			note: "Movie night",
			payMode: "UPI"
		});
		s.push({
			month: m,
			day: pick([
				7,
				13,
				19,
				26
			]),
			type: "expense",
			rupees: jitter(450, 200),
			category: "health",
			note: "Pharmacy",
			payMode: "UPI"
		});
		s.push({
			month: m,
			day: pick([
				4,
				11,
				18,
				27
			]),
			type: "expense",
			rupees: jitter(2200, 1500),
			category: "shopping",
			note: pick([
				"Amazon order",
				"Myntra haul",
				"Electronics store",
				"Home essentials"
			]),
			payMode: "Card"
		});
		if (m % 2 === 0) s.push({
			month: m,
			day: pick([
				6,
				14,
				21
			]),
			type: "expense",
			rupees: jitter(900, 500),
			category: "shopping",
			note: pick([
				"Zara",
				"Decathlon",
				"Croma"
			]),
			payMode: "Card"
		});
		s.push({
			month: m,
			day: pick([
				5,
				12,
				19,
				26
			]),
			type: "expense",
			rupees: jitter(420, 150),
			category: "food",
			note: pick(["Zomato dinner", "Swiggy order"]),
			payMode: "UPI"
		});
		if (m !== 10) s.push({
			month: m,
			day: pick([
				2,
				10,
				17,
				25
			]),
			type: "expense",
			rupees: jitter(380, 150),
			category: "food",
			note: pick(["Swiggy lunch", "Zomato order"]),
			payMode: "UPI"
		});
		for (let w = 0; w < 8; w++) {
			const day = 1 + w * 3 + Math.floor(rand() * 3);
			if (day > 28 || m === 10 && day > 2) continue;
			s.push({
				month: m,
				day,
				type: "expense",
				rupees: jitter(120, 90),
				category: "food",
				note: pick([
					"Chai tapri",
					"Canteen lunch",
					"Street food",
					"Coffee"
				]),
				payMode: "UPI"
			});
		}
	}
	for (let m = 6; m <= 9; m++) for (const day of [
		2,
		9,
		16,
		23
	]) s.push({
		month: m,
		day,
		type: "expense",
		rupees: jitter(2500, 300),
		category: "groceries",
		note: pick([
			"BigBasket weekly groceries",
			"Blinkit top-up",
			"DMart run"
		]),
		payMode: "UPI"
	});
	s.push({
		month: 8,
		day: 18,
		type: "income",
		rupees: 15e3,
		category: "freelance",
		note: "Freelance UI project payout",
		payMode: "Bank"
	});
	s.push({
		month: 9,
		day: 30,
		type: "income",
		rupees: 2100,
		category: "interest",
		note: "Savings account interest",
		payMode: "Bank"
	});
	s.push({
		month: 9,
		day: 12,
		type: "expense",
		rupees: 2400,
		category: "travel",
		note: "Rishikesh weekend bus + stay",
		payMode: "UPI"
	});
	s.push({
		month: 8,
		day: 7,
		type: "expense",
		rupees: 4999,
		category: "education",
		note: "Online course subscription",
		payMode: "Card"
	});
	s.push({
		month: 7,
		day: 20,
		type: "expense",
		rupees: 850,
		category: "health",
		note: "Dental checkup",
		payMode: "UPI"
	});
	s.push({
		month: 9,
		day: 8,
		type: "expense",
		rupees: 3200,
		category: "shopping",
		note: "Festive sale electronics",
		payMode: "Card"
	});
	s.push({
		month: 6,
		day: 15,
		type: "expense",
		rupees: 650,
		category: "transport",
		note: "Cab to airport",
		payMode: "UPI"
	});
	s.push({
		month: 9,
		day: 26,
		type: "expense",
		rupees: 1450,
		category: "entertainment",
		note: "Concert tickets",
		payMode: "Card"
	});
	s.push({
		month: 10,
		day: 1,
		type: "expense",
		rupees: 180,
		category: "food",
		note: "Morning chai",
		payMode: "UPI"
	});
	s.push({
		month: 10,
		day: 2,
		type: "expense",
		rupees: 320,
		category: "food",
		note: "Office lunch",
		payMode: "UPI"
	});
	return s.map(makeTxn).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}
function buildBudgets() {
	return [
		[
			"budget-food",
			"food",
			12e5
		],
		[
			"budget-groceries",
			"groceries",
			15e5
		],
		[
			"budget-transport",
			"transport",
			6e5
		],
		[
			"budget-shopping",
			"shopping",
			1e6
		],
		[
			"budget-entertainment",
			"entertainment",
			5e5
		],
		[
			"budget-bills",
			"bills",
			8e5
		]
	].map(([id, categoryId, limitPaise]) => ({
		id,
		categoryId,
		month: "2026-10",
		limitPaise
	}));
}
function buildBills() {
	return [
		{
			id: "bill-rent",
			name: "Rent",
			amountPaise: 18e5,
			dueDay: 5,
			category: "rent",
			lastPaidOn: "2026-09-05"
		},
		{
			id: "bill-sip",
			name: "SIP",
			amountPaise: 12e5,
			dueDay: 10,
			category: "investments",
			lastPaidOn: "2026-09-10"
		},
		{
			id: "bill-electricity",
			name: "Electricity",
			amountPaise: 18e4,
			dueDay: 15,
			category: "bills",
			lastPaidOn: "2026-09-15"
		},
		{
			id: "bill-broadband",
			name: "Broadband",
			amountPaise: 99900,
			dueDay: 20,
			category: "bills",
			lastPaidOn: "2026-09-20"
		},
		{
			id: "bill-mobile",
			name: "Mobile",
			amountPaise: 39900,
			dueDay: 28,
			category: "bills",
			lastPaidOn: "2026-09-28"
		}
	];
}
function buildGoals() {
	return [
		{
			id: "goal-emergency",
			name: "Emergency fund",
			targetPaise: 3e7,
			savedPaise: 185e5,
			deadline: "2027-06-30",
			color: "#10B981"
		},
		{
			id: "goal-japan",
			name: "Japan trip",
			targetPaise: 25e6,
			savedPaise: 45e5,
			deadline: "2027-11-15",
			color: "#EC4899"
		},
		{
			id: "goal-laptop",
			name: "New laptop",
			targetPaise: 12e6,
			savedPaise: 3e6,
			deadline: "2026-12-31",
			color: "#3B82F6"
		}
	];
}
function buildHoldings() {
	return [
		{
			id: "holding-reliance",
			symbol: "RELIANCE",
			qty: 15,
			avgPricePaise: 285e3
		},
		{
			id: "holding-hdfcbank",
			symbol: "HDFCBANK",
			qty: 40,
			avgPricePaise: 162e3
		},
		{
			id: "holding-infy",
			symbol: "INFY",
			qty: 25,
			avgPricePaise: 178e3
		},
		{
			id: "holding-niftybees",
			symbol: "NIFTYBEES",
			qty: 100,
			avgPricePaise: 26500
		}
	];
}
function buildSeed() {
	return {
		transactions: buildTransactions(),
		budgets: buildBudgets(),
		bills: buildBills(),
		goals: buildGoals(),
		holdings: buildHoldings()
	};
}
/**
* Versioned localStorage persistence. SSR-safe: every window/localStorage
* access is guarded with `typeof window === "undefined"`.
*
* On the server (or with no storage), functions return safe defaults:
* loadDB/seedIfEmpty return an in-memory seeded DB that is NOT persisted.
*/
var STORE_KEY = "finverse:v1";
var isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
function emptyDB() {
	return {
		transactions: [],
		budgets: [],
		bills: [],
		goals: [],
		holdings: []
	};
}
function isValidDB(db) {
	if (typeof db !== "object" || db === null) return false;
	const d = db;
	return Array.isArray(d.transactions) && Array.isArray(d.budgets) && Array.isArray(d.bills) && Array.isArray(d.goals) && Array.isArray(d.holdings);
}
/** Load the DB from localStorage; returns an empty (unpersisted) DB on the server or on corruption. */
function loadDB() {
	if (!isBrowser()) return emptyDB();
	try {
		const raw = window.localStorage.getItem(STORE_KEY);
		if (!raw) return emptyDB();
		const parsed = JSON.parse(raw);
		if (!isValidDB(parsed)) return emptyDB();
		return parsed;
	} catch {
		return emptyDB();
	}
}
/** Persist the DB. No-op on the server. */
function saveDB(db) {
	if (!isBrowser()) return;
	window.localStorage.setItem(STORE_KEY, JSON.stringify(db));
}
/** Load; if empty, seed it. Persists only in the browser. */
function seedIfEmpty() {
	const db = loadDB();
	if (db.transactions.length > 0) return db;
	const seeded = buildSeed();
	saveDB(seeded);
	return seeded;
}
function listTransactions(db, monthKey) {
	return [...monthKey ? db.transactions.filter((t) => t.dateISO.startsWith(monthKey)) : db.transactions].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}
function listHoldings(db) {
	return [...db.holdings];
}
/**
* React Query layer over the localStorage store.
*
* Query keys are namespaced as ['finverse', ...]. Every mutation writes via
* store.ts (load -> mutate -> saveDB) and then invalidates the relevant keys.
*
* SSR note: queryFns run through seedIfEmpty(), which is SSR-safe
* (server returns an unpersisted in-memory seed; browser persists to localStorage).
*/
var QK = {
	transactions: ["finverse", "transactions"],
	budgets: ["finverse", "budgets"],
	bills: ["finverse", "bills"],
	goals: ["finverse", "goals"],
	holdings: ["finverse", "holdings"]
};
/** Selected month state ("YYYY-MM"), defaulting to the current month. */
function useMonth() {
	return (0, import_react.useState)(() => monthKey(/* @__PURE__ */ new Date()));
}
function useTransactions(month) {
	return useQuery({
		queryKey: [...QK.transactions, month ?? "all"],
		queryFn: () => listTransactions(seedIfEmpty(), month)
	});
}
function useHoldings() {
	return useQuery({
		queryKey: QK.holdings,
		queryFn: () => listHoldings(seedIfEmpty())
	});
}
/** "2026-10" shifted by delta months, e.g. shiftMonth("2026-10", -1) -> "2026-09". */
function shiftMonth(key, delta) {
	const [y, m] = key.split("-").map(Number);
	const d = new Date(y, m - 1 + delta, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
/** "2026-10" -> "Oct" for compact chart axis labels. */
function shortMonthLabel(key) {
	return monthLabel(key).split(" ")[0];
}
function signFormat(paise) {
	return `${paise >= 0 ? "+ " : "− "}${formatINR(Math.abs(paise))}`;
}
var quickActions = [
	{
		label: "Add Expense",
		icon: Plus,
		to: "/expenses"
	},
	{
		label: "Budgets",
		icon: WalletCards,
		to: "/budgets"
	},
	{
		label: "Bills",
		icon: Receipt,
		to: "/bills"
	},
	{
		label: "Goals",
		icon: Target,
		to: "/goals"
	},
	{
		label: "Portfolio",
		icon: BriefcaseBusiness,
		to: "/portfolio"
	},
	{
		label: "AI Chat",
		icon: Bot,
		to: "/chat"
	}
];
var navLinks = [
	{
		label: "Dashboard",
		to: "/"
	},
	{
		label: "Portfolio",
		to: "/portfolio"
	},
	{
		label: "Insights",
		to: "/insights"
	},
	{
		label: "Screener",
		to: "/screener"
	}
];
function Logo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
function FinVerseDashboard() {
	const [month, setMonth] = useMonth();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [chartsReady, setChartsReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setChartsReady(true);
	}, []);
	const { data: txns, isLoading: txnsLoading, isError: txnsError } = useTransactions();
	const { data: holdings } = useHoldings();
	const currentKey = monthKey(/* @__PURE__ */ new Date());
	const prevKey = shiftMonth(month, -1);
	const canGoForward = month < currentKey;
	const stats = (0, import_react.useMemo)(() => {
		const all = txns ?? [];
		let lifetimeIncome = 0;
		let lifetimeExpenses = 0;
		const byMonth = /* @__PURE__ */ new Map();
		const monthCatSpend = /* @__PURE__ */ new Map();
		const prevCatSpend = /* @__PURE__ */ new Map();
		for (const t of all) {
			const key = t.dateISO.slice(0, 7);
			let entry = byMonth.get(key);
			if (!entry) {
				entry = {
					income: 0,
					expense: 0
				};
				byMonth.set(key, entry);
			}
			if (t.type === "income") {
				lifetimeIncome += t.amountPaise;
				entry.income += t.amountPaise;
			} else if (t.type === "expense") {
				lifetimeExpenses += t.amountPaise;
				entry.expense += t.amountPaise;
				if (key === month) monthCatSpend.set(t.category, (monthCatSpend.get(t.category) ?? 0) + t.amountPaise);
				else if (key === prevKey) prevCatSpend.set(t.category, (prevCatSpend.get(t.category) ?? 0) + t.amountPaise);
			}
		}
		const monthEntry = byMonth.get(month) ?? {
			income: 0,
			expense: 0
		};
		const monthIncome = monthEntry.income;
		const monthExpense = monthEntry.expense;
		const donut = [...monthCatSpend.entries()].map(([id, value]) => {
			const cat = categoryById(id);
			return {
				id,
				label: cat?.label ?? id,
				value,
				color: cat?.color ?? "#64748B"
			};
		}).sort((a, b) => b.value - a.value);
		const bars = [];
		for (let i = 5; i >= 0; i--) {
			const key = shiftMonth(month, -i);
			const e = byMonth.get(key) ?? {
				income: 0,
				expense: 0
			};
			bars.push({
				key,
				label: shortMonthLabel(key),
				income: e.income,
				expense: e.expense
			});
		}
		const keys = [...byMonth.keys()].filter((k) => k <= month).sort();
		const spark = [];
		let running = 0;
		for (const key of keys) {
			const e = byMonth.get(key);
			if (!e) continue;
			running += e.income - e.expense;
			spark.push({
				key,
				label: shortMonthLabel(key),
				net: running
			});
		}
		const spark6 = spark.slice(-6);
		let mover = null;
		for (const id of /* @__PURE__ */ new Set([...monthCatSpend.keys(), ...prevCatSpend.keys()])) {
			const current = monthCatSpend.get(id) ?? 0;
			const previous = prevCatSpend.get(id) ?? 0;
			const delta = current - previous;
			if (delta > 0 && (!mover || delta > mover.delta)) {
				const cat = categoryById(id);
				mover = {
					id,
					label: cat?.label ?? id,
					color: cat?.color ?? "#64748B",
					delta,
					current,
					previous,
					pct: previous > 0 ? Math.round(delta / previous * 100) : null
				};
			}
		}
		const topSlice = donut[0];
		return {
			balance: lifetimeIncome - lifetimeExpenses,
			pnl: monthIncome - monthExpense,
			monthIncome,
			monthExpense,
			donut,
			bars,
			spark: spark6,
			mover,
			topCategory: topSlice ? {
				label: topSlice.label,
				value: topSlice.value
			} : null
		};
	}, [
		txns,
		month,
		prevKey
	]);
	const investedPaise = (0, import_react.useMemo)(() => (holdings ?? []).reduce((sum, h) => sum + h.qty * h.avgPricePaise, 0), [holdings]);
	const loading = txnsLoading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-header backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-17 max-w-dashboard items-center justify-between px-5 lg:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							"aria-label": "FinVerse home",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "hidden items-center gap-8 md:flex",
							"aria-label": "Main navigation",
							children: navLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.to,
								className: cn("text-sm font-medium transition-colors hover:text-primary", item.to === "/" ? "text-primary" : "text-foreground"),
								children: item.label
							}, item.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden items-center gap-3 md:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/chat",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), " Ask AI"]
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "icon",
							size: "icon",
							className: "md:hidden",
							"aria-label": menuOpen ? "Close menu" : "Open menu",
							onClick: () => setMenuOpen(!menuOpen),
							children: menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						})
					]
				}), menuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border bg-background px-5 py-4 md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "grid gap-1",
						"aria-label": "Mobile navigation",
						children: [navLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: "rounded-sm px-3 py-3 text-left text-sm font-medium hover:bg-muted",
							onClick: () => setMenuOpen(false),
							children: item.label
						}, item.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/chat",
							className: "rounded-sm px-3 py-3 text-left text-sm font-bold text-primary hover:bg-muted",
							onClick: () => setMenuOpen(false),
							children: "Ask AI"
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-b border-border bg-surface-soft",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-dashboard gap-8 px-5 py-10 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "self-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center gap-2 text-sm font-bold text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " YOUR FINANCIAL OVERVIEW"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "max-w-2xl text-3xl font-black leading-tight text-primary-dark sm:text-4xl",
									children: "Your money, in one clear view."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 max-w-xl text-base leading-7 text-muted-foreground",
									children: "Track spending, understand your investments, and make confident decisions with AI that always explains why."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-7 flex flex-wrap gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/expenses",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add Expense"]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "lg",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/insights",
											children: ["View AI Insights ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
										})
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-card p-6 shadow-card sm:p-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-muted-foreground",
												children: "TOTAL BALANCE"
											}),
											loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "mt-2 h-9 w-48" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountUp, {
												value: stats.balance,
												className: "mt-2 block text-3xl font-black text-primary-dark"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: "Lifetime income minus lifetime expenses"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 rounded-md border border-border bg-background px-1 py-0.5",
										"aria-label": "Select month",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setMonth(shiftMonth(month, -1)),
												className: "grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
												"aria-label": "Previous month",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-20 px-1 text-center text-sm font-bold text-foreground",
												children: monthLabel(month)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setMonth(shiftMonth(month, 1)),
												disabled: !canGoForward,
												className: "grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30",
												"aria-label": "Next month",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex items-center gap-2",
									children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-5 w-40" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("flex items-center gap-1 font-bold", stats.pnl >= 0 ? "text-success" : "text-destructive"),
										children: [stats.pnl >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountUp, {
											value: stats.pnl,
											format: signFormat,
											duration: 700
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm text-muted-foreground",
										children: [monthLabel(month), " P&L"]
									})] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 border-t border-border pt-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-2 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-muted-foreground",
											children: "NET WORTH · LAST 6 MONTHS"
										}), !loading && stats.spark.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("text-sm font-bold", stats.spark[stats.spark.length - 1].net >= 0 ? "text-success" : "text-destructive"),
											children: formatINRShort(stats.spark[stats.spark.length - 1].net)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetWorthSpark, {
										data: stats.spark,
										ready: chartsReady,
										loading
									})]
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-dashboard px-5 py-10 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold text-primary",
							children: "ANALYTICS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-2xl font-bold text-primary-dark",
							children: "Where your money went"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold text-muted-foreground",
							children: monthLabel(month)
						})]
					}), txnsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive",
						children: "Couldn't load your transactions. Please try again."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-lg border border-border bg-card p-6 shadow-card lg:col-span-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-bold text-primary-dark",
									children: "Spend by category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: monthLabel(month)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendDonut, {
										data: stats.donut,
										totalPaise: stats.monthExpense,
										ready: chartsReady,
										loading
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-lg border border-border bg-card p-6 shadow-card lg:col-span-7",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-bold text-primary-dark",
									children: "Income vs expenses"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: ["Last 6 months, ending ", monthLabel(month)]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-4 text-xs font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-sm bg-[#16A34A]" }), " Income"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-sm bg-[#EF4444]" }), " Expense"]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthBars, {
									data: stats.bars,
									ready: chartsReady,
									loading
								})
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-dashboard px-5 py-10 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold text-primary",
							children: "QUICK ACTIONS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-2xl font-bold text-primary-dark",
							children: "What would you like to do?"
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4",
						children: quickActions.map(({ label, icon: Icon, to }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to,
							className: "group flex flex-col items-center gap-2.5 rounded-md p-2 text-center transition-transform hover:-translate-y-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-15 place-items-center rounded-md bg-tint shadow-tile transition-colors group-hover:bg-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6 text-primary transition-colors group-hover:text-primary-foreground" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-foreground",
								children: label
							})]
						}, label))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-y border-border bg-surface-soft py-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto max-w-dashboard px-5 lg:px-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5 lg:grid-cols-[1fr_320px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-5 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeepLinkCard, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-6" }),
										title: "Expenses",
										to: "/expenses",
										stat: loading ? "…" : formatINRShort(stats.monthExpense),
										statLabel: `Spent in ${monthLabel(month)}`,
										sub: stats.topCategory ? `Top: ${stats.topCategory.label} · ${formatINRShort(stats.topCategory.value)}` : "No spending recorded yet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeepLinkCard, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, { className: "size-6" }),
										title: "Portfolio",
										to: "/portfolio",
										stat: formatINRShort(investedPaise),
										statLabel: "Invested value",
										sub: `${holdings?.length ?? 0} holding${(holdings?.length ?? 0) === 1 ? "" : "s"} at avg. buy price`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeepLinkCard, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6" }),
										title: "Insights",
										to: "/insights",
										stat: stats.mover ? `+${formatINRShort(stats.mover.delta)}` : "—",
										statLabel: "Biggest riser",
										sub: stats.mover ? `${stats.mover.label} vs ${monthLabel(prevKey)}` : "No category rose this month"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
								className: "rounded-lg border border-border bg-card p-6 shadow-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-sm font-bold text-primary-dark",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), " FinVerse AI says"]
									}),
									loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "mt-3 h-16" }) : stats.mover ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm leading-6 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground",
												children: stats.mover.label
											}),
											" rose",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-destructive",
												children: ["+", formatINR(stats.mover.delta)]
											}),
											stats.mover.pct !== null ? ` (${stats.mover.pct}% more)` : "",
											" vs",
											" ",
											monthLabel(prevKey),
											" — your biggest jump this month. That's the first place to look if you want to save."
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm leading-6 text-muted-foreground",
										children: "No spending category rose this month — your habits are holding steady. See the full breakdown of what moved and why."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "mt-4",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/insights",
											children: ["View AI Insights ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
										})
									})
								]
							})]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-b border-border bg-tint/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-dashboard gap-7 px-5 py-8 sm:grid-cols-3 lg:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trust, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {}),
								title: "Bank-grade security",
								detail: "Encrypted and protected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trust, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, {}),
								title: "AI, explained",
								detail: "No black-box scores"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trust, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, {}),
								title: "24×7 help",
								detail: "Support when you need it"
							})
						]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "bg-background",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-dashboard px-5 py-10 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-xs text-sm leading-6 text-muted-foreground",
								children: "Decision support for better money habits. FinVerse does not provide financial advice."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterColumn, {
								heading: "Product",
								links: [
									{
										label: "Dashboard",
										to: "/"
									},
									{
										label: "Portfolio",
										to: "/portfolio"
									},
									{
										label: "AI Insights",
										to: "/insights"
									}
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterColumn, {
								heading: "Company",
								links: [
									{ label: "About" },
									{ label: "Security" },
									{ label: "Contact" }
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterColumn, {
								heading: "Resources",
								links: [
									{ label: "Help Centre" },
									{ label: "Privacy" },
									{ label: "Terms" }
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 FinVerse AI. All rights reserved." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Data encrypted · Explainable AI · Decision support only" })]
					})]
				})
			})
		]
	});
}
function DeepLinkCard({ icon, title, to, stat, statLabel, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "group flex flex-col rounded-lg border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-modal",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-12 shrink-0 place-items-center rounded-md bg-tint text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-2xl font-black text-primary-dark",
				children: stat
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: statLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 min-h-8 text-xs leading-5 text-muted-foreground",
				children: sub
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-3 flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary-hover",
				children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 transition-transform group-hover:translate-x-0.5" })]
			})
		]
	});
}
function FooterColumn({ heading, links }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "text-xs font-bold text-foreground",
		children: heading
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 grid gap-2",
		children: links.map((link) => link.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: link.to,
			className: "w-fit text-left text-xs text-muted-foreground hover:text-primary",
			children: link.label
		}, link.label) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-fit text-left text-xs text-muted-foreground",
			children: link.label
		}, link.label))
	})] });
}
function Trust({ icon, title, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 sm:justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-primary [&>svg]:size-6",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-primary-dark",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: detail
		})] })]
	});
}
//#endregion
export { FinVerseDashboard as component };
