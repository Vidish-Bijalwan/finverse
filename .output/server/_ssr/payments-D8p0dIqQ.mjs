import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { A as Send, At as Download, B as ReceiptIndianRupee, C as Smartphone, F as RotateCcw, H as Plus, It as Clock, Kt as ChevronDown, M as Search, Mt as Delete, Ot as ExternalLink, Pt as CreditCard, V as QrCode, _n as ArrowLeft, a as Wallet, c as Users, fn as AtSign, gt as History, h as Trash2, hn as ArrowRight, mn as ArrowUpRight, n as X, qt as Check, st as LoaderCircle, ut as Landmark, vt as HandCoins } from "../_libs/lucide-react.mjs";
import { n as NumberDisplay, t as EmptyState } from "./EmptyState-DJbWsGIR.mjs";
import { n as Sheet, r as SheetContent, t as Pill$1 } from "./sheet-B4iSeRDW.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-_sQy6YG6.mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
import { D as insertTransaction } from "./db-36JnVPiF.mjs";
import { t as FINVERSE_QUERY_DEFAULTS } from "./query-BmyAv6X-.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { I as useUpdateTransaction, b as useDeleteTransaction, f as useBills, k as useTransactions, n as useAccountSummaries, u as useAddTransaction, w as usePayBill } from "./hooks-YJqkdAGY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AccountDialog } from "./AccountDialog-D4KMf8ru.mjs";
import { t as Skeleton } from "./skeleton-BrNYuekK.mjs";
import { A as useRazorpayStatus, C as paymentDisplayStatus, D as useCreatePaymentLink, E as toTxnStatus, M as validatePaymentAmount, O as usePaymentLinks, S as parsePayeeNote, T as searchPeople, _ as isSetupPendingError, a as QrScannerDialog, b as isValidMobileNumber, c as buildBankNote, d as canRefundPayment, f as extractPeople, g as isPaymentTransaction, h as isBillDue, i as PeopleStrip, j as useRefundPayment, k as usePayments, l as buildUpiNote, m as initialsOf, n as MAX_PAYMENT_PAISE, o as RechargeDialog, p as groupTransactionsByMonth, r as PaymentsSetupPendingError, s as TxnRow, t as CategorizeSheet, u as buildUpiNoteWithUserNote, v as isValidAccountNumber, w as refundedTxnIds, x as isValidUpiId, y as isValidIfsc } from "./payment-contacts-YqMqNSe2.mjs";
import { t as KeyButton } from "./KeyButton-CZ7zbIKy.mjs";
import { t as ErrorState } from "./ErrorState-Bx1fnWBD.mjs";
import { t as Route } from "./payments-Dxk_fBxj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-D8p0dIqQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Pure keypad logic for AmountInput.
*
* Extracted as pure functions so rapid-tap behavior is unit-testable.
* The component applies these against a ref-mirrored digit string so taps
* arriving faster than React re-renders never compute from stale closure
* state (previously, fast 5,0,0 taps dropped the zeros and registered ₹5).
*/
/** Append a keypad key ("0"–"9" or "00") to the digit string. */
function applyKey(digits, key, maxDigits = 10) {
	if (digits.length >= maxDigits) return digits;
	if (digits === "" && (key === "0" || key === "00")) return digits;
	return digits + key;
}
/** Remove the last entered digit. */
function applyBackspace(digits) {
	return digits.slice(0, -1);
}
var KEYS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"00",
	"0",
	"back"
];
/**
* Custom numeric keypad (no system keyboard). Keys: 1-9, 00, 0, backspace.
* Emits digit strings; the parent owns paise-safe integer math.
*/
function NumericKeypad({ onKey, onBackspace, disabled = false, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid grid-cols-3 gap-2", className),
		role: "group",
		"aria-label": "Numeric keypad",
		children: KEYS.map((k) => {
			const isBack = k === "back";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyButton, {
				label: isBack ? "Backspace" : k === "00" ? "Double zero" : k,
				disabled,
				onPress: () => isBack ? onBackspace() : onKey(k),
				className: "grid h-14 place-items-center rounded-2xl bg-keypad text-xl font-semibold text-keypad-foreground tabular-nums",
				children: isBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, {
					className: "size-6",
					"aria-hidden": true
				}) : k
			}, k);
		})
	});
}
/** Format integer paise as ₹ with Indian grouping, trimming zero paise. */
function formatAmount(paise) {
	const rupees = Math.trunc(paise / 100);
	const rest = Math.abs(paise % 100);
	const grouped = new Intl.NumberFormat("en-IN").format(rupees);
	return rest === 0 ? `₹${grouped}` : `₹${grouped}.${String(rest).padStart(2, "0")}`;
}
/**
* GPay-style amount entry: giant readout + custom numeric keypad (no system
* keyboard). Paise-safe integer math. Confirm stays disabled until valid.
*/
function AmountInput({ maxPaise, onConfirm, onChange, confirmLabel = "Confirm", className }) {
	const maxDigits = 10;
	const [digits, setDigits] = (0, import_react.useState)("");
	const digitsRef = (0, import_react.useRef)("");
	const commit = (next) => {
		digitsRef.current = next;
		setDigits(next);
		onChange?.(next === "" ? 0 : parseInt(next, 10));
	};
	const paise = digits === "" ? 0 : parseInt(digits, 10);
	const overMax = maxPaise != null && paise > maxPaise;
	const valid = paise > 0 && !overMax;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-1 px-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "status",
					"aria-live": "polite",
					className: "text-5xl font-bold text-foreground tabular-nums",
					children: formatAmount(paise)
				}), overMax ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-semibold text-danger",
					role: "alert",
					children: [
						"Amount exceeds the ",
						formatAmount(maxPaise ?? 0),
						" limit"
					]
				}) : maxPaise != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground tabular-nums",
					children: ["Max ", formatAmount(maxPaise)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumericKeypad, {
				onKey: (d) => commit(applyKey(digitsRef.current, d, maxDigits)),
				onBackspace: () => commit(applyBackspace(digitsRef.current))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: !valid,
				onClick: () => onConfirm(paise),
				className: cn("h-13 rounded-full py-3.5 text-base font-bold transition-colors", valid ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "cursor-not-allowed bg-muted text-muted-foreground"),
				children: confirmLabel
			})
		]
	});
}
/**
* Bottom-sheet payment review: recipient, amount, funding source,
* "Proceed to pay" pill button, "Use another method" escape link.
* `children` renders extra rows (fees, notes) between amount and source.
*
* The summary footer (amount + primary CTA) is sticky — always visible even
* when the sheet content scrolls.
*/
function PaymentSheet({ open, onOpenChange, recipientName, recipientDetail, amountPaise, fundingSource, fundingDetail, onProceed, processing = false, proceedLabel = "Proceed to pay", onUseAnotherMethod, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "bottom",
			className: "mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col gap-0 rounded-t-3xl border-t px-0 pt-3 pb-0",
			"aria-label": "Review payment",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "mx-auto mb-2 block h-1.5 w-12 shrink-0 rounded-full bg-muted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-foreground",
							children: "Review payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-3 rounded-[14px] border border-border bg-card p-4 shadow-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark",
									children: initialsOf(recipientName)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-bold text-foreground",
										children: recipientName
									}), recipientDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: recipientDetail
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
									paise: amountPaise,
									className: "text-xl font-bold text-foreground"
								})
							]
						}),
						children,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-3 rounded-[14px] bg-muted/60 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
								className: "size-5 shrink-0 text-muted-foreground",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "Paying from"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-semibold text-foreground",
										children: fundingSource
									}),
									fundingDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: fundingDetail
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-4",
							"aria-hidden": true
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 border-t border-border bg-background px-6 pt-3 pb-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "Total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
								paise: amountPaise,
								className: "text-xl font-black text-foreground"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onProceed,
							disabled: processing,
							className: cn(pressable, "mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold", processing ? "cursor-wait bg-primary/70 text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary-hover"),
							children: [processing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-5 animate-spin",
								"aria-hidden": true
							}), processing ? "Processing…" : proceedLabel]
						}),
						onUseAnotherMethod && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onUseAnotherMethod,
							className: "mx-auto mt-3 block text-sm font-semibold text-primary hover:underline",
							children: "Use another method"
						})
					]
				})
			]
		})
	});
}
/**
* Result screen: success / failure / processing. Success shows an animated
* check (CSS-drawn, skipped under reduced motion), amount + counterparty
* recap, reference ID row, and Download / Pay-again actions. Failure shows
* the reason with Retry.
*/
function ReceiptView({ status, amountPaise, counterparty, referenceId, timestamp, reason, onDownload, onRetry, retryLabel, className }) {
	const reduced = usePrefersReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center px-6 py-8 text-center", className),
		children: [
			status === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "status",
				"aria-label": "Processing",
				className: "grid size-20 place-items-center rounded-full bg-info-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: cn("size-10 text-info", !reduced && "animate-spin"),
					"aria-hidden": true
				})
			}),
			status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "img",
				"aria-label": "Payment successful",
				className: cn("grid size-20 place-items-center rounded-full bg-gain/15", !reduced && "fv-check-pop"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 24 24",
					className: "size-10",
					fill: "none",
					"aria-hidden": true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M5 12.5l4.5 4.5L19 7.5",
						stroke: "currentColor",
						strokeWidth: 3,
						strokeLinecap: "round",
						strokeLinejoin: "round",
						className: cn("text-gain", !reduced && "fv-check-draw")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "hidden",
						"aria-hidden": true
					})]
				})
			}),
			status === "failure" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "img",
				"aria-label": "Payment failed",
				className: cn("grid size-20 place-items-center rounded-full bg-loss/15", !reduced && "fv-check-pop"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-10 text-loss",
					strokeWidth: 3,
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mt-4 text-xl font-bold text-foreground",
				children: [
					status === "success" && "Payment successful",
					status === "failure" && "Payment failed",
					status === "processing" && "Processing payment"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
				paise: amountPaise,
				className: cn("mt-2 text-3xl font-bold", status === "failure" ? "text-muted-foreground" : "text-foreground")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					status === "success" ? "Paid to" : status === "failure" ? "To" : "Paying",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: counterparty
					})
				]
			}),
			status === "failure" && reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 max-w-sm rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger",
				children: reason
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-6 w-full max-w-sm rounded-2xl border border-border bg-card text-left shadow-card",
				children: [referenceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs font-semibold text-muted-foreground uppercase",
						children: "Reference ID"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "truncate font-mono text-sm text-foreground",
						children: referenceId
					})]
				}), timestamp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs font-semibold text-muted-foreground uppercase",
						children: "Time"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-sm text-foreground tabular-nums",
						children: timestamp
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex w-full max-w-sm flex-col gap-2",
				children: [onDownload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onDownload,
					className: "flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "size-4",
						"aria-hidden": true
					}), " Download receipt"]
				}), onRetry && status !== "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onRetry,
					className: "flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
						className: "size-4",
						"aria-hidden": true
					}), retryLabel ?? (status === "failure" ? "Retry payment" : "Pay again")]
				})]
			})
		]
	});
}
/**
* "Search people or UPI ID" — the consumer-payments search bar.
*
* Matches recent people by name/detail, and when the query itself looks
* like a UPI ID (name@bank) or a 10-digit mobile number, offers paying it
* directly. No fake directory — only real counterparties + direct entry.
*/
function PeopleSearch({ people, onSelectPerson, onPayUpiId, className }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [focused, setFocused] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const trimmed = query.trim();
	const matches = (0, import_react.useMemo)(() => searchPeople(people, trimmed), [people, trimmed]);
	const upiDirect = isValidUpiId(trimmed);
	const mobileDirect = !upiDirect && isValidMobileNumber(trimmed);
	const open = focused && trimmed.length > 0;
	const payDirect = () => {
		if (upiDirect) onPayUpiId(trimmed, trimmed);
		else if (mobileDirect) onPayUpiId(trimmed.replace(/[\s-]/g, ""), trimmed);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 rounded-2xl border border-input bg-card px-4 shadow-card focus-within:border-primary",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "size-4 shrink-0 text-muted-foreground",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "text",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					onFocus: () => setFocused(true),
					onBlur: () => setFocused(false),
					onKeyDown: (e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							if (matches[0]) onSelectPerson(matches[0]);
							else payDirect();
						}
						if (e.key === "Escape") setQuery("");
					},
					placeholder: "Search people or UPI ID",
					"aria-label": "Search people or UPI ID",
					autoComplete: "off",
					className: "h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
				}),
				query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Clear search",
					onMouseDown: (e) => e.preventDefault(),
					onClick: () => {
						setQuery("");
						inputRef.current?.focus();
					},
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-4",
						"aria-hidden": true
					})
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "listbox",
			"aria-label": "People results",
			className: "absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-card",
			children: [
				(upiDirect || mobileDirect) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "option",
					"aria-selected": false,
					onMouseDown: (e) => e.preventDefault(),
					onClick: payDirect,
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-primary/10",
						children: upiDirect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "size-5 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-bold text-foreground",
							children: trimmed
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: upiDirect ? "Pay this UPI ID" : "Pay this mobile number"
						})]
					})]
				}),
				matches.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "option",
					"aria-selected": false,
					onMouseDown: (e) => e.preventDefault(),
					onClick: () => onSelectPerson(p),
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark",
						children: initialsOf(p.name)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-bold text-foreground",
							children: p.name
						}), p.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted-foreground",
							children: p.detail
						})]
					})]
				}, p.name.toLowerCase())),
				matches.length === 0 && !upiDirect && !mobileDirect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-4 text-sm text-muted-foreground",
					children: "No matching people. Type a full UPI ID (name@bank) or 10-digit mobile number to pay directly."
				})
			]
		})]
	});
}
/** Back header used by the multi-step payment flows. */
function FlowHeader({ title, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onBack,
			"aria-label": "Back",
			className: cn(pressable, "grid size-10 place-items-center rounded-full text-foreground hover:bg-muted/60"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
				className: "size-5",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "truncate text-base font-bold text-foreground",
			children: title
		})]
	});
}
var delay$1 = (ms) => new Promise((r) => setTimeout(r, ms));
/**
* Simulated bank transfer (NEFT/IMPS-style): beneficiary name + account
* number + IFSC → amount → optional note → confirmation sheet → processing
* → verified receipt. Writes a real ledger expense (pay_mode "bank_test");
* no real money moves and every surface says so.
*/
function BankTransferFlow({ initial, onExit }) {
	const [phase, setPhase] = (0, import_react.useState)("details");
	const [name, setName] = (0, import_react.useState)(initial?.name ?? "");
	const [accountNumber, setAccountNumber] = (0, import_react.useState)(initial?.accountNumber ?? "");
	const [confirmAccountNumber, setConfirmAccountNumber] = (0, import_react.useState)("");
	const [ifsc, setIfsc] = (0, import_react.useState)(initial?.ifsc ?? "");
	const [touched, setTouched] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [amountPaise, setAmountPaise] = (0, import_react.useState)(0);
	const [fundingAccountId, setFundingAccountId] = (0, import_react.useState)(null);
	const [sheetOpen, setSheetOpen] = (0, import_react.useState)(false);
	const [accountDialogOpen, setAccountDialogOpen] = (0, import_react.useState)(false);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const { data: summaries, isLoading: accountsLoading } = useAccountSummaries();
	const addTransaction = useAddTransaction();
	const accounts = summaries ?? [];
	const selectedAccount = accounts.find((s) => s.account.id === fundingAccountId) ?? accounts.find((s) => s.account.isDefault) ?? accounts[0];
	const effectiveAccountId = selectedAccount?.account.id ?? null;
	const digits = accountNumber.replace(/[\s-]/g, "");
	const confirmDigits = confirmAccountNumber.replace(/[\s-]/g, "");
	const nameValid = name.trim().length > 0;
	const accountValid = isValidAccountNumber(accountNumber);
	const confirmValid = confirmDigits === digits && digits.length > 0;
	const ifscValid = isValidIfsc(ifsc);
	const detailsValid = nameValid && accountValid && confirmValid && ifscValid;
	const overBalance = selectedAccount != null && amountPaise > 0 && amountPaise > selectedAccount.balancePaise;
	const confirmTransfer = async () => {
		if (!effectiveAccountId) return;
		setSheetOpen(false);
		setPhase("processing");
		try {
			const [created] = await Promise.all([addTransaction.mutateAsync({
				type: "expense",
				amountPaise,
				category: "others",
				note: buildBankNote(name, digits, note),
				dateISO: todayISO(),
				payMode: "bank_test",
				accountId: effectiveAccountId
			}), delay$1(1200)]);
			setReceipt({
				status: "success",
				txn: created
			});
			toast.success("Bank transfer recorded", { description: `${formatINR(amountPaise)} to ${name.trim()} ····${digits.slice(-4)} · simulated` });
		} catch (err) {
			setReceipt({
				status: "failure",
				reason: err instanceof Error ? err.message : "The transfer could not be recorded."
			});
		}
		setPhase("receipt");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			phase === "details" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowHeader, {
					title: "Bank transfer",
					onBack: onExit
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Transfer to any bank account. Simulated — settles in your FinVerse ledger, no real money moves."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold text-foreground",
							children: "Beneficiary name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "e.g. Rohan Verma",
							maxLength: 120,
							autoFocus: true,
							className: "h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
						}),
						touched && !nameValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-loss",
							children: "Enter the beneficiary name."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold text-foreground",
							children: "Account number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							inputMode: "numeric",
							value: accountNumber,
							onChange: (e) => setAccountNumber(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 22)),
							placeholder: "9–18 digits",
							autoComplete: "off",
							className: "h-12 rounded-xl border border-input bg-card px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
						}),
						touched && !accountValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-loss",
							children: "Enter a valid 9–18 digit account number."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold text-foreground",
							children: "Confirm account number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							inputMode: "numeric",
							value: confirmAccountNumber,
							onChange: (e) => setConfirmAccountNumber(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 22)),
							placeholder: "Re-enter the account number",
							autoComplete: "off",
							className: "h-12 rounded-xl border border-input bg-card px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
						}),
						touched && !confirmValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-loss",
							children: "Account numbers don't match."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold text-foreground",
							children: "IFSC"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: ifsc,
							onChange: (e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11)),
							placeholder: "e.g. HDFC0001234",
							autoComplete: "off",
							autoCapitalize: "characters",
							className: "h-12 rounded-xl border border-input bg-card px-3 text-sm font-mono uppercase tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
						}),
						touched && !ifscValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-loss",
							children: "Enter a valid IFSC (4 letters, 0, 6 characters)."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTouched(true);
						if (detailsValid) {
							setTouched(false);
							setPhase("amount");
						}
					},
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "h-12 rounded-full text-sm font-bold transition-colors", "bg-primary text-primary-foreground hover:bg-primary-hover"),
					children: "Continue"
				})
			] }),
			phase === "amount" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowHeader, {
					title: `Transfer to ${name.trim()}`,
					onBack: () => setPhase("details")
				}),
				accountsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 animate-pulse rounded-2xl bg-muted" }) : accounts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground",
						children: "Create an account first — simulated transfers debit a FinVerse account."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setAccountDialogOpen(true),
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "h-12 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
						children: "Create account"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, {
							className: "size-5 shrink-0 text-muted-foreground",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: "Paying from"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								"aria-label": "Funding account",
								value: effectiveAccountId ?? "",
								onChange: (e) => setFundingAccountId(e.target.value || null),
								className: "w-full bg-transparent text-sm font-bold text-foreground outline-none",
								children: accounts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.account.id,
									children: s.account.name
								}, s.account.id))
							})]
						}),
						selectedAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
							paise: selectedAccount.balancePaise,
							className: "text-sm font-bold text-foreground"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-2xl bg-muted/60 px-4 py-2.5 font-mono text-xs text-muted-foreground",
					children: [
						name.trim(),
						" · A/c …",
						digits.slice(-4),
						" · ",
						ifsc.trim().toUpperCase()
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountInput, {
					confirmLabel: "Continue",
					maxPaise: 1e8,
					onConfirm: (paise) => {
						setAmountPaise(paise);
						setSheetOpen(true);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm font-bold text-foreground",
						children: ["Note ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-normal text-muted-foreground",
							children: "(optional)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "What's this for?",
						maxLength: 200,
						className: "h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
					})]
				})
			] }),
			phase === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
				status: "processing",
				amountPaise,
				counterparty: `${name.trim()} ····${digits.slice(-4)}`
			}) }),
			phase === "receipt" && receipt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
					status: receipt.status,
					amountPaise,
					counterparty: `${name.trim()} ····${digits.slice(-4)}`,
					...receipt.txn ? {
						referenceId: receipt.txn.id,
						timestamp: new Date(receipt.txn.createdAt).toLocaleString("en-IN", {
							day: "numeric",
							month: "short",
							year: "numeric",
							hour: "numeric",
							minute: "2-digit"
						})
					} : {},
					...receipt.reason ? { reason: receipt.reason } : {},
					onRetry: () => {
						setReceipt(null);
						setAmountPaise(0);
						setPhase("amount");
					},
					retryLabel: receipt.status === "failure" ? "Retry transfer" : "New transfer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onExit,
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "mx-auto text-sm font-semibold text-primary hover:underline"),
					children: "Back to payments"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "Test mode — this was a simulated transfer. No real money moved."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaymentSheet, {
				open: sheetOpen,
				onOpenChange: setSheetOpen,
				recipientName: name.trim() || "Beneficiary",
				recipientDetail: `Bank transfer · A/c …${digits.slice(-4)} · ${ifsc.trim().toUpperCase()}`,
				amountPaise,
				fundingSource: selectedAccount?.account.name ?? "Account",
				onProceed: confirmTransfer,
				onUseAnotherMethod: () => setSheetOpen(false),
				children: [note.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 rounded-2xl bg-muted/60 px-4 py-2.5 text-sm text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-muted-foreground",
						children: "Note: "
					}), note.trim()]
				}), overBalance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "alert",
					className: "mt-3 rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger",
					children: [
						"Insufficient balance in ",
						selectedAccount?.account.name,
						". Lower the amount or pick another account."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountDialog, {
				open: accountDialogOpen,
				onOpenChange: setAccountDialogOpen,
				editing: null
			})
		]
	});
}
/**
* Bills & recharges: due bills with one-tap Pay (real ledger write via
* usePayBill), a mobile-recharge entry point, and a link to manage bills.
*/
function BillsCard() {
	const [rechargeOpen, setRechargeOpen] = (0, import_react.useState)(false);
	const billsQuery = useBills();
	const payBill = usePayBill();
	const due = (billsQuery.data ?? []).filter((b) => isBillDue(b)).sort((a, b) => a.dueDay - b.dueDay);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Bills and recharges",
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold text-foreground",
					children: "Bills & recharges"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/bills",
					className: cn(pressable, "flex items-center gap-1 text-xs font-bold text-primary hover:underline"),
					children: ["Manage bills ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						className: "size-3.5",
						"aria-hidden": true
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setRechargeOpen(true),
					className: cn(pressable, "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-card hover:bg-muted/40"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-bold text-foreground",
						children: "Recharge"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted-foreground",
						children: "Mobile prepaid"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/bills",
					className: cn(pressable, "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-card hover:bg-muted/40"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptIndianRupee, { className: "size-5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-bold text-foreground",
						children: "Pay a bill"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted-foreground",
						children: due.length === 0 ? "All caught up" : `${due.length} due`
					})] })]
				})]
			}),
			billsQuery.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-16 animate-pulse rounded-2xl bg-muted",
				"aria-hidden": true
			}),
			billsQuery.isSuccess && due.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: due.slice(0, 4).map((bill) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-bold text-foreground",
								children: bill.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["Due on day ", bill.dueDay]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
							paise: bill.amountPaise,
							className: "text-sm font-bold text-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: payBill.isPending,
							onClick: () => payBill.mutate({ id: bill.id }, {
								onSuccess: () => toast.success(`${bill.name} bill paid`),
								onError: () => toast.error("Couldn't pay the bill — try again.")
							}),
							className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"),
							children: [payBill.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-4 animate-spin",
								"aria-hidden": true
							}), "Pay"]
						})
					]
				}, bill.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RechargeDialog, {
				open: rechargeOpen,
				onOpenChange: setRechargeOpen
			})
		]
	});
}
/**
* Payment requests ("request money") — real RLS-scoped persistence.
*
* A request is an IOU the user creates: person + amount + optional note.
* Statuses: pending → paid | declined | cancelled.
*
* "Mark as paid" is the only settling path: it records a genuine income
* transaction (the money arrived) and points settledTxnId at it. Nothing is
* ever auto-settled — the user declares what actually happened.
*
* Graceful degradation: if migration 0003 hasn't been run, Supabase returns
* 42P01 and hooks surface PaymentsSetupPendingError (same pattern as the
* payments rails).
*/
/** States a request may legally move to from its current status. */
function allowedRequestTransitions(status) {
	if (status === "pending") return [
		"paid",
		"declined",
		"cancelled"
	];
	return [];
}
/** True when this status transition is legal. */
function canTransitionRequest(from, to) {
	return allowedRequestTransitions(from).includes(to);
}
/** Validate the create-request form. Returns the cleaned payload or an error. */
function validateRequestInput(input) {
	const personName = input.personName.trim().slice(0, 120);
	if (!personName) return {
		ok: false,
		error: "Enter who you're requesting from."
	};
	const amount = validatePaymentAmount(input.amountPaise);
	if (!amount.ok) return {
		ok: false,
		error: amount.error
	};
	return {
		ok: true,
		personName,
		amountPaise: amount.amountPaise,
		note: (input.note ?? "").trim().slice(0, 200)
	};
}
/** Sum of pending request amounts (money owed to the user). */
function pendingReceivablePaise(requests) {
	return requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amountPaise, 0);
}
var QK = { requests: ["finverse", "payment-requests"] };
function toRequest(row) {
	return {
		id: row["id"],
		personName: row["person_name"],
		amountPaise: Number(row["amount_paise"]),
		note: row["note"] ?? "",
		status: row["status"],
		settledTxnId: row["settled_txn_id"] ?? null,
		createdAt: row["created_at"]
	};
}
async function fetchRequests() {
	const { data: { user } } = await getSupabase().auth.getUser();
	if (!user) throw new Error("Not signed in.");
	const { data, error } = await getSupabase().from("payment_requests").select("id, person_name, amount_paise, note, status, settled_txn_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
	if (error) {
		if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
		throw error;
	}
	return (data ?? []).map(toRequest);
}
async function setRequestStatus(id, status, settledTxnId) {
	const { data: { user } } = await getSupabase().auth.getUser();
	if (!user) throw new Error("Not signed in.");
	const { error } = await getSupabase().from("payment_requests").update({
		status,
		...settledTxnId ? { settled_txn_id: settledTxnId } : {},
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).eq("user_id", user.id).eq("status", "pending");
	if (error) {
		if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
		throw error;
	}
}
function usePaymentRequests() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.requests,
		queryFn: fetchRequests,
		retry: (count, err) => isSetupPendingError(err) ? false : count < 2
	});
}
function useCreatePaymentRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const validated = validateRequestInput(input);
			if (!validated.ok) throw new Error(validated.error);
			const { data: { user } } = await getSupabase().auth.getUser();
			if (!user) throw new Error("Not signed in.");
			const { data, error } = await getSupabase().from("payment_requests").insert({
				user_id: user.id,
				person_name: validated.personName,
				amount_paise: validated.amountPaise,
				note: validated.note
			}).select("id, person_name, amount_paise, note, status, settled_txn_id, created_at").single();
			if (error) {
				if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
				throw error;
			}
			return toRequest(data);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.requests })
	});
}
/**
* Settle a request as paid: records a real income transaction first, then
* flips the request to "paid" pointing at it. The income hits the ledger —
* this is the money actually arriving, declared by the user.
*/
function useSettlePaymentRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ request, accountId }) => {
			if (request.status !== "pending") throw new Error("Only pending requests can be settled.");
			const income = await insertTransaction({
				type: "income",
				amountPaise: request.amountPaise,
				category: "other-income",
				note: request.personName,
				dateISO: todayISO(),
				payMode: "upi_test",
				...accountId ? { accountId } : {},
				tags: []
			});
			await setRequestStatus(request.id, "paid", income.id);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: QK.requests });
			qc.invalidateQueries({ queryKey: ["finverse", "transactions"] });
			qc.invalidateQueries({ queryKey: ["finverse", "account-summaries"] });
		}
	});
}
function useTransitionPaymentRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ request, to }) => {
			if (!canTransitionRequest(request.status, to)) throw new Error(`Cannot move a ${request.status} request to ${to}.`);
			await setRequestStatus(request.id, to);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.requests })
	});
}
function useDeletePaymentRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const { data: { user } } = await getSupabase().auth.getUser();
			if (!user) throw new Error("Not signed in.");
			const { error } = await getSupabase().from("payment_requests").delete().eq("id", id).eq("user_id", user.id);
			if (error) {
				if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
				throw error;
			}
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.requests })
	});
}
var STATUS_PILL = {
	pending: {
		label: "Pending",
		variant: "info"
	},
	paid: {
		label: "Paid",
		variant: "gain"
	},
	declined: {
		label: "Declined",
		variant: "loss"
	},
	cancelled: {
		label: "Cancelled",
		variant: "neutral"
	}
};
/**
* Payment requests ("request money"): create → pending → paid/declined/
* cancelled. Settling records a real income transaction; nothing auto-
* settles. Distinct pending state is shown on the sent screen and cards.
*/
function RequestMoneySection({ people, onExit, initialPhase = "list" }) {
	const [phase, setPhase] = (0, import_react.useState)(initialPhase);
	const requestsQuery = usePaymentRequests();
	const requests = requestsQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			phase !== "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowHeader, {
				title: phase === "create" ? "Request money" : "New request",
				onBack: () => phase === "sent" ? onExit() : setPhase("list")
			}),
			requestsQuery.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: [0, 1].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-2xl bg-muted" }, i))
			}),
			requestsQuery.isError && isSetupPendingError(requestsQuery.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Requests aren't set up yet",
				body: "Requests unlock after a quick database update — run supabase/migrations/0003_payment_requests.sql in the Supabase SQL editor, then try again.",
				onRetry: () => requestsQuery.refetch()
			}),
			requestsQuery.isError && !isSetupPendingError(requestsQuery.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Couldn't load requests",
				body: "We couldn't load your payment requests. Check your connection and try again.",
				onRetry: () => requestsQuery.refetch()
			}),
			requestsQuery.isSuccess && phase === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				pendingReceivablePaise(requests) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: "Pending receivable"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
						paise: pendingReceivablePaise(requests),
						className: "text-base font-bold text-foreground"
					})]
				}),
				requests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-12 place-items-center rounded-full bg-tint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCoins, { className: "size-6 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xs text-sm text-muted-foreground",
						children: "No requests yet. Create one to track money someone owes you — mark it paid when it arrives and it lands in your ledger."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCard, { request: r }, r.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPhase("create"),
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCoins, {
						className: "size-4",
						"aria-hidden": true
					}), " New request"]
				})
			] }),
			phase === "create" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCreateStep, {
				people,
				onContinue: () => setPhase("amount")
			}),
			phase === "amount" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestAmountStep, {
				onBack: () => setPhase("create"),
				onSent: () => setPhase("sent")
			}),
			phase === "sent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestSentPanel, { onDone: onExit })
		]
	});
}
var draft = {
	personName: "",
	note: "",
	amountPaise: 0
};
function resetDraft() {
	draft.personName = "";
	draft.note = "";
	draft.amountPaise = 0;
}
function RequestCreateStep({ people, onContinue }) {
	const [personName, setPersonName] = (0, import_react.useState)(draft.personName);
	const [note, setNote] = (0, import_react.useState)(draft.note);
	const [touched, setTouched] = (0, import_react.useState)(false);
	const valid = personName.trim().length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold text-foreground",
						children: "Request from"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: personName,
						onChange: (e) => setPersonName(e.target.value),
						placeholder: "e.g. Meera",
						maxLength: 120,
						autoFocus: true,
						className: "h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
					}),
					touched && !valid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-loss",
						children: "Enter who you're requesting from."
					})
				]
			}),
			people.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-2 block text-xs font-bold text-muted-foreground uppercase",
				children: "Recent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: people.slice(0, 8).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPersonName(p.name),
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors", personName === p.name ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-6 place-items-center rounded-full bg-tint text-[10px] font-bold text-primary-dark",
						children: initialsOf(p.name)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-28 truncate",
						children: p.name
					})]
				}, p.name.toLowerCase()))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm font-bold text-foreground",
					children: ["Note ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal text-muted-foreground",
						children: "(optional)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "What's this for?",
					maxLength: 200,
					className: "h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setTouched(true);
					if (!valid) return;
					draft.personName = personName.trim();
					draft.note = note.trim();
					onContinue();
				},
				className: cn(pressable, "h-12 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
				children: "Continue"
			})
		]
	});
}
function RequestAmountStep({ onBack, onSent }) {
	const createRequest = useCreatePaymentRequest();
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Requesting from ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold text-foreground",
						children: draft.personName
					}),
					draft.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: draft.note
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountInput, {
				confirmLabel: createRequest.isPending ? "Sending…" : "Send request",
				onConfirm: async (paise) => {
					setError(null);
					draft.amountPaise = paise;
					try {
						await createRequest.mutateAsync({
							personName: draft.personName,
							amountPaise: paise,
							...draft.note ? { note: draft.note } : {}
						});
						resetDraft();
						onSent();
					} catch (err) {
						setError(err instanceof PaymentsSetupPendingError ? "Requests need the database update first — run supabase/migrations/0003_payment_requests.sql in the Supabase SQL editor." : err instanceof Error ? err.message : "Couldn't create the request.");
					}
				}
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onBack,
				className: cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline"),
				children: "Change recipient"
			})
		]
	});
}
function RequestSentPanel({ onDone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center px-6 py-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "img",
				"aria-label": "Request pending",
				className: "grid size-20 place-items-center rounded-full bg-info/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
					className: "size-10 text-info",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-4 text-xl font-bold text-foreground",
				children: "Request sent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
				paise: draft.amountPaise,
				className: "mt-2 text-3xl font-bold text-foreground"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: ["Requested from ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground",
					children: draft.personName
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 max-w-xs text-sm leading-6 text-muted-foreground",
				children: [
					"Status: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold text-info",
						children: "Pending"
					}),
					". When the money arrives, open the request and mark it paid — it will be recorded in your ledger."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onDone,
				className: cn(pressable, "mt-6 flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
				children: "Done"
			})
		]
	});
}
/** A single payment-request row with its legal actions. Exported for the payments home preview. */
function RequestCard({ request }) {
	const [settleOpen, setSettleOpen] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const transition = useTransitionPaymentRequest();
	const deleteRequest = useDeletePaymentRequest();
	const pill = STATUS_PILL[request.status];
	const transitions = allowedRequestTransitions(request.status);
	const doTransition = (to) => {
		transition.mutate({
			request,
			to
		}, {
			onSuccess: () => toast.success(to === "declined" ? "Request marked as declined" : "Request cancelled"),
			onError: (e) => toast.error(e.message)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-2xl border border-border bg-card px-4 py-3 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark",
						children: initialsOf(request.personName)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-bold text-foreground",
								children: request.personName
							}),
							request.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: request.note
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: new Date(request.createdAt).toLocaleDateString("en-IN", {
									day: "numeric",
									month: "short",
									year: "numeric"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 flex-col items-end gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
							paise: request.amountPaise,
							className: "text-sm font-bold text-foreground"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
							variant: pill.variant,
							size: "sm",
							dot: true,
							children: pill.label
						})]
					})
				]
			}),
			transitions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSettleOpen(true),
						disabled: transition.isPending,
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-gain/15 px-4 text-sm font-bold text-gain hover:bg-gain/25 disabled:opacity-50"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-4",
							"aria-hidden": true
						}), " Mark as paid"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => doTransition("declined"),
						disabled: transition.isPending,
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-10 items-center justify-center gap-1.5 rounded-full border border-border px-4 text-sm font-bold text-muted-foreground hover:bg-muted/60 disabled:opacity-50"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-4",
							"aria-hidden": true
						}), " Decline"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => confirmDelete ? doTransition("cancelled") : setConfirmDelete(true),
						onBlur: () => setConfirmDelete(false),
						disabled: transition.isPending,
						"aria-label": confirmDelete ? "Confirm cancel request" : "Cancel request",
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-bold disabled:opacity-50", confirmDelete ? "border-loss/40 bg-loss/10 text-loss" : "border-border text-muted-foreground hover:bg-muted/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
							className: "size-4",
							"aria-hidden": true
						}), confirmDelete ? "Confirm" : "Cancel"]
					})
				]
			}),
			request.status !== "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex justify-end border-t border-border pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => deleteRequest.mutate(request.id, {
						onSuccess: () => toast.success("Request deleted"),
						onError: () => toast.error("Couldn't delete — try again.")
					}),
					disabled: deleteRequest.isPending,
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-muted-foreground hover:bg-muted/60 disabled:opacity-50"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
						className: "size-3.5",
						"aria-hidden": true
					}), " Delete"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettleDialog, {
				request,
				open: settleOpen,
				onOpenChange: setSettleOpen
			})
		]
	});
}
function SettleDialog({ request, open, onOpenChange }) {
	const { data: summaries } = useAccountSummaries();
	const settle = useSettlePaymentRequest();
	const [accountId, setAccountId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const accounts = summaries ?? [];
	const effectiveId = accountId ?? accounts.find((s) => s.account.isDefault)?.account.id ?? accounts[0]?.account.id;
	const submit = async () => {
		setError(null);
		try {
			await settle.mutateAsync({
				request,
				...effectiveId ? { accountId: effectiveId } : {}
			});
			toast.success(`Received ${formatINR(request.amountPaise)} from ${request.personName}`, { description: "Recorded as income in your ledger." });
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Couldn't settle the request.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-sm",
			"aria-describedby": void 0,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-base font-bold text-foreground",
						children: "Mark as paid"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onOpenChange(false),
						"aria-label": "Close",
						className: cn(pressable, "grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-5",
							"aria-hidden": true
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm leading-6 text-muted-foreground",
					children: [
						"This records",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
							paise: request.amountPaise,
							className: "font-bold text-foreground"
						}),
						" from",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-foreground",
							children: request.personName
						}),
						" as income. Only do this when the money has actually arrived."
					]
				}),
				accounts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold text-foreground",
						children: "Received into"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": "Destination account",
						value: effectiveId ?? "",
						onChange: (e) => setAccountId(e.target.value || null),
						className: "h-12 rounded-xl border border-input bg-card px-3 text-sm font-bold text-foreground outline-none focus:border-primary",
						children: accounts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.account.id,
							children: s.account.name
						}, s.account.id))
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-3 rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: submit,
					disabled: settle.isPending,
					className: cn(pressable, "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"),
					children: [settle.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), settle.isPending ? "Recording…" : "Confirm — money received"]
				})
			]
		})
	});
}
/**
* Payment receipts — downloadable text receipts for test-rail payments.
*
* buildReceiptText is pure and unit-tested; downloadReceipt triggers the
* browser download. The receipt states exactly what happened (rail, status,
* reference) and that no real money moved.
*/
/** Render a plain-text receipt. */
function buildReceiptText(r) {
	const lines = [
		"FinVerse AI — Payment Receipt (Test Mode)",
		"==========================================",
		`Status:      ${r.statusLabel}`,
		`Amount:      ${formatINR(r.amountPaise)}`,
		`Paid to:     ${r.counterparty}`,
		`Rail:        ${r.railLabel}`
	];
	if (r.referenceId) lines.push(`Reference:   ${r.referenceId}`);
	if (r.timestamp) lines.push(`Time:        ${r.timestamp}`);
	if (r.note) lines.push(`Note:        ${r.note}`);
	lines.push("", "This was a simulated test payment.", "No real money moved.");
	return lines.join("\n");
}
/** Trigger a download of the receipt as a .txt file. */
function downloadReceipt(r, filename) {
	const blob = new Blob([buildReceiptText(r)], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
var RAIL_LABEL = {
	upi_test: "UPI · Test",
	razorpay_test: "Razorpay · Test",
	bank_test: "Bank · Test"
};
var delay = (ms) => new Promise((r) => setTimeout(r, ms));
function formatDateTime(iso) {
	return new Date(iso).toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function formatDay(dateISO) {
	return (/* @__PURE__ */ new Date(`${dateISO}T00:00:00`)).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function PaymentsPage() {
	const search = Route.useSearch();
	const [tab, setTab] = (0, import_react.useState)(search.tab === "razorpay" ? "razorpay" : search.tab === "history" ? "history" : "send");
	(0, import_react.useEffect)(() => {
		if (search.tab === "razorpay") setTab("razorpay");
		else if (search.tab === "history") setTab("history");
		else if (search.tab === "send") setTab("send");
	}, [search.tab]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-lg px-4 pt-5 pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-10 place-items-center rounded-2xl bg-tint",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
						className: "size-5 text-primary",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold text-foreground",
					children: "Payments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Simulated rails — no real money moves"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Payments sections",
				className: "mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted/60 p-1",
				children: [
					{
						id: "send",
						label: "Pay",
						icon: Send
					},
					{
						id: "razorpay",
						label: "Razorpay",
						icon: CreditCard
					},
					{
						id: "history",
						label: "History",
						icon: History
					}
				].map(({ id, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(id),
					"aria-pressed": tab === id,
					className: cn(pressable, "flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-colors", tab === id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-4",
						"aria-hidden": true
					}), label]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					tab === "send" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayTab, { search }),
					tab === "razorpay" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RazorpayTab, {}),
					tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTab, {})
				]
			})
		]
	});
}
function PayTab({ search }) {
	const navigate = useNavigate();
	const [view, setView] = (0, import_react.useState)({ name: "home" });
	const [payeeMode, setPayeeMode] = (0, import_react.useState)("name");
	const [payeeName, setPayeeName] = (0, import_react.useState)("");
	const [amountPaise, setAmountPaise] = (0, import_react.useState)(0);
	const [note, setNote] = (0, import_react.useState)("");
	const [accountId, setAccountId] = (0, import_react.useState)(null);
	const [sheetOpen, setSheetOpen] = (0, import_react.useState)(false);
	const [accountDialogOpen, setAccountDialogOpen] = (0, import_react.useState)(false);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const [refund, setRefund] = (0, import_react.useState)(null);
	const [scanOpen, setScanOpen] = (0, import_react.useState)(false);
	const [rechargeOpen, setRechargeOpen] = (0, import_react.useState)(false);
	const billsRef = (0, import_react.useRef)(null);
	const { data: transactions } = useTransactions();
	const { data: summaries, isLoading: accountsLoading } = useAccountSummaries();
	const requestsQuery = usePaymentRequests();
	const addTransaction = useAddTransaction();
	const deleteTransaction = useDeleteTransaction();
	const refundPayment = useRefundPayment();
	const people = (0, import_react.useMemo)(() => extractPeople(transactions ?? [], requestsQuery.data ?? []), [transactions, requestsQuery.data]);
	const refundedIds = (0, import_react.useMemo)(() => refundedTxnIds(transactions ?? []), [transactions]);
	const pendingRequests = (0, import_react.useMemo)(() => (requestsQuery.data ?? []).filter((r) => r.status === "pending"), [requestsQuery.data]);
	const accounts = summaries ?? [];
	const selectedAccount = accounts.find((s) => s.account.id === accountId) ?? accounts.find((s) => s.account.isDefault) ?? accounts[0];
	const effectiveAccountId = selectedAccount?.account.id ?? null;
	const overBalance = selectedAccount != null && amountPaise > 0 && amountPaise > selectedAccount.balancePaise;
	const resetSend = () => {
		setPayeeName("");
		setAmountPaise(0);
		setNote("");
		setSheetOpen(false);
		setReceipt(null);
		setRefund(null);
	};
	const goHome = () => {
		resetSend();
		setView({ name: "home" });
	};
	/** Start the UPI send flow for a person (name prefilled, straight to amount). */
	const startSendTo = (name, mode = "name") => {
		resetSend();
		setPayeeMode(mode);
		setPayeeName(name);
		setView({ name: "send-amount" });
	};
	const startBlankSend = (mode) => {
		resetSend();
		setPayeeMode(mode);
		setView({ name: "send-recipient" });
	};
	const appliedKey = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		const key = JSON.stringify({
			flow: search.flow,
			upiId: search.upiId,
			name: search.name,
			amount: search.amount
		});
		if (appliedKey.current === key) return;
		appliedKey.current = key;
		if (search.flow === "recipient") startBlankSend("name");
		else if (search.flow === "upi-id") startBlankSend("upi-id");
		else if (search.flow === "upi" && (search.name || search.upiId)) {
			resetSend();
			setPayeeMode("upi-id");
			setPayeeName(search.name ?? search.upiId ?? "");
			const paise = search.amount !== void 0 ? Number(search.amount) : NaN;
			setAmountPaise(Number.isFinite(paise) && paise > 0 ? Math.round(paise) : 0);
			setView({ name: "send-amount" });
		} else if (search.flow === "bank") {
			resetSend();
			setView({ name: "bank" });
		} else if (search.flow === "request") {
			resetSend();
			setView({
				name: "request",
				initialPhase: "create"
			});
		}
	}, [
		search.flow,
		search.upiId,
		search.name,
		search.amount
	]);
	const confirmPayment = async () => {
		if (!effectiveAccountId) return;
		setSheetOpen(false);
		setView({ name: "send-processing" });
		try {
			const [created] = await Promise.all([addTransaction.mutateAsync({
				type: "expense",
				amountPaise,
				category: "others",
				note: buildUpiNoteWithUserNote(payeeName, note),
				dateISO: todayISO(),
				payMode: "upi_test",
				accountId: effectiveAccountId
			}), delay(1e3)]);
			setReceipt({
				status: "success",
				txn: created
			});
			toast.success("Payment recorded", {
				description: `${formatINR(amountPaise)} to ${payeeName || "recipient"} · simulated UPI`,
				action: {
					label: "Undo",
					onClick: () => {
						deleteTransaction.mutate(created.id, {
							onSuccess: () => toast.success("Payment reversed"),
							onError: () => toast.error("Couldn't reverse — delete it from History.")
						});
					}
				},
				duration: 8e3
			});
		} catch (err) {
			setReceipt({
				status: "failure",
				reason: err instanceof Error ? err.message : "The payment could not be recorded."
			});
		}
		setView({ name: "send-receipt" });
	};
	const handleScan = (payload) => {
		setScanOpen(false);
		navigate({
			to: "/payments",
			search: {
				flow: "upi",
				upiId: payload.upiId,
				...payload.name ? { name: payload.name } : {},
				...payload.amountPaise !== null ? { amount: String(payload.amountPaise) } : {}
			}
		});
	};
	const doRefund = async () => {
		if (!receipt?.txn) return;
		try {
			const refundTxn = await refundPayment.mutateAsync({ payment: receipt.txn });
			setRefund({ txn: refundTxn });
			toast.success("Refund recorded", { description: `${formatINR(receipt.txn.amountPaise)} credited back · simulated` });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't record the refund — try again.");
		}
	};
	if (view.name === "send-recipient") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipientStep, {
		initial: payeeName,
		mode: payeeMode,
		onBack: goHome,
		onContinue: (name) => startSendTo(name, payeeMode)
	});
	if (view.name === "send-amount") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowHeader, {
				title: `Pay ${payeeName || "someone"}`,
				onBack: goHome
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Simulated UPI — no real money moves."
			}),
			accountsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-2xl" }) : accounts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					title: "No accounts yet",
					body: "Create an account first — simulated UPI payments debit a FinVerse account."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setAccountDialogOpen(true),
					className: cn(pressable, "h-12 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
					children: "Create account"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
						className: "size-5 shrink-0 text-muted-foreground",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: "Paying from"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Funding account",
							value: effectiveAccountId ?? "",
							onChange: (e) => setAccountId(e.target.value || null),
							className: "w-full bg-transparent text-sm font-bold text-foreground outline-none",
							children: accounts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s.account.id,
								children: s.account.name
							}, s.account.id))
						})]
					}),
					selectedAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
						paise: selectedAccount.balancePaise,
						className: "text-sm font-bold text-foreground"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountInput, {
				confirmLabel: "Continue",
				maxPaise: MAX_PAYMENT_PAISE,
				onConfirm: (paise) => {
					setAmountPaise(paise);
					setSheetOpen(true);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm font-bold text-foreground",
					children: ["Note ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal text-muted-foreground",
						children: "(optional)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "What's this for?",
					maxLength: 200,
					className: "h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaymentSheet, {
				open: sheetOpen,
				onOpenChange: setSheetOpen,
				recipientName: payeeName || "Recipient",
				recipientDetail: payeeMode === "upi-id" && isValidUpiId(payeeName) ? payeeName : "Simulated UPI",
				amountPaise,
				fundingSource: selectedAccount?.account.name ?? "Account",
				...selectedAccount ? { fundingDetail: `Balance ${formatINR(selectedAccount.balancePaise)}` } : {},
				onProceed: confirmPayment,
				onUseAnotherMethod: () => setSheetOpen(false),
				children: [note.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 rounded-2xl bg-muted/60 px-4 py-2.5 text-sm text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-muted-foreground",
						children: "Note: "
					}), note.trim()]
				}), overBalance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "alert",
					className: "mt-3 rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger",
					children: [
						"Insufficient balance in ",
						selectedAccount?.account.name,
						". Lower the amount or pick another account."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountDialog, {
				open: accountDialogOpen,
				onOpenChange: setAccountDialogOpen,
				editing: null
			})
		]
	});
	if (view.name === "send-processing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
			status: "processing",
			amountPaise,
			counterparty: payeeName
		})
	});
	if (view.name === "send-receipt" && receipt) {
		if (refund) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center px-6 py-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "img",
						"aria-label": "Refund recorded",
						className: "grid size-20 place-items-center rounded-full bg-gain/15",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-10 text-gain",
							strokeWidth: 3,
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 text-xl font-bold text-foreground",
						children: "Refund recorded"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, {
						paise: amountPaise,
						className: "mt-2 text-3xl font-bold text-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: [
							"Credited back to",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: selectedAccount?.account.name ?? "your account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-6 w-full max-w-sm rounded-2xl border border-border bg-card text-left shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold text-muted-foreground uppercase",
								children: "Reference ID"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "truncate font-mono text-sm text-foreground",
								children: refund.txn.id
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold text-muted-foreground uppercase",
								children: "Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-sm text-foreground tabular-nums",
								children: formatDateTime(refund.txn.createdAt)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-muted-foreground",
						children: "The original payment now shows the Refunded status in History."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: goHome,
				className: cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline"),
				children: "Back to payments"
			})]
		});
		const parsed = parsePayeeNote("upi_test", receipt.txn?.note ?? payeeName);
		const refundable = receipt.status === "success" && receipt.txn && canRefundPayment(receipt.txn, refundedIds);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
					status: receipt.status,
					amountPaise,
					counterparty: payeeName,
					...receipt.txn ? {
						referenceId: receipt.txn.id,
						timestamp: formatDateTime(receipt.txn.createdAt)
					} : {},
					...receipt.reason ? { reason: receipt.reason } : {},
					onRetry: () => {
						setReceipt(null);
						setAmountPaise(0);
						setView({ name: "send-amount" });
					},
					retryLabel: receipt.status === "failure" ? "Retry payment" : "Pay again"
				}),
				refundable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefundButton, {
					onRefund: doRefund,
					pending: refundPayment.isPending
				}),
				parsed?.userNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mx-auto max-w-sm text-center text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Note:"
						}),
						" ",
						parsed.userNote
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-sm flex-col gap-2",
					children: receipt.status === "success" && receipt.txn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => downloadReceipt({
							statusLabel: "Success",
							amountPaise,
							counterparty: payeeName,
							railLabel: RAIL_LABEL["upi_test"] ?? "UPI · Test",
							referenceId: receipt.txn ? receipt.txn.id : void 0,
							timestamp: receipt.txn ? formatDateTime(receipt.txn.createdAt) : void 0,
							...parsed?.userNote ? { note: parsed.userNote } : {}
						}, `finverse-receipt-${receipt.txn?.id.slice(0, 8) ?? "receipt"}.txt`),
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							className: "size-4",
							"aria-hidden": true
						}), " Download receipt"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: goHome,
					className: cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline"),
					children: "Back to payments"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "Test mode — this was a simulated payment. No real money moved."
				})
			]
		});
	}
	if (view.name === "bank") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankTransferFlow, { onExit: goHome });
	if (view.name === "request") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestMoneySection, {
		people,
		onExit: goHome,
		...view.initialPhase ? { initialPhase: view.initialPhase } : {}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleSearch, {
				people,
				onSelectPerson: (p) => startSendTo(p.name),
				onPayUpiId: (upiId) => startSendTo(upiId, "upi-id")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"aria-label": "Payment actions",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-4 gap-x-2 gap-y-4",
					children: [
						{
							id: "scan",
							label: "Scan & Pay",
							sub: "QR code",
							icon: QrCode,
							onClick: () => setScanOpen(true)
						},
						{
							id: "pay-anyone",
							label: "Pay anyone",
							sub: "By name",
							icon: Users,
							onClick: () => startBlankSend("name")
						},
						{
							id: "bank",
							label: "Bank transfer",
							sub: "Account + IFSC",
							icon: Landmark,
							onClick: () => setView({ name: "bank" })
						},
						{
							id: "upi-id",
							label: "UPI ID",
							sub: "name@bank",
							icon: AtSign,
							onClick: () => startBlankSend("upi-id")
						},
						{
							id: "request",
							label: "Request",
							sub: "Ask for money",
							icon: HandCoins,
							onClick: () => setView({ name: "request" })
						},
						{
							id: "recharge",
							label: "Recharge",
							sub: "Mobile",
							icon: Smartphone,
							onClick: () => setRechargeOpen(true)
						},
						{
							id: "bills",
							label: "Bills",
							sub: "Utilities",
							icon: ReceiptIndianRupee,
							onClick: () => billsRef.current?.scrollIntoView({
								behavior: "smooth",
								block: "start"
							})
						}
					].map(({ id, label, sub, icon: Icon, onClick }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick,
						"aria-label": label,
						className: cn(pressable, "group flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "grid size-12 place-items-center rounded-2xl border border-border/70 bg-card text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors group-hover:border-primary/40 group-hover:bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									strokeWidth: 2.1
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold leading-tight text-foreground",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "-mt-1 text-[10px] leading-tight text-muted-foreground",
								children: sub
							})
						]
					}) }, id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Recent people",
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold text-foreground",
						children: "People"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleStrip, {
						people,
						onSelect: (p) => startSendTo(p.name)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => startBlankSend("name"),
							className: cn(pressable, "flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								className: "size-4",
								"aria-hidden": true
							}), " New payment"]
						})
					})
				]
			}),
			pendingRequests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Pending requests",
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-bold text-foreground",
						children: [
							"Requests · ",
							pendingRequests.length,
							" pending"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setView({ name: "request" }),
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "text-xs font-bold text-primary hover:underline"),
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: pendingRequests.slice(0, 2).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCard, { request: r }, r.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: billsRef,
				className: "scroll-mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillsCard, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScannerDialog, {
				open: scanOpen,
				onOpenChange: setScanOpen,
				onScan: handleScan
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RechargeDialog, {
				open: rechargeOpen,
				onOpenChange: setRechargeOpen
			})
		]
	});
}
/** Two-tap confirm refund button (danger-styled on confirm). */
function RefundButton({ onRefund, pending }) {
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-sm flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: pending,
			onClick: () => {
				if (confirming) {
					setConfirming(false);
					onRefund();
				} else setConfirming(true);
			},
			onBlur: () => setConfirming(false),
			className: cn(pressable, "flex h-12 items-center justify-center gap-2 rounded-full border text-sm font-bold transition-colors disabled:opacity-50", confirming ? "border-loss/40 bg-loss/10 text-loss hover:bg-loss/20" : "border-border bg-card text-foreground hover:bg-muted/60"),
			children: pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": true
			}), " Recording refund…"] }) : confirming ? "Tap again to confirm refund" : "Refund this payment"
		}), confirming && !pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-center text-xs text-muted-foreground",
			children: "This credits the amount back to the funding account."
		})]
	});
}
function RecipientStep({ initial, mode = "name", onBack, onContinue }) {
	const [name, setName] = (0, import_react.useState)(initial);
	const trimmed = buildUpiNote(name);
	const valid = mode === "name" ? trimmed.length > 0 : isValidUpiId(trimmed) || /^\d{10}$/.test(trimmed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onBack,
					"aria-label": "Back",
					className: cn(pressable, "grid size-10 place-items-center rounded-full text-foreground hover:bg-muted/60"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "truncate text-base font-bold text-foreground",
					children: "New payment"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Simulated UPI — no real money moves."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-bold text-foreground",
					children: mode === "name" ? "Recipient name" : "UPI ID or mobile number"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: mode === "name" ? "e.g. Aarav Sharma" : "name@bank or 98765 43210",
					maxLength: 120,
					autoFocus: true,
					className: "h-13 rounded-2xl border border-input bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "-mt-2 text-xs text-muted-foreground",
				children: mode === "name" ? "Pay anyone by name — the payment is recorded in your FinVerse ledger." : "Enter the recipient's UPI ID (name@bank) or 10-digit mobile number."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: !valid,
				onClick: () => onContinue(buildUpiNote(name)),
				className: cn(pressable, "h-12 rounded-full px-8 text-sm font-bold transition-colors", valid ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "cursor-not-allowed bg-muted text-muted-foreground"),
				children: "Continue"
			})
		]
	});
}
function RazorpayTab() {
	const [rzPhase, setRzPhase] = (0, import_react.useState)("amount");
	const [waitingLinkId, setWaitingLinkId] = (0, import_react.useState)(null);
	const [waitingShortUrl, setWaitingShortUrl] = (0, import_react.useState)(null);
	const [doneRecord, setDoneRecord] = (0, import_react.useState)(null);
	const [createError, setCreateError] = (0, import_react.useState)(null);
	const [setupOpen, setSetupOpen] = (0, import_react.useState)(false);
	const statusQuery = useRazorpayStatus();
	const linksQuery = usePaymentLinks(rzPhase === "waiting");
	const paymentsQuery = usePayments(rzPhase === "waiting");
	const createLink = useCreatePaymentLink();
	const configured = statusQuery.data?.configured ?? false;
	const waitingRecord = (paymentsQuery.data ?? []).find((p) => p.paymentLinkId === waitingLinkId);
	const settled = waitingRecord && waitingRecord.status === "captured" && waitingRecord.webhookVerified ? "success" : waitingRecord && waitingRecord.status === "failed" ? "failed" : null;
	const startLink = async (amountPaise) => {
		setCreateError(null);
		try {
			const created = await createLink.mutateAsync({
				amountPaise,
				note: "FinVerse test payment"
			});
			setWaitingLinkId(created.linkId);
			setWaitingShortUrl(created.shortUrl);
			setRzPhase("waiting");
		} catch (err) {
			setCreateError(err instanceof Error ? err.message : "Could not create the payment link.");
		}
	};
	const resetRazorpay = () => {
		setRzPhase("amount");
		setWaitingLinkId(null);
		setWaitingShortUrl(null);
		setDoneRecord(null);
		setCreateError(null);
	};
	if (statusQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-2xl" })]
	});
	if (statusQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Couldn't check Razorpay status",
		body: "We couldn't reach the server to check whether Razorpay test mode is configured.",
		onRetry: () => statusQuery.refetch()
	});
	if (!configured) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-14 place-items-center rounded-full bg-tint",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, {
					className: "size-6 text-primary",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold text-foreground",
				children: "Razorpay test keys not configured"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted-foreground",
				children: "Nothing here is a real payment — and nothing here fakes one either. Until the test-mode keys are set, this rail stays honestly unavailable."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-[14px] border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-expanded": setupOpen,
					onClick: () => setSetupOpen((o) => !o),
					className: cn(pressable, "flex w-full items-center justify-between px-4 py-3 text-left"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold text-foreground",
						children: "Setup instructions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
						className: cn("size-4 text-muted-foreground transition-transform duration-200", setupOpen && "rotate-180"),
						"aria-hidden": true
					})]
				}), setupOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 border-t border-border px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm leading-6 text-muted-foreground",
						children: [
							"Razorpay test mode needs server-only keys. Add",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
								children: "RAZORPAY_KEY_ID"
							}),
							" ",
							"and",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
								children: "RAZORPAY_KEY_SECRET"
							}),
							" ",
							"(test-mode keys only) to the server environment, plus",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
								children: "SUPABASE_SERVICE_ROLE_KEY"
							}),
							" ",
							"for the webhook. Then register the webhook URL in the Razorpay dashboard (test mode):"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
						className: "block truncate rounded-xl bg-muted px-3 py-2 font-mono text-xs text-foreground",
						children: [typeof window !== "undefined" ? window.location.origin : "", "/api/razorpay-webhook"]
					})]
				})]
			})
		]
	});
	if (isSetupPendingError(linksQuery.error) || isSetupPendingError(paymentsQuery.error)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Payments database setup pending",
		body: "The payments tables don't exist yet. Run supabase/migrations/0002_revamp.sql in the Supabase SQL editor, then try again.",
		onRetry: () => {
			linksQuery.refetch();
			paymentsQuery.refetch();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			rzPhase === "amount" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-bold text-foreground",
							children: "Razorpay test payment"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs leading-5 text-muted-foreground",
							children: [
								"Creates a real Razorpay ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "test-mode"
								}),
								" payment link and opens it in a new tab. Pay with Razorpay's test credentials, then return here — success is confirmed by the webhook, never by this screen."
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountInput, {
						confirmLabel: "Create test payment link",
						onConfirm: startLink
					}),
					createError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger",
						children: createError
					})
				]
			}),
			rzPhase === "waiting" && !settled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "status",
						"aria-label": "Waiting for payment",
						className: "grid size-16 place-items-center rounded-full bg-info-soft",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-8 animate-spin text-info",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-foreground",
						children: "Waiting for payment…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm leading-6 text-muted-foreground",
						children: "The test payment link opened in a new tab. Complete the payment there, then come back — this screen polls for the webhook confirmation every few seconds."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-center gap-2",
						children: [waitingShortUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => window.open(waitingShortUrl, "_blank", "noopener,noreferrer"),
							className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "size-4",
								"aria-hidden": true
							}), " Reopen payment link"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: resetRazorpay,
							className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted/60"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "size-4",
								"aria-hidden": true
							}), " Cancel"]
						})]
					})
				]
			}),
			rzPhase === "waiting" && settled && waitingRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
					status: settled === "success" ? "success" : "failure",
					amountPaise: waitingRecord.amountPaise,
					counterparty: "Razorpay test payment",
					referenceId: waitingRecord.razorpayPaymentId,
					timestamp: formatDateTime(waitingRecord.createdAt),
					...waitingRecord.failureReason ? { reason: waitingRecord.failureReason } : {},
					onRetry: resetRazorpay,
					retryLabel: "New test payment"
				}), settled === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "Confirmed by webhook — captured and verified. Test mode, no real money moved."
				})]
			}),
			rzPhase === "done" && doneRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
					status: doneRecord.status === "captured" ? "success" : doneRecord.status === "failed" ? "failure" : "processing",
					amountPaise: doneRecord.amountPaise,
					counterparty: "Razorpay test payment",
					referenceId: doneRecord.razorpayPaymentId,
					timestamp: formatDateTime(doneRecord.createdAt),
					...doneRecord.failureReason ? { reason: doneRecord.failureReason } : {},
					onRetry: resetRazorpay,
					retryLabel: "New test payment"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentLinks, { onSelect: (r) => {
				setDoneRecord(r);
				setRzPhase("done");
			} })
		]
	});
}
function RecentLinks({ onSelect }) {
	const { data: links, isLoading } = usePaymentLinks(false);
	const { data: payments } = usePayments(false);
	const byLink = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const p of payments ?? []) if (p.paymentLinkId && !m.has(p.paymentLinkId)) m.set(p.paymentLinkId, p);
		return m;
	}, [payments]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-2xl" });
	if (!links || links.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Recent payment links",
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-bold text-foreground",
			children: "Recent links"
		}), links.slice(0, 5).map((l) => {
			const rec = byLink.get(l.id);
			const chip = rec ? rec.status === "captured" ? {
				label: "Captured",
				tone: "gain"
			} : rec.status === "failed" ? {
				label: "Failed",
				tone: "loss"
			} : {
				label: "Pending",
				tone: "neutral"
			} : l.status === "paid" ? {
				label: "Paid",
				tone: "gain"
			} : l.status === "expired" || l.status === "cancelled" ? {
				label: l.status === "expired" ? "Expired" : "Cancelled",
				tone: "neutral"
			} : {
				label: "Open",
				tone: "neutral"
			};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => rec && onSelect(rec),
				disabled: !rec,
				className: cn(pressable, "flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3 text-left shadow-card", rec ? "hover:bg-muted/40" : "opacity-80"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-bold text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberDisplay, { paise: l.amountPaise })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted-foreground",
							children: formatDateTime(l.createdAt)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase", chip.tone === "gain" && "bg-gain/15 text-gain", chip.tone === "loss" && "bg-loss/15 text-loss", chip.tone === "neutral" && "bg-muted text-muted-foreground"),
						children: chip.label
					}),
					rec && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
						className: "size-4 shrink-0 text-muted-foreground",
						"aria-hidden": true
					})
				]
			}, l.id);
		})]
	});
}
var HISTORY_FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "success",
		label: "Successful"
	},
	{
		id: "pending",
		label: "Pending"
	},
	{
		id: "failed",
		label: "Failed"
	},
	{
		id: "refunded",
		label: "Refunded"
	}
];
function HistoryTab() {
	const [detail, setDetail] = (0, import_react.useState)(null);
	const [categorizing, setCategorizing] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const txnsQuery = useTransactions();
	const paymentsQuery = usePayments(false);
	const deleteTxn = useDeleteTransaction();
	const updateTxn = useUpdateTransaction();
	const refundedIds = (0, import_react.useMemo)(() => refundedTxnIds(txnsQuery.data ?? []), [txnsQuery.data]);
	const paymentTxns = (0, import_react.useMemo)(() => (txnsQuery.data ?? []).filter(isPaymentTransaction), [txnsQuery.data]);
	const paymentByTxnId = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const p of paymentsQuery.data ?? []) if (p.transactionId) m.set(p.transactionId, p);
		return m;
	}, [paymentsQuery.data]);
	/** Distinct payment status: success / pending / failed / refunded. */
	const statusOf = (t) => {
		if (t.payMode === "razorpay_test") return toTxnStatus(paymentByTxnId.get(t.id)?.status ?? "created");
		return paymentDisplayStatus(t, refundedIds);
	};
	const nameOf = (t) => {
		if (t.refundOf) return t.note || "Refund";
		if (t.payMode === "upi_test") {
			const parsed = parsePayeeNote("upi_test", t.note);
			return parsed ? `UPI · ${parsed.name}` : t.note || "UPI payment";
		}
		if (t.payMode === "bank_test") {
			const parsed = parsePayeeNote("bank_test", t.note);
			return parsed ? `Bank · ${parsed.name}` : "Bank transfer";
		}
		return "Razorpay test payment";
	};
	const rowStatus = (t) => {
		const s = statusOf(t);
		return s === "refunded" ? "success" : s;
	};
	const secondaryOf = (t) => {
		const base = `${formatDay(t.dateISO)} · ${RAIL_LABEL[t.payMode] ?? t.payMode}`;
		return statusOf(t) === "refunded" ? `${base} · Refunded` : base;
	};
	const q = query.trim().toLowerCase();
	const matchesQuery = (t) => q.length === 0 || nameOf(t).toLowerCase().includes(q) || t.note.toLowerCase().includes(q) || String(t.amountPaise / 100).includes(q);
	const filtered = paymentTxns.filter((t) => matchesQuery(t) && (filter === "all" || filter === "success" && statusOf(t) === "success" || filter === "pending" && statusOf(t) === "pending" || filter === "failed" && statusOf(t) === "failed" || filter === "refunded" && statusOf(t) === "refunded"));
	const groups = (0, import_react.useMemo)(() => groupTransactionsByMonth(filtered), [filtered]);
	if (txnsQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3",
		children: [
			0,
			1,
			2,
			3
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-2xl" }, i))
	});
	if (txnsQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Couldn't load payment history",
		body: "We couldn't load your payments. Check your connection and try again.",
		onRetry: () => txnsQuery.refetch()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-2xl border border-input bg-card px-4 shadow-card focus-within:border-primary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "size-4 shrink-0 text-muted-foreground",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search payments…",
						"aria-label": "Search payment history",
						className: "h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Clear search",
						onClick: () => setQuery(""),
						className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-4",
							"aria-hidden": true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				role: "group",
				"aria-label": "Filter by status",
				children: HISTORY_FILTERS.map(({ id, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill$1, {
					size: "md",
					variant: filter === id ? "accent" : "neutral",
					onClick: () => setFilter(id),
					label: `Show ${label.toLowerCase()} payments`,
					children: label
				}, id))
			}),
			paymentTxns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No payments yet",
				body: "Simulated UPI and bank payments plus Razorpay test payments will show up here, grouped by month."
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No matches",
				body: "No payments match this search or filter. Try a different term."
			}) : groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": g.label,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "sticky top-0 z-10 bg-background/95 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground backdrop-blur",
					children: g.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex flex-col gap-2",
					children: g.items.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnRow, {
						name: nameOf(t),
						secondary: secondaryOf(t),
						amountPaise: t.type === "income" ? t.amountPaise : -t.amountPaise,
						status: rowStatus(t),
						onClick: () => setDetail(t),
						swipeActions: {
							onCategorize: () => setCategorizing(t),
							onDelete: () => deleteTxn.mutate(t.id, {
								onSuccess: () => toast.success("Payment deleted"),
								onError: () => toast.error("Couldn't delete — try again.")
							})
						}
					}, t.id))
				})]
			}, g.monthKey)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: detail !== null,
				onOpenChange: (open) => !open && setDetail(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "sr-only",
						children: "Payment receipt"
					}), detail && (() => {
						const rec = paymentByTxnId.get(detail.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryDetail, {
							txn: detail,
							...rec ? { record: rec } : {},
							status: statusOf(detail),
							refundedIds,
							onClose: () => setDetail(null)
						});
					})()]
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorizeSheet, {
		open: categorizing !== null,
		onOpenChange: (o) => {
			if (!o) setCategorizing(null);
		},
		currentCategory: categorizing?.category,
		onPick: (categoryId) => {
			const target = categorizing;
			setCategorizing(null);
			if (!target) return;
			updateTxn.mutate({
				id: target.id,
				patch: { category: categoryId }
			}, {
				onSuccess: () => toast.success("Payment recategorized"),
				onError: () => toast.error("Couldn't update — try again.")
			});
		}
	})] });
}
var DETAIL_STATUS_LABEL = {
	success: "Successful",
	pending: "Pending",
	failed: "Failed",
	refunded: "Refunded"
};
function HistoryDetail({ txn, record, status, refundedIds, onClose }) {
	const [confirmRefund, setConfirmRefund] = (0, import_react.useState)(false);
	const refundPayment = useRefundPayment();
	const refundable = canRefundPayment(txn, refundedIds);
	const receiptStatus = status === "success" || status === "refunded" ? "success" : status === "failed" ? "failure" : "processing";
	const counterparty = txn.refundOf ? txn.note || "Refund" : txn.payMode === "upi_test" ? parsePayeeNote("upi_test", txn.note)?.name ?? txn.note ?? "UPI payment" : txn.payMode === "bank_test" ? (() => {
		const p = parsePayeeNote("bank_test", txn.note);
		return p ? `${p.name} · ${p.detail ?? ""}`.trim() : "Bank transfer";
	})() : "Razorpay test payment";
	const doRefund = async () => {
		try {
			await refundPayment.mutateAsync({ payment: txn });
			toast.success("Refund recorded", { description: `${formatINR(txn.amountPaise)} credited back · simulated` });
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't record the refund — try again.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
				status: receiptStatus,
				amountPaise: txn.amountPaise,
				counterparty,
				referenceId: record?.razorpayPaymentId ?? txn.id,
				timestamp: formatDateTime(txn.createdAt),
				...record?.failureReason ? { reason: record.failureReason } : {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/60 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-semibold text-muted-foreground uppercase",
							children: "Rail"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 font-bold text-foreground",
							children: RAIL_LABEL[txn.payMode] ?? txn.payMode
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/60 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-semibold text-muted-foreground uppercase",
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: cn("mt-0.5 font-bold", status === "success" && "text-gain", status === "refunded" && "text-info", status === "failed" && "text-loss", status === "pending" && "text-info"),
							children: DETAIL_STATUS_LABEL[status]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/60 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-semibold text-muted-foreground uppercase",
							children: "Method"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 font-bold text-foreground tabular-nums",
							children: record?.method ? record.method.toUpperCase() : "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/60 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-semibold text-muted-foreground uppercase",
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-0.5 truncate font-bold text-foreground",
							children: txn.note || "—"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => downloadReceipt({
						statusLabel: DETAIL_STATUS_LABEL[status],
						amountPaise: txn.amountPaise,
						counterparty,
						railLabel: RAIL_LABEL[txn.payMode] ?? txn.payMode,
						referenceId: record?.razorpayPaymentId ?? txn.id,
						timestamp: formatDateTime(txn.createdAt),
						...txn.note ? { note: txn.note } : {}
					}, `finverse-receipt-${txn.id.slice(0, 8)}.txt`),
					className: cn(pressable, "flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted/60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "size-4",
						"aria-hidden": true
					}), " Download receipt"]
				}), refundable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: refundPayment.isPending,
					onClick: () => {
						if (confirmRefund) {
							setConfirmRefund(false);
							doRefund();
						} else setConfirmRefund(true);
					},
					onBlur: () => setConfirmRefund(false),
					className: cn("transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95", "flex h-11 items-center justify-center gap-2 rounded-full border text-sm font-bold transition-colors disabled:opacity-50", confirmRefund ? "border-loss/40 bg-loss/10 text-loss hover:bg-loss/20" : "border-border bg-card text-foreground hover:bg-muted/60"),
					children: refundPayment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), " Recording refund…"] }) : confirmRefund ? "Tap again to confirm refund" : "Refund this payment"
				})]
			})
		]
	});
}
//#endregion
export { PaymentsPage as component };
