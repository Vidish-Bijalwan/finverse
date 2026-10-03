/**
 * Payments — client-side React Query layer + pure helpers.
 *
 * Two rails:
 *   (a) Simulated UPI — always available. Writes a `transactions` row
 *       (type=expense, pay_mode=`upi_test`) via the existing useAddTransaction
 *       mutation path. No real money moves; every surface shows TestModeBanner.
 *   (b) Razorpay test mode — only when the server reports configured
 *       (useRazorpayStatus). Link creation runs in a server function
 *       (src/lib/razorpay.server.ts); the short_url opens in a new tab and
 *       the UI polls the `payments` table. Success is shown ONLY when a row
 *       is `captured` + `webhook_verified` — never from client-supplied state.
 *
 * Graceful degradation: if the 0002_revamp.sql migration has not been run,
 * Supabase returns 42P01 ("relation does not exist"). Hooks surface that as
 * a PaymentsSetupPendingError; pages render an honest ErrorState.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./supabase";
import { createPaymentLinkFn, getRazorpayStatusFn } from "./razorpay.server";
import type { Transaction } from "./finance/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type PaymentRail = "upi_test" | "razorpay_test";
export const PAYMENT_PAY_MODES: PaymentRail[] = ["upi_test", "razorpay_test"];

export type PaymentLinkStatus = "created" | "paid" | "expired" | "cancelled";
export type PaymentStatus = "created" | "attempted" | "captured" | "failed";

export interface PaymentLink {
  id: string;
  razorpayLinkId: string;
  amountPaise: number;
  status: PaymentLinkStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  paymentLinkId: string | null;
  razorpayPaymentId: string;
  amountPaise: number;
  status: PaymentStatus;
  method: string | null;
  webhookVerified: boolean;
  failureReason: string | null;
  transactionId: string | null;
  createdAt: string;
}

/** Branded error: the payments tables don't exist yet (migration not run). */
export class PaymentsSetupPendingError extends Error {
  constructor() {
    super(
      "Payments database setup pending — run supabase/migrations/0002_revamp.sql in the Supabase SQL editor.",
    );
    this.name = "PaymentsSetupPendingError";
  }
}

/** True when an error means "payments tables are missing" (Postgrest 42P01). */
export function isSetupPendingError(err: unknown): boolean {
  if (err instanceof PaymentsSetupPendingError) return true;
  if (err != null && typeof err === "object") {
    const code = (err as { code?: unknown }).code;
    if (code === "42P01") return true;
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && /relation .* does not exist/i.test(message)) return true;
  }
  return false;
}

const QK = {
  paymentLinks: ["finverse", "payment-links"] as const,
  payments: ["finverse", "payments"] as const,
  razorpayStatus: ["finverse", "razorpay-status"] as const,
};

// ── Pure helpers (unit-tested in payments.test.ts) ─────────────────────────

/** Upper bound for a single payment: ₹10,00,000. */
export const MAX_PAYMENT_PAISE = 1000000 * 100;

export type AmountValidation = { ok: true; amountPaise: number } | { ok: false; error: string };

/**
 * Validate an amount in integer paise. Rejects non-integers, zero/negative,
 * and amounts above MAX_PAYMENT_PAISE. All money stays integer paise.
 */
export function validatePaymentAmount(amountPaise: unknown): AmountValidation {
  if (typeof amountPaise !== "number" || !Number.isInteger(amountPaise)) {
    return { ok: false, error: "Amount must be a whole number of paise." };
  }
  if (amountPaise <= 0) {
    return { ok: false, error: "Enter an amount greater than zero." };
  }
  if (amountPaise > MAX_PAYMENT_PAISE) {
    return {
      ok: false,
      error: `Amount exceeds the ₹10,00,000 per-payment limit.`,
    };
  }
  return { ok: true, amountPaise };
}

/** Map a Razorpay-side payment status to the TxnRow status chip. */
export function toTxnStatus(status: PaymentStatus): "success" | "pending" | "failed" {
  if (status === "captured") return "success";
  if (status === "failed") return "failed";
  return "pending";
}

/** Build the ledger note for a simulated-UPI payment: the recipient's name. */
export function buildUpiNote(recipientName: string): string {
  return recipientName.trim().slice(0, 120);
}

export interface MonthGroup<T> {
  monthKey: string;
  label: string;
  items: T[];
}

const MONTH_LABEL = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

/** Group transactions by calendar month (YYYY-MM), newest month first. */
export function groupTransactionsByMonth(transactions: Transaction[]): MonthGroup<Transaction>[] {
  const byKey = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.dateISO.slice(0, 7);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(t);
    else byKey.set(key, [t]);
  }
  return [...byKey.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([monthKey, items]) => ({
      monthKey,
      label: MONTH_LABEL.format(new Date(`${monthKey}-02T00:00:00`)),
      items: [...items].sort((x, y) => (x.createdAt < y.createdAt ? 1 : -1)),
    }));
}

