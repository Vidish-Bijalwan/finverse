import { i as __toESM } from "../_runtime.mjs";
import { r as monthKey, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { H as Plus, _n as ArrowLeft, h as Trash2 } from "../_libs/lucide-react.mjs";
import { i as EXPENSE_CATEGORIES } from "./categories-BtDQEnJC.mjs";
import { x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Progress } from "./progress-CRV4wzzr.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-yavzSrfF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEP_LABELS = [
	"Your name",
	"Monthly income",
	"Budget split",
	"Goals"
];
var TOTAL_STEPS = STEP_LABELS.length;
var GOAL_COLORS = [
	"#10B981",
	"#3B82F6",
	"#F59E0B",
	"#EC4899",
	"#8B5CF6",
	"#06B6D4"
];
function toISODate(d) {
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${d.getFullYear()}-${m}-${day}`;
}
function plusOneYearISO() {
	const d = /* @__PURE__ */ new Date();
	d.setFullYear(d.getFullYear() + 1);
	return toISODate(d);
}
function supabaseErrorMessage(e) {
	if (e instanceof Error && e.message) return e.message;
	return "Something went wrong. Please try again.";
}
function OnboardingLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-10 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none",
			role: "status",
			"aria-label": "Loading"
		})
	});
}
function OnboardingPage() {
	const { user, profile, loading } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingLoading, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	if (profile?.onboarding_completed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingWizard, { userId: user.id });
}
function OnboardingWizard({ userId }) {
	const [step, setStep] = (0, import_react.useState)(0);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const reducedMotion = usePrefersReducedMotion();
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [incomeText, setIncomeText] = (0, import_react.useState)("");
	const [payday, setPayday] = (0, import_react.useState)(1);
	const [incomePaise, setIncomePaise] = (0, import_react.useState)(0);
	const [pcts, setPcts] = (0, import_react.useState)(() => Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, 0])));
	const [goals, setGoals] = (0, import_react.useState)([]);
	const budgetTotal = (0, import_react.useMemo)(() => EXPENSE_CATEGORIES.reduce((sum, c) => sum + (pcts[c.id] ?? 0), 0), [pcts]);
	const budgetValid = budgetTotal === 100;
	const budgetRemaining = 100 - budgetTotal;
	function fail(message, e) {
		const detail = e ? supabaseErrorMessage(e) : null;
		const full = detail && detail !== message ? `${message} ${detail}` : message;
		setError(full);
		toast.error(full);
	}
	async function handleNameNext() {
		const name = displayName.trim();
		if (!name) {
			setError("Please enter your name to continue.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const { error: dbError } = await getSupabase().from("profiles").update({ full_name: name }).eq("id", userId);
			if (dbError) throw dbError;
			setStep(1);
		} catch (e) {
			fail("Couldn't save your name.", e);
		} finally {
			setSaving(false);
		}
	}
	async function handleIncomeNext() {
		const incomeRupees = Number.parseFloat(incomeText.replace(/,/g, ""));
		if (!Number.isFinite(incomeRupees) || incomeRupees <= 0) {
			setError("Enter a monthly income greater than ₹0.");
			return;
		}
		const paise = Math.round(incomeRupees * 100);
		const now = /* @__PURE__ */ new Date();
		let year = now.getFullYear();
		let month = now.getMonth() + 1;
		if (payday < now.getDate()) {
			month += 1;
			if (month > 12) {
				month = 1;
				year += 1;
			}
		}
		const startDateIso = `${year}-${String(month).padStart(2, "0")}-${String(payday).padStart(2, "0")}`;
		setSaving(true);
		setError(null);
		try {
			const { error: dbError } = await getSupabase().from("recurring_rules").insert({
				user_id: userId,
				type: "income",
				amount_paise: paise,
				category: "salary",
				note: "Monthly salary",
				pay_mode: "Bank",
				frequency: "monthly",
				start_date_iso: startDateIso,
				is_paused: false
			});
			if (dbError) throw dbError;
			setIncomePaise(paise);
			setStep(2);
		} catch (e) {
			fail("Couldn't save your income.", e);
		} finally {
			setSaving(false);
		}
	}
	async function handleBudgetNext() {
		if (!budgetValid) {
			setError("Your budget split must add up to exactly 100%.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const supabase = getSupabase();
			const month = monthKey(/* @__PURE__ */ new Date());
			const rows = EXPENSE_CATEGORIES.filter((c) => (pcts[c.id] ?? 0) > 0).map((c) => ({
				user_id: userId,
				category_id: c.id,
				month,
				limit_paise: Math.round(incomePaise * (pcts[c.id] ?? 0) / 100)
			}));
			if (rows.length > 0) {
				const { error: dbError } = await supabase.from("budgets").insert(rows);
				if (dbError) throw dbError;
			}
			setStep(3);
		} catch (e) {
			fail("Couldn't save your budgets.", e);
		} finally {
			setSaving(false);
		}
	}
	function addGoal() {
		setGoals((prev) => [...prev, {
			id: Date.now() + Math.random(),
			name: "",
			targetText: "",
			deadline: plusOneYearISO()
		}]);
	}
	function updateGoal(id, patch) {
		setGoals((prev) => prev.map((g) => g.id === id ? {
			...g,
			...patch
		} : g));
	}
	function removeGoal(id) {
		setGoals((prev) => prev.filter((g) => g.id !== id));
	}
	async function handleFinish() {
		if (goals.length === 0) {
			setError("Add at least one goal to finish setting up.");
			return;
		}
		for (const g of goals) {
			if (!g.name.trim()) {
				setError("Every goal needs a name.");
				return;
			}
			const targetRupees = Number.parseFloat(g.targetText.replace(/,/g, ""));
			if (!Number.isFinite(targetRupees) || targetRupees <= 0) {
				setError(`Enter a target amount greater than ₹0 for “${g.name.trim()}”.`);
				return;
			}
			if (!g.deadline) {
				setError(`Pick a deadline for “${g.name.trim()}”.`);
				return;
			}
		}
		setSaving(true);
		setError(null);
		try {
			const supabase = getSupabase();
			const goalRows = goals.map((g, i) => ({
				user_id: userId,
				name: g.name.trim(),
				target_paise: Math.round(Number.parseFloat(g.targetText.replace(/,/g, "")) * 100),
				saved_paise: 0,
				deadline: g.deadline,
				color: GOAL_COLORS[i % GOAL_COLORS.length]
			}));
			const { error: goalError } = await supabase.from("goals").insert(goalRows);
			if (goalError) throw goalError;
			const { error: profileError } = await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
			if (profileError) throw profileError;
			toast.success("Welcome to FinVerse — you're all set.");
			window.location.href = "/";
		} catch (e) {
			fail("Couldn't finish setup.", e);
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: cn("fv-mesh fv-mesh-soft", !reducedMotion && "fv-mesh-animated")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-8 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-foreground",
							children: [
								"Step ",
								step + 1,
								" of ",
								TOTAL_STEPS
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: STEP_LABELS[step]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: (step + 1) / TOTAL_STEPS * 100,
						className: "mt-3"
					})]
				}),
				step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setError(null);
						setStep((s) => s - 1);
					},
					className: `mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back"]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "alert",
					className: "mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive",
					children: error
				}),
				step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "onboarding-name",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "onboarding-name",
							className: "text-2xl font-black tracking-tight text-foreground",
							children: "What should we call you?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "This name shows up across your FinVerse AI experience."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "display-name",
								children: "Display name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "display-name",
								value: displayName,
								onChange: (e) => setDisplayName(e.target.value),
								placeholder: "e.g. John Doe",
								autoComplete: "name",
								maxLength: 80
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: `mt-8 w-full transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
							onClick: handleNameNext,
							disabled: saving,
							children: saving ? "Saving…" : "Continue"
						})
					]
				}),
				step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "onboarding-income",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "onboarding-income",
							className: "text-2xl font-black tracking-tight text-foreground",
							children: "What's your monthly income?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "We'll use it to suggest budgets and track your salary credits."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "monthly-income",
									children: "Monthly income (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "monthly-income",
									inputMode: "decimal",
									value: incomeText,
									onChange: (e) => setIncomeText(e.target.value),
									placeholder: "e.g. 50,000"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "payday",
										children: "Payday (day of month)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										id: "payday",
										value: payday,
										onChange: (e) => setPayday(Number(e.target.value)),
										className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground",
										children: Array.from({ length: 28 }, (_, i) => i + 1).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: d,
											children: d
										}, d))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Your salary credit is recorded as a monthly recurring income on this day."
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: `mt-8 w-full transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
							onClick: handleIncomeNext,
							disabled: saving,
							children: saving ? "Saving…" : "Continue"
						})
					]
				}),
				step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "onboarding-budget",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "onboarding-budget",
							className: "text-2xl font-black tracking-tight text-foreground",
							children: "Split your budget"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: [
								"Decide what share of your ",
								formatINR(incomePaise),
								" monthly income each category gets. The shares must add up to exactly 100%."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${budgetValid ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : budgetRemaining > 0 ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" : "border-destructive/40 bg-destructive/10 text-destructive"}`,
							role: "status",
							children: budgetValid ? "Adds up to 100% — nicely done." : budgetRemaining > 0 ? `${budgetRemaining}% still unassigned` : `${-budgetRemaining}% over — trim it back`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3",
							children: EXPENSE_CATEGORIES.map((c) => {
								const pct = pcts[c.id] ?? 0;
								const Icon = c.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-9 shrink-0 place-items-center rounded-lg",
											style: {
												backgroundColor: `${c.color}1A`,
												color: c.color
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-semibold text-foreground",
												children: c.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: [formatINR(Math.round(incomePaise * pct / 100)), " / month"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: 0,
												max: 100,
												value: pct,
												onChange: (e) => {
													const v = Number.parseInt(e.target.value, 10);
													setPcts((prev) => ({
														...prev,
														[c.id]: Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0
													}));
												},
												"aria-label": `${c.label} budget percent`,
												className: "w-20 text-right"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm text-muted-foreground",
												children: "%"
											})]
										})
									]
								}, c.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: `mt-8 w-full transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
							onClick: handleBudgetNext,
							disabled: saving || !budgetValid,
							children: saving ? "Saving…" : "Continue"
						})
					]
				}),
				step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "onboarding-goals",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "onboarding-goals",
							className: "text-2xl font-black tracking-tight text-foreground",
							children: "Set your first goals"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "What are you saving toward? Add at least one — you can add more later."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid gap-4",
							children: goals.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 rounded-2xl border border-border bg-card p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-bold text-foreground",
											children: ["Goal ", goals.indexOf(g) + 1]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => removeGoal(g.id),
											"aria-label": `Remove ${g.name || "goal"}`,
											className: `grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `goal-name-${g.id}`,
											children: "Goal name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: `goal-name-${g.id}`,
											value: g.name,
											onChange: (e) => updateGoal(g.id, { name: e.target.value }),
											placeholder: "e.g. Emergency fund",
											maxLength: 80
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: `goal-target-${g.id}`,
												children: "Target (₹)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: `goal-target-${g.id}`,
												inputMode: "decimal",
												value: g.targetText,
												onChange: (e) => updateGoal(g.id, { targetText: e.target.value }),
												placeholder: "e.g. 2,00,000"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: `goal-deadline-${g.id}`,
												children: "Deadline"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: `goal-deadline-${g.id}`,
												type: "date",
												value: g.deadline,
												onChange: (e) => updateGoal(g.id, { deadline: e.target.value })
											})]
										})]
									})
								]
							}, g.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							className: `mt-4 w-full transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
							onClick: () => {
								setError(null);
								addGoal();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add a goal"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: `mt-4 w-full transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
							onClick: handleFinish,
							disabled: saving,
							children: saving ? "Finishing…" : "Finish setup"
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { OnboardingPage as component };
