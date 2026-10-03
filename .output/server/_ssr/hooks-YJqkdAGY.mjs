import { i as __toESM } from "../_runtime.mjs";
import { a as todayISO, r as monthKey } from "./format-DIQ2AWaF.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as setBudget, B as updateTransaction, C as insertCustomCategory, D as insertTransaction, E as insertRecurringRule, I as updateCustomCategory, L as updateGoal, M as setRecurringRulePaused, N as transferBetweenAccounts, P as updateAccount, R as updateHolding, T as insertHolding, _ as fetchGoals, b as fetchTransactions, c as deleteHolding, d as ensureRecurringPosted, f as fetchAccounts, g as fetchCustomCategories, h as fetchBudgets, i as deleteAccount, j as setDefaultAccount, k as markBillPaid, l as deleteRecurringRule, m as fetchBills, n as balanceForAccount, o as deleteCustomCategory, p as fetchAllTags, s as deleteGoal, t as addFundsToGoal, u as deleteTransaction, v as fetchHoldings, w as insertGoal, x as insertAccount, y as fetchRecurringRules, z as updateRecurringRule } from "./db-36JnVPiF.mjs";
import { t as FINVERSE_QUERY_DEFAULTS } from "./query-BmyAv6X-.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hooks-YJqkdAGY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* React Query layer over the Supabase data-access module (db.ts).
*
* Query keys are namespaced as ['finverse', ...]. Every mutation calls db.ts
* (scoped to the signed-in user, RLS-enforced) and then invalidates the
* relevant keys.
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
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: [...QK.transactions, month ?? "all"],
		queryFn: async () => {
			await ensureRecurringPosted();
			return fetchTransactions(month);
		}
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
		mutationFn: (input) => insertTransaction(input),
		onSuccess: () => invalidateMoney(qc)
	});
}
function useUpdateTransaction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => updateTransaction(args.id, args.patch),
		onSuccess: () => invalidateMoney(qc)
	});
}
function useDeleteTransaction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteTransaction(id),
		onSuccess: () => invalidateMoney(qc)
	});
}
/** Record an account-to-account transfer (debits one account, credits another). */
function useTransfer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => transferBetweenAccounts(input),
		onSuccess: () => invalidateMoney(qc)
	});
}
function useBudgets(month) {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: [...QK.budgets, month],
		queryFn: () => fetchBudgets(month)
	});
}
function useSetBudget() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => setBudget(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.budgets })
	});
}
function useBills() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.bills,
		queryFn: () => fetchBills()
	});
}
/** Marks a bill paid and records the matching expense transaction. */
function usePayBill() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => markBillPaid(args.id, args.dateISO ?? todayISO()),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: QK.bills });
			invalidateMoney(qc);
		}
	});
}
function useGoals() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.goals,
		queryFn: () => fetchGoals()
	});
}
function useAddGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => insertGoal(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals })
	});
}
function useUpdateGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => updateGoal(args.id, args.patch),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals })
	});
}
function useDeleteGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteGoal(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.goals })
	});
}
/** Adds funds to a goal: inserts a transfer transaction AND bumps savedPaise. */
function useAddToGoal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => addFundsToGoal(args.id, args.amountPaise, args.note),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: QK.goals });
			invalidateMoney(qc);
		}
	});
}
function useHoldings() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.holdings,
		queryFn: () => fetchHoldings()
	});
}
function useAddHolding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => insertHolding(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings })
	});
}
function useUpdateHolding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => updateHolding(args.id, args.patch),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings })
	});
}
function useDeleteHolding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteHolding(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.holdings })
	});
}
function useAccounts() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.accounts,
		queryFn: () => fetchAccounts()
	});
}
/** Accounts with live balances (derived from transactions). */
function useAccountSummaries() {
	const qc = useQueryClient();
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.accountSummaries,
		queryFn: async () => {
			const [accounts, transactions] = await Promise.all([fetchAccounts(), qc.fetchQuery({
				...FINVERSE_QUERY_DEFAULTS,
				queryKey: [...QK.transactions, "all"],
				queryFn: async () => {
					await ensureRecurringPosted();
					return fetchTransactions();
				}
			})]);
			return accounts.map((account) => ({
				account,
				balancePaise: balanceForAccount(account, transactions)
			}));
		}
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
		mutationFn: (input) => insertAccount(input),
		onSuccess: () => invalidateAccounts(qc)
	});
}
function useUpdateAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => updateAccount(args.id, args.patch),
		onSuccess: () => invalidateAccounts(qc)
	});
}
function useDeleteAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteAccount(id),
		onSuccess: () => {
			invalidateAccounts(qc);
			invalidateMoney(qc);
		}
	});
}
function useSetDefaultAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => setDefaultAccount(id),
		onSuccess: () => invalidateAccounts(qc)
	});
}
function useCustomCategories() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.customCategories,
		queryFn: () => fetchCustomCategories()
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
		mutationFn: (input) => insertCustomCategory(input),
		onSuccess: () => invalidateCategories(qc)
	});
}
function useUpdateCustomCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => updateCustomCategory(args.id, args.patch),
		onSuccess: () => invalidateCategories(qc)
	});
}
function useDeleteCustomCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCustomCategory(id),
		onSuccess: () => invalidateCategories(qc)
	});
}
function useRecurringRules() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.recurringRules,
		queryFn: () => fetchRecurringRules()
	});
}
function useAddRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => insertRecurringRule(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useUpdateRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => updateRecurringRule(args.id, args.patch),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useDeleteRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteRecurringRule(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useToggleRecurringRule() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (args) => setRecurringRulePaused(args.id, args.isPaused),
		onSuccess: () => qc.invalidateQueries({ queryKey: QK.recurringRules })
	});
}
function useAllTags() {
	return useQuery({
		...FINVERSE_QUERY_DEFAULTS,
		queryKey: QK.tags,
		queryFn: () => fetchAllTags()
	});
}
//#endregion
export { useTransfer as A, useMonth as C, useSetDefaultAccount as D, useSetBudget as E, useUpdateRecurringRule as F, useUpdateTransaction as I, useUpdateCustomCategory as M, useUpdateGoal as N, useToggleRecurringRule as O, useUpdateHolding as P, useHoldings as S, useRecurringRules as T, useDeleteGoal as _, useAddCustomCategory as a, useDeleteTransaction as b, useAddRecurringRule as c, useAllTags as d, useBills as f, useDeleteCustomCategory as g, useDeleteAccount as h, useAddAccount as i, useUpdateAccount as j, useTransactions as k, useAddToGoal as l, useCustomCategories as m, useAccountSummaries as n, useAddGoal as o, useBudgets as p, useAccounts as r, useAddHolding as s, QK as t, useAddTransaction as u, useDeleteHolding as v, usePayBill as w, useGoals as x, useDeleteRecurringRule as y };
