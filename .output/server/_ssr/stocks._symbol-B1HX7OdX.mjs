import { i as __toESM } from "../_runtime.mjs";
import { i as formatINRShort, r as formatINR, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as RefreshCw, R as Plus, Ut as Bot, tn as ArrowLeft, y as Star } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as Skeleton } from "./skeleton-nciDIfnI.mjs";
import { t as Badge } from "./badge-EsPiNyuV.mjs";
import { n as CardContent, t as Card } from "./card-CxSeJsg6.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { a as mcapBandOf, i as getStock, o as sectorMedianPE, s as sectorMedianReturn, t as MCAP_BANDS } from "./data-_btm06jU.mjs";
import { a as sliceRange, i as refreshLTP, n as genHistory, r as getLTP, t as dayChange } from "./history-CDM6LAry.mjs";
import { t as EmptyState } from "./shared-BnPbPY9-.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as HoldingDialog } from "./HoldingDialog-CzBvX_Lm.mjs";
import { a as XAxis, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { t as Route } from "./stocks._symbol-DbLGcUOR.mjs";
import { t as useWatchlist } from "./useWatchlist-DzVJMCgj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stocks._symbol-B1HX7OdX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RANGES = [
	"1M",
	"6M",
	"1Y"
];
/** "2026-09-14" -> "14 Sep". Parsed manually to avoid TZ shifts. */
function shortDate(iso) {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	const [, m, d] = iso.split("-").map(Number);
	return `${d} ${months[m - 1]}`;
}
/** Deterministic rule-based analysis — explainable, no model involved. */
function analyze(stock) {
	const medianPE = sectorMedianPE(stock.sector);
	const medianRet = sectorMedianReturn(stock.sector);
	const points = [];
	const ratio = medianPE > 0 ? stock.pe / medianPE : 1;
	points.push(ratio < .8 ? {
		title: "Valuation",
		verdict: "positive",
		verdictLabel: "Attractive vs peers",
		evidence: [`P/E ${stock.pe.toFixed(1)} is ${((1 - ratio) * 100).toFixed(0)}% below the ${stock.sector} sector median of ${medianPE.toFixed(1)} — you pay less per rupee of earnings than peers.`, `EPS of ${formatINR(stock.epsPaise)} with a ${stock.divYield.toFixed(2)}% dividend yield adds cash return on top of price.`],
		confidence: "Medium"
	} : ratio > 1.25 ? {
		title: "Valuation",
		verdict: "negative",
		verdictLabel: "Expensive vs peers",
		evidence: [`P/E ${stock.pe.toFixed(1)} is ${((ratio - 1) * 100).toFixed(0)}% above the ${stock.sector} sector median of ${medianPE.toFixed(1)} — high growth expectations are already priced in.`, `At this multiple the stock needs sustained earnings growth to justify the price.`],
		confidence: "Medium"
	} : {
		title: "Valuation",
		verdict: "neutral",
		verdictLabel: "Fairly valued vs peers",
		evidence: [`P/E ${stock.pe.toFixed(1)} sits within ±25% of the ${stock.sector} sector median (${medianPE.toFixed(1)}).`, `Dividend yield ${stock.divYield.toFixed(2)}% provides a modest income component.`],
		confidence: "High"
	});
	const r = stock.oneYReturnPct;
	points.push(r > medianRet + 5 && r > 10 ? {
		title: "Momentum",
		verdict: "positive",
		verdictLabel: "Strong momentum",
		evidence: [`1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% beats the ${stock.sector} sector median of ${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% by ${(r - medianRet).toFixed(1)} points.`, `The stock is closer to its 52-week high (${formatINR(stock.high52wPaise)}) than its low (${formatINR(stock.low52wPaise)}).`],
		confidence: "Medium"
	} : r < medianRet - 5 || r < -10 ? {
		title: "Momentum",
		verdict: "negative",
		verdictLabel: "Weak momentum",
		evidence: [`1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% trails the ${stock.sector} sector median of ${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}% — the market has been de-rating it.`, `Weak momentum can persist; check whether earnings, not just sentiment, are recovering before averaging down.`],
		confidence: "Medium"
	} : {
		title: "Momentum",
		verdict: "neutral",
		verdictLabel: "Moving with peers",
		evidence: [`1-year return ${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(1)}% is within 5 points of the ${stock.sector} sector median (${medianRet >= 0 ? "+" : "−"}${Math.abs(medianRet).toFixed(1)}%) — no strong trend either way.`],
		confidence: "High"
	});
	const roe = stock.roe;
	const de = stock.debtEquity;
	if (roe !== null && roe >= 15 && (de === null || de <= 1)) points.push({
		title: "Quality",
		verdict: "positive",
		verdictLabel: "High-quality business",
		evidence: [`ROE of ${roe.toFixed(1)}% shows strong returns on shareholder capital.`, de === null ? `Leverage is not meaningful for this ${stock.sector} business.` : `Debt-to-equity of ${de.toFixed(2)} keeps balance-sheet risk low.`],
		confidence: "High"
	});
	else if (roe !== null && roe < 8 || de !== null && de > 1.5) {
		const flags = [];
		if (roe !== null && roe < 8) flags.push(`ROE of ${roe.toFixed(1)}% is below the 8% quality bar — capital is not compounding well.`);
		if (de !== null && de > 1.5) flags.push(`Debt-to-equity of ${de.toFixed(2)} is elevated — interest costs can eat earnings in a downturn.`);
		points.push({
			title: "Quality",
			verdict: "negative",
			verdictLabel: "Quality flags",
			evidence: flags,
			confidence: "Medium"
		});
	} else {
		const parts = [];
		if (roe !== null) parts.push(`ROE of ${roe.toFixed(1)}% is decent but below the 15% high-quality bar.`);
		else parts.push(`ROE is not disclosed for this ${stock.sector} listing, so quality is judged on leverage alone.`);
		if (de !== null) parts.push(`Debt-to-equity of ${de.toFixed(2)} is manageable.`);
		points.push({
			title: "Quality",
			verdict: "neutral",
			verdictLabel: "Average quality",
			evidence: parts,
			confidence: "Medium"
		});
	}
	return points;
}
var VERDICT_STYLE = {
	positive: "bg-success-soft text-success",
	neutral: "bg-tint text-primary-dark",
	negative: "bg-destructive/10 text-destructive"
};
function Fundamentals({ stock }) {
	const band = mcapBandOf(stock.marketCapCr);
	const items = [
		["P/E ratio", stock.pe.toFixed(1)],
		["EPS", formatINR(stock.epsPaise)],
		["ROE", stock.roe === null ? "—" : `${stock.roe.toFixed(1)}%`],
		["Debt / Equity", stock.debtEquity === null ? "—" : stock.debtEquity.toFixed(2)],
		["Market cap", `${formatINRShort(stock.marketCapCr * 1e9)} (${MCAP_BANDS[band].label})`],
		["Dividend yield", `${stock.divYield.toFixed(2)}%`],
		["52-week high", formatINR(stock.high52wPaise)],
		["52-week low", formatINR(stock.low52wPaise)],
		["1-year return", `${stock.oneYReturnPct >= 0 ? "+" : "−"}${Math.abs(stock.oneYReturnPct).toFixed(1)}%`]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
		children: items.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border bg-surface-soft px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-bold text-primary-dark tabular-nums",
				children: value
			})]
		}, label))
	});
}
function StockDetailPage() {
	const { symbol } = Route.useParams();
	const sym = symbol.toUpperCase();
	const stock = getStock(sym);
	const { isWatched, toggle } = useWatchlist();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [range, setRange] = (0, import_react.useState)("1Y");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const reducedMotion = usePrefersReducedMotion();
	const [ltp, setLtp] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setMounted(true), []);
	(0, import_react.useEffect)(() => {
		if (stock) setLtp(getLTP(sym));
	}, [stock, sym]);
	const history = (0, import_react.useMemo)(() => genHistory(sym), [sym]);
	const visible = (0, import_react.useMemo)(() => sliceRange(history, range), [history, range]);
	const change = (0, import_react.useMemo)(() => dayChange(history), [history]);
	if (!stock) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Stock not found",
		active: "Screener",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: `No data for "${symbol}"`,
			body: "This symbol isn't in the FinVerse demo dataset. Try the screener to browse the 40 covered stocks."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/screener",
				className: "text-sm font-bold text-primary hover:underline",
				children: "← Back to screener"
			})
		})]
	});
	const analysis = analyze(stock);
	const watched = isWatched(sym);
	const displayPrice = ltp ?? stock.pricePaise;
	const posInRange = stock.high52wPaise > stock.low52wPaise ? Math.max(0, Math.min(100, (displayPrice - stock.low52wPaise) / (stock.high52wPaise - stock.low52wPaise) * 100)) : 50;
	function handleRefresh() {
		setLtp(refreshLTP(sym));
	}
	const chartData = visible.map((p) => ({
		...p,
		label: shortDate(p.date),
		rupees: p.closePaise / 100
	}));
	const stroke = displayPrice >= (visible[0]?.closePaise ?? displayPrice) ? "var(--success)" : "var(--destructive)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: stock.name,
		active: "Screener",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			"aria-pressed": watched,
			"aria-label": watched ? "Remove from watchlist" : "Add to watchlist",
			onClick: () => toggle(sym),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: watched ? "size-4 fill-amber-400 text-amber-400" : "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: watched ? "Watching" : "Watch"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			onClick: () => setDialogOpen(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add to portfolio"]
		})] }),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/screener",
						className: "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Screener"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						children: stock.symbol
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: stock.sector
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [ltp === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-44" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-4xl font-black text-primary-dark tabular-nums",
						children: formatINR(ltp)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleRefresh,
						className: "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary",
						"aria-label": "Refresh price",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 text-sm font-bold tabular-nums", change.changePaise >= 0 ? "text-success" : "text-destructive"),
					children: [
						change.changePaise >= 0 ? "+" : "−",
						" ",
						formatINR(Math.abs(change.changePaise)),
						" (",
						change.changePaise >= 0 ? "+" : "−",
						Math.abs(change.changePct).toFixed(2),
						"% today)"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatINR(stock.low52wPaise) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "52-week range"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatINR(stock.high52wPaise) })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-1.5 h-2 rounded-full bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-y-0 left-0 rounded-full bg-primary/40",
							style: { width: `${posInRange}%` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary-dark",
							style: { left: `${posInRange}%` }
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-lg border border-border bg-card p-5 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-primary-dark",
							children: "Price history"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1",
							role: "tablist",
							"aria-label": "Chart range",
							children: RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								role: "tab",
								"aria-selected": range === r,
								onClick: () => setRange(r),
								className: cn("rounded-md px-3 py-1.5 text-xs font-bold transition-colors", range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"),
								children: r
							}, r))
						})]
					}),
					mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: chartData,
								margin: {
									top: 5,
									right: 8,
									bottom: 0,
									left: 8
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "priceFill",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: stroke,
											stopOpacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: stroke,
											stopOpacity: .02
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tickLine: false,
										axisLine: false,
										tick: {
											fontSize: 11,
											fill: "var(--muted-foreground)"
										},
										minTickGap: 40
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										domain: ["auto", "auto"],
										tickLine: false,
										axisLine: false,
										tick: {
											fontSize: 11,
											fill: "var(--muted-foreground)"
										},
										tickFormatter: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
										width: 70
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (v) => [v !== void 0 ? `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "", "Close"],
										labelFormatter: (label) => label,
										contentStyle: {
											borderRadius: 8,
											fontSize: 13
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "rupees",
										stroke,
										strokeWidth: 2,
										fill: "url(#priceFill)",
										isAnimationActive: !reducedMotion
									})
								]
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Demo series generated deterministically per stock — not live market data."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-lg border border-border bg-card p-5 shadow-card sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-base font-bold text-primary-dark",
					children: "Fundamentals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fundamentals, { stock })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-5 shadow-card sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-md bg-tint",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4.5 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-primary-dark",
							children: "AI analysis"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-5 text-xs text-muted-foreground",
						children: "Rule-based reasoning over the figures above. Transparent by design — every claim cites its evidence."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 lg:grid-cols-3",
						children: analysis.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-black uppercase tracking-wide text-primary-dark",
											children: a.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: cn("whitespace-nowrap", VERDICT_STYLE[a.verdict]),
											children: a.verdictLabel
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-3 grid gap-2.5",
										children: a.evidence.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex gap-2 text-[13px] leading-5.5 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }), e]
										}, i))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs font-semibold text-muted-foreground",
										children: ["Confidence: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground",
											children: a.confidence
										})]
									})
								]
							})
						}, a.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 rounded-md bg-tint px-4 py-3 text-xs leading-5 text-muted-foreground",
						children: "This is automated analysis of demo data for a college project — analysis, not financial advice. Real investing decisions should consider your full financial picture and, where needed, a registered investment adviser."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setDialogOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
						" Add ",
						sym,
						" to portfolio"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/portfolio",
					className: "text-sm font-bold text-primary hover:underline",
					children: "View portfolio →"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldingDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				defaultSymbol: sym
			})
		]
	});
}
//#endregion
export { StockDetailPage as component };
