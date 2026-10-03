import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, t as formatINR } from "./format-DIQ2AWaF.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as categoryById } from "./categories-BtDQEnJC.mjs";
import { O as loadFinanceDB } from "./db-36JnVPiF.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as isInvestmentOrder } from "./investments-rsCq6eP0.mjs";
import { n as anomalyInsights, r as billStatuses, s as loadStreakState, u as weeklyDigest } from "./engine-DI3Og_II.mjs";
import { l as watchlistAlerts } from "./watchlist-G_EWDB_C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notify-B4KX_gM_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var NOTIFICATIONS_STORE_KEY = "finverse:notifications:v1";
var isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
function readStoredIds() {
	if (!isBrowser()) return [];
	try {
		const raw = window.localStorage.getItem(NOTIFICATIONS_STORE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
	} catch {
		return [];
	}
}
function writeStoredIds(ids) {
	if (!isBrowser()) return;
	try {
		window.localStorage.setItem(NOTIFICATIONS_STORE_KEY, JSON.stringify(ids));
	} catch {}
}
var KIND_PRIORITY = {
	bill: 0,
	price: 1,
	anomaly: 2,
	budget: 3,
	goal: 4,
	streak: 5,
	info: 6
};
/** Budgets for a month, from the passed DB (pure; replaces the store helper). */
function getBudgets(db, month) {
	return db.budgets.filter((b) => b.month === month);
}
function catLabel(id) {
	return categoryById(id)?.label ?? id;
}
/**
* Derive every current notification from the database. Stable ids per
* condition; sorted by urgency, then newest first.
*/
function collectNotifications(db) {
	const today = todayISO();
	const month = today.slice(0, 7);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const out = [];
	for (const s of billStatuses(db, today)) {
		if (s.paid) continue;
		const amount = formatINR(s.bill.amountPaise);
		if (s.daysUntil < 0) {
			const overdueBy = -s.daysUntil;
			out.push({
				id: `bill-overdue-${s.bill.id}`,
				kind: "bill",
				title: `${s.bill.name} overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`,
				body: `${amount} was due on ${s.dueISO}. Pay it soon to avoid late fees.`,
				to: "/bills",
				createdAt: s.dueISO
			});
		} else if (s.daysUntil <= 7) {
			const when = s.daysUntil === 0 ? "due today" : `due in ${s.daysUntil} day${s.daysUntil === 1 ? "" : "s"}`;
			out.push({
				id: `bill-due-${s.bill.id}`,
				kind: "bill",
				title: `${s.bill.name} ${when}`,
				body: `${amount} is due on ${s.dueISO}. Make sure it is covered in this week's spending.`,
				to: "/bills",
				createdAt: s.dueISO
			});
		}
	}
	const monthTxns = db.transactions.filter((t) => t.type === "expense" && !isInvestmentOrder(t) && t.dateISO.startsWith(month));
	const spendByCat = /* @__PURE__ */ new Map();
	for (const t of monthTxns) spendByCat.set(t.category, (spendByCat.get(t.category) ?? 0) + t.amountPaise);
	for (const b of getBudgets(db, month)) {
		if (b.limitPaise <= 0) continue;
		const spent = spendByCat.get(b.categoryId) ?? 0;
		const label = catLabel(b.categoryId);
		if (spent >= b.limitPaise) out.push({
			id: `budget-breach-${month}-${b.categoryId}`,
			kind: "budget",
			title: `Over budget: ${label}`,
			body: `${formatINR(spent)} of ${formatINR(b.limitPaise)} used — ${formatINR(spent - b.limitPaise)} over.`,
			to: "/budgets",
			createdAt: now
		});
		else if (spent >= b.limitPaise * .8) {
			const pctUsed = Math.round(spent / b.limitPaise * 100);
			out.push({
				id: `budget-warn-${month}-${b.categoryId}`,
				kind: "budget",
				title: `${label} budget ${pctUsed}% used`,
				body: `${formatINR(b.limitPaise - spent)} left of your ${formatINR(b.limitPaise)} ${label.toLowerCase()} budget.`,
				to: "/budgets",
				createdAt: now
			});
		}
	}
	for (const g of db.goals) {
		if (g.targetPaise <= 0) continue;
		const pctFunded = g.savedPaise / g.targetPaise * 100;
		const milestone = pctFunded >= 100 ? 100 : pctFunded >= 75 ? 75 : pctFunded >= 50 ? 50 : 0;
		if (milestone === 0) continue;
		out.push({
			id: `goal-${milestone}-${g.id}`,
			kind: "goal",
			title: milestone === 100 ? `Goal reached: ${g.name}!` : `${milestone}% of the way to ${g.name}`,
			body: milestone === 100 ? `You saved the full ${formatINR(g.targetPaise)}. Time to celebrate — or set a bigger target.` : `${formatINR(g.savedPaise)} of ${formatINR(g.targetPaise)} saved. ${formatINR(g.targetPaise - g.savedPaise)} to go.`,
			to: "/goals",
			createdAt: now
		});
	}
	for (const insight of anomalyInsights(db, month)) out.push({
		id: `anomaly-${month}-${insight.id}`,
		kind: "anomaly",
		title: insight.title,
		body: insight.body,
		to: "/insights",
		createdAt: insight.createdAt
	});
	const streak = loadStreakState(db);
	const held = streak.currentDays >= 30 ? 30 : streak.currentDays >= 14 ? 14 : streak.currentDays >= 7 ? 7 : 0;
	if (held > 0) out.push({
		id: `streak-${held}`,
		kind: "streak",
		title: `${held}-day savings streak!`,
		body: `You have stayed under your ${formatINR(streak.targetPaisePerDay)}/day target for ${streak.currentDays} days straight. Keep it going.`,
		to: "/insights",
		createdAt: today
	});
	const digest = weeklyDigest(db, today);
	out.push({
		id: `digest-${digest.weekStartISO}`,
		kind: "info",
		title: "Your weekly digest is ready",
		body: `Spent ${formatINR(digest.spentPaise)} this week · saved ${formatINR(digest.savedPaise)}. ${digest.tip}`,
		to: "/insights",
		createdAt: digest.weekStartISO
	});
	for (const a of watchlistAlerts(db)) out.push({
		id: a.id,
		kind: "price",
		title: a.title,
		body: a.body,
		to: a.to,
		createdAt: a.createdAt
	});
	return out.sort((a, b) => {
		const p = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
		if (p !== 0) return p;
		return b.createdAt.localeCompare(a.createdAt);
	});
}
/**
* Live notifications hook. Loads the whole DB through the Supabase data
* layer and derives every notification from it, so it stays in sync with
* mutations (e.g. a budget breach appears as soon as the overspending
* transaction is saved). Safe to call from the app shell.
*/
function useNotifications() {
	const dbQuery = useQuery({
		queryKey: ["finverse", "db"],
		queryFn: loadFinanceDB
	});
	const [readIds, setReadIds] = (0, import_react.useState)(() => readStoredIds());
	(0, import_react.useEffect)(() => {
		if (!isBrowser()) return;
		const onFocus = () => setReadIds(readStoredIds());
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, []);
	const notifications = (0, import_react.useMemo)(() => dbQuery.data ? collectNotifications(dbQuery.data) : [], [dbQuery.data]);
	const readSet = (0, import_react.useMemo)(() => new Set(readIds), [readIds]);
	const unread = notifications.filter((n) => !readSet.has(n.id)).length;
	const isRead = (id) => readSet.has(id);
	const markAllRead = () => {
		const merged = Array.from(/* @__PURE__ */ new Set([...readIds, ...notifications.map((n) => n.id)]));
		writeStoredIds(merged);
		setReadIds(merged);
	};
	return {
		notifications,
		unread,
		isRead,
		markAllRead
	};
}
//#endregion
export { useNotifications as t };
