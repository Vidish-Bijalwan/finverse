import { i as __toESM } from "../_runtime.mjs";
import { a as monthKey, o as monthLabel, r as formatINR, s as todayISO, t as cn } from "./utils-CLFOCKAi.mjs";
import { j as seedIfEmpty } from "./store-DCGtoGuR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { At as ChevronLeft, H as PiggyBank, I as Receipt, Rt as CalendarRange, W as Pencil, Y as OctagonAlert, Zt as ArrowUpRight, b as Sparkles, d as TrendingUp, h as Target, ht as Flame, jt as ChevronDown, kt as ChevronRight, rn as ArrowDownRight, t as Zap, tt as Lightbulb, zt as CalendarClock } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as useMonth } from "./hooks-CJFESX97.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-CSuHP3IP.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { t as Badge } from "./badge-EsPiNyuV.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-CxSeJsg6.mjs";
import { t as Progress } from "./progress-DTdwfIPe.mjs";
import { a as categoryMoM, c as previousMonth, i as buildInsights, l as setDailyTargetPaise, o as dailySpendSeries, s as loadStreakState, t as STREAK_MILESTONES, u as weeklyDigest } from "./engine-CtTK-iZ0.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CollapsibleTrigger$1, r as Root, t as CollapsibleContent$1 } from "../_libs/radix-ui__react-collapsible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-DE0hqT7r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Collapsible = Root;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = CollapsibleContent$1;
var KIND_ICONS = {
	overspend: TrendingUp,
	savings: PiggyBank,
	budget: OctagonAlert,
	unusual: Receipt,
	anomaly: Zap,
	goal: Target,
	bill: CalendarClock
};
var CONFIDENCE_STYLES = {
	high: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
	medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
	low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
};
function InsightCard({ insight }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const Icon = KIND_ICONS[insight.kind] ?? Lightbulb;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-md bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-primary" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base leading-snug",
					children: insight.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: cn("mt-2 capitalize", CONFIDENCE_STYLES[insight.confidence]),
					children: [insight.confidence, " confidence"]
				})]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "pt-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm leading-6 text-muted-foreground",
			children: insight.body
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
				className: "mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline",
				children: ["Why this?", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 transition-transform motion-reduce:transition-none", open && "rotate-180") })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
				className: "motion-reduce:animate-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1.5 rounded-md bg-muted/60 p-3 text-sm leading-6",
					children: insight.evidence.map((fact, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "text-primary",
							children: "•"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fact })]
					}, i))
				})
			})]
		})]
	})] });
}
/**
* Per-category spend this month vs last month, with % delta badges.
* Rising spend is flagged red, falling spend green — the delta is always
* grounded in the two real monthly totals shown on each row.
*/
function CategoryMoM({ db, month }) {
	const rows = (0, import_react.useMemo)(() => categoryMoM(db, month), [db, month]);
	const maxCur = (0, import_react.useMemo)(() => Math.max(1, ...rows.map((r) => r.curPaise)), [rows]);
	const prev = previousMonth(month);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Category vs last month"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs font-medium text-muted-foreground",
				children: [
					monthLabel(month),
					" vs ",
					monthLabel(prev)
				]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-6 text-center text-sm text-muted-foreground",
		children: "No spending recorded in either month yet."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-4",
		children: rows.map((row) => {
			const delta = row.deltaPct;
			const isNew = delta === null;
			const up = !isNew && delta > 0;
			const flat = !isNew && delta === 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 shrink-0 rounded-full",
							style: { backgroundColor: row.color },
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-sm font-semibold",
							children: row.label
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold", isNew && "bg-primary/10 text-primary", up && "bg-red-500/10 text-red-600 dark:text-red-400", !up && !isNew && !flat && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", flat && "bg-muted text-muted-foreground"),
						children: isNew ? "New" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
								className: "size-3.5",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, {
								className: "size-3.5",
								"aria-hidden": true
							}),
							Math.abs(delta),
							"%"
						] })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1.5 h-2 overflow-hidden rounded-full bg-muted",
					role: "img",
					"aria-label": `${row.label}: ${formatINR(row.curPaise)} this month, ${formatINR(row.prevPaise)} last month`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full transition-[width] motion-reduce:transition-none",
						style: {
							width: `${Math.max(2, Math.round(row.curPaise / maxCur * 100))}%`,
							backgroundColor: row.color
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: formatINR(row.curPaise)
						}),
						" this month · ",
						formatINR(row.prevPaise),
						" last month"
					]
				})
			] }, row.categoryId);
		})
	}) })] });
}
var WEEKDAY_LABELS = [
	"S",
	"M",
	"T",
	"W",
	"T",
	"F",
	"S"
];
/** GitHub-style intensity: 0 = no spend, 4 = busiest day of the month. */
function intensityClass(level) {
	switch (level) {
		case 1: return "bg-primary/20";
		case 2: return "bg-primary/40";
		case 3: return "bg-primary/70";
		case 4: return "bg-primary";
		default: return "bg-muted";
	}
}
/**
* GitHub-style daily spending intensity grid for a month.
* Darker cells = more spent that day. Pure rendering over real stored data.
*/
function SpendingHeatmap({ db, month }) {
	const { weeks, totalPaise, avgPaise, maxDay, maxPaise } = (0, import_react.useMemo)(() => {
		const series = dailySpendSeries(db, month);
		const max = Math.max(0, ...series.map((d) => d.spendPaise));
		const total = series.reduce((s, d) => s + d.spendPaise, 0);
		const [y = 1970, m = 1] = month.split("-").map(Number);
		const firstWeekday = new Date(y, m - 1, 1).getDay();
		const cells = Array.from({ length: firstWeekday }, () => null);
		for (const d of series) {
			const level = d.spendPaise === 0 || max === 0 ? 0 : Math.min(4, Math.ceil(d.spendPaise / max * 4));
			cells.push({
				dateISO: d.dateISO,
				spendPaise: d.spendPaise,
				level
			});
		}
		while (cells.length % 7 !== 0) cells.push(null);
		const weekCount = cells.length / 7;
		const weekCols = [];
		for (let w = 0; w < weekCount; w += 1) weekCols.push(cells.slice(w * 7, w * 7 + 7));
		const peak = series.reduce((best, d) => d.spendPaise > best.spendPaise ? d : best, {
			dateISO: "",
			spendPaise: 0
		});
		return {
			weeks: weekCols,
			totalPaise: total,
			avgPaise: series.length > 0 ? Math.round(total / series.length) : 0,
			maxDay: peak.dateISO,
			maxPaise: peak.spendPaise
		};
	}, [db, month]);
	const dayOfMonth = (iso) => iso.slice(8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Spending heatmap"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium text-muted-foreground",
				children: monthLabel(month)
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto pb-1",
			role: "img",
			"aria-label": `Daily spending intensity for ${monthLabel(month)}. Total spent ${formatINR(totalPaise)}.`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-max gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-rows-7 gap-1.5 pr-1",
					"aria-hidden": true,
					children: WEEKDAY_LABELS.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-3.5 place-items-center text-[10px] font-medium text-muted-foreground sm:size-4",
						children: i % 2 === 1 ? d : ""
					}, i))
				}), weeks.map((week, wi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-rows-7 gap-1.5",
					children: week.map((cell, di) => cell === null || cell.dateISO === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-3.5 sm:size-4",
						"aria-hidden": true
					}, di) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: `${cell.dateISO}: ${formatINR(cell.spendPaise)} spent`,
						"aria-label": `${cell.dateISO}: ${formatINR(cell.spendPaise)} spent`,
						className: cn("size-3.5 rounded-[3px] transition-transform motion-reduce:transition-none sm:size-4", intensityClass(cell.level))
					}, di))
				}, wi))]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Less" }),
				[
					0,
					1,
					2,
					3,
					4
				].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("size-3 rounded-[3px]", intensityClass(l)),
					"aria-hidden": true
				}, l)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "More" })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-4 grid grid-cols-3 gap-2 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-muted/60 px-2 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] font-medium text-muted-foreground",
						children: "Total"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 text-sm font-bold",
						children: formatINR(totalPaise)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-muted/60 px-2 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] font-medium text-muted-foreground",
						children: "Avg / day"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 text-sm font-bold",
						children: formatINR(avgPaise)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-muted/60 px-2 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] font-medium text-muted-foreground",
						children: "Busiest"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 text-sm font-bold",
						children: maxPaise > 0 ? `${dayOfMonth(maxDay)} · ${formatINR(maxPaise)}` : "—"
					})]
				})
			]
		})
	] })] });
}
/**
* Savings streak card: consecutive days under the daily spend target.
* Shows the live streak, all-time best, milestone badges (7/14/30 days),
* progress to the next milestone, and lets the user edit the daily target.
* Streak state persists in localStorage ("finverse:streaks:v1").
*/
function StreakCard({ db }) {
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	const [targetInput, setTargetInput] = (0, import_react.useState)("");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [inputError, setInputError] = (0, import_react.useState)(null);
	const streak = (0, import_react.useMemo)(() => {
		return loadStreakState(db);
	}, [db, refreshKey]);
	const nextMilestone = STREAK_MILESTONES.find((n) => streak.currentDays < n) ?? null;
	const prevMilestone = [...STREAK_MILESTONES].reverse().find((n) => streak.currentDays >= n) ?? 0;
	const progressPct = nextMilestone === null ? 100 : Math.round((streak.currentDays - prevMilestone) / (nextMilestone - prevMilestone) * 100);
	const openDialog = () => {
		setTargetInput(String(Math.round(streak.targetPaisePerDay) / 100));
		setInputError(null);
		setDialogOpen(true);
	};
	const saveTarget = () => {
		const rupees = Number(targetInput);
		if (!Number.isFinite(rupees) || rupees <= 0) {
			setInputError("Enter a daily target above ₹0.");
			return;
		}
		try {
			setDailyTargetPaise(Math.round(rupees * 100));
		} catch {
			setInputError("That amount is not valid — try a whole rupee figure.");
			return;
		}
		setDialogOpen(false);
		setRefreshKey((k) => k + 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
					className: cn("size-5", streak.currentDays > 0 ? "text-orange-500" : "text-muted-foreground"),
					"aria-hidden": true
				}), "Savings streak"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: openDialog,
						className: "h-8 gap-1 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
								className: "size-3.5",
								"aria-hidden": true
							}),
							formatINR(streak.targetPaisePerDay),
							"/day"
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Daily spend target" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "A streak day is any day you spend at or under this target. Days with no spending count too." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "streak-target",
								children: "Target per day (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "streak-target",
								inputMode: "decimal",
								value: targetInput,
								onChange: (e) => {
									setTargetInput(e.target.value);
									setInputError(null);
								},
								placeholder: "500"
							}),
							inputError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-red-600 dark:text-red-400",
								children: inputError
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: saveTarget,
						children: "Save target"
					}) })
				] })]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-4xl font-black tabular-nums",
				children: streak.currentDays
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [streak.currentDays === 1 ? "day" : "days", " under target in a row"]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold tabular-nums",
					children: streak.bestDays
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "best ever"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: nextMilestone === null ? "All milestones smashed!" : `${streak.currentDays} of ${nextMilestone} days to the next badge` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-semibold",
					children: [progressPct, "%"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: progressPct,
				className: "mt-1.5 h-2",
				"aria-label": "Progress to next streak milestone"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2",
			children: STREAK_MILESTONES.map((n) => {
				const earned = streak.badges.includes(`streak-${n}`);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					title: earned ? `${n}-day badge earned` : `${n}-day badge — keep the streak going`,
					className: cn("inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-bold", earned ? "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-border bg-muted/50 text-muted-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
							className: "size-3.5",
							"aria-hidden": true
						}),
						n,
						" days"
					]
				}, n);
			})
		}),
		streak.currentDays === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-xs leading-5 text-muted-foreground",
			children: [
				"No active streak — spend under ",
				formatINR(streak.targetPaisePerDay),
				" today to start one."
			]
		})
	] })] });
}
var MONTHS_SHORT = [
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
/** "2026-09-29" -> "29 Sep"; range -> "29 Sep – 5 Oct 2026". */
function weekRangeLabel(startISO, endISO) {
	const [sy = 0, sm = 1, sd = 1] = startISO.split("-").map(Number);
	const [ey = 0, em = 1, ed = 1] = endISO.split("-").map(Number);
	const start = `${sd} ${MONTHS_SHORT[sm - 1]}`;
	const end = `${ed} ${MONTHS_SHORT[em - 1]}`;
	return sm === em ? `${start} – ${end} ${ey}` : `${start} – ${end} ${ey}`;
}
/**
* Auto-generated weekly summary card: this week's spend, saved
* (income − expenses), top category, and one actionable tip derived from
* the week's real data.
*/
function WeeklyDigest({ db }) {
	const digest = (0, import_react.useMemo)(() => weeklyDigest(db, todayISO()), [db]);
	const savedNegative = digest.savedPaise < 0;
	const savingsRate = digest.incomePaise > 0 ? Math.round(digest.savedPaise / digest.incomePaise * 100) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-primary/25 bg-gradient-to-b from-primary/5 to-transparent",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm font-bold text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, {
					className: "size-4",
					"aria-hidden": true
				}), " WEEKLY DIGEST"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: weekRangeLabel(digest.weekStartISO, digest.weekEndISO)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-3 gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/60 px-2 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-[11px] font-medium text-muted-foreground",
							children: "Spent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 text-sm font-bold",
							children: formatINR(digest.spentPaise)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/60 px-2 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-[11px] font-medium text-muted-foreground",
							children: "Saved"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: cn("mt-0.5 text-sm font-bold", savedNegative ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"),
							children: formatINR(digest.savedPaise)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/60 px-2 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-[11px] font-medium text-muted-foreground",
							children: "Top category"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 truncate text-sm font-bold",
							title: digest.topCategoryLabel ?? void 0,
							children: digest.topCategoryLabel ?? "—"
						})]
					})
				]
			}),
			savingsRate !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-center text-xs text-muted-foreground",
				children: [
					"Savings rate this week:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("font-bold", savingsRate < 10 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"),
						children: [savingsRate, "%"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, {
					className: "mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm leading-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold",
						children: "Tip: "
					}), digest.tip]
				})]
			})
		] })]
	});
}
function shiftMonthKey(key, offset) {
	const [y = 1970, m = 1] = key.split("-").map(Number);
	const d = new Date(y, m - 1 + offset, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function InsightsPage() {
	const [month, setMonth] = useMonth();
	const isCurrentMonth = month === monthKey(/* @__PURE__ */ new Date());
	const dbQuery = useQuery({
		queryKey: ["finverse", "ai-db"],
		queryFn: () => seedIfEmpty()
	});
	const insights = (0, import_react.useMemo)(() => dbQuery.data ? buildInsights(dbQuery.data, month) : [], [dbQuery.data, month]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm font-bold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " FINVERSE AI"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-2xl font-black tracking-tight sm:text-3xl",
							children: ["Insights for ", monthLabel(month)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-1",
							role: "group",
							"aria-label": "Change month",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-8",
								onClick: () => setMonth(previousMonth(month)),
								"aria-label": `Previous month (${monthLabel(previousMonth(month))})`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-8",
								onClick: () => setMonth(shiftMonthKey(month, 1)),
								disabled: isCurrentMonth,
								"aria-label": `Next month (${monthLabel(shiftMonthKey(month, 1))})`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted-foreground",
						children: "Computed from your real data by simple, transparent rules — expand any card to see exactly why it appeared."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4",
				children: [
					dbQuery.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-xl" })
					] }),
					dbQuery.isSuccess && dbQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						isCurrentMonth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyDigest, { db: dbQuery.data }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreakCard, { db: dbQuery.data }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendingHeatmap, {
							db: dbQuery.data,
							month
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryMoM, {
							db: dbQuery.data,
							month
						})
					] }),
					dbQuery.isSuccess && insights.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col items-center px-6 py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-12 place-items-center rounded-full bg-emerald-500/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-emerald-600 dark:text-emerald-400" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 text-lg font-bold",
								children: "All clear — nothing needs your attention this month."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-sm text-sm leading-6 text-muted-foreground",
								children: "FinVerse AI checked your spending trends, budget usage, upcoming bills, goal pace and savings rate. Everything looks healthy."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "mt-4",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/expenses",
									children: "Review transactions"
								})
							})
						]
					}) }),
					insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightCard, { insight }, insight.id))
				]
			})]
		})
	});
}
//#endregion
export { InsightsPage as component };
