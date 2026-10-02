import { useState, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  Bill,
  Budget,
  CustomCategory,
  Goal,
  Holding,
  RecurringRule,
  Transaction,
} from "./types";
import {
  addAccount,
  addCustomCategory,
  addFundsToGoal,
  addGoal,
  addHolding,
  addRecurringRule,
  addTransaction,
  allTags,
  deleteAccount,
  deleteCustomCategory,
  deleteGoal,
  deleteHolding,
  deleteRecurringRule,
  deleteTransaction,
  defaultAccount,
  getBudgets,
  listAccounts,
  accountSummaries,
  listBills,
  listCustomCategories,
  listGoals,
  listHoldings,
  listRecurringRules,
  listTransactions,
  markBillPaid,
  saveDB,
  seedIfEmpty,
  setBudget,
  setDefaultAccount,
  setRecurringRulePaused,
  transferBetweenAccounts,
  updateAccount,
  updateCustomCategory,
  updateGoal,
  updateHolding,
  updateRecurringRule,
  updateTransaction,
  type AccountSummary,
  type NewAccount,
  type NewCustomCategory,
  type NewRecurringRule,
  type NewTransaction,
} from "./store";
import { monthKey as currentMonthKey, todayISO } from "./format";

/**
 * React Query layer over the localStorage store.
 *
 * Query keys are namespaced as ['finverse', ...]. Every mutation writes via
 * store.ts (load -> mutate -> saveDB) and then invalidates the relevant keys.
 *
 * SSR note: queryFns run through seedIfEmpty(), which is SSR-safe
 * (server returns an unpersisted in-memory seed; browser persists to localStorage).
 */

const QK = {
  transactions: ["finverse", "transactions"] as const,
  budgets: ["finverse", "budgets"] as const,
  bills: ["finverse", "bills"] as const,
  goals: ["finverse", "goals"] as const,
  holdings: ["finverse", "holdings"] as const,
  accounts: ["finverse", "accounts"] as const,
  accountSummaries: ["finverse", "account-summaries"] as const,
  customCategories: ["finverse", "custom-categories"] as const,
  recurringRules: ["finverse", "recurring-rules"] as const,
  tags: ["finverse", "tags"] as const,
};

/** Selected month state ("YYYY-MM"), defaulting to the current month. */
export function useMonth(): [string, Dispatch<SetStateAction<string>>] {
  return useState(() => currentMonthKey(new Date()));
}

export function useTransactions(month?: string) {
  return useQuery({
    queryKey: [...QK.transactions, month ?? "all"],
    queryFn: () => listTransactions(seedIfEmpty(), month),
  });
}

/** Invalidate everything that derives from transactions (lists + live balances). */
function invalidateMoney(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: QK.transactions });
  qc.invalidateQueries({ queryKey: QK.accountSummaries });
  qc.invalidateQueries({ queryKey: QK.tags });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation<Transaction, Error, NewTransaction>({
    mutationFn: async (input: NewTransaction) => {
      const db = seedIfEmpty();
      const txn = addTransaction(db, input);
      saveDB(db);
      return txn;
    },
    onSuccess: () => invalidateMoney(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation<
    Transaction | undefined,
    Error,
    { id: string; patch: Partial<Omit<Transaction, "id" | "createdAt">> }
  >({
    mutationFn: async (args: {
      id: string;
      patch: Partial<Omit<Transaction, "id" | "createdAt">>;
    }) => {
      const db = seedIfEmpty();
      const txn = updateTransaction(db, args.id, args.patch);
      saveDB(db);
      return txn;
    },
    onSuccess: () => invalidateMoney(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      const ok = deleteTransaction(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => invalidateMoney(qc),
  });
}

/** Record an account-to-account transfer (debits one account, credits another). */
export function useTransfer() {
  const qc = useQueryClient();
  return useMutation<
    Transaction,
    Error,
    {
      fromAccountId: string;
      toAccountId: string;
      amountPaise: number;
      note?: string;
      dateISO?: string;
    }
  >({
    mutationFn: async (input: {
      fromAccountId: string;
      toAccountId: string;
      amountPaise: number;
      note?: string;
      dateISO?: string;
    }) => {
      const db = seedIfEmpty();
      const txn = transferBetweenAccounts(db, input);
      saveDB(db);
      return txn;
    },
    onSuccess: () => invalidateMoney(qc),
  });
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: [...QK.budgets, month],
    queryFn: () => getBudgets(seedIfEmpty(), month),
  });
}

export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation<Budget, Error, { categoryId: string; month: string; limitPaise: number }>({
    mutationFn: async (input: { categoryId: string; month: string; limitPaise: number }) => {
      const db = seedIfEmpty();
      const b = setBudget(db, input);
      saveDB(db);
      return b;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.budgets }),
  });
}

