import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { B as ReceiptIndianRupee, H as Plus, J as Pencil, h as Trash2, qt as Check } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { o as categoryById } from "./categories-BtDQEnJC.mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { c as paiseToRupees, l as rupeesToPaise, s as ordinal, t as AmountField } from "./utils-C0UDHC3L.mjs";
import { F as updateBill, S as insertBill, a as deleteBill } from "./db-36JnVPiF.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { f as useBills, t as QK, w as usePayBill } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BhFA3ek8.mjs";
import { t as ConfirmDeleteDialog } from "./ConfirmDeleteDialog-Cr1Ju050.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { t as Badge } from "./badge-BTFnlnnm.mjs";
import { n as CardContent, t as Card } from "./card-DYllYZYI.mjs";
import { t as CategorySelect } from "./CategorySelect-CEGVKu1r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bills-0v_8nLux.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Add / edit dialog for a recurring bill. Validates name, amount, and due day. */
function BillDialog({ open, onOpenChange, initial, onSave, saving }) {
	const [name, setName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [dueDay, setDueDay] = (0, import_react.useState)("1");
	const [category, setCategory] = (0, import_react.useState)("bills");
	const [errors, setErrors] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (open) {
			setName(initial?.name ?? "");
			setAmount(initial ? paiseToRupees(initial.amountPaise) : "");
			setDueDay(String(initial?.dueDay ?? 1));
			setCategory(initial?.category ?? "bills");
			setErrors({});
		}
	}, [open, initial]);
	const handleSave = () => {
		const next = {};
		if (name.trim().length === 0) next.name = "Give the bill a name.";
		const amountPaise = rupeesToPaise(amount);
		if (!Number.isFinite(amountPaise) || amountPaise <= 0) next.amount = "Enter an amount greater than ₹0.";
		setErrors(next);
		if (Object.keys(next).length > 0) return;
		onSave({
			name: name.trim(),
			amountPaise,
			dueDay: Number(dueDay),
			category,
			lastPaidOn: initial?.lastPaidOn
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BottomSheet, {
		open,
		onClose: () => onOpenChange(false),
		title: initial ? "Edit bill" : "Add a bill",
		showCloseButton: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Recurring bills remind you when they are due. Marking one paid records the expense automatically."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "bill-name",
								children: "Bill name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "bill-name",
								placeholder: "Electricity, Rent, Netflix…",
								value: name,
								autoFocus: true,
								onChange: (e) => setName(e.target.value),
								"aria-invalid": errors.name ? true : void 0,
								"aria-describedby": errors.name ? "bill-name-error" : void 0
							}),
							errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								id: "bill-name-error",
								role: "alert",
								className: "text-xs text-destructive",
								children: errors.name
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
						id: "bill-amount",
						label: "Amount",
						value: amount,
						onChange: setAmount,
						error: errors.amount,
						placeholder: "1,250.00"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "bill-due-day",
									children: "Due day of month"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: dueDay,
									onValueChange: setDueDay,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "bill-due-day",
										className: "w-full",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Array.from({ length: 28 }, (_, i) => i + 1).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: String(d),
										children: [d, d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"]
									}, d)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Days 1–28 so every month has one."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "bill-category",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySelect, {
								id: "bill-category",
								value: category,
								onChange: setCategory
							})]
						})]
					})
				]
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
					children: saving ? "Saving…" : initial ? "Save changes" : "Add bill"
				})]
			})
		]
	});
}
/** Local bill mutations: the shared hooks layer only exposes list + pay. */
function useBillMutations() {
	const qc = useQueryClient();
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: QK.bills });
		qc.invalidateQueries({ queryKey: ["finverse", "db"] });
	};
	return {
		saveBill: useMutation({
			mutationFn: (args) => {
				if (args.id) return updateBill(args.id, args.input).then((bill) => {
					if (!bill) throw new Error("Bill not found");
					return bill;
				});
				return insertBill(args.input);
			},
			onSuccess: invalidate
		}),
		deleteBill: useMutation({
			mutationFn: (id) => deleteBill(id),
			onSuccess: invalidate
		})
	};
}
function billStatus(bill, today) {
	const currentMonth = today.slice(0, 7);
	if (bill.lastPaidOn && bill.lastPaidOn.slice(0, 7) === currentMonth) return {
		kind: "paid",
		label: "Paid"
	};
	const todayDay = Number(today.slice(8, 10));
	if (todayDay === bill.dueDay) return {
		kind: "dueToday",
		label: "Due today"
	};
	if (todayDay < bill.dueDay) return {
		kind: "upcoming",
		label: `Due in ${bill.dueDay - todayDay} day${bill.dueDay - todayDay === 1 ? "" : "s"}`
	};
	return {
		kind: "overdue",
		label: "Overdue"
	};
}
var statusStyles = {
	paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
	dueToday: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
	upcoming: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
	overdue: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
};
function BillRow({ bill, today, onPay, paying, onEdit, onDelete }) {
	const status = billStatus(bill, today);
	const category = categoryById(bill.category);
	const Icon = category?.icon ?? Plus;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex items-center gap-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
				style: { backgroundColor: `${category?.color ?? "#64748B"}1A` },
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "h-5 w-5",
					style: { color: category?.color ?? "#64748B" }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-medium",
						children: bill.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: cn("shrink-0 font-medium", statusStyles[status.kind]),
						children: [status.kind === "paid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "mr-1 h-3 w-3",
							"aria-hidden": true
						}), status.label]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-sm text-muted-foreground",
					children: [
						"Due ",
						ordinal(bill.dueDay),
						category ? ` · ${category.label}` : "",
						status.kind === "paid" && bill.lastPaidOn ? ` · Paid ${ordinal(Number(bill.lastPaidOn.slice(8, 10)))}` : ""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shrink-0 text-base font-semibold",
				children: formatINR(bill.amountPaise)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1",
				children: [
					status.kind === "paid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						disabled: true,
						className: `text-emerald-600 ${pressable}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "mr-1 h-4 w-4",
							"aria-hidden": true
						}), "Paid"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onPay,
						disabled: paying,
						className: pressable,
						children: paying ? "Saving…" : "Mark paid"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: onEdit,
						"aria-label": `Edit ${bill.name}`,
						className: pressable,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: onDelete,
						"aria-label": `Delete ${bill.name}`,
						className: `text-destructive hover:text-destructive ${pressable}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			})
		]
	}) });
}
function BillsPage() {
	const [today] = (0, import_react.useState)(() => todayISO());
	const { data: bills = [], isLoading } = useBills();
	const payBill = usePayBill();
	const { saveBill, deleteBill } = useBillMutations();
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const handleSave = (input) => {
		const isEdit = Boolean(editing);
		const args = editing ? {
			id: editing.id,
			input
		} : { input };
		saveBill.mutate(args, {
			onSuccess: () => {
				setDialogOpen(false);
				setEditing(null);
				toast.success(isEdit ? "Bill updated" : `Bill added · ${formatINR(input.amountPaise)}`);
			},
			onError: () => toast.error("Couldn't save — try again.")
		});
	};
	const handleDelete = () => {
		if (!deleting) return;
		deleteBill.mutate(deleting.id, {
			onSuccess: () => {
				setDeleting(null);
				toast.success("Bill deleted");
			},
			onError: () => toast.error("Couldn't delete — try again.")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Bills"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Recurring bills and their due dates. Marking one paid records the expense."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditing(null);
						setDialogOpen(true);
					},
					className: pressable,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "mr-2 h-4 w-4",
						"aria-hidden": true
					}), "Add bill"]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				"aria-label": "Loading bills",
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full rounded-xl" }, i))
			}) : bills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col items-center gap-3 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-14 place-items-center rounded-2xl bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptIndianRupee, { className: "size-7 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-medium",
						children: "No bills yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted-foreground",
						children: "Add your first recurring bill — rent, electricity, a subscription — and never miss a due date again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setEditing(null);
							setDialogOpen(true);
						},
						className: pressable,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "mr-2 h-4 w-4",
							"aria-hidden": true
						}), "Add your first bill"]
					})
				]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: bills.map((bill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillRow, {
					bill,
					today,
					onPay: () => payBill.mutate({ id: bill.id }, {
						onSuccess: () => toast.success(`"${bill.name}" marked paid · ${formatINR(bill.amountPaise)}`),
						onError: () => toast.error("Couldn't mark paid — try again.")
					}),
					paying: payBill.isPending && payBill.variables?.id === bill.id,
					onEdit: () => {
						setEditing(bill);
						setDialogOpen(true);
					},
					onDelete: () => setDeleting(bill)
				}, bill.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				initial: editing,
				onSave: handleSave,
				saving: saveBill.isPending
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDeleteDialog, {
				open: deleting !== null,
				onOpenChange: (open) => !open && setDeleting(null),
				title: "Delete bill?",
				description: deleting ? `"${deleting.name}" will be removed. Past payment transactions are kept.` : "",
				onConfirm: handleDelete,
				pending: deleteBill.isPending
			})
		]
	});
}
//#endregion
export { BillsPage as component };
