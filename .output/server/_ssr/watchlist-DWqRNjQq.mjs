import { i as __toESM } from "../_runtime.mjs";
import { r as formatINR, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Kt as Bell, P as RefreshCw, R as Plus, Zt as ArrowUpRight, gt as Eye, n as X, p as Trash2, qt as BellRing, rn as ArrowDownRight } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-EsPiNyuV.mjs";
import { n as CardContent, t as Card } from "./card-CxSeJsg6.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { i as getStock, r as STOCKS } from "./data-_btm06jU.mjs";
import { i as refreshLTP, n as genHistory, r as getLTP, t as dayChange } from "./history-CDM6LAry.mjs";
import { a as useRemovePriceAlert, i as useRemoveFromWatchlist, n as useAddPriceAlert, o as useWatchlist, r as useAddToWatchlist, t as isAlertMet } from "./watchlist-D6Z63jok.mjs";
import { r as SectionCard, t as EmptyState } from "./shared-BnPbPY9-.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-DWqRNjQq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parseRupeesToPaise(raw) {
	const cleaned = raw.replace(/[₹,\s]/g, "");
	if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
	const paise = Math.round(Number(cleaned) * 100);
	return paise > 0 ? paise : null;
}
function WatchlistPage() {
	const { data: entries, isPending } = useWatchlist();
	const addStock = useAddToWatchlist();
	const removeStock = useRemoveFromWatchlist();
	const addAlert = useAddPriceAlert();
	const removeAlert = useRemovePriceAlert();
	const reducedMotion = usePrefersReducedMotion();
	const [query, setQuery] = (0, import_react.useState)("");
	const [tick, setTick] = (0, import_react.useState)(0);
	const [prices, setPrices] = (0, import_react.useState)(null);
	const [alertForm, setAlertForm] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setPrices(Object.fromEntries((entries ?? []).map((e) => [e.symbol, getLTP(e.symbol)])));
	}, [entries, tick]);
	const watched = (0, import_react.useMemo)(() => new Set((entries ?? []).map((e) => e.symbol)), [entries]);
	const suggestions = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return STOCKS.filter((s) => !watched.has(s.symbol) && (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q))).slice(0, 6);
	}, [query, watched]);
	const ready = !isPending && prices !== null;
	function handleRefresh() {
		(entries ?? []).forEach((e) => refreshLTP(e.symbol));
		setTick((t) => t + 1);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Watchlist",
		subtitle: "Track stocks you care about at mock live prices. Set above/below price alerts and FinVerse flags them for you.",
		active: "Watchlist",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: handleRefresh,
			disabled: !ready,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", !reducedMotion && "transition-transform") }), "Refresh prices"]
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
						className: "flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2.5 shadow-tile focus-within:border-ring",
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
								className: "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
			!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4",
				children: [0, 1].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" }, i))
			}) : (entries ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Your watchlist is empty",
				body: "Add stocks from the 41-stock FinVerse universe and set price alerts so you never miss a move.",
				actionLabel: "Try adding RELIANCE",
				onAction: () => handleAdd("RELIANCE")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4",
				children: (entries ?? []).map((entry) => {
					const stock = getStock(entry.symbol);
					const ltp = prices?.[entry.symbol] ?? stock?.pricePaise ?? 0;
					const change = dayChange(genHistory(entry.symbol, 2));
					const up = change.changePaise >= 0;
					const form = alertForm[entry.symbol] ?? {
						kind: "above",
						price: ""
					};
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
						title: entry.symbol,
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": `Remove ${entry.symbol} from watchlist`,
							onClick: () => removeStock.mutateRemove(entry.symbol, {
								onSuccess: () => toast.success(`${entry.symbol} removed.`),
								onError: () => toast.error("Couldn't remove — try again.")
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/stocks/$symbol",
								params: { symbol: entry.symbol },
								className: "font-bold text-primary hover:underline",
								children: entry.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [stock?.name ?? entry.symbol, stock ? ` · ${stock.sector}` : ""]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xl font-black tabular-nums text-foreground",
									children: formatINR(ltp)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("flex items-center justify-end gap-1 text-xs font-bold tabular-nums", up ? "text-success" : "text-destructive"),
									children: [
										up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "size-3.5" }),
										up ? "+" : "−",
										"₹",
										Math.abs(Math.round(change.changePaise / 100)).toLocaleString("en-IN"),
										" (",
										up ? "+" : "",
										change.changePct.toFixed(2),
										"%)"
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-t border-border/60 pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }),
										" Price alerts (",
										entry.alerts.length,
										")"
									]
								}),
								entry.alerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mb-3 grid gap-2",
									children: entry.alerts.map((a) => {
										const met = isAlertMet(a, ltp);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: cn("flex items-center justify-between gap-2 rounded-lg border px-3 py-2", met ? "border-success/50 bg-success-soft/60" : "border-border"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-2 text-sm",
												children: [
													met ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "size-4 shrink-0 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 shrink-0 text-muted-foreground" }),
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
												onClick: () => removeAlert.mutateRemoveAlert(entry.symbol, a.id, { onError: () => toast.error("Couldn't delete the alert.") }),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-destructive" })
											})]
										}, a.id);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-end gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "sr-only",
											htmlFor: `alert-kind-${entry.symbol}`,
											children: "Alert direction"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.kind,
											onValueChange: (v) => setAlertForm((f) => ({
												...f,
												[entry.symbol]: {
													...form,
													kind: v
												}
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: `alert-kind-${entry.symbol}`,
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
											htmlFor: `alert-price-${entry.symbol}`,
											children: "Alert price in rupees"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: `alert-price-${entry.symbol}`,
											inputMode: "decimal",
											placeholder: "e.g. 1600",
											value: form.price,
											onChange: (e) => setAlertForm((f) => ({
												...f,
												[entry.symbol]: {
													...form,
													price: e.target.value
												}
											})),
											className: "w-32"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											onClick: () => handleAddAlert(entry.symbol),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Set alert"]
										})
									]
								})
							]
						})]
					}, entry.symbol);
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
