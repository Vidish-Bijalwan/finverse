import { i as __toESM } from "../_runtime.mjs";
import { n as formatINRShort, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { pn as ArrowUp, vn as ArrowDown } from "../_libs/lucide-react.mjs";
import { t as EmptyState } from "./EmptyState-DJbWsGIR.mjs";
import { a as mcapBandOf, n as SECTORS, r as STOCKS, t as MCAP_BANDS } from "./data-_btm06jU.mjs";
import { i as getLTP, n as dayChange, r as genHistory } from "./history-mUmaAsie.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BhFA3ek8.mjs";
import { t as MarketRow } from "./MarketRow-Ds6Mj7Mj.mjs";
import { t as SearchDropdown } from "./SearchDropdown-C7YcdvnR.mjs";
import { t as PageShell } from "./PageShell-FB39N1OW.mjs";
import { t as useWatchlist } from "./useWatchlist-CrOaZuZW.mjs";
import { t as Slider } from "./slider-nMra_Ay9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screener-DAY-vVDB.js
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
	/** Symbol search suggestions for the SearchDropdown (top 8 matches). */
	const searchGroups = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return [{
			label: "Stocks",
			items: STOCKS.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 8).map((s) => {
				const changePct = dayChange(genHistory(s.symbol, 2)).changePct;
				const up = changePct >= 0;
				return {
					id: s.symbol,
					title: s.symbol,
					subtitle: `${s.name} · ${s.sector}`,
					right: `${formatINR(getLTP(s.symbol))} ${up ? "+" : "−"}${Math.abs(changePct).toFixed(2)}%`,
					rightTone: up ? "gain" : "loss"
				};
			})
		}];
	}, [query]);
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
	/** Simulated LTP + day-change per result, computed once per filter change. */
	const live = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const s of results) map.set(s.symbol, {
			pricePaise: getLTP(s.symbol),
			changePct: dayChange(genHistory(s.symbol, 2)).changePct
		});
		return map;
	}, [results]);
	function openStock(symbol) {
		navigate({
			to: "/stocks/$symbol",
			params: { symbol }
		});
	}
	function resetFilters() {
		setSectors([]);
		setMaxPE(MAX_PE);
		setMinYield("0");
		setBand("all");
		setQuery("");
	}
	const filterCount = sectors.length + (maxPE < MAX_PE ? 1 : 0) + (minYield !== "0" ? 1 : 0) + (band !== "all" ? 1 : 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Stock Screener",
		subtitle: "Filter 40 Indian stocks by sector, valuation, dividend yield and market-cap. Click any row for a full analysis. Star stocks to build your watchlist.",
		active: "Screener",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-6 rounded-2xl border border-border bg-card p-5 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "screener-search",
								children: "Search"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDropdown, {
								groups: searchGroups,
								value: query,
								onChange: setQuery,
								placeholder: "Symbol or company name…",
								onSelect: (item) => openStock(item.id)
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
								onValueChange: ([v]) => setMaxPE(v ?? MAX_PE),
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
							className: `text-xs font-semibold text-primary hover:underline transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95`,
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
								className: `${cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary")} ${pressable}`,
								children: sector
							}, sector);
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Demo dataset · simulated prices — not live"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "screener-sort",
							className: "sr-only",
							children: "Sort results by"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: sortKey,
							onValueChange: (v) => toggleSort(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "screener-sort",
								className: "h-9 w-36 text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SORT_COLUMNS.map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: key,
								children: label
							}, key)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							className: `size-9 ${pressable}`,
							onClick: () => setSortDir((d) => d === "asc" ? "desc" : "asc"),
							"aria-label": sortDir === "desc" ? "Sort ascending" : "Sort descending",
							children: sortDir === "desc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
						}),
						filterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: resetFilters,
							className: "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95",
							children: "Reset filters"
						})
					]
				})]
			}),
			results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No stocks match",
				body: "Try widening the P/E range, lowering the dividend-yield bar, or clearing a sector chip.",
				actionLabel: "Reset filters",
				onAction: resetFilters
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: results.map((s) => {
					const watched = isWatched(s.symbol);
					const m = live.get(s.symbol);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketRow, {
						symbol: s.symbol,
						name: `${s.name} · ${s.sector} · P/E ${s.pe.toFixed(1)} · MCap ${formatINRShort(s.marketCapCr * 1e9)}`,
						pricePaise: m?.pricePaise ?? s.pricePaise,
						changePct: m?.changePct ?? 0,
						starred: watched,
						onToggleStar: () => toggle(s.symbol),
						onClick: () => openStock(s.symbol),
						className: "border border-border/60 bg-card shadow-card"
					}) }, s.symbol);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs leading-5 text-muted-foreground",
				children: "Prices shown are simulated from the FinVerse demo dataset — not live market data. For learning, not trading."
			})
		]
	});
}
//#endregion
export { ScreenerPage as component };
