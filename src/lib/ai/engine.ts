/**
 * Deterministic, explainable insights engine for FinVerse AI.
 *
 * Every insight is computed by a plain rule over the user's REAL stored data —
 * there is no randomness and no model inference here. Each insight carries an
 * `evidence` array of human-readable facts with exact figures, so the UI can
 * always answer "why am I seeing this?" by expanding the evidence list.
 *
 * Contract with feature workers:
 * - Money stays in integer paise until the final formatINR() call.
 * - `buildInsights(db, monthKey)` is pure and SSR-safe (no window access).
 * - Insight kinds used: "overspend" | "savings" | "budget" | "unusual" | "goal" | "bill".
 */

import { categoryById } from "../finance/categories";
import { formatINR, monthLabel, todayISO } from "../finance/format";
import { getBudgets, listTransactions } from "../finance/store";
import type { Bill, FinanceDB, Insight, Transaction } from "../finance/types";

/** "2026-10" -> "2026-09" (works across year boundaries). Exported for chat reuse. */
export function previousMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

const sumPaise = (txns: Transaction[]): number => txns.reduce((s, t) => s + t.amountPaise, 0);

function monthTxns(db: FinanceDB, key: string): Transaction[] {
  return listTransactions(db, key);
}

function expenseTxns(db: FinanceDB, key: string): Transaction[] {
  return monthTxns(db, key).filter((t) => t.type === "expense");
}

function incomeTxns(db: FinanceDB, key: string): Transaction[] {
  return monthTxns(db, key).filter((t) => t.type === "income");
}

function spendByCategory(txns: Transaction[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of txns) m.set(t.category, (m.get(t.category) ?? 0) + t.amountPaise);
  return m;
}

