import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as downloadFile, t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { At as Download, Ht as CircleCheck, Nt as DatabaseBackup, Tt as FingerprintPattern, Z as Palette, f as TriangleAlert, ft as Info, nt as MonitorSmartphone, ot as Lock, tt as Moon, u as Upload, y as Sun } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { A as setBudget, C as insertCustomCategory, D as insertTransaction, E as insertRecurringRule, O as loadFinanceDB, S as insertBill, T as insertHolding, w as insertGoal, x as insertAccount } from "./db-36JnVPiF.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as Switch } from "./switch-CjLqB5fD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BhFA3ek8.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BG_ycP85.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { t as Badge } from "./badge-BTFnlnnm.mjs";
import { n as CardContent, t as Card } from "./card-DYllYZYI.mjs";
import { a as getSettings, c as validateBackup, i as clampMonthStartDay, n as buildBackup, o as setSettings, r as buildTransactionsCSV, s as useSettings, t as DEFAULT_SETTINGS } from "./settings-Cxv5Jbfq.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
import { t as APP_VERSION } from "./AppHeader-DSoPt694.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { a as isLockEnabled, c as useAppLock, i as clearBiometricCredential, l as useChangePin, m as useUpdateLockSettings, n as PinPad, o as platformBiometricAvailable, p as useSetPin, s as registerBiometric, t as APP_LOCK_TIMEOUTS, u as useDisableLock } from "./applock-hooks-BqaUs1r-.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Bbdu9SNp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root.displayName;
function SectionCard({ title, children, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-border bg-card p-5 shadow-card sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-bold text-primary-dark",
				children: title
			}), action]
		}), children]
	});
}
var THEME_OPTIONS = [
	{
		value: "light",
		label: "Light",
		hint: "Always light",
		icon: Sun
	},
	{
		value: "dark",
		label: "Dark",
		hint: "Always dark",
		icon: Moon
	},
	{
		value: "system",
		label: "System",
		hint: "Follow device",
		icon: MonitorSmartphone
	}
];
function SettingsPage() {
	const queryClient = useQueryClient();
	const [settings, updateSettings] = useSettings();
	const [restoreErrors, setRestoreErrors] = (0, import_react.useState)([]);
	const [pendingBackup, setPendingBackup] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	async function handleExportCSV() {
		const db = await loadFinanceDB();
		if (db.transactions.length === 0) {
			toast.info("No transactions to export yet.");
			return;
		}
		downloadFile(`finverse-transactions-${todayISO()}.csv`, buildTransactionsCSV(db.transactions), "text/csv");
		toast.success(`Exported ${db.transactions.length} transactions to CSV.`);
	}
	async function handleBackup() {
		const backup = buildBackup(getSettings(), await loadFinanceDB());
		downloadFile(`finverse-backup-${todayISO()}.json`, JSON.stringify(backup, null, 2), "application/json");
		toast.success("Backup downloaded.");
	}
	function handleRestoreFile(file) {
		setRestoreErrors([]);
		const reader = new FileReader();
		reader.onload = () => {
			let parsed;
			try {
				parsed = JSON.parse(String(reader.result));
			} catch {
				setRestoreErrors(["This file is not valid JSON — pick the .json backup file you downloaded from FinVerse."]);
				return;
			}
			const errors = validateBackup(parsed);
			if (errors.length > 0) {
				setRestoreErrors(errors);
				return;
			}
			setPendingBackup(parsed);
		};
		reader.onerror = () => {
			setRestoreErrors(["Couldn't read that file — please try again."]);
		};
		reader.readAsText(file);
	}
	/**
	* Merge a validated backup into the live database: every backup row is
	* inserted through the Supabase data layer unless a row with the same id
	* already exists (skipped). Cross-references (accountId, billId, goalId,
	* recurringRuleId) are re-pointed at the live rows via an id map, so
	* restored transactions stay linked to their restored accounts/bills/goals.
	* Per-row failures are collected and surfaced; successful rows are kept.
	*/
	async function confirmRestore() {
		if (!pendingBackup) return;
		setRestoreErrors([]);
		const errors = [];
		let inserted = 0;
		let skipped = 0;
		const errMsg = (e) => e instanceof Error ? e.message : "Couldn't save.";
		try {
			const db = await loadFinanceDB();
			const incoming = pendingBackup.db;
			const existingIds = /* @__PURE__ */ new Set();
			for (const row of [
				...db.transactions,
				...db.budgets,
				...db.bills,
				...db.goals,
				...db.holdings,
				...db.accounts,
				...db.customCategories,
				...db.recurringRules
			]) existingIds.add(row.id);
			const idMap = /* @__PURE__ */ new Map();
			const remap = (id) => id === void 0 ? void 0 : idMap.get(id) ?? id;
			async function insertUnlessDup(label, row, insert) {
				if (existingIds.has(row.id)) {
					idMap.set(row.id, row.id);
					skipped += 1;
					return;
				}
				try {
					const created = await insert();
					idMap.set(row.id, created.id);
					existingIds.add(created.id);
					inserted += 1;
				} catch (e) {
					errors.push(`${label}: ${errMsg(e)}`);
				}
			}
			for (const a of incoming.accounts ?? []) await insertUnlessDup(`Account "${a.name}"`, a, () => insertAccount({
				name: a.name,
				type: a.type,
				iconName: a.iconName,
				color: a.color,
				openingBalancePaise: a.openingBalancePaise,
				isDefault: a.isDefault
			}));
			for (const c of incoming.customCategories ?? []) {
				if (existingIds.has(c.id)) {
					idMap.set(c.id, c.id);
					skipped += 1;
					continue;
				}
				const clash = db.customCategories.find((e) => e.label.toLowerCase() === c.label.toLowerCase());
				if (clash) {
					idMap.set(c.id, clash.id);
					skipped += 1;
					continue;
				}
				await insertUnlessDup(`Category "${c.label}"`, c, () => insertCustomCategory({
					label: c.label,
					iconName: c.iconName,
					color: c.color,
					kind: c.kind
				}));
			}
			for (const b of incoming.bills ?? []) await insertUnlessDup(`Bill "${b.name}"`, b, () => insertBill({
				name: b.name,
				amountPaise: b.amountPaise,
				dueDay: b.dueDay,
				category: b.category,
				...b.lastPaidOn ? { lastPaidOn: b.lastPaidOn } : {}
			}));
			for (const g of incoming.goals ?? []) await insertUnlessDup(`Goal "${g.name}"`, g, () => insertGoal({
				name: g.name,
				targetPaise: g.targetPaise,
				savedPaise: g.savedPaise,
				deadline: g.deadline,
				color: g.color
			}));
			for (const h of incoming.holdings ?? []) await insertUnlessDup(`Holding "${h.symbol}"`, h, () => insertHolding({
				symbol: h.symbol,
				qty: h.qty,
				avgPricePaise: h.avgPricePaise
			}));
			for (const b of incoming.budgets ?? []) try {
				await setBudget({
					categoryId: b.categoryId,
					month: b.month,
					limitPaise: b.limitPaise
				});
				inserted += 1;
			} catch (e) {
				errors.push(`Budget ${b.categoryId} ${b.month}: ${errMsg(e)}`);
			}
			for (const r of incoming.recurringRules ?? []) await insertUnlessDup(`Recurring "${r.note || r.category}"`, r, () => insertRecurringRule({
				type: r.type,
				amountPaise: r.amountPaise,
				category: r.category,
				note: r.note,
				payMode: r.payMode,
				...remap(r.accountId) ? { accountId: remap(r.accountId) } : {},
				...remap(r.toAccountId) ? { toAccountId: remap(r.toAccountId) } : {},
				tags: r.tags ?? [],
				frequency: r.frequency,
				startDateISO: r.startDateISO,
				...r.endDateISO ? { endDateISO: r.endDateISO } : {},
				isPaused: r.isPaused
			}));
			for (const t of incoming.transactions ?? []) await insertUnlessDup(`Transaction ${t.dateISO} "${t.note}"`, t, () => insertTransaction({
				type: t.type,
				amountPaise: t.amountPaise,
				category: t.category,
				note: t.note,
				dateISO: t.dateISO,
				payMode: t.payMode,
				...remap(t.accountId) ? { accountId: remap(t.accountId) } : {},
				...remap(t.toAccountId) ? { toAccountId: remap(t.toAccountId) } : {},
				...remap(t.billId) ? { billId: remap(t.billId) } : {},
				...remap(t.goalId) ? { goalId: remap(t.goalId) } : {},
				...remap(t.recurringRuleId) ? { recurringRuleId: remap(t.recurringRuleId) } : {},
				tags: t.tags ?? []
			}));
			const s = pendingBackup.settings;
			if (s && typeof s === "object") setSettings({
				theme: [
					"light",
					"dark",
					"system"
				].includes(s.theme) ? s.theme : DEFAULT_SETTINGS.theme,
				monthStartDay: clampMonthStartDay(s.monthStartDay)
			});
			queryClient.invalidateQueries();
			if (errors.length > 0) {
				setRestoreErrors(errors);
				toast.warning(`Restore partially complete — ${inserted} added, ${skipped} skipped, ${errors.length} failed.`);
				setPendingBackup(null);
				return;
			}
			toast.success(`Backup restored — ${inserted} records added${skipped > 0 ? `, ${skipped} already present` : ""}.`);
			setPendingBackup(null);
			window.setTimeout(() => window.location.reload(), 400);
		} catch (e) {
			setRestoreErrors([`Couldn't restore: ${errMsg(e)} Check your connection and try again.`]);
		}
	}
	const backup = pendingBackup;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Settings",
		subtitle: "Personalize FinVerse, manage your data, and keep backups.",
		active: "Settings",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Appearance",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-semibold",
							children: "Theme"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 grid grid-cols-3 gap-2",
							role: "radiogroup",
							"aria-label": "Theme",
							children: THEME_OPTIONS.map((opt) => {
								const selected = settings.theme === opt.value;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "radio",
									"aria-checked": selected,
									onClick: () => {
										updateSettings({ theme: opt.value });
										toast.success(opt.value === "system" ? "Theme follows your device." : `${opt.label} theme on.`);
									},
									className: cn("flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 transition-colors", selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(opt.icon, { className: "size-5" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-bold",
											children: opt.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px]",
											children: opt.hint
										})
									]
								}, opt.value);
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "month-start",
								className: "text-sm font-semibold",
								children: "Month-start day"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "The day your financial month begins (1st = calendar months). Bills, budgets and the dashboard group spending by this cycle."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: String(settings.monthStartDay),
								onValueChange: (v) => updateSettings({ monthStartDay: clampMonthStartDay(Number(v)) }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "month-start",
									className: "mt-2 w-44",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Array.from({ length: 28 }, (_, i) => i + 1).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: String(d),
									children: [d, d === 1 ? "st (calendar months)" : d === 2 ? "nd" : d === 3 ? "rd" : "th"]
								}, d)) })]
							})
						] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Data & backup",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 rounded-xl border border-border p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-foreground",
										children: "Export transactions"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Download every transaction as a CSV spreadsheet."
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => void handleExportCSV(),
									className: pressable,
									children: "Export CSV"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 rounded-xl border border-border p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatabaseBackup, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-foreground",
										children: "Full backup"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Download everything — transactions, budgets, bills, goals, holdings, settings."
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => void handleBackup(),
									className: pressable,
									children: "Download"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold text-foreground",
												children: "Restore backup"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Add a FinVerse backup file's records to your current data — records that already exist are skipped."
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => fileRef.current?.click(),
											className: pressable,
											children: "Choose file"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: fileRef,
										type: "file",
										accept: "application/json,.json",
										className: "hidden",
										"aria-label": "Choose a FinVerse backup file",
										onChange: (e) => {
											const f = e.target.files?.[0];
											e.target.value = "";
											if (f) handleRestoreFile(f);
										}
									}),
									restoreErrors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										role: "alert",
										className: "mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-1.5 text-sm font-bold text-destructive",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }), " Couldn't restore this file"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
											className: "mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground",
											children: [restoreErrors.slice(0, 6).map((err) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: err }, err)), restoreErrors.length > 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
												"…and ",
												restoreErrors.length - 6,
												" more problems."
											] })]
										})]
									})
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLockSection, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "About FinVerse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-12 shrink-0 place-items-center rounded-xl bg-primary-dark shadow-logo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-6 text-primary-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-base font-black text-foreground",
										children: "FinVerse AI"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: APP_VERSION
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm leading-6 text-muted-foreground",
									children: "Clear, explainable insights for your financial life. Track spending, manage budgets and bills, set goals, and understand your investments — with AI that always shows its reasoning."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-start gap-1.5 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-3.5 shrink-0" }), "Your data syncs securely to your private Supabase account — protected by row-level security so only you can access it."]
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex items-center gap-2 py-4 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 shrink-0 text-success" }), "Settings save instantly and sync across tabs on this device."]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!backup,
			onOpenChange: (o) => !o && setPendingBackup(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Restore this backup?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"This adds the backup",
				backup && ` from ${new Date(backup.exportedAt).toLocaleString()}`,
				" to your current data:",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-2 block",
					children: [
						backup?.db.transactions.length ?? 0,
						" transactions ·",
						" ",
						backup?.db.budgets.length ?? 0,
						" budgets · ",
						backup?.db.bills.length ?? 0,
						" bills ·",
						" ",
						backup?.db.goals.length ?? 0,
						" goals · ",
						backup?.db.holdings.length ?? 0,
						" holdings."
					]
				}),
				"Records that already exist (matched by id) are skipped, and linked records are re-linked automatically. Your current data is kept."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: () => void confirmRestore(),
				children: "Restore backup"
			})] })] })
		})]
	});
}
/**
* App lock settings section (PIN + auto-lock timeout + biometrics).
*
* Honest states: if the `app_lock` table is missing (migration not run) the
* section says so plainly instead of faking a toggle. The biometric switch
* renders only when the device actually has a user-verifying authenticator.
*/
function AppLockSection() {
	const { user } = useAuth();
	const lock = useAppLock();
	const setPin = useSetPin();
	const changePin = useChangePin();
	const disableLock = useDisableLock();
	const updateLock = useUpdateLockSettings();
	const [bioSupported, setBioSupported] = (0, import_react.useState)(false);
	const [bioBusy, setBioBusy] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)(null);
	const [step, setStep] = (0, import_react.useState)("new");
	const [firstPin, setFirstPin] = (0, import_react.useState)("");
	const [currentPin, setCurrentPin] = (0, import_react.useState)("");
	const [pinError, setPinError] = (0, import_react.useState)(null);
	const [pinBusy, setPinBusy] = (0, import_react.useState)(false);
	const [showDisableConfirm, setShowDisableConfirm] = (0, import_react.useState)(false);
	const row = lock.data?.row ?? null;
	const tableMissing = lock.data?.tableMissing ?? false;
	const enabled = isLockEnabled(row);
	(0, import_react.useEffect)(() => {
		platformBiometricAvailable().then(setBioSupported);
	}, []);
	function openDialog(m) {
		setMode(m);
		setStep(m === "change" ? "current" : "new");
		setFirstPin("");
		setCurrentPin("");
		setPinError(null);
		setPinBusy(false);
	}
	/** Close the dialog and wipe every PIN buffer from memory. */
	function closeDialog() {
		setMode(null);
		setStep("new");
		setFirstPin("");
		setCurrentPin("");
		setPinError(null);
		setPinBusy(false);
	}
	async function handlePinComplete(pin) {
		setPinError(null);
		if (mode === "set") {
			if (step === "new") {
				setFirstPin(pin);
				setStep("confirm");
				return;
			}
			if (pin !== firstPin) {
				setPinError("Passcodes didn't match — enter it once more.");
				setStep("new");
				setFirstPin("");
				return;
			}
			setPinBusy(true);
			try {
				await setPin.mutateAsync(pin);
				toast.success("Passcode set — app lock is on.");
				closeDialog();
			} catch (e) {
				setPinError(e instanceof Error ? e.message : "Couldn't save your passcode.");
				setPinBusy(false);
			}
			return;
		}
		if (mode === "change") {
			if (step === "current") {
				setCurrentPin(pin);
				setStep("new");
				return;
			}
			if (step === "new") {
				setFirstPin(pin);
				setStep("confirm");
				return;
			}
			if (pin !== firstPin) {
				setPinError("New passcodes didn't match — enter it once more.");
				setStep("new");
				setFirstPin("");
				return;
			}
			setPinBusy(true);
			try {
				await changePin.mutateAsync({
					currentPin,
					newPin: pin
				});
				toast.success("Passcode changed.");
				closeDialog();
			} catch (e) {
				setPinError(e instanceof Error ? e.message : "Couldn't change your passcode.");
				setStep("current");
				setCurrentPin("");
				setFirstPin("");
				setPinBusy(false);
			}
		}
	}
	async function handleBioToggle(on) {
		if (!user) return;
		if (on) {
			setBioBusy(true);
			try {
				await registerBiometric(user.id, user.email ?? "FinVerse user");
				await updateLock.mutateAsync({ biometric_enabled: true });
				toast.success("Biometric unlock enabled on this device.");
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Biometric setup failed — your passcode still works.");
			} finally {
				setBioBusy(false);
			}
			return;
		}
		try {
			await updateLock.mutateAsync({ biometric_enabled: false });
			clearBiometricCredential(user.id);
			toast.info("Biometric unlock turned off.");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't turn off biometrics.");
		}
	}
	async function handleDisable() {
		setShowDisableConfirm(false);
		try {
			await disableLock.mutateAsync();
			if (user) clearBiometricCredential(user.id);
			toast.info("App lock disabled.");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't disable app lock.");
		}
	}
	const dialogTitle = mode === "set" ? step === "confirm" ? "Confirm your passcode" : "Set a passcode" : step === "current" ? "Enter your current passcode" : step === "new" ? "Enter a new passcode" : "Confirm the new passcode";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "App lock",
			children: tableMissing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "note",
				className: "flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/5 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-4 shrink-0 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm leading-6 text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: "App lock unavailable until the database update is applied."
						}),
						" ",
						"The ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: "app_lock"
						}),
						" table doesn't exist yet — run",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: "supabase/migrations/0002_revamp.sql"
						}),
						" in the Supabase SQL editor, then come back here."
					]
				})]
			}) : lock.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				"aria-label": "Loading app-lock settings",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" })]
			}) : lock.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/5 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-4 shrink-0 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold text-foreground",
							children: "Couldn't load app-lock settings"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-muted-foreground",
							children: lock.error?.message ?? "Check your connection and try again."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: `mt-2 ${pressable}`,
							onClick: () => void lock.refetch(),
							children: "Try again"
						})
					]
				})]
			}) : !enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-xl border border-border p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-foreground",
						children: "Passcode lock"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Require a 6-digit passcode when you return to the app after being away."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => openDialog("set"),
					className: pressable,
					children: "Set passcode"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 rounded-xl border border-border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 place-items-center rounded-xl bg-success/10 text-success",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-foreground",
									children: "Passcode lock"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: "On"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Locks when you're away longer than the timeout below."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => openDialog("change"),
							className: pressable,
							children: "Change"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 rounded-xl border border-border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: "Auto-lock after"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "How long the app can sit in the background before locking."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: String(row?.timeout_secs ?? 120),
							onValueChange: (v) => {
								const secs = Number(v);
								updateLock.mutate({ timeout_secs: secs }, { onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save the timeout.") });
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-36",
								"aria-label": "Auto-lock timeout",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: APP_LOCK_TIMEOUTS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: String(t.value),
								children: t.label
							}, t.value)) })]
						})]
					}),
					bioSupported && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 rounded-xl border border-border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: "Biometric unlock"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Use this device's biometrics instead of the passcode."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: !!row?.biometric_enabled,
							disabled: bioBusy || updateLock.isPending,
							onCheckedChange: (on) => void handleBioToggle(on),
							"aria-label": "Biometric unlock"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: pressable,
							onClick: () => {
								window.dispatchEvent(new CustomEvent("finverse:lock-now"));
								toast.info("FinVerse locked.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " Lock now"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: `text-danger hover:text-danger ${pressable}`,
							onClick: () => setShowDisableConfirm(true),
							children: "Disable app lock"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
			open: mode !== null,
			onClose: closeDialog,
			title: dialogTitle,
			showCloseButton: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-1 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pb-3 text-sm text-muted-foreground",
					children: mode === "change" && step === "current" ? "Verify your current passcode first." : "Your 6-digit passcode. It never leaves this device."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, {
						title: dialogTitle,
						onComplete: (pin) => void handlePinComplete(pin),
						error: pinError,
						disabled: pinBusy
					}, `${mode}-${step}`)
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: showDisableConfirm,
			onOpenChange: setShowDisableConfirm,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Disable app lock?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This removes your passcode and any biometric enrollment on this device. Anyone with access to the device and your signed-in session will be able to open FinVerse." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep it on" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				className: "bg-danger text-danger-foreground hover:bg-danger/90",
				onClick: () => void handleDisable(),
				children: "Disable"
			})] })] })
		})
	] });
}
//#endregion
export { SettingsPage as component };
