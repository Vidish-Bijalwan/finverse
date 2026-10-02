import { useState, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bill, Budget, Goal, Holding, Transaction } from "./types";
import {
  addFundsToGoal,
  addGoal,
  addHolding,
  addTransaction,
  deleteGoal,
  deleteHolding,
  deleteTransaction,
  getBudgets,
  listBills,
  listGoals,
  listHoldings,
  listTransactions,
  markBillPaid,
  saveDB,
  seedIfEmpty,
  setBudget,
  updateGoal,
  updateHolding,
  updateTransaction,
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

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTransaction): Transaction => {
      const db = seedIfEmpty();
      const txn = addTransaction(db, input);
      saveDB(db);
      return txn;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.transactions }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; patch: Partial<Omit<Transaction, "id" | "createdAt">> }) => {
      const db = seedIfEmpty();
      const txn = updateTransaction(db, args.id, args.patch);
      saveDB(db);
      return txn;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.transactions }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): boolean => {
      const db = seedIfEmpty();
      const ok = deleteTransaction(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.transactions }),
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
  return useMutation({
    mutationFn: (input: { categoryId: string; month: string; limitPaise: number }): Budget => {
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
  return useMutation({
    mutationFn: (args: { id: string; dateISO?: string }): Bill | undefined => {
      const db = seedIfEmpty();
      const dateISO = args.dateISO ?? todayISO();
      const bill = markBillPaid(db, args.id, dateISO);
      if (bill) {
        addTransaction(db, {
          type: "expense",
          amountPaise: bill.amountPaise,
          category: bill.category,
          note: `${bill.name} bill paid`,
          dateISO,
          payMode: "UPI",
          billId: bill.id,
        });
      }
      saveDB(db);
      return bill;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.bills });
      qc.invalidateQueries({ queryKey: QK.transactions });
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
  return useMutation({
    mutationFn: (input: Omit<Goal, "id">): Goal => {
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
  return useMutation({
    mutationFn: (args: { id: string; patch: Partial<Omit<Goal, "id">> }) => {
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
  return useMutation({
    mutationFn: (id: string): boolean => {
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
  return useMutation({
    mutationFn: (args: { id: string; amountPaise: number; note?: string }): Goal | undefined => {
      const db = seedIfEmpty();
      const goal = addFundsToGoal(db, args.id, args.amountPaise);
      if (goal) {
        const dateISO = todayISO();
        addTransaction(db, {
          type: "transfer",
          amountPaise: args.amountPaise,
          category: "investments",
          note: args.note ?? `Saved towards ${goal.name}`,
          dateISO,
          payMode: "Bank",
          goalId: goal.id,
        });
      }
      saveDB(db);
      return goal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.goals });
      qc.invalidateQueries({ queryKey: QK.transactions });
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
  return useMutation({
    mutationFn: (input: Omit<Holding, "id">): Holding => {
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
  return useMutation({
    mutationFn: (args: { id: string; patch: Partial<Omit<Holding, "id">> }) => {
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
  return useMutation({
    mutationFn: (id: string): boolean => {
      const db = seedIfEmpty();
      const ok = deleteHolding(db, id);
      saveDB(db);
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings }),
  });
}

/** Exported query-key namespace so feature workers can invalidate consistently. */
export { QK as FINVERSE_QUERY_KEYS };
