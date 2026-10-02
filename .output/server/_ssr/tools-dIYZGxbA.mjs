import { i as __toESM } from "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as monthKey, i as formatINRShort, r as formatINR, s as todayISO, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Dt as CircleCheck, F as ReceiptText, H as PiggyBank, St as CreditCard, T as ShieldCheck, U as Percent, a as Wallet, d as TrendingUp, h as Target, j as Scale, l as Trophy, r as Wrench, rt as Landmark, zt as CalendarClock } from "../_libs/lucide-react.mjs";
import { a as categoryById } from "./categories-Cb25vI5n.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { f as useBills, k as useTransactions, x as useGoals } from "./hooks-CJFESX97.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { t as Switch } from "./switch-DrXkgCMB.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { t as Badge } from "./badge-EsPiNyuV.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-CxSeJsg6.mjs";
import { t as Progress } from "./progress-DTdwfIPe.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-TNME72yI.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, r as BarChart, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { n as MoneyTooltip, r as axisTick, t as ChartSkeleton } from "./money-BaxTj13n.mjs";
import { t as Slider } from "./slider-CvgJFxyv.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tools-dIYZGxbA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
var SUFFIX = {
	rupees: "₹",
	percent: "%",
	months: "mo",
	years: "yr",
	plain: ""
};
/**
* Combined numeric input + slider for calculator inputs.
* The text field is free-typing friendly; the slider commits clamped values.
*/
function CalcField({ label, value, onChange, min, max, step = 1, format = "rupees", error, helper, id }) {
	const [text, setText] = (0, import_react.useState)(() => String(value));
	(0, import_react.useEffect)(() => {
		setText(String(value));
	}, [value]);
	const commit = (raw) => {
		setText(raw);
		const parsed = Number(raw.replace(/,/g, ""));
		if (!Number.isFinite(parsed)) return;
		onChange(parsed);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: id,
					className: "text-sm font-medium text-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-36 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id,
						inputMode: "decimal",
						value: text,
						onChange: (e) => commit(e.target.value),
						onBlur: () => setText(String(value)),
						className: cn("pr-10 text-right font-semibold tabular-nums", error && "border-destructive focus-visible:ring-destructive/40"),
						"aria-invalid": Boolean(error),
						"aria-describedby": error ? `${id}-error` : void 0
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground",
						children: SUFFIX[format]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				value: [Math.min(max, Math.max(min, value))],
				min,
				max,
				step,
				onValueChange: ([v]) => {
					if (v !== void 0) onChange(v);
				},
				"aria-label": label,
				className: cn(error && "[&_[role=slider]]:border-destructive")
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: `${id}-error`,
				role: "alert",
				className: "text-xs font-medium text-destructive",
				children: error
			}) : helper ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: helper
			}) : null
		]
	});
}
var ACCENT = {
	default: "text-foreground",
	primary: "text-primary",
	success: "text-emerald-600 dark:text-emerald-400",
	warning: "text-amber-600 dark:text-amber-400",
	danger: "text-destructive"
};
/** Big result number card used across calculator tabs. */
function ResultStat({ label, value, sub, accent = "default", icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex items-center gap-3 p-4",
			children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("truncate text-xl font-bold tabular-nums", ACCENT[accent]),
						children: value
					}),
					sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: sub
					})
				]
			})]
		})
	});
}
/** Single label/value line for breakdown lists. */
function ResultRow({ label, value, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-sm text-muted-foreground", strong && "font-medium text-foreground"),
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-sm tabular-nums", strong ? "font-bold text-foreground" : "font-medium"),
			children: value
		})]
	});
}
function calcEmi(input) {
	const { principal, annualRatePct, months } = input;
	const n = Math.round(months);
	const empty = {
		emi: 0,
		totalInterest: 0,
		totalPayable: 0,
		schedule: []
	};
	if (n <= 0 || principal <= 0) return empty;
	const r = annualRatePct / 100 / 12;
	let emi;
	if (r === 0) emi = principal / n;
	else {
		const growth = Math.pow(1 + r, n);
		emi = principal * r * growth / (growth - 1);
	}
	const emiPaise = Math.round(emi * 100);
	let balancePaise = Math.round(principal * 100);
	const schedule = [];
	let interestPaiseTotal = 0;
	for (let m = 1; m <= n; m++) {
		const interestPaise = Math.round(balancePaise * r);
		let principalPaise = emiPaise - interestPaise;
		if (m === n || principalPaise > balancePaise) principalPaise = balancePaise;
		const payPaise = m === n ? principalPaise + interestPaise : emiPaise;
		balancePaise -= principalPaise;
		interestPaiseTotal += interestPaise;
		schedule.push({
			month: m,
			emi: payPaise / 100,
			principal: principalPaise / 100,
			interest: interestPaise / 100,
			balance: Math.max(0, balancePaise) / 100
		});
	}
	const totalInterest = interestPaiseTotal / 100;
	return {
		emi: emiPaise / 100,
		totalInterest,
		totalPayable: principal + totalInterest,
		schedule
	};
}
function emiYearlyBuckets(schedule) {
	const buckets = /* @__PURE__ */ new Map();
	for (const row of schedule) {
		const year = Math.ceil(row.month / 12);
		const b = buckets.get(year) ?? {
			year,
			principal: 0,
			interest: 0
		};
		b.principal += row.principal;
		b.interest += row.interest;
		buckets.set(year, b);
	}
	return [...buckets.values()].sort((a, b) => a.year - b.year);
}
function validateEmi(input) {
	if (!Number.isFinite(input.principal) || input.principal <= 0) return "Loan amount must be greater than ₹0.";
	if (input.principal > 5e8) return "Loan amount looks too large — keep it under ₹50 crore.";
	if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0) return "Interest rate can't be negative.";
	if (input.annualRatePct > 60) return "Interest rate above 60% p.a. is unrealistic.";
	if (!Number.isFinite(input.months) || input.months < 1) return "Tenure must be at least 1 month.";
	if (input.months > 360) return "Tenure can't exceed 360 months (30 years).";
	return null;
}
var toPaise$5 = (rupees) => Math.round(rupees * 100);
function EmiTab() {
	const [input, setInput] = (0, import_react.useState)({
		principal: 1e6,
		annualRatePct: 9.5,
		months: 120
	});
	const set = (k, v) => setInput((p) => ({
		...p,
		[k]: v
	}));
	const error = validateEmi(input);
	const result = (0, import_react.useMemo)(() => calcEmi(input), [input]);
	const buckets = (0, import_react.useMemo)(() => emiYearlyBuckets(result.schedule), [result.schedule]);
	const reducedMotion = usePrefersReducedMotion();
	const interestShare = result.totalPayable > 0 ? result.totalInterest / result.totalPayable * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "EMI calculator"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "emi-principal",
					label: "Loan amount",
					value: input.principal,
					onChange: (v) => set("principal", v),
					min: 1e4,
					max: 1e8,
					step: 1e4,
					format: "rupees",
					error: error && (input.principal <= 0 || input.principal > 5e8) ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "emi-rate",
					label: "Annual interest rate",
					value: input.annualRatePct,
					onChange: (v) => set("annualRatePct", v),
					min: 1,
					max: 24,
					step: .1,
					format: "percent",
					error: error && (input.annualRatePct < 0 || input.annualRatePct > 60) ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "emi-months",
					label: "Tenure",
					value: input.months,
					onChange: (v) => set("months", Math.round(v)),
					min: 6,
					max: 360,
					step: 6,
					format: "months",
					error: error && (input.months < 1 || input.months > 360) ? error : null,
					helper: `${Math.floor(input.months / 12)}y ${input.months % 12}m`
				})
			]
		})] }), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm font-medium text-destructive",
				children: error
			})
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Monthly EMI",
						value: formatINR(toPaise$5(result.emi)),
						accent: "primary",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Total interest",
						value: formatINR(toPaise$5(result.totalInterest)),
						sub: `${interestShare.toFixed(1)}% of total payable`,
						accent: "warning",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Total payable",
						value: formatINR(toPaise$5(result.totalPayable)),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, {
							className: "size-5",
							"aria-hidden": true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Principal vs interest per year"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: buckets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-56" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-56",
				role: "img",
				"aria-label": "Yearly principal vs interest chart",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: buckets.map((b) => ({
							year: `Yr ${b.year}`,
							principal: toPaise$5(b.principal),
							interest: toPaise$5(b.interest)
						})),
						margin: {
							top: 8,
							right: 4,
							bottom: 0,
							left: -8
						},
						barGap: 2,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								vertical: false,
								stroke: "var(--color-border)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "year",
								tickLine: false,
								axisLine: false,
								tick: {
									fontSize: 11,
									fill: "var(--color-muted-foreground)"
								},
								interval: "preserveStartEnd"
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								name: "Principal",
								dataKey: "principal",
								stackId: "a",
								fill: "#2563EB",
								radius: [
									0,
									0,
									0,
									0
								],
								maxBarSize: 26,
								isAnimationActive: !reducedMotion
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								name: "Interest",
								dataKey: "interest",
								stackId: "a",
								fill: "#F59E0B",
								radius: [
									4,
									4,
									0,
									0
								],
								maxBarSize: 26,
								isAnimationActive: !reducedMotion
							})
						]
					})
				})
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base",
					children: ["Amortisation schedule", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-xs font-normal text-muted-foreground",
						children: [result.schedule.length, " months"]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "px-2 sm:px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "h-80 rounded-md border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
						className: "sticky top-0 bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "w-16",
								children: "Month"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "EMI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Principal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Interest"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Balance"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.schedule.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium tabular-nums",
							children: row.month
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums",
							children: formatINRShort(toPaise$5(row.emi))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums text-blue-600 dark:text-blue-400",
							children: formatINRShort(toPaise$5(row.principal))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums text-amber-600 dark:text-amber-400",
							children: formatINRShort(toPaise$5(row.interest))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums",
							children: formatINRShort(toPaise$5(row.balance))
						})
					] }, row.month)) })] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2 pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
							label: "Loan amount",
							value: formatINR(toPaise$5(input.principal))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
							label: "Total interest",
							value: formatINR(toPaise$5(result.totalInterest))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
								label: "Total payable",
								value: formatINR(toPaise$5(result.totalPayable)),
								strong: true
							})
						})
					]
				})]
			})] })
		] })]
	});
}
function calcEmergencyFund(input, savingPerMonth = 0) {
	const target = Math.max(0, input.monthlyExpenses * input.monthsCover);
	const saved = Math.max(0, input.savedSoFar);
	const gap = Math.max(0, target - saved);
	return {
		target,
		gap,
		currentCoverMonths: input.monthlyExpenses > 0 ? saved / input.monthlyExpenses : 0,
		fundedPct: target > 0 ? Math.min(100, saved / target * 100) : 0,
		monthsToTarget: savingPerMonth > 0 && gap > 0 ? Math.ceil(gap / savingPerMonth) : null
	};
}
function validateEmergency(input) {
	if (!Number.isFinite(input.monthlyExpenses) || input.monthlyExpenses <= 0) return "Monthly expenses must be greater than ₹0.";
	if (input.monthlyExpenses > 1e7) return "Monthly expenses look too large — keep them under ₹1 crore.";
	if (!Number.isFinite(input.monthsCover) || input.monthsCover < 1) return "Cover must be at least 1 month.";
	if (input.monthsCover > 36) return "Cover can't exceed 36 months.";
	if (!Number.isFinite(input.savedSoFar) || input.savedSoFar < 0) return "Existing savings can't be negative.";
	return null;
}
var toPaise$4 = (rupees) => Math.round(rupees * 100);
/** Average monthly expenses (rupees) from transaction history. */
function avgMonthlyExpenses(txns) {
	const byMonth = /* @__PURE__ */ new Map();
	for (const t of txns) {
		if (t.type !== "expense") continue;
		const key = t.dateISO.slice(0, 7);
		byMonth.set(key, (byMonth.get(key) ?? 0) + t.amountPaise);
	}
	if (byMonth.size === 0) return 0;
	return [...byMonth.values()].reduce((s, v) => s + v, 0) / byMonth.size / 100;
}
function EmergencyTab() {
	const { data: transactions = [], isLoading: txnsLoading } = useTransactions();
	const { data: goals = [], isLoading: goalsLoading } = useGoals();
	const loading = txnsLoading || goalsLoading;
	const detectedAvg = (0, import_react.useMemo)(() => avgMonthlyExpenses(transactions), [transactions]);
	const emergencyGoal = (0, import_react.useMemo)(() => goals.find((g) => g.id === "goal-emergency") ?? goals.find((g) => g.name.toLowerCase().includes("emergency")), [goals]);
	const [input, setInput] = (0, import_react.useState)({
		monthlyExpenses: 5e4,
		monthsCover: 6,
		savedSoFar: 0
	});
	const [touchedExpenses, setTouchedExpenses] = (0, import_react.useState)(false);
	const [touchedSaved, setTouchedSaved] = (0, import_react.useState)(false);
	const [savingPerMonth, setSavingPerMonth] = (0, import_react.useState)(1e4);
	(0, import_react.useEffect)(() => {
		if (!txnsLoading && !touchedExpenses) setInput((p) => ({
			...p,
			monthlyExpenses: detectedAvg > 0 ? Math.round(detectedAvg) : p.monthlyExpenses
		}));
	}, [
		txnsLoading,
		detectedAvg,
		touchedExpenses
	]);
	(0, import_react.useEffect)(() => {
		if (!goalsLoading && !touchedSaved) setInput((p) => ({
			...p,
			savedSoFar: emergencyGoal ? Math.round(emergencyGoal.savedPaise / 100) : p.savedSoFar
		}));
	}, [
		goalsLoading,
		emergencyGoal,
		touchedSaved
	]);
	const set = (k, v, touch) => {
		touch?.();
		setInput((p) => ({
			...p,
			[k]: v
		}));
	};
	const error = validateEmergency(input);
	const result = (0, import_react.useMemo)(() => calcEmergencyFund(input, savingPerMonth), [input, savingPerMonth]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		"aria-label": "Loading emergency fund planner",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Emergency-fund planner"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "em-monthly",
					label: "Monthly expenses",
					value: input.monthlyExpenses,
					onChange: (v) => set("monthlyExpenses", v, () => setTouchedExpenses(true)),
					min: 1e3,
					max: 5e6,
					step: 1e3,
					format: "rupees",
					error: error && input.monthlyExpenses <= 0 ? error : null,
					helper: detectedAvg > 0 ? `Prefilled from your actual average monthly spend (${formatINR(toPaise$4(detectedAvg))})` : "Add expenses and we'll prefill your average here"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "em-cover",
					label: "Months of cover",
					value: input.monthsCover,
					onChange: (v) => set("monthsCover", Math.round(v)),
					min: 1,
					max: 24,
					step: 1,
					format: "months",
					error: error && (input.monthsCover < 1 || input.monthsCover > 36) ? error : null,
					helper: "Most advisors suggest 3–6 months; 6+ if income is variable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "em-saved",
					label: "Already saved",
					value: input.savedSoFar,
					onChange: (v) => set("savedSoFar", v, () => setTouchedSaved(true)),
					min: 0,
					max: 1e8,
					step: 5e3,
					format: "rupees",
					error: error && input.savedSoFar < 0 ? error : null,
					helper: emergencyGoal ? `From your “${emergencyGoal.name}” goal (${formatINR(emergencyGoal.savedPaise)})` : "No emergency goal found — add one on the Goals page to track this automatically"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "em-save-rate",
					label: "I can save per month",
					value: savingPerMonth,
					onChange: (v) => setSavingPerMonth(Math.max(0, v)),
					min: 0,
					max: 1e6,
					step: 1e3,
					format: "rupees"
				})
			]
		})] }), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm font-medium text-destructive",
				children: error
			})
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Target fund",
						value: formatINR(toPaise$4(result.target)),
						sub: `${input.monthsCover} months × ${formatINR(toPaise$4(input.monthlyExpenses))}`,
						accent: "primary",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Still to save",
						value: formatINR(toPaise$4(result.gap)),
						sub: result.monthsToTarget !== null ? `≈ ${result.monthsToTarget} month${result.monthsToTarget === 1 ? "" : "s"} at your saving rate` : result.gap === 0 ? "Fully funded — nice work" : "Set a monthly saving rate above",
						accent: result.gap === 0 ? "success" : "warning",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Current coverage",
						value: `${result.currentCoverMonths.toFixed(1)} mo`,
						sub: formatINR(toPaise$4(input.savedSoFar)),
						accent: result.currentCoverMonths >= input.monthsCover ? "success" : "default",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							className: "size-5",
							"aria-hidden": true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "Funding progress"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold tabular-nums",
							children: [result.fundedPct.toFixed(0), "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: result.fundedPct,
						"aria-label": "Emergency fund progress"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
								label: "Target",
								value: formatINR(toPaise$4(result.target))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
								label: "Saved",
								value: formatINR(toPaise$4(input.savedSoFar))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
									label: "Remaining",
									value: formatINR(toPaise$4(result.gap)),
									strong: true
								})
							})
						]
					}),
					!emergencyGoal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "mt-2 w-full sm:w-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/goals",
							children: "Track this in a savings goal"
						})
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-5 text-muted-foreground",
				children: [
					"Figures are in today's rupees (as of ",
					monthKey(todayISO()),
					"). Keep emergency money in a liquid, low-risk place — savings account or liquid fund — not in equities."
				]
			})
		] })]
	});
}
var COMPOUNDING_PERIODS = {
	yearly: 1,
	"half-yearly": 2,
	quarterly: 4,
	monthly: 12
};
var COMPOUNDING_LABELS = {
	yearly: "Yearly",
	"half-yearly": "Half-yearly",
	quarterly: "Quarterly",
	monthly: "Monthly"
};
function calcFd(input) {
	const { principal, annualRatePct, years, compounding } = input;
	if (principal <= 0 || years <= 0) return {
		maturity: 0,
		interest: 0,
		effectiveAnnualPct: 0
	};
	const k = COMPOUNDING_PERIODS[compounding];
	const r = annualRatePct / 100;
	const periods = k * years;
	const maturity = r === 0 ? principal : principal * Math.pow(1 + r / k, periods);
	const effectiveAnnualPct = (Math.pow(1 + r / k, k) - 1) * 100;
	return {
		maturity,
		interest: maturity - principal,
		effectiveAnnualPct
	};
}
/** Year-by-year value series for charts. */
function fdGrowthSeries(input) {
	const points = [];
	const wholeYears = Math.max(1, Math.round(input.years));
	for (let y = 1; y <= wholeYears; y++) {
		const r = calcFd({
			...input,
			years: Math.min(y, input.years)
		});
		points.push({
			year: y,
			value: r.maturity
		});
	}
	return points;
}
function validateFd(input) {
	if (!Number.isFinite(input.principal) || input.principal <= 0) return "Deposit amount must be greater than ₹0.";
	if (input.principal > 1e9) return "Deposit looks too large — keep it under ₹100 crore.";
	if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0) return "Interest rate can't be negative.";
	if (input.annualRatePct > 20) return "FD rates above 20% p.a. are unrealistic.";
	if (!Number.isFinite(input.years) || input.years < .25) return "Tenure must be at least 3 months.";
	if (input.years > 30) return "Tenure can't exceed 30 years.";
	return null;
}
var toPaise$3 = (rupees) => Math.round(rupees * 100);
function FdTab() {
	const [input, setInput] = (0, import_react.useState)({
		principal: 1e5,
		annualRatePct: 7.25,
		years: 5,
		compounding: "quarterly"
	});
	const set = (k, v) => setInput((p) => ({
		...p,
		[k]: v
	}));
	const error = validateFd(input);
	const result = (0, import_react.useMemo)(() => calcFd(input), [input]);
	const series = (0, import_react.useMemo)(() => fdGrowthSeries(input).map((p) => ({
		year: `Yr ${p.year}`,
		value: toPaise$3(p.value)
	})), [input]);
	const reducedMotion = usePrefersReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "FD / lump-sum calculator"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "fd-principal",
					label: "Deposit amount",
					value: input.principal,
					onChange: (v) => set("principal", v),
					min: 1e3,
					max: 1e8,
					step: 5e3,
					format: "rupees",
					error: error && (input.principal <= 0 || input.principal > 1e9) ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "fd-rate",
					label: "Annual interest rate",
					value: input.annualRatePct,
					onChange: (v) => set("annualRatePct", v),
					min: 1,
					max: 15,
					step: .05,
					format: "percent",
					error: error && (input.annualRatePct < 0 || input.annualRatePct > 20) ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "fd-years",
					label: "Tenure",
					value: input.years,
					onChange: (v) => set("years", Math.round(v)),
					min: 1,
					max: 30,
					step: 1,
					format: "years",
					error: error && (input.years < .25 || input.years > 30) ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "fd-compounding",
						className: "text-sm font-medium text-foreground",
						children: "Compounding frequency"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: input.compounding,
						onValueChange: (v) => set("compounding", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "fd-compounding",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(COMPOUNDING_LABELS).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: f,
							children: COMPOUNDING_LABELS[f]
						}, f)) })]
					})]
				})
			]
		})] }), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm font-medium text-destructive",
				children: error
			})
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
					label: "Maturity value",
					value: formatINR(toPaise$3(result.maturity)),
					accent: "primary",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, {
						className: "size-5",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
					label: "Interest earned",
					value: formatINR(toPaise$3(result.interest)),
					accent: "success",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, {
						className: "size-5",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
					label: "Effective annual yield",
					value: `${result.effectiveAnnualPct.toFixed(2)}%`,
					sub: `On a deposit of ${formatINRShort(toPaise$3(input.principal))}`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
						className: "size-5",
						"aria-hidden": true
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Value over time"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [series.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-64" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-64",
			role: "img",
			"aria-label": "FD growth chart",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: series,
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
							dataKey: "year",
							tickLine: false,
							axisLine: false,
							tick: {
								fontSize: 11,
								fill: "var(--color-muted-foreground)"
							},
							interval: "preserveStartEnd"
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							name: "Value",
							dataKey: "value",
							type: "monotone",
							fill: "#2563EB",
							fillOpacity: .25,
							stroke: "#2563EB",
							strokeWidth: 2,
							isAnimationActive: !reducedMotion
						})
					]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Tax on FD interest is not included — interest is taxed at your slab rate."
		})] })] })] })]
	});
}
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
var MONTH_ABBR = [
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
function shiftMonth(key, delta) {
	const parts = key.split("-").map(Number);
	let y = parts[0] ?? 0;
	let m = parts[1] ?? 1;
	m += delta;
	while (m > 12) {
		m -= 12;
		y += 1;
	}
	while (m < 1) {
		m += 12;
		y -= 1;
	}
	return `${y}-${String(m).padStart(2, "0")}`;
}
function monthLabel(key) {
	const parts = key.split("-").map(Number);
	const y = parts[0] ?? 0;
	return `${MONTH_ABBR[(parts[1] ?? 1) - 1] ?? "?"} '${String(y).slice(2)}`;
}
function forecastCashFlow(transactions, bills, todayKey, projectionMonths = 3) {
	const monthly = /* @__PURE__ */ new Map();
	const catMonthly = /* @__PURE__ */ new Map();
	for (const t of transactions) {
		if (t.type === "transfer") continue;
		const rupees = t.amountPaise / 100;
		if (!Number.isFinite(rupees) || rupees <= 0) continue;
		const key = t.dateISO.slice(0, 7);
		if (key > todayKey) continue;
		let m = monthly.get(key);
		if (!m) {
			m = {
				income: 0,
				expenses: 0
			};
			monthly.set(key, m);
		}
		if (t.type === "income") m.income += rupees;
		else m.expenses += rupees;
		if (t.type === "expense") {
			let cm = catMonthly.get(t.category);
			if (!cm) {
				cm = /* @__PURE__ */ new Map();
				catMonthly.set(t.category, cm);
			}
			cm.set(key, (cm.get(key) ?? 0) + rupees);
		}
	}
	const sortedKeys = [...monthly.keys()].sort();
	const historyMonths = sortedKeys.length;
	const history = sortedKeys.map((key) => ({
		key,
		label: monthLabel(key),
		income: Math.round(monthly.get(key).income),
		expenses: Math.round(monthly.get(key).expenses)
	}));
	const avgMonthlyIncome = historyMonths > 0 ? history.reduce((s, h) => s + h.income, 0) / historyMonths : 0;
	const avgMonthlyExpenses = historyMonths > 0 ? history.reduce((s, h) => s + h.expenses, 0) / historyMonths : 0;
	const categories = [...catMonthly.entries()].map(([category, byMonth]) => ({
		category,
		avgMonthly: [...byMonth.values()].reduce((s, v) => s + v, 0) / Math.max(1, historyMonths),
		monthsActive: byMonth.size
	})).filter((c) => c.avgMonthly >= 1).sort((a, b) => b.avgMonthly - a.avgMonthly);
	const monthlyBillOutflow = bills.reduce((s, b) => s + b.amountPaise / 100, 0);
	const anchor = historyMonths > 0 ? sortedKeys[sortedKeys.length - 1] ?? todayKey : todayKey;
	const projection = [];
	for (let i = 1; i <= projectionMonths; i++) {
		const key = shiftMonth(anchor, i);
		const income = Math.round(avgMonthlyIncome);
		const expenses = Math.round(avgMonthlyExpenses);
		projection.push({
			key,
			label: monthLabel(key),
			projected: true,
			income,
			expenses,
			net: income - expenses
		});
	}
	return {
		historyMonths,
		history,
		categories,
		monthlyBillOutflow: Math.round(monthlyBillOutflow),
		projection,
		avgMonthlyIncome: Math.round(avgMonthlyIncome),
		avgMonthlyExpenses: Math.round(avgMonthlyExpenses),
		insufficientData: historyMonths === 0
	};
}
var toPaise$2 = (rupees) => Math.round(rupees * 100);
function ForecastTab() {
	const { data: transactions = [], isLoading: txnsLoading } = useTransactions();
	const { data: bills = [], isLoading: billsLoading } = useBills();
	const loading = txnsLoading || billsLoading;
	const reducedMotion = usePrefersReducedMotion();
	const forecast = (0, import_react.useMemo)(() => forecastCashFlow(transactions, bills, monthKey(todayISO())), [transactions, bills]);
	const chartData = (0, import_react.useMemo)(() => {
		const hist = forecast.history.slice(-3).map((h) => ({
			label: h.label,
			income: toPaise$2(h.income),
			expenses: toPaise$2(h.expenses),
			projected: false
		}));
		const proj = forecast.projection.map((p) => ({
			label: `${p.label}*`,
			income: toPaise$2(p.income),
			expenses: toPaise$2(p.expenses),
			projected: true
		}));
		return [...hist, ...proj];
	}, [forecast]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		"aria-label": "Loading cash-flow forecast",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" })]
	});
	if (forecast.insufficientData) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-col items-center gap-3 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-14 place-items-center rounded-2xl bg-primary/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-7 text-primary" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-medium",
				children: "Not enough history yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: "The forecast needs at least one month of income or expenses. Add transactions and this page will project your next 3 months automatically."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/expenses",
					children: "Add your first transaction"
				})
			})
		]
	}) });
	const projectedNet = forecast.projection.reduce((s, p) => s + p.net, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			forecast.historyMonths < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, {
					className: "size-4",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Limited history" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
					"Based on only ",
					forecast.historyMonths,
					" month",
					forecast.historyMonths === 1 ? "" : "s",
					" of data — projections will sharpen as you record more transactions."
				] })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Avg monthly income",
						value: formatINR(toPaise$2(forecast.avgMonthlyIncome)),
						accent: "success",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Avg monthly expenses",
						value: formatINR(toPaise$2(forecast.avgMonthlyExpenses)),
						accent: "danger",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
						label: "Projected net · next 3 mo",
						value: `${projectedNet >= 0 ? "+" : "−"}${formatINR(toPaise$2(Math.abs(projectedNet)))}`,
						accent: projectedNet >= 0 ? "success" : "warning",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
							className: "size-5",
							"aria-hidden": true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base",
					children: ["Income vs expenses", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-xs font-normal text-muted-foreground",
						children: [
							"last ",
							Math.min(3, forecast.historyMonths),
							" mo actual + 3 mo projected (*)"
						]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64",
				role: "img",
				"aria-label": "Cash-flow history and forecast chart",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: chartData,
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
								name: "Expenses",
								dataKey: "expenses",
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
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Next 3 months"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "px-2 sm:px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Month" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Income"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Expenses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Net"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: forecast.projection.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: p.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right tabular-nums text-emerald-600 dark:text-emerald-400",
						children: formatINRShort(toPaise$2(p.income))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right tabular-nums text-red-600 dark:text-red-400",
						children: formatINRShort(toPaise$2(p.expenses))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: cn("text-right font-semibold tabular-nums", p.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"),
						children: [p.net >= 0 ? "+" : "−", formatINRShort(toPaise$2(Math.abs(p.net)))]
					})
				] }, p.key)) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
						label: "Committed monthly bills",
						value: formatINR(toPaise$2(forecast.monthlyBillOutflow))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
						label: "Avg monthly net",
						value: `${forecast.avgMonthlyIncome - forecast.avgMonthlyExpenses >= 0 ? "+" : "−"}${formatINR(toPaise$2(Math.abs(forecast.avgMonthlyIncome - forecast.avgMonthlyExpenses)))}`,
						strong: true
					})]
				})]
			})] }),
			forecast.categories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Where the money goes (monthly avg)"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-3",
				children: forecast.categories.slice(0, 6).map((c) => {
					const cat = categoryById(c.category);
					const Icon = cat?.icon;
					const max = forecast.categories[0]?.avgMonthly || 1;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 shrink-0 place-items-center rounded-lg",
							style: {
								backgroundColor: `${cat?.color ?? "#64748B"}1A`,
								color: cat?.color ?? "#64748B"
							},
							"aria-hidden": true,
							children: Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: cat?.label ?? c.category
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "shrink-0 text-sm font-semibold tabular-nums",
									children: formatINR(toPaise$2(c.avgMonthly))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 h-1.5 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full",
									style: {
										width: `${Math.min(100, c.avgMonthly / max * 100)}%`,
										backgroundColor: cat?.color ?? "#64748B"
									}
								})
							})]
						})]
					}, c.category);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-5 text-muted-foreground",
				children: [
					"Projected from your per-category monthly averages over ",
					forecast.historyMonths,
					" month",
					forecast.historyMonths === 1 ? "" : "s",
					" of history, excluding transfers. One-off spikes are smoothed into the averages — treat this as a planning guide, not a promise."
				]
			})
		]
	});
}
function calcSip(input) {
	const { monthlyAmount, annualRatePct, years } = input;
	const months = Math.round(years * 12);
	if (months <= 0 || monthlyAmount <= 0) return {
		invested: 0,
		maturity: 0,
		gains: 0
	};
	const i = annualRatePct / 100 / 12;
	const invested = monthlyAmount * months;
	let maturity;
	if (i === 0) maturity = invested;
	else maturity = monthlyAmount * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
	return {
		invested,
		maturity,
		gains: maturity - invested
	};
}
/** Year-by-year growth series for charts (invested vs maturity value). */
function sipGrowthSeries(input) {
	const points = [];
	for (let y = 1; y <= Math.round(input.years); y++) {
		const r = calcSip({
			...input,
			years: y
		});
		points.push({
			year: y,
			invested: r.invested,
			value: r.maturity
		});
	}
	return points;
}
function validateSip(input) {
	if (!Number.isFinite(input.monthlyAmount) || input.monthlyAmount <= 0) return "Monthly amount must be greater than ₹0.";
	if (input.monthlyAmount > 1e7) return "Monthly amount looks too large — keep it under ₹1 crore.";
	if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0) return "Expected return can't be negative.";
	if (input.annualRatePct > 50) return "Expected return above 50% p.a. is unrealistic.";
	if (!Number.isFinite(input.years) || input.years < 1) return "Tenure must be at least 1 year.";
	if (input.years > 60) return "Tenure can't exceed 60 years.";
	return null;
}
var toPaise$1 = (rupees) => Math.round(rupees * 100);
function SipTab() {
	const [input, setInput] = (0, import_react.useState)({
		monthlyAmount: 1e4,
		annualRatePct: 12,
		years: 10
	});
	const set = (k, v) => setInput((p) => ({
		...p,
		[k]: v
	}));
	const error = validateSip(input);
	const result = (0, import_react.useMemo)(() => calcSip(input), [input]);
	const series = (0, import_react.useMemo)(() => sipGrowthSeries(input).map((p) => ({
		year: `Yr ${p.year}`,
		invested: toPaise$1(p.invested),
		value: toPaise$1(p.value)
	})), [input]);
	const reducedMotion = usePrefersReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "SIP calculator"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "sip-amount",
					label: "Monthly investment",
					value: input.monthlyAmount,
					onChange: (v) => set("monthlyAmount", v),
					min: 500,
					max: 1e6,
					step: 500,
					format: "rupees",
					error: error && (input.monthlyAmount <= 0 || input.monthlyAmount > 1e7) ? error : null,
					helper: "How much you invest every month"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "sip-rate",
					label: "Expected annual return",
					value: input.annualRatePct,
					onChange: (v) => set("annualRatePct", v),
					min: 1,
					max: 30,
					step: .5,
					format: "percent",
					error: error && (input.annualRatePct < 0 || input.annualRatePct > 50) ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "sip-years",
					label: "Time period",
					value: input.years,
					onChange: (v) => set("years", Math.round(v)),
					min: 1,
					max: 30,
					step: 1,
					format: "years",
					error: error && (input.years < 1 || input.years > 60) ? error : null
				})
			]
		})] }), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm font-medium text-destructive",
				children: error
			})
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
					label: "Maturity value",
					value: formatINR(toPaise$1(result.maturity)),
					accent: "primary",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, {
						className: "size-5",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
					label: "Total invested",
					value: formatINR(toPaise$1(result.invested)),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
						className: "size-5",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStat, {
					label: "Est. gains",
					value: formatINR(toPaise$1(result.gains)),
					sub: `${formatINRShort(toPaise$1(result.gains))} over ${input.years}y`,
					accent: "success",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
						className: "size-5",
						"aria-hidden": true
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Growth over time"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [series.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-64" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-64",
			role: "img",
			"aria-label": "SIP growth chart",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: series,
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
							dataKey: "year",
							tickLine: false,
							axisLine: false,
							tick: {
								fontSize: 11,
								fill: "var(--color-muted-foreground)"
							},
							interval: "preserveStartEnd"
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyTooltip, {}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							name: "Invested",
							dataKey: "invested",
							type: "monotone",
							fill: "#94A3B8",
							fillOpacity: .25,
							stroke: "#94A3B8",
							strokeWidth: 2,
							isAnimationActive: !reducedMotion
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							name: "Value",
							dataKey: "value",
							type: "monotone",
							fill: "#16A34A",
							fillOpacity: .25,
							stroke: "#16A34A",
							strokeWidth: 2,
							isAnimationActive: !reducedMotion
						})
					]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Assumes monthly investments at the start of each month and a constant annual return, compounded monthly. Actual market returns will vary."
		})] })] })] })]
	});
}
var NEW_SLABS = [
	{
		from: 0,
		to: 4e5,
		ratePct: 0
	},
	{
		from: 4e5,
		to: 8e5,
		ratePct: 5
	},
	{
		from: 8e5,
		to: 12e5,
		ratePct: 10
	},
	{
		from: 12e5,
		to: 16e5,
		ratePct: 15
	},
	{
		from: 16e5,
		to: 2e6,
		ratePct: 20
	},
	{
		from: 2e6,
		to: 24e5,
		ratePct: 25
	},
	{
		from: 24e5,
		to: null,
		ratePct: 30
	}
];
var REBATE_LIMIT_NEW = 12e5;
var STD_DEDUCTION_NEW = 75e3;
var STD_DEDUCTION_OLD = 5e4;
var REBATE_LIMIT_OLD = 5e5;
function oldSlabs(age) {
	const exemption = age === "super-senior" ? 5e5 : age === "senior" ? 3e5 : 25e4;
	return [
		{
			from: 0,
			to: exemption,
			ratePct: 0
		},
		{
			from: exemption,
			to: 5e5,
			ratePct: 5
		},
		{
			from: 5e5,
			to: 1e6,
			ratePct: 20
		},
		{
			from: 1e6,
			to: null,
			ratePct: 30
		}
	];
}
function slabLabel(s) {
	const lakh = (v) => v % 1e6 === 0 ? `₹${v / 1e6}L` : `₹${(v / 1e5).toFixed(1)}L`;
	return `${s.to === null ? `Above ${lakh(s.from)}` : `${lakh(s.from)} – ${lakh(s.to)}`} @ ${s.ratePct}%`;
}
/** Spread taxable income across slabs; returns rows + raw slab tax. */
function applySlabs(taxable, slabs) {
	const rows = [];
	let baseTax = 0;
	for (const s of slabs) {
		const upper = s.to ?? Number.POSITIVE_INFINITY;
		const inSlab = Math.max(0, Math.min(taxable, upper) - s.from);
		const tax = inSlab * s.ratePct / 100;
		rows.push({
			label: slabLabel(s),
			taxableInSlab: inSlab,
			tax
		});
		baseTax += tax;
		if (taxable <= upper) break;
	}
	return {
		rows,
		baseTax
	};
}
function newRegimeSurcharge(taxable, baseTax) {
	if (taxable > 2e7) return baseTax * .25;
	if (taxable > 1e7) return baseTax * .15;
	if (taxable > 5e6) return baseTax * .1;
	return 0;
}
function oldRegimeSurcharge(taxable, baseTax) {
	if (taxable > 5e7) return baseTax * .37;
	if (taxable > 2e7) return baseTax * .25;
	if (taxable > 1e7) return baseTax * .15;
	if (taxable > 5e6) return baseTax * .1;
	return 0;
}
function calcNewRegime(input) {
	const std = input.salaried ? STD_DEDUCTION_NEW : 0;
	const taxable = Math.max(0, Math.round(input.grossIncome - std));
	const { rows, baseTax } = applySlabs(taxable, NEW_SLABS);
	let rebateApplied = 0;
	let taxedBase = baseTax;
	if (taxable <= REBATE_LIMIT_NEW) {
		rebateApplied = baseTax;
		taxedBase = 0;
	} else if (taxable > REBATE_LIMIT_NEW) {
		const excess = taxable - REBATE_LIMIT_NEW;
		if (baseTax > excess) {
			rebateApplied = baseTax - excess;
			taxedBase = excess;
		}
	}
	const surcharge = newRegimeSurcharge(taxable, taxedBase);
	const withSurcharge = taxedBase + surcharge;
	const cess = withSurcharge * .04;
	const totalTax = withSurcharge + cess;
	return {
		regime: "new",
		grossIncome: input.grossIncome,
		standardDeduction: std,
		otherDeductions: 0,
		taxableIncome: taxable,
		rows,
		baseTax,
		rebateApplied,
		surcharge,
		cess,
		totalTax,
		effectiveRatePct: input.grossIncome > 0 ? totalTax / input.grossIncome * 100 : 0
	};
}
function calcOldRegime(input) {
	const std = input.salaried ? STD_DEDUCTION_OLD : 0;
	const deductions = Math.max(0, Math.min(input.oldRegimeDeductions, input.grossIncome - std));
	const taxable = Math.max(0, Math.round(input.grossIncome - std - deductions));
	const { rows, baseTax } = applySlabs(taxable, oldSlabs(input.age));
	let rebateApplied = 0;
	if (taxable <= REBATE_LIMIT_OLD) rebateApplied = baseTax;
	const taxedBase = Math.max(0, baseTax - rebateApplied);
	const surcharge = oldRegimeSurcharge(taxable, taxedBase);
	const withSurcharge = taxedBase + surcharge;
	const cess = withSurcharge * .04;
	const totalTax = withSurcharge + cess;
	return {
		regime: "old",
		grossIncome: input.grossIncome,
		standardDeduction: std,
		otherDeductions: deductions,
		taxableIncome: taxable,
		rows,
		baseTax,
		rebateApplied,
		surcharge,
		cess,
		totalTax,
		effectiveRatePct: input.grossIncome > 0 ? totalTax / input.grossIncome * 100 : 0
	};
}
function compareRegimes(input) {
	const newRegime = calcNewRegime(input);
	const oldRegime = calcOldRegime(input);
	const diff = oldRegime.totalTax - newRegime.totalTax;
	return {
		newRegime,
		oldRegime,
		winner: Math.abs(diff) < 1 ? "tie" : diff > 0 ? "new" : "old",
		savings: Math.abs(diff)
	};
}
function validateTax(input) {
	if (!Number.isFinite(input.grossIncome) || input.grossIncome < 0) return "Annual income can't be negative.";
	if (input.grossIncome > 5e9) return "Income looks too large — keep it under ₹500 crore.";
	if (!Number.isFinite(input.oldRegimeDeductions) || input.oldRegimeDeductions < 0) return "Deductions can't be negative.";
	if (input.oldRegimeDeductions > input.grossIncome) return "Deductions can't exceed your gross income.";
	return null;
}
var toPaise = (rupees) => Math.round(rupees * 100);
var AGE_OPTIONS = [
	{
		value: "below-60",
		label: "Below 60 years"
	},
	{
		value: "senior",
		label: "Senior citizen (60–80)"
	},
	{
		value: "super-senior",
		label: "Super senior (80+)"
	}
];
function SlabTable({ result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Slab" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
			className: "text-right",
			children: "Taxable"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
			className: "text-right",
			children: "Tax"
		})
	] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
		className: cn(row.taxableInSlab === 0 && "opacity-40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-xs font-medium",
				children: row.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right text-xs tabular-nums",
				children: formatINR(toPaise(row.taxableInSlab))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right text-xs font-semibold tabular-nums",
				children: formatINR(toPaise(row.tax))
			})
		]
	}, row.label)) })] });
}
function RegimeCard({ result, isWinner }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn(isWinner && "border-emerald-500/50 ring-1 ring-emerald-500/30"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: result.regime === "new" ? "New regime" : "Old regime"
				}), isWinner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					className: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
						className: "mr-1 size-3",
						"aria-hidden": true
					}), "Wins"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-muted/50 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
							children: "Total tax payable"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold tabular-nums",
							children: formatINR(toPaise(result.totalTax))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Effective rate ",
								result.effectiveRatePct.toFixed(2),
								"% of gross income"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "Gross income",
					value: formatINR(toPaise(result.grossIncome))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "Standard deduction",
					value: formatINR(toPaise(result.standardDeduction))
				}),
				result.regime === "old" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "Other deductions (80C/D)",
					value: formatINR(toPaise(result.otherDeductions))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "Taxable income",
					value: formatINR(toPaise(result.taxableIncome)),
					strong: true
				}),
				result.rebateApplied > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "87A rebate applied",
					value: `−${formatINR(toPaise(result.rebateApplied))}`
				}),
				result.surcharge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "Surcharge",
					value: formatINR(toPaise(result.surcharge))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: "Health & education cess (4%)",
					value: formatINR(toPaise(result.cess))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlabTable, { result })
				})
			]
		})]
	});
}
function TaxTab() {
	const [input, setInput] = (0, import_react.useState)({
		grossIncome: 15e5,
		salaried: true,
		oldRegimeDeductions: 15e4,
		age: "below-60"
	});
	const set = (k, v) => setInput((p) => ({
		...p,
		[k]: v
	}));
	const error = validateTax(input);
	const comparison = (0, import_react.useMemo)(() => compareRegimes(input), [input]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Income-tax estimator · FY 2026-27"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "tax-income",
					label: "Gross annual income",
					value: input.grossIncome,
					onChange: (v) => set("grossIncome", v),
					min: 0,
					max: 1e8,
					step: 25e3,
					format: "rupees",
					error: error && input.grossIncome > 5e9 ? error : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-medium text-foreground",
						children: "Salaried income"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Enables standard deduction (₹75K new / ₹50K old regime)"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: input.salaried,
						onCheckedChange: (v) => set("salaried", v),
						"aria-label": "Salaried income"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "tax-age",
						className: "text-sm font-medium text-foreground",
						children: "Age category (old regime slabs)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: input.age,
						onValueChange: (v) => set("age", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "tax-age",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: AGE_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: o.value,
							children: o.label
						}, o.value)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcField, {
					id: "tax-deductions",
					label: "Deductions (80C, 80D, etc.)",
					value: input.oldRegimeDeductions,
					onChange: (v) => set("oldRegimeDeductions", v),
					min: 0,
					max: 5e5,
					step: 5e3,
					format: "rupees",
					error: error && (input.oldRegimeDeductions < 0 || input.oldRegimeDeductions > input.grossIncome) ? error : null,
					helper: "Honoured only under the old regime"
				})
			]
		})] }), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm font-medium text-destructive",
				children: error
			})
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: cn(comparison.winner === "tie" ? "border-border" : "border-emerald-500/50 bg-emerald-500/5"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center gap-3 p-4",
					children: [comparison.winner === "tie" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, {
						className: "size-6 shrink-0 text-muted-foreground",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						className: "size-6 shrink-0 text-emerald-600 dark:text-emerald-400",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: comparison.winner === "tie" ? "Both regimes cost the same" : `The ${comparison.winner} regime wins`
					}), comparison.winner !== "tie" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"You save ",
							formatINR(toPaise(comparison.savings)),
							" a year vs the other regime."
						]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegimeCard, {
					result: comparison.newRegime,
					isWinner: comparison.winner === "new"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegimeCard, {
					result: comparison.oldRegime,
					isWinner: comparison.winner === "old"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted-foreground",
				children: "FY 2026-27 slabs (AY 2027-28). New regime: no tax up to ₹12L taxable income via 87A rebate (with marginal relief); ₹75K standard deduction for salaried. Old regime: 87A rebate up to ₹5L taxable; ₹50K standard deduction for salaried. Includes 4% health & education cess and surcharge. Estimate only — special-rate incomes (capital gains), TDS and state nuances are not modelled."
			})
		] })]
	});
}
var TOOLS = [
	{
		id: "sip",
		label: "SIP",
		icon: PiggyBank,
		blurb: "Grow a monthly investment"
	},
	{
		id: "emi",
		label: "EMI",
		icon: CreditCard,
		blurb: "Loan instalments & schedule"
	},
	{
		id: "fd",
		label: "FD",
		icon: Landmark,
		blurb: "Lump-sum growth"
	},
	{
		id: "tax",
		label: "Tax",
		icon: ReceiptText,
		blurb: "FY 2026-27 estimator"
	},
	{
		id: "emergency",
		label: "Safety net",
		icon: ShieldCheck,
		blurb: "Emergency-fund planner"
	},
	{
		id: "forecast",
		label: "Forecast",
		icon: TrendingUp,
		blurb: "3-month cash flow"
	}
];
function ToolsPage() {
	const [active, setActive] = (0, import_react.useState)("sip");
	const current = TOOLS.find((t) => t.id === active);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-5 p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {
					className: "size-5 text-primary",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Financial tools"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: current?.blurb ?? "Plan, compare and project your money"
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: active,
			onValueChange: (v) => setActive(v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
				"aria-label": "Financial calculators",
				className: "flex h-auto w-full justify-start gap-1 overflow-x-auto p-1",
				children: TOOLS.map((tool) => {
					const Icon = tool.icon;
					const selected = active === tool.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: tool.id,
						className: cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm", selected && "shadow-sm"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							"aria-hidden": true
						}), tool.label]
					}, tool.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "sip",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SipTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "emi",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmiTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "fd",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FdTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "tax",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "emergency",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmergencyTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "forecast",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForecastTab, {})
					})
				]
			})]
		})]
	});
}
//#endregion
export { ToolsPage as component };
