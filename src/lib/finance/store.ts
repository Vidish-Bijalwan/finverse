import type { Bill, Budget, FinanceDB, Goal, Holding, Transaction } from "./types";
import { buildSeed } from "./seed";
import { todayISO } from "./format";

/**
 * Versioned localStorage persistence. SSR-safe: every window/localStorage
 * access is guarded with `typeof window === "undefined"`.
 *
 * On the server (or with no storage), functions return safe defaults:
 * loadDB/seedIfEmpty return an in-memory seeded DB that is NOT persisted.
 */

export const STORE_KEY = "finverse:v1";
export const STORE_VERSION = 1;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function emptyDB(): FinanceDB {
  return { transactions: [], budgets: [], bills: [], goals: [], holdings: [] };
}

function isValidDB(db: unknown): db is FinanceDB {
  if (typeof db !== "object" || db === null) return false;
  const d = db as Record<string, unknown>;
  return (
    Array.isArray(d.transactions) &&
    Array.isArray(d.budgets) &&
    Array.isArray(d.bills) &&
    Array.isArray(d.goals) &&
    Array.isArray(d.holdings)
  );
}

/** Load the DB from localStorage; returns an empty (unpersisted) DB on the server or on corruption. */
export function loadDB(): FinanceDB {
  if (!isBrowser()) return emptyDB();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyDB();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidDB(parsed)) return emptyDB();
    return parsed;
  } catch {
    return emptyDB();
  }
}

/** Persist the DB. No-op on the server. */
export function saveDB(db: FinanceDB): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

/** Load; if empty, seed it. Persists only in the browser. */
export function seedIfEmpty(): FinanceDB {
  const db = loadDB();
  const hasData = db.transactions.length > 0;
  if (hasData) return db;
  const seeded = buildSeed();
  saveDB(seeded);
  return seeded;
}

/** Assert an amount is a non-negative integer number of paise. */
function assertPaise(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw new Error(`Amount must be a non-negative integer number of paise, got ${amountPaise}`);
  }
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
  const txn: Transaction = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
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
  Object.assign(txn, patch, { updatedAt: new Date().toISOString() });
  return txn;
}

export function deleteTransaction(db: FinanceDB, id: string): boolean {
  const idx = db.transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  db.transactions.splice(idx, 1);
  return true;
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
