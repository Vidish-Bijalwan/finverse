import { i as __toESM } from "../_runtime.mjs";
import { n as downloadFile, s as todayISO, t as cn } from "./utils-CLFOCKAi.mjs";
import { A as saveDB, D as loadDB, n as STORE_KEY } from "./store-DCGtoGuR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Dt as CircleCheck, M as RotateCcw, Q as MonitorSmartphone, Z as Moon, _ as Sun, c as Upload, it as Info, q as Palette, u as TriangleAlert, vt as Download, xt as DatabaseBackup } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CIWq0_JF.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-EsPiNyuV.mjs";
import { n as CardContent, t as Card } from "./card-CxSeJsg6.mjs";
import { a as getSettings, c as validateBackup, i as clampMonthStartDay, n as buildBackup, o as setSettings, r as buildTransactionsCSV, s as useSettings, t as DEFAULT_SETTINGS } from "./settings-Be359HdD.mjs";
import { t as APP_VERSION } from "./AppHeader-pOGmEK-X.mjs";
import { r as SectionCard } from "./shared-BnPbPY9-.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BA3SZxqc.js
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
	const [resetOpen, setResetOpen] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	function handleExportCSV() {
		const db = loadDB();
		if (db.transactions.length === 0) {
			toast.info("No transactions to export yet.");
			return;
		}
		downloadFile(`finverse-transactions-${todayISO()}.csv`, buildTransactionsCSV(db.transactions), "text/csv");
		toast.success(`Exported ${db.transactions.length} transactions to CSV.`);
	}
	function handleBackup() {
		const backup = buildBackup(getSettings(), loadDB());
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
	function confirmRestore() {
		if (!pendingBackup) return;
		try {
			saveDB(pendingBackup.db);
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
			toast.success("Backup restored.");
			setPendingBackup(null);
			window.setTimeout(() => window.location.reload(), 400);
		} catch {
			setRestoreErrors(["Couldn't save the restored data — browser storage may be unavailable."]);
		}
	}
	function confirmReset() {
		try {
			window.localStorage.removeItem(STORE_KEY);
		} catch {}
		setResetOpen(false);
		toast.success("Demo data reset — re-seeding.");
		window.setTimeout(() => window.location.reload(), 400);
	}
	const backup = pendingBackup;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Settings",
		subtitle: "Personalize FinVerse, manage your data, and keep backups.",
		active: "Settings",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
										onClick: handleExportCSV,
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
										onClick: handleBackup,
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
													children: "Replace all current data with a FinVerse backup file."
												})] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "sm",
												onClick: () => fileRef.current?.click(),
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
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 rounded-xl border border-destructive/30 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold text-foreground",
											children: "Reset demo data"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Clear local data and restore the seeded demo."
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => setResetOpen(true),
										className: "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
										children: "Reset"
									})]
								})
							]
						})
					}),
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-3.5 shrink-0" }), "Demo build — all your data stays in this browser's local storage. Nothing is sent to a server."]
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!backup,
				onOpenChange: (o) => !o && setPendingBackup(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Restore this backup?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"This replaces ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "all" }),
					" current FinVerse data with the backup",
					backup && ` from ${new Date(backup.exportedAt).toLocaleString()}`,
					":",
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
					"This cannot be undone."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: confirmRestore,
					children: "Restore backup"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: resetOpen,
				onOpenChange: setResetOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Reset demo data?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This clears all your transactions, budgets, bills, goals and holdings from this browser and restores the seeded demo data. Your theme and month-start settings are kept. This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: confirmReset,
					children: "Reset everything"
				})] })] })
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
