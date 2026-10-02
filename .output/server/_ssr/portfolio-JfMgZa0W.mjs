import { i as __toESM } from "../_runtime.mjs";
import { i as formatINRShort, r as formatINR } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as RefreshCw, R as Plus, W as Pencil, p as Trash2 } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { S as useHoldings, v as useDeleteHolding } from "./hooks-CJFESX97.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CIWq0_JF.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CardContent, t as Card } from "./card-CxSeJsg6.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { i as getStock } from "./data-_btm06jU.mjs";
import { i as refreshLTP, r as getLTP } from "./history-CDM6LAry.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-TNME72yI.mjs";
import { n as PnlBadge, r as SectionCard, t as EmptyState } from "./shared-BnPbPY9-.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as HoldingDialog } from "./HoldingDialog-CzBvX_Lm.mjs";
import { d as ResponsiveContainer, f as Tooltip, l as Pie, n as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-JfMgZa0W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DONUT_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"var(--primary)",
	"var(--success)",
	"#8b5cf6"
];
/** Per-holding dividend-yield overrides (percent), persisted by holding id. */
var DIVIDEND_KEY = "finverse:dividends:v1";
function loadDividendYields() {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(DIVIDEND_KEY);
		const parsed = raw ? JSON.parse(raw) : {};
		if (typeof parsed !== "object" || parsed === null) return {};
		const out = {};
		for (const [k, v] of Object.entries(parsed)) if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100) out[k] = v;
		return out;
	} catch {
		return {};
	}
}
function useDividendYields() {
	const [yields, setYields] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => setYields(loadDividendYields()), []);
	const setYield = (holdingId, pct) => {
		if (!Number.isFinite(pct)) return;
		const clamped = Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
		setYields((prev) => {
			const next = {
				...prev,
				[holdingId]: clamped
			};
			try {
				window.localStorage.setItem(DIVIDEND_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	};
	return {
		yields,
		setYield
	};
}
function PortfolioPage() {
	const { data: holdings, isPending } = useHoldings();
	const deleteHolding = useDeleteHolding();
	const reducedMotion = usePrefersReducedMotion();
	const { yields: dividendYields, setYield: setDividendYield } = useDividendYields();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [priceTick, setPriceTick] = (0, import_react.useState)(0);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(void 0);
	const [deleting, setDeleting] = (0, import_react.useState)(void 0);
	const [prices, setPrices] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setMounted(true), []);
	(0, import_react.useEffect)(() => {
		setPrices(Object.fromEntries((holdings ?? []).map((h) => [h.symbol, getLTP(h.symbol)])));
	}, [holdings, priceTick]);
	const rows = (0, import_react.useMemo)(() => {
		if (!prices) return [];
		return (holdings ?? []).map((h) => {
			const stock = getStock(h.symbol);
			const ltp = prices[h.symbol] ?? stock?.pricePaise ?? 0;
			const invested = Math.round(h.qty * h.avgPricePaise);
			const value = Math.round(h.qty * ltp);
			const pnl = value - invested;
			return {
				holding: h,
				stock,
				name: stock?.name ?? h.symbol,
				ltp,
				invested,
				value,
				pnl,
				pnlPct: invested > 0 ? pnl / invested * 100 : 0
			};
		});
	}, [holdings, prices]);
	const ready = !isPending && prices !== null;
	const totals = (0, import_react.useMemo)(() => {
		const invested = rows.reduce((a, r) => a + r.invested, 0);
		const value = rows.reduce((a, r) => a + r.value, 0);
		const pnl = value - invested;
		return {
			invested,
			value,
			pnl,
			pnlPct: invested > 0 ? pnl / invested * 100 : 0
		};
	}, [rows]);
	/** Per-holding dividend yield (editable override, else the stock's listed
	*  yield, else 1%) and the expected annual dividend at the current LTP. */
	const dividendRows = (0, import_react.useMemo)(() => rows.map((r) => {
		const yieldPct = dividendYields[r.holding.id] ?? r.stock?.divYield ?? 1;
		const annualPaise = Math.round(r.holding.qty * r.ltp * (yieldPct / 100));
		return {
			...r,
			yieldPct,
			annualPaise
		};
	}), [rows, dividendYields]);
	const dividendTotals = (0, import_react.useMemo)(() => {
		const annual = dividendRows.reduce((a, r) => a + r.annualPaise, 0);
		return {
			annual,
			avgYieldPct: totals.value > 0 ? annual / totals.value * 100 : 0
		};
	}, [dividendRows, totals.value]);
	function handleRefresh() {
		rows.forEach((r) => refreshLTP(r.holding.symbol));
		setPriceTick((t) => t + 1);
	}
	function openAdd() {
		setEditing(void 0);
		setDialogOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Portfolio",
		subtitle: "Your equity holdings, valued at demo last-traded prices. Prices jitter slightly on refresh to simulate a live market feed.",
		active: "Portfolio",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: handleRefresh,
			disabled: !ready || rows.length === 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " Refresh prices"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			onClick: openAdd,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add holding"]
		})] }),
		children: [
			!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" }, i))
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No holdings yet",
				body: "Add the stocks you own — quantity and average buy price — and FinVerse will track their live value and profit or loss.",
				actionLabel: "Add your first holding",
				onAction: openAdd
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "shadow-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "pt-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Invested"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-2xl font-black text-primary-dark tabular-nums",
										children: formatINR(totals.invested)
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "shadow-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "pt-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Current value"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-2xl font-black text-primary-dark tabular-nums",
										children: formatINR(totals.value)
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "shadow-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "pt-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Total P&L"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlBadge, {
											pnlPaise: totals.pnl,
											pct: totals.pnlPct
										})
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-[1fr_1.6fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
							title: "Allocation by value",
							children: [mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-64",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
										data: rows,
										dataKey: "value",
										nameKey: "name",
										innerRadius: "58%",
										outerRadius: "88%",
										paddingAngle: 2,
										strokeWidth: 0,
										isAnimationActive: !reducedMotion,
										children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: DONUT_COLORS[i % DONUT_COLORS.length] }, r.holding.id))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (v, name) => [formatINR(typeof v === "number" ? v : 0), typeof name === "string" ? name : ""],
										contentStyle: {
											borderRadius: 8,
											fontSize: 13
										}
									})] })
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 grid gap-1.5",
								children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "size-2.5 rounded-full",
											style: { background: DONUT_COLORS[i % DONUT_COLORS.length] }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: r.holding.symbol
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground tabular-nums",
										children: [
											totals.value > 0 ? (r.value / totals.value * 100).toFixed(1) : "0.0",
											"% ·",
											" ",
											formatINRShort(r.value)
										]
									})]
								}, r.holding.id))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
							title: `Holdings (${rows.length})`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden overflow-x-auto md:block",
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
										children: "LTP"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Value"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "P&L"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-20" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/stocks/$symbol",
										params: { symbol: r.holding.symbol },
										className: "font-bold text-primary hover:underline",
										children: r.holding.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: r.name
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right tabular-nums",
										children: r.holding.qty
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right tabular-nums",
										children: formatINR(r.holding.avgPricePaise)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right tabular-nums",
										children: formatINR(r.ltp)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right font-semibold tabular-nums",
										children: formatINR(r.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlBadge, {
											pnlPaise: r.pnl,
											pct: r.pnlPct
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											"aria-label": `Edit ${r.holding.symbol}`,
											onClick: () => {
												setEditing(r.holding);
												setDialogOpen(true);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											"aria-label": `Delete ${r.holding.symbol}`,
											onClick: () => setDeleting(r.holding),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
										})]
									}) })
								] }, r.holding.id)) })] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 md:hidden",
								children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/stocks/$symbol",
											params: { symbol: r.holding.symbol },
											className: "font-bold text-primary",
											children: r.holding.symbol
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: r.name
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												"aria-label": `Edit ${r.holding.symbol}`,
												onClick: () => {
													setEditing(r.holding);
													setDialogOpen(true);
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												"aria-label": `Delete ${r.holding.symbol}`,
												onClick: () => setDeleting(r.holding),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "Qty × Avg"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: "font-semibold tabular-nums",
												children: [
													r.holding.qty,
													" × ",
													formatINR(r.holding.avgPricePaise)
												]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "LTP"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-semibold tabular-nums",
												children: formatINR(r.ltp)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "Value"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-semibold tabular-nums",
												children: formatINR(r.value)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-muted-foreground",
												children: "P&L"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlBadge, {
												pnlPaise: r.pnl,
												pct: r.pnlPct
											}) })] })
										]
									})]
								}) }, r.holding.id))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
						title: "Dividends",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-sm text-muted-foreground",
								children: "Expected annual dividends at current prices. Tap a yield to adjust it per holding — FinVerse remembers your overrides."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "shadow-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "pt-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Expected annual dividends"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-2xl font-black text-primary-dark tabular-nums",
											children: formatINR(dividendTotals.annual)
										})]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "shadow-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "pt-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Portfolio dividend yield"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1.5 text-2xl font-black text-primary-dark tabular-nums",
											children: [dividendTotals.avgYieldPct.toFixed(2), "%"]
										})]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stock" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Yield %"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Est. annual dividend"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: dividendRows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/stocks/$symbol",
										params: { symbol: r.holding.symbol },
										className: "font-bold text-primary hover:underline",
										children: r.holding.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: r.name
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "sr-only",
											htmlFor: `div-yield-${r.holding.id}`,
											children: `Dividend yield for ${r.holding.symbol}`
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: `div-yield-${r.holding.id}`,
											type: "number",
											min: 0,
											max: 100,
											step: .1,
											value: r.yieldPct,
											onChange: (e) => setDividendYield(r.holding.id, Number(e.target.value)),
											className: "w-20 rounded-md border border-input bg-background px-2 py-1 text-right text-sm tabular-nums text-foreground focus:border-ring focus:outline-none"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right font-semibold tabular-nums",
										children: formatINR(r.annualPaise)
									})
								] }, r.holding.id)) })] })
							})
						]
					})
				]
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
	});
}
//#endregion
export { PortfolioPage as component };
