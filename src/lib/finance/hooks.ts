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
  addFundsToGoal,
  balanceForAccount,
  defaultAccountId,
  deleteAccount,
  deleteCustomCategory,
  deleteGoal,
  deleteHolding,
  deleteRecurringRule,
  deleteTransaction,
  ensureRecurringPosted,
  fetchAccounts,
  fetchAllTags,
  fetchBills,
  fetchBudgets,
  fetchCustomCategories,
  fetchGoals,
  fetchHoldings,
  fetchRecurringRules,
  fetchTransactions,
  insertAccount,
  insertCustomCategory,
  insertGoal,
  insertHolding,
  insertRecurringRule,
  insertTransaction,
  markBillPaid,
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
  type RecurringRulePatch,
} from "./db";
import { monthKey as currentMonthKey, todayISO } from "./format";

/**
 * React Query layer over the Supabase data-access module (db.ts).
 *
 * Query keys are namespaced as ['finverse', ...]. Every mutation calls db.ts
 * (scoped to the signed-in user, RLS-enforced) and then invalidates the
 * relevant keys.
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
    queryFn: async () => {
      await ensureRecurringPosted();
      return fetchTransactions(month);
    },
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
    mutationFn: (input: NewTransaction) => insertTransaction(input),
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
    mutationFn: (args: { id: string; patch: Partial<Omit<Transaction, "id" | "createdAt">> }) =>
      updateTransaction(args.id, args.patch),
    onSuccess: () => invalidateMoney(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteTransaction(id),
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
    mutationFn: (input: {
      fromAccountId: string;
      toAccountId: string;
      amountPaise: number;
      note?: string;
      dateISO?: string;
    }) => transferBetweenAccounts(input),
    onSuccess: () => invalidateMoney(qc),
  });
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: [...QK.budgets, month],
    queryFn: () => fetchBudgets(month),
  });
}

export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation<Budget, Error, { categoryId: string; month: string; limitPaise: number }>({
    mutationFn: (input: { categoryId: string; month: string; limitPaise: number }) =>
      setBudget(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.budgets }),
  });
}

export function useBills() {
  return useQuery({
    queryKey: QK.bills,
    queryFn: () => fetchBills(),
  });
}

/** Marks a bill paid and records the matching expense transaction. */
export function usePayBill() {
  const qc = useQueryClient();
  return useMutation<Bill | undefined, Error, { id: string; dateISO?: string }>({
    mutationFn: (args: { id: string; dateISO?: string }) =>
      markBillPaid(args.id, args.dateISO ?? todayISO()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.bills });
      invalidateMoney(qc);
    },
  });
}

export function useGoals() {
  return useQuery({
    queryKey: QK.goals,
    queryFn: () => fetchGoals(),
  });
}

export function useAddGoal() {
  const qc = useQueryClient();
  return useMutation<Goal, Error, Omit<Goal, "id">>({
    mutationFn: (input: Omit<Goal, "id">) => insertGoal(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation<Goal | undefined, Error, { id: string; patch: Partial<Omit<Goal, "id">> }>({
    mutationFn: (args: { id: string; patch: Partial<Omit<Goal, "id">> }) =>
      updateGoal(args.id, args.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals }),
  });
}

/** Adds funds to a goal: inserts a transfer transaction AND bumps savedPaise. */
export function useAddToGoal() {
  const qc = useQueryClient();
  return useMutation<Goal | undefined, Error, { id: string; amountPaise: number; note?: string }>({
    mutationFn: (args: { id: string; amountPaise: number; note?: string }) =>
      addFundsToGoal(args.id, args.amountPaise, args.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.goals });
      invalidateMoney(qc);
    },
  });
}

export function useHoldings() {
  return useQuery({
    queryKey: QK.holdings,
    queryFn: () => fetchHoldings(),
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation<Holding, Error, Omit<Holding, "id">>({
    mutationFn: (input: Omit<Holding, "id">) => insertHolding(input),
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
    mutationFn: (args: { id: string; patch: Partial<Omit<Holding, "id">> }) =>
      updateHolding(args.id, args.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings }),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteHolding(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings }),
  });
}

// ---- Accounts ----

export function useAccounts() {
  return useQuery({
    queryKey: QK.accounts,
    queryFn: () => fetchAccounts(),
  });
}

