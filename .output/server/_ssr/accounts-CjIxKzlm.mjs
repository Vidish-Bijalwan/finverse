import { i as __toESM } from "../_runtime.mjs";
import { i as formatINRShort, r as formatINR, s as todayISO, t as cn } from "./utils-CLFOCKAi.mjs";
import { t as DEFAULT_ACCOUNT_COLORS } from "./store-DCGtoGuR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Mt as Check, R as Plus, W as Pencil, a as Wallet, en as ArrowRightLeft, p as Trash2, rt as Landmark, y as Star } from "../_libs/lucide-react.mjs";
import { n as CATEGORY_COLORS, r as CUSTOM_ICON_OPTIONS, s as iconForName } from "./categories-Cb25vI5n.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { A as useTransfer, D as useSetDefaultAccount, h as useDeleteAccount, i as useAddAccount, j as useUpdateAccount, n as useAccountSummaries } from "./hooks-CJFESX97.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-CSuHP3IP.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { t as Switch } from "./switch-DrXkgCMB.mjs";
import { c as paiseToRupees, l as rupeesToPaise, t as AmountField } from "./utils-BulwYr5j.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as ConfirmDeleteDialog } from "./ConfirmDeleteDialog-ByyI2u9J.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts-CjIxKzlm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACCOUNT_TYPES = [
	{
		value: "cash",
		label: "Cash"
	},
	{
		value: "upi",
		label: "UPI"
	},
	{
		value: "bank",
		label: "Bank"
	}
];
var TYPE_ICON = {
	cash: "wallet",
	upi: "smartphone",
	bank: "bank"
};
/** Add / edit dialog for accounts (cash wallets, UPI handles, bank accounts). */
function AccountDialog({ open, onOpenChange, editing }) {
	const isEdit = Boolean(editing);
	const [name, setName] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("bank");
	const [iconName, setIconName] = (0, import_react.useState)("bank");
	const [color, setColor] = (0, import_react.useState)(DEFAULT_ACCOUNT_COLORS.bank);
	const [opening, setOpening] = (0, import_react.useState)("");
	const [isDefault, setIsDefault] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const addAccount = useAddAccount();
	const updateAccount = useUpdateAccount();
	const saving = addAccount.isPending || updateAccount.isPending;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setName(editing?.name ?? "");
		setType(editing?.type ?? "bank");
		setIconName(editing?.iconName ?? TYPE_ICON[editing?.type ?? "bank"]);
		setColor(editing?.color ?? DEFAULT_ACCOUNT_COLORS[editing?.type ?? "bank"]);
		setOpening(editing ? paiseToRupees(editing.openingBalancePaise) : "");
		setIsDefault(editing?.isDefault ?? false);
		setError(null);
	}, [open, editing]);
	const switchType = (t) => {
		setType(t);
		setIconName(TYPE_ICON[t]);
		setColor(DEFAULT_ACCOUNT_COLORS[t]);
	};
	const handleSave = () => {
		if (saving) return;
		const trimmed = name.trim();
		if (!trimmed) {
			setError("Give the account a name.");
			return;
		}
		const openingPaise = opening.trim() === "" ? 0 : rupeesToPaise(opening);
		if (Number.isNaN(openingPaise)) {
			setError("Opening balance must be a valid amount.");
			return;
		}
		setError(null);
		const payload = {
			name: trimmed,
			type,
			iconName,
			color,
			openingBalancePaise: openingPaise
		};
		if (isEdit && editing) updateAccount.mutate({
			id: editing.id,
			patch: payload
		}, {
			onSuccess: () => {
				toast.success("Account updated");
				onOpenChange(false);
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
		else addAccount.mutate({
			...payload,
			isDefault
		}, {
			onSuccess: () => {
				toast.success(`Account added · ${trimmed}`);
				onOpenChange(false);
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
	};
	const PreviewIcon = iconForName(iconName);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92dvh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit account" : "Add account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isEdit ? "Rename, recolor, or adjust the opening balance." : "Track a cash wallet, UPI handle, or bank account with its own live balance." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "account-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "account-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "HDFC Savings",
							maxLength: 40,
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-2 block",
						children: "Account type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1",
						role: "radiogroup",
						"aria-label": "Account type",
						children: ACCOUNT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "radio",
							"aria-checked": type === t.value,
							onClick: () => switchType(t.value),
							className: cn("rounded-xl py-2 text-sm font-semibold transition-colors", type === t.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: t.label
						}, t.value))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-2 block",
						children: "Icon"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto",
						role: "radiogroup",
						"aria-label": "Account icon",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
						id: "account-opening",
						label: "Opening balance",
						value: opening,
						onChange: setOpening,
						placeholder: "0.00"
					}),
					!isEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-2xl bg-muted px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Default account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "New transactions use this account unless you pick another."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: isDefault,
							onCheckedChange: setIsDefault,
							"aria-label": "Default account"
						})]
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
							isEdit ? "Save changes" : "Add account"
						] })
					})
				]
			})]
		})
	});
}
/** Move money between two accounts — debits one, credits the other. */
function TransferDialog({ open, onOpenChange, fromAccountId }) {
	const { data: summaries } = useAccountSummaries();
	const accounts = (0, import_react.useMemo)(() => summaries ?? [], [summaries]);
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [dateISO, setDateISO] = (0, import_react.useState)(todayISO());
	const [error, setError] = (0, import_react.useState)(null);
	const transfer = useTransfer();
	(0, import_react.useEffect)(() => {
		if (!open || accounts.length === 0) return;
		const first = accounts[0].account.id;
		const second = accounts[1]?.account.id ?? first;
		setFrom((prev) => {
			if (prev && accounts.some((s) => s.account.id === prev)) return prev;
			return fromAccountId ?? first;
		});
		setTo((prev) => {
			if (prev && accounts.some((s) => s.account.id === prev) && prev !== from) return prev;
			const f = fromAccountId ?? first;
			return accounts.find((s) => s.account.id !== f)?.account.id ?? second;
		});
		setAmount("");
		setNote("");
		setDateISO(todayISO());
		setError(null);
	}, [open, accounts.length]);
	const fromSummary = accounts.find((s) => s.account.id === from);
	const toSummary = accounts.find((s) => s.account.id === to);
	const handleSave = () => {
		if (transfer.isPending) return;
		const amountPaise = rupeesToPaise(amount);
		if (Number.isNaN(amountPaise) || amountPaise <= 0) {
			setError("Enter an amount greater than zero.");
			return;
		}
		if (!from || !to) {
			setError("Pick both accounts.");
			return;
		}
		setError(null);
		transfer.mutate({
			fromAccountId: from,
			toAccountId: to,
			amountPaise,
			note: note.trim(),
			dateISO
		}, {
			onSuccess: () => {
				toast.success(`Transferred ${formatINR(amountPaise)} · ${fromSummary?.account.name} → ${toSummary?.account.name}`);
				onOpenChange(false);
			},
			onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again.")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-5 w-5" }), " Transfer between accounts"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Debits the source account and credits the destination — one entry, both balances update." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "transfer-from",
							children: "From"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: from,
							onValueChange: setFrom,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "transfer-from",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Source" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map(({ account, balancePaise }) => {
								const Icon = iconForName(account.iconName);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: account.id,
									disabled: account.id === to,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex shrink-0",
												style: { color: account.color },
												"aria-hidden": true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: account.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground tabular-nums",
												children: formatINR(balancePaise)
											})
										]
									})
								}, account.id);
							}) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "transfer-to",
							children: "To"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: to,
							onValueChange: setTo,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "transfer-to",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Destination" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map(({ account, balancePaise }) => {
								const Icon = iconForName(account.iconName);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: account.id,
									disabled: account.id === from,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex shrink-0",
												style: { color: account.color },
												"aria-hidden": true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: account.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground tabular-nums",
												children: formatINR(balancePaise)
											})
										]
									})
								}, account.id);
							}) })]
						})]
					})]
				}),
				fromSummary && toSummary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-2xl bg-muted px-4 py-2.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-muted-foreground",
							children: fromSummary.account.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-muted-foreground",
							children: toSummary.account.name
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountField, {
					id: "transfer-amount",
					label: "Amount",
					value: amount,
					onChange: setAmount,
					autoFocus: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1fr_auto] gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "transfer-note",
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "transfer-note",
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "What was this for?",
							maxLength: 120,
							autoComplete: "off"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "transfer-date",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "transfer-date",
							type: "date",
							value: dateISO,
							onChange: (e) => e.target.value && setDateISO(e.target.value),
							max: todayISO()
						})]
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm font-medium text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: handleSave,
					disabled: transfer.isPending || accounts.length < 2,
					className: cn("flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground", "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"),
					children: transfer.isPending ? "Transferring…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5" }), " Transfer"] })
				}),
				accounts.length < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "Add a second account to move money between accounts."
				})
			]
		})] })
	});
}
var TYPE_LABEL = {
	cash: "Cash",
	upi: "UPI",
	bank: "Bank"
};
function AccountsPage() {
	const { data: summaries, isLoading, isError } = useAccountSummaries();
	const deleteAccount = useDeleteAccount();
	const setDefault = useSetDefaultAccount();
	const [accountDialog, setAccountDialog] = (0, import_react.useState)(null);
	const [transferDialog, setTransferDialog] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const list = summaries ?? [];
	const total = list.reduce((sum, s) => sum + s.balancePaise, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-lg px-4 pb-28 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Accounts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setAccountDialog({ editing: null }),
					className: "flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 rounded-3xl bg-card p-5 shadow-tile",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-48" })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: "Total balance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-3xl font-bold tabular-nums tracking-tight",
						children: formatINR(total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: [
							"Across ",
							list.length,
							" ",
							list.length === 1 ? "account" : "accounts",
							" · updates live as you add transactions"
						]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setTransferDialog({}),
				disabled: list.length < 2,
				className: cn("mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed", "border-muted-foreground/30 py-3.5 text-sm font-bold text-muted-foreground transition-colors", "hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-5 w-5" }), " Transfer between accounts"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-3",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3",
						"aria-label": "Loading accounts",
						children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 rounded-3xl bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-12 rounded-2xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-3 w-1/4" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-20" })
							]
						}, i))
					}),
					isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl bg-card px-6 py-10 text-center shadow-tile",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Couldn't load accounts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Pull to refresh or try again."
						})]
					}),
					!isLoading && !isError && list.map(({ account, balancePaise }) => {
						const Icon = iconForName(account.iconName);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-3xl bg-card p-4 shadow-tile",
							"aria-label": account.name,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
										style: {
											backgroundColor: `${account.color}1f`,
											color: account.color
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-6 w-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-1.5 truncate text-base font-bold",
											children: [account.name, account.isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" }), " Default"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: TYPE_LABEL[account.type]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("shrink-0 text-lg font-bold tabular-nums", balancePaise < 0 ? "text-destructive" : "text-foreground"),
										children: formatINRShort(balancePaise)
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center gap-1 border-t border-border/60 pt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setTransferDialog({ fromAccountId: account.id }),
										disabled: list.length < 2,
										className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4" }), " Transfer"]
									}),
									!account.isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setDefault.mutate(account.id, {
											onSuccess: () => toast.success(`“${account.name}” is now the default account`),
											onError: () => toast.error("Couldn't update — try again.")
										}),
										disabled: setDefault.isPending,
										className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4" }), " Set default"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setAccountDialog({ editing: account }),
										"aria-label": `Edit ${account.name}`,
										className: "rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDeleting(account),
										"aria-label": `Delete ${account.name}`,
										className: "rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})
								]
							})]
						}, account.id);
					}),
					!isLoading && !isError && list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-12 text-center shadow-tile",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-7 w-7 text-muted-foreground" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-semibold",
								children: "No accounts yet"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Add your cash wallet, UPI handle, or bank account to track live balances."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setAccountDialog({ editing: null }),
								className: "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90",
								children: "Add account"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-3 rounded-2xl bg-muted p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-5 w-5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted-foreground",
					children: "Balances update automatically: every expense debits its account, every income credits it, and transfers move money between two accounts. Deleting an account moves its history to your default account — nothing is lost."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountDialog, {
				open: accountDialog !== null,
				onOpenChange: (o) => !o && setAccountDialog(null),
				editing: accountDialog?.editing ?? null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransferDialog, {
				open: transferDialog !== null,
				onOpenChange: (o) => !o && setTransferDialog(null),
				...transferDialog?.fromAccountId ? { fromAccountId: transferDialog.fromAccountId } : {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDeleteDialog, {
				open: deleting !== null,
				onOpenChange: (o) => !o && setDeleting(null),
				title: "Delete account?",
				description: deleting ? `“${deleting.name}” will be removed and its transactions moved to your default account.` : "",
				pending: deleteAccount.isPending,
				onConfirm: () => {
					if (!deleting) return;
					deleteAccount.mutate(deleting.id, {
						onSuccess: () => {
							toast.success("Account deleted");
							setDeleting(null);
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't delete — try again.")
					});
				}
			})
		]
	});
}
//#endregion
export { AccountsPage as component };
