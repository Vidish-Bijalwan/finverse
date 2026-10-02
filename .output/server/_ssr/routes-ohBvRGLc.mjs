import { i as __toESM } from "../_runtime.mjs";
import { a as performance_default } from "../_libs/h3+rou3+srvx+unenv.mjs";
import { a as monthKey, i as formatINRShort, o as monthLabel, r as formatINR, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as ArrowRight, At as ChevronLeft, Bt as Calculator, Ht as BriefcaseBusiness, I as Receipt, Pt as ChartNoAxesCombined, R as Plus, T as ShieldCheck, Ut as Bot, a as Wallet, b as Sparkles, d as TrendingUp, f as TrendingDown, gt as Eye, h as Target, kt as ChevronRight, lt as Headphones, o as WalletCards, tt as Lightbulb } from "../_libs/lucide-react.mjs";
import { a as categoryById } from "./categories-Cb25vI5n.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as useMonth, S as useHoldings, k as useTransactions } from "./hooks-CJFESX97.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, o as Area, r as BarChart, s as CartesianGrid, t as AreaChart, u as Cell } from "../_libs/recharts+[...].mjs";
import { n as MoneyTooltip, r as axisTick, t as ChartSkeleton } from "./money-BaxTj13n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ohBvRGLc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
/** Grouped income-vs-expense bars for the six months ending at the selected month. */
function MonthBars({ data, ready, loading }) {
	const reducedMotion = usePrefersReducedMotion();
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
						maxBarSize: 22,
						isAnimationActive: !reducedMotion
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
						maxBarSize: 22,
						isAnimationActive: !reducedMotion
					})
				]
			})
		})
	});
}
/** Cumulative net-worth sparkline (area) for the last six months. */
function NetWorthSpark({ data, ready, loading }) {
	const reducedMotion = usePrefersReducedMotion();
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
						},
						isAnimationActive: !reducedMotion
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
	const reducedMotion = usePrefersReducedMotion();
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
				isAnimationActive: !reducedMotion,
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
	},
	{
		label: "Accounts",
		icon: Wallet,
		to: "/accounts"
	},
	{
		label: "Calculators",
		icon: Calculator,
		to: "/tools"
	},
	{
		label: "Watchlist",
		icon: Eye,
		to: "/watchlist"
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
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
						className: "group flex flex-col items-center gap-2.5 rounded-md p-2 text-center transition-transform hover:-translate-y-0.5 active:scale-95",
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
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
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
		})]
	});
}
function DeepLinkCard({ icon, title, to, stat, statLabel, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "group flex flex-col rounded-lg border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-modal active:translate-y-0 active:scale-[0.99]",
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
			className: "w-fit text-left text-xs text-muted-foreground transition-colors hover:text-primary",
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
