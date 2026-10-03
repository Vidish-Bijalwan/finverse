import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, r as monthKey, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { $t as Camera, Bt as CircleX, C as Smartphone, It as Clock, Kt as ChevronDown, c as Users, dt as Keyboard, f as TriangleAlert, h as Trash2, n as X, st as LoaderCircle, v as Tag } from "../_libs/lucide-react.mjs";
import { n as NumberDisplay } from "./EmptyState-DJbWsGIR.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { a as allCategories, o as categoryById } from "./categories-BtDQEnJC.mjs";
import { n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-_sQy6YG6.mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
import { D as insertTransaction } from "./db-36JnVPiF.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAccountSummaries, u as useAddTransaction } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as BottomSheet } from "./BottomSheet-D_7iygWc.mjs";
import { t as avatarInitials } from "./names-ss5cWm2R.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-B7-trGKW.mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { n as objectType, r as stringType, t as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payment-contacts-YqMqNSe2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACTION_PX = 64;
/**
* Initials from a display name, via the shared avatar rule
* (`@/lib/names`): first letters of the first two words, uppercased.
* "QA Test Beneficiary" -> "QT".
*/
function initialsOf(name) {
	return avatarInitials(name);
}
/**
* Transaction row: avatar circle (initials) | name + secondary line |
* right-aligned signed amount colored gain/loss. Renders as a <button> when
* onClick is provided (keyboard-focusable with visible focus ring).
*
* With `swipeActions`, swiping left (pointer or touch) reveals Categorize /
* Delete buttons parked behind the row. Keyboard fallback: tabbing to the row
* reveals the actions, which stay in the tab order while focus is inside.
*/
function TxnRow({ name, secondary, amountPaise, status = "success", onClick, className, swipeActions }) {
	const inFlow = amountPaise >= 0;
	const reducedMotion = usePrefersReducedMotion();
	const hasActions = Boolean(swipeActions?.onCategorize ?? swipeActions?.onDelete);
	const actionsWidth = (swipeActions?.onCategorize ? ACTION_PX : 0) + (swipeActions?.onDelete ? ACTION_PX : 0);
	const [revealed, setRevealed] = (0, import_react.useState)(false);
	const [drag, setDrag] = (0, import_react.useState)(0);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [kbFocus, setKbFocus] = (0, import_react.useState)(false);
	const [actionsFocus, setActionsFocus] = (0, import_react.useState)(false);
	const gesture = (0, import_react.useRef)(null);
	const suppressClick = (0, import_react.useRef)(false);
	const shown = revealed || kbFocus || actionsFocus;
	const translate = (shown ? -actionsWidth : 0) + drag;
	const closeActions = () => {
		setRevealed(false);
		setKbFocus(false);
	};
	const onPointerDown = (e) => {
		if (!hasActions) return;
		if (e.pointerType === "mouse" && e.button !== 0) return;
		gesture.current = {
			startX: e.clientX,
			moved: 0
		};
		setDragging(true);
	};
	const onPointerMove = (e) => {
		const g = gesture.current;
		if (!g) return;
		const dx = e.clientX - g.startX;
		g.moved = Math.max(g.moved, Math.abs(dx));
		if (revealed) setDrag(Math.min(Math.max(dx, 0), actionsWidth));
		else setDrag(Math.max(Math.min(dx, 0), -(actionsWidth + 24)));
	};
	const endGesture = () => {
		const g = gesture.current;
		gesture.current = null;
		setDragging(false);
		if (!g) return;
		if (g.moved > 10) suppressClick.current = true;
		if (!revealed && drag < -actionsWidth * .45) setRevealed(true);
		else if (revealed && drag > actionsWidth * .45) setRevealed(false);
		setDrag(0);
	};
	const onRowClickCapture = (e) => {
		if (suppressClick.current) {
			suppressClick.current = false;
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		const detail = e.nativeEvent?.detail ?? 0;
		if (revealed && detail > 0) {
			e.preventDefault();
			e.stopPropagation();
			closeActions();
		}
	};
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark",
			children: initialsOf(name)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-sm font-semibold text-foreground",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5 truncate text-xs text-muted-foreground",
				children: [
					secondary,
					status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
							className: "size-3",
							"aria-hidden": true
						}), " Pending"]
					}),
					status === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
							className: "size-3",
							"aria-hidden": true
						}), " Failed"]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
			paise: amountPaise,
			signed: true,
			className: cn("shrink-0 text-sm font-bold", status === "failed" ? "text-muted-foreground" : inFlow ? "text-gain" : "text-loss")
		})
	] });
	const rowClasses = cn("flex w-full items-center gap-3 rounded-2xl bg-card px-3 py-3", onClick && "transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring", className);
	const row = onClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		onClickCapture: onRowClickCapture,
		onFocus: (e) => {
			if (e.currentTarget.matches(":focus-visible")) setKbFocus(true);
		},
		onBlur: () => setKbFocus(false),
		onKeyDown: (e) => {
			if (e.key === "Escape" && revealed) {
				e.stopPropagation();
				closeActions();
			}
		},
		className: rowClasses,
		"aria-label": `${name}, ${secondary ?? ""}, amount ${amountPaise / 100} rupees${status !== "success" ? `, ${status}` : ""}${hasActions ? ". Swipe left for more actions." : ""}`,
		children: content
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: rowClasses,
		onClickCapture: onRowClickCapture,
		children: content
	});
	if (!hasActions) return row;
	const tabbable = shown;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative touch-pan-y overflow-hidden rounded-2xl select-none",
		onPointerDown,
		onPointerMove,
		onPointerUp: endGesture,
		onPointerCancel: endGesture,
		onPointerLeave: () => {
			if (gesture.current) endGesture();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("absolute inset-y-0 right-0 flex", !shown && "invisible"),
			onFocus: () => setActionsFocus(true),
			onBlur: (e) => {
				if (!e.currentTarget.contains(e.relatedTarget)) setActionsFocus(false);
			},
			children: [swipeActions?.onCategorize && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				tabIndex: tabbable ? 0 : -1,
				"aria-label": `Categorize ${name}`,
				onClick: (e) => {
					e.stopPropagation();
					closeActions();
					swipeActions.onCategorize?.();
				},
				className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-16 flex-col items-center justify-center gap-1 bg-warning/15 text-[11px] font-bold text-warning"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
					className: "size-5",
					"aria-hidden": true
				}), "Categorize"]
			}), swipeActions?.onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				tabIndex: tabbable ? 0 : -1,
				"aria-label": `Delete ${name}`,
				onClick: (e) => {
					e.stopPropagation();
					closeActions();
					swipeActions.onDelete?.();
				},
				className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-16 flex-col items-center justify-center gap-1 bg-destructive text-[11px] font-bold text-destructive-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
					className: "size-5",
					"aria-hidden": true
				}), "Delete"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("relative", !dragging && !reducedMotion && "transition-transform duration-150 ease-out"),
			style: { transform: `translateX(${translate}px)` },
			children: row
		})]
	});
}
/**
* Bottom-sheet category picker for the TxnRow swipe action. Categories are
* grouped into collapsible Expense/Income sections (long flat lists become
* expandable rows). The picker's group containing the current category opens
* by default.
*/
function CategorizeSheet({ open, onOpenChange, currentCategory, onPick }) {
	const groups = (0, import_react.useMemo)(() => {
		const cats = allCategories();
		return [{
			id: "expense",
			label: "Expenses",
			items: cats.filter((c) => c.kind === "expense")
		}, {
			id: "income",
			label: "Income",
			items: cats.filter((c) => c.kind === "income")
		}];
	}, []);
	const defaultOpen = categoryById(currentCategory ?? "")?.kind === "income" ? "income" : "expense";
	const [openGroup, setOpenGroup] = (0, import_react.useState)(defaultOpen);
	const close = () => onOpenChange(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
		open,
		onClose: close,
		title: "Categorize",
		showCloseButton: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2 px-1 pb-2",
			children: groups.map((g) => {
				const isOpen = openGroup === g.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-[14px] border border-border bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-expanded": isOpen,
						onClick: () => setOpenGroup(isOpen ? "" : g.id),
						className: cn(pressable, "flex w-full items-center justify-between px-4 py-3 text-left"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-bold text-foreground",
							children: [g.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs font-semibold text-muted-foreground",
								children: g.items.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							className: cn("size-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180"),
							"aria-hidden": true
						})]
					}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-2 gap-1.5 px-3 pb-3",
						children: g.items.map((c) => {
							const Icon = c.icon;
							const active = c.id === currentCategory;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": active,
								onClick: () => {
									onPick(c.id);
									close();
								},
								className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left", active ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted/60"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "grid size-8 shrink-0 place-items-center rounded-full",
									style: {
										backgroundColor: `${c.color}1f`,
										color: c.color
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("min-w-0 flex-1 truncate text-sm font-semibold", active ? "text-primary" : "text-foreground"),
									children: c.label
								})]
							}) }, c.id);
						})
					})]
				}, g.id);
			})
		})
	});
}
var UPI_ID_RE$1 = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;
/** UPI ID syntax check: local-part@bank-handle (also used by manual entry). */
function isValidUpiId(id) {
	return UPI_ID_RE$1.test(id.trim());
}
/**
* Convert a UPI `am` value (rupees, up to 2 decimals) to integer paise.
* Returns null for malformed values.
*/
function upiAmountToPaise(am) {
	if (am === null || am === "") return null;
	if (!/^\d+(\.\d{1,2})?$/.test(am.trim())) return null;
	const paise = Math.round(Number(am) * 100);
	return Number.isFinite(paise) && paise > 0 ? paise : null;
}
function parseUpiPayload(raw) {
	const text = raw.trim();
	if (!/^upi:\/\//i.test(text)) return null;
	let url;
	try {
		url = new URL(text);
	} catch {
		return null;
	}
	const host = url.hostname.toLowerCase();
	if (host !== "pay" && host !== "collect") return null;
	const pa = url.searchParams.get("pa")?.trim() ?? "";
	if (!UPI_ID_RE$1.test(pa)) return null;
	const cu = url.searchParams.get("cu");
	if (cu !== null && cu.toUpperCase() !== "INR") return null;
	return {
		upiId: pa,
		name: url.searchParams.get("pn")?.trim() || null,
		amountPaise: upiAmountToPaise(url.searchParams.get("am"))
	};
}
var UPI_ID_RE = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;
/**
* QR scanner for UPI payments.
*
* Primary path: rear camera via getUserMedia + the native BarcodeDetector
* (Chromium/Edge). Decoded text is parsed as a UPI intent; anything else is
* rejected with an honest message.
*
* Fallbacks (all real, no dead ends): camera denied / no camera /
* no BarcodeDetector / decode failures → manual UPI ID entry (name + optional
* amount). The dialog never pretends a scan succeeded.
*/
function QrScannerDialog({ open, onOpenChange, onScan }) {
	const [phase, setPhase] = (0, import_react.useState)("starting");
	const [error, setError] = (0, import_react.useState)(null);
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(0);
	const detectorRef = (0, import_react.useRef)(null);
	const scannedRef = (0, import_react.useRef)(false);
	const stopAll = (0, import_react.useCallback)(() => {
		cancelAnimationFrame(rafRef.current);
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		detectorRef.current = null;
		scannedRef.current = false;
	}, []);
	const startCamera = (0, import_react.useCallback)(async () => {
		setPhase("starting");
		setError(null);
		try {
			if (!window.BarcodeDetector) {
				setPhase("unavailable");
				return;
			}
			const md = navigator.mediaDevices;
			if (!md?.getUserMedia) {
				setPhase("unavailable");
				return;
			}
			detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
			const stream = await md.getUserMedia({
				video: { facingMode: { ideal: "environment" } },
				audio: false
			});
			streamRef.current = stream;
			const video = videoRef.current;
			if (!video) {
				stopAll();
				setPhase("error");
				return;
			}
			video.srcObject = stream;
			await video.play().catch(() => {});
			setPhase("scanning");
			const loop = async () => {
				if (scannedRef.current) return;
				try {
					const raw = (await detectorRef.current?.detect(video))?.[0]?.rawValue?.trim();
					if (raw) {
						const payload = parseUpiPayload(raw);
						if (payload) {
							scannedRef.current = true;
							stopAll();
							onScan(payload);
							return;
						}
						setError("That QR code isn't a UPI payment code. Try another one.");
					}
				} catch {}
				rafRef.current = requestAnimationFrame(loop);
			};
			rafRef.current = requestAnimationFrame(loop);
		} catch (e) {
			stopAll();
			if (e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError")) setPhase("denied");
			else if (e instanceof DOMException && e.name === "NotFoundError") setPhase("unavailable");
			else {
				setPhase("error");
				setError(e instanceof Error ? e.message : "Couldn't start the camera.");
			}
		}
	}, [onScan, stopAll]);
	(0, import_react.useEffect)(() => {
		if (open) startCamera();
		return () => stopAll();
	}, [
		open,
		startCamera,
		stopAll
	]);
	const close = () => onOpenChange(false);
	/** Stop the camera before switching to manual entry (releases the lens). */
	const goManual = () => {
		stopAll();
		setPhase("manual");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-sm p-0",
			"aria-describedby": void 0,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: "Scan a UPI QR code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 pt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-foreground",
						children: "Scan QR code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: close,
						"aria-label": "Close scanner",
						className: cn(pressable, "grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-5",
							"aria-hidden": true
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5",
					children: [
						(phase === "starting" || phase === "scanning") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative overflow-hidden rounded-2xl bg-black",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
											ref: videoRef,
											playsInline: true,
											muted: true,
											className: "aspect-square w-full object-cover",
											"aria-label": "Camera viewfinder"
										}),
										phase === "starting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute inset-0 grid place-items-center bg-black/60",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
												className: "size-8 animate-spin text-primary",
												"aria-hidden": true
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"aria-hidden": true,
											className: "pointer-events-none absolute inset-8 rounded-xl border-2 border-primary"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-center text-sm text-muted-foreground",
									children: phase === "starting" ? "Starting camera…" : "Point the camera at a UPI QR code."
								}),
								error && phase === "scanning" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mt-2 text-center text-sm font-semibold text-loss",
									children: error
								}),
								phase === "scanning" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: goManual,
									className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-bold text-foreground hover:bg-muted/60"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {
										className: "size-4",
										"aria-hidden": true
									}), " Enter UPI ID instead"]
								})
							]
						}),
						(phase === "denied" || phase === "unavailable" || phase === "error") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-col items-center gap-3 py-6 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-12 place-items-center rounded-full bg-muted",
									children: phase === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
										className: "size-6 text-muted-foreground",
										"aria-hidden": true
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										className: "size-6 text-muted-foreground",
										"aria-hidden": true
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "max-w-60 text-sm text-muted-foreground",
									children: [
										phase === "denied" && "Camera access was blocked. Allow camera permission in your browser to scan, or enter the UPI ID manually.",
										phase === "unavailable" && "Camera scanning isn't available on this device or browser. Enter the UPI ID manually instead.",
										phase === "error" && (error ?? "Couldn't start the camera.")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: goManual,
									className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {
										className: "size-4",
										"aria-hidden": true
									}), " Enter UPI ID manually"]
								}),
								(phase === "denied" || phase === "error") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void startCamera(),
									className: "text-sm font-bold text-primary hover:underline",
									children: "Try the camera again"
								})
							]
						}),
						phase === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualEntry, { onScan })
					]
				})
			]
		})
	});
}
function ManualEntry({ onScan }) {
	const [upiId, setUpiId] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [touched, setTouched] = (0, import_react.useState)(false);
	const idValid = UPI_ID_RE.test(upiId.trim());
	const amountPaise = amount.trim() === "" ? null : /^\d+(\.\d{1,2})?$/.test(amount.trim()) ? Math.round(Number(amount) * 100) : -1;
	const canSubmit = idValid && amountPaise !== -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-3 flex flex-col gap-3",
		onSubmit: (e) => {
			e.preventDefault();
			setTouched(true);
			if (!canSubmit) return;
			onScan({
				upiId: upiId.trim(),
				name: name.trim() || null,
				amountPaise: amountPaise === 0 ? null : amountPaise
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold text-foreground",
						children: "UPI ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: upiId,
						onChange: (e) => setUpiId(e.target.value),
						placeholder: "name@bank",
						autoComplete: "off",
						autoFocus: true,
						className: "h-12 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
					}),
					touched && !idValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-loss",
						children: "Enter a valid UPI ID, like name@okhdfcbank."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm font-bold text-foreground",
					children: ["Payee name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal text-muted-foreground",
						children: "(optional)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "e.g. Corner Store",
					maxLength: 60,
					className: "h-12 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm font-bold text-foreground",
						children: ["Amount ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-normal text-muted-foreground",
							children: "(optional)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						inputMode: "decimal",
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						placeholder: "₹ amount",
						className: "h-12 rounded-xl border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
					}),
					touched && amountPaise === -1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-loss",
						children: "Enter an amount like 250.50."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: cn(pressable, "mt-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"),
				disabled: !canSubmit,
				children: "Continue to payment"
			})
		]
	});
}
var OPERATORS = [
	"Jio",
	"Airtel",
	"Vi",
	"BSNL"
];
var MOBILE_RE = /^[6-9]\d{9}$/;
/**
* Mobile recharge flow — a real ledger flow, not a mock.
*
* Collects operator + 10-digit number + amount, then records a genuine
* expense transaction (category "bills", payMode "upi_test") against the
* default account. The transaction is deletable/undoable like any other.
*/
function RechargeDialog({ open, onOpenChange }) {
	const [operator, setOperator] = (0, import_react.useState)("Jio");
	const [number, setNumber] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [touched, setTouched] = (0, import_react.useState)(false);
	const { data: summaries } = useAccountSummaries();
	const addTxn = useAddTransaction();
	const numberValid = MOBILE_RE.test(number.replace(/\s/g, ""));
	const amountPaise = amount.trim() === "" ? null : /^\d+(\.\d{1,2})?$/.test(amount.trim()) ? Math.round(Number(amount) * 100) : -1;
	const canSubmit = numberValid && amountPaise !== null && amountPaise !== -1 && amountPaise > 0 && !addTxn.isPending;
	const submit = async (e) => {
		e.preventDefault();
		setTouched(true);
		if (!canSubmit || amountPaise === null || amountPaise <= 0) return;
		const accountId = summaries?.find((s) => s.account.isDefault)?.account.id;
		try {
			await addTxn.mutateAsync({
				type: "expense",
				amountPaise,
				category: "bills",
				note: `Recharge · ${operator} · ${number.replace(/\s/g, "")}`,
				dateISO: todayISO(),
				payMode: "upi_test",
				...accountId ? { accountId } : {}
			});
			toast.success(`Recharged ${formatINR(amountPaise)} on ${operator} ${number.replace(/\s/g, "")}`, { description: "Recorded in your ledger · simulated" });
			setNumber("");
			setAmount("");
			setTouched(false);
			onOpenChange(false);
		} catch {
			toast.error("Couldn't record the recharge — try again.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-sm",
			"aria-describedby": void 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-base font-bold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
						className: "size-5 text-primary",
						"aria-hidden": true
					}), " Mobile recharge"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onOpenChange(false),
					"aria-label": "Close recharge",
					className: cn(pressable, "grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": true
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-2 flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block text-sm font-bold text-foreground",
						children: "Operator"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2",
						role: "radiogroup",
						"aria-label": "Operator",
						children: OPERATORS.map((op) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "radio",
							"aria-checked": operator === op,
							onClick: () => setOperator(op),
							className: cn(pressable, "rounded-xl border py-2.5 text-sm font-bold transition-colors", operator === op ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"),
							children: op
						}, op))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold text-foreground",
								children: "Mobile number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "tel",
								inputMode: "numeric",
								value: number,
								onChange: (e) => setNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12)),
								placeholder: "98765 43210",
								autoComplete: "tel",
								className: "h-12 rounded-xl border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
							}),
							touched && !numberValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-loss",
								children: "Enter a valid 10-digit Indian mobile number."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold text-foreground",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								inputMode: "decimal",
								value: amount,
								onChange: (e) => setAmount(e.target.value.replace(/[^\d.]/g, "")),
								placeholder: "₹ amount",
								className: "h-12 rounded-xl border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
							}),
							touched && (amountPaise === null || amountPaise === -1 || amountPaise <= 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-loss",
								children: "Enter an amount like 299."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: !canSubmit,
						className: cn(pressable, "flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"),
						children: [addTxn.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-4 animate-spin",
							"aria-hidden": true
						}), addTxn.isPending ? "Recording…" : "Recharge now"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs text-muted-foreground",
						children: "Simulated recharge — no real money moves. The entry appears in your ledger."
					})
				]
			})]
		})
	});
}
/**
* Recent people: avatar + name, horizontal scroll on mobile (GPay pattern),
* wrapping grid on desktop. People come only from real activity — paid,
* requested, or recharged — never seed data.
*/
function PeopleStrip({ people, onSelect, onSeeAll }) {
	if (people.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "grid size-11 shrink-0 place-items-center rounded-full bg-tint",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground",
			children: [
				"People you pay will appear here. Start with",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground",
					children: "Pay anyone"
				}),
				" above."
			]
		})]
	});
	const visible = people.slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "list",
		"aria-label": "Recent people",
		className: "flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-6 sm:overflow-visible lg:grid-cols-8",
		children: [visible.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onSelect(p),
			"aria-label": `Pay ${p.name}`,
			className: cn(pressable, "flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors hover:bg-muted/60 sm:w-auto"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "grid size-14 place-items-center rounded-full bg-tint text-base font-bold text-primary-dark",
					children: initialsOf(p.name)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-full truncate text-center text-xs font-semibold text-foreground",
					children: p.name
				}),
				p.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-full truncate text-center text-[10px] text-muted-foreground",
					children: p.detail
				})
			]
		}, p.name.toLowerCase())), onSeeAll && people.length > visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onSeeAll,
			className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2 text-primary hover:bg-muted/60 sm:w-auto"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				"aria-hidden": true,
				className: "grid size-14 place-items-center rounded-full bg-primary/10 text-sm font-bold",
				children: ["+", people.length - visible.length]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold",
				children: "All"
			})]
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Razorpay TEST MODE — server functions (server-only module).
*
* Import ONLY the exported server functions (createPaymentLinkFn /
* getRazorpayStatusFn) from client code — TanStack Start compiles them into
* RPC stubs on the client. Everything else in this module (process.env
* secrets, node:crypto, direct Supabase access) stays on the server.
*
* The webhook is NOT a server function: see src/lib/razorpay-webhook.ts and
* src/routes/api.razorpay-webhook.tsx for why it must be a raw request
* handler (the server-function context exposes no raw Request body for
* HMAC-SHA256, and the app's CSRF middleware only guards serverFn calls —
* both verified against the installed @tanstack/react-start 1.168.60 types).
*
* Secrets used (server-only env):
*   RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET — Razorpay test-mode keys.
*/
/** Whether the server has Razorpay test keys. Never leaks the keys. */
var getRazorpayStatusFn = createServerFn({ method: "GET" }).handler(createSsrRpc("02c6def9966c47bdd505ba6ad74da24b480ffe8f8a969d31154dedc2f29a2142"));
var CreateLinkInput = objectType({
	amountPaise: numberType().int().positive().max(1e8),
	note: stringType().max(200).optional(),
	accessToken: stringType().min(1)
});
/**
* Create a Razorpay TEST-MODE payment link and record it in `payment_links`.
* Returns the short_url; the client opens it in a new tab. Payment status is
* learned from the `payments` table (populated by the webhook), never from
* anything the client claims.
*/
var createPaymentLinkFn = createServerFn({ method: "POST" }).validator(CreateLinkInput).handler(createSsrRpc("5fdba5c9b2c2a46d87ce158b2cbb0afc81faff67cd4a1b7610dccff638f8f3db"));
/**
* Payments — client-side React Query layer + pure helpers.
*
* Two rails:
*   (a) Simulated UPI — always available. Writes a `transactions` row
*       (type=expense, pay_mode=`upi_test`) via the existing useAddTransaction
*       mutation path. No real money moves; every surface carries a quiet
*       "simulated" disclosure line.
*   (b) Razorpay test mode — only when the server reports configured
*       (useRazorpayStatus). Link creation runs in a server function
*       (src/lib/razorpay.server.ts); the short_url opens in a new tab and
*       the UI polls the `payments` table. Success is shown ONLY when a row
*       is `captured` + `webhook_verified` — never from client-supplied state.
*
* Graceful degradation: if the 0002_revamp.sql migration has not been run,
* Supabase returns 42P01 ("relation does not exist"). Hooks surface that as
* a PaymentsSetupPendingError; pages render an honest ErrorState.
*/
var PAYMENT_PAY_MODES = [
	"upi_test",
	"razorpay_test",
	"bank_test"
];
/** Stable code stamped on every PaymentsSetupPendingError. */
var SETUP_PENDING_CODE = "FINVERSE_SETUP_PENDING";
/** Branded message text — matched as a fallback in case the error is ever
*  re-created as a plain Error (losing both prototype and `code`). */
var SETUP_PENDING_MESSAGE = "Payments database setup pending — run supabase/migrations/0002_revamp.sql in the Supabase SQL editor.";
/** Branded error: the payments tables don't exist yet (migration not run). */
var PaymentsSetupPendingError = class extends Error {
	/** Stable machine-readable marker — survives re-throws and (de)serialization
	*  where `instanceof` checks break (SSR, worker boundaries, query dehydration). */
	code = SETUP_PENDING_CODE;
	constructor() {
		super(SETUP_PENDING_MESSAGE);
		this.name = "PaymentsSetupPendingError";
	}
};
/** True when an error means "payments tables are missing" (Postgrest 42P01). */
function isSetupPendingError(err) {
	if (err instanceof PaymentsSetupPendingError) return true;
	if (err != null && typeof err === "object") {
		const e = err;
		if (e.code === "FINVERSE_SETUP_PENDING") return true;
		if (e.code === "42P01") return true;
		if (typeof e.message === "string") {
			if (/relation .* does not exist/i.test(e.message)) return true;
			if (e.message.includes("Payments database setup pending — run supabase/migrations/0002_revamp.sql in the Supabase SQL editor.")) return true;
		}
	}
	return false;
}
var QK = {
	paymentLinks: ["finverse", "payment-links"],
	payments: ["finverse", "payments"],
	razorpayStatus: ["finverse", "razorpay-status"]
};
/** Upper bound for a single payment: ₹10,00,000. */
var MAX_PAYMENT_PAISE = 1e8;
/**
* Validate an amount in integer paise. Rejects non-integers, zero/negative,
* and amounts above MAX_PAYMENT_PAISE. All money stays integer paise.
*/
function validatePaymentAmount(amountPaise) {
	if (typeof amountPaise !== "number" || !Number.isInteger(amountPaise)) return {
		ok: false,
		error: "Amount must be a whole number of paise."
	};
	if (amountPaise <= 0) return {
		ok: false,
		error: "Enter an amount greater than zero."
	};
	if (amountPaise > 1e8) return {
		ok: false,
		error: `Amount exceeds the ₹10,00,000 per-payment limit.`
	};
	return {
		ok: true,
		amountPaise
	};
}
/** Map a Razorpay-side payment status to the TxnRow status chip. */
function toTxnStatus(status) {
	if (status === "captured") return "success";
	if (status === "failed") return "failed";
	return "pending";
}
/** Build the ledger note for a simulated-UPI payment: the recipient's name. */
function buildUpiNote(recipientName) {
	return recipientName.trim().slice(0, 120);
}
var MONTH_LABEL = new Intl.DateTimeFormat("en-IN", {
	month: "long",
	year: "numeric"
});
/** Group transactions by calendar month (YYYY-MM), newest month first. */
function groupTransactionsByMonth(transactions) {
	const byKey = /* @__PURE__ */ new Map();
	for (const t of transactions) {
		const key = t.dateISO.slice(0, 7);
		const bucket = byKey.get(key);
		if (bucket) bucket.push(t);
		else byKey.set(key, [t]);
	}
	return [...byKey.entries()].sort(([a], [b]) => a < b ? 1 : -1).map(([monthKey, items]) => ({
		monthKey,
		label: MONTH_LABEL.format(/* @__PURE__ */ new Date(`${monthKey}-02T00:00:00`)),
		items: [...items].sort((x, y) => x.createdAt < y.createdAt ? 1 : -1)
	}));
}
/** True when a bill hasn't been paid in the current calendar month. */
function isBillDue(bill, monthKeyStr = monthKey(/* @__PURE__ */ new Date())) {
	return !bill.lastPaidOn || !bill.lastPaidOn.startsWith(monthKeyStr);
}
/** True when this transaction is a test-rail payment (either rail). */
function isPaymentTransaction(t) {
	return PAYMENT_PAY_MODES.includes(t.payMode);
}
/**
* Ids of payments that have been refunded: any transaction id that appears
* as `refundOf` on a refund (income) transaction. Requires migration 0003
* (transactions.refund_of); without it this simply returns an empty set.
*/
function refundedTxnIds(transactions) {
	const ids = /* @__PURE__ */ new Set();
	for (const t of transactions) if (t.refundOf) ids.add(t.refundOf);
	return ids;
}
/**
* True when this payment can be refunded: a successful simulated-rail
* expense that hasn't been refunded yet. Razorpay test payments can't be
* refunded from here (no refund rail is configured).
*/
function canRefundPayment(t, refundedIds) {
	return t.type === "expense" && (t.payMode === "upi_test" || t.payMode === "bank_test") && !refundedIds.has(t.id) && !t.refundOf;
}
/** Resolve the display status of a ledger payment transaction. */
function paymentDisplayStatus(t, refundedIds) {
	if (refundedIds.has(t.id)) return "refunded";
	return "success";
}
function toPaymentLink(row) {
	return {
		id: row["id"],
		razorpayLinkId: row["razorpay_link_id"],
		amountPaise: Number(row["amount_paise"]),
		status: row["status"],
		expiresAt: row["expires_at"] ?? null,
		createdAt: row["created_at"]
	};
}
function toPaymentRecord(row) {
	return {
		id: row["id"],
		paymentLinkId: row["payment_link_id"] ?? null,
		razorpayPaymentId: row["razorpay_payment_id"],
		amountPaise: Number(row["amount_paise"]),
		status: row["status"],
		method: row["method"] ?? null,
		webhookVerified: Boolean(row["webhook_verified"]),
		failureReason: row["failure_reason"] ?? null,
		transactionId: row["transaction_id"] ?? null,
		createdAt: row["created_at"]
	};
}
async function fetchPaymentLinks() {
	const { data: { user } } = await getSupabase().auth.getUser();
	if (!user) throw new Error("Not signed in.");
	const { data, error } = await getSupabase().from("payment_links").select("id, razorpay_link_id, amount_paise, status, expires_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
	if (error) {
		if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
		throw error;
	}
	return (data ?? []).map(toPaymentLink);
}
async function fetchPayments() {
	const { data: { user } } = await getSupabase().auth.getUser();
	if (!user) throw new Error("Not signed in.");
	const res = await getSupabase().from("payments").select("id, payment_link_id, razorpay_payment_id, amount_paise, status, method, webhook_verified, failure_reason, transaction_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
	if (res.error) {
		if (isSetupPendingError(res.error)) throw new PaymentsSetupPendingError();
		throw res.error;
	}
	return (res.data ?? []).map(toPaymentRecord);
}
/**
* Payment links issued by this user. When `pollOpen` is true, refetches every
* 4s while any link is still in `created` status (the user may be paying in
* the Razorpay tab). Stops automatically once all links settle.
*/
function usePaymentLinks(pollOpen = false) {
	return useQuery({
		queryKey: [...QK.paymentLinks, pollOpen ? "poll" : "idle"],
		queryFn: fetchPaymentLinks,
		refetchInterval: (query) => {
			if (!pollOpen) return false;
			return query.state.data?.some((l) => l.status === "created") ? 4e3 : false;
		},
		retry: (count, err) => isSetupPendingError(err) ? false : count < 2
	});
}
/**
* Razorpay payment records (populated by the webhook). When `active` is true,
* polls every 3s — used while waiting for a payment the user just initiated.
* Success is derived from rows that are `captured` + `webhook_verified`.
*/
function usePayments(active = false) {
	return useQuery({
		queryKey: [...QK.payments, active ? "poll" : "idle"],
		queryFn: fetchPayments,
		refetchInterval: active ? 3e3 : false,
		retry: (count, err) => isSetupPendingError(err) ? false : count < 2
	});
}
/** Whether the server has Razorpay test keys configured. Never leaks keys. */
function useRazorpayStatus() {
	return useQuery({
		queryKey: QK.razorpayStatus,
		queryFn: () => getRazorpayStatusFn(),
		staleTime: 6e4,
		retry: 1
	});
}
/**
* Refund a simulated-rail payment: records a real reversing income
* transaction linked via `refund_of`, crediting the same account the payment
* debited. The original payment then displays the "Refunded" status.
*
* Needs migration 0003 (transactions.refund_of). If the column is missing,
* the insert fails with 42703 and we surface the setup-pending error so the
* UI can say so honestly instead of showing a fake success.
*/
function useRefundPayment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ payment }) => {
			if (payment.type !== "expense") throw new Error("Only payments (expenses) can be refunded.");
			if (payment.payMode !== "upi_test" && payment.payMode !== "bank_test") throw new Error("Only simulated UPI / bank payments can be refunded here.");
			const parsed = payment.payMode === "upi_test" ? payment.note.split(" · ")[0]?.trim() : payment.note.split(" · ")[1]?.trim();
			try {
				return await insertTransaction({
					type: "income",
					amountPaise: payment.amountPaise,
					category: "other-income",
					note: `Refund · ${parsed || "payment"}`,
					dateISO: todayISO(),
					payMode: payment.payMode,
					...payment.accountId ? { accountId: payment.accountId } : {},
					tags: [],
					refundOf: payment.id
				});
			} catch (err) {
				if (err != null && typeof err === "object" && (err.code === "42703" || /refund_of/i.test(err.message ?? ""))) throw new PaymentsSetupPendingError();
				throw err;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["finverse", "transactions"] });
			qc.invalidateQueries({ queryKey: ["finverse", "account-summaries"] });
		}
	});
}
/**
* Create a Razorpay test payment link (server function) and open it in a new
* tab. The caller must return to the app; status is read from the `payments`
* table via usePayments — never from anything the client claims.
*/
function useCreatePaymentLink() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ amountPaise, note }) => {
			const validated = validatePaymentAmount(amountPaise);
			if (!validated.ok) throw new Error(validated.error);
			const { data: { session } } = await getSupabase().auth.getSession();
			const accessToken = session?.access_token;
			if (!accessToken) throw new Error("Not signed in.");
			return await createPaymentLinkFn({ data: {
				amountPaise: validated.amountPaise,
				note,
				accessToken
			} });
		},
		onSuccess: (created) => {
			qc.invalidateQueries({ queryKey: QK.paymentLinks });
			qc.invalidateQueries({ queryKey: QK.payments });
			window.open(created.shortUrl, "_blank", "noopener,noreferrer");
		}
	});
}
/**
* Payment contacts — derive "people" from the user's real ledger activity.
*
* No address book, no seed data: a person appears here only after the user
* has actually paid them (simulated UPI / bank transfer), requested money
* from them, or recharged their number. Displayed as avatar + name, like a
* consumer payments app.
*
* Ledger-note contract (single-line notes only):
*   upi_test  : "<name>" or "<name> · <user note>"
*   bank_test : "Bank transfer · <name> · A/c …<last4>" (+ optional " · <user note>")
*
* The " · " separator is documented here and covered by tests; display
* names entered through single-line inputs realistically never contain it.
*/
var NOTE_SEP = " · ";
var BANK_NOTE_PREFIX = "Bank transfer";
/**
* Parse a payment ledger note back into its structured parts.
* Returns null for notes that don't follow the contract.
*/
function parsePayeeNote(payMode, note) {
	const parts = note.split(NOTE_SEP);
	if (payMode === "upi_test") {
		const name = (parts[0] ?? "").trim();
		if (!name) return null;
		const rest = parts.slice(1).join(NOTE_SEP).trim();
		return rest ? {
			name,
			userNote: rest
		} : { name };
	}
	if (payMode === "bank_test") {
		if (parts[0] !== BANK_NOTE_PREFIX) return null;
		const name = (parts[1] ?? "").trim();
		const detail = (parts[2] ?? "").trim();
		if (!name || !detail) return null;
		const rest = parts.slice(3).join(NOTE_SEP).trim();
		return rest ? {
			name,
			detail,
			userNote: rest
		} : {
			name,
			detail
		};
	}
	return null;
}
/** Ledger note for a simulated-UPI payment, with optional user note. */
function buildUpiNoteWithUserNote(name, userNote) {
	const base = name.trim().slice(0, 120);
	const extra = (userNote ?? "").trim().slice(0, 200);
	return extra ? `${base}${NOTE_SEP}${extra}` : base;
}
/** Ledger note for a simulated bank transfer, with optional user note. */
function buildBankNote(name, accountNumber, userNote) {
	const digits = accountNumber.replace(/\D/g, "");
	const base = `${BANK_NOTE_PREFIX}${NOTE_SEP}${name.trim().slice(0, 120)}${NOTE_SEP}A/c …${digits.slice(-4)}`;
	const extra = (userNote ?? "").trim().slice(0, 200);
	return extra ? `${base}${NOTE_SEP}${extra}` : base;
}
/** Indian mobile number: 10 digits starting 6-9. */
function isValidMobileNumber(n) {
	return /^[6-9]\d{9}$/.test(n.replace(/[\s-]/g, ""));
}
/** Bank account number: 9–18 digits (spaces/dashes tolerated). */
function isValidAccountNumber(n) {
	return /^\d{9,18}$/.test(n.replace(/[\s-]/g, ""));
}
/** IFSC: 4 letters + 0 + 6 alphanumerics. */
function isValidIfsc(code) {
	return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
}
/**
* Build the people list from real activity. Dedupes case-insensitively,
* keeps the most recent interaction per person, newest first.
*/
function extractPeople(transactions, requests) {
	const seen = /* @__PURE__ */ new Map();
	const upsert = (p) => {
		const key = p.name.toLowerCase();
		const prev = seen.get(key);
		if (!prev || p.lastAt > prev.lastAt) seen.set(key, p);
	};
	for (const t of transactions) {
		if (!isPaymentTransaction(t)) continue;
		if (t.type !== "expense" && t.type !== "income") continue;
		if (t.refundOf) continue;
		const parsed = parsePayeeNote(t.payMode, t.note);
		if (!parsed) continue;
		upsert({
			name: parsed.name,
			rail: t.payMode === "bank_test" ? "bank" : "upi",
			...parsed.detail ? { detail: parsed.detail } : {},
			lastAt: t.createdAt
		});
	}
	for (const r of requests) {
		const name = r.personName.trim();
		if (!name) continue;
		upsert({
			name,
			rail: "request",
			lastAt: r.createdAt
		});
	}
	return [...seen.values()].sort((a, b) => a.lastAt < b.lastAt ? 1 : -1);
}
/** Case-insensitive people search over name + detail. */
function searchPeople(people, query) {
	const q = query.trim().toLowerCase();
	if (!q) return people;
	return people.filter((p) => p.name.toLowerCase().includes(q) || (p.detail ?? "").toLowerCase().includes(q));
}
//#endregion
export { useRazorpayStatus as A, paymentDisplayStatus as C, useCreatePaymentLink as D, toTxnStatus as E, validatePaymentAmount as M, usePaymentLinks as O, parsePayeeNote as S, searchPeople as T, isSetupPendingError as _, QrScannerDialog as a, isValidMobileNumber as b, buildBankNote as c, canRefundPayment as d, extractPeople as f, isPaymentTransaction as g, isBillDue as h, PeopleStrip as i, useRefundPayment as j, usePayments as k, buildUpiNote as l, initialsOf as m, MAX_PAYMENT_PAISE as n, RechargeDialog as o, groupTransactionsByMonth as p, PaymentsSetupPendingError as r, TxnRow as s, CategorizeSheet as t, buildUpiNoteWithUserNote as u, isValidAccountNumber as v, refundedTxnIds as w, isValidUpiId as x, isValidIfsc as y };