function catLabel(id: string): string {
  return categoryById(id)?.label ?? id;
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

// ---------------------------------------------------------------------------
// (a) Overspend: expense category up >20% vs last month
// ---------------------------------------------------------------------------

function overspendInsights(db: FinanceDB, cur: string, prev: string): Insight[] {
  const curSpend = spendByCategory(expenseTxns(db, cur));
  const prevSpend = spendByCategory(expenseTxns(db, prev));
  const out: Insight[] = [];

  for (const [catId, curAmt] of curSpend) {
    const prevAmt = prevSpend.get(catId) ?? 0;
    // Need a real baseline: skip categories with no spend last month.
    if (prevAmt <= 0 || curAmt <= prevAmt * 1.2) continue;
    const delta = curAmt - prevAmt;
    const deltaPct = Math.round((delta / prevAmt) * 100);
    const label = catLabel(catId);
    out.push({
      id: `overspend-${catId}`,
      title: `${label} spending is up ${deltaPct}% vs last month`,
      body: `You spent ${formatINR(curAmt)} on ${label.toLowerCase()} in ${monthLabel(cur)}, compared with ${formatINR(prevAmt)} in ${monthLabel(prev)}. That is ${formatINR(delta)} more — worth checking what drove the jump.`,
      evidence: [
        `${label} spend in ${monthLabel(cur)}: ${formatINR(curAmt)}`,
        `${label} spend in ${monthLabel(prev)}: ${formatINR(prevAmt)}`,
        `Increase of ${formatINR(delta)} (${deltaPct}% above last month)`,
      ],
      confidence: deltaPct >= 50 ? "high" : "medium",
      kind: "overspend",
      createdAt: nowISO(),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// (b) Savings-rate delta: (income - expense) / income, this month vs last
// ---------------------------------------------------------------------------

function savingsInsights(db: FinanceDB, cur: string, prev: string): Insight[] {
  const incomeCur = sumPaise(incomeTxns(db, cur));
  const expenseCur = sumPaise(expenseTxns(db, cur));
  const incomePrev = sumPaise(incomeTxns(db, prev));
  const expensePrev = sumPaise(expenseTxns(db, prev));
  if (incomeCur <= 0 || incomePrev <= 0) return [];

  const rateCur = (incomeCur - expenseCur) / incomeCur;
  const ratePrev = (incomePrev - expensePrev) / incomePrev;
  const deltaPp = Math.round((rateCur - ratePrev) * 100);
  // Only surface material moves.
  if (Math.abs(deltaPp) < 5) return [];

  const improved = deltaPp > 0;
  return [
    {
      id: "savings-delta",
      title: `Savings rate ${improved ? "improved" : "fell"} by ${Math.abs(deltaPp)} points`,
      body: `Your savings rate is ${pct(rateCur)} in ${monthLabel(cur)}, ${improved ? "up" : "down"} from ${pct(ratePrev)} in ${monthLabel(prev)}. ${improved ? "Keep this pace and your goals fund themselves." : "Spending grew faster than income this month — the category breakdown will show where."}`,
      evidence: [
        `${monthLabel(cur)}: ${formatINR(incomeCur)} income − ${formatINR(expenseCur)} expenses = ${pct(rateCur)} saved`,
        `${monthLabel(prev)}: ${formatINR(incomePrev)} income − ${formatINR(expensePrev)} expenses = ${pct(ratePrev)} saved`,
        `Change: ${deltaPp > 0 ? "+" : ""}${deltaPp} percentage points`,
      ],
      confidence: Math.abs(deltaPp) >= 10 ? "high" : "medium",
      kind: "savings",
      createdAt: nowISO(),
    },
  ];
}

// ---------------------------------------------------------------------------
// (c) Budget breach: budgets vs actual category spend
// ---------------------------------------------------------------------------

function budgetInsights(db: FinanceDB, cur: string): Insight[] {
  const budgets = getBudgets(db, cur);
  if (budgets.length === 0) return [];
  const spend = spendByCategory(expenseTxns(db, cur));
  const out: Insight[] = [];

  for (const b of budgets) {
    const spent = spend.get(b.categoryId) ?? 0;
    const label = catLabel(b.categoryId);
    const usedPct = b.limitPaise > 0 ? Math.round((spent / b.limitPaise) * 100) : 0;

    if (spent > b.limitPaise) {
      out.push({
        id: `budget-breach-${b.categoryId}`,
        title: `Over budget on ${label}`,
        body: `You have spent ${formatINR(spent)} of your ${formatINR(b.limitPaise)} ${label} budget for ${monthLabel(cur)}. That is ${formatINR(spent - b.limitPaise)} over — consider slowing down here for the rest of the month.`,
        evidence: [
          `${label} budget for ${monthLabel(cur)}: ${formatINR(b.limitPaise)}`,
          `Spent so far: ${formatINR(spent)} (${usedPct}% of budget)`,
          `Over by ${formatINR(spent - b.limitPaise)}`,
        ],
        confidence: "high",
        kind: "budget",
        createdAt: nowISO(),
      });
    } else if (b.limitPaise > 0 && spent >= b.limitPaise * 0.85) {
      out.push({
        id: `budget-warning-${b.categoryId}`,
        title: `${label} budget almost used up`,
        body: `You have spent ${formatINR(spent)} of your ${formatINR(b.limitPaise)} ${label} budget for ${monthLabel(cur)}. Only ${formatINR(b.limitPaise - spent)} remains for the rest of the month.`,
        evidence: [
          `${label} budget for ${monthLabel(cur)}: ${formatINR(b.limitPaise)}`,
          `Spent so far: ${formatINR(spent)} (${usedPct}% of budget)`,
          `Remaining: ${formatINR(b.limitPaise - spent)}`,
        ],
        confidence: "medium",
        kind: "budget",
        createdAt: nowISO(),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// (d) Unusual transaction: a payment >3x its category's median this month
// ---------------------------------------------------------------------------

function unusualInsights(db: FinanceDB, cur: string): Insight[] {
  const byCat = new Map<string, Transaction[]>();
  for (const t of expenseTxns(db, cur)) {
    const list = byCat.get(t.category) ?? [];
    list.push(t);
    byCat.set(t.category, list);
  }
  const out: Insight[] = [];

  for (const [catId, txns] of byCat) {
    // A median needs a real sample.
    if (txns.length < 3) continue;
    const amounts = txns.map((t) => t.amountPaise).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    if (median <= 0) continue;

    for (const t of txns) {
      if (t.amountPaise > 3 * median) {
        const label = catLabel(catId);
        const multiple = (t.amountPaise / median).toFixed(1);
        out.push({
          id: `unusual-${t.id}`,
          title: `Unusually large ${label.toLowerCase()} payment`,
          body: `A ${formatINR(t.amountPaise)} ${label.toLowerCase()} payment on ${t.dateISO} is well above your usual ${formatINR(median)} for this category. If you do not recognise it, double-check the charge.`,
          evidence: [
            `Payment: ${formatINR(t.amountPaise)} on ${t.dateISO}${t.note ? ` — "${t.note}"` : ""}`,
            `Median ${label} payment in ${monthLabel(cur)}: ${formatINR(median)} (across ${txns.length} payments)`,
            `This payment is ${multiple}× the median`,
          ],
          confidence: "high",
          kind: "unusual",
          createdAt: nowISO(),
        });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// (e) Goal pace: projected completion vs deadline
// ---------------------------------------------------------------------------

function monthsBetween(fromKey: string, toKey: string): number {
  const [fy, fm] = fromKey.split("-").map(Number);
  const [ty, tm] = toKey.split("-").map(Number);
  return ty * 12 + tm - (fy * 12 + fm);
}

function addMonthsISO(dateISO: string, months: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1 + months, d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Average monthly transfer into a goal over the last ~3 months (paise). */
function avgMonthlyGoalSaving(db: FinanceDB, goalId: string, today: string): number {
  const cutoff = addMonthsISO(today, -3);
  const total = db.transactions
    .filter((t) => t.type === "transfer" && t.goalId === goalId && t.dateISO >= cutoff)
    .reduce((s, t) => s + t.amountPaise, 0);
  return Math.round(total / 3);
}

function goalInsights(db: FinanceDB, today: string): Insight[] {
  const out: Insight[] = [];

  for (const goal of db.goals) {
    const remaining = goal.targetPaise - goal.savedPaise;
    if (remaining <= 0) continue; // goal completed — nothing to flag
    const fundedPct = Math.round((goal.savedPaise / goal.targetPaise) * 100);
    const monthsLeft = monthsBetween(today.slice(0, 7), goal.deadline.slice(0, 7));
    const neededPerMonth = Math.ceil(remaining / Math.max(monthsLeft, 1));
    const baseEvidence = [
      `Saved: ${formatINR(goal.savedPaise)} of ${formatINR(goal.targetPaise)} (${fundedPct}%)`,
      `Deadline: ${goal.deadline}`,
      `Needed to reach it: ${formatINR(neededPerMonth)} per month`,
    ];

    if (monthsLeft <= 0) {
      out.push({
        id: `goal-overdue-${goal.id}`,
        title: `${goal.name}: deadline passed with ${formatINR(remaining)} still to go`,
        body: `The ${goal.deadline} deadline for ${goal.name} has passed and ${formatINR(remaining)} is still unfunded. Consider extending the deadline or raising your monthly contribution.`,
        evidence: baseEvidence,
        confidence: "high",
        kind: "goal",
        createdAt: nowISO(),
      });
      continue;
    }

    const avgSaved = avgMonthlyGoalSaving(db, goal.id, today);
    if (avgSaved <= 0) {
      out.push({
        id: `goal-stalled-${goal.id}`,
        title: `No contributions to ${goal.name} in the last 3 months`,
        body: `You have saved ${formatINR(goal.savedPaise)} of ${formatINR(goal.targetPaise)} so far, with a deadline of ${goal.deadline}. You would need about ${formatINR(neededPerMonth)} a month from now on to reach it.`,
        evidence: [
          ...baseEvidence,
          `Transfers towards this goal in the last 3 months: ${formatINR(0)}`,
        ],
        confidence: "medium",
        kind: "goal",
        createdAt: nowISO(),
      });
      continue;
    }

    const projectedMonths = remaining / avgSaved;
    const projectedMonth = addMonthsISO(today, Math.ceil(projectedMonths)).slice(0, 7);
    const deadlineMonth = goal.deadline.slice(0, 7);
    const projectedLabel = monthLabel(projectedMonth);

    if (projectedMonth <= deadlineMonth) {
      out.push({
        id: `goal-ontrack-${goal.id}`,
        title: `${goal.name} is on track`,
        body: `At your recent pace of ${formatINR(avgSaved)} a month, you will reach ${formatINR(goal.targetPaise)} around ${projectedLabel}. Keep the contributions going.`,
        evidence: [
          ...baseEvidence,
          `Recent pace: ${formatINR(avgSaved)} per month (transfers in the last 3 months)`,
          `Projected completion: ${projectedLabel}`,
        ],
        confidence: "low",
        kind: "goal",
        createdAt: nowISO(),
      });
    } else if (monthsBetween(deadlineMonth, projectedMonth) <= 3) {
      out.push({
        id: `goal-behind-${goal.id}`,
        title: `${goal.name} is slightly behind schedule`,
        body: `At your recent pace of ${formatINR(avgSaved)} a month, you will reach ${formatINR(goal.targetPaise)} around ${projectedLabel}, after the ${goal.deadline} deadline. A small bump in contributions would close the gap.`,
        evidence: [
          ...baseEvidence,
          `Recent pace: ${formatINR(avgSaved)} per month (transfers in the last 3 months)`,
          `Projected completion: ${projectedLabel}`,
        ],
        confidence: "medium",
        kind: "goal",
        createdAt: nowISO(),
      });
    } else {
      out.push({
        id: `goal-offtrack-${goal.id}`,
        title: `${goal.name} is off track`,
        body: `At your recent pace of ${formatINR(avgSaved)} a month, you will reach ${formatINR(goal.targetPaise)} only around ${projectedLabel}. You would need ${formatINR(neededPerMonth)} a month to make the ${goal.deadline} deadline.`,
        evidence: [
          ...baseEvidence,
          `Recent pace: ${formatINR(avgSaved)} per month (transfers in the last 3 months)`,
          `Projected completion: ${projectedLabel}`,
        ],
        confidence: "high",
        kind: "goal",
        createdAt: nowISO(),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// (f) Bills due within 7 days (or already overdue and unpaid)
// ---------------------------------------------------------------------------

export interface BillStatus {
  bill: Bill;
  /** "YYYY-MM-DD" of this cycle's due date. */
  dueISO: string;
  /** Days from today to the due date (negative = overdue). */
  daysUntil: number;
  paid: boolean;
}

/** Current billing cycle status for every bill. Shared with the chat assistant. */
export function billStatuses(db: FinanceDB, today: string): BillStatus[] {
  const [ty, tm] = today.split("-").map(Number);
  const todayISODate = today;
  const out: BillStatus[] = [];

  for (const bill of db.bills) {
    const daysInMonth = new Date(ty, tm, 0).getDate();
    const day = Math.min(bill.dueDay, daysInMonth);
    const dueISO = `${today.slice(0, 7)}-${String(day).padStart(2, "0")}`;
    const paid = !!bill.lastPaidOn && bill.lastPaidOn >= dueISO;
    const daysUntil = Math.round(
      (new Date(dueISO).getTime() - new Date(todayISODate).getTime()) / 86_400_000,
    );
    out.push({ bill, dueISO, daysUntil, paid });
  }
  return out.sort((a, b) => a.daysUntil - b.daysUntil);
}

function billInsights(db: FinanceDB, today: string): Insight[] {
  const out: Insight[] = [];

  for (const s of billStatuses(db, today)) {
    if (s.paid) continue;
    const label = catLabel(s.bill.category);
    const baseEvidence = [
      `Amount due: ${formatINR(s.bill.amountPaise)}`,
      `Due date: ${s.dueISO}`,
      `Category: ${label}`,
    ];

    if (s.daysUntil < 0) {
      const overdueBy = -s.daysUntil;
      out.push({
        id: `bill-overdue-${s.bill.id}`,
        title: `${s.bill.name} is overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`,
        body: `Your ${formatINR(s.bill.amountPaise)} ${s.bill.name} payment was due on ${s.dueISO} and is not marked as paid. Pay it soon to avoid late fees.`,
        evidence: baseEvidence,
        confidence: "high",
        kind: "bill",
        createdAt: nowISO(),
      });
    } else if (s.daysUntil <= 7) {
      const when =
        s.daysUntil === 0 ? "today" : `in ${s.daysUntil} day${s.daysUntil === 1 ? "" : "s"}`;
      out.push({
        id: `bill-due-${s.bill.id}`,
        title: `${s.bill.name} due ${when}`,
        body: `${formatINR(s.bill.amountPaise)} for ${s.bill.name} is due on ${s.dueISO}. Make sure it is covered in this week's spending.`,
        evidence: baseEvidence,
        confidence: s.daysUntil <= 2 ? "high" : "medium",
        kind: "bill",
        createdAt: nowISO(),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------

/**
 * Run every rule against the database for `key` ("YYYY-MM").
 * Sorted high → medium → low confidence; stable within each band.
 */
export function buildInsights(db: FinanceDB, key: string): Insight[] {
  const prev = previousMonth(key);
  const today = todayISO();

  const all = [
    ...billInsights(db, today),
    ...budgetInsights(db, key),
    ...overspendInsights(db, key, prev),
    ...unusualInsights(db, key),
    ...savingsInsights(db, key, prev),
    ...goalInsights(db, today),
  ];

  const rank = { high: 0, medium: 1, low: 2 } as const;
  return all.sort((a, b) => rank[a.confidence] - rank[b.confidence]);
}
