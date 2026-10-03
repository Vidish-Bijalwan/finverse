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
 * - Insight kinds used: "overspend" | "savings" | "budget" | "unusual" |
 *   "goal" | "bill" | "anomaly".
 *
 * Batch-C additions (all pure, SSR-safe):
 * - `anomalyInsights(db, key)` — category spikes vs 3-month average and single
 *   transactions far above the category norm (kind "anomaly").
 * - `dailySpendSeries(db, key)` — per-day expense totals for a month (heatmap).
 * - `categoryMoM(db, key)` — per-category spend this month vs last month.
 * - `weeklyDigest(db, today)` — auto-generated summary of the current week.
 * - Streak helpers: `resolveDailyTargetPaise`, `computeStreak` — the persisted
 *   streak state itself lives in localStorage; the two functions marked
 *   BROWSER-ONLY touch window and are guarded.
 */

import { categoryById } from "../finance/categories";
import { formatINR, monthLabel, todayISO } from "../finance/format";
import type { Bill, Budget, FinanceDB, Insight, Transaction } from "../finance/types";

/**
 * Local pure replacements for the store.ts helpers this engine used.
 * They operate on the FinanceDB passed in — no storage access.
 */
function listTransactions(db: FinanceDB, monthKey?: string): Transaction[] {
  const txns = monthKey
    ? db.transactions.filter((t) => t.dateISO.startsWith(monthKey))
    : db.transactions;
  return [...txns].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

function getBudgets(db: FinanceDB, month: string): Budget[] {
  return db.budgets.filter((b) => b.month === month);
}

/** "2026-10" -> "2026-09" (works across year boundaries). Exported for chat reuse. */
export function previousMonth(key: string): string {
  const [y = 1970, m = 1] = key.split("-").map(Number);
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
    const median = amounts[Math.floor(amounts.length / 2)] ?? 0;
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
  const [fy = 1970, fm = 1] = fromKey.split("-").map(Number);
  const [ty = 1970, tm = 1] = toKey.split("-").map(Number);
  return ty * 12 + tm - (fy * 12 + fm);
}

function addMonthsISO(dateISO: string, months: number): string {
  const [y = 1970, m = 1, d = 1] = dateISO.split("-").map(Number);
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
  const [ty = 1970, tm = 1] = today.split("-").map(Number);
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
// (g) Anomaly detection: category spikes vs 3-month average, and single
// transactions far above the category's 3-month norm.
//
// Both rules are evidence-carrying (exact figures + dates) and confidence
// graded like every other rule in this file. Exported so the notifications
// layer can surface the same findings as alerts.
// ---------------------------------------------------------------------------

/** "2026-10" shifted by `offset` months, e.g. offset=-1 -> "2026-09". */
export function shiftMonth(key: string, offset: number): string {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Category-level spikes: spend in `key` at >= 2x the category's average
 * monthly spend over the 3 prior months. Categories with no baseline spend
 * at all still flag when the current spend is material (>= ₹1,000).
 */
export function anomalyInsights(db: FinanceDB, key: string): Insight[] {
  const out: Insight[] = [];
  const curSpend = spendByCategory(expenseTxns(db, key));
  const baseKeys = [shiftMonth(key, -1), shiftMonth(key, -2), shiftMonth(key, -3)];

  const baseTotals = new Map<string, number>();
  const baseTxnCounts = new Map<string, number>();
  for (const bk of baseKeys) {
    const txns = expenseTxns(db, bk);
    for (const t of txns) {
      baseTotals.set(t.category, (baseTotals.get(t.category) ?? 0) + t.amountPaise);
      baseTxnCounts.set(t.category, (baseTxnCounts.get(t.category) ?? 0) + 1);
    }
  }

  // (g1) category spike vs 3-month average
  for (const [catId, curAmt] of curSpend) {
    const baseTotal = baseTotals.get(catId) ?? 0;
    const baseAvg = baseTotal / 3;
    const label = catLabel(catId);

    if (baseAvg > 0 && curAmt >= 2 * baseAvg) {
      const multiple = (curAmt / baseAvg).toFixed(1);
      out.push({
        id: `anomaly-cat-${catId}`,
        title: `${label} is ${multiple}× its usual monthly spend`,
        body: `You have spent ${formatINR(curAmt)} on ${label.toLowerCase()} in ${monthLabel(key)}, against a 3-month average of ${formatINR(Math.round(baseAvg))} a month. That is unusually high — check for one-off splurges or duplicate charges.`,
        evidence: [
          `${label} spend in ${monthLabel(key)}: ${formatINR(curAmt)}`,
          `3-month average (${baseKeys.map(monthLabel).join(", ")}): ${formatINR(Math.round(baseAvg))} per month`,
          `This month is ${multiple}× the baseline`,
        ],
        confidence: curAmt >= 3 * baseAvg ? "high" : "medium",
        kind: "anomaly",
        createdAt: nowISO(),
      });
    } else if (baseTotal === 0 && curAmt >= 100_000) {
      // No baseline at all, but material spend this month.
      out.push({
        id: `anomaly-cat-new-${catId}`,
        title: `New spending on ${label.toLowerCase()} this month`,
        body: `You spent ${formatINR(curAmt)} on ${label.toLowerCase()} in ${monthLabel(key)} with no ${label.toLowerCase()} spending in the previous 3 months. If this is a new recurring cost, consider adding it to your budget.`,
        evidence: [
          `${label} spend in ${monthLabel(key)}: ${formatINR(curAmt)}`,
          `${label} spend in ${baseKeys.map(monthLabel).join(", ")}: ${formatINR(0)}`,
        ],
        confidence: "medium",
        kind: "anomaly",
        createdAt: nowISO(),
      });
    }
  }

  // (g2) single transaction far above the category's 3-month per-transaction norm
  type TxnFlag = { txn: Transaction; label: string; avgNorm: number; ratio: number };
  const txnFlags: TxnFlag[] = [];
  const baseTxnsByCat = new Map<string, Transaction[]>();
  for (const bk of baseKeys) {
    for (const t of expenseTxns(db, bk)) {
      const list = baseTxnsByCat.get(t.category) ?? [];
      list.push(t);
      baseTxnsByCat.set(t.category, list);
    }
  }

  for (const t of expenseTxns(db, key)) {
    const base = baseTxnsByCat.get(t.category) ?? [];
    // Need a real sample before calling something "far above the norm".
    if (base.length < 5) continue;
    const avgNorm = base.reduce((s, b) => s + b.amountPaise, 0) / base.length;
    if (avgNorm <= 0) continue;
    const ratio = t.amountPaise / avgNorm;
    if (ratio >= 4 && t.amountPaise >= 50_000) {
      txnFlags.push({ txn: t, label: catLabel(t.category), avgNorm, ratio });
    }
  }

  txnFlags.sort((a, b) => b.ratio - a.ratio);
  for (const { txn, label, avgNorm, ratio } of txnFlags.slice(0, 5)) {
    out.push({
      id: `anomaly-txn-${txn.id}`,
      title: `${formatINR(txn.amountPaise)} ${label.toLowerCase()} payment stands out`,
      body: `A ${formatINR(txn.amountPaise)} ${label.toLowerCase()} payment on ${txn.dateISO} is ${ratio.toFixed(1)}× your usual ${formatINR(Math.round(avgNorm))} per ${label.toLowerCase()} transaction (3-month norm). Worth a second look if you do not recognise it.`,
      evidence: [
        `Payment: ${formatINR(txn.amountPaise)} on ${txn.dateISO}${txn.note ? ` — "${txn.note}"` : ""}`,
        `Usual ${label} transaction (3-month norm across ${baseTxnsByCat.get(txn.category)?.length ?? 0} payments): ${formatINR(Math.round(avgNorm))}`,
        `This payment is ${ratio.toFixed(1)}× the norm`,
      ],
      confidence: "high",
      kind: "anomaly",
      createdAt: nowISO(),
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Batch C engagement helpers (pure, SSR-safe unless marked BROWSER-ONLY)
// ---------------------------------------------------------------------------

export interface DailySpend {
  /** Calendar date "YYYY-MM-DD". */
  dateISO: string;
  /** Integer paise of expense spend on that day. */
  spendPaise: number;
}

/** Per-day expense totals for every calendar day of `key` ("YYYY-MM"). */
export function dailySpendSeries(db: FinanceDB, key: string): DailySpend[] {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const totals = new Map<string, number>();
  for (const t of expenseTxns(db, key)) {
    totals.set(t.dateISO, (totals.get(t.dateISO) ?? 0) + t.amountPaise);
  }
  const out: DailySpend[] = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateISO = `${key}-${String(d).padStart(2, "0")}`;
    out.push({ dateISO, spendPaise: totals.get(dateISO) ?? 0 });
  }
  return out;
}

export interface CategoryMoM {
  categoryId: string;
  label: string;
  color: string;
  curPaise: number;
  prevPaise: number;
  /** Percent change vs last month; null when there was no spend last month. */
  deltaPct: number | null;
}

/** Per-category spend in `key` vs the previous month, sorted by current spend desc. */
export function categoryMoM(db: FinanceDB, key: string): CategoryMoM[] {
  const prev = previousMonth(key);
  const curSpend = spendByCategory(expenseTxns(db, key));
  const prevSpend = spendByCategory(expenseTxns(db, prev));

  const ids = new Set<string>([...curSpend.keys(), ...prevSpend.keys()]);
  const out: CategoryMoM[] = [];
  for (const id of ids) {
    const cur = curSpend.get(id) ?? 0;
    const prevAmt = prevSpend.get(id) ?? 0;
    if (cur === 0 && prevAmt === 0) continue;
    const cat = categoryById(id);
    out.push({
      categoryId: id,
      label: cat?.label ?? id,
      color: cat?.color ?? "#64748B",
      curPaise: cur,
      prevPaise: prevAmt,
      deltaPct: prevAmt > 0 ? Math.round(((cur - prevAmt) / prevAmt) * 100) : null,
    });
  }
  return out.sort((a, b) => b.curPaise - a.curPaise);
}

export interface WeeklyDigest {
  weekStartISO: string;
  weekEndISO: string;
  spentPaise: number;
  incomePaise: number;
  savedPaise: number;
  topCategoryId: string | null;
  topCategoryLabel: string | null;
  topCategoryPaise: number;
  /** One data-derived actionable tip. */
  tip: string;
}

/** Monday of the week containing `today` (local calendar). */
export function weekStartOf(today: Date): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return d;
}

function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Auto-generated summary of the current (Mon–Sun) week: spend, income,
 * saved, top category, and one actionable tip derived from the data.
 */
export function weeklyDigest(db: FinanceDB, today: string): WeeklyDigest {
  const start = weekStartOf(new Date(`${today}T00:00:00`));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startISO = dateToISO(start);
  const endISO = dateToISO(end);

  const weekTxns = db.transactions.filter((t) => t.dateISO >= startISO && t.dateISO <= endISO);
  const spent = weekTxns.filter((t) => t.type === "expense");
  const income = weekTxns.filter((t) => t.type === "income");
  const spentPaise = spent.reduce((s, t) => s + t.amountPaise, 0);
  const incomePaise = income.reduce((s, t) => s + t.amountPaise, 0);
  const savedPaise = incomePaise - spentPaise;

  const byCat = spendByCategory(spent);
  let topId: string | null = null;
  let topAmt = 0;
  for (const [id, amt] of byCat) {
    if (amt > topAmt) {
      topAmt = amt;
      topId = id;
    }
  }
  const topLabel = topId ? catLabel(topId) : null;

  // Average weekly pace for the top category over the prior 4 weeks.
  let priorWeeklyAvg = 0;
  if (topId) {
    let sum = 0;
    for (let w = 1; w <= 4; w += 1) {
      const ps = new Date(start);
      ps.setDate(start.getDate() - 7 * w);
      const pe = new Date(ps);
      pe.setDate(ps.getDate() + 6);
      const psISO = dateToISO(ps);
      const peISO = dateToISO(pe);
      sum += db.transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === topId &&
            t.dateISO >= psISO &&
            t.dateISO <= peISO,
        )
        .reduce((s, t) => s + t.amountPaise, 0);
    }
    priorWeeklyAvg = Math.round(sum / 4);
  }

  const tip = digestTip({
    spentPaise,
    incomePaise,
    savedPaise,
    topId,
    topLabel,
    topAmt,
    priorWeeklyAvg,
  });

  return {
    weekStartISO: startISO,
    weekEndISO: endISO,
    spentPaise,
    incomePaise,
    savedPaise,
    topCategoryId: topId,
    topCategoryLabel: topLabel,
    topCategoryPaise: topAmt,
    tip,
  };
}

function digestTip(args: {
  spentPaise: number;
  incomePaise: number;
  savedPaise: number;
  topId: string | null;
  topLabel: string | null;
  topAmt: number;
  priorWeeklyAvg: number;
}): string {
  const { savedPaise, incomePaise, topLabel, topAmt, priorWeeklyAvg } = args;

  // Rule 1: top category running at >=2x its usual weekly pace.
  if (topLabel && priorWeeklyAvg > 0 && topAmt >= 2 * priorWeeklyAvg) {
    const multiple = (topAmt / priorWeeklyAvg).toFixed(1);
    const dailyCap = Math.max(100, Math.round(priorWeeklyAvg / 700));
    return (
      `${topLabel} is running at ${formatINR(topAmt)} this week — about ${multiple}× your usual ` +
      `${formatINR(priorWeeklyAvg)} weekly pace. Try capping ${topLabel.toLowerCase()} at ` +
      `${formatINR(dailyCap * 100)} a day for the rest of the week to pull it back in line.`
    );
  }

  // Rule 2: spending more than earning.
  if (savedPaise < 0) {
    return (
      `You spent ${formatINR(-savedPaise)} more than you earned this week. Pick the one ` +
      `biggest discretionary expense from this week and skip its repeat next week — ` +
      `that single change usually closes the gap.`
    );
  }

  // Rule 3: thin savings rate.
  if (incomePaise > 0 && savedPaise / incomePaise < 0.1) {
    const rate = Math.round((savedPaise / incomePaise) * 100);
    return (
      `Your savings rate is only ${rate}% this week. Move ${formatINR(Math.round(incomePaise * 0.1))} ` +
      `to your top goal right now — paying yourself first turns the rest of the week into guilt-free spending.`
    );
  }

  // Rule 4: all healthy.
  if (incomePaise > 0) {
    const rate = Math.round((savedPaise / incomePaise) * 100);
    return (
      `Healthy week — you saved ${formatINR(savedPaise)} (${rate}% of income). Keep the ` +
      `momentum by setting a daily spend target on the streak card and protecting the streak.`
    );
  }

  // Rule 5: no income recorded yet.
  if (topLabel) {
    return (
      `Log this month's income to unlock a full savings breakdown. Your biggest outflow ` +
      `this week is ${topLabel.toLowerCase()} at ${formatINR(topAmt)} — worth a glance.`
    );
  }
  return "Log a few transactions this week and this digest will turn into a personalised action plan.";
}

// ---------------------------------------------------------------------------
// Savings streaks: consecutive calendar days with total expenses at or under
// the daily budget target. Streak state persists in localStorage
// (key "finverse:streaks:v1"); the two functions below are BROWSER-ONLY and
// guard window access like store.ts does.
// ---------------------------------------------------------------------------

export const STREAK_STORE_KEY = "finverse:streaks:v1";
export const STREAK_MILESTONES = [7, 14, 30] as const;

export interface StreakState {
  currentDays: number;
  bestDays: number;
  /** Integer paise per day. */
  targetPaisePerDay: number;
  /** Earned milestone badges, e.g. "streak-7". */
  badges: string[];
  /** dateISO of the last computation. */
  updatedOn: string;
}

/**
 * Resolve the daily spend target (paise), in priority order:
 * 1. user-set value in localStorage,
 * 2. this month's total budget limits / days in month,
 * 3. average daily expense over the last 90 days,
 * 4. a ₹500/day default when there is no data at all.
 */
export function resolveDailyTargetPaise(db: FinanceDB, month: string): number {
  // BROWSER-ONLY: honours a user-set target.
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STREAK_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StreakState>;
        if (typeof parsed.targetPaisePerDay === "number" && parsed.targetPaisePerDay > 0) {
          return Math.round(parsed.targetPaisePerDay);
        }
      }
    } catch {
      // fall through to computed defaults
    }
  }

  const [y = 1970, m = 1] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const budgetTotal = getBudgets(db, month).reduce((s, b) => s + b.limitPaise, 0);
  if (budgetTotal > 0) return Math.max(1, Math.round(budgetTotal / daysInMonth));

  const today = todayISO();
  const cutoff = dateToISO(new Date(new Date(`${today}T00:00:00`).getTime() - 90 * 86_400_000));
  const recent = db.transactions.filter(
    (t) => t.type === "expense" && t.dateISO >= cutoff && t.dateISO <= today,
  );
  if (recent.length > 0) {
    const total = recent.reduce((s, t) => s + t.amountPaise, 0);
    return Math.max(1, Math.round(total / 90));
  }
  return 50_000; // ₹500/day default
}

/** Consecutive under-target days ending today (pure; counts only days with data coverage). */
export function computeStreakDays(db: FinanceDB, targetPaise: number, today: string): number {
  if (db.transactions.length === 0) return 0;
  const earliest = db.transactions.reduce(
    (min, t) => (t.dateISO < min ? t.dateISO : min),
    db.transactions[0]?.dateISO ?? today,
  );
  const spendByDay = new Map<string, number>();
  for (const t of db.transactions) {
    if (t.type !== "expense") continue;
    spendByDay.set(t.dateISO, (spendByDay.get(t.dateISO) ?? 0) + t.amountPaise);
  }

  let streak = 0;
  const cursor = new Date(`${today}T00:00:00`);
  for (let i = 0; i < 400; i += 1) {
    const iso = dateToISO(cursor);
    if (iso < earliest) break;
    const spent = spendByDay.get(iso) ?? 0;
    if (spent <= targetPaise) streak += 1;
    else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** BROWSER-ONLY. Recompute and persist streak state; returns the fresh state. */
export function loadStreakState(db: FinanceDB): StreakState {
  const today = todayISO();
  const month = today.slice(0, 7);
  const target = resolveDailyTargetPaise(db, month);
  const currentDays = computeStreakDays(db, target, today);

  let stored: Partial<StreakState> = {};
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STREAK_STORE_KEY);
      if (raw) stored = JSON.parse(raw) as Partial<StreakState>;
    } catch {
      stored = {};
    }
  }

  const bestDays = Math.max(typeof stored.bestDays === "number" ? stored.bestDays : 0, currentDays);
  const highWater = Math.max(bestDays, currentDays);
  const badges = STREAK_MILESTONES.filter((n) => highWater >= n).map((n) => `streak-${n}`);

  const state: StreakState = {
    currentDays,
    bestDays,
    targetPaisePerDay: target,
    badges,
    updatedOn: today,
  };

  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(STREAK_STORE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — return the computed state without persisting
    }
  }
  return state;
}

/** BROWSER-ONLY. Persist a user-set daily target (paise). */
export function setDailyTargetPaise(targetPaise: number): void {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
  if (!Number.isInteger(targetPaise) || targetPaise <= 0) {
    throw new Error("Daily target must be a positive integer number of paise");
  }
  let stored: Partial<StreakState> = {};
  try {
    const raw = window.localStorage.getItem(STREAK_STORE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<StreakState>;
  } catch {
    stored = {};
  }
  window.localStorage.setItem(
    STREAK_STORE_KEY,
    JSON.stringify({ ...stored, targetPaisePerDay: targetPaise }),
  );
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
    ...anomalyInsights(db, key),
    ...unusualInsights(db, key),
    ...savingsInsights(db, key, prev),
    ...goalInsights(db, today),
  ];

  const rank = { high: 0, medium: 1, low: 2 } as const;
  return all.sort((a, b) => rank[a.confidence] - rank[b.confidence]);
}
