import { i as __toESM } from "../_runtime.mjs";
import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { Et as Eye, H as Plus, L as RefreshCw, Lt as Clock3, cn as Bell, h as Trash2, ln as BellRing, n as X } from "../_libs/lucide-react.mjs";
import { t as EmptyState } from "./EmptyState-DJbWsGIR.mjs";
import { i as getStock, r as STOCKS } from "./data-_btm06jU.mjs";
import { a as refreshLTP, i as getLTP, n as dayChange, r as genHistory } from "./history-mUmaAsie.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BhFA3ek8.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { t as Badge } from "./badge-BTFnlnnm.mjs";
import { n as CardContent, t as Card } from "./card-DYllYZYI.mjs";
import { a as useAddToWatchlist, c as useWatchlist, i as useAddPriceAlert, o as useRemoveFromWatchlist, r as isAlertMet, s as useRemovePriceAlert } from "./watchlist-G_EWDB_C.mjs";
import { t as ErrorState } from "./ErrorState-Bx1fnWBD.mjs";
import { t as MarketRow } from "./MarketRow-Ds6Mj7Mj.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-Doo2PtpU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parseRupeesToPaise(raw) {
	const cleaned = raw.replace(/[₹,\s]/g, "");
	if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
	const paise = Math.round(Number(cleaned) * 100);
	return paise > 0 ? paise : null;
}
function WatchlistPage() {
	const navigate = useNavigate();
	const { data: entries, isPending, isError, error, refetch } = useWatchlist();
	const addStock = useAddToWatchlist();
	const removeStock = useRemoveFromWatchlist();
	const addAlert = useAddPriceAlert();
	const removeAlert = useRemovePriceAlert();
	const reducedMotion = usePrefersReducedMotion();
	const [query, setQuery] = (0, import_react.useState)("");
	const [tick, setTick] = (0, import_react.useState)(0);
	const [prices, setPrices] = (0, import_react.useState)(null);
	/** When alert conditions were last evaluated (ms epoch). */
	const [lastEvaluatedAt, setLastEvaluatedAt] = (0, import_react.useState)(null);
	/** Which symbol's price-alert dialog is open. */
	const [alertDialogSymbol, setAlertDialogSymbol] = (0, import_react.useState)(null);
	const [alertForm, setAlertForm] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setPrices(Object.fromEntries((entries ?? []).map((e) => [e.symbol, getLTP(e.symbol)])));
		setLastEvaluatedAt(Date.now());
	}, [entries, tick]);
	const watched = (0, import_react.useMemo)(() => new Set((entries ?? []).map((e) => e.symbol)), [entries]);
	const suggestions = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return STOCKS.filter((s) => !watched.has(s.symbol) && (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q))).slice(0, 6);
	}, [query, watched]);
	const ready = !isPending && !isError && prices !== null;
	const [isRefreshing, setIsRefreshing] = (0, import_react.useState)(false);
	/**
	* "Refresh prices": jitter fresh demo LTPs AND refetch the watchlist
	* entries from the server query. Spins the icon while the async refetch is
	* in flight; the button is only disabled while data is still loading (a
	* transient skeleton state), never dead with no explanation.
	*/
	async function handleRefresh() {
		setIsRefreshing(true);
		try {
			(entries ?? []).forEach((e) => refreshLTP(e.symbol));
			setTick((t) => t + 1);
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
		toast.success("Prices refreshed.");
	}
	function handleAdd(symbol) {
		if (!getStock(symbol)) {
			toast.error(`"${symbol}" isn't in the FinVerse stock universe.`);
			return;
		}
		addStock.mutateAdd(symbol, {
			onSuccess: () => {
				setQuery("");
				toast.success(`${symbol} added to your watchlist.`);
			},
			onError: (e) => toast.error(e.message || "Couldn't add that stock — try again.")
		});
	}
	function handleRemove(symbol) {
		removeStock.mutateRemove(symbol, {
			onSuccess: () => {
				if (alertDialogSymbol === symbol) setAlertDialogSymbol(null);
				toast.success(`${symbol} removed from your watchlist.`);
			},
			onError: () => toast.error("Couldn't remove — try again.")
		});
	}
	function handleAddAlert(symbol) {
		const form = alertForm[symbol] ?? {
			kind: "above",
			price: ""
		};
		const paise = parseRupeesToPaise(form.price);
		if (paise === null) {
			toast.error("Enter a valid alert price in ₹ (e.g. 1500).");
			return;
		}
		addAlert.mutateAddAlert(symbol, form.kind, paise, {
			onSuccess: () => {
				setAlertForm((f) => ({
					...f,
					[symbol]: {
						kind: "above",
						price: ""
					}
				}));
				toast.success(`Alert set: ${symbol} ${form.kind === "above" ? "≥" : "≤"} ${formatINR(paise)}.`);
			},
			onError: () => toast.error("Couldn't save the alert — try again.")
		});
	}
	const dialogEntry = (entries ?? []).find((e) => e.symbol === alertDialogSymbol);
	const dialogForm = alertDialogSymbol ? alertForm[alertDialogSymbol] ?? {
		kind: "above",
		price: ""
	} : null;
	const dialogLtp = alertDialogSymbol != null ? prices?.[alertDialogSymbol] ?? 0 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Watchlist",
		subtitle: "Track stocks you care about. All prices are simulated — not live market data. Set above/below price alerts and FinVerse flags them for you.",
		active: "Watchlist",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => {
				handleRefresh();
			},
			disabled: !ready || isRefreshing,
			"aria-busy": isRefreshing,
			className: pressable,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", isRefreshing && "animate-spin", !reducedMotion && "transition-transform") }), "Refresh prices"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "watchlist-add",
						className: "sr-only",
						children: "Add a stock to your watchlist"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-2 shadow-tile focus-within:border-ring",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
								className: "size-4 shrink-0 text-muted-foreground",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "watchlist-add",
								type: "text",
								value: query,
								onChange: (e) => setQuery(e.target.value),
								placeholder: "Add a stock — try RELIANCE, HDFCBANK, INFY…",
								autoComplete: "off",
								role: "combobox",
								"aria-expanded": suggestions.length > 0,
								"aria-label": "Add a stock to your watchlist",
								className: "h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
							}),
							query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Clear",
								onClick: () => setQuery(""),
								className: "grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							})
						]
					}),
					suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "absolute inset-x-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-modal",
						children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => handleAdd(s.symbol),
							className: "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-bold",
										children: s.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: [
											s.name,
											" · ",
											s.sector
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-xs font-semibold tabular-nums text-muted-foreground",
									children: formatINR(s.pricePaise)
								})
							]
						}) }, s.symbol))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-4 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
					className: "mt-0.5 size-3.5 shrink-0",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Price alerts are evaluated only when prices refresh — never tick-by-tick — so simulated price jitter can't flicker an alert on and off.",
					" ",
					lastEvaluatedAt != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-foreground",
						children: [
							"Last checked",
							" ",
							new Date(lastEvaluatedAt).toLocaleTimeString("en-IN", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit"
							}),
							"."
						]
					})
				] })]
			}),
			isPending || prices === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				"aria-label": "Loading watchlist",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-2xl" }, i))
			}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Couldn't load your watchlist",
				body: error instanceof Error ? error.message : "Check your connection and try again.",
				onRetry: () => refetch()
			}) : (entries ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Your watchlist is empty",
				body: "Add stocks from the FinVerse universe and set price alerts so you never miss a move.",
				actionLabel: "Try adding RELIANCE",
				onAction: () => handleAdd("RELIANCE")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: (entries ?? []).map((entry) => {
					const stock = getStock(entry.symbol);
					const ltp = prices?.[entry.symbol] ?? stock?.pricePaise ?? 0;
					const change = dayChange(genHistory(entry.symbol, 2));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketRow, {
						symbol: entry.symbol,
						name: stock?.name ?? entry.symbol,
						pricePaise: ltp,
						changePct: change.changePct,
						starred: true,
						alerted: entry.alerts.length > 0,
						onToggleStar: () => handleRemove(entry.symbol),
						onToggleAlert: () => setAlertDialogSymbol(entry.symbol),
						onClick: () => navigate({
							to: "/stocks/$symbol",
							params: { symbol: entry.symbol }
						}),
						className: "border border-border/60 bg-card shadow-card"
					}) }, entry.symbol);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
				open: alertDialogSymbol !== null,
				onClose: () => setAlertDialogSymbol(null),
				title: `Price alerts${alertDialogSymbol ? ` · ${alertDialogSymbol}` : ""}`,
				showCloseButton: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-1 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pb-4 text-sm leading-6 text-muted-foreground",
						children: "FinVerse flags an alert the next time prices refresh and the condition is met. Simulated prices — not live market data."
					}), dialogEntry && dialogForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [dialogEntry.alerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mb-4 grid gap-2",
						children: dialogEntry.alerts.map((a) => {
							const met = isAlertMet(a, dialogLtp);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: cn("flex items-center justify-between gap-2 rounded-xl border px-3 py-2", met ? "border-success/50 bg-success-soft/60" : "border-border"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2 text-sm",
									children: [
										met ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, {
											className: "size-4 shrink-0 text-success",
											"aria-hidden": true
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
											className: "size-4 shrink-0 text-muted-foreground",
											"aria-hidden": true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-foreground",
											children: [
												a.kind === "above" ? "Above" : "Below",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "tabular-nums",
													children: formatINR(a.pricePaise)
												})
											]
										}),
										met && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-success text-white",
											children: "Triggered"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": `Delete alert ${a.kind} ${formatINR(a.pricePaise)}`,
									className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
									onClick: () => removeAlert.mutateRemoveAlert(dialogEntry.symbol, a.id, { onError: () => toast.error("Couldn't delete the alert.") }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-destructive" })
								})]
							}, a.id);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "sr-only",
								htmlFor: "alert-kind",
								children: "Alert direction"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: dialogForm.kind,
								onValueChange: (v) => setAlertForm((f) => ({
									...f,
									[dialogEntry.symbol]: {
										...dialogForm,
										kind: v
									}
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "alert-kind",
									className: "w-28",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "above",
									children: "Above ₹"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "below",
									children: "Below ₹"
								})] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "sr-only",
								htmlFor: "alert-price",
								children: "Alert price in rupees"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "alert-price",
								inputMode: "decimal",
								placeholder: "e.g. 1600",
								value: dialogForm.price,
								onChange: (e) => setAlertForm((f) => ({
									...f,
									[dialogEntry.symbol]: {
										...dialogForm,
										price: e.target.value
									}
								})),
								className: "w-32"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => handleAddAlert(dialogEntry.symbol),
								className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									className: "size-4",
									"aria-hidden": true
								}), " Set alert"]
							})
						]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-5 shadow-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "py-4 text-xs leading-5 text-muted-foreground",
					children: "Prices are simulated from the FinVerse demo market feed and jitter slightly on refresh — for learning, not trading."
				})
			})
		]
	});
}
//#endregion
export { WatchlistPage as component };
