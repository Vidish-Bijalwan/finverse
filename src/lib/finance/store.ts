import type {
  Account,
  AccountType,
  Bill,
  Budget,
  CustomCategory,
  FinanceDB,
  Goal,
  Holding,
  PayMode,
  RecurringFrequency,
  RecurringRule,
  Transaction,
  TransactionType,
} from "./types";
import { buildSeed } from "./seed";
import { todayISO } from "./format";

/**
 * Versioned localStorage persistence. SSR-safe: every window/localStorage
 * access is guarded with `typeof window === "undefined"`.
 *
 * v2 adds: accounts, customCategories, recurringRules; transactions gain
 * accountId / toAccountId / tags / recurringRuleId. Migrating from v1 keeps
 * every v1 record and assigns legacy transactions to default accounts by
 * pay mode so balances stay meaningful.
 *
 * On the server (or with no storage), functions return safe defaults:
 * loadDB/seedIfEmpty return an in-memory seeded DB that is NOT persisted.
 */

export const STORE_KEY = "finverse:v2";
const LEGACY_STORE_KEY = "finverse:v1";
export const STORE_VERSION = 2;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function emptyDB(): FinanceDB {
  return {
    transactions: [],
    budgets: [],
    bills: [],
    goals: [],
    holdings: [],
    accounts: [],
    customCategories: [],
    recurringRules: [],
  };
}

function isValidDB(db: unknown): db is FinanceDB {
  if (typeof db !== "object" || db === null) return false;
  const d = db as Record<string, unknown>;
  return (
    Array.isArray(d["transactions"]) &&
    Array.isArray(d["budgets"]) &&
    Array.isArray(d["bills"]) &&
    Array.isArray(d["goals"]) &&
    Array.isArray(d["holdings"]) &&
    Array.isArray(d["accounts"]) &&
    Array.isArray(d["customCategories"]) &&
    Array.isArray(d["recurringRules"])
  );
}

interface V1DB {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  goals: Goal[];
  holdings: Holding[];
}

function isValidV1(db: unknown): db is V1DB {
  if (typeof db !== "object" || db === null) return false;
  const d = db as Record<string, unknown>;
  return (
    Array.isArray(d["transactions"]) &&
    Array.isArray(d["budgets"]) &&
    Array.isArray(d["bills"]) &&
    Array.isArray(d["goals"]) &&
    Array.isArray(d["holdings"])
  );
}

const DEFAULT_ICON_FOR_TYPE: Record<AccountType, string> = {
  cash: "wallet",
  upi: "smartphone",
  bank: "bank",
};

export const DEFAULT_ACCOUNT_COLORS: Record<AccountType, string> = {
  cash: "#F59E0B",
  upi: "#10B981",
  bank: "#3B82F6",
};

/** v1 -> v2: keep every record; park legacy transactions in default accounts by pay mode. */
export function migrateV1(v1: V1DB): FinanceDB {
  const now = new Date().toISOString();
  const mk = (id: string, name: string, type: AccountType, isDefault: boolean): Account => ({
    id,
    name,
    type,
    iconName: DEFAULT_ICON_FOR_TYPE[type],
    color: DEFAULT_ACCOUNT_COLORS[type],
    openingBalancePaise: 0,
    isDefault,
    createdAt: now,
    updatedAt: now,
  });
  const accounts: Account[] = [
    mk("acc-cash", "Cash Wallet", "cash", false),
    mk("acc-upi", "UPI", "upi", true),
    mk("acc-bank", "Bank Account", "bank", false),
  ];
  const byPayMode: Record<PayMode, string> = {
    Cash: "acc-cash",
    UPI: "acc-upi",
    Card: "acc-bank",
    Bank: "acc-bank",
  };
  for (const t of v1.transactions) {
    if (!t.accountId) t.accountId = byPayMode[t.payMode] ?? "acc-bank";
  }
  return {
    transactions: v1.transactions,
    budgets: v1.budgets,
    bills: v1.bills,
    goals: v1.goals,
    holdings: v1.holdings,
    accounts,
    customCategories: [],
    recurringRules: [],
  };
}