/** True when this transaction is a test-rail payment (either rail). */
export function isPaymentTransaction(t: Transaction): boolean {
  return (PAYMENT_PAY_MODES as string[]).includes(t.payMode);
}

// ── Data access (Supabase, RLS-scoped to the signed-in user) ────────────────

function toPaymentLink(row: Record<string, unknown>): PaymentLink {
  return {
    id: row["id"] as string,
    razorpayLinkId: row["razorpay_link_id"] as string,
    amountPaise: Number(row["amount_paise"]),
    status: row["status"] as PaymentLinkStatus,
    expiresAt: (row["expires_at"] as string | null) ?? null,
    createdAt: row["created_at"] as string,
  };
}

function toPaymentRecord(row: Record<string, unknown>): PaymentRecord {
  return {
    id: row["id"] as string,
    paymentLinkId: (row["payment_link_id"] as string | null) ?? null,
    razorpayPaymentId: row["razorpay_payment_id"] as string,
    amountPaise: Number(row["amount_paise"]),
    status: row["status"] as PaymentStatus,
    method: (row["method"] as string | null) ?? null,
    webhookVerified: Boolean(row["webhook_verified"]),
    failureReason: (row["failure_reason"] as string | null) ?? null,
    transactionId: (row["transaction_id"] as string | null) ?? null,
    createdAt: row["created_at"] as string,
  };
}

async function fetchPaymentLinks(): Promise<PaymentLink[]> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data, error } = await getSupabase()
    .from("payment_links")
    .select("id, razorpay_link_id, amount_paise, status, expires_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
    throw error;
  }
  return ((data ?? []) as Record<string, unknown>[]).map(toPaymentLink);
}

async function fetchPayments(): Promise<PaymentRecord[]> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const res = await getSupabase()
    .from("payments")
    .select(
      "id, payment_link_id, razorpay_payment_id, amount_paise, status, method, webhook_verified, failure_reason, transaction_id, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (res.error) {
    if (isSetupPendingError(res.error)) throw new PaymentsSetupPendingError();
    throw res.error;
  }
  return ((res.data ?? []) as Record<string, unknown>[]).map(toPaymentRecord);
}

// ── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Payment links issued by this user. When `pollOpen` is true, refetches every
 * 4s while any link is still in `created` status (the user may be paying in
 * the Razorpay tab). Stops automatically once all links settle.
 */
export function usePaymentLinks(pollOpen = false) {
  return useQuery({
    queryKey: [...QK.paymentLinks, pollOpen ? "poll" : "idle"],
    queryFn: fetchPaymentLinks,
    refetchInterval: (query) => {
      if (!pollOpen) return false;
      const links = query.state.data as PaymentLink[] | undefined;
      return links?.some((l) => l.status === "created") ? 4000 : false;
    },
    retry: (count, err) => (isSetupPendingError(err) ? false : count < 2),
  });
}

/**
 * Razorpay payment records (populated by the webhook). When `active` is true,
 * polls every 3s — used while waiting for a payment the user just initiated.
 * Success is derived from rows that are `captured` + `webhook_verified`.
 */
export function usePayments(active = false) {
  return useQuery({
    queryKey: [...QK.payments, active ? "poll" : "idle"],
    queryFn: fetchPayments,
    refetchInterval: active ? 3000 : false,
    retry: (count, err) => (isSetupPendingError(err) ? false : count < 2),
  });
}

/** Whether the server has Razorpay test keys configured. Never leaks keys. */
export function useRazorpayStatus() {
  return useQuery({
    queryKey: QK.razorpayStatus,
    queryFn: () => getRazorpayStatusFn(),
    staleTime: 60_000,
    retry: 1,
  });
}

export interface CreatedPaymentLink {
  linkId: string;
  razorpayLinkId: string;
  shortUrl: string;
  status: string;
}

/**
 * Create a Razorpay test payment link (server function) and open it in a new
 * tab. The caller must return to the app; status is read from the `payments`
 * table via usePayments — never from anything the client claims.
 */
export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation<CreatedPaymentLink, Error, { amountPaise: number; note?: string }>({
    mutationFn: async ({ amountPaise, note }) => {
      const validated = validatePaymentAmount(amountPaise);
      if (!validated.ok) throw new Error(validated.error);
      const {
        data: { session },
      } = await getSupabase().auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      const created = await createPaymentLinkFn({
        data: { amountPaise: validated.amountPaise, note, accessToken },
      });
      return created as CreatedPaymentLink;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: QK.paymentLinks });
      qc.invalidateQueries({ queryKey: QK.payments });
      window.open(created.shortUrl, "_blank", "noopener,noreferrer");
    },
  });
}
