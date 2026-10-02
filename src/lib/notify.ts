import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { anomalyInsights, billStatuses, loadStreakState, weeklyDigest } from "@/lib/ai/engine";
import { categoryById } from "@/lib/finance/categories";
import { formatINR, monthKey, todayISO } from "@/lib/finance/format";
import { FINVERSE_QUERY_KEYS } from "@/lib/finance/hooks";
import {
  getBudgets,
  listBills,
  listGoals,
  listTransactions,
  seedIfEmpty,
} from "@/lib/finance/store";
import type { FinanceDB } from "@/lib/finance/types";

/**
 * Notifications center data layer.
 *
 * `collectNotifications(db)` derives every notification from the user's real
 * stored data each time it runs (pure apart from streak state, which is
 * persisted separately by the engine). Notification ids are stable per
 * condition + billing/month cycle, so marking one read keeps it read while
 * the condition stays true, and it naturally re-arms when the condition
 * changes (a new bill cycle, a new month, a new anomaly).
 *
 * Read state persists in localStorage under `finverse:notifications:v1`.
 * All window access is guarded so this module is SSR-safe.
 */

export interface AppNotification {
  id: string;
  kind: "bill" | "budget" | "goal" | "anomaly" | "streak" | "info";
  title: string;
  body: string;
  /** Route the notification deep-links to. */
  to: string;
  createdAt: string;
}

export const NOTIFICATIONS_STORE_KEY = "finverse:notifications:v1";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readStoredIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(NOTIFICATIONS_STORE_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable — read state just won't persist
  }
}

// Severity order for "newest first" display within urgency bands.
const KIND_PRIORITY: Record<AppNotification["kind"], number> = {
  bill: 0,
  anomaly: 1,
  budget: 2,
  goal: 3,
  streak: 4,
  info: 5,
};

function catLabel(id: string): string {
  return categoryById(id)?.label ?? id;
}

/**
 * Derive every current notification from the database. Stable ids per
 * condition; sorted by urgency, then newest first.
 */