/** Load the DB from localStorage; migrates v1 -> v2 when needed. Server/corruption -> empty DB. */
export function loadDB(): FinanceDB {
  if (!isBrowser()) return emptyDB();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidDB(parsed)) return parsed;
    }
    const legacyRaw = window.localStorage.getItem(LEGACY_STORE_KEY);
    if (legacyRaw) {
      const legacy: unknown = JSON.parse(legacyRaw);
      if (isValidV1(legacy)) {
        const migrated = migrateV1(legacy);
        saveDB(migrated);
        return migrated;
      }
    }
    return emptyDB();
  } catch {
    return emptyDB();
  }
}

/** Persist the DB. No-op on the server. */
export function saveDB(db: FinanceDB): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

/**
 * Load; if empty, seed it. On every browser load, also posts due recurring
 * transactions (idempotent — never double-posts). Persists only in the browser.
 */
export function seedIfEmpty(): FinanceDB {
  const db = loadDB();
  const hasData = db.transactions.length > 0;
  if (!hasData) {
    const seeded = buildSeed();
    saveDB(seeded);
    return seeded;
  }
  if (isBrowser()) {
    const posted = postDueRecurring(db, todayISO());
    if (posted > 0) saveDB(db);
  }
  return db;
}

/** Assert an amount is a non-negative integer number of paise. */
function assertPaise(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw new Error(`Amount must be a non-negative integer number of paise, got ${amountPaise}`);
  }
}