export function useBills() {
  return useQuery({
    queryKey: QK.bills,
    queryFn: () => listBills(seedIfEmpty()),
  });
}

/** Marks a bill paid and records the matching expense transaction. */
export function usePayBill() {
  const qc = useQueryClient();
  return useMutation<Bill | undefined, Error, { id: string; dateISO?: string }>({
    mutationFn: async (args: { id: string; dateISO?: string }) => {
      const db = seedIfEmpty();
      const dateISO = args.dateISO ?? todayISO();
      const bill = markBillPaid(db, args.id, dateISO);
      if (bill) {
        const fallbackAccountId = defaultAccount(db)?.id;
        addTransaction(db, {
          type: "expense",
          amountPaise: bill.amountPaise,
          category: bill.category,
          note: `${bill.name} bill paid`,
          dateISO,
          payMode: "UPI",
          ...(fallbackAccountId ? { accountId: fallbackAccountId } : {}),
          billId: bill.id,
        });
      }
      saveDB(db);
      return bill;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.bills });
      invalidateMoney(qc);
    },
  });
}

export function useGoals() {
  return useQuery({
    queryKey: QK.goals,
    queryFn: () => listGoals(seedIfEmpty()),
  });
}

export function useAddGoal() {
  const qc = useQueryClient();
  return useMutation<Goal, Error, Omit<Goal, "id">>({
    mutationFn: async (input: Omit<Goal, "id">) => {
      const db = seedIfEmpty();
      const g = addGoal(db, input);
      saveDB(db);
      return g;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation<Goal | undefined, Error, { id: string; patch: Partial<Omit<Goal, "id">> }>({
    mutationFn: async (args: { id: string; patch: Partial<Omit<Goal, "id">> }) => {
      const db = seedIfEmpty();
      const g = updateGoal(db, args.id, args.patch);
      saveDB(db);
      return g;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      const ok = deleteGoal(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals }),
  });
}

/** Adds funds to a goal: inserts a transfer transaction AND bumps savedPaise. */
export function useAddToGoal() {
  const qc = useQueryClient();
  return useMutation<Goal | undefined, Error, { id: string; amountPaise: number; note?: string }>({
    mutationFn: async (args: { id: string; amountPaise: number; note?: string }) => {
      const db = seedIfEmpty();
      const goal = addFundsToGoal(db, args.id, args.amountPaise);
      if (goal) {
        const dateISO = todayISO();
        const fallbackAccountId = defaultAccount(db)?.id;
        addTransaction(db, {
          type: "transfer",
          amountPaise: args.amountPaise,
          category: "investments",
          note: args.note ?? `Saved towards ${goal.name}`,
          dateISO,
          payMode: "Bank",
          ...(fallbackAccountId ? { accountId: fallbackAccountId } : {}),
          goalId: goal.id,
        });
      }
      saveDB(db);
      return goal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.goals });
      invalidateMoney(qc);
    },
  });
}

export function useHoldings() {
  return useQuery({
    queryKey: QK.holdings,
    queryFn: () => listHoldings(seedIfEmpty()),
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation<Holding, Error, Omit<Holding, "id">>({
    mutationFn: async (input: Omit<Holding, "id">) => {
      const db = seedIfEmpty();
      const h = addHolding(db, input);
      saveDB(db);
      return h;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings }),
  });
}

export function useUpdateHolding() {
  const qc = useQueryClient();
  return useMutation<
    Holding | undefined,
    Error,
    { id: string; patch: Partial<Omit<Holding, "id">> }
  >({
    mutationFn: async (args: { id: string; patch: Partial<Omit<Holding, "id">> }) => {
      const db = seedIfEmpty();
      const h = updateHolding(db, args.id, args.patch);
      saveDB(db);
      return h;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings }),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      const ok = deleteHolding(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings }),
  });
}

// ---- Accounts ----

export function useAccounts() {
  return useQuery({
    queryKey: QK.accounts,
    queryFn: () => listAccounts(seedIfEmpty()),
  });
}

/** Accounts with live balances (derived from transactions). */
export function useAccountSummaries(): ReturnType<typeof useQuery<AccountSummary[]>> {
  return useQuery({
    queryKey: QK.accountSummaries,
    queryFn: () => accountSummaries(seedIfEmpty()),
  });
}

function invalidateAccounts(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: QK.accounts });
  qc.invalidateQueries({ queryKey: QK.accountSummaries });
  qc.invalidateQueries({ queryKey: QK.recurringRules });
}

