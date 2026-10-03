import { a as todayISO } from "./format-DIQ2AWaF.mjs";
import { l as setCustomCategoryCache } from "./categories-BtDQEnJC.mjs";
import { n as getSupabase, t as getSessionUserId } from "./supabase-D8cuRV3S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db-36JnVPiF.js
/**
* Supabase data-access layer for FinVerse AI.
*
* Every function is scoped to the signed-in user: the user id is resolved via
* `uid()` and attached to every query (RLS enforces it server-side as well).
*
* ASSUMED SCHEMA (must match the migrations worker):
*   tables: transactions, budgets, bills, goals, holdings, accounts,
*           custom_categories, recurring_rules
*   every table: id uuid PK default gen_random_uuid(),
*                user_id uuid not null,
*                created_at / updated_at timestamptz default now()
*   transactions: type text, amount_paise int, category text, note text,
*     date_iso date, pay_mode text, goal_id uuid null, bill_id uuid null,
*     account_id uuid null, to_account_id uuid null, tags text[] default '{}',
*     recurring_rule_id uuid null
*   budgets: category_id text, month text ("YYYY-MM"), limit_paise int,
*     unique (user_id, category_id, month)
*   bills: name text, amount_paise int, due_day int, category text,
*     last_paid_on date null
*   goals: name text, target_paise int, saved_paise int, deadline date, color text
*   holdings: symbol text, qty numeric, avg_price_paise int
*   accounts: name text, type text, icon_name text, color text,
*     opening_balance_paise int, is_default bool default false
*   custom_categories: label text, icon_name text, color text, kind text
*   recurring_rules: type text, amount_paise int, category text, note text,
*     pay_mode text, account_id uuid null, to_account_id uuid null,
*     tags text[] default '{}', frequency text, start_date_iso date,
*     end_date_iso date null, last_posted_date_iso date null, is_paused bool default false
*/
/** Current user id; throws a clear error when there is no signed-in user. */
async function uid() {
	return getSessionUserId();
}
function isNoRows(error) {
	return !!error && error.code === "PGRST116";
}
function assertPaise(amountPaise) {
	if (!Number.isInteger(amountPaise) || amountPaise < 0) throw new Error(`Amount must be a non-negative integer number of paise, got ${amountPaise}`);
}
function assertDateISO(value, field) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN((/* @__PURE__ */ new Date(`${value}T12:00:00`)).getTime())) throw new Error(`${field} must be a valid YYYY-MM-DD date, got "${value}"`);
}
var HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
/** Trim, drop empties, dedupe (case-insensitive), cap count/length. */
function normalizeTags(tags) {
	if (!Array.isArray(tags)) return [];
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const raw of tags) {
		if (typeof raw !== "string") continue;
		const t = raw.trim().slice(0, 24);
		if (!t) continue;
		const key = t.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(t);
		if (out.length >= 10) break;
	}
	return out;
}
function pad2(n) {
	return String(n).padStart(2, "0");
}
function addDaysISO(iso, days) {
	const parts = iso.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	const dt = new Date(y, m - 1, d);
	dt.setDate(dt.getDate() + days);
	return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
/** Shift a date by whole months, clamping the day to the target month length. */
function addMonthsClamped(y, m, d, delta) {
	const total = y * 12 + (m - 1) + delta;
	const ny = Math.floor(total / 12);
	const nm = total % 12 + 1;
	const daysInMonth = new Date(ny, nm, 0).getDate();
	return `${ny}-${pad2(nm)}-${pad2(Math.min(d, daysInMonth))}`;
}
/** The nth occurrence date of a rule, computed from its start (no drift). */
function recurringOccurrenceDate(startDateISO, frequency, n) {
	const parts = startDateISO.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	switch (frequency) {
		case "daily": return addDaysISO(startDateISO, n);
		case "weekly": return addDaysISO(startDateISO, n * 7);
		case "monthly": return addMonthsClamped(y, m, d, n);
		case "yearly": return addMonthsClamped(y, m, d, n * 12);
	}
}
var FREQUENCIES = [
	"daily",
	"weekly",
	"monthly",
	"yearly"
];
function assertRuleInput(input) {
	if (input.type !== "expense" && input.type !== "income" && input.type !== "transfer") throw new Error("Recurring rule type must be expense, income, or transfer.");
	assertPaise(input.amountPaise);
	if (input.amountPaise === 0) throw new Error("Recurring amount must be greater than zero.");
	if (!FREQUENCIES.includes(input.frequency)) throw new Error("Invalid frequency.");
	assertDateISO(input.startDateISO, "startDateISO");
	if (input.endDateISO !== void 0) {
		assertDateISO(input.endDateISO, "endDateISO");
		if (input.endDateISO < input.startDateISO) throw new Error("End date cannot be before the start date.");
	}
}
function toTransaction(row) {
	return {
		id: row.id,
		type: row.type,
		amountPaise: row.amount_paise,
		category: row.category,
		note: row.note,
		dateISO: row.date_iso,
		payMode: row.pay_mode,
		...row.goal_id ? { goalId: row.goal_id } : {},
		...row.bill_id ? { billId: row.bill_id } : {},
		...row.account_id ? { accountId: row.account_id } : {},
		...row.to_account_id ? { toAccountId: row.to_account_id } : {},
		tags: row.tags ?? [],
		...row.recurring_rule_id ? { recurringRuleId: row.recurring_rule_id } : {},
		...row.refund_of ? { refundOf: row.refund_of } : {},
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}
function toBudget(row) {
	return {
		id: row.id,
		categoryId: row.category_id,
		month: row.month,
		limitPaise: row.limit_paise
	};
}
function toBill(row) {
	return {
		id: row.id,
		name: row.name,
		amountPaise: row.amount_paise,
		dueDay: row.due_day,
		category: row.category,
		...row.last_paid_on ? { lastPaidOn: row.last_paid_on } : {}
	};
}
function toGoal(row) {
	return {
		id: row.id,
		name: row.name,
		targetPaise: row.target_paise,
		savedPaise: row.saved_paise,
		deadline: row.deadline,
		color: row.color
	};
}
function toHolding(row) {
	return {
		id: row.id,
		symbol: row.symbol,
		qty: row.qty,
		avgPricePaise: row.avg_price_paise
	};
}
function toAccount(row) {
	return {
		id: row.id,
		name: row.name,
		type: row.type,
		iconName: row.icon_name,
		color: row.color,
		openingBalancePaise: row.opening_balance_paise,
		isDefault: row.is_default,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}
function toCustomCategory(row) {
	return {
		id: row.id,
		label: row.label,
		iconName: row.icon_name,
		color: row.color,
		kind: row.kind,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}
function toRecurringRule(row) {
	return {
		id: row.id,
		type: row.type,
		amountPaise: row.amount_paise,
		category: row.category,
		note: row.note,
		payMode: row.pay_mode,
		...row.account_id ? { accountId: row.account_id } : {},
		...row.to_account_id ? { toAccountId: row.to_account_id } : {},
		tags: row.tags ?? [],
		frequency: row.frequency,
		startDateISO: row.start_date_iso,
		...row.end_date_iso ? { endDateISO: row.end_date_iso } : {},
		lastPostedDateISO: row.last_posted_date_iso,
		isPaused: row.is_paused,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}
var DEFAULT_ICON_FOR_TYPE = {
	cash: "wallet",
	upi: "smartphone",
	bank: "bank"
};
function monthRange(month) {
	const m = /^(\d{4})-(\d{2})$/.exec(month);
	const y = Number(m?.[1] ?? 0);
	const mo = Number(m?.[2] ?? 0);
	if (!m || y < 1e3 || mo < 1 || mo > 12) throw new Error(`month must be "YYYY-MM", got "${month}"`);
	const toY = mo === 12 ? y + 1 : y;
	const toM = mo === 12 ? 1 : mo + 1;
	return {
		from: `${month}-01`,
		to: `${toY}-${String(toM).padStart(2, "0")}-01`
	};
}
/** All transactions, newest first; optional "YYYY-MM" filter on the date. */
async function fetchTransactions(month) {
	const userId = await uid();
	let q = getSupabase().from("transactions").select().eq("user_id", userId).order("date_iso", { ascending: false }).order("created_at", { ascending: false });
	if (month) {
		const { from, to } = monthRange(month);
		q = q.gte("date_iso", from).lt("date_iso", to);
	}
	const { data, error } = await q;
	if (error) throw error;
	return (data ?? []).map(toTransaction);
}
async function insertTransaction(input) {
	assertPaise(input.amountPaise);
	assertDateISO(input.dateISO, "dateISO");
	const userId = await uid();
	const { data, error } = await getSupabase().from("transactions").insert({
		user_id: userId,
		type: input.type,
		amount_paise: input.amountPaise,
		category: input.category,
		note: input.note,
		date_iso: input.dateISO,
		pay_mode: input.payMode,
		...input.goalId ? { goal_id: input.goalId } : {},
		...input.billId ? { bill_id: input.billId } : {},
		...input.accountId ? { account_id: input.accountId } : {},
		...input.toAccountId ? { to_account_id: input.toAccountId } : {},
		tags: normalizeTags(input.tags),
		...input.recurringRuleId ? { recurring_rule_id: input.recurringRuleId } : {},
		...input.refundOf ? { refund_of: input.refundOf } : {}
	}).select().single();
	if (error) throw error;
	return toTransaction(data);
}
async function updateTransaction(id, patch) {
	if (patch.amountPaise !== void 0) assertPaise(patch.amountPaise);
	if (patch.dateISO !== void 0) assertDateISO(patch.dateISO, "dateISO");
	const userId = await uid();
	const sb = getSupabase();
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.type !== void 0) row["type"] = patch.type;
	if (patch.amountPaise !== void 0) row["amount_paise"] = patch.amountPaise;
	if (patch.category !== void 0) row["category"] = patch.category;
	if (patch.note !== void 0) row["note"] = patch.note;
	if (patch.dateISO !== void 0) row["date_iso"] = patch.dateISO;
	if (patch.payMode !== void 0) row["pay_mode"] = patch.payMode;
	if (patch.goalId !== void 0) row["goal_id"] = patch.goalId;
	if (patch.billId !== void 0) row["bill_id"] = patch.billId;
	if (patch.accountId !== void 0) row["account_id"] = patch.accountId;
	if (patch.toAccountId !== void 0) row["to_account_id"] = patch.toAccountId;
	if (patch.tags !== void 0) row["tags"] = normalizeTags(patch.tags);
	if (patch.recurringRuleId !== void 0) row["recurring_rule_id"] = patch.recurringRuleId;
	const { data, error } = await sb.from("transactions").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toTransaction(data);
}
async function deleteTransaction(id) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("transactions").delete().eq("id", id).eq("user_id", userId).select("id");
	if (error) throw error;
	return (data ?? []).length > 0;
}
/** Record an account-to-account transfer as a single transfer transaction. */
async function transferBetweenAccounts(input) {
	assertPaise(input.amountPaise);
	if (input.amountPaise === 0) throw new Error("Transfer amount must be greater than zero.");
	if (input.fromAccountId === input.toAccountId) throw new Error("Pick two different accounts for a transfer.");
	const accounts = await fetchAccounts();
	const from = accounts.find((a) => a.id === input.fromAccountId);
	const to = accounts.find((a) => a.id === input.toAccountId);
	if (!from || !to) throw new Error("Both accounts must exist.");
	const dateISO = input.dateISO ?? todayISO();
	assertDateISO(dateISO, "dateISO");
	return insertTransaction({
		type: "transfer",
		amountPaise: input.amountPaise,
		category: "others",
		note: input.note?.trim() || `Transfer · ${from.name} → ${to.name}`,
		dateISO,
		payMode: "Bank",
		accountId: from.id,
		toAccountId: to.id,
		tags: []
	});
}
async function fetchBudgets(month) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("budgets").select().eq("user_id", userId).eq("month", month).order("category_id");
	if (error) throw error;
	return (data ?? []).map(toBudget);
}
async function fetchAllBudgets() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("budgets").select().eq("user_id", userId).order("month").order("category_id");
	if (error) throw error;
	return (data ?? []).map(toBudget);
}
/** Upsert on (user_id, category_id, month): creates or replaces the budget. */
async function setBudget(input) {
	assertPaise(input.limitPaise);
	const userId = await uid();
	const { data, error } = await getSupabase().from("budgets").upsert({
		user_id: userId,
		category_id: input.categoryId,
		month: input.month,
		limit_paise: input.limitPaise,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id,category_id,month" }).select().single();
	if (error) throw error;
	return toBudget(data);
}
async function fetchBills() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("bills").select().eq("user_id", userId).order("due_day");
	if (error) throw error;
	return (data ?? []).map(toBill);
}
/**
* Marks a bill paid (sets last_paid_on) AND inserts the matching expense
* transaction against the default account.
*/
async function markBillPaid(id, dateISO) {
	assertDateISO(dateISO, "dateISO");
	const userId = await uid();
	const sb = getSupabase();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { data, error } = await sb.from("bills").update({
		last_paid_on: dateISO,
		updated_at: now
	}).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	const bill = toBill(data);
	const fallbackAccountId = await defaultAccountId();
	await insertTransaction({
		type: "expense",
		amountPaise: bill.amountPaise,
		category: bill.category,
		note: `${bill.name} bill paid`,
		dateISO,
		payMode: "UPI",
		...fallbackAccountId ? { accountId: fallbackAccountId } : {},
		billId: bill.id,
		tags: []
	});
	return bill;
}
/** Insert a new bill (id generated by the database). */
async function insertBill(input) {
	const name = input.name.trim();
	if (!name) throw new Error("Bill name is required.");
	assertPaise(input.amountPaise);
	if (!Number.isInteger(input.dueDay) || input.dueDay < 1 || input.dueDay > 31) throw new Error("Bill due day must be an integer between 1 and 31.");
	if (input.lastPaidOn !== void 0) assertDateISO(input.lastPaidOn, "lastPaidOn");
	const userId = await uid();
	const { data, error } = await getSupabase().from("bills").insert({
		user_id: userId,
		name: name.slice(0, 60),
		amount_paise: input.amountPaise,
		due_day: input.dueDay,
		category: input.category,
		last_paid_on: input.lastPaidOn ?? null
	}).select().single();
	if (error) throw error;
	return toBill(data);
}
/** Update a bill's fields. Returns undefined when the bill does not exist. */
async function updateBill(id, patch) {
	if (patch.name !== void 0 && !patch.name.trim()) throw new Error("Bill name is required.");
	if (patch.amountPaise !== void 0) assertPaise(patch.amountPaise);
	if (patch.dueDay !== void 0 && (!Number.isInteger(patch.dueDay) || patch.dueDay < 1 || patch.dueDay > 31)) throw new Error("Bill due day must be an integer between 1 and 31.");
	if (patch.lastPaidOn !== void 0) assertDateISO(patch.lastPaidOn, "lastPaidOn");
	const userId = await uid();
	const sb = getSupabase();
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.name !== void 0) row["name"] = patch.name.trim().slice(0, 60);
	if (patch.amountPaise !== void 0) row["amount_paise"] = patch.amountPaise;
	if (patch.dueDay !== void 0) row["due_day"] = patch.dueDay;
	if (patch.category !== void 0) row["category"] = patch.category;
	if (patch.lastPaidOn !== void 0) row["last_paid_on"] = patch.lastPaidOn;
	const { data, error } = await sb.from("bills").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toBill(data);
}
/** Delete a bill. Past payment transactions are kept. */
async function deleteBill(id) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("bills").delete().eq("id", id).eq("user_id", userId).select("id");
	if (error) throw error;
	return (data ?? []).length > 0;
}
async function fetchGoals() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("goals").select().eq("user_id", userId).order("created_at");
	if (error) throw error;
	return (data ?? []).map(toGoal);
}
async function insertGoal(input) {
	assertPaise(input.targetPaise);
	assertPaise(input.savedPaise);
	const userId = await uid();
	const { data, error } = await getSupabase().from("goals").insert({
		user_id: userId,
		name: input.name,
		target_paise: input.targetPaise,
		saved_paise: input.savedPaise,
		deadline: input.deadline,
		color: input.color
	}).select().single();
	if (error) throw error;
	return toGoal(data);
}
async function updateGoal(id, patch) {
	if (patch.targetPaise !== void 0) assertPaise(patch.targetPaise);
	if (patch.savedPaise !== void 0) assertPaise(patch.savedPaise);
	const userId = await uid();
	const sb = getSupabase();
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.name !== void 0) row["name"] = patch.name;
	if (patch.targetPaise !== void 0) row["target_paise"] = patch.targetPaise;
	if (patch.savedPaise !== void 0) row["saved_paise"] = patch.savedPaise;
	if (patch.deadline !== void 0) row["deadline"] = patch.deadline;
	if (patch.color !== void 0) row["color"] = patch.color;
	const { data, error } = await sb.from("goals").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toGoal(data);
}
async function deleteGoal(id) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("goals").delete().eq("id", id).eq("user_id", userId).select("id");
	if (error) throw error;
	return (data ?? []).length > 0;
}
/**
* Adds funds to a goal: bumps saved_paise (clamped at the target) AND inserts
* the matching transfer transaction against the default account.
*/
async function addFundsToGoal(id, amountPaise, note) {
	assertPaise(amountPaise);
	const userId = await uid();
	const sb = getSupabase();
	const { data, error } = await sb.from("goals").select().eq("id", id).eq("user_id", userId).single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	const goal = toGoal(data);
	const savedPaise = Math.min(goal.targetPaise, goal.savedPaise + amountPaise);
	const { data: updated, error: updateError } = await sb.from("goals").update({
		saved_paise: savedPaise,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).eq("user_id", userId).select().single();
	if (updateError) throw updateError;
	const fallbackAccountId = await defaultAccountId();
	await insertTransaction({
		type: "transfer",
		amountPaise,
		category: "investments",
		note: note ?? `Saved towards ${goal.name}`,
		dateISO: todayISO(),
		payMode: "Bank",
		...fallbackAccountId ? { accountId: fallbackAccountId } : {},
		goalId: goal.id,
		tags: []
	});
	return toGoal(updated);
}
async function fetchHoldings() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("holdings").select().eq("user_id", userId).order("symbol");
	if (error) throw error;
	return (data ?? []).map(toHolding);
}
async function insertHolding(input) {
	assertPaise(input.avgPricePaise);
	if (!Number.isFinite(input.qty) || input.qty < 0) throw new Error("Holding qty must be a non-negative number");
	const userId = await uid();
	const { data, error } = await getSupabase().from("holdings").insert({
		user_id: userId,
		symbol: input.symbol,
		qty: input.qty,
		avg_price_paise: input.avgPricePaise
	}).select().single();
	if (error) throw error;
	return toHolding(data);
}
async function updateHolding(id, patch) {
	if (patch.avgPricePaise !== void 0) assertPaise(patch.avgPricePaise);
	if (patch.qty !== void 0 && (!Number.isFinite(patch.qty) || patch.qty < 0)) throw new Error("Holding qty must be a non-negative number");
	const userId = await uid();
	const sb = getSupabase();
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.symbol !== void 0) row["symbol"] = patch.symbol;
	if (patch.qty !== void 0) row["qty"] = patch.qty;
	if (patch.avgPricePaise !== void 0) row["avg_price_paise"] = patch.avgPricePaise;
	const { data, error } = await sb.from("holdings").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toHolding(data);
}
async function deleteHolding(id) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("holdings").delete().eq("id", id).eq("user_id", userId).select("id");
	if (error) throw error;
	return (data ?? []).length > 0;
}
async function fetchAccounts() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("accounts").select().eq("user_id", userId).order("created_at");
	if (error) throw error;
	return (data ?? []).map(toAccount);
}
async function insertAccount(input) {
	const name = input.name.trim();
	if (!name) throw new Error("Account name is required.");
	assertPaise(input.openingBalancePaise);
	if (!HEX_COLOR.test(input.color)) throw new Error("Account color must be a hex color.");
	const userId = await uid();
	const sb = getSupabase();
	const existing = await fetchAccounts();
	const makeDefault = input.isDefault === true || existing.length === 0;
	if (makeDefault && existing.length > 0) {
		const { error } = await sb.from("accounts").update({ is_default: false }).eq("user_id", userId);
		if (error) throw error;
	}
	const { data, error } = await sb.from("accounts").insert({
		user_id: userId,
		name: name.slice(0, 40),
		type: input.type,
		icon_name: input.iconName || DEFAULT_ICON_FOR_TYPE[input.type],
		color: input.color,
		opening_balance_paise: input.openingBalancePaise,
		is_default: makeDefault
	}).select().single();
	if (error) throw error;
	return toAccount(data);
}
async function updateAccount(id, patch) {
	const userId = await uid();
	const sb = getSupabase();
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.name !== void 0) {
		const name = patch.name.trim();
		if (!name) throw new Error("Account name is required.");
		row["name"] = name.slice(0, 40);
	}
	if (patch.type !== void 0) row["type"] = patch.type;
	if (patch.iconName !== void 0) row["icon_name"] = patch.iconName;
	if (patch.color !== void 0) {
		if (!HEX_COLOR.test(patch.color)) throw new Error("Account color must be a hex color.");
		row["color"] = patch.color;
	}
	if (patch.openingBalancePaise !== void 0) {
		assertPaise(patch.openingBalancePaise);
		row["opening_balance_paise"] = patch.openingBalancePaise;
	}
	const { data, error } = await sb.from("accounts").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toAccount(data);
}
/**
* Deletes an account and re-points its transactions (and recurring rules) at
* the default account, so no history is lost. Throws when the account is the
* default or the last one — pick/set another default first.
*/
async function deleteAccount(id) {
	const userId = await uid();
	const sb = getSupabase();
	const accounts = await fetchAccounts();
	const account = accounts.find((a) => a.id === id);
	if (!account) throw new Error("Account not found.");
	if (accounts.length === 1) throw new Error("You need at least one account — create another before deleting this one.");
	if (account.isDefault) throw new Error("This is your default account. Set another account as default first.");
	const fallback = accounts.find((a) => a.isDefault) ?? accounts.find((a) => a.id !== id);
	if (!fallback) throw new Error("No fallback account found.");
	for (const table of ["transactions", "recurring_rules"]) {
		const { error: e1 } = await sb.from(table).update({ account_id: fallback.id }).eq("user_id", userId).eq("account_id", id);
		if (e1) throw e1;
		const { error: e2 } = await sb.from(table).update({ to_account_id: fallback.id }).eq("user_id", userId).eq("to_account_id", id);
		if (e2) throw e2;
	}
	const { error } = await sb.from("accounts").delete().eq("id", id).eq("user_id", userId);
	if (error) throw error;
}
async function setDefaultAccount(id) {
	const userId = await uid();
	const sb = getSupabase();
	if (!(await fetchAccounts()).find((a) => a.id === id)) throw new Error("Account not found.");
	const { error: clearError } = await sb.from("accounts").update({ is_default: false }).eq("user_id", userId);
	if (clearError) throw clearError;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { data, error } = await sb.from("accounts").update({
		is_default: true,
		updated_at: now
	}).eq("id", id).eq("user_id", userId).select().single();
	if (error) throw error;
	return toAccount(data);
}
/** The account new transactions default to; falls back to the first account. */
async function defaultAccountId() {
	const accounts = await fetchAccounts();
	return accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id;
}
/**
* Live balance: opening balance plus replayed transaction effects.
* Expense debits, income credits; transfers debit the source account and
* credit the destination account. Always consistent — edits/deletes flow
* through automatically because the balance is derived, not stored.
*/
function balanceForAccount(account, transactions) {
	let balance = account.openingBalancePaise;
	for (const t of transactions) if (t.type === "transfer") {
		if (t.accountId === account.id) balance -= t.amountPaise;
		if (t.toAccountId === account.id) balance += t.amountPaise;
	} else if (t.accountId === account.id) balance += t.type === "income" ? t.amountPaise : -t.amountPaise;
	return balance;
}
async function fetchCustomCategories() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("custom_categories").select().eq("user_id", userId).order("label");
	if (error) throw error;
	const list = (data ?? []).map(toCustomCategory);
	setCustomCategoryCache(list);
	return list;
}
async function insertCustomCategory(input) {
	const label = input.label.trim();
	if (!label) throw new Error("Category name is required.");
	if (!HEX_COLOR.test(input.color)) throw new Error("Color must be a hex color.");
	if ((await fetchCustomCategories()).some((c) => c.label.toLowerCase() === label.toLowerCase()) || label.toLowerCase() === "others") throw new Error("A category with this name already exists.");
	const userId = await uid();
	const { data, error } = await getSupabase().from("custom_categories").insert({
		user_id: userId,
		label: label.slice(0, 30),
		icon_name: input.iconName || "tag",
		color: input.color,
		kind: input.kind
	}).select().single();
	if (error) throw error;
	return toCustomCategory(data);
}
async function updateCustomCategory(id, patch) {
	const userId = await uid();
	const sb = getSupabase();
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.label !== void 0) {
		const label = patch.label.trim();
		if (!label) throw new Error("Category name is required.");
		if ((await fetchCustomCategories()).some((c) => c.id !== id && c.label.toLowerCase() === label.toLowerCase())) throw new Error("A category with this name already exists.");
		row["label"] = label.slice(0, 30);
	}
	if (patch.iconName !== void 0) row["icon_name"] = patch.iconName;
	if (patch.color !== void 0) {
		if (!HEX_COLOR.test(patch.color)) throw new Error("Color must be a hex color.");
		row["color"] = patch.color;
	}
	const { data, error } = await sb.from("custom_categories").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toCustomCategory(data);
}
async function deleteCustomCategory(id) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("custom_categories").delete().eq("id", id).eq("user_id", userId).select("id");
	if (error) throw error;
	return (data ?? []).length > 0;
}
async function fetchRecurringRules() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("recurring_rules").select().eq("user_id", userId).order("start_date_iso");
	if (error) throw error;
	return (data ?? []).map(toRecurringRule);
}
async function insertRecurringRule(input) {
	assertRuleInput(input);
	if (input.type === "transfer" && input.accountId && input.toAccountId && input.accountId === input.toAccountId) throw new Error("Transfer rules need two different accounts.");
	const userId = await uid();
	const { data, error } = await getSupabase().from("recurring_rules").insert({
		user_id: userId,
		type: input.type,
		amount_paise: input.amountPaise,
		category: input.category,
		note: input.note,
		pay_mode: input.payMode,
		...input.accountId ? { account_id: input.accountId } : {},
		...input.toAccountId ? { to_account_id: input.toAccountId } : {},
		tags: normalizeTags(input.tags),
		frequency: input.frequency,
		start_date_iso: input.startDateISO,
		...input.endDateISO ? { end_date_iso: input.endDateISO } : {},
		last_posted_date_iso: null,
		is_paused: input.isPaused ?? false
	}).select().single();
	if (error) throw error;
	return toRecurringRule(data);
}
async function updateRecurringRule(id, patch) {
	const userId = await uid();
	const sb = getSupabase();
	const { data: current, error: fetchError } = await sb.from("recurring_rules").select().eq("id", id).eq("user_id", userId).single();
	if (isNoRows(fetchError)) return void 0;
	if (fetchError) throw fetchError;
	assertRuleInput({
		...toRecurringRule(current),
		...patch
	});
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.type !== void 0) row["type"] = patch.type;
	if (patch.amountPaise !== void 0) row["amount_paise"] = patch.amountPaise;
	if (patch.category !== void 0) row["category"] = patch.category;
	if (patch.note !== void 0) row["note"] = patch.note;
	if (patch.payMode !== void 0) row["pay_mode"] = patch.payMode;
	if (patch.accountId !== void 0) row["account_id"] = patch.accountId;
	if (patch.toAccountId !== void 0) row["to_account_id"] = patch.toAccountId;
	if (patch.frequency !== void 0) row["frequency"] = patch.frequency;
	if (patch.startDateISO !== void 0) row["start_date_iso"] = patch.startDateISO;
	if (patch.endDateISO !== void 0) row["end_date_iso"] = patch.endDateISO;
	if (patch.isPaused !== void 0) row["is_paused"] = patch.isPaused;
	if (patch.tags !== void 0) row["tags"] = normalizeTags(patch.tags);
	const { data, error } = await sb.from("recurring_rules").update(row).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toRecurringRule(data);
}
async function deleteRecurringRule(id) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("recurring_rules").delete().eq("id", id).eq("user_id", userId).select("id");
	if (error) throw error;
	return (data ?? []).length > 0;
}
async function setRecurringRulePaused(id, isPaused) {
	const userId = await uid();
	const { data, error } = await getSupabase().from("recurring_rules").update({
		is_paused: isPaused,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).eq("user_id", userId).select().single();
	if (isNoRows(error)) return void 0;
	if (error) throw error;
	return toRecurringRule(data);
}
/**
* Idempotent auto-post of due recurring transactions: for each unpaused rule,
* compute occurrence dates up to and including today, skip dates that already
* have a transaction with the same (rule, date), insert the missing ones, and
* advance last_posted_date_iso. Never double-posts.
*/
async function ensureRecurringPosted() {
	const userId = await uid();
	const sb = getSupabase();
	const today = todayISO();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const rules = await fetchRecurringRules();
	for (const rule of rules) {
		if (rule.isPaused) continue;
		if (rule.startDateISO > today) continue;
		const lastPosted = rule.lastPostedDateISO ?? null;
		const due = [];
		for (let n = 0; n < 1e3; n++) {
			const dateISO = recurringOccurrenceDate(rule.startDateISO, rule.frequency, n);
			if (dateISO > today) break;
			if (lastPosted !== null && dateISO <= lastPosted) continue;
			if (rule.endDateISO && dateISO > rule.endDateISO) break;
			due.push(dateISO);
		}
		if (due.length === 0) continue;
		const first = due[0];
		const last = due[due.length - 1];
		const { data: existing, error: fetchError } = await sb.from("transactions").select("date_iso").eq("user_id", userId).eq("recurring_rule_id", rule.id).gte("date_iso", first).lte("date_iso", last);
		if (fetchError) throw fetchError;
		const posted = new Set((existing ?? []).map((r) => r.date_iso));
		const missing = due.filter((d) => !posted.has(d));
		if (missing.length > 0) {
			const { error: insertError } = await sb.from("transactions").insert(missing.map((dateISO) => ({
				user_id: userId,
				type: rule.type,
				amount_paise: rule.amountPaise,
				category: rule.category,
				note: rule.note || "Recurring",
				date_iso: dateISO,
				pay_mode: rule.payMode,
				...rule.accountId ? { account_id: rule.accountId } : {},
				...rule.toAccountId ? { to_account_id: rule.toAccountId } : {},
				tags: [...rule.tags],
				recurring_rule_id: rule.id
			})));
			if (insertError) throw insertError;
		}
		const { error: updateError } = await sb.from("recurring_rules").update({
			last_posted_date_iso: last,
			updated_at: now
		}).eq("id", rule.id).eq("user_id", userId);
		if (updateError) throw updateError;
	}
}
/** Every distinct tag used across transactions, sorted alphabetically. */
async function fetchAllTags() {
	const userId = await uid();
	const { data, error } = await getSupabase().from("transactions").select("tags").eq("user_id", userId);
	if (error) throw error;
	const set = /* @__PURE__ */ new Set();
	for (const row of data ?? []) for (const tag of row.tags ?? []) set.add(tag);
	return [...set].sort((a, b) => a.localeCompare(b));
}
async function loadFinanceDB() {
	const [transactions, budgets, bills, goals, holdings, accounts, customCategories, recurringRules] = await Promise.all([
		fetchTransactions(),
		fetchAllBudgets(),
		fetchBills(),
		fetchGoals(),
		fetchHoldings(),
		fetchAccounts(),
		fetchCustomCategories(),
		fetchRecurringRules()
	]);
	return {
		transactions,
		budgets,
		bills,
		goals,
		holdings,
		accounts,
		customCategories,
		recurringRules
	};
}
//#endregion
export { setBudget as A, updateTransaction as B, insertCustomCategory as C, insertTransaction as D, insertRecurringRule as E, updateBill as F, updateCustomCategory as I, updateGoal as L, setRecurringRulePaused as M, transferBetweenAccounts as N, loadFinanceDB as O, updateAccount as P, updateHolding as R, insertBill as S, insertHolding as T, fetchGoals as _, deleteBill as a, fetchTransactions as b, deleteHolding as c, ensureRecurringPosted as d, fetchAccounts as f, fetchCustomCategories as g, fetchBudgets as h, deleteAccount as i, setDefaultAccount as j, markBillPaid as k, deleteRecurringRule as l, fetchBills as m, balanceForAccount as n, deleteCustomCategory as o, fetchAllTags as p, defaultAccountId as r, deleteGoal as s, addFundsToGoal as t, deleteTransaction as u, fetchHoldings as v, insertGoal as w, insertAccount as x, fetchRecurringRules as y, updateRecurringRule as z };
