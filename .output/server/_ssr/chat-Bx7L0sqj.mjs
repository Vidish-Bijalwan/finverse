import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, i as monthLabel, r as monthKey, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { an as Bot, j as SendHorizontal } from "../_libs/lucide-react.mjs";
import { o as categoryById, t as ALL_CATEGORIES } from "./categories-BtDQEnJC.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { O as loadFinanceDB } from "./db-36JnVPiF.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as previousMonth, r as billStatuses } from "./engine-DI3Og_II.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-Bx7L0sqj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChatMessage({ msg }) {
	const isUser = msg.role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex gap-2", isUser ? "justify-end" : "justify-start"),
		children: [!isUser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "grid size-8 shrink-0 place-items-center rounded-full bg-primary/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4 text-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6", isUser ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border bg-card text-card-foreground"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-wrap",
				children: msg.text
			}), msg.link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: msg.link.to,
				className: "mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline",
				children: [
					msg.link.label,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "→"
					})
				]
			})]
		})]
	});
}
var sumT = (txns) => txns.reduce((s, t) => s + t.amountPaise, 0);
var pctOf = (v) => `${Math.round(v * 100)}%`;
var catName = (id) => categoryById(id)?.label ?? id;
/**
* Local pure replacements for the store.ts helpers this page used.
* They operate on the FinanceDB passed in — no storage access.
*/
function listTransactions(db, monthKey) {
	return [...monthKey ? db.transactions.filter((t) => t.dateISO.startsWith(monthKey)) : db.transactions].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}
