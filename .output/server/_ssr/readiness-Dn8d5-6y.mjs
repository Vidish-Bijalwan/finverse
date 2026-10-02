import { i as __toESM } from "../_runtime.mjs";
import { a as monthKey, r as formatINR, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Bt as Calculator, T as ShieldCheck } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as useMonth, S as useHoldings, f as useBills, k as useTransactions, p as useBudgets, x as useGoals } from "./hooks-CJFESX97.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { t as Progress } from "./progress-DTdwfIPe.mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { i as getStock } from "./data-_btm06jU.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/readiness-Dn8d5-6y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Animated score ring. Animates the arc on mount (and when score changes);
* animation is disabled under prefers-reduced-motion.
*/
function ScoreRing({ score, size = 190 }) {
	const [animated, setAnimated] = (0, import_react.useState)(0);
	const reducedMotion = usePrefersReducedMotion();
	const clamped = Math.max(0, Math.min(100, score));
	(0, import_react.useEffect)(() => {
		if (reducedMotion) {
			setAnimated(clamped);
			return;
		}
		setAnimated(0);
		const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(clamped)));
		return () => cancelAnimationFrame(raf);
	}, [clamped, reducedMotion]);
	const stroke = 14;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const offset = c - c * animated / 100;
	const tone = clamped >= 75 ? "text-success" : clamped >= 50 ? "text-primary" : clamped >= 30 ? "text-amber-600" : "text-destructive";
	const arc = clamped >= 75 ? "stroke-success" : clamped >= 50 ? "stroke-primary" : clamped >= 30 ? "stroke-amber-500" : "stroke-destructive";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative inline-grid place-items-center",
		style: {
			width: size,
			height: size
		},
		role: "img",
		"aria-label": `Readiness score ${Math.round(clamped)} out of 100`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				fill: "none",
				strokeWidth: stroke,
				className: "stroke-muted"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				fill: "none",
				strokeWidth: stroke,
				strokeLinecap: "round",
				strokeDasharray: c,
				strokeDashoffset: offset,
				className: cn(arc, "transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 grid place-items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("text-5xl font-black tabular-nums", tone),
					children: Math.round(animated)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
					children: "/ 100"
				})]
			})
		})]
	});
}
/** "2026-10" minus n months -> "YYYY-MM". */
function shiftMonth(key, n) {
	const [y, m] = key.split("-").map(Number);
	const d = new Date(y, m - 1 - n, 1);
	return monthKey(d);
}
function sumBy(txns, month, type) {
	return txns.filter((t) => t.type === type && monthKey(t.dateISO) === month).reduce((a, t) => a + t.amountPaise, 0);
}
function sumCategory(txns, month, category) {
	return txns.filter((t) => t.type === "expense" && t.category === category && monthKey(t.dateISO) === month).reduce((a, t) => a + t.amountPaise, 0);
}
var clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
function ReadinessPage() {
	const [month] = useMonth();
	const { data: goals, isPending: goalsPending } = useGoals();
	const { data: txns, isPending: txnsPending } = useTransactions();
	const { data: bills, isPending: billsPending } = useBills();
	const { data: budgets, isPending: budgetsPending } = useBudgets(month);
	const { data: holdings, isPending: holdingsPending } = useHoldings();
	const [amount, setAmount] = (0, import_react.useState)("");
	const [asked, setAsked] = (0, import_react.useState)(false);
	const pending = goalsPending || txnsPending || billsPending || budgetsPending || holdingsPending;
	const model = (0, import_react.useMemo)(() => {
		if (!goals || !txns || !bills || !budgets || !holdings) return null;
		const last3 = [
			0,
			1,
			2
		].map((n) => shiftMonth(month, n + 1));
		const expenses3 = last3.map((m) => sumBy(txns, m, "expense"));
		const income3 = last3.map((m) => sumBy(txns, m, "income"));
		const avgMonthlyExpenses = expenses3.reduce((a, b) => a + b, 0) / 3;
		const emergency = goals.find((g) => g.name.toLowerCase().includes("emergency"));
		const monthsCovered = avgMonthlyExpenses > 0 ? (emergency?.savedPaise ?? 0) / avgMonthlyExpenses : 0;
		const emergencyPts = clamp(monthsCovered / 6 * 100);
		const rates = last3.map((m, i) => income3[i] > 0 ? (income3[i] - expenses3[i]) / income3[i] * 100 : 0);
		const avgRate = rates.reduce((a, b) => a + b, 0) / 3;
		const savingsPts = clamp(avgRate / 20 * 100);
		const spentByCat = /* @__PURE__ */ new Map();
		txns.filter((t) => t.type === "expense" && monthKey(t.dateISO) === month).forEach((t) => spentByCat.set(t.category, (spentByCat.get(t.category) ?? 0) + t.amountPaise));
		const unbreached = budgets.filter((b) => (spentByCat.get(b.categoryId) ?? 0) <= b.limitPaise).length;
		const disciplinePts = budgets.length > 0 ? unbreached / budgets.length * 100 : 0;
		let rent = sumCategory(txns, month, "rent");
		if (rent === 0) rent = last3.reduce((a, m) => a + sumCategory(txns, m, "rent"), 0) / 3;
		const billsTotal = bills.reduce((a, b) => a + b.amountPaise, 0);
		let incomeNow = sumBy(txns, month, "income");
		if (incomeNow === 0) incomeNow = income3.reduce((a, b) => a + b, 0) / 3;
		const fixedTotal = rent + billsTotal;
		const fixedRatio = incomeNow > 0 ? fixedTotal / incomeNow : 1;
		const fixedPts = clamp((.6 - fixedRatio) / .3 * 100);
		const factors = [
			{
				id: "emergency",
				title: "Emergency-fund coverage",
				weight: 35,
				points: emergencyPts,
				earned: emergencyPts / 100 * 35,
				inputs: emergency ? `Saved ${formatINR(emergency.savedPaise)} ÷ avg monthly expenses ${formatINR(Math.round(avgMonthlyExpenses))} = ${monthsCovered.toFixed(1)} months covered (target 6).` : "No 'Emergency fund' goal found — 0 months covered.",
				reasoning: monthsCovered >= 6 ? "A full 6-month cushion means a market dip never forces a distress sale." : monthsCovered >= 3 ? "Partial cushion — investing is reasonable, but keep topping up the fund first." : "Thin safety net — an emergency could force you to sell investments at the worst time."
			},
			{
				id: "savings",
				title: "Savings rate (3-mo avg)",
				weight: 25,
				points: savingsPts,
				earned: savingsPts / 100 * 25,
				inputs: `Monthly rates ${rates.map((r) => `${r.toFixed(0)}%`).join(" · ")} → avg ${avgRate.toFixed(1)}% (target 20%). Income and expenses from your recorded transactions.`,
				reasoning: avgRate >= 20 ? "You consistently keep a fifth of income — that surplus is what investing compounds." : avgRate >= 10 ? "Positive but below the 20% investing threshold — trim one spending category to unlock more." : "Near-zero surplus leaves nothing to invest without cutting spending or raising income first."
			},
			{
				id: "discipline",
				title: "Budget discipline",
				weight: 20,
				points: disciplinePts,
				earned: disciplinePts / 100 * 20,
				inputs: budgets.length > 0 ? `${unbreached} of ${budgets.length} budgets unbreached in ${month} (${disciplinePts.toFixed(0)}%).` : "No budgets set for this month — discipline can't be measured.",
				reasoning: disciplinePts >= 80 ? "You stick to planned spending, so an investing habit is likely to stick too." : "Frequent budget breaches suggest spending controls need work before locking money into markets."
			},
			{
				id: "fixed",
				title: "Fixed-cost ratio",
				weight: 20,
				points: fixedPts,
				earned: fixedPts / 100 * 20,
				inputs: `Rent ${formatINR(Math.round(rent))} + bills ${formatINR(billsTotal)} = ${formatINR(Math.round(fixedTotal))} ÷ income ${formatINR(Math.round(incomeNow))} = ${(fixedRatio * 100).toFixed(1)}% (healthy ≤ 30%).`,
				reasoning: fixedRatio <= .3 ? "Low fixed costs leave your surplus flexible — market volatility won't squeeze essentials." : fixedRatio <= .5 ? "Fixed costs eat a large share of income, shrinking the safe amount to invest." : "Most income is committed before the month starts — investing more now adds real risk."
			}
		];
		const score = factors.reduce((a, f) => a + f.earned, 0);
		const incomeMonth = sumBy(txns, month, "income");
		const expensesMonth = sumBy(txns, month, "expense");
		const unpaidBills = bills.filter((b) => !b.lastPaidOn || monthKey(b.lastPaidOn) !== month);
		const unpaidBillsTotal = unpaidBills.reduce((a, b) => a + b.amountPaise, 0);
		return {
			factors,
			score,
			incomeMonth,
			expensesMonth,
			unpaidBills,
			unpaidBillsTotal,
			surplus: incomeMonth - expensesMonth - unpaidBillsTotal,
			portfolioValue: holdings.reduce((a, h) => a + Math.round(h.qty * (getStock(h.symbol)?.pricePaise ?? 0)), 0),
			holdingCount: holdings.length
		};
	}, [
		goals,
		txns,
		bills,
		budgets,
		holdings,
		month
	]);
	const verdict = !model ? "" : model.score >= 75 ? "Ready to invest" : model.score >= 50 ? "Almost ready" : model.score >= 30 ? "Build foundations first" : "Not yet — protect cash first";
	const verdictReason = !model ? "" : model.score >= 75 ? "Your safety net, savings habit and spending discipline can support market investing." : model.score >= 50 ? "One or two factors are holding you back — fix the lowest-scoring card below first." : "Your money is stretched thin right now; investing before fixing this risks forced selling.";
	const askPaise = Math.round(Number(amount.replace(/,/g, "")) * 100);
	const askValid = Number.isFinite(askPaise) && askPaise > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		title: "Investment Readiness",
		subtitle: "A 0–100 score built from your Module 1 money data — emergency savings, savings rate, budget discipline and fixed costs. Every point is explained; no black boxes.",
		active: "Readiness",
		children: pending || !model ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					0,
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 rounded-lg" }, i))
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid items-center gap-6 rounded-lg border border-border bg-card p-6 shadow-card sm:p-8 lg:grid-cols-[auto_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRing, { score: model.score }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold uppercase tracking-wider text-primary",
							children: "Readiness score"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-2xl font-black text-primary-dark",
							children: verdict
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-6 text-muted-foreground",
							children: verdictReason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"Portfolio value:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground",
										children: formatINR(model.portfolioValue)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs",
										children: [
											" (",
											model.holdingCount,
											" holdings)"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"This month's surplus:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("font-bold", model.surplus >= 0 ? "text-success" : "text-destructive"),
										children: formatINR(model.surplus)
									})
								]
							})]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: model.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg border border-border bg-card p-5 shadow-card sm:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-bold text-primary-dark",
									children: f.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "shrink-0 rounded-full bg-tint px-2.5 py-1 text-xs font-black text-primary-dark tabular-nums",
									children: [
										f.earned.toFixed(1),
										" / ",
										f.weight
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: f.points,
								className: "mt-3",
								"aria-label": `${f.title}: ${f.points.toFixed(0)} of 100`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-[13px] font-medium leading-5 text-foreground",
								children: f.inputs
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1.5 flex gap-1.5 text-[13px] leading-5 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-primary" }), f.reasoning]
							})
						]
					}, f.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-card p-5 shadow-card sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-8 place-items-center rounded-md bg-tint",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-bold text-primary-dark",
								children: "Can I invest more this month?"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: [
								"Enter an amount — FinVerse checks it against this month's surplus from your Module 1 data: income ",
								formatINR(model.incomeMonth),
								" − expenses",
								" ",
								formatINR(model.expensesMonth),
								" − unpaid bills ",
								formatINR(model.unpaidBillsTotal),
								model.unpaidBills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									" (",
									model.unpaidBills.map((b) => b.name).join(", "),
									")"
								] }),
								" ",
								"= ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: formatINR(model.surplus)
								}),
								" ",
								"surplus."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 flex flex-wrap items-end gap-3",
							onSubmit: (e) => {
								e.preventDefault();
								setAsked(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "invest-amount",
									children: "Extra amount (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "invest-amount",
									inputMode: "decimal",
									placeholder: "5,000",
									value: amount,
									onChange: (e) => {
										setAmount(e.target.value);
										setAsked(false);
									},
									className: "w-48"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: !askValid,
								children: "Check"
							})]
						}),
						asked && askValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mt-4 rounded-md px-4 py-3 text-sm leading-6", askPaise <= model.surplus ? "bg-success-soft text-foreground" : "bg-destructive/10 text-foreground"),
							role: "status",
							children: model.surplus <= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-destructive",
									children: "Not this month."
								}),
								" Your surplus is ",
								formatINR(model.surplus),
								" — income is already fully committed to expenses and bills. Free up cash before adding investments."
							] }) : askPaise <= model.surplus ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-success",
									children: [
										"Yes — ",
										formatINR(askPaise),
										" fits."
									]
								}),
								" ",
								"It uses ",
								(askPaise / model.surplus * 100).toFixed(0),
								"% of your",
								" ",
								formatINR(model.surplus),
								" surplus, leaving",
								" ",
								formatINR(model.surplus - askPaise),
								" as buffer for the rest of the month."
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-destructive",
									children: "That stretches too far."
								}),
								" ",
								formatINR(askPaise),
								" exceeds your ",
								formatINR(model.surplus),
								" surplus by",
								" ",
								formatINR(askPaise - model.surplus),
								". Consider ",
								formatINR(model.surplus),
								" or less, so bills and essentials stay covered."
							] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted-foreground",
					children: "Methodology: emergency coverage 35% (6 months of avg expenses = full marks) · savings rate 25% (20% = full marks) · budget discipline 20% (% of this month's budgets unbreached) · fixed-cost ratio 20% (≤30% = full marks, 60%+ = zero). Scores are educational estimates from your recorded data — not financial advice."
				})
			]
		})
	});
}
//#endregion
export { ReadinessPage as component };