export function collectNotifications(db: FinanceDB): AppNotification[] {
  const today = todayISO();
  const month = today.slice(0, 7);
  const now = new Date().toISOString();
  const out: AppNotification[] = [];

  // (1) Bills: overdue or due within 7 days, unpaid.
  for (const s of billStatuses(db, today)) {
    if (s.paid) continue;
    const amount = formatINR(s.bill.amountPaise);
    if (s.daysUntil < 0) {
      const overdueBy = -s.daysUntil;
      out.push({
        id: `bill-overdue-${s.bill.id}`,
        kind: "bill",
        title: `${s.bill.name} overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`,
        body: `${amount} was due on ${s.dueISO}. Pay it soon to avoid late fees.`,
        to: "/bills",
        createdAt: s.dueISO,
      });
    } else if (s.daysUntil <= 7) {
      const when =
        s.daysUntil === 0
          ? "due today"
          : `due in ${s.daysUntil} day${s.daysUntil === 1 ? "" : "s"}`;
      out.push({
        id: `bill-due-${s.bill.id}`,
        kind: "bill",
        title: `${s.bill.name} ${when}`,
        body: `${amount} is due on ${s.dueISO}. Make sure it is covered in this week's spending.`,
        to: "/bills",
        createdAt: s.dueISO,
      });
    }
  }

  // (2) Budgets: 100% breach or 80% warning for the current month.
  const monthTxns = db.transactions.filter(
    (t) => t.type === "expense" && t.dateISO.startsWith(month),
  );
  const spendByCat = new Map<string, number>();
  for (const t of monthTxns) {
    spendByCat.set(t.category, (spendByCat.get(t.category) ?? 0) + t.amountPaise);
  }
  for (const b of getBudgets(db, month)) {
    if (b.limitPaise <= 0) continue;
    const spent = spendByCat.get(b.categoryId) ?? 0;
    const label = catLabel(b.categoryId);
    if (spent >= b.limitPaise) {
      out.push({
        id: `budget-breach-${month}-${b.categoryId}`,
        kind: "budget",
        title: `Over budget: ${label}`,
        body: `${formatINR(spent)} of ${formatINR(b.limitPaise)} used — ${formatINR(spent - b.limitPaise)} over.`,
        to: "/budgets",
        createdAt: now,
      });
    } else if (spent >= b.limitPaise * 0.8) {
      const pctUsed = Math.round((spent / b.limitPaise) * 100);
      out.push({
        id: `budget-warn-${month}-${b.categoryId}`,
        kind: "budget",
        title: `${label} budget ${pctUsed}% used`,
        body: `${formatINR(b.limitPaise - spent)} left of your ${formatINR(b.limitPaise)} ${label.toLowerCase()} budget.`,
        to: "/budgets",
        createdAt: now,
      });
    }
  }

  // (3) Goal milestones: the highest reached of 50 / 75 / 100%.
  for (const g of db.goals) {
    if (g.targetPaise <= 0) continue;
    const pctFunded = (g.savedPaise / g.targetPaise) * 100;
    const milestone = pctFunded >= 100 ? 100 : pctFunded >= 75 ? 75 : pctFunded >= 50 ? 50 : 0;
    if (milestone === 0) continue;
    out.push({
      id: `goal-${milestone}-${g.id}`,
      kind: "goal",
      title:
        milestone === 100 ? `Goal reached: ${g.name}!` : `${milestone}% of the way to ${g.name}`,
      body:
        milestone === 100
          ? `You saved the full ${formatINR(g.targetPaise)}. Time to celebrate — or set a bigger target.`
          : `${formatINR(g.savedPaise)} of ${formatINR(g.targetPaise)} saved. ${formatINR(g.targetPaise - g.savedPaise)} to go.`,
      to: "/goals",
      createdAt: now,
    });
  }

  // (4) Anomalies: same evidence-carrying findings as the insights engine.
  for (const insight of anomalyInsights(db, month)) {
    out.push({
      id: `anomaly-${month}-${insight.id}`,
      kind: "anomaly",
      title: insight.title,
      body: insight.body,
      to: "/insights",
      createdAt: insight.createdAt,
    });
  }

  // (5) Savings streaks: the highest milestone the current streak holds.
  const streak = loadStreakState(db);
  const held =
    streak.currentDays >= 30 ? 30 : streak.currentDays >= 14 ? 14 : streak.currentDays >= 7 ? 7 : 0;
  if (held > 0) {
    out.push({
      id: `streak-${held}`,
      kind: "streak",
      title: `${held}-day savings streak!`,
      body: `You have stayed under your ${formatINR(streak.targetPaisePerDay)}/day target for ${streak.currentDays} days straight. Keep it going.`,
      to: "/insights",
      createdAt: today,
    });
  }

  // (6) Weekly digest tip.
  const digest = weeklyDigest(db, today);
  out.push({
    id: `digest-${digest.weekStartISO}`,
    kind: "info",
    title: "Your weekly digest is ready",
    body: `Spent ${formatINR(digest.spentPaise)} this week · saved ${formatINR(digest.savedPaise)}. ${digest.tip}`,
    to: "/insights",
    createdAt: digest.weekStartISO,
  });

  return out.sort((a, b) => {
    const p = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
    if (p !== 0) return p;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/** Number of unread notifications, for the app-shell badge. */
export function unreadCount(db: FinanceDB): number {
  const read = new Set(readStoredIds());
  return collectNotifications(db).filter((n) => !read.has(n.id)).length;
}

function buildNotificationsDB(
  transactions: FinanceDB["transactions"],
  budgets: FinanceDB["budgets"],
  bills: FinanceDB["bills"],
  goals: FinanceDB["goals"],
): FinanceDB {
  return { transactions, budgets, bills, goals, holdings: [] };
}

/**
 * Live notifications hook. Reuses the finance query-key namespace so it stays
 * in sync with mutations (e.g. a budget breach appears as soon as the
 * overspending transaction is saved). Safe to call from the app shell.
 */
export function useNotifications(): {
  notifications: AppNotification[];
  unread: number;
  isRead(id: string): boolean;
  markAllRead(): void;
} {
  const month = monthKey(new Date());

  const txnsQuery = useQuery({
    queryKey: [...FINVERSE_QUERY_KEYS.transactions, "all"],
    queryFn: () => listTransactions(seedIfEmpty()),
  });
  const budgetsQuery = useQuery({
    queryKey: [...FINVERSE_QUERY_KEYS.budgets, month],
    queryFn: () => getBudgets(seedIfEmpty(), month),
  });
  const billsQuery = useQuery({
    queryKey: FINVERSE_QUERY_KEYS.bills,
    queryFn: () => listBills(seedIfEmpty()),
  });
  const goalsQuery = useQuery({
    queryKey: FINVERSE_QUERY_KEYS.goals,
    queryFn: () => listGoals(seedIfEmpty()),
  });

  const [readIds, setReadIds] = useState<string[]>(() => readStoredIds());

  // If another tab (or a remount) changed read state, resync on visibility.
  useEffect(() => {
    if (!isBrowser()) return;
    const onFocus = () => setReadIds(readStoredIds());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const notifications = useMemo(() => {
    if (!txnsQuery.data || !budgetsQuery.data || !billsQuery.data || !goalsQuery.data) return [];
    return collectNotifications(
      buildNotificationsDB(txnsQuery.data, budgetsQuery.data, billsQuery.data, goalsQuery.data),
    );
  }, [txnsQuery.data, budgetsQuery.data, billsQuery.data, goalsQuery.data]);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const unread = notifications.filter((n) => !readSet.has(n.id)).length;
  const isRead = (id: string) => readSet.has(id);

  const markAllRead = () => {
    const merged = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]));
    writeStoredIds(merged);
    setReadIds(merged);
  };

  return { notifications, unread, isRead, markAllRead };
}
