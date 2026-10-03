import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { qt as Check } from "../_libs/lucide-react.mjs";
import { c as iconForName, n as CATEGORY_COLORS, r as CUSTOM_ICON_OPTIONS } from "./categories-BtDQEnJC.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-_sQy6YG6.mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { c as paiseToRupees, l as rupeesToPaise, t as AmountField } from "./utils-C0UDHC3L.mjs";
import { i as useAddAccount, j as useUpdateAccount } from "./hooks-YJqkdAGY.mjs";
import { t as Switch } from "./switch-CjLqB5fD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AccountDialog-D4KMf8ru.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Default color per account type (copied from the old localStorage store). */
var DEFAULT_ACCOUNT_COLORS = {
	cash: "#F59E0B",
	upi: "#10B981",
	bank: "#3B82F6"
};
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
//#endregion
export { AccountDialog as t };
