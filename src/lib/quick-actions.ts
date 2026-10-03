/**
 * Quick-action routing table for the dashboard.
 *
 * Every quick action resolves to exactly one real destination: a route
 * (optionally with search params that deep-link into a flow) or a dialog
 * opened on the dashboard. No action may point at a placeholder.
 */

export type QuickActionId =
  | "scan-qr"
  | "pay-contact"
  | "upi-id"
  | "bank-transfer"
  | "recharge"
  | "bills"
  | "request"
  | "more"
  | "invest"
  | "add-expense"
  | "add-goal";

export type QuickActionRoute =
  "/payments" | "/accounts" | "/bills" | "/more" | "/portfolio" | "/expenses" | "/goals";

export type QuickActionTarget =
  | { kind: "route"; to: QuickActionRoute; search?: Record<string, string> }
  | { kind: "dialog"; dialog: "qr-scan" | "recharge" };

export interface QuickActionDef {
  id: QuickActionId;
  label: string;
  target: QuickActionTarget;
}

/**
 * The full quick-action set. Route targets are cross-checked against the
 * file routes in `src/routes/`:
 *
 * - /payments supports `?flow=recipient|upi-id|upi&upiId&name&amount` and
 *   `?tab=send|razorpay|history` (deep-links into its real UPI phases).
 * - /accounts supports `?transfer=1` (opens the real TransferDialog).
 * - /expenses supports `?add=1` (opens the real add-expense sheet).
 * - /goals supports `?add=1` (opens the real goal form).
 * - "Request" opens the payments page's Razorpay tab, whose payment-link
 *   flow is the real request-money rail (honest "not configured" state when
 *   test keys are absent).
 */
export const QUICK_ACTIONS: QuickActionDef[] = [
  { id: "scan-qr", label: "Scan QR", target: { kind: "dialog", dialog: "qr-scan" } },
  {
    id: "pay-contact",
    label: "Pay contact",
    target: { kind: "route", to: "/payments", search: { flow: "recipient" } },
  },
  {
    id: "upi-id",
    label: "UPI ID",
    target: { kind: "route", to: "/payments", search: { flow: "upi-id" } },
  },
  {
    id: "bank-transfer",
    label: "Bank transfer",
    target: { kind: "route", to: "/accounts", search: { transfer: "1" } },
  },
  { id: "recharge", label: "Recharge", target: { kind: "dialog", dialog: "recharge" } },
  { id: "bills", label: "Bills", target: { kind: "route", to: "/bills" } },
  {
    id: "request",
    label: "Request",
    target: { kind: "route", to: "/payments", search: { tab: "razorpay" } },
  },
  { id: "more", label: "More", target: { kind: "route", to: "/more" } },
  { id: "invest", label: "Invest", target: { kind: "route", to: "/portfolio" } },
  {
    id: "add-expense",
    label: "Add expense",
    target: { kind: "route", to: "/expenses", search: { add: "1" } },
  },
  {
    id: "add-goal",
    label: "Add goal",
    target: { kind: "route", to: "/goals", search: { add: "1" } },
  },
];

const BY_ID = new Map(QUICK_ACTIONS.map((a) => [a.id, a]));

/** Resolve an action id to its destination. Throws for unknown ids. */
export function targetFor(id: QuickActionId): QuickActionTarget {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`quick-actions: unknown action "${id}"`);
  return def.target;
}