function getBudgets(db, month) {
	return db.budgets.filter((b) => b.month === month);
}
/** Find a category mentioned in the query, by id or a label word (len >= 4). */
function detectCategory(t) {
	for (const c of ALL_CATEGORIES) {
		if (t.includes(c.id)) return c;
		if (c.label.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4).some((w) => t.includes(w))) return c;
	}
}
var FALLBACK = "I can answer questions about your spending, budgets, bills, goals and portfolio — try one of the suggestions.";
function answerQuery(q, db) {
	const t = q.toLowerCase().trim();
	if (!t) return { text: FALLBACK };
	const today = todayISO();
	const key = monthKey(today);
	const prev = previousMonth(key);
	const label = monthLabel(key);
	const prevLabel = monthLabel(prev);
	const expenses = (k) => listTransactions(db, k).filter((x) => x.type === "expense");
	const income = (k) => listTransactions(db, k).filter((x) => x.type === "income");
	if (/bill|due/.test(t)) {
		const upcoming = billStatuses(db, today).filter((s) => !s.paid);
		if (upcoming.length === 0) return { text: "No upcoming bills — everything due is paid." };
		return { text: `Here are your upcoming bills:\n${upcoming.slice(0, 6).map((s) => {
			const when = s.daysUntil < 0 ? `overdue by ${-s.daysUntil} day${-s.daysUntil === 1 ? "" : "s"}` : s.daysUntil === 0 ? "due today" : `due in ${s.daysUntil} day${s.daysUntil === 1 ? "" : "s"}`;
			return `• ${s.bill.name}: ${formatINR(s.bill.amountPaise)} — ${when} (${s.dueISO})`;
		}).join("\n")}` };
	}
	if (/goal/.test(t)) {
		if (db.goals.length === 0) return { text: "You haven't set any goals yet." };
		return { text: `Your goals:\n${db.goals.map((g) => {
			const done = g.targetPaise > 0 ? Math.round(g.savedPaise / g.targetPaise * 100) : 0;
			return `• ${g.name}: ${formatINR(g.savedPaise)} of ${formatINR(g.targetPaise)} (${done}%) — deadline ${g.deadline}`;
		}).join("\n")}` };
	}
	if (/budget/.test(t)) {
		const budgets = getBudgets(db, key);
		if (budgets.length === 0) return { text: `No budgets are set for ${label} yet.` };
		const spend = /* @__PURE__ */ new Map();
		for (const x of expenses(key)) spend.set(x.category, (spend.get(x.category) ?? 0) + x.amountPaise);
		return { text: `Budget status for ${label}:\n${budgets.map((b) => {
			const spent = spend.get(b.categoryId) ?? 0;
			const used = b.limitPaise > 0 ? Math.round(spent / b.limitPaise * 100) : 0;
			const tail = spent > b.limitPaise ? ` — over by ${formatINR(spent - b.limitPaise)}` : ` — ${formatINR(b.limitPaise - spent)} left`;
			return `• ${catName(b.categoryId)}: ${formatINR(spent)} of ${formatINR(b.limitPaise)} (${used}%)${tail}`;
		}).join("\n")}` };
	}
	if (/saving|save/.test(t)) {
		const inc = sumT(income(key));
		const exp = sumT(expenses(key));
		if (inc <= 0) return { text: `I couldn't find any income recorded for ${label}, so I can't compute a savings rate yet.` };
		const rate = (inc - exp) / inc;
		const incPrev = sumT(income(prev));
		let extra = "";
		if (incPrev > 0) extra = `\nLast month it was ${pctOf((incPrev - sumT(expenses(prev))) / incPrev)}.`;
		return { text: `Your savings rate for ${label} is ${pctOf(rate)} — ${formatINR(inc)} income minus ${formatINR(exp)} expenses.${extra}` };
	}
	if (/invest|portfolio/.test(t)) {
		if (db.holdings.length === 0) return { text: "You don't hold any investments yet." };
		const lines = db.holdings.map((h) => {
			const value = Math.round(h.qty * h.avgPricePaise);
			return `• ${h.symbol}: ${h.qty} × ${formatINR(h.avgPricePaise)} = ${formatINR(value)}`;
		});
		const total = db.holdings.reduce((s, h) => s + Math.round(h.qty * h.avgPricePaise), 0);
		return {
			text: `Your portfolio is worth ${formatINR(total)} at average buy price (not live market prices):\n${lines.join("\n")}\n\nWant the full picture?`,
			link: {
				to: "/readiness",
				label: "Check your investment readiness score"
			}
		};
	}
	if (/spend|spent|expense/.test(t)) {
		const cat = detectCategory(t);
		const cur = expenses(key);
		if (cat) {
			const amt = sumT(cur.filter((x) => x.category === cat.id));
			const amtPrev = sumT(expenses(prev).filter((x) => x.category === cat.id));
			const vsPrev = amtPrev > 0 ? `, vs ${formatINR(amtPrev)} in ${prevLabel}` : "";
			return { text: `You spent ${formatINR(amt)} on ${cat.label} in ${label}${vsPrev}.` };
		}
		const total = sumT(cur);
		if (cur.length === 0) return { text: `You haven't logged any spending in ${label} yet.` };
		const totalPrev = sumT(expenses(prev));
		const byCat = /* @__PURE__ */ new Map();
		for (const x of cur) byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amountPaise);
		const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, a]) => `${catName(id)} ${formatINR(a)}`).join(" · ");
		const vsPrev = totalPrev > 0 ? ` (vs ${formatINR(totalPrev)} in ${prevLabel})` : "";
		return { text: `You spent ${formatINR(total)} in ${label}${vsPrev}.${top ? `\nTop categories: ${top}` : ""}` };
	}
	if (/\b(hi|hello|hey)\b/.test(t)) return { text: "Hello! I'm FinVerse AI. Ask me about your spending, savings rate, budgets, bills, goals, or portfolio — or tap one of the suggestions below." };
	return { text: FALLBACK };
}
var SUGGESTIONS = [
	"How much did I spend this month?",
	"What's my savings rate?",
	"Which bills are due soon?",
	"How are my goals doing?"
];
var msgSeq = 0;
var nextId = () => `msg-${Date.now()}-${msgSeq += 1}`;
function ChatPage() {
	const dbQuery = useQuery({
		queryKey: ["finverse", "db"],
		queryFn: loadFinanceDB
	});
	const [messages, setMessages] = (0, import_react.useState)([{
		id: "welcome",
		role: "ai",
		text: "Hi! I'm FinVerse AI. Ask me anything about your money — spending, savings, budgets, bills, goals, or your portfolio."
	}]);
	const [input, setInput] = (0, import_react.useState)("");
	const [typing, setTyping] = (0, import_react.useState)(false);
	const timer = (0, import_react.useRef)(null);
	const bottomRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => {
		if (timer.current) clearTimeout(timer.current);
	}, []);
	(0, import_react.useEffect)(() => {
		bottomRef.current?.scrollIntoView({
			behavior: "auto",
			block: "end"
		});
	}, [messages, typing]);
	const send = (raw) => {
		const text = raw.trim();
		if (!text || typing) return;
		setMessages((m) => [...m, {
			id: nextId(),
			role: "user",
			text
		}]);
		setInput("");
		setTyping(true);
		timer.current = setTimeout(() => {
			const answer = dbQuery.data ? answerQuery(text, dbQuery.data) : dbQuery.isError ? { text: "I couldn't load your data just now — please reload the page and try again." } : { text: "Still loading your data — one moment…" };
			setMessages((m) => [...m, {
				id: nextId(),
				role: "ai",
				...answer
			}]);
			setTyping(false);
		}, 600);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[calc(100dvh-4rem)] flex-col bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-1 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-black tracking-tight",
						children: "FinVerse AI Chat"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Answers computed from your real data"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "log",
					"aria-live": "polite",
					"aria-label": "Chat messages",
					className: "flex-1 space-y-4 overflow-y-auto py-4",
					children: [
						messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMessage, { msg: m }, m.id)),
						typing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							"aria-label": "FinVerse AI is typing",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "grid size-8 shrink-0 place-items-center rounded-full bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 text-sm text-muted-foreground",
								children: "typing…"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto pb-2",
						"aria-label": "Suggested questions",
						children: SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: typing,
							onClick: () => send(s),
							className: "shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50",
							children: s
						}, s))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							send(input);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: input,
							onChange: (e) => setInput(e.target.value),
							placeholder: "Ask about your money…",
							"aria-label": "Ask FinVerse AI",
							autoComplete: "off",
							className: "flex-1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							disabled: typing || !input.trim(),
							"aria-label": "Send message",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SendHorizontal, { className: "size-4" })
						})]
					})]
				})
			]
		})
	});
}
//#endregion
export { answerQuery, ChatPage as component };
