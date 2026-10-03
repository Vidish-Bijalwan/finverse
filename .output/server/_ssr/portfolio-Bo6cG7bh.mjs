import { i as __toESM } from "../_runtime.mjs";
import { t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as ChartSkeleton } from "./shared-CjfpD6Q-.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { H as Plus, J as Pencil, L as RefreshCw, U as Play, X as Pause, h as Trash2 } from "../_libs/lucide-react.mjs";
import { n as NumberDisplay, t as EmptyState } from "./EmptyState-DJbWsGIR.mjs";
import { i as getStock, r as STOCKS } from "./data-_btm06jU.mjs";
import { a as refreshLTP, i as getLTP, n as dayChange, r as genHistory } from "./history-mUmaAsie.mjs";
import { t as Pill$1 } from "./sheet-B4iSeRDW.mjs";
import { a as holdingTotals, o as longDateLabel, s as portfolioTotals, u as todayReturnPaise } from "./portfolio-math-C7WOnwVa.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-_sQy6YG6.mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { O as useToggleRecurringRule, P as useUpdateHolding, S as useHoldings, T as useRecurringRules, k as useTransactions, s as useAddHolding, v as useDeleteHolding } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BhFA3ek8.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BG_ycP85.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { r as parseOrderNote, t as firstBuyDateBySymbol } from "./investments-rsCq6eP0.mjs";
import { t as ErrorState } from "./ErrorState-Bx1fnWBD.mjs";
import { t as MarketRow } from "./MarketRow-Ds6Mj7Mj.mjs";
import { t as SearchDropdown } from "./SearchDropdown-C7YcdvnR.mjs";
import { t as PullToRefresh } from "./PullToRefresh-l_u7bH81.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DqLny9o-.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as SipSheet } from "./SipSheet-BtZmmlnJ.mjs";
import { t as useWatchlist } from "./useWatchlist-CrOaZuZW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-Bo6cG7bh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Default strip: 12 largest Indian stocks by market cap. */
var DEFAULT_SYMBOLS = [...STOCKS].sort((a, b) => b.marketCapCr - a.marketCapCr).slice(0, 12).map((s) => s.symbol);
/**
* Horizontally scrollable market ticker: symbol + simulated LTP + day-change
* chip. Prices come from the seeded demo feed (`getLTP`) — the strip is always
* labeled "Simulated prices", never presented as live market data.
*
* Prices refresh every 5s; changed rows flash green/red for 300ms and the
* price glides to its new value via NumberDisplay's `animate` prop (both
* skipped for prefers-reduced-motion).
*
* The strip is a plain horizontally-scrollable row — each symbol appears
* exactly once. Tap/click a symbol → `/stocks/$symbol`.
*/
function TickerStrip({ symbols, className }) {
	const reducedMotion = usePrefersReducedMotion();
	const [tick, setTick] = (0, import_react.useState)(0);
	const [flash, setFlash] = (0, import_react.useState)({});
	const prevPrices = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setTick((t) => t + 1), 5e3);
		return () => window.clearInterval(id);
	}, []);
	const items = (0, import_react.useMemo)(() => {
		return (symbols ?? DEFAULT_SYMBOLS).flatMap((sym) => {
			const stock = STOCKS.find((s) => s.symbol === sym);
			if (!stock) return [];
			const change = dayChange(genHistory(stock.symbol, 2));
			return [{
				symbol: stock.symbol,
				name: stock.name,
				pricePaise: getLTP(stock.symbol),
				changePct: change.changePct
			}];
		});
	}, [symbols, tick]);
	(0, import_react.useEffect)(() => {
		const next = {};
		const f = {};
		for (const it of items) {
			next[it.symbol] = it.pricePaise;
			const prev = prevPrices.current[it.symbol];
			if (prev !== void 0 && prev !== it.pricePaise && !reducedMotion) f[it.symbol] = it.pricePaise > prev ? "up" : "down";
		}
		prevPrices.current = next;
		if (Object.keys(f).length === 0) return;
		setFlash(f);
		const t = window.setTimeout(() => setFlash({}), 300);
		return () => window.clearTimeout(t);
	}, [items, reducedMotion]);
	/**
	* One row, each symbol exactly once. (A previous marquee implementation
	* rendered the list twice for a seamless loop — visually the same 12 stocks
	* appeared twice, which read as a bug. The strip is now a plain
	* horizontally-scrollable row.)
	*/
	const row = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex w-max shrink-0 items-center",
		children: items.map((it) => {
			const up = it.changePct >= 0;
			const f = flash[it.symbol];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/stocks/$symbol",
				params: { symbol: it.symbol },
				"aria-label": `${it.name} (${it.symbol}), simulated price, ${up ? "up" : "down"} ${Math.abs(it.changePct).toFixed(2)} percent`,
				className: cn("flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5", "transition-colors duration-300 hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-ring", f === "up" && "bg-gain/25", f === "down" && "bg-loss/25"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-foreground",
						children: it.symbol
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
						paise: it.pricePaise,
						animate: true,
						className: "text-xs font-semibold text-muted-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums", up ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"),
						children: [
							up ? "+" : "−",
							Math.abs(it.changePct).toFixed(2),
							"%"
						]
					})
				]
			}, it.symbol);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Market ticker — simulated prices",
		className: cn("rounded-[14px] border border-border bg-card shadow-card", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1 overflow-x-auto px-2 py-2",
			children: row()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "border-t border-border/60 px-4 py-1.5 text-[11px] font-medium text-muted-foreground",
			children: "Simulated prices — not live market data. For learning, not trading."
		})]
	});
}
/**
* Next roving-tab index for an arrow-key direction. Wraps at both ends
* (ARIA tablist guidance: arrow keys cycle through tabs).
*/
function roveIndex(current, count, dir) {
	if (count <= 0) return -1;
	return (current + dir + count) % count;
}
/**
* Segmented tabs with a sliding indicator (CSS transform layout animation)
* and WAI-ARIA arrow-key navigation (Left/Right/Home/End with wrapping).
* The indicator tracks the selected tab's measured offset/width.
*/
function Tabs({ tabs, value, onChange, ariaLabel, className }) {
	const listRef = (0, import_react.useRef)(null);
	const tabRefs = (0, import_react.useRef)([]);
	const [indicator, setIndicator] = (0, import_react.useState)(null);
	const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === value));
	(0, import_react.useLayoutEffect)(() => {
		const measure = () => {
			const el = tabRefs.current[activeIndex];
			const list = listRef.current;
			if (!el || !list) return;
			setIndicator({
				left: el.offsetLeft,
				width: el.offsetWidth
			});
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [activeIndex, tabs]);
	const focusTab = (index, dir = 1) => {
		let i = index;
		for (let step = 0; step < tabs.length; step++) {
			const tab = tabs[i];
			if (tab && !tab.disabled) {
				onChange(tab.id);
				tabRefs.current[i]?.focus();
				return;
			}
			i = roveIndex(i, tabs.length, dir);
		}
	};
	const onKeyDown = (e) => {
		let next = null;
		let dir = 1;
		if (e.key === "ArrowRight") next = roveIndex(activeIndex, tabs.length, 1);
		else if (e.key === "ArrowLeft") {
			dir = -1;
			next = roveIndex(activeIndex, tabs.length, -1);
		} else if (e.key === "Home") next = 0;
		else if (e.key === "End") next = tabs.length - 1;
		if (next === null) return;
		e.preventDefault();
		focusTab(next, dir);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: listRef,
		role: "tablist",
		"aria-label": ariaLabel,
		onKeyDown,
		className: cn("relative inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-muted p-1 scrollbar-none", className),
		children: [indicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute top-1 bottom-1 left-0 rounded-full bg-card shadow-tile transition-[transform,width] duration-200 ease-out",
			style: {
				transform: `translateX(${indicator.left}px)`,
				width: indicator.width
			}
		}), tabs.map((tab, i) => {
			const selected = tab.id === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				ref: (el) => {
					tabRefs.current[i] = el;
				},
				type: "button",
				role: "tab",
				id: `fv-tab-${tab.id}`,
				"aria-selected": selected,
				"aria-controls": `fv-tabpanel-${tab.id}`,
				disabled: tab.disabled,
				tabIndex: selected ? 0 : -1,
				onClick: () => onChange(tab.id),
				className: cn("relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors", selected ? "text-foreground" : "text-muted-foreground hover:text-foreground", tab.disabled && "cursor-not-allowed opacity-50"),
				children: [tab.label, tab.badge != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary tabular-nums",
					children: tab.badge
				})]
			}, tab.id);
		})]
	});
}
/**
* Add / edit a portfolio holding. Amounts entered in ₹, stored as paise.
* In add mode the symbol select defaults to `defaultSymbol` (stock detail page)
* or the first stock; in edit mode the symbol is fixed.
*/
function HoldingDialog({ open, onOpenChange, holding, defaultSymbol }) {
	const isEdit = !!holding;
	const addHolding = useAddHolding();
	const updateHolding = useUpdateHolding();
	const [symbol, setSymbol] = (0, import_react.useState)(defaultSymbol ?? holding?.symbol ?? STOCKS[0].symbol);
	const [qty, setQty] = (0, import_react.useState)(String(holding?.qty ?? ""));
	const [avgPrice, setAvgPrice] = (0, import_react.useState)(holding ? String((holding.avgPricePaise / 100).toFixed(2)) : "");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setSymbol(holding?.symbol ?? defaultSymbol ?? STOCKS[0].symbol);
			setQty(holding ? String(holding.qty) : "");
			setAvgPrice(holding ? String((holding.avgPricePaise / 100).toFixed(2)) : "");
			setError("");
			addHolding.reset();
			updateHolding.reset();
		}
	}, [open]);
	const qtyNum = Number(qty);
	const priceNum = Number(avgPrice);
	const valid = symbol.length > 0 && Number.isFinite(qtyNum) && qtyNum > 0 && Number.isFinite(priceNum) && priceNum > 0;
	const pending = addHolding.isPending || updateHolding.isPending;
	function handleSave() {
		if (!valid || pending) return;
		const avgPricePaise = Math.round(priceNum * 100);
		if (isEdit && holding) updateHolding.mutate({
			id: holding.id,
			patch: {
				qty: qtyNum,
				avgPricePaise
			}
		}, {
			onSuccess: () => {
				toast.success(`Holding updated · ${holding.symbol} × ${qtyNum}`);
				onOpenChange(false);
			},
			onError: (e) => {
				setError(e.message);
				toast.error("Couldn't save — try again.");
			}
		});
		else addHolding.mutate({
			symbol: symbol.toUpperCase(),
			qty: qtyNum,
			avgPricePaise
		}, {
			onSuccess: () => {
				toast.success(`Holding added · ${symbol.toUpperCase()} × ${qtyNum} · ${formatINR(Math.round(qtyNum * priceNum * 100))}`);
				onOpenChange(false);
			},
			onError: (e) => {
				setError(e.message);
				toast.error("Couldn't save — try again.");
			}
		});
	}
	const selected = getStock(symbol);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit holding" : "Add to portfolio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isEdit ? `Update your ${holding?.symbol} position.` : "Record shares you own — quantity and the average price you paid." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "holding-symbol",
									children: "Stock"
								}),
								isEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "holding-symbol",
									value: holding?.symbol,
									disabled: true
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: symbol,
									onValueChange: setSymbol,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "holding-symbol",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a stock" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "max-h-72",
										children: STOCKS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: s.symbol,
											children: [
												s.symbol,
												" · ",
												s.name
											]
										}, s.symbol))
									})]
								}),
								selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["Current demo price: ", formatINR(getLTP(selected.symbol))]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "holding-qty",
									children: "Quantity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "holding-qty",
									inputMode: "decimal",
									placeholder: "10",
									value: qty,
									onChange: (e) => setQty(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "holding-price",
									children: "Avg price (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "holding-price",
									inputMode: "decimal",
									placeholder: "1,520.00",
									value: avgPrice,
									onChange: (e) => setAvgPrice(e.target.value.replace(/,/g, ""))
								})]
							})]
						}),
						valid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-md bg-tint px-3 py-2 text-xs font-medium text-primary-dark",
							children: ["Invested value: ", formatINR(Math.round(qtyNum * priceNum * 100))]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-destructive",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					disabled: pending,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSave,
					disabled: !valid || pending,
					children: pending ? "Saving…" : isEdit ? "Save changes" : "Add holding"
				})] })
			]
		})
	});
}
var PortfolioChart = (0, import_react.lazy)(() => import("./PortfolioChart-C37f6-kZ.mjs").then((m) => ({ default: m.PortfolioChart })));
var DonutAllocation = (0, import_react.lazy)(() => import("./DonutAllocation-D9ZaneBR.mjs").then((m) => ({ default: m.DonutAllocation })));
/** "+₹4,210 (+3.24%)" / "−₹380 (−0.41%)" in gain/loss tokens. */
function ReturnsLine({ paise, pct }) {
	const up = paise >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("font-bold tabular-nums", up ? "text-gain" : "text-loss"),
		children: [
			up ? "+" : "−",
			formatINR(Math.abs(paise)),
			" (",
			up ? "+" : "−",
			Math.abs(pct).toFixed(2),
			"%)"
		]
	});
}
/** "+₹380" / "−₹380" in gain/loss tokens. */
function SignedAmount({ paise, className }) {
	const up = paise >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("font-bold tabular-nums", up ? "text-gain" : "text-loss", className),
		children: [up ? "+" : "−", formatINR(Math.abs(paise))]
	});
}
function PortfolioPage() {
	const navigate = useNavigate();
	const { data: holdings, isPending, isError, failureCount, refetch } = useHoldings();
	const { data: transactions } = useTransactions();
	const { data: recurringRules } = useRecurringRules();
	const toggleRule = useToggleRecurringRule();
	const deleteHolding = useDeleteHolding();
	const { watchlist, toggle: toggleWatch } = useWatchlist();
	const [tab, setTab] = (0, import_react.useState)("holdings");
	const [priceTick, setPriceTick] = (0, import_react.useState)(0);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(void 0);
	const [deleting, setDeleting] = (0, import_react.useState)(void 0);
	const [investOpen, setInvestOpen] = (0, import_react.useState)(false);
	const [investMode, setInvestMode] = (0, import_react.useState)("order");
	const [investQuery, setInvestQuery] = (0, import_react.useState)("");
	const [sipTarget, setSipTarget] = (0, import_react.useState)(null);
	const [prices, setPrices] = (0, import_react.useState)(null);
	const [chartsReady, setChartsReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setChartsReady(true);
	}, []);
	const [loadTimedOut, setLoadTimedOut] = (0, import_react.useState)(false);
	const [retryNonce, setRetryNonce] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!isPending) return;
		const t = window.setTimeout(() => setLoadTimedOut(true), 2e4);
		return () => window.clearTimeout(t);
	}, [
		isPending,
		failureCount,
		retryNonce
	]);
	function retryLoad() {
		setLoadTimedOut(false);
		setRetryNonce((n) => n + 1);
		refetch();
	}
	(0, import_react.useEffect)(() => {
		setPrices(Object.fromEntries((holdings ?? []).map((h) => [h.symbol, getLTP(h.symbol)])));
	}, [holdings, priceTick]);
	const priceOf = (0, import_react.useCallback)((symbol) => prices?.[symbol] ?? getStock(symbol)?.pricePaise ?? 0, [prices]);
	const rows = (0, import_react.useMemo)(() => (holdings ?? []).map((h) => {
		const stock = getStock(h.symbol);
		const ltp = priceOf(h.symbol);
		const totals = holdingTotals({
			symbol: h.symbol,
			qty: h.qty,
			avgPricePaise: h.avgPricePaise
		}, ltp);
		return {
			holding: h,
			stock,
			name: stock?.name ?? h.symbol,
			ltp,
			...totals
		};
	}), [holdings, priceOf]);
	const ready = !isPending;
	const totals = (0, import_react.useMemo)(() => portfolioTotals(rows), [rows]);
	/** Today's returns: value change between the last demo close and the
	*  current simulated LTP, summed across holdings. */
	const todayReturns = (0, import_react.useMemo)(() => rows.reduce((a, r) => {
		const daily = genHistory(r.holding.symbol, 22);
		const prevClose = daily.length > 1 ? daily[daily.length - 2].closePaise : r.ltp;
		return a + todayReturnPaise(r.holding.qty, r.ltp, prevClose);
	}, 0), [rows]);
	/** Simulated-brokerage orders, parsed from ledger notes. Every ledger row
	*  is an executed order — status is always the real "Executed". */
	const orders = (0, import_react.useMemo)(() => (transactions ?? []).map((t) => {
		const parsed = parseOrderNote(t.note);
		if (!parsed || t.category !== "investments") return null;
		if (!(t.tags ?? []).includes("simulated-brokerage")) return null;
		return {
			id: t.id,
			dateISO: t.dateISO,
			...parsed,
			pricePaise: parsed.qty > 0 ? Math.round(t.amountPaise / parsed.qty) : 0,
			amountPaise: t.amountPaise
		};
	}).filter((o) => o !== null), [transactions]);
	/** First recorded BUY date per symbol (ledger) — the portfolio chart
	*  starts each holding's history here instead of fabricating a past. */
	const firstBuyDateISOBySymbol = (0, import_react.useMemo)(() => {
		const map = firstBuyDateBySymbol(transactions ?? []);
		return Object.fromEntries(map.entries());
	}, [transactions]);
	/** Active SIP rules created through the SipSheet flow. */
	const sips = (0, import_react.useMemo)(() => (recurringRules ?? []).filter((r) => r.category === "investments" && /^SIP\s/i.test(r.note)), [recurringRules]);
	/** "Invest" entry: stock search over the demo dataset. In "order" mode it
	*  opens the stock detail page (orders placed there); in "sip" mode it
	*  opens the SipSheet for the picked stock. */
	const investGroups = (0, import_react.useMemo)(() => {
		const q = investQuery.trim().toLowerCase();
		const list = (q ? STOCKS.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)) : STOCKS.slice(0, 8)).slice(0, 12);
		return [{
			label: q ? "Stocks" : "Popular stocks",
			items: list.map((s) => ({
				id: s.symbol,
				title: s.symbol,
				subtitle: `${s.name} · ${s.sector}`,
				right: formatINR(getLTP(s.symbol)),
				rightTone: "neutral"
			}))
		}];
	}, [investQuery]);
	const [isRefreshing, setIsRefreshing] = (0, import_react.useState)(false);
	/**
	* "Refresh prices": jitter fresh demo LTPs AND refetch holdings from the
	* server query — shared by the header button and the PullToRefresh gesture.
	* Shows a spinner on the header button while the async refetch is in
	* flight; the button is hidden entirely when there are no holdings, so it
	* can never sit disabled with nothing to do.
	*/
	const refreshPortfolio = (0, import_react.useCallback)(async () => {
		setIsRefreshing(true);
		try {
			(holdings ?? []).forEach((h) => refreshLTP(h.symbol));
			setPriceTick((t) => t + 1);
			await refetch();
			toast.success("Prices refreshed.");
		} finally {
			setIsRefreshing(false);
		}
	}, [holdings, refetch]);
	function openInvest(mode = "order") {
		setInvestMode(mode);
		setInvestQuery("");
		setInvestOpen(true);
	}
	function pickInvestStock(symbol) {
		const stock = getStock(symbol);
		setInvestOpen(false);
		if (investMode === "sip") setSipTarget({
			symbol,
			name: stock?.name ?? symbol
		});
		else navigate({
			to: "/stocks/$symbol",
			params: { symbol }
		});
	}
	const tabs = [
		{
			id: "holdings",
			label: "Holdings",
			badge: rows.length
		},
		{
			id: "orders",
			label: "Orders",
			badge: orders.length
		},
		{
			id: "sips",
			label: "SIPs",
			badge: sips.length
		},
		{
			id: "watchlist",
			label: "Watchlist",
			badge: watchlist.length
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullToRefresh, {
		onRefresh: refreshPortfolio,
		className: "min-h-screen",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
			title: "Portfolio",
			subtitle: "Your investments, valued at simulated prices — not live market data.",
			active: "Portfolio",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => {
					refreshPortfolio();
				},
				disabled: !ready || isRefreshing,
				"aria-busy": isRefreshing,
				className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", isRefreshing && "animate-spin") }), "Refresh prices"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: () => openInvest("order"),
				className: pressable,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Invest"]
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerStrip, { className: "mb-5" }),
				isError || loadTimedOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					title: "Couldn't load your portfolio",
					body: loadTimedOut && !isError ? "Loading is taking too long — your connection may be stuck. Try again." : "Your holdings couldn't be fetched. Check your connection and try again.",
					onRetry: retryLoad
				}) : !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-80 rounded-2xl" })]
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Start investing",
					body: "Buy your first stock to build a portfolio — every order is simulated and posts to your shared ledger, so your money view always stays in sync.",
					actionLabel: "Explore investments",
					onAction: () => openInvest("order")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "Investment summary",
							className: "rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Current value"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
										variant: "neutral",
										size: "sm",
										children: "Simulated"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-4xl font-black text-primary-dark tabular-nums",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
										paise: totals.valuePaise,
										animate: true
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Total invested"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 text-lg font-bold text-primary-dark tabular-nums",
											children: formatINR(totals.investedPaise)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Total returns"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 text-lg",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReturnsLine, {
												paise: totals.pnlPaise,
												pct: totals.pnlPct
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Today's returns"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 text-lg",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedAmount, { paise: todayReturns })
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 border-t border-border pt-4",
									children: chartsReady && prices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
										fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-52" }),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioChart, {
											positions: rows.map((r) => ({
												symbol: r.holding.symbol,
												qty: r.holding.qty
											})),
											ltpBySymbol: prices,
											firstBuyDateISOBySymbol
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-52" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
							tabs: tabs.map((t) => ({
								...t,
								badge: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground tabular-nums",
									children: t.badge
								})
							})),
							value: tab,
							onChange: setTab,
							ariaLabel: "Portfolio sections"
						}),
						tab === "holdings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5",
							children: [chartsReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { className: "h-72" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutAllocation, { items: rows.map((r) => ({
									label: r.holding.symbol,
									paise: r.valuePaise
								})) })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-label": `Holdings (${rows.length})`,
								className: "rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "px-2 pt-1 text-base font-bold text-primary-dark",
									children: [
										"Holdings (",
										rows.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stock" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Qty"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Avg price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Current value"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Returns"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "w-20",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: "Actions"
											})
										})
									] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "cursor-pointer",
										onClick: () => navigate({
											to: "/stocks/$symbol",
											params: { symbol: r.holding.symbol }
										}),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground",
												children: r.holding.symbol
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "max-w-40 truncate text-xs text-muted-foreground sm:max-w-none",
												children: r.name
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right tabular-nums",
												children: r.qty
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right tabular-nums",
												children: formatINR(Math.round(r.holding.avgPricePaise))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-semibold tabular-nums",
												children: formatINR(r.valuePaise)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReturnsLine, {
													paise: r.pnlPaise,
													pct: r.pnlPct
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center justify-end gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													"aria-label": `Edit ${r.holding.symbol}`,
													onClick: (e) => {
														e.stopPropagation();
														setEditing(r.holding);
														setDialogOpen(true);
													},
													className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													"aria-label": `Remove ${r.holding.symbol}`,
													onClick: (e) => {
														e.stopPropagation();
														setDeleting(r.holding);
													},
													className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
												})]
											}) })
										]
									}, r.holding.id)) })] })
								})]
							})]
						}),
						tab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "Orders",
							className: "rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "px-2 pt-1 text-base font-bold text-primary-dark",
									children: [
										"Orders (",
										orders.length,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 px-2 text-xs text-muted-foreground",
									children: "Every order fills instantly at simulated prices and posts to your shared ledger."
								}),
								orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
										title: "No orders yet",
										body: "Your simulated BUY and SELL orders will appear here.",
										actionLabel: "Explore investments",
										onAction: () => openInvest("order")
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Order" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Qty × price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Amount"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Status"
										})
									] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "cursor-pointer",
										onClick: () => navigate({
											to: "/stocks/$symbol",
											params: { symbol: o.symbol }
										}),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "whitespace-nowrap text-muted-foreground",
												children: longDateLabel(o.dateISO)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
													variant: o.side === "buy" ? "gain" : "loss",
													size: "sm",
													children: o.side === "buy" ? "Buy" : "Sell"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-foreground",
													children: o.symbol
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "text-right whitespace-nowrap tabular-nums",
												children: [
													o.qty,
													" × ",
													formatINR(o.pricePaise)
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-semibold tabular-nums",
												children: formatINR(o.amountPaise)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
													variant: "neutral",
													size: "sm",
													children: "Executed"
												})
											})
										]
									}, o.id)) })] })
								})
							]
						}),
						tab === "sips" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "SIPs",
							className: "rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 px-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-base font-bold text-primary-dark",
									children: [
										"SIPs (",
										sips.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: () => openInvest("sip"),
									className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Start SIP"]
								})]
							}), sips.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									title: "No SIPs yet",
									body: "Automate investing with a weekly or monthly simulated SIP.",
									actionLabel: "Start a SIP",
									onAction: () => openInvest("sip")
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 grid gap-2",
								children: sips.map((s) => {
									const symbol = /^SIP\s+([A-Z0-9.]+)/i.exec(s.note)?.[1]?.toUpperCase() ?? "";
									const stock = symbol ? getStock(symbol) : void 0;
									const paused = s.isPaused;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-bold text-foreground",
													children: [symbol || "SIP", stock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "ml-2 truncate text-xs font-normal text-muted-foreground",
														children: stock.name
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-0.5 text-xs text-muted-foreground tabular-nums",
													children: [
														formatINR(s.amountPaise),
														" ",
														s.frequency,
														" · started",
														" ",
														longDateLabel(s.startDateISO)
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
												variant: paused ? "neutral" : "gain",
												size: "sm",
												dot: true,
												children: paused ? "Paused" : "Active"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												size: "sm",
												onClick: () => toggleRule.mutate({
													id: s.id,
													isPaused: !paused
												}, { onError: () => toast.error("Couldn't update the SIP — try again.") }),
												disabled: toggleRule.isPending,
												className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
												children: [paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), paused ? "Resume" : "Pause"]
											})
										]
									}, s.id);
								})
							})]
						}),
						tab === "watchlist" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "Watchlist",
							className: "rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "px-2 pt-1 text-base font-bold text-primary-dark",
								children: [
									"Watchlist (",
									watchlist.length,
									")"
								]
							}), watchlist.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									title: "Your watchlist is empty",
									body: "Star stocks to track them here.",
									actionLabel: "Explore investments",
									onAction: () => openInvest("order")
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 grid gap-1",
								children: watchlist.map((symbol) => {
									const name = getStock(symbol)?.name ?? symbol;
									const price = priceOf(symbol);
									const changePct = dayChange(genHistory(symbol, 22)).changePct;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketRow, {
										symbol,
										name,
										pricePaise: price,
										changePct,
										starred: true,
										onToggleStar: () => toggleWatch(symbol),
										onClick: () => navigate({
											to: "/stocks/$symbol",
											params: { symbol }
										})
									}) }, symbol);
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
					open: investOpen,
					onClose: () => setInvestOpen(false),
					title: investMode === "sip" ? "Start SIP" : "Invest",
					showCloseButton: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-1 pb-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pb-3 text-sm text-muted-foreground",
								children: investMode === "sip" ? "Pick a stock to start a simulated SIP in it." : "Pick a stock to open its detail page and place a simulated order."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDropdown, {
								groups: investGroups,
								value: investQuery,
								onChange: setInvestQuery,
								onSelect: (item) => pickInvestStock(item.id),
								placeholder: "Search stocks by name, symbol, sector…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pt-3 text-xs text-muted-foreground",
								children: "Prices shown are simulated — not live market data."
							})
						]
					})
				}),
				sipTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SipSheet, {
					open: !!sipTarget,
					onOpenChange: (o) => !o && setSipTarget(null),
					symbol: sipTarget.symbol,
					name: sipTarget.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldingDialog, {
					open: dialogOpen,
					onOpenChange: setDialogOpen,
					...editing ? { holding: editing } : {}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
					open: !!deleting,
					onOpenChange: (o) => !o && setDeleting(void 0),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Remove ",
						deleting?.symbol,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This deletes the holding from your portfolio. It cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						onClick: () => deleting && deleteHolding.mutate(deleting.id, {
							onSuccess: () => {
								toast.success(`${deleting.symbol} removed from portfolio`);
								setDeleting(void 0);
							},
							onError: () => toast.error("Couldn't remove — try again.")
						}),
						children: "Remove"
					})] })] })
				})
			]
		})
	});
}
//#endregion
export { PortfolioPage as component };