export function useAddAccount() {
  const qc = useQueryClient();
  return useMutation<Account, Error, NewAccount>({
    mutationFn: async (input: NewAccount) => {
      const db = seedIfEmpty();
      const a = addAccount(db, input);
      saveDB(db);
      return a;
    },
    onSuccess: () => invalidateAccounts(qc),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation<
    Account | undefined,
    Error,
    {
      id: string;
      patch: Partial<Pick<Account, "name" | "type" | "iconName" | "color" | "openingBalancePaise">>;
    }
  >({
    mutationFn: async (args: {
      id: string;
      patch: Partial<Pick<Account, "name" | "type" | "iconName" | "color" | "openingBalancePaise">>;
    }) => {
      const db = seedIfEmpty();
      const a = updateAccount(db, args.id, args.patch);
      saveDB(db);
      return a;
    },
    onSuccess: () => invalidateAccounts(qc),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      deleteAccount(db, id);
      saveDB(db);
    },
    onSuccess: () => {
      invalidateAccounts(qc);
      invalidateMoney(qc);
    },
  });
}

export function useSetDefaultAccount() {
  const qc = useQueryClient();
  return useMutation<Account, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      const a = setDefaultAccount(db, id);
      saveDB(db);
      return a;
    },
    onSuccess: () => invalidateAccounts(qc),
  });
}

// ---- Custom categories ----

export function useCustomCategories() {
  return useQuery({
    queryKey: QK.customCategories,
    queryFn: () => listCustomCategories(seedIfEmpty()),
  });
}

function invalidateCategories(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: QK.customCategories });
  // categoryById resolves custom categories straight from the store,
  // so refreshing transactions/budgets picks up renames everywhere.
  qc.invalidateQueries({ queryKey: QK.transactions });
  qc.invalidateQueries({ queryKey: QK.budgets });
}

export function useAddCustomCategory() {
  const qc = useQueryClient();
  return useMutation<CustomCategory, Error, NewCustomCategory>({
    mutationFn: async (input: NewCustomCategory) => {
      const db = seedIfEmpty();
      const c = addCustomCategory(db, input);
      saveDB(db);
      return c;
    },
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useUpdateCustomCategory() {
  const qc = useQueryClient();
  return useMutation<
    CustomCategory | undefined,
    Error,
    { id: string; patch: Partial<Pick<CustomCategory, "label" | "iconName" | "color">> }
  >({
    mutationFn: async (args: {
      id: string;
      patch: Partial<Pick<CustomCategory, "label" | "iconName" | "color">>;
    }) => {
      const db = seedIfEmpty();
      const c = updateCustomCategory(db, args.id, args.patch);
      saveDB(db);
      return c;
    },
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useDeleteCustomCategory() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      const ok = deleteCustomCategory(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => invalidateCategories(qc),
  });
}

// ---- Recurring rules ----

export function useRecurringRules() {
  return useQuery({
    queryKey: QK.recurringRules,
    queryFn: () => listRecurringRules(seedIfEmpty()),
  });
}

export function useAddRecurringRule() {
  const qc = useQueryClient();
  return useMutation<RecurringRule, Error, NewRecurringRule>({
    mutationFn: async (input: NewRecurringRule) => {
      const db = seedIfEmpty();
      const r = addRecurringRule(db, input);
      saveDB(db);
      return r;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

export function useUpdateRecurringRule() {
  const qc = useQueryClient();
  return useMutation<
    RecurringRule | undefined,
    Error,
    { id: string; patch: Parameters<typeof updateRecurringRule>[2] }
  >({
    mutationFn: async (args: { id: string; patch: Parameters<typeof updateRecurringRule>[2] }) => {
      const db = seedIfEmpty();
      const r = updateRecurringRule(db, args.id, args.patch);
      saveDB(db);
      return r;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

export function useDeleteRecurringRule() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      const db = seedIfEmpty();
      const ok = deleteRecurringRule(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

export function useToggleRecurringRule() {
  const qc = useQueryClient();
  return useMutation<RecurringRule | undefined, Error, { id: string; isPaused: boolean }>({
    mutationFn: async (args: { id: string; isPaused: boolean }) => {
      const db = seedIfEmpty();
      const r = setRecurringRulePaused(db, args.id, args.isPaused);
      saveDB(db);
      return r;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

// ---- Tags ----

export function useAllTags() {
  return useQuery({
    queryKey: QK.tags,
    queryFn: () => allTags(seedIfEmpty()),
  });
}

/** Exported query-key namespace so feature workers can invalidate consistently. */
export { QK as FINVERSE_QUERY_KEYS };