/** Accounts with live balances (derived from transactions). */
export function useAccountSummaries(): ReturnType<typeof useQuery<AccountSummary[]>> {
  const qc = useQueryClient();
  return useQuery({
    queryKey: QK.accountSummaries,
    queryFn: async () => {
      // Share the canonical unfiltered-transactions query instead of firing a
      // second full-table fetch: pages that mount useTransactions() alongside
      // this hook (dashboard, portfolio) now issue ONE transactions request —
      // React Query dedupes the in-flight fetchQuery with the mounted query.
      // Key shape is unchanged (["finverse", "transactions", "all"]).
      const [accounts, transactions] = await Promise.all([
        fetchAccounts(),
        qc.fetchQuery({
          queryKey: [...QK.transactions, "all"],
          queryFn: async () => {
            await ensureRecurringPosted();
            return fetchTransactions();
          },
        }),
      ]);
      return accounts.map((account) => ({
        account,
        balancePaise: balanceForAccount(account, transactions),
      }));
    },
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
    mutationFn: (input: NewAccount) => insertAccount(input),
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
    mutationFn: (args: {
      id: string;
      patch: Partial<Pick<Account, "name" | "type" | "iconName" | "color" | "openingBalancePaise">>;
    }) => updateAccount(args.id, args.patch),
    onSuccess: () => invalidateAccounts(qc),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      invalidateAccounts(qc);
      invalidateMoney(qc);
    },
  });
}

export function useSetDefaultAccount() {
  const qc = useQueryClient();
  return useMutation<Account, Error, string>({
    mutationFn: (id: string) => setDefaultAccount(id),
    onSuccess: () => invalidateAccounts(qc),
  });
}

// ---- Custom categories ----

export function useCustomCategories() {
  return useQuery({
    queryKey: QK.customCategories,
    // fetchCustomCategories also refreshes the synchronous category lookup cache
    // in categories.ts, so categoryById resolves fresh names everywhere.
    queryFn: () => fetchCustomCategories(),
  });
}

function invalidateCategories(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: QK.customCategories });
  // categoryById resolves custom categories from the lookup cache, so
  // refreshing transactions/budgets picks up renames everywhere.
  qc.invalidateQueries({ queryKey: QK.transactions });
  qc.invalidateQueries({ queryKey: QK.budgets });
}

export function useAddCustomCategory() {
  const qc = useQueryClient();
  return useMutation<CustomCategory, Error, NewCustomCategory>({
    mutationFn: (input: NewCustomCategory) => insertCustomCategory(input),
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
    mutationFn: (args: {
      id: string;
      patch: Partial<Pick<CustomCategory, "label" | "iconName" | "color">>;
    }) => updateCustomCategory(args.id, args.patch),
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useDeleteCustomCategory() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteCustomCategory(id),
    onSuccess: () => invalidateCategories(qc),
  });
}

// ---- Recurring rules ----

export function useRecurringRules() {
  return useQuery({
    queryKey: QK.recurringRules,
    queryFn: () => fetchRecurringRules(),
  });
}

export function useAddRecurringRule() {
  const qc = useQueryClient();
  return useMutation<RecurringRule, Error, NewRecurringRule>({
    mutationFn: (input: NewRecurringRule) => insertRecurringRule(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

export function useUpdateRecurringRule() {
  const qc = useQueryClient();
  return useMutation<RecurringRule | undefined, Error, { id: string; patch: RecurringRulePatch }>({
    mutationFn: (args: { id: string; patch: RecurringRulePatch }) =>
      updateRecurringRule(args.id, args.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

export function useDeleteRecurringRule() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteRecurringRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

export function useToggleRecurringRule() {
  const qc = useQueryClient();
  return useMutation<RecurringRule | undefined, Error, { id: string; isPaused: boolean }>({
    mutationFn: (args: { id: string; isPaused: boolean }) =>
      setRecurringRulePaused(args.id, args.isPaused),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules }),
  });
}

// ---- Tags ----

export function useAllTags() {
  return useQuery({
    queryKey: QK.tags,
    queryFn: () => fetchAllTags(),
  });
}

/** Re-exported so other modules can resolve the default account without a hook. */
export { defaultAccountId };

/** Exported query-key namespace so feature workers can invalidate consistently. */
export { QK as FINVERSE_QUERY_KEYS };
