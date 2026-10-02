import { i as __toESM } from "../_runtime.mjs";
import { r as formatINR } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { P as useUpdateHolding, s as useAddHolding } from "./hooks-CJFESX97.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-CSuHP3IP.mjs";
import { t as Input } from "./input-BHhQWJAH.mjs";
import { t as Label } from "./label-CfPf0fIX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-XnQw7ldr.mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as getStock, r as STOCKS } from "./data-_btm06jU.mjs";
import { r as getLTP } from "./history-CDM6LAry.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/HoldingDialog-CzBvX_Lm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
//#endregion
export { HoldingDialog as t };
