import { i as __toESM } from "../_runtime.mjs";
import { a as monthKey, i as formatINRShort, n as downloadFile, o as monthLabel, r as formatINR, s as todayISO, t as cn } from "./utils-CLFOCKAi.mjs";
import { k as nextRecurringDate } from "./store-DCGtoGuR.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $ as Mic, At as ChevronLeft, D as Settings2, K as Pause, Lt as Camera, Mt as Check, N as Repeat, R as Plus, W as Pencil, a as Wallet, bt as Delete, et as LoaderCircle, k as Search, kt as ChevronRight, n as X, p as Trash2, vt as Download, z as Play, zt as CalendarClock } from "../_libs/lucide-react.mjs";
import { a as categoryById, i as allCategories, n as CATEGORY_COLORS, o as customCategoryToCategory, r as CUSTOM_ICON_OPTIONS, s as iconForName } from "./categories-Cb25vI5n.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as useMonth, F as useUpdateRecurringRule, I as useUpdateTransaction, M as useUpdateCustomCategory, O as useToggleRecurringRule, T as useRecurringRules, a as useAddCustomCategory, b as useDeleteTransaction, c as useAddRecurringRule, d as useAllTags, g as useDeleteCustomCategory, k as useTransactions, m as useCustomCategories, n as useAccountSummaries, r as useAccounts, u as useAddTransaction, y as useDeleteRecurringRule } from "./hooks-CJFESX97.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-CSuHP3IP.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { t as Switch } from "./switch-DrXkgCMB.mjs";
import { i as formatDateLong, l as rupeesToPaise, t as AmountField } from "./utils-BulwYr5j.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as ConfirmDeleteDialog } from "./ConfirmDeleteDialog-ByyI2u9J.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as CategorySelect } from "./CategorySelect-aKhB9atj.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as buildTransactionsCSV } from "./settings-Be359HdD.mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/expenses-CiunDKmf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
/** Create / edit / delete custom categories with an icon + color picker. */
function CategoryManagerDialog({ open, onOpenChange, defaultKind = "expense" }) {
	const { data: categories, isLoading } = useCustomCategories();
	const addCategory = useAddCustomCategory();
	const updateCategory = useUpdateCustomCategory();
	const deleteCategory = useDeleteCustomCategory();
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [label, setLabel] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)(defaultKind);
	const [iconName, setIconName] = (0, import_react.useState)("tag");
	const [color, setColor] = (0, import_react.useState)(CATEGORY_COLORS[0]);
	const [error, setError] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const saving = addCategory.isPending || updateCategory.isPending;
	(0, import_react.useEffect)(() => {
		if (!open) {
			setEditing(null);
			setDeleting(null);
			setError(null);
			return;
		}
		setLabel(editing?.label ?? "");
		setKind(editing?.kind ?? defaultKind);
		setIconName(editing?.iconName ?? "tag");
		setColor(editing?.color ?? CATEGORY_COLORS[0]);
		setError(null);
	}, [
		open,
		editing,
		defaultKind
	]);
	const startEdit = (c) => setEditing(c);
	const cancelEdit = () => {
		setEditing(null);
		setLabel("");
		setKind(defaultKind);
		setIconName("tag");
		setColor(CATEGORY_COLORS[0]);
		setError(null);
	};
	const handleSave = () => {
		if (saving) return;
		if (!label.trim()) {
			setError("Give the category a name.");
			return;
		}
		setError(null);
		const payload = {
			label: label.trim(),
			iconName,
			color,
			kind
		};
		if (editing) updateCategory.mutate({
			id: editing.id,
			patch: {
				label: payload.label,
				iconName,
				color
			}
		}, {
			onSuccess: () => {
				toast.success("Category updated");
				cancelEdit();
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
		else addCategory.mutate(payload, {
			onSuccess: () => {
				toast.success(`Category added · ${payload.label}`);
				cancelEdit();
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
	};
	const PreviewIcon = iconForName(iconName);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92dvh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Custom categories" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Your categories appear in the transaction form, filters, and budgets." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Loading…"
				}) : (categories ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground",
					children: "No custom categories yet — create one below."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: (categories ?? []).map((c) => {
						const cat = customCategoryToCategory(c);
						const Icon = cat.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
									style: {
										backgroundColor: `${cat.color}1f`,
										color: cat.color
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-semibold",
										children: cat.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs capitalize text-muted-foreground",
										children: cat.kind
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => startEdit(c),
									"aria-label": `Edit ${cat.label}`,
									className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDeleting(c),
									"aria-label": `Delete ${cat.label}`,
									className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, c.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm font-bold",
						children: editing ? "Edit category" : "New category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "custom-cat-label",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "custom-cat-label",
									value: label,
									onChange: (e) => setLabel(e.target.value),
									placeholder: "Pet Care",
									maxLength: 30,
									autoComplete: "off"
								})]
							}),
							!editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "mb-2 block",
								children: "Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1",
								role: "radiogroup",
								"aria-label": "Category type",
								children: ["expense", "income"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "radio",
									"aria-checked": kind === k,
									onClick: () => setKind(k),
									className: cn("rounded-xl py-2 text-sm font-semibold capitalize transition-colors", kind === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
									children: k
								}, k))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "mb-2 block",
								children: "Icon"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid max-h-36 grid-cols-6 gap-1.5 overflow-y-auto",
								role: "radiogroup",
								"aria-label": "Category icon",
								children: CUSTOM_ICON_OPTIONS.map((opt) => {
									const Icon = opt.icon;
									const selected = iconName === opt.name;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "radio",
										"aria-checked": selected,
										"aria-label": opt.label,
										title: opt.label,
										onClick: () => setIconName(opt.name),
										className: cn("flex aspect-square items-center justify-center rounded-xl transition-all", selected ? "ring-2 ring-offset-1" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"),
										style: selected ? {
											backgroundColor: `${color}1f`,
											color,
											["--tw-ring-color"]: color
										} : void 0,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
									}, opt.name);
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "mb-2 block",
								children: "Color"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									CATEGORY_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setColor(c),
										"aria-label": `Color ${c}`,
										"aria-pressed": color === c,
										className: cn("h-9 w-9 rounded-full transition-transform", color === c && "scale-110 ring-2 ring-offset-2 ring-foreground/30"),
										style: { backgroundColor: c }
									}, c)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40",
										title: "Custom color",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "color",
											value: color,
											onChange: (e) => setColor(e.target.value),
											"aria-label": "Custom color",
											className: "absolute inset-0 h-full w-full cursor-pointer opacity-0"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute inset-0",
											style: { background: `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)` }
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 flex h-10 w-10 items-center justify-center rounded-xl",
										style: {
											backgroundColor: `${color}1f`,
											color
										},
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewIcon, { className: "h-5 w-5" })
									})
								]
							})] }),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "text-sm font-medium text-destructive",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: cancelEdit,
									className: "rounded-2xl border border-input px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted",
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleSave,
									disabled: saving,
									className: cn("flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground", "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"),
									children: saving ? "Saving…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), editing ? "Save changes" : "Add category"] })
								})]
							})
						]
					})]
				})]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDeleteDialog, {
		open: deleting !== null,
		onOpenChange: (o) => !o && setDeleting(null),
		title: "Delete category?",
		description: deleting ? `“${deleting.label}” will be removed. Past transactions keep working and still show their history.` : "",
		pending: deleteCategory.isPending,
		onConfirm: () => {
			if (!deleting) return;
			deleteCategory.mutate(deleting.id, {
				onSuccess: () => {
					toast.success("Category deleted");
					setDeleting(null);
				},
				onError: () => toast.error("Couldn't delete — try again.")
			});
		}
	})] });
}
/**
* Tag chip editor: type a tag and press Enter (or comma) to add it,
* tap the × on a chip to remove it. Used on the transaction form.
*/
function TagEditor({ tags, onChange, id = "tags" }) {
	const [draft, setDraft] = (0, import_react.useState)("");
	const commit = (raw) => {
		const t = raw.trim().replace(/^#+/, "").slice(0, 24);
		if (!t) return;
		if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
		if (tags.length >= 10) return;
		onChange([...tags, t]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "mb-2 block text-sm font-semibold text-muted-foreground",
			children: "Tags"
		}),
		tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-2 flex flex-wrap gap-1.5",
			"aria-label": "Tags",
			children: tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-primary",
				children: [
					"#",
					t,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onChange(tags.filter((x) => x !== t)),
						"aria-label": `Remove tag ${t}`,
						className: "rounded-full p-0.5 transition-colors hover:bg-primary/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
					})
				]
			}, t.toLowerCase()))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id,
			type: "text",
			value: draft,
			onChange: (e) => {
				const v = e.target.value;
				if (v.endsWith(",")) {
					commit(v.slice(0, -1));
					setDraft("");
				} else setDraft(v);
			},
			onKeyDown: (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					commit(draft);
					setDraft("");
				}
			},
			onBlur: () => {
				if (draft.trim()) {
					commit(draft);
					setDraft("");
				}
			},
			placeholder: "Add a tag, press Enter…",
			maxLength: 24,
			className: cn("h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground", "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring")
		})
	] });
}
var PAY_MODES$1 = [
	"UPI",
	"Cash",
	"Card",
	"Bank"
];
var KEYPAD_KEYS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	".",
	"0",
	"back"
];
function paiseToRupeesString(paise) {
	return (paise / 100).toString();
}
function ExpenseForm({ editing, draft, onDone }) {
	const isEdit = Boolean(editing);
	const [type, setType] = (0, import_react.useState)(editing?.type ?? draft?.type ?? "expense");
	const [amountStr, setAmountStr] = (0, import_react.useState)(editing ? paiseToRupeesString(editing.amountPaise) : draft?.amountPaise ? paiseToRupeesString(draft.amountPaise) : "0");
	const [categoryId, setCategoryId] = (0, import_react.useState)(editing?.category ?? draft?.category ?? "food");
	const [payMode, setPayMode] = (0, import_react.useState)(editing?.payMode ?? draft?.payMode ?? "UPI");
	const [note, setNote] = (0, import_react.useState)(editing?.note ?? draft?.note ?? "");
	const [dateISO, setDateISO] = (0, import_react.useState)(editing?.dateISO ?? draft?.dateISO ?? todayISO());
	const [tags, setTags] = (0, import_react.useState)(editing?.tags ?? draft?.tags ?? []);
	const [accountId, setAccountId] = (0, import_react.useState)(editing?.accountId ?? draft?.accountId);
	const [managingCategories, setManagingCategories] = (0, import_react.useState)(false);
	const [errors, setErrors] = (0, import_react.useState)({});
	const clearError = (key) => setErrors((prev) => {
		const next = { ...prev };
		delete next[key];
		return next;
	});
	const [confirmingDelete, setConfirmingDelete] = (0, import_react.useState)(false);
	const addTxn = useAddTransaction();
	const updateTxn = useUpdateTransaction();
	const deleteTxn = useDeleteTransaction();
	const { data: accounts } = useAccounts();
	const saving = addTxn.isPending || updateTxn.isPending;
	const defaultAccountId = accounts?.find((a) => a.isDefault)?.id ?? accounts?.[0]?.id;
	const effectiveAccountId = accountId ?? defaultAccountId;
	const categories = (0, import_react.useMemo)(() => allCategories().filter((c) => c.kind === type), [type]);
	const defaultCategoryFor = (t) => t === "expense" ? "food" : "salary";
	const amountPaise = (0, import_react.useMemo)(() => {
		const v = parseFloat(amountStr);
		if (!Number.isFinite(v) || v <= 0) return 0;
		return Math.round(v * 100);
	}, [amountStr]);
	const pressKey = (key) => {
		clearError("amount");
		if (key === "back") {
			setAmountStr((s) => s.length <= 1 ? "0" : s.slice(0, -1));
			return;
		}
		setAmountStr((s) => {
			if (key === ".") {
				if (s.includes(".")) return s;
				return `${s}.`;
			}
			if (s.includes(".")) {
				if ((s.split(".")[1] ?? "").length >= 2) return s;
				return `${s}${key}`;
			}
			const next = s === "0" ? key : `${s}${key}`;
			if (next.replace(".", "").length > 10) return s;
			return next;
		});
	};
	const switchType = (t) => {
		setType(t);
		setCategoryId((current) => {
			return allCategories().filter((c) => c.kind === t).some((c) => c.id === current) ? current : defaultCategoryFor(t);
		});
		clearError("category");
	};
	const validate = () => {
		const errs = {};
		if (amountPaise <= 0) errs.amount = "Enter an amount greater than zero.";
		if (!categoryId) errs.category = "Pick a category.";
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};
	const handleSave = () => {
		if (!validate() || saving) return;
		const payload = {
			type,
			amountPaise,
			category: categoryId,
			note: note.trim(),
			dateISO,
			payMode,
			tags,
			...effectiveAccountId ? { accountId: effectiveAccountId } : {}
		};
		if (isEdit && editing) updateTxn.mutate({
			id: editing.id,
			patch: payload
		}, {
			onSuccess: () => {
				toast.success("Transaction updated");
				onDone();
			},
			onError: () => toast.error("Couldn't save — try again.")
		});
		else addTxn.mutate(payload, {
			onSuccess: () => {
				toast.success(`${type === "income" ? "Income" : "Expense"} added · ${formatINR(amountPaise)}`);
				onDone();
			},
			onError: () => toast.error("Couldn't save — try again.")
		});
	};
	const handleDelete = () => {
		if (!editing) return;
		if (!confirmingDelete) {
			setConfirmingDelete(true);
			return;
		}
		deleteTxn.mutate(editing.id, {
			onSuccess: () => {
				toast.success("Transaction deleted");
				onDone();
			},
			onError: () => toast.error("Couldn't delete — try again.")
		});
	};
	const amountColor = type === "expense" ? "text-destructive" : "text-success";
	const saveLabel = isEdit ? "Save changes" : `Add ${type === "expense" ? "expense" : "income"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1",
				role: "tablist",
				"aria-label": "Transaction type",
				children: ["expense", "income"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": type === t,
					onClick: () => switchType(t),
					className: cn("rounded-xl py-2.5 text-sm font-semibold transition-colors", type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
					children: t === "expense" ? "Expense" : "Income"
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"aria-live": "polite",
					className: cn("text-5xl font-bold tracking-tight tabular-nums", amountColor),
					children: ["₹", amountStr || "0"]
				}), errors.amount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-1 text-sm font-medium text-destructive",
					children: errors.amount
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				role: "group",
				"aria-label": "Amount keypad",
				children: KEYPAD_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => pressKey(key),
					"aria-label": key === "back" ? "Backspace" : key === "." ? "Decimal point" : `Digit ${key}`,
					className: cn("flex h-12 items-center justify-center rounded-xl text-xl font-semibold transition-colors", "bg-muted text-foreground hover:bg-accent active:bg-accent/70"),
					children: key === "back" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, { className: "h-5 w-5" }) : key
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setManagingCategories(true),
						className: "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-3.5 w-3.5" }), " Manage"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-2",
					role: "radiogroup",
					"aria-label": "Category",
					children: categories.map((c) => {
						const Icon = c.icon;
						const selected = categoryId === c.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "radio",
							"aria-checked": selected,
							onClick: () => {
								setCategoryId(c.id);
								clearError("category");
							},
							className: cn("flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 transition-all", selected ? "border-transparent ring-2 ring-offset-1" : "border-transparent hover:bg-muted"),
							style: selected ? { ["--tw-ring-color"]: c.color } : void 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-10 w-10 items-center justify-center rounded-xl",
								style: {
									backgroundColor: `${c.color}1f`,
									color: c.color
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-center text-[11px] font-medium leading-tight text-foreground",
								children: c.label
							})]
						}, c.id);
					})
				}),
				errors.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-1 text-sm font-medium text-destructive",
					children: errors.category
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-sm font-semibold text-muted-foreground",
				children: "Paid via"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1",
				role: "radiogroup",
				"aria-label": "Payment mode",
				children: PAY_MODES$1.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "radio",
					"aria-checked": payMode === m,
					onClick: () => setPayMode(m),
					className: cn("rounded-xl py-2 text-sm font-semibold transition-colors", payMode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
					children: m
				}, m))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm font-semibold text-muted-foreground",
					children: "Account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: effectiveAccountId ?? "",
					onValueChange: setAccountId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						"aria-label": "Account",
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select account" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (accounts ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: a.id,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [a.name, a.isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase text-muted-foreground",
								children: "Default"
							})]
						})
					}, a.id)) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "The balance of this account updates when you save."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[1fr_auto] gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "Note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "What was this for?",
						maxLength: 120,
						className: "h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "Date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: dateISO,
						onChange: (e) => e.target.value && setDateISO(e.target.value),
						max: todayISO(),
						className: "h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagEditor, {
				tags,
				onChange: setTags
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleSave,
				disabled: saving,
				className: cn("flex h-13 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground", "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"),
				children: saving ? "Saving…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5" }),
					" ",
					saveLabel
				] })
			}),
			isEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: handleDelete,
				disabled: deleteTxn.isPending,
				className: cn("flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors", confirmingDelete ? "border-destructive bg-destructive text-destructive-foreground" : "border-destructive/40 text-destructive hover:bg-destructive/10"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), deleteTxn.isPending ? "Deleting…" : confirmingDelete ? "Tap again to confirm delete" : "Delete transaction"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryManagerDialog, {
				open: managingCategories,
				onOpenChange: setManagingCategories,
				defaultKind: type === "income" ? "income" : "expense"
			})
		]
	});
}
var PAY_MODES = [
	"UPI",
	"Cash",
	"Card",
	"Bank"
];
var FREQUENCIES = [
	{
		value: "daily",
		label: "Daily"
	},
	{
		value: "weekly",
		label: "Weekly"
	},
	{
		value: "monthly",
		label: "Monthly"
	},
	{
		value: "yearly",
		label: "Yearly"
	}
];
/** Create / edit dialog for recurring transaction rules. */
function RecurringDialog({ open, onOpenChange, editing }) {
	const isEdit = Boolean(editing);
	const { data: summaries } = useAccountSummaries();
	const accounts = (0, import_react.useMemo)(() => summaries ?? [], [summaries]);
	const [type, setType] = (0, import_react.useState)("expense");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("bills");
	const [accountId, setAccountId] = (0, import_react.useState)("");
	const [toAccountId, setToAccountId] = (0, import_react.useState)("");
	const [frequency, setFrequency] = (0, import_react.useState)("monthly");
	const [startDateISO, setStartDateISO] = (0, import_react.useState)(todayISO());
	const [hasEnd, setHasEnd] = (0, import_react.useState)(false);
	const [endDateISO, setEndDateISO] = (0, import_react.useState)(todayISO());
	const [note, setNote] = (0, import_react.useState)("");
	const [payMode, setPayMode] = (0, import_react.useState)("UPI");
	const [tags, setTags] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const addRule = useAddRecurringRule();
	const updateRule = useUpdateRecurringRule();
	const saving = addRule.isPending || updateRule.isPending;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const defaultAcc = accounts.find((s) => s.account.isDefault)?.account.id ?? accounts[0]?.account.id ?? "";
		setType(editing?.type ?? "expense");
		setAmount(editing ? String(editing.amountPaise / 100) : "");
		setCategory(editing?.category ?? "bills");
		setAccountId(editing?.accountId ?? defaultAcc);
		setToAccountId(editing?.toAccountId ?? "");
		setFrequency(editing?.frequency ?? "monthly");
		setStartDateISO(editing?.startDateISO ?? todayISO());
		setHasEnd(Boolean(editing?.endDateISO));
		setEndDateISO(editing?.endDateISO ?? todayISO());
		setNote(editing?.note ?? "");
		setPayMode(editing?.payMode ?? "UPI");
		setTags(editing?.tags ?? []);
		setError(null);
	}, [
		open,
		editing,
		accounts
	]);
	const handleSave = () => {
		if (saving) return;
		const amountPaise = rupeesToPaise(amount);
		if (Number.isNaN(amountPaise) || amountPaise <= 0) {
			setError("Enter an amount greater than zero.");
			return;
		}
		if (!startDateISO) {
			setError("Pick a start date.");
			return;
		}
		if (hasEnd && endDateISO < startDateISO) {
			setError("End date cannot be before the start date.");
			return;
		}
		if (type === "transfer" && accountId && toAccountId && accountId === toAccountId) {
			setError("Pick two different accounts for a transfer.");
			return;
		}
		setError(null);
		const payload = {
			type,
			amountPaise,
			category,
			note: note.trim() || "Recurring",
			payMode,
			tags,
			frequency,
			startDateISO,
			...accountId ? { accountId } : {},
			...type === "transfer" && toAccountId ? { toAccountId } : {},
			...hasEnd ? { endDateISO } : {}
		};
		if (isEdit && editing) updateRule.mutate({
			id: editing.id,
			patch: payload
		}, {
			onSuccess: () => {
				toast.success("Recurring rule updated");
				onOpenChange(false);
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
		else addRule.mutate(payload, {
			onSuccess: () => {
				toast.success(`Recurring ${type} · ${formatINRShort(amountPaise)} ${frequency}`);
				onOpenChange(false);
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92dvh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit recurring rule" : "New recurring rule" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Due occurrences post automatically when the app loads — never twice." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1",
						role: "tablist",
						"aria-label": "Transaction type",
						children: [
							"expense",
							"income",
							"transfer"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": type === t,
							onClick: () => setType(t),
							className: cn("rounded-xl py-2 text-sm font-semibold capitalize transition-colors", type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: t
						}, t))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
						id: "recurring-amount",
						label: "Amount",
						value: amount,
						onChange: setAmount,
						autoFocus: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "recurring-category",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySelect, {
								id: "recurring-category",
								value: category,
								onChange: setCategory,
								kind: type === "income" ? "income" : "expense"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "recurring-frequency",
								children: "Repeats"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: frequency,
								onValueChange: (v) => setFrequency(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "recurring-frequency",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FREQUENCIES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: f.value,
									children: f.label
								}, f.value)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("grid gap-2", type === "transfer" ? "grid-cols-2" : "grid-cols-1"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "recurring-account",
								children: type === "transfer" ? "From account" : "Account"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: accountId,
								onValueChange: setAccountId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "recurring-account",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select account" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map(({ account }) => {
									const Icon = iconForName(account.iconName);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: account.id,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex shrink-0",
												style: { color: account.color },
												"aria-hidden": true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
											}), account.name]
										})
									}, account.id);
								}) })]
							})]
						}), type === "transfer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "recurring-to-account",
								children: "To account"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: toAccountId,
								onValueChange: setToAccountId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "recurring-to-account",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select account" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map(({ account }) => {
									const Icon = iconForName(account.iconName);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: account.id,
										disabled: account.id === accountId,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex shrink-0",
												style: { color: account.color },
												"aria-hidden": true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
											}), account.name]
										})
									}, account.id);
								}) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "recurring-start",
								children: "Starts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "recurring-start",
								type: "date",
								value: startDateISO,
								onChange: (e) => e.target.value && setStartDateISO(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "recurring-end",
								children: "Ends"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									id: "recurring-has-end",
									checked: hasEnd,
									onCheckedChange: setHasEnd,
									"aria-label": "Has end date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "recurring-end",
									type: "date",
									value: endDateISO,
									disabled: !hasEnd,
									min: startDateISO,
									onChange: (e) => e.target.value && setEndDateISO(e.target.value),
									className: "flex-1"
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-2 block",
						children: "Paid via"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1",
						role: "radiogroup",
						"aria-label": "Payment mode",
						children: PAY_MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "radio",
							"aria-checked": payMode === m,
							onClick: () => setPayMode(m),
							className: cn("rounded-xl py-2 text-sm font-semibold transition-colors", payMode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: m
						}, m))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "recurring-note",
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "recurring-note",
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "Netflix subscription",
							maxLength: 120,
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagEditor, {
						tags,
						onChange: setTags,
						id: "recurring-tags"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-sm font-medium text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleSave,
						disabled: saving,
						className: cn("flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground", "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"),
						children: saving ? "Saving…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5" }),
							" ",
							isEdit ? "Save changes" : "Create rule"
						] })
					})
				]
			})]
		})
	});
}
var FREQUENCY_LABEL = {
	daily: "Daily",
	weekly: "Weekly",
	monthly: "Monthly",
	yearly: "Yearly"
};
function RuleRow({ rule, onEdit }) {
	const toggle = useToggleRecurringRule();
	const deleteRule = useDeleteRecurringRule();
	const { data: summaries } = useAccountSummaries();
	const [confirmingDelete, setConfirmingDelete] = (0, import_react.useState)(false);
	const cat = categoryById(rule.category);
	const Icon = cat?.icon ?? CalendarClock;
	const color = cat?.color ?? "#64748B";
	const accountName = summaries?.find((s) => s.account.id === rule.accountId)?.account.name;
	const next = rule.isPaused ? null : nextRecurringDate(rule, todayISO());
	const overdue = next !== null && next <= todayISO();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("flex items-center gap-3 rounded-2xl bg-card p-3 shadow-tile", rule.isPaused && "opacity-60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
				style: {
					backgroundColor: `${color}1f`,
					color
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold",
						children: rule.note || cat?.label || "Recurring"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: [
							FREQUENCY_LABEL[rule.frequency],
							accountName ? ` · ${accountName}` : "",
							next ? overdue ? ` · due ${formatDateLong(next)}` : ` · next ${formatDateLong(next)}` : rule.isPaused ? " · paused" : rule.endDateISO ? " · ended" : ""
						]
					}),
					rule.lastPostedDateISO && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground",
						children: ["Last posted ", formatDateLong(rule.lastPostedDateISO)]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("shrink-0 text-sm font-bold tabular-nums", rule.type === "expense" ? "text-destructive" : "text-success"),
				children: [
					rule.type === "expense" ? "−" : "+",
					" ",
					formatINR(rule.amountPaise)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => toggle.mutate({
							id: rule.id,
							isPaused: !rule.isPaused
						}, {
							onSuccess: () => toast.success(rule.isPaused ? "Recurring rule resumed" : "Recurring rule paused"),
							onError: () => toast.error("Couldn't update — try again.")
						}),
						disabled: toggle.isPending,
						"aria-label": rule.isPaused ? `Resume ${rule.note}` : `Pause ${rule.note}`,
						title: rule.isPaused ? "Resume" : "Pause",
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
						children: rule.isPaused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onEdit(rule),
						"aria-label": `Edit ${rule.note}`,
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setConfirmingDelete(true),
						"aria-label": `Delete ${rule.note}`,
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDeleteDialog, {
				open: confirmingDelete,
				onOpenChange: (o) => !o && setConfirmingDelete(false),
				title: "Delete recurring rule?",
				description: "Future occurrences stop. Transactions already posted stay in your history.",
				pending: deleteRule.isPending,
				onConfirm: () => {
					deleteRule.mutate(rule.id, {
						onSuccess: () => {
							toast.success("Recurring rule deleted");
							setConfirmingDelete(false);
						},
						onError: () => toast.error("Couldn't delete — try again.")
					});
				}
			})
		]
	});
}
/** Full manage/pause/delete UI for recurring rules, with a "new rule" action. */
function RecurringList() {
	const { data: rules, isLoading, isError } = useRecurringRules();
	const [dialog, setDialog] = (0, import_react.useState)(null);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-2",
		"aria-label": "Loading recurring rules",
		children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-2xl bg-card p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-11 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-3 w-1/3" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16" })
			]
		}, i))
	});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-card px-6 py-10 text-center shadow-tile",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold",
			children: "Couldn't load recurring rules"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Pull to refresh or try again."
		})]
	});
	const list = rules ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setDialog({ editing: null }),
				className: cn("flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30", "py-3.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" }), " New recurring rule"]
			}),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-12 text-center shadow-tile",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-7 w-7 text-muted-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold",
					children: "No recurring rules yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Automate rent, SIPs, subscriptions, salary — due entries post themselves when you open the app."
				})] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: list.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuleRow, {
					rule,
					onEdit: (r) => setDialog({ editing: r })
				}, rule.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecurringDialog, {
				open: dialog !== null,
				onOpenChange: (o) => !o && setDialog(null),
				editing: dialog?.editing ?? null
			})
		]
	});
}
var DISMISS_THRESHOLD = 110;
/**
* Reusable bottom sheet: drag handle, swipe-down-to-dismiss on touch,
* overlay click closes, Escape closes. SSR-safe (renders only in the browser).
*/
function BottomSheet({ open, onClose, title, showCloseButton, children }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [visible, setVisible] = (0, import_react.useState)(false);
	const reducedMotion = usePrefersReducedMotion();
	const sheetRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mounted) return;
		if (open) {
			setVisible(true);
			const prev = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = prev;
			};
		}
		if (reducedMotion) {
			setVisible(false);
			return;
		}
		const t = window.setTimeout(() => setVisible(false), 240);
		return () => window.clearTimeout(t);
	}, [
		open,
		mounted,
		reducedMotion
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	const applyDragOffset = (0, import_react.useCallback)((offset) => {
		const el = sheetRef.current;
		if (el && !reducedMotion) {
			el.style.transition = "none";
			el.style.transform = `translateY(${Math.max(0, offset)}px)`;
		}
	}, [reducedMotion]);
	const endDrag = (0, import_react.useCallback)(() => {
		const drag = dragRef.current;
		const el = sheetRef.current;
		dragRef.current = null;
		if (!drag) return;
		const velocity = drag.offset / Math.max(1, Date.now() - drag.startTime);
		if (drag.offset > DISMISS_THRESHOLD || velocity > .6) onClose();
		else if (el && !reducedMotion) {
			el.style.transition = "";
			el.style.transform = "";
		}
	}, [onClose, reducedMotion]);
	(0, import_react.useEffect)(() => {
		if (!open || !mounted) return;
		if (!sheetRef.current || reducedMotion) return;
		const onMove = (e) => {
			const drag = dragRef.current;
			if (!drag) return;
			drag.offset = e.touches[0].clientY - drag.startY;
			applyDragOffset(drag.offset);
		};
		const onUp = () => endDrag();
		window.addEventListener("touchmove", onMove, { passive: true });
		window.addEventListener("touchend", onUp);
		window.addEventListener("touchcancel", onUp);
		return () => {
			window.removeEventListener("touchmove", onMove);
			window.removeEventListener("touchend", onUp);
			window.removeEventListener("touchcancel", onUp);
		};
	}, [
		open,
		mounted,
		reducedMotion,
		applyDragOffset,
		endDrag
	]);
	if (!mounted || !visible) return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80]",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title ?? "Sheet",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			onClick: onClose,
			className: cn("absolute inset-0 bg-black/55", reducedMotion ? "opacity-100" : "transition-opacity duration-240"),
			style: reducedMotion ? void 0 : { opacity: open ? 1 : 0 }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: sheetRef,
			onTouchStart: (e) => {
				dragRef.current = {
					startY: e.touches[0].clientY,
					offset: 0,
					startTime: Date.now()
				};
			},
			className: cn("absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] w-full max-w-lg", "overflow-hidden rounded-t-3xl bg-card shadow-2xl", !reducedMotion && "transition-transform duration-240 ease-[cubic-bezier(0.32,0.72,0,1)]"),
			style: reducedMotion ? void 0 : { transform: open ? "translateY(0)" : "translateY(100%)" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 pb-2 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 w-11 rounded-full bg-muted",
						"aria-hidden": "true"
					})
				}), (title || showCloseButton) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between gap-3",
					children: [title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-foreground",
						children: title
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close sheet",
						className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[calc(88dvh-4rem)] overflow-y-auto px-5 pb-8",
				children
			})]
		})]
	}), document.body);
}
var RULES = [
	{
		pattern: /\b(salary|paycheck|pay slip|payslip|stipend)\b/i,
		category: "salary",
		type: "income"
	},
	{
		pattern: /\b(freelance|gig|contract work)\b/i,
		category: "freelance",
		type: "income"
	},
	{
		pattern: /\b(business|shop income|store income)\b/i,
		category: "business",
		type: "income"
	},
	{
		pattern: /\b(interest|fd interest|savings interest|dividend)\b/i,
		category: "interest",
		type: "income"
	},
	{
		pattern: /\b(received|earned|income|payout|cashback|refund)\b/i,
		category: "other-income",
		type: "income"
	},
	{
		pattern: /\b(chai|coffee|tea|food|dinner|lunch|breakfast|pizza|burger|restaurant|snack|snacks|cafe|zomato|swiggy|biryani|samosa|thali|momos|juice)\b/i,
		category: "food",
		type: "expense"
	},
	{
		pattern: /\b(grocer(y|ies)|bigbasket|blinkit|zepto|vegetable|sabzi|kirana|dmart|milk|atta|rice|dal)\b/i,
		category: "groceries",
		type: "expense"
	},
	{
		pattern: /\b(uber|ola|cab|taxi|petrol|fuel|diesel|metro|auto|parking|toll|fastag)\b/i,
		category: "transport",
		type: "expense"
	},
	{
		pattern: /\b(movie|movies|cinema|netflix|concert|show|spotify|prime video|hotstar|game|gaming|party|club|theatre)\b/i,
		category: "entertainment",
		type: "expense"
	},
	{
		pattern: /\b(rent|house rent|flat rent|pg rent|hostel)\b/i,
		category: "rent",
		type: "expense"
	},
	{
		pattern: /\b(medicine|medicines|doctor|pharmacy|hospital|clinic|health|dental|checkup|chemist)\b/i,
		category: "health",
		type: "expense"
	},
	{
		pattern: /\b(flight|hotel|trip|travel|vacation|holiday|bus ticket|railway|irctc|train ticket|tour)\b/i,
		category: "travel",
		type: "expense"
	},
	{
		pattern: /\b(mobile|recharge|electricity|broadband|wifi|dth|gas cylinder|water bill|phone bill)\b/i,
		category: "bills",
		type: "expense"
	},
	{
		pattern: /\b(shopping|amazon|myntra|flipkart|clothes|shirt|shoes|dress|kurta|saree|jeans|tshirt)\b/i,
		category: "shopping",
		type: "expense"
	},
	{
		pattern: /\b(sip|invest(ment)?|stocks?|mutual fund|shares|fd|ppf|nps|gold)\b/i,
		category: "investments",
		type: "expense"
	},
	{
		pattern: /\b(school|college|course|tuition|books?|exam|fees?|coaching|udemy)\b/i,
		category: "education",
		type: "expense"
	}
];
var AMOUNT_PATTERNS = [
	/₹\s*([\d,]+(?:\.\d{1,2})?)/,
	/(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i,
	/([\d,]+(?:\.\d{1,2})?)\s*(?:\/-|rs\.?|rupees?|inr)\b/i,
	/\b([\d,]+(?:\.\d{1,2})?)\b/
];
/** Words that only connect the amount to the sentence; stripped from the note. */
var FILLER = /\b(spent|spend|paid|pay|cost|costing|of|for|on|at|the|a|an|my)\b/gi;
function cleanNote(text) {
	const note = text.replace(FILLER, " ").replace(/\s{2,}/g, " ").replace(/^[,.;:\-–—\s]+|[,.;:\-–—\s]+$/g, "").trim();
	if (!note) return "";
	return note.charAt(0).toUpperCase() + note.slice(1);
}
/**
* Parse free text into a transaction draft.
* Returns null when no positive amount can be found.
*/
function parseExpenseInput(raw) {
	if (!raw || !raw.trim()) return null;
	const text = raw.trim();
	let amount = null;
	let matchedToken = "";
	for (const re of AMOUNT_PATTERNS) {
		const m = text.match(re);
		if (m?.[1]) {
			const value = parseFloat(m[1].replace(/,/g, ""));
			if (Number.isFinite(value) && value > 0) {
				amount = value;
				matchedToken = m[0] ?? "";
				break;
			}
		}
	}
	if (amount === null) return null;
	const amountPaise = Math.round(amount * 100);
	if (amountPaise <= 0) return null;
	let rule = {
		pattern: /$^/,
		category: "others",
		type: "expense"
	};
	for (const r of RULES) if (r.pattern.test(text)) {
		rule = r;
		break;
	}
	const note = cleanNote(text.replace(matchedToken, " "));
	return {
		amountPaise,
		category: rule.category,
		note,
		type: rule.type
	};
}
function getRecognitionCtor() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
function useVoiceInput(lang = "en-IN") {
	const [supported] = (0, import_react.useState)(() => getRecognitionCtor() !== null);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const recRef = (0, import_react.useRef)(null);
	const stop = (0, import_react.useCallback)(() => {
		recRef.current?.stop();
	}, []);
	const start = (0, import_react.useCallback)(() => {
		const Ctor = getRecognitionCtor();
		if (!Ctor) {
			setError("Voice input is not supported in this browser. Try Chrome or Edge.");
			return;
		}
		recRef.current?.abort();
		setError(null);
		const rec = new Ctor();
		rec.lang = lang;
		rec.continuous = false;
		rec.interimResults = false;
		rec.onresult = (event) => {
			let finalText = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (result?.isFinal) for (let j = 0; j < result.length; j++) {
					const alt = result[j];
					if (alt) finalText += alt.transcript;
				}
			}
			if (finalText.trim()) setTranscript((prev) => prev ? `${prev} ${finalText.trim()}` : finalText.trim());
		};
		rec.onerror = () => {
			setError("Couldn't hear that — try again or type instead.");
			setListening(false);
		};
		rec.onend = () => {
			setListening(false);
			recRef.current = null;
		};
		recRef.current = rec;
		try {
			rec.start();
			setListening(true);
		} catch {
			setError("Couldn't start the microphone. Check browser permissions.");
			setListening(false);
		}
	}, [lang]);
	const clear = (0, import_react.useCallback)(() => {
		setTranscript("");
		setError(null);
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			recRef.current?.abort();
			recRef.current = null;
		};
	}, []);
	return {
		supported,
		listening,
		transcript,
		error,
		start,
		stop,
		clear
	};
}
var DELETE_WIDTH = 88;
function toISODate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayLabel(dateISO) {
	if (dateISO === todayISO()) return "Today";
	if (dateISO === toISODate(/* @__PURE__ */ new Date(Date.now() - 864e5))) return "Yesterday";
	return (/* @__PURE__ */ new Date(`${dateISO}T12:00:00`)).toLocaleDateString("en-IN", {
		weekday: "short",
		day: "numeric",
		month: "short"
	});
}
function shiftMonth(key, delta) {
	const [y = 1970, m = 1] = key.split("-").map(Number);
	return monthKey(new Date(y, m - 1 + delta, 1));
}
/**
* Row that reveals a Delete action on left-swipe (touch).
* Tapping the row opens the edit sheet; the delete target sits behind.
*/
function SwipeableRow({ onDelete, deleteLabel, onOpen, children }) {
	const [dx, setDx] = (0, import_react.useState)(0);
	const [open, setOpen] = (0, import_react.useState)(false);
	const startX = (0, import_react.useRef)(null);
	const translate = open ? -88 : -dx;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: (e) => {
				e.stopPropagation();
				onDelete();
			},
			"aria-label": deleteLabel,
			tabIndex: open ? 0 : -1,
			className: "absolute inset-y-0 right-0 flex w-[88px] cursor-pointer flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold",
				children: "Delete"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "button",
			tabIndex: 0,
			onClick: onOpen,
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onOpen();
				}
			},
			onTouchStart: (e) => {
				const touch = e.touches[0];
				if (touch) startX.current = touch.clientX;
			},
			onTouchMove: (e) => {
				const touch = e.touches[0];
				if (startX.current === null || !touch) return;
				const delta = startX.current - touch.clientX;
				setDx(delta > 0 ? Math.min(delta, DELETE_WIDTH) : 0);
			},
			onTouchEnd: () => {
				setOpen(dx > DELETE_WIDTH / 2);
				setDx(0);
				startX.current = null;
			},
			className: cn("relative cursor-pointer bg-card", "motion-safe:transition-transform motion-safe:duration-150"),
			style: { transform: `translateX(${translate}px)` },
			children
		})]
	});
}
/**
* DEMO STUB — receipt scan results.
* Plug a real OCR service (e.g. on-device ML Kit / a vision API) here:
* replace MOCK_RECEIPTS with the parsed { merchant, total } from the scan.
*/
var MOCK_RECEIPTS = [
	{
		merchant: "Swiggy",
		amountPaise: 48600,
		category: "food",
		payMode: "UPI"
	},
	{
		merchant: "BigBasket",
		amountPaise: 124950,
		category: "groceries",
		payMode: "Card"
	},
	{
		merchant: "Uber",
		amountPaise: 21300,
		category: "transport",
		payMode: "UPI"
	},
	{
		merchant: "Apollo Pharmacy",
		amountPaise: 87500,
		category: "health",
		payMode: "Card"
	}
];
function ExpensesPage() {
	const [month, setMonth] = useMonth();
	const [tab, setTab] = (0, import_react.useState)("transactions");
	const [search, setSearch] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [catFilter, setCatFilter] = (0, import_react.useState)("all");
	const [tagFilter, setTagFilter] = (0, import_react.useState)([]);
	const [quickAdd, setQuickAdd] = (0, import_react.useState)("");
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const receiptIdx = (0, import_react.useRef)(0);
	const scanTimer = (0, import_react.useRef)(null);
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [prefill, setPrefill] = (0, import_react.useState)(null);
	const { data: txns, isLoading } = useTransactions(month);
	const { data: accounts } = useAccounts();
	const { data: allTagList } = useAllTags();
	const addTxn = useAddTransaction();
	const deleteTxn = useDeleteTransaction();
	const defaultAccountId = accounts?.find((a) => a.isDefault)?.id ?? accounts?.[0]?.id;
	function handleExportCSV() {
		if (filtered.length === 0) {
			toast.info("Nothing to export — no transactions match the current filters.");
			return;
		}
		downloadFile(`finverse-expenses-${month}.csv`, buildTransactionsCSV(filtered), "text/csv");
		toast.success(`Exported ${filtered.length} transaction${filtered.length === 1 ? "" : "s"} to CSV.`);
	}
	const { supported: voiceSupported, listening, transcript, error: voiceError, start: startVoice, stop: stopVoice, clear: clearVoice } = useVoiceInput();
	(0, import_react.useEffect)(() => {
		if (!listening && transcript.trim()) {
			const text = transcript.trim();
			setQuickAdd((prev) => prev ? `${prev} ${text}` : text);
			clearVoice();
		}
	}, [listening]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (scanTimer.current) clearTimeout(scanTimer.current);
		};
	}, []);
	const parsed = (0, import_react.useMemo)(() => parseExpenseInput(quickAdd), [quickAdd]);
	const filtered = (0, import_react.useMemo)(() => {
		const list = txns ?? [];
		const q = search.trim().toLowerCase();
		return list.filter((t) => {
			if (typeFilter !== "all" && t.type !== typeFilter) return false;
			if (catFilter !== "all" && t.category !== catFilter) return false;
			if (tagFilter.length > 0) {
				const txnTags = t.tags ?? [];
				if (!tagFilter.some((tag) => txnTags.includes(tag))) return false;
			}
			if (q) {
				const label = categoryById(t.category)?.label ?? t.category;
				if (!`${t.note} ${label} ${t.payMode} ${(t.tags ?? []).join(" ")} ${formatINR(t.amountPaise)} ${t.amountPaise / 100}`.toLowerCase().includes(q)) return false;
			}
			return true;
		}).sort((a, b) => a.dateISO === b.dateISO ? a.createdAt < b.createdAt ? 1 : -1 : a.dateISO < b.dateISO ? 1 : -1);
	}, [
		txns,
		search,
		typeFilter,
		catFilter,
		tagFilter
	]);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const t of filtered) {
			const arr = map.get(t.dateISO);
			if (arr) arr.push(t);
			else map.set(t.dateISO, [t]);
		}
		return [...map.entries()].sort((a, b) => a[0] < b[0] ? 1 : -1);
	}, [filtered]);
	const totals = (0, import_react.useMemo)(() => {
		let spent = 0;
		let earned = 0;
		for (const t of txns ?? []) if (t.type === "expense") spent += t.amountPaise;
		else if (t.type === "income") earned += t.amountPaise;
		return {
			spent,
			earned
		};
	}, [txns]);
	const openAdd = (draft) => {
		setPrefill(draft ?? null);
		setSheet({ mode: "add" });
	};
	const confirmQuickAdd = () => {
		if (!parsed || addTxn.isPending) return;
		const cat = categoryById(parsed.category);
		addTxn.mutate({
			type: parsed.type,
			amountPaise: parsed.amountPaise,
			category: parsed.category,
			note: parsed.note || cat?.label || "Quick add",
			dateISO: todayISO(),
			payMode: "UPI",
			...defaultAccountId ? { accountId: defaultAccountId } : {}
		}, {
			onSuccess: () => {
				setQuickAdd("");
				toast.success(`${parsed.type === "income" ? "Income" : "Expense"} added · ${formatINR(parsed.amountPaise)}`);
			},
			onError: () => toast.error("Couldn't save — try again.")
		});
	};
	const mockReceiptScan = () => {
		if (scanning) return;
		setScanning(true);
		scanTimer.current = setTimeout(() => {
			const r = MOCK_RECEIPTS[receiptIdx.current % MOCK_RECEIPTS.length];
			receiptIdx.current += 1;
			if (!r) {
				setScanning(false);
				return;
			}
			setScanning(false);
			openAdd({
				amountPaise: r.amountPaise,
				category: r.category,
				note: `Receipt · ${r.merchant}`,
				type: "expense",
				payMode: r.payMode
			});
		}, 1200);
	};
	const previewCat = parsed ? categoryById(parsed.category) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-lg px-4 pb-28 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Expenses"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 rounded-full bg-muted p-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMonth(shiftMonth(month, -1)),
							"aria-label": "Previous month",
							className: "rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-20 text-center text-sm font-semibold",
							children: monthLabel(month)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMonth(shiftMonth(month, 1)),
							"aria-label": "Next month",
							className: "rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-1 gap-1 rounded-2xl bg-muted p-1",
						role: "tablist",
						"aria-label": "Expenses sections",
						children: [["transactions", "Transactions"], ["recurring", "Recurring"]].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === value,
							onClick: () => setTab(value),
							className: cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors", tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: [value === "recurring" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-4 w-4" }), label]
						}, value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/accounts",
						"aria-label": "Manage accounts",
						className: "flex items-center gap-1.5 rounded-2xl bg-card px-3.5 py-2.5 text-sm font-bold text-primary shadow-tile transition-colors hover:bg-primary/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }), " Accounts"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleExportCSV,
						"aria-label": "Export visible transactions to CSV",
						title: "Export visible transactions to CSV",
						className: "flex items-center gap-1.5 rounded-2xl bg-card px-3.5 py-2.5 text-sm font-bold text-primary shadow-tile transition-colors hover:bg-primary/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export"]
					})
				]
			}),
			tab === "recurring" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecurringList, {})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-card p-3 shadow-tile",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Spent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-bold tabular-nums text-destructive",
							children: formatINR(totals.spent)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-card p-3 shadow-tile",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Earned"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-bold tabular-nums text-success",
							children: formatINR(totals.earned)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-2xl bg-card p-2 shadow-tile",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: quickAdd,
									onChange: (e) => setQuickAdd(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") confirmQuickAdd();
									},
									placeholder: "Try \"chai with friends 250\"…",
									"aria-label": "Quick add expense",
									className: "h-11 flex-1 rounded-xl bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
								}),
								quickAdd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setQuickAdd(""),
									"aria-label": "Clear quick add",
									className: "rounded-full p-2 text-muted-foreground hover:bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => listening ? stopVoice() : startVoice(),
									disabled: !voiceSupported && !listening,
									"aria-label": listening ? "Stop voice input" : "Voice input",
									title: voiceSupported ? "Speak an expense" : "Voice input not supported in this browser",
									className: cn("rounded-full p-2.5 transition-colors", listening ? "bg-destructive text-destructive-foreground motion-safe:animate-pulse" : "text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: mockReceiptScan,
									disabled: scanning,
									"aria-label": "Scan receipt",
									title: "Scan a receipt (demo)",
									className: "rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60",
									children: scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5" })
								})
							]
						}),
						parsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold tabular-nums",
										children: formatINR(parsed.amountPaise)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: " · "
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: previewCat?.label ?? parsed.category
									}),
									parsed.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: " · "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground",
										children: [
											"“",
											parsed.note,
											"”"
										]
									})] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: confirmQuickAdd,
								disabled: addTxn.isPending,
								className: "shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60",
								children: addTxn.isPending ? "Saving…" : "Confirm"
							})]
						}),
						scanning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-2 text-sm text-muted-foreground",
							role: "status",
							children: "Scanning receipt…"
						}),
						voiceError && !listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-2 text-sm text-destructive",
							role: "alert",
							children: voiceError
						}),
						listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-2 text-sm text-muted-foreground",
							role: "status",
							children: "Listening… say something like “chai 250”"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "search",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search notes, categories…",
						"aria-label": "Search transactions",
						className: "h-11 w-full rounded-2xl border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 rounded-2xl bg-muted p-1",
						role: "tablist",
						"aria-label": "Type filter",
						children: [
							["all", "All"],
							["expense", "Expenses"],
							["income", "Income"]
						].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": typeFilter === value,
							onClick: () => setTypeFilter(value),
							className: cn("rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors", typeFilter === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: label
						}, value))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: catFilter,
						onChange: (e) => setCatFilter(e.target.value),
						"aria-label": "Filter by category",
						className: "h-10 flex-1 rounded-2xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All categories"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
								label: "Expenses",
								children: allCategories().filter((c) => c.kind === "expense").map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.label
								}, c.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
								label: "Income",
								children: allCategories().filter((c) => c.kind === "income").map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.label
								}, c.id))
							})
						]
					})]
				}),
				(allTagList ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-1.5 overflow-x-auto pb-1",
					role: "group",
					"aria-label": "Filter by tag",
					children: [(allTagList ?? []).map((tag) => {
						const active = tagFilter.includes(tag);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": active,
							onClick: () => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]),
							className: cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"),
							children: ["#", tag]
						}, tag);
					}), tagFilter.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTagFilter([]),
						className: "flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" }), " Clear"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-5",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-3",
							"aria-label": "Loading transactions",
							children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 rounded-2xl bg-card p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-11 rounded-xl" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-3 w-1/3" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16" })
								]
							}, i))
						}),
						!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-12 text-center shadow-tile",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-7 w-7 text-muted-foreground" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base font-semibold",
									children: "No transactions — add your first"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Type it, speak it, or scan a receipt above."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => openAdd(),
									className: "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90",
									children: "Add transaction"
								})
							]
						}),
						!isLoading && groups.map(([dateISO, items]) => {
							let daySpent = 0;
							let dayEarned = 0;
							for (const t of items) if (t.type === "expense") daySpent += t.amountPaise;
							else if (t.type === "income") dayEarned += t.amountPaise;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-label": dayLabel(dateISO),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-baseline justify-between px-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-bold text-muted-foreground",
										children: dayLabel(dateISO)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium tabular-nums text-muted-foreground",
										children: [
											daySpent > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-destructive",
												children: ["− ", formatINR(daySpent)]
											}),
											daySpent > 0 && dayEarned > 0 && " · ",
											dayEarned > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-success",
												children: ["+ ", formatINR(dayEarned)]
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col gap-2",
									children: items.map((t) => {
										const cat = categoryById(t.category);
										const Icon = cat?.icon ?? Plus;
										const color = cat?.color ?? "#64748B";
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwipeableRow, {
											onOpen: () => setSheet({
												mode: "edit",
												txn: t
											}),
											onDelete: () => deleteTxn.mutate(t.id, {
												onSuccess: () => toast.success("Transaction deleted"),
												onError: () => toast.error("Couldn't delete — try again.")
											}),
											deleteLabel: `Delete ${t.note || cat?.label || "transaction"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 rounded-2xl bg-card p-3 shadow-tile",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
														style: {
															backgroundColor: `${color}1f`,
															color
														},
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "min-w-0 flex-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "truncate text-sm font-semibold",
															children: t.note || cat?.label || t.category
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-0.5 text-xs text-muted-foreground",
															children: [
																dayLabel(t.dateISO),
																" · ",
																t.payMode,
																(t.tags ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", (t.tags ?? []).map((tag) => `#${tag}`).join(" ")] })
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: cn("shrink-0 text-sm font-bold tabular-nums", t.type === "expense" ? "text-destructive" : "text-success"),
														children: [
															t.type === "expense" ? "−" : "+",
															" ",
															formatINR(t.amountPaise)
														]
													})
												]
											})
										}, t.id);
									})
								})]
							}, dateISO);
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => openAdd(),
				"aria-label": "Add transaction",
				className: cn("fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full", "bg-primary text-primary-foreground shadow-modal transition-transform hover:scale-105 active:scale-95"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
				open: sheet !== null,
				onClose: () => {
					setSheet(null);
					setPrefill(null);
				},
				title: sheet?.mode === "edit" ? "Edit transaction" : "Add transaction",
				showCloseButton: true,
				children: sheet?.mode === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseForm, {
					editing: sheet.txn,
					onDone: () => {
						setSheet(null);
						setPrefill(null);
					}
				}, sheet.txn.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseForm, {
					draft: prefill,
					onDone: () => {
						setSheet(null);
						setPrefill(null);
					}
				}, prefill ? `draft-${prefill.amountPaise}-${prefill.note}` : "new")
			})
		]
	});
}
//#endregion
export { ExpensesPage as component };
