/**
 * Payment requests ("request money") — real RLS-scoped persistence.
 *
 * A request is an IOU the user creates: person + amount + optional note.
 * Statuses: pending → paid | declined | cancelled.
 *
 * "Mark as paid" is the only settling path: it records a genuine income
 * transaction (the money arrived) and points settledTxnId at it. Nothing is
 * ever auto-settled — the user declares what actually happened.
 *
 * Graceful degradation: if migration 0003 hasn't been run, Supabase returns
 * 42P01 and hooks surface PaymentsSetupPendingError (same pattern as the
 * payments rails).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./supabase";
import { PaymentsSetupPendingError, isSetupPendingError, validatePaymentAmount } from "./payments";
import { insertTransaction } from "./finance/db";
import { todayISO } from "./finance/format";
import { FINVERSE_QUERY_DEFAULTS } from "./query";

export type PaymentRequestStatus = "pending" | "paid" | "declined" | "cancelled";

export interface PaymentRequest {
  id: string;
  personName: string;
  amountPaise: number;
  note: string;
  status: PaymentRequestStatus;
  settledTxnId: string | null;
  createdAt: string;
}

// ── Pure helpers (unit-tested) ─────────────────────────────────────────────

/** States a request may legally move to from its current status. */
export function allowedRequestTransitions(status: PaymentRequestStatus): PaymentRequestStatus[] {
  if (status === "pending") return ["paid", "declined", "cancelled"];
  return [];
}

/** True when this status transition is legal. */
export function canTransitionRequest(
  from: PaymentRequestStatus,
  to: PaymentRequestStatus,
): boolean {
  return allowedRequestTransitions(from).includes(to);
}

/** Validate the create-request form. Returns the cleaned payload or an error. */
export function validateRequestInput(input: {
  personName: string;
  amountPaise: unknown;
  note?: string;
}):
  | { ok: true; personName: string; amountPaise: number; note: string }
  | { ok: false; error: string } {
  const personName = input.personName.trim().slice(0, 120);
  if (!personName) return { ok: false, error: "Enter who you're requesting from." };
  const amount = validatePaymentAmount(input.amountPaise);
  if (!amount.ok) return { ok: false, error: amount.error };
  return {
    ok: true,
    personName,
    amountPaise: amount.amountPaise,
    note: (input.note ?? "").trim().slice(0, 200),
  };
}

/** Sum of pending request amounts (money owed to the user). */
export function pendingReceivablePaise(requests: PaymentRequest[]): number {
  return requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amountPaise, 0);
}

// ── Data access ────────────────────────────────────────────────────────────

const QK = { requests: ["finverse", "payment-requests"] as const };

function toRequest(row: Record<string, unknown>): PaymentRequest {
  return {
    id: row["id"] as string,
    personName: row["person_name"] as string,
    amountPaise: Number(row["amount_paise"]),
    note: (row["note"] as string) ?? "",
    status: row["status"] as PaymentRequestStatus,
    settledTxnId: (row["settled_txn_id"] as string | null) ?? null,
    createdAt: row["created_at"] as string,
  };
}

async function fetchRequests(): Promise<PaymentRequest[]> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data, error } = await getSupabase()
    .from("payment_requests")
    .select("id, person_name, amount_paise, note, status, settled_txn_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
    throw error;
  }
  return ((data ?? []) as Record<string, unknown>[]).map(toRequest);
}

async function setRequestStatus(
  id: string,
  status: PaymentRequestStatus,
  settledTxnId?: string,
): Promise<void> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { error } = await getSupabase()
    .from("payment_requests")
    .update({
      status,
      ...(settledTxnId ? { settled_txn_id: settledTxnId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending"); // only pending requests may transition
  if (error) {
    if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
    throw error;
  }
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function usePaymentRequests() {
  return useQuery({
    ...FINVERSE_QUERY_DEFAULTS,
    queryKey: QK.requests,
    queryFn: fetchRequests,
    retry: (count, err) => (isSetupPendingError(err) ? false : count < 2),
  });
}

export function useCreatePaymentRequest() {
  const qc = useQueryClient();
  return useMutation<
    PaymentRequest,
    Error,
    { personName: string; amountPaise: number; note?: string }
  >({
    mutationFn: async (input) => {
      const validated = validateRequestInput(input);
      if (!validated.ok) throw new Error(validated.error);
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (!user) throw new Error("Not signed in.");
      const { data, error } = await getSupabase()
        .from("payment_requests")
        .insert({
          user_id: user.id,
          person_name: validated.personName,
          amount_paise: validated.amountPaise,
          note: validated.note,
        })
        .select("id, person_name, amount_paise, note, status, settled_txn_id, created_at")
        .single();
      if (error) {
        if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
        throw error;
      }
      return toRequest(data as unknown as Record<string, unknown>);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.requests }),
  });
}

/**
 * Settle a request as paid: records a real income transaction first, then
 * flips the request to "paid" pointing at it. The income hits the ledger —
 * this is the money actually arriving, declared by the user.
 */
export function useSettlePaymentRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, { request: PaymentRequest; accountId?: string }>({
    mutationFn: async ({ request, accountId }) => {
      if (request.status !== "pending") {
        throw new Error("Only pending requests can be settled.");
      }
      const income = await insertTransaction({
        type: "income",
        amountPaise: request.amountPaise,
        category: "other-income",
        // Note is the person's name (ledger contract) so they stay a contact.
        note: request.personName,
        dateISO: todayISO(),
        payMode: "upi_test",
        ...(accountId ? { accountId } : {}),
        tags: [],
      });
      await setRequestStatus(request.id, "paid", income.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.requests });
      qc.invalidateQueries({ queryKey: ["finverse", "transactions"] });
      qc.invalidateQueries({ queryKey: ["finverse", "account-summaries"] });
    },
  });
}

export function useTransitionPaymentRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, { request: PaymentRequest; to: PaymentRequestStatus }>({
    mutationFn: async ({ request, to }) => {
      if (!canTransitionRequest(request.status, to)) {
        throw new Error(`Cannot move a ${request.status} request to ${to}.`);
      }
      await setRequestStatus(request.id, to);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.requests }),
  });
}

export function useDeletePaymentRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (!user) throw new Error("Not signed in.");
      const { error } = await getSupabase()
        .from("payment_requests")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        if (isSetupPendingError(error)) throw new PaymentsSetupPendingError();
        throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.requests }),
  });
}