function assertDateISO(value: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T12:00:00`).getTime())) {
    throw new Error(`${field} must be a valid YYYY-MM-DD date, got "${value}"`);
  }
}

/** Trim, drop empties, dedupe (case-insensitive), cap count/length. */
export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
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

export type NewTransaction = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

// ---- Transactions ----

export function listTransactions(db: FinanceDB, monthKey?: string): Transaction[] {
  const txns = monthKey
    ? db.transactions.filter((t) => t.dateISO.startsWith(monthKey))
    : db.transactions;
  return [...txns].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

export function addTransaction(db: FinanceDB, input: NewTransaction): Transaction {
  assertPaise(input.amountPaise);
  const now = new Date().toISOString();
  const txn: Transaction = {
    ...input,
    tags: normalizeTags(input.tags),
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  db.transactions.push(txn);
  return txn;
}

export function updateTransaction(
  db: FinanceDB,
  id: string,
  patch: Partial<Omit<Transaction, "id" | "createdAt">>,
): Transaction | undefined {
  if (patch.amountPaise !== undefined) assertPaise(patch.amountPaise);
  const txn = db.transactions.find((t) => t.id === id);
  if (!txn) return undefined;
  const { tags, ...rest } = patch;
  Object.assign(txn, rest, { updatedAt: new Date().toISOString() });
  if (tags !== undefined) txn.tags = normalizeTags(tags);
  return txn;
}

export function deleteTransaction(db: FinanceDB, id: string): boolean {
  const idx = db.transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  db.transactions.splice(idx, 1);
  return true;
}

/** Every distinct tag used across transactions, sorted alphabetically. */
export function allTags(db: FinanceDB): string[] {
  const set = new Set<string>();
  for (const t of db.transactions) for (const tag of t.tags ?? []) set.add(tag);
  return [...set].sort((a, b) => a.localeCompare(b));
}

// ---- Accounts ----

export function listAccounts(db: FinanceDB): Account[] {
  return [...db.accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getAccount(db: FinanceDB, id: string): Account | undefined {
  return db.accounts.find((a) => a.id === id);
}

/** The account new transactions default to; falls back to the first account. */
export function defaultAccount(db: FinanceDB): Account | undefined {
  return db.accounts.find((a) => a.isDefault) ?? db.accounts[0];
}

/**
 * Live balance: opening balance plus replayed transaction effects.
 * Expense debits, income credits; transfers debit the source account and
 * credit the destination account. Always consistent — edits/deletes flow
 * through automatically because the balance is derived, not stored.
 */
export function accountBalancePaise(db: FinanceDB, accountId: string): number {
  const account = db.accounts.find((a) => a.id === accountId);
  if (!account) return 0;
  let balance = account.openingBalancePaise;
  for (const t of db.transactions) {
    if (t.type === "transfer") {
      if (t.accountId === accountId) balance -= t.amountPaise;
      if (t.toAccountId === accountId) balance += t.amountPaise;
    } else if (t.accountId === accountId) {
      balance += t.type === "income" ? t.amountPaise : -t.amountPaise;
    }
  }
  return balance;
}

export interface AccountSummary {
  account: Account;
  balancePaise: number;
}

export function accountSummaries(db: FinanceDB): AccountSummary[] {
  return listAccounts(db).map((account) => ({
    account,
    balancePaise: accountBalancePaise(db, account.id),
  }));
}

export type NewAccount = Pick<
  Account,
  "name" | "type" | "iconName" | "color" | "openingBalancePaise"
> & { isDefault?: boolean };

export function addAccount(db: FinanceDB, input: NewAccount): Account {
  const name = input.name.trim();
  if (!name) throw new Error("Account name is required.");
  assertPaise(input.openingBalancePaise);
  if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) throw new Error("Account color must be a hex color.");
  const now = new Date().toISOString();
  const makeDefault = input.isDefault === true || db.accounts.length === 0;
  if (makeDefault) for (const a of db.accounts) a.isDefault = false;
  const account: Account = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    type: input.type,
    iconName: input.iconName || DEFAULT_ICON_FOR_TYPE[input.type],
    color: input.color,
    openingBalancePaise: input.openingBalancePaise,
    isDefault: makeDefault,
    createdAt: now,
    updatedAt: now,
  };
  db.accounts.push(account);
  return account;
}

export function updateAccount(
  db: FinanceDB,
  id: string,
  patch: Partial<Pick<Account, "name" | "type" | "iconName" | "color" | "openingBalancePaise">>,
): Account | undefined {
  const account = db.accounts.find((a) => a.id === id);
  if (!account) return undefined;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new Error("Account name is required.");
    account.name = name.slice(0, 40);
  }
  if (patch.openingBalancePaise !== undefined) assertPaise(patch.openingBalancePaise);
  if (patch.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(patch.color)) {
    throw new Error("Account color must be a hex color.");
  }
  Object.assign(account, patch, { updatedAt: new Date().toISOString() });
  return account;
}

/**
 * Deletes an account and re-points its transactions (and recurring rules) at
 * the default account, so no history is lost. Throws when the account is the
 * default or the last one — pick/set another default first.
 */
export function deleteAccount(db: FinanceDB, id: string): void {
  const idx = db.accounts.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Account not found.");
  const account = db.accounts[idx]!;
  if (db.accounts.length === 1) {
    throw new Error("You need at least one account — create another before deleting this one.");
  }
  if (account.isDefault) {
    throw new Error("This is your default account. Set another account as default first.");
  }
  const fallback = defaultAccount(db) ?? db.accounts.find((a) => a.id !== id)!;
  for (const t of db.transactions) {
    if (t.accountId === id) t.accountId = fallback.id;
    if (t.toAccountId === id) t.toAccountId = fallback.id;
  }
  for (const r of db.recurringRules) {
    if (r.accountId === id) r.accountId = fallback.id;
    if (r.toAccountId === id) r.toAccountId = fallback.id;
  }
  db.accounts.splice(idx, 1);
}

export function setDefaultAccount(db: FinanceDB, id: string): Account {
  const account = db.accounts.find((a) => a.id === id);
  if (!account) throw new Error("Account not found.");
  for (const a of db.accounts) a.isDefault = a.id === id;
  account.updatedAt = new Date().toISOString();
  return account;
}

/** Record an account-to-account transfer as a single transfer transaction. */
export function transferBetweenAccounts(
  db: FinanceDB,
  input: {
    fromAccountId: string;
    toAccountId: string;
    amountPaise: number;
    note?: string;
    dateISO?: string;
    payMode?: PayMode;
  },
): Transaction {
  assertPaise(input.amountPaise);
  if (input.amountPaise === 0) throw new Error("Transfer amount must be greater than zero.");
  if (input.fromAccountId === input.toAccountId) {
    throw new Error("Pick two different accounts for a transfer.");
  }
  const from = getAccount(db, input.fromAccountId);
  const to = getAccount(db, input.toAccountId);
  if (!from || !to) throw new Error("Both accounts must exist.");
  const dateISO = input.dateISO ?? todayISO();
  assertDateISO(dateISO, "dateISO");
  return addTransaction(db, {
    type: "transfer",
    amountPaise: input.amountPaise,
    category: "others",
    note: input.note?.trim() || `Transfer · ${from.name} → ${to.name}`,
    dateISO,
    payMode: input.payMode ?? "Bank",
    accountId: from.id,
    toAccountId: to.id,
  });
}

// ---- Custom categories ----

export function listCustomCategories(db: FinanceDB): CustomCategory[] {
  return [...db.customCategories].sort((a, b) => a.label.localeCompare(b.label));
}

export type NewCustomCategory = Pick<CustomCategory, "label" | "iconName" | "color" | "kind">;

export function addCustomCategory(db: FinanceDB, input: NewCustomCategory): CustomCategory {
  const label = input.label.trim();
  if (!label) throw new Error("Category name is required.");
  if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) throw new Error("Color must be a hex color.");
  const clash =
    db.customCategories.some((c) => c.label.toLowerCase() === label.toLowerCase()) ||
    label.toLowerCase() === "others";
  if (clash) throw new Error("A category with this name already exists.");
  const now = new Date().toISOString();
  const category: CustomCategory = {
    id: `custom-${crypto.randomUUID()}`,
    label: label.slice(0, 30),
    iconName: input.iconName || "tag",
    color: input.color,
    kind: input.kind,
    createdAt: now,
    updatedAt: now,
  };
  db.customCategories.push(category);
  return category;
}

export function updateCustomCategory(
  db: FinanceDB,
  id: string,
  patch: Partial<Pick<CustomCategory, "label" | "iconName" | "color">>,
): CustomCategory | undefined {
  const category = db.customCategories.find((c) => c.id === id);
  if (!category) return undefined;
  if (patch.label !== undefined) {
    const label = patch.label.trim();
    if (!label) throw new Error("Category name is required.");
    const clash = db.customCategories.some(
      (c) => c.id !== id && c.label.toLowerCase() === label.toLowerCase(),
    );
    if (clash) throw new Error("A category with this name already exists.");
    category.label = label.slice(0, 30);
  }
  if (patch.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(patch.color)) {
    throw new Error("Color must be a hex color.");
  }
  Object.assign(category, patch, { updatedAt: new Date().toISOString() });
  return category;
}

export function deleteCustomCategory(db: FinanceDB, id: string): boolean {
  const idx = db.customCategories.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.customCategories.splice(idx, 1);
  return true;
}

// ---- Recurring rules ----

const FREQUENCIES: RecurringFrequency[] = ["daily", "weekly", "monthly", "yearly"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function addDaysISO(iso: string, days: number): string {
  const parts = iso.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

/** Shift a date by whole months, clamping the day to the target month length. */
function addMonthsClamped(y: number, m: number, d: number, delta: number): string {
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const daysInMonth = new Date(ny, nm, 0).getDate();
  return `${ny}-${pad2(nm)}-${pad2(Math.min(d, daysInMonth))}`;
}

/** The nth occurrence date of a rule, computed from its start (no drift). */
export function recurringOccurrenceDate(
  startDateISO: string,
  frequency: RecurringFrequency,
  n: number,
): string {
  const parts = startDateISO.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  switch (frequency) {
    case "daily":
      return addDaysISO(startDateISO, n);
    case "weekly":
      return addDaysISO(startDateISO, n * 7);
    case "monthly":
      return addMonthsClamped(y, m, d, n);
    case "yearly":
      return addMonthsClamped(y, m, d, n * 12);
  }
}

export function listRecurringRules(db: FinanceDB): RecurringRule[] {
  return [...db.recurringRules].sort((a, b) => a.startDateISO.localeCompare(b.startDateISO));
}

export type NewRecurringRule = Omit<
  RecurringRule,
  "id" | "createdAt" | "updatedAt" | "lastPostedDateISO" | "isPaused"
> & { isPaused?: boolean };

function assertRuleInput(input: {
  type: TransactionType;
  amountPaise: number;
  startDateISO: string;
  endDateISO?: string;
  frequency: RecurringFrequency;
}) {
  if (input.type !== "expense" && input.type !== "income" && input.type !== "transfer") {
    throw new Error("Recurring rule type must be expense, income, or transfer.");
  }
  assertPaise(input.amountPaise);
  if (input.amountPaise === 0) throw new Error("Recurring amount must be greater than zero.");
  if (!FREQUENCIES.includes(input.frequency)) throw new Error("Invalid frequency.");
  assertDateISO(input.startDateISO, "startDateISO");
  if (input.endDateISO !== undefined) {
    assertDateISO(input.endDateISO, "endDateISO");
    if (input.endDateISO < input.startDateISO) {
      throw new Error("End date cannot be before the start date.");
    }
  }
}

export function addRecurringRule(db: FinanceDB, input: NewRecurringRule): RecurringRule {
  assertRuleInput(input);
  if (
    input.type === "transfer" &&
    input.accountId &&
    input.toAccountId &&
    input.accountId === input.toAccountId
  ) {
    throw new Error("Transfer rules need two different accounts.");
  }
  const now = new Date().toISOString();
  const rule: RecurringRule = {
    ...input,
    tags: normalizeTags(input.tags),
    lastPostedDateISO: null,
    isPaused: input.isPaused ?? false,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  db.recurringRules.push(rule);
  return rule;
}

export function updateRecurringRule(
  db: FinanceDB,
  id: string,
  patch: Partial<
    Pick<
      RecurringRule,
      | "type"
      | "amountPaise"
      | "category"
      | "note"
      | "payMode"
      | "accountId"
      | "toAccountId"
      | "frequency"
      | "startDateISO"
      | "endDateISO"
      | "isPaused"
    >
  > & { tags?: string[] },
): RecurringRule | undefined {
  const rule = db.recurringRules.find((r) => r.id === id);
  if (!rule) return undefined;
  const merged = { ...rule, ...patch };
  assertRuleInput(merged);
  const { tags, ...rest } = patch;
  Object.assign(rule, rest, { updatedAt: new Date().toISOString() });
  if (tags !== undefined) rule.tags = normalizeTags(tags);
  return rule;
}

export function deleteRecurringRule(db: FinanceDB, id: string): boolean {
  const idx = db.recurringRules.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  db.recurringRules.splice(idx, 1);
  return true;
}

export function setRecurringRulePaused(
  db: FinanceDB,
  id: string,
  isPaused: boolean,
): RecurringRule | undefined {
  const rule = db.recurringRules.find((r) => r.id === id);
  if (!rule) return undefined;
  rule.isPaused = isPaused;
  rule.updatedAt = new Date().toISOString();
  return rule;
}

/**
 * Posts every due occurrence of every active rule up to and including
 * `asOfISO`. Idempotent: an occurrence is skipped when a transaction with the
 * same (rule, date) already exists, and lastPostedDateISO only moves forward.
 * Returns the number of transactions posted.
 */
export function postDueRecurring(db: FinanceDB, asOfISO: string): number {
  let posted = 0;
  const now = new Date().toISOString();
  for (const rule of db.recurringRules) {
    if (rule.isPaused) continue;
    if (rule.startDateISO > asOfISO) continue;
    const lastPosted = rule.lastPostedDateISO ?? null;
    for (let n = 0; n < 1000; n++) {
      const dateISO = recurringOccurrenceDate(rule.startDateISO, rule.frequency, n);
      if (dateISO > asOfISO) break;
      if (lastPosted !== null && dateISO <= lastPosted) continue;
      if (rule.endDateISO && dateISO > rule.endDateISO) break;
      const alreadyPosted = db.transactions.some(
        (t) => t.recurringRuleId === rule.id && t.dateISO === dateISO,
      );
      if (!alreadyPosted) {
        db.transactions.push({
          id: crypto.randomUUID(),
          type: rule.type,
          amountPaise: rule.amountPaise,
          category: rule.category,
          note: rule.note || "Recurring",
          dateISO,
          payMode: rule.payMode,
          ...(rule.accountId ? { accountId: rule.accountId } : {}),
          ...(rule.toAccountId ? { toAccountId: rule.toAccountId } : {}),
          tags: [...rule.tags],
          recurringRuleId: rule.id,
          createdAt: now,
          updatedAt: now,
        });
        posted++;
      }
      rule.lastPostedDateISO = dateISO;
      rule.updatedAt = now;
    }
  }
  return posted;
}

/** Next occurrence date after `fromISO` (exclusive), or null when the rule ended. */
export function nextRecurringDate(rule: RecurringRule, fromISO: string): string | null {
  const lastPosted = rule.lastPostedDateISO ?? null;
  for (let n = 0; n < 1000; n++) {
    const dateISO = recurringOccurrenceDate(rule.startDateISO, rule.frequency, n);
    if (lastPosted !== null && dateISO <= lastPosted) continue;
    if (rule.endDateISO && dateISO > rule.endDateISO) return null;
    if (dateISO > fromISO) return dateISO;
    // Occurrences on or before fromISO that were never posted are overdue —
    // surface the earliest one so the UI can show "due".
    if (dateISO <= fromISO) return dateISO;
  }
  return null;
}

// ---- Budgets ----

export function getBudgets(db: FinanceDB, month: string): Budget[] {
  return db.budgets.filter((b) => b.month === month);
}

/** Upsert: creates or replaces the budget for (categoryId, month). */
export function setBudget(
  db: FinanceDB,
  input: { categoryId: string; month: string; limitPaise: number },
): Budget {
  assertPaise(input.limitPaise);
  const existing = db.budgets.find(
    (b) => b.categoryId === input.categoryId && b.month === input.month,
  );
  if (existing) {
    existing.limitPaise = input.limitPaise;
    return existing;
  }
  const budget: Budget = { id: crypto.randomUUID(), ...input };
  db.budgets.push(budget);
  return budget;
}

// ---- Bills ----

export function listBills(db: FinanceDB): Bill[] {
  return [...db.bills].sort((a, b) => a.dueDay - b.dueDay);
}

export function markBillPaid(db: FinanceDB, id: string, dateISO: string): Bill | undefined {
  const bill = db.bills.find((b) => b.id === id);
  if (!bill) return undefined;
  bill.lastPaidOn = dateISO;
  return bill;
}

// ---- Goals ----

export function listGoals(db: FinanceDB): Goal[] {
  return [...db.goals];
}

export function addGoal(db: FinanceDB, input: Omit<Goal, "id">): Goal {
  assertPaise(input.targetPaise);
  assertPaise(input.savedPaise);
  const goal: Goal = { ...input, id: crypto.randomUUID() };
  db.goals.push(goal);
  return goal;
}

export function updateGoal(
  db: FinanceDB,
  id: string,
  patch: Partial<Omit<Goal, "id">>,
): Goal | undefined {
  if (patch.targetPaise !== undefined) assertPaise(patch.targetPaise);
  if (patch.savedPaise !== undefined) assertPaise(patch.savedPaise);
  const goal = db.goals.find((g) => g.id === id);
  if (!goal) return undefined;
  Object.assign(goal, patch);
  return goal;
}

export function deleteGoal(db: FinanceDB, id: string): boolean {
  const idx = db.goals.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  db.goals.splice(idx, 1);
  return true;
}

/** Add funds to a goal (bump savedPaise, clamp at target). Returns undefined when goal missing. */
export function addFundsToGoal(db: FinanceDB, id: string, amountPaise: number): Goal | undefined {
  assertPaise(amountPaise);
  const goal = db.goals.find((g) => g.id === id);
  if (!goal) return undefined;
  goal.savedPaise = Math.min(goal.targetPaise, goal.savedPaise + amountPaise);
  return goal;
}

// ---- Holdings ----

export function listHoldings(db: FinanceDB): Holding[] {
  return [...db.holdings];
}

export function addHolding(db: FinanceDB, input: Omit<Holding, "id">): Holding {
  assertPaise(input.avgPricePaise);
  if (!Number.isFinite(input.qty) || input.qty < 0)
    throw new Error("Holding qty must be a non-negative number");
  const holding: Holding = { ...input, id: crypto.randomUUID() };
  db.holdings.push(holding);
  return holding;
}

export function updateHolding(
  db: FinanceDB,
  id: string,
  patch: Partial<Omit<Holding, "id">>,
): Holding | undefined {
  if (patch.avgPricePaise !== undefined) assertPaise(patch.avgPricePaise);
  if (patch.qty !== undefined && (!Number.isFinite(patch.qty) || patch.qty < 0)) {
    throw new Error("Holding qty must be a non-negative number");
  }
  const holding = db.holdings.find((h) => h.id === id);
  if (!holding) return undefined;
  Object.assign(holding, patch);
  return holding;
}

export function deleteHolding(db: FinanceDB, id: string): boolean {
  const idx = db.holdings.findIndex((h) => h.id === id);
  if (idx === -1) return false;
  db.holdings.splice(idx, 1);
  return true;
}

export { todayISO };
