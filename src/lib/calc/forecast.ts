/**
 * Cash-flow forecast — pure functions over the user's transaction history.
 *
 * Approach: bucket expense/income transactions by calendar month (excluding
 * transfers), then project the next N months from per-category monthly
 * averages. Bills from the store are treated as committed recurring outflows
 * and shown separately so double-counting is obvious.
 *
 * Amounts are RUPEES. History with zero usable months returns an explicit
 * "no data" result rather than zeros presented as fact.
 */

import type { Bill, Transaction } from "@/lib/finance/types";

export interface MonthTotals {
  /** "YYYY-MM". */
  key: string;
  /** Short label, e.g. "Oct '26". */
  label: string;
  income: number;
  expenses: number;
}

export interface CategoryMonthly {
  category: string;
  /** Average monthly spend (rupees). */
  avgMonthly: number;
  /** How many of the history months this category appeared in. */
  monthsActive: number;
}

export interface ForecastMonth {
  key: string;
  label: string;
  /** True for projected months. */
  projected: boolean;
  income: number;
  expenses: number;
  net: number;
}

export interface ForecastResult {
  /** Usable history months (with at least one income/expense txn). */
  historyMonths: number;
  history: MonthTotals[];
  categories: CategoryMonthly[];
  /** Committed monthly bill outflows (rupees), from the store. */
  monthlyBillOutflow: number;
  projection: ForecastMonth[];
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  /** Month labels are derived from the most recent history month. */
  insufficientData: boolean;
}

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function shiftMonth(key: string, delta: number): string {
  const parts = key.split("-").map(Number);
  let y = parts[0] ?? 0;
  let m = parts[1] ?? 1;
  m += delta;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const parts = key.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  return `${MONTH_ABBR[m - 1] ?? "?"} '${String(y).slice(2)}`;
}

/** Next calendar month relative to `todayKey` ("YYYY-MM"). */
export function nextMonthKey(todayKey: string): string {
  return shiftMonth(todayKey, 1);
}

export function forecastCashFlow(
  transactions: Transaction[],
  bills: Bill[],
  todayKey: string,
  projectionMonths = 3,
): ForecastResult {
  const monthly = new Map<string, { income: number; expenses: number }>();
  const catMonthly = new Map<string, Map<string, number>>();

  for (const t of transactions) {
    if (t.type === "transfer") continue;
    const rupees = t.amountPaise / 100;
    if (!Number.isFinite(rupees) || rupees <= 0) continue;
    const key = t.dateISO.slice(0, 7);
    // Ignore future-dated months for the averages.
    if (key > todayKey) continue;
    let m = monthly.get(key);
    if (!m) {
      m = { income: 0, expenses: 0 };
      monthly.set(key, m);
    }
    if (t.type === "income") m.income += rupees;
    else m.expenses += rupees;

    if (t.type === "expense") {
      let cm = catMonthly.get(t.category);
      if (!cm) {
        cm = new Map();
        catMonthly.set(t.category, cm);
      }
      cm.set(key, (cm.get(key) ?? 0) + rupees);
    }
  }

  const sortedKeys = [...monthly.keys()].sort();
  const historyMonths = sortedKeys.length;

  const history: MonthTotals[] = sortedKeys.map((key) => ({
    key,
    label: monthLabel(key),
    income: Math.round(monthly.get(key)!.income),
    expenses: Math.round(monthly.get(key)!.expenses),
  }));

  const avgMonthlyIncome =
    historyMonths > 0 ? history.reduce((s, h) => s + h.income, 0) / historyMonths : 0;
  const avgMonthlyExpenses =
    historyMonths > 0 ? history.reduce((s, h) => s + h.expenses, 0) / historyMonths : 0;

  const categories: CategoryMonthly[] = [...catMonthly.entries()]
    .map(([category, byMonth]) => ({
      category,
      avgMonthly: [...byMonth.values()].reduce((s, v) => s + v, 0) / Math.max(1, historyMonths),
      monthsActive: byMonth.size,
    }))
    .filter((c) => c.avgMonthly >= 1)
    .sort((a, b) => b.avgMonthly - a.avgMonthly);

  const monthlyBillOutflow = bills.reduce((s, b) => s + b.amountPaise / 100, 0);

  const anchor = historyMonths > 0 ? (sortedKeys[sortedKeys.length - 1] ?? todayKey) : todayKey;
  const projection: ForecastMonth[] = [];
  for (let i = 1; i <= projectionMonths; i++) {
    const key = shiftMonth(anchor, i);
    const income = Math.round(avgMonthlyIncome);
    const expenses = Math.round(avgMonthlyExpenses);
    projection.push({
      key,
      label: monthLabel(key),
      projected: true,
      income,
      expenses,
      net: income - expenses,
    });
  }

  return {
    historyMonths,
    history,
    categories,
    monthlyBillOutflow: Math.round(monthlyBillOutflow),
    projection,
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
    avgMonthlyExpenses: Math.round(avgMonthlyExpenses),
    insufficientData: historyMonths === 0,
  };
}
