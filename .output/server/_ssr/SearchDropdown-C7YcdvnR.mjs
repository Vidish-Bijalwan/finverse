import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { M as Search, n as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SearchDropdown-C7YcdvnR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Search input + grouped results dropdown (group label → rows with
* name/symbol/price/change). Keyboard navigable: ArrowUp/Down + Enter + Escape.
* Follows the combobox/listbox/option ARIA pattern.
*/
function SearchDropdown({ groups, onSelect, placeholder = "Search stocks, funds, ETFs…", value, onChange, className }) {
	const [internal, setInternal] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(0);
	const listId = (0, import_react.useId)();
	const inputRef = (0, import_react.useRef)(null);
	const query = value ?? internal;
	const flat = (0, import_react.useMemo)(() => {
		const out = [];
		for (const g of groups) for (const item of g.items) out.push({
			group: g.label,
			item
		});
		return out;
	}, [groups]);
	const total = flat.length;
	const clamped = total === 0 ? 0 : Math.min(active, total - 1);
	(0, import_react.useEffect)(() => {
		setActive(0);
	}, [query, groups]);
	const choose = (item) => {
		onSelect(item);
		setOpen(false);
	};
	const onKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setOpen(true);
			setActive((a) => total === 0 ? 0 : (a + 1) % total);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setOpen(true);
			setActive((a) => total === 0 ? 0 : (a - 1 + total) % total);
		} else if (e.key === "Enter") {
			if (open && flat[clamped]) {
				e.preventDefault();
				choose(flat[clamped].item);
			}
		} else if (e.key === "Escape") {
			setOpen(false);
			inputRef.current?.blur();
		}
	};
	const setQuery = (v) => {
		if (onChange) onChange(v);
		else setInternal(v);
		setOpen(true);
	};
	const activeRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		activeRef.current?.scrollIntoView({ block: "nearest" });
	}, [clamped, open]);
	let cursor = -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 rounded-2xl border border-input bg-card px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "size-4 shrink-0 text-muted-foreground",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "text",
					role: "combobox",
					"aria-expanded": open && total > 0,
					"aria-controls": listId,
					"aria-autocomplete": "list",
					"aria-activedescendant": open && flat[clamped] ? `${listId}-${flat[clamped].item.id}` : void 0,
					value: query,
					onChange: (e) => setQuery(e.target.value),
					onFocus: () => setOpen(true),
					onBlur: () => window.setTimeout(() => setOpen(false), 120),
					onKeyDown,
					placeholder,
					className: "h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
				}),
				query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Clear search",
					onClick: () => setQuery(""),
					className: "grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-4",
						"aria-hidden": true
					})
				})
			]
		}), open && total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			id: listId,
			role: "listbox",
			"aria-label": "Search results",
			className: "absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-auto rounded-2xl border border-border bg-card p-2 shadow-modal",
			children: groups.map((g) => g.items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				role: "presentation",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 pt-2 pb-1 text-[11px] font-bold text-muted-foreground uppercase",
					children: g.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: g.items.map((item) => {
					cursor += 1;
					const idx = cursor;
					const isActive = idx === clamped;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						id: `${listId}-${item.id}`,
						role: "option",
						"aria-selected": isActive,
						ref: isActive ? activeRef : void 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => choose(item),
							onMouseEnter: () => setActive(idx),
							className: cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", isActive ? "bg-muted" : "bg-transparent"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-semibold text-foreground",
									children: item.title
								}), item.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-xs text-muted-foreground",
									children: item.subtitle
								})]
							}), item.right && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("shrink-0 text-sm font-bold tabular-nums", item.rightTone === "gain" && "text-gain", item.rightTone === "loss" && "text-loss", (item.rightTone === "neutral" || !item.rightTone) && "text-muted-foreground"),
								children: item.right
							})]
						})
					}, item.id);
				}) })]
			}, g.label))
		})]
	});
}
//#endregion
export { SearchDropdown as t };
