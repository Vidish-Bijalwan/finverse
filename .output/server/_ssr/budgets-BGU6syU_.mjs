import { i as __toESM } from "../_runtime.mjs";
import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { Gt as ChevronLeft, H as Plus, J as Pencil, Wt as ChevronRight, o as WalletCards } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { o as categoryById } from "./categories-BtDQEnJC.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { c as paiseToRupees, l as rupeesToPaise, o as monthLabel, r as addMonthsToKey, t as AmountField } from "./utils-C0UDHC3L.mjs";
import { C as useMonth, E as useSetBudget, k as useTransactions, p as useBudgets } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { n as CardContent, t as Card } from "./card-DYllYZYI.mjs";
import { t as CategorySelect } from "./CategorySelect-CEGVKu1r.mjs";
import { n as isInvestmentOrder } from "./investments-rsCq6eP0.mjs";
import { t as AnimatedProgress } from "./AnimatedProgress-Lg309Jem.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/budgets-BGU6syU_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Set / edit a monthly budget for one category. Category is locked when
* editing an existing budget (setBudget upserts on (category, month)).
*/
function BudgetDialog({ open, onOpenChange, month, existing, presetCategoryId, onSave, saving }) {
	const [categoryId, setCategoryId] = (0, import_react.useState)("bills");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (open) {
			setCategoryId(existing?.categoryId ?? presetCategoryId ?? "bills");
			setAmount(existing ? paiseToRupees(existing.limitPaise) : "");
			setError(void 0);
		}
	}, [
		open,
		existing,
		presetCategoryId
	]);
	const handleSave = () => {
		const limitPaise = rupeesToPaise(amount);
		if (!Number.isFinite(limitPaise) || limitPaise <= 0) {
			setError("Enter a monthly limit greater than ₹0.");
			return;
		}
		onSave({
			categoryId,
			limitPaise
		});
	};
	const categoryLabel = categoryById(existing?.categoryId ?? categoryId)?.label ?? "category";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BottomSheet, {
		open,
		onClose: () => onOpenChange(false),
		title: existing ? "Edit budget" : "Set a budget",
		showCloseButton: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: existing ? `Monthly limit for ${categoryLabel} · ${monthLabel(month)}.` : `Cap spending for a category in ${monthLabel(month)}. Spending over the limit is flagged on the card.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "budget-category",
							children: "Category"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySelect, {
							id: "budget-category",
							value: categoryId,
							onChange: setCategoryId,
							disabled: Boolean(existing)
						}),
						existing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "The category of an existing budget cannot be changed."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
					id: "budget-amount",
					label: "Monthly limit",
					value: amount,
					onChange: setAmount,
					error,
					placeholder: "10,000.00",
					autoFocus: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "flex-1",
					onClick: () => onOpenChange(false),
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					onClick: handleSave,
					disabled: saving,
					children: saving ? "Saving…" : existing ? "Save changes" : "Set budget"
				})]
			})
		]
	});
}
function budgetState(spentPaise, limitPaise) {
	const pct = limitPaise > 0 ? spentPaise / limitPaise * 100 : 0;
	if (pct > 100) return "over";
	if (pct >= 80) return "warning";
	return "ok";
}
var indicatorClass = {
	ok: "",
	warning: "[&>div]:bg-amber-500",
	over: "[&>div]:bg-red-500"
};
var stateLabel = {
	ok: "On track",
	warning: "Near limit",
	over: "Over budget"
};
var stateTextClass = {
	ok: "text-muted-foreground",
	warning: "text-amber-600 dark:text-amber-400",
	over: "text-red-600 dark:text-red-400"
};
function BudgetCard({ budget, spentPaise, onEdit }) {
	const category = categoryById(budget.categoryId);
	const state = budgetState(spentPaise, budget.limitPaise);
	const pct = budget.limitPaise > 0 ? Math.min(100, spentPaise / budget.limitPaise * 100) : 0;
	const remaining = budget.limitPaise - spentPaise;
	const Icon = category?.icon ?? Plus;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
						style: { backgroundColor: `${category?.color ?? "#64748B"}1A` },
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "h-5 w-5",
							style: { color: category?.color ?? "#64748B" }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: category?.label ?? budget.categoryId
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("text-xs font-medium", stateTextClass[state]),
							children: state === "over" ? `Over by ${formatINR(-remaining)}` : state === "warning" ? "Near limit" : "On track"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: onEdit,
						"aria-label": `Edit ${category?.label ?? "budget"}`,
						className: pressable,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedProgress, {
				value: pct,
				className: cn("h-2.5", indicatorClass[state])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: formatINR(spentPaise)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: ["of ", formatINR(budget.limitPaise)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("text-xs", stateTextClass[state]),
				children: [
					remaining >= 0 ? `${formatINR(remaining)} remaining` : `${formatINR(-remaining)} over`,
					" · ",
					stateLabel[state]
				]
			})
		]
	}) });
}
function BudgetsPage() {
	const [month, setMonth] = useMonth();
	const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(month);
	const { data: txns = [], isLoading: txnsLoading } = useTransactions(month);
	const setBudget = useSetBudget();
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [presetCategoryId, setPresetCategoryId] = (0, import_react.useState)();
	const loading = budgetsLoading || txnsLoading;
	const spentByCategory = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const t of txns) {
			if (t.type !== "expense" || isInvestmentOrder(t)) continue;
			map.set(t.category, (map.get(t.category) ?? 0) + t.amountPaise);
		}
		return map;
	}, [txns]);
	const unbudgeted = (0, import_react.useMemo)(() => {
		const budgeted = new Set(budgets.map((b) => b.categoryId));
		return [...spentByCategory.entries()].filter(([categoryId, spent]) => !budgeted.has(categoryId) && spent > 0).sort((a, b) => b[1] - a[1]);
	}, [spentByCategory, budgets]);
	const totalSpent = [...spentByCategory.values()].reduce((a, b) => a + b, 0);
	const totalLimit = budgets.reduce((a, b) => a + b.limitPaise, 0);
	const shiftMonth = (delta) => setMonth((m) => addMonthsToKey(m, delta));
	const openNew = (categoryId) => {
		setEditing(null);
		setPresetCategoryId(categoryId);
		setDialogOpen(true);
	};
	const handleSave = (input) => {
		setBudget.mutate({
			...input,
			month
		}, {
			onSuccess: () => {
				setDialogOpen(false);
				setEditing(null);
				setPresetCategoryId(void 0);
				toast.success(`Budget set · ${categoryById(input.categoryId)?.label ?? "category"} ${formatINR(input.limitPaise)}`);
			},
			onError: () => toast.error("Couldn't save — try again.")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl space-y-6 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Budgets"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Monthly spending limits per category."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => openNew(),
					className: pressable,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "mr-2 h-4 w-4",
						"aria-hidden": true
					}), "Set budget"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => shiftMonth(-1),
						"aria-label": "Previous month",
						className: pressable,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "w-32 text-center font-medium tabular-nums",
						"aria-live": "polite",
						children: monthLabel(month)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => shiftMonth(1),
						"aria-label": "Next month",
						className: pressable,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
					})
				]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				"aria-label": "Loading budgets",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 w-full rounded-xl" }, i))
			}) : budgets.length === 0 && unbudgeted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col items-center gap-3 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-14 place-items-center rounded-2xl bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { className: "size-7 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-lg font-medium",
						children: ["No budgets for ", monthLabel(month)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted-foreground",
						children: "Pick a category and a monthly limit to start tracking spending against it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => openNew(),
						className: pressable,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "mr-2 h-4 w-4",
							"aria-hidden": true
						}), "Set your first budget"]
					})
				]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [budgets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-primary/20 bg-primary/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Total this month"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: formatINR(totalSpent)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [" of ", formatINR(totalLimit)]
						})]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: budgets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetCard, {
					budget: b,
					spentPaise: spentByCategory.get(b.categoryId) ?? 0,
					onEdit: () => {
						setEditing(b);
						setPresetCategoryId(void 0);
						setDialogOpen(true);
					}
				}, b.id))
			})] }), unbudgeted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-muted-foreground",
					children: "Spending without a budget"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: unbudgeted.map(([categoryId, spent]) => {
						const category = categoryById(categoryId);
						const Icon = category?.icon ?? Plus;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-dashed",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "flex items-center gap-3 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-8 w-8 items-center justify-center rounded-full",
										style: { backgroundColor: `${category?.color ?? "#64748B"}1A` },
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "h-4 w-4",
											style: { color: category?.color ?? "#64748B" }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: category?.label ?? categoryId
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"Spent ",
												formatINR(spent),
												" in ",
												monthLabel(month)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => openNew(categoryId),
										className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
											className: "mr-1 h-3.5 w-3.5",
											"aria-hidden": true
										}), "Set budget"]
									})
								]
							})
						}, categoryId);
					})
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				month,
				existing: editing,
				presetCategoryId,
				onSave: handleSave,
				saving: setBudget.isPending
			})
		]
	});
}
//#endregion
export { BudgetsPage as component };
