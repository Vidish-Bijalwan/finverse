import { i as __toESM } from "../_runtime.mjs";
import { r as formatINR, s as todayISO, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { R as Plus, W as Pencil, h as Target, p as Trash2 } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { N as useUpdateGoal, _ as useDeleteGoal, k as useTransactions, l as useAddToGoal, o as useAddGoal, x as useGoals } from "./hooks-CJFESX97.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-CSuHP3IP.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { a as monthDiff, c as paiseToRupees, i as formatDateLong, l as rupeesToPaise, n as GOAL_COLORS, o as monthLabel, r as addMonthsToKey, t as AmountField } from "./utils-BulwYr5j.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as ConfirmDeleteDialog } from "./ConfirmDeleteDialog-ByyI2u9J.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CardContent, t as Card } from "./card-CxSeJsg6.mjs";
import { t as AnimatedProgress } from "./AnimatedProgress-DZJiAI4V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/goals-CuCgABD5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Create / edit a savings goal. Validates name, target, and deadline. */
function GoalFormDialog({ open, onOpenChange, initial, today, onSave, saving }) {
	const [name, setName] = (0, import_react.useState)("");
	const [target, setTarget] = (0, import_react.useState)("");
	const [deadline, setDeadline] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)(GOAL_COLORS[0]);
	const [errors, setErrors] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (open) {
			setName(initial?.name ?? "");
			setTarget(initial ? paiseToRupees(initial.targetPaise) : "");
			setDeadline(initial?.deadline ?? "");
			setColor(initial?.color ?? GOAL_COLORS[0]);
			setErrors({});
		}
	}, [open, initial]);
	const handleSave = () => {
		const next = {};
		if (name.trim().length === 0) next.name = "Give the goal a name.";
		const targetPaise = rupeesToPaise(target);
		if (!Number.isFinite(targetPaise) || targetPaise <= 0) next.target = "Enter a target greater than ₹0.";
		else if (initial && targetPaise < initial.savedPaise) next.target = `Target can't be below what's already saved (${formatINR(initial.savedPaise)}).`;
		if (!deadline) next.deadline = "Pick a deadline date.";
		else if (deadline < today) next.deadline = "Deadline can't be in the past.";
		setErrors(next);
		if (Object.keys(next).length > 0) return;
		onSave({
			name: name.trim(),
			targetPaise,
			savedPaise: initial?.savedPaise ?? 0,
			deadline,
			color
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: initial ? "Edit goal" : "New savings goal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Set a target and a deadline — FinVerse projects whether your current saving pace will get you there." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "goal-name",
									children: "Goal name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "goal-name",
									placeholder: "Emergency fund, MacBook, Goa trip…",
									value: name,
									autoFocus: true,
									onChange: (e) => setName(e.target.value),
									"aria-invalid": errors.name ? true : void 0,
									"aria-describedby": errors.name ? "goal-name-error" : void 0
								}),
								errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									id: "goal-name-error",
									role: "alert",
									className: "text-xs text-destructive",
									children: errors.name
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
							id: "goal-target",
							label: "Target amount",
							value: target,
							onChange: setTarget,
							error: errors.target,
							placeholder: "2,00,000.00"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "goal-deadline",
									children: "Deadline"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "goal-deadline",
									type: "date",
									value: deadline,
									min: today,
									onChange: (e) => setDeadline(e.target.value),
									"aria-invalid": errors.deadline ? true : void 0,
									"aria-describedby": errors.deadline ? "goal-deadline-error" : void 0
								}),
								errors.deadline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									id: "goal-deadline-error",
									role: "alert",
									className: "text-xs text-destructive",
									children: errors.deadline
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Colour" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								role: "radiogroup",
								"aria-label": "Goal colour",
								children: GOAL_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "radio",
									"aria-checked": color === c,
									"aria-label": `Colour ${c}`,
									onClick: () => setColor(c),
									className: cn("h-8 w-8 rounded-full border-2 transition-transform hover:scale-110", color === c ? "border-foreground scale-110" : "border-transparent"),
									style: { backgroundColor: c }
								}, c))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					disabled: saving,
					children: saving ? "Saving…" : initial ? "Save changes" : "Create goal"
				})] })
			]
		})
	});
}
/** Add funds to a goal — creates the transfer transaction via useAddToGoal. */
function AddFundsDialog({ open, onOpenChange, goal, onSave, saving }) {
	const [amount, setAmount] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (open) {
			setAmount("");
			setNote("");
			setError(void 0);
		}
	}, [open]);
	if (!goal) return null;
	const remaining = goal.targetPaise - goal.savedPaise;
	const handleSave = () => {
		const amountPaise = rupeesToPaise(amount);
		if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
			setError("Enter an amount greater than ₹0.");
			return;
		}
		if (remaining > 0 && amountPaise > remaining) {
			setError(`Only ${formatINR(remaining)} left to reach the target — the extra won't be counted.`);
			return;
		}
		onSave({
			id: goal.id,
			amountPaise,
			note: note.trim() || void 0
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add funds" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Move money towards ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: goal.name
					}),
					".",
					" ",
					formatINR(goal.savedPaise),
					" of ",
					formatINR(goal.targetPaise),
					" saved so far."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
						id: "funds-amount",
						label: "Amount",
						value: amount,
						onChange: setAmount,
						error,
						placeholder: "5,000.00",
						autoFocus: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "funds-note",
							children: ["Note ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "(optional)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "funds-note",
							placeholder: "October savings",
							value: note,
							onChange: (e) => setNote(e.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					disabled: saving,
					children: saving ? "Adding…" : "Add funds"
				})] })
			]
		})
	});
}
/**
* Project completion from the average monthly allocation to this goal over the
* last 3 calendar months (transfer transactions linked by goalId).
*/
function projectGoal(txns, goal, today) {
	const remaining = goal.targetPaise - goal.savedPaise;
	const curMonthKey = today.slice(0, 7);
	const deadlineKey = goal.deadline.slice(0, 7);
	const monthsLeft = monthDiff(curMonthKey, deadlineKey);
	if (remaining <= 0) return {
		kind: "complete",
		deadlinePassed: false
	};
	const windowKeys = [
		0,
		1,
		2
	].map((i) => addMonthsToKey(curMonthKey, -i));
	let total = 0;
	for (const t of txns) {
		if (t.type !== "transfer" || t.goalId !== goal.id) continue;
		if (windowKeys.includes(t.dateISO.slice(0, 7))) total += t.amountPaise;
	}
	const avg = Math.round(total / 3);
	if (avg > 0) {
		const monthsToGo = Math.ceil(remaining / avg);
		const completionKey = addMonthsToKey(curMonthKey, monthsToGo);
		if (monthDiff(curMonthKey, completionKey) <= monthsLeft) return {
			kind: "onTrack",
			completionMonthLabel: monthLabel(completionKey),
			deadlinePassed: monthsLeft < 0
		};
		const needed = Math.ceil(remaining / Math.max(1, monthsLeft));
		return {
			kind: "behind",
			neededPerMonthPaise: Math.max(0, needed - avg),
			deadlinePassed: monthsLeft < 0
		};
	}
	return {
		kind: "needsPlan",
		neededPerMonthPaise: monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining,
		deadlinePassed: monthsLeft < 0
	};
}
function GoalCard({ goal, today, txns, onAddFunds, onEdit, onDelete }) {
	const pct = goal.targetPaise > 0 ? Math.min(100, Math.round(goal.savedPaise / goal.targetPaise * 100)) : 0;
	const projection = (0, import_react.useMemo)(() => projectGoal(txns, goal, today), [
		txns,
		goal,
		today
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5",
			style: { backgroundColor: goal.color },
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-base font-semibold",
							children: goal.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: ["Deadline ", formatDateLong(goal.deadline)]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: onEdit,
							"aria-label": `Edit ${goal.name}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: onDelete,
							"aria-label": `Delete ${goal.name}`,
							className: "text-destructive hover:text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold tabular-nums",
								children: formatINR(goal.savedPaise)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground tabular-nums",
								children: ["of ", formatINR(goal.targetPaise)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedProgress, { value: pct }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground tabular-nums",
							children: [pct, "% saved"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectionLine, {
					goal,
					projection
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					onClick: onAddFunds,
					disabled: goal.savedPaise >= goal.targetPaise,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "mr-2 h-4 w-4",
						"aria-hidden": true
					}), "Add funds"]
				})
			]
		})]
	});
}
function ProjectionLine({ goal, projection }) {
	const remaining = goal.targetPaise - goal.savedPaise;
	if (projection.kind === "complete") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm font-medium text-emerald-600 dark:text-emerald-400",
		children: "Goal reached — well done."
	});
	if (projection.kind === "onTrack") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm font-medium text-emerald-600 dark:text-emerald-400",
		children: ["On track — by ", projection.completionMonthLabel]
	});
	if (projection.deadlinePassed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm font-medium text-red-600 dark:text-red-400",
		children: [
			"Deadline passed — ",
			formatINR(remaining),
			" still to go."
		]
	});
	if (projection.kind === "behind") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm font-medium text-amber-600 dark:text-amber-400",
		children: [
			"Needs ",
			formatINR(projection.neededPerMonthPaise ?? 0),
			"/mo more to hit",
			" ",
			formatDateLong(goal.deadline)
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm font-medium text-amber-600 dark:text-amber-400",
		children: [
			"Save ",
			formatINR(projection.neededPerMonthPaise ?? 0),
			"/mo to reach by",
			" ",
			formatDateLong(goal.deadline)
		]
	});
}
function GoalsPage() {
	const [today] = (0, import_react.useState)(() => todayISO());
	const { data: goals = [], isLoading: goalsLoading } = useGoals();
	const { data: txns = [], isLoading: txnsLoading } = useTransactions();
	const addGoal = useAddGoal();
	const updateGoal = useUpdateGoal();
	const deleteGoal = useDeleteGoal();
	const addToGoal = useAddToGoal();
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [fundsFor, setFundsFor] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const loading = goalsLoading || txnsLoading;
	const handleSave = (input) => {
		const onDone = () => {
			setFormOpen(false);
			setEditing(null);
		};
		if (editing) updateGoal.mutate({
			id: editing.id,
			patch: input
		}, {
			onSuccess: () => {
				onDone();
				toast.success("Goal updated");
			},
			onError: () => toast.error("Couldn't save — try again.")
		});
		else addGoal.mutate(input, {
			onSuccess: () => {
				onDone();
				toast.success(`Goal created · ${formatINR(input.targetPaise)} target`);
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
					children: "Savings goals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Set targets, add funds, and watch your pace."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditing(null);
						setFormOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "mr-2 h-4 w-4",
						"aria-hidden": true
					}), "New goal"]
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				"aria-label": "Loading goals",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" }, i))
			}) : goals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col items-center gap-3 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-14 place-items-center rounded-2xl bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-7 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-medium",
						children: "No goals yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted-foreground",
						children: "Create your first savings goal — an emergency fund, a gadget, a trip — and FinVerse will project whether your pace gets you there."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setEditing(null);
							setFormOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "mr-2 h-4 w-4",
							"aria-hidden": true
						}), "Create your first goal"]
					})
				]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: goals.map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalCard, {
					goal,
					today,
					txns,
					onAddFunds: () => setFundsFor(goal),
					onEdit: () => {
						setEditing(goal);
						setFormOpen(true);
					},
					onDelete: () => setDeleting(goal)
				}, goal.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalFormDialog, {
				open: formOpen,
				onOpenChange: setFormOpen,
				initial: editing,
				today,
				onSave: handleSave,
				saving: addGoal.isPending || updateGoal.isPending
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddFundsDialog, {
				open: fundsFor !== null,
				onOpenChange: (open) => !open && setFundsFor(null),
				goal: fundsFor,
				onSave: (input) => addToGoal.mutate(input, {
					onSuccess: () => {
						toast.success(`Added ${formatINR(input.amountPaise)} to ${fundsFor?.name ?? "goal"}`);
						setFundsFor(null);
					},
					onError: () => toast.error("Couldn't add funds — try again.")
				}),
				saving: addToGoal.isPending
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDeleteDialog, {
				open: deleting !== null,
				onOpenChange: (open) => !open && setDeleting(null),
				title: "Delete goal?",
				description: deleting ? `"${deleting.name}" and its ${formatINR(deleting.savedPaise)} saved progress will be removed. Past fund transactions are kept.` : "",
				onConfirm: () => deleting && deleteGoal.mutate(deleting.id, {
					onSuccess: () => {
						setDeleting(null);
						toast.success("Goal deleted");
					},
					onError: () => toast.error("Couldn't delete — try again.")
				}),
				pending: deleteGoal.isPending
			})
		]
	});
}
//#endregion
export { GoalsPage as component };
