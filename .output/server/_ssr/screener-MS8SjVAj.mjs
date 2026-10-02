import { i as __toESM } from "../_runtime.mjs";
import { i as formatINRShort, r as formatINR, t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Qt as ArrowUpDown, Xt as ArrowUp, k as Search, nn as ArrowDown, y as Star } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { t as Badge } from "./badge-EsPiNyuV.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as mcapBandOf, n as SECTORS, r as STOCKS, t as MCAP_BANDS } from "./data-_btm06jU.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-TNME72yI.mjs";
import { t as EmptyState } from "./shared-BnPbPY9-.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as Slider } from "./slider-CvgJFxyv.mjs";
import { t as useWatchlist } from "./useWatchlist-DzVJMCgj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screener-MS8SjVAj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SORT_COLUMNS = [
	{
		key: "pricePaise",
		label: "Price"
	},
	{
		key: "pe",
		label: "P/E"
	},
	{
		key: "marketCapCr",
		label: "MCap"
	},
	{
		key: "divYield",
		label: "Div yield"
	},
	{
		key: "oneYReturnPct",
		label: "1Y return"
	}
];
var MAX_PE = 100;
function ScreenerPage() {
	const navigate = useNavigate();
	const { isWatched, toggle } = useWatchlist();
	const [query, setQuery] = (0, import_react.useState)("");
	const [sectors, setSectors] = (0, import_react.useState)([]);
	const [maxPE, setMaxPE] = (0, import_react.useState)(MAX_PE);
	const [minYield, setMinYield] = (0, import_react.useState)("0");
	const [band, setBand] = (0, import_react.useState)("all");
	const [sortKey, setSortKey] = (0, import_react.useState)("marketCapCr");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	function toggleSector(sector) {
		setSectors((prev) => prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]);
	}
	function toggleSort(key) {
		if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortKey(key);
			setSortDir("desc");
		}
	}
	const results = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		const filtered = STOCKS.filter((s) => {
			if (q && !s.symbol.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) return false;
			if (sectors.length > 0 && !sectors.includes(s.sector)) return false;
			if (s.pe > maxPE) return false;
			if (s.divYield < Number(minYield)) return false;
			if (band !== "all" && mcapBandOf(s.marketCapCr) !== band) return false;
			return true;
		});
		const dir = sortDir === "asc" ? 1 : -1;
		return [...filtered].sort((a, b) => (a[sortKey] - b[sortKey]) * dir);
	}, [
		query,
		sectors,
		maxPE,
		minYield,
		band,
		sortKey,
		sortDir
	]);
	function openStock(symbol) {
		navigate({
			to: "/stocks/$symbol",
			params: { symbol }
		});
	}
	const filterCount = sectors.length + (maxPE < MAX_PE ? 1 : 0) + (minYield !== "0" ? 1 : 0) + (band !== "all" ? 1 : 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Stock Screener",
		subtitle: "Filter 40 Indian stocks by sector, valuation, dividend yield and market-cap. Click any row for a full analysis. Star stocks to build your watchlist.",
		active: "Screener",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-lg border border-border bg-card p-5 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "screener-search",
								children: "Search"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "screener-search",
									placeholder: "Symbol or company name…",
									value: query,
									onChange: (e) => setQuery(e.target.value),
									className: "pl-9"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "screener-pe",
								children: [
									"Max P/E",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 font-bold text-primary",
										children: maxPE === MAX_PE ? "Any" : `≤ ${maxPE}`
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								id: "screener-pe",
								min: 5,
								max: MAX_PE,
								step: 1,
								value: [maxPE],
								onValueChange: ([v]) => setMaxPE(v),
								className: "mt-2.5",
								"aria-label": "Maximum P/E ratio"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "screener-yield",
								children: "Min dividend yield"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: minYield,
								onValueChange: setMinYield,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "screener-yield",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "0",
										children: "Any"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "1",
										children: "≥ 1%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "2",
										children: "≥ 2%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "3",
										children: "≥ 3%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "5",
										children: "≥ 5%"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "screener-mcap",
								children: "Market-cap band"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: band,
								onValueChange: setBand,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "screener-mcap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All caps"
								}), Object.keys(MCAP_BANDS).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: b,
									children: [
										MCAP_BANDS[b].label,
										" (",
										MCAP_BANDS[b].hint,
										")"
									]
								}, b))] })]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 border-t border-border pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2.5 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Sectors" }), sectors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSectors([]),
							className: "text-xs font-semibold text-primary hover:underline",
							children: [
								"Clear (",
								sectors.length,
								")"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: SECTORS.map((sector) => {
							const active = sectors.includes(sector);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => toggleSector(sector),
								"aria-pressed": active,
								className: cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary"),
								children: sector
							}, sector);
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-foreground",
							children: results.length
						}),
						" of ",
						STOCKS.length,
						" ",
						"stocks",
						filterCount > 0 && ` · ${filterCount} filter${filterCount > 1 ? "s" : ""} active`
					]
				}), filterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => {
						setSectors([]);
						setMaxPE(MAX_PE);
						setMinYield("0");
						setBand("all");
						setQuery("");
					},
					children: "Reset filters"
				})]
			}),
			results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No stocks match",
				body: "Try widening the P/E range, lowering the dividend-yield bar, or clearing a sector chip.",
				actionLabel: "Reset filters",
				onAction: () => {
					setSectors([]);
					setMaxPE(MAX_PE);
					setMinYield("0");
					setBand("all");
					setQuery("");
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-border bg-card shadow-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-12" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stock" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Sector" }),
					SORT_COLUMNS.map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => toggleSort(key),
							className: cn("inline-flex items-center gap-1 font-semibold transition-colors hover:text-primary", sortKey === key && "text-primary"),
							"aria-label": `Sort by ${label} ${sortKey === key && sortDir === "desc" ? "ascending" : "descending"}`,
							children: [label, sortKey === key ? sortDir === "desc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3.5 opacity-40" })]
						})
					}, key))
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: results.map((s) => {
					const watched = isWatched(s.symbol);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "cursor-pointer",
						onClick: () => openStock(s.symbol),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": watched ? `Remove ${s.symbol} from watchlist` : `Add ${s.symbol} to watchlist`,
									"aria-pressed": watched,
									onClick: () => toggle(s.symbol),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", watched ? "fill-amber-400 text-amber-400" : "text-muted-foreground") })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-primary",
								children: s.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-w-44 truncate text-xs text-muted-foreground",
								children: s.name
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "whitespace-nowrap",
								children: s.sector
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-semibold tabular-nums",
								children: formatINR(s.pricePaise)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right tabular-nums",
								children: s.pe.toFixed(1)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right tabular-nums",
								children: formatINRShort(s.marketCapCr * 1e9)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right tabular-nums",
								children: [s.divYield.toFixed(2), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: cn("text-right font-semibold tabular-nums", s.oneYReturnPct >= 0 ? "text-success" : "text-destructive"),
								children: [
									s.oneYReturnPct >= 0 ? "+" : "−",
									Math.abs(s.oneYReturnPct).toFixed(1),
									"%"
								]
							})
						]
					}, s.symbol);
				}) })] })
			})
		]
	});
}
//#endregion
export { ScreenerPage as component };
