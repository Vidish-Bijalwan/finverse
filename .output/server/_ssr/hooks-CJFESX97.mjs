import { i as __toESM } from "../_runtime.mjs";
import { a as monthKey, s as todayISO } from "./utils-CLFOCKAi.mjs";
import { A as saveDB, B as updateRecurringRule, C as listGoals, E as listTransactions, F as transferBetweenAccounts, I as updateAccount, L as updateCustomCategory, M as setBudget, N as setDefaultAccount, O as markBillPaid, P as setRecurringRulePaused, R as updateGoal, S as listCustomCategories, T as listRecurringRules, V as updateTransaction, _ as deleteRecurringRule, a as addCustomCategory, b as listAccounts, c as addHolding, d as allTags, f as defaultAccount, g as deleteHolding, h as deleteGoal, i as addAccount, j as seedIfEmpty, l as addRecurringRule, m as deleteCustomCategory, o as addFundsToGoal, p as deleteAccount, r as accountSummaries, s as addGoal, u as addTransaction, v as deleteTransaction, w as listHoldings, x as listBills, y as getBudgets, z as updateHolding } from "./store-DCGtoGuR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hooks-CJFESX97.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* React Query layer over the localStorage store.
*
* Query keys are namespaced as ['finverse', ...]. Every mutation writes via
* store.ts (load -> mutate -> saveDB) and then invalidates the relevant keys.
*
* SSR note: queryFns run through seedIfEmpty(), which is SSR-safe
* (server returns an unpersisted in-memory seed; browser persists to localStorage).
*/
var QK = {
	transactions: ["finverse", "transactions"],
	budgets: ["finverse", "budgets"],
	bills: ["finverse", "bills"],
	goals: ["finverse", "goals"],
	holdings: ["finverse", "holdings"],
	accounts: ["finverse", "accounts"],
	accountSummaries: ["finverse", "account-summaries"],
	customCategories: ["finverse", "custom-categories"],
	recurringRules: ["finverse", "recurring-rules"],
	tags: ["finverse", "tags"]
};
/** Selected month state ("YYYY-MM"), defaulting to the current month. */
function useMonth() {
	return (0, import_react.useState)(() => monthKey(/* @__PURE__ */ new Date()));
}
function useTransactions(month) {
	return useQuery({
		queryKey: [...QK.transactions, month ?? "all"],
		queryFn: () => listTransactions(seedIfEmpty(), month)
	});
}
/** Invalidate everything that derives from transactions (lists + live balances). */
function invalidateMoney(qc) {
	qc.invalidateQueries({ queryKey: QK.transactions });
	qc.invalidateQueries({ queryKey: QK.accountSummaries });
	qc.invalidateQueries({ queryKey: QK.tags });
}
function useAddTransaction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const txn = addTransaction(db, input);
			saveDB(db);
			return txn;
		},
		onSuccess: () => invalidateMoney(qc)
	});
}
function useUpdateTransaction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const txn = updateTransaction(db, args.id, args.patch);
			saveDB(db);
			return txn;
		},
		onSuccess: () => invalidateMoney(qc)
	});
}
function useDeleteTransaction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			const ok = deleteTransaction(db, id);
			saveDB(db);
			return ok;
		},
		onSuccess: () => invalidateMoney(qc)
	});
}
/** Record an account-to-account transfer (debits one account, credits another). */
function useTransfer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const txn = transferBetweenAccounts(db, input);
			saveDB(db);
			return txn;
		},
		onSuccess: () => invalidateMoney(qc)
	});
}
function useBudgets(month) {
	return useQuery({
		queryKey: [...QK.budgets, month],
		queryFn: () => getBudgets(seedIfEmpty(), month)
	});
}
function useSetBudget() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const b = setBudget(db, input);
			saveDB(db);
			return b;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.budgets })
	});
}
function useBills() {
	return useQuery({
		queryKey: QK.bills,
		queryFn: () => listBills(seedIfEmpty())
	});
}
/** Marks a bill paid and records the matching expense transaction. */
function usePayBill() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
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
					...fallbackAccountId ? { accountId: fallbackAccountId } : {},
					billId: bill.id
				});
			}
			saveDB(db);
			return bill;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: QK.bills });
			invalidateMoney(qc);
		}
	});
}
function useGoals() {
	return useQuery({
		queryKey: QK.goals,
		queryFn: () => listGoals(seedIfEmpty())
	});
}
function useAddGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const g = addGoal(db, input);
			saveDB(db);
			return g;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals })
	});
}
function useUpdateGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const g = updateGoal(db, args.id, args.patch);
			saveDB(db);
			return g;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals })
	});
}
function useDeleteGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			const ok = deleteGoal(db, id);
			saveDB(db);
			return ok;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals })
	});
}
/** Adds funds to a goal: inserts a transfer transaction AND bumps savedPaise. */
function useAddToGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
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
					...fallbackAccountId ? { accountId: fallbackAccountId } : {},
					goalId: goal.id
				});
			}
			saveDB(db);
			return goal;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: QK.goals });
			invalidateMoney(qc);
		}
	});
}
function useHoldings() {
	return useQuery({
		queryKey: QK.holdings,
		queryFn: () => listHoldings(seedIfEmpty())
	});
}
function useAddHolding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const h = addHolding(db, input);
			saveDB(db);
			return h;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings })
	});
}
function useUpdateHolding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const h = updateHolding(db, args.id, args.patch);
			saveDB(db);
			return h;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings })
	});
}
function useDeleteHolding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			const ok = deleteHolding(db, id);
			saveDB(db);
			return ok;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings })
	});
}
function useAccounts() {
	return useQuery({
		queryKey: QK.accounts,
		queryFn: () => listAccounts(seedIfEmpty())
	});
}
/** Accounts with live balances (derived from transactions). */
function useAccountSummaries() {
	return useQuery({
		queryKey: QK.accountSummaries,
		queryFn: () => accountSummaries(seedIfEmpty())
	});
}
function invalidateAccounts(qc) {
	qc.invalidateQueries({ queryKey: QK.accounts });
	qc.invalidateQueries({ queryKey: QK.accountSummaries });
	qc.invalidateQueries({ queryKey: QK.recurringRules });
}
function useAddAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const a = addAccount(db, input);
			saveDB(db);
			return a;
		},
		onSuccess: () => invalidateAccounts(qc)
	});
}
function useUpdateAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const a = updateAccount(db, args.id, args.patch);
			saveDB(db);
			return a;
		},
		onSuccess: () => invalidateAccounts(qc)
	});
}
function useDeleteAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			deleteAccount(db, id);
			saveDB(db);
		},
		onSuccess: () => {
			invalidateAccounts(qc);
			invalidateMoney(qc);
		}
	});
}
function useSetDefaultAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			const a = setDefaultAccount(db, id);
			saveDB(db);
			return a;
		},
		onSuccess: () => invalidateAccounts(qc)
	});
}
function useCustomCategories() {
	return useQuery({
		queryKey: QK.customCategories,
		queryFn: () => listCustomCategories(seedIfEmpty())
	});
}
function invalidateCategories(qc) {
	qc.invalidateQueries({ queryKey: QK.customCategories });
	qc.invalidateQueries({ queryKey: QK.transactions });
	qc.invalidateQueries({ queryKey: QK.budgets });
}
function useAddCustomCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const c = addCustomCategory(db, input);
			saveDB(db);
			return c;
		},
		onSuccess: () => invalidateCategories(qc)
	});
}
function useUpdateCustomCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const c = updateCustomCategory(db, args.id, args.patch);
			saveDB(db);
			return c;
		},
		onSuccess: () => invalidateCategories(qc)
	});
}
function useDeleteCustomCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			const ok = deleteCustomCategory(db, id);
			saveDB(db);
			return ok;
		},
		onSuccess: () => invalidateCategories(qc)
	});
}
function useRecurringRules() {
	return useQuery({
		queryKey: QK.recurringRules,
		queryFn: () => listRecurringRules(seedIfEmpty())
	});
}
function useAddRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const db = seedIfEmpty();
			const r = addRecurringRule(db, input);
			saveDB(db);
			return r;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useUpdateRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const r = updateRecurringRule(db, args.id, args.patch);
			saveDB(db);
			return r;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useDeleteRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const db = seedIfEmpty();
			const ok = deleteRecurringRule(db, id);
			saveDB(db);
			return ok;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useToggleRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (args) => {
			const db = seedIfEmpty();
			const r = setRecurringRulePaused(db, args.id, args.isPaused);
			saveDB(db);
			return r;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useAllTags() {
	return useQuery({
		queryKey: QK.tags,
		queryFn: () => allTags(seedIfEmpty())
	});
}
//#endregion
export { useTransfer as A, useMonth as C, useSetDefaultAccount as D, useSetBudget as E, useUpdateRecurringRule as F, useUpdateTransaction as I, useUpdateCustomCategory as M, useUpdateGoal as N, useToggleRecurringRule as O, useUpdateHolding as P, useHoldings as S, useRecurringRules as T, useDeleteGoal as _, useAddCustomCategory as a, useDeleteTransaction as b, useAddRecurringRule as c, useAllTags as d, useBills as f, useDeleteCustomCategory as g, useDeleteAccount as h, useAddAccount as i, useUpdateAccount as j, useTransactions as k, useAddToGoal as l, useCustomCategories as m, useAccountSummaries as n, useAddGoal as o, useBudgets as p, useAccounts as r, useAddHolding as s, QK as t, useAddTransaction as u, useDeleteHolding as v, usePayBill as w, useGoals as x, useDeleteRecurringRule as y };
