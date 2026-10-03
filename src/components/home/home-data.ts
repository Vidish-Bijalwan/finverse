/**
 * Pure dashboard helpers for the home screen (cash flow, recent activity,
 * derived insights). Everything here is deterministic over ledger data —
 * no invented numbers, no fake insights.
 */
import { categoryById } from "@/lib/finance/categories";
import { isInvestmentOrder } from "@/lib/finance/investments";
import type { Transaction } from "@/lib/finance/types";

/** "2026-10" shifted by delta months, e.g. shiftMonthKey("2026-10", -1) -> "2026-09". */
export function shiftMonthKey(key: string, delta: number): string {
  const parts = key.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-10" -> "Oct" for compact chart axis labels. */
export function shortMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const months = [
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
  return months[(m ?? 1) - 1] ?? String(y ?? "");
}

/** "2026-10-03" -> "3 Oct 2026". */
export function dateLabel(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "2026-10-03T14:30:00" -> "2:30 PM". Empty string when unparseable. */
export function timeLabel(dateTimeISO: string): string {
  const d = new Date(dateTimeISO);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export interface FlowBar {
  /** e.g. "2026-10" or "2026-10-w3". */
  key: string;
  /** Compact axis label, e.g. "Oct" or "15–21". */
  label: string;
  /** Integer paise. */
  income: number;
  /** Integer paise. */
  expense: number;
}

/**
 * Trailing `count` monthly income/expense bars ending at `anchorKey`
 * (inclusive). Months with no activity yield zero bars — never synthesized.
 */
export function buildMonthFlows(txns: Transaction[], anchorKey: string, count: number): FlowBar[] {
  const flows: FlowBar[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = shiftMonthKey(anchorKey, -i);
    let income = 0;
    let expense = 0;
    for (const t of txns) {
      if (t.dateISO.slice(0, 7) !== key) continue;
      // Investment orders are transfers (cash ↔ investments), never
      // spending — and legacy expense/income-shaped brokerage rows must not
      // pollute cash flow either.
      if (isInvestmentOrder(t)) continue;
      if (t.type === "income") income += t.amountPaise;
      else if (t.type === "expense") expense += t.amountPaise;
    }
    flows.push({ key, label: shortMonthLabel(key), income, expense });
  }
  return flows;
}

/**
 * Weekly income/expense bars for one month ("1M" view). Weeks are
 * day-of-month buckets (1–7, 8–14, …), so every transaction in the month
 * lands in exactly one bar and labels stay honest.
 */
export function buildWeekFlows(txns: Transaction[], monthKey: string): FlowBar[] {
  const [y, m] = monthKey.split("-").map(Number);
  const lastDay = new Date(y ?? 1970, (m ?? 1) - 1 + 1, 0).getDate();
  const weekCount = Math.ceil(lastDay / 7);
  const weeks: FlowBar[] = [];
  for (let w = 0; w < weekCount; w++) {
    const start = w * 7 + 1;
    const end = Math.min((w + 1) * 7, lastDay);
    weeks.push({
      key: `${monthKey}-w${w + 1}`,
      label: `${start}–${end}`,
      income: 0,
      expense: 0,
    });
  }
  for (const t of txns) {
    if (t.dateISO.slice(0, 7) !== monthKey) continue;
    if (isInvestmentOrder(t)) continue;
    const day = Number(t.dateISO.slice(8, 10));
    const w = weeks[Math.min(Math.ceil(day / 7) - 1, weeks.length - 1)];
    if (!w) continue;
    if (t.type === "income") w.income += t.amountPaise;
    else if (t.type === "expense") w.expense += t.amountPaise;
  }
  return weeks;
}

export interface CategorySpend {
  id: string;
  label: string;
  color: string;
  /** Integer paise. */
  value: number;
}

/**
 * Top spending categories (expenses only) for an inclusive month range,
 * largest first. `fromKey`/`toKey` are "YYYY-MM" strings. Investment orders
 * are excluded — a stock buy is a transfer, not spending.
 */
export function topSpendingCategories(
  txns: Transaction[],
  fromKey: string,
  toKey: string,
  limit = 4,
): CategorySpend[] {
  const totals = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    if (isInvestmentOrder(t)) continue;
    const key = t.dateISO.slice(0, 7);
    if (key < fromKey || key > toKey) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountPaise);
  }
  return [...totals.entries()]
    .map(([id, value]) => {
      const cat = categoryById(id);
      return { id, label: cat?.label ?? id, color: cat?.color ?? "#64748B", value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export interface CategoryMover {
  label: string;
  /** Signed integer paise (positive = spend rose). */
  delta: number;
  /** % change vs the previous month, null when there is no base. */
  pct: number | null;
  direction: "up" | "down";
}

/**
 * The category whose month-over-month spend moved the most (by absolute
 * paise), expenses only. Investment orders are excluded (transfers, not
 * spending). Returns null when there is no movement at all —
 * callers must not render an insight card in that case.
 */
export function categoryMover(
  txns: Transaction[],
  month: string,
  prev: string,
): CategoryMover | null {
  const current = new Map<string, number>();
  const previous = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    if (isInvestmentOrder(t)) continue;
    const key = t.dateISO.slice(0, 7);
    if (key === month) current.set(t.category, (current.get(t.category) ?? 0) + t.amountPaise);
    else if (key === prev)
      previous.set(t.category, (previous.get(t.category) ?? 0) + t.amountPaise);
  }
  let best: CategoryMover | null = null;
  for (const id of new Set([...current.keys(), ...previous.keys()])) {
    const cur = current.get(id) ?? 0;
    const prv = previous.get(id) ?? 0;
    const delta = cur - prv;
    if (delta === 0) continue;
    if (!best || Math.abs(delta) > Math.abs(best.delta)) {
      const cat = categoryById(id);
      best = {
        label: cat?.label ?? id,
        delta,
        pct: prv > 0 ? Math.round((delta / prv) * 100) : null,
        direction: delta > 0 ? "up" : "down",
      };
    }
  }
  return best;
}

/** Most recent transactions first (date desc, id desc tiebreak). */
export function recentTransactions(txns: Transaction[], limit = 7): Transaction[] {
  return [...txns]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO) || b.id.localeCompare(a.id))
    .slice(0, limit);
}

/** Signed paise for list rendering: income positive, expenses negative.
 * Transfers are money-out (negative) except inbound transfers with no source
 * account — e.g. sell proceeds landing in cash — which are money-in. */
export function signedAmountPaise(t: Transaction): number {
  if (t.type === "income") return t.amountPaise;
  if (t.type === "transfer" && t.toAccountId && !t.accountId) return t.amountPaise;
  return -t.amountPaise;
}

/**
 * Second line for a payment-app-style row:
 * "3 Oct 2026 · 2:30 PM · Dining · UPI". The category is included only when
 * the merchant/name line already shows the note, so context is never lost.
 */
export function txnSecondary(t: Transaction, showCategory: boolean): string {
  const parts: string[] = [dateLabel(t.dateISO)];
  const time = timeLabel(t.createdAt);
  if (time) parts.push(time);
  if (showCategory) parts.push(categoryById(t.category)?.label ?? t.category);
  if (t.payMode) parts.push(payModeLabel(t.payMode));
  return parts.join(" · ");
}

/** "upi_test" -> "UPI · test" — never show raw enum tokens to users. */
export function payModeLabel(mode: Transaction["payMode"]): string {
  switch (mode) {
    case "upi_test":
      return "UPI · test";
    case "razorpay_test":
      return "Razorpay · test";
    case "bank_test":
      return "Bank · test";
    default:
      return mode;
  }
}
