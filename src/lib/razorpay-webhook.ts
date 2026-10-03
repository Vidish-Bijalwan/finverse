/**
 * Razorpay TEST MODE — webhook handler (server-only).
 *
 * Imported ONLY by src/routes/api.razorpay-webhook.tsx via dynamic import,
 * so node:crypto and the service-role Supabase client never enter the client
 * bundle. See src/lib/razorpay.server.ts for why the webhook is a raw
 * request handler rather than a createServerFn.
 *
 * Flow: read raw body → verify x-razorpay-signature (HMAC-SHA256, constant
 * time) → idempotent upsert of `payments` on razorpay_payment_id →
 * on payment.captured insert the ledger `transactions` row exactly once
 * (compare-and-set on payments.transaction_id).
 *
 * Attribution: createPaymentLink stores finverse_user_id + finverse_link_id
 * in the Razorpay link's `notes`; payment entities echo link notes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "./razorpay";
import { getServiceSupabase, isMissingTable } from "./razorpay-env";

type WebhookPaymentEntity = {
  id: string;
  amount: number;
  currency: string;
  method?: string;
  notes?: Record<string, unknown>;
  error_code?: string | null;
  error_description?: string | null;
  error_reason?: string | null;
};

/**
 * Raw webhook handler: verify signature → idempotent upsert → ledger write.
 * Framework-agnostic: takes the raw Request, returns a Response.
 */
export async function handleRazorpayWebhook(request: Request): Promise<Response> {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ ok: false, error: "could not read request body" }, 400);
  }

  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env["RAZORPAY_KEY_SECRET"];
  if (!secret) {
    console.error("[razorpay-webhook] RAZORPAY_KEY_SECRET is not configured");
    return json({ ok: false, error: "webhook not configured" }, 500);
  }
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn("[razorpay-webhook] signature verification failed");
    return json({ ok: false, error: "invalid signature" }, 401);
  }

  let payload: { event?: string; payload?: { payment?: { entity?: WebhookPaymentEntity } } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return json({ ok: false, error: "malformed JSON body" }, 400);
  }

  const event = payload.event ?? "";
  const entity = payload.payload?.payment?.entity;
  if (!entity?.id) {
    console.info(`[razorpay-webhook] event=${event}: no payment entity, acknowledged`);
    return json({ ok: true, ignored: "no payment entity" }, 200);
  }

  const paymentId = entity.id;
  const notes = entity.notes ?? {};
  const userId =
    typeof notes["finverse_user_id"] === "string" ? (notes["finverse_user_id"] as string) : null;
  const linkRowId =
    typeof notes["finverse_link_id"] === "string" ? (notes["finverse_link_id"] as string) : null;

  if (!userId) {
    // Can't satisfy payments.user_id NOT NULL — log loudly, acknowledge so
    // Razorpay stops retrying (a retry would fail identically).
    console.warn(
      `[razorpay-webhook] event=${event} payment=${paymentId}: no finverse_user_id in notes — skipping ledger write`,
    );
    return json({ ok: true, ignored: "unattributed payment" }, 200);
  }

  const status =
    event === "payment.captured"
      ? "captured"
      : event === "payment.failed"
        ? "failed"
        : event === "payment.authorized"
          ? "attempted"
          : null;
  if (!status) {
    console.info(
      `[razorpay-webhook] event=${event} payment=${paymentId}: unhandled event, acknowledged`,
    );
    return json({ ok: true, ignored: `unhandled event ${event}` }, 200);
  }

  let sb: SupabaseClient;
  try {
    sb = getServiceSupabase();
  } catch (err) {
    console.error("[razorpay-webhook]", (err as Error).message);
    return json({ ok: false, error: "webhook not configured" }, 500);
  }

  try {
    // Idempotent upsert keyed on razorpay_payment_id (dedupe re-deliveries).
    // Terminal states stick: a captured payment never downgrades on a late
    // failure event, and a failed payment never resurrects.
    const { data: existing } = await sb
      .from("payments")
      .select("id, status, transaction_id")
      .eq("razorpay_payment_id", paymentId)
      .maybeSingle();
    const existingRow = existing as {
      id: string;
      status: string;
      transaction_id: string | null;
    } | null;
    const finalStatus =
      existingRow?.status === "captured" || existingRow?.status === "failed"
        ? (existingRow.status as "captured" | "failed")
        : status;

    const upsertPayload = {
      user_id: userId,
      payment_link_id: linkRowId,
      razorpay_payment_id: paymentId,
      amount_paise: entity.amount,
      currency: entity.currency ?? "INR",
      status: finalStatus,
      method: entity.method ?? null,
      webhook_verified: finalStatus === "captured",
      failure_reason:
        finalStatus === "failed"
          ? (entity.error_description ??
            entity.error_reason ??
            entity.error_code ??
            "payment failed")
          : null,
      raw_event: payload as unknown as Record<string, unknown>,
    };
    const { data: paymentRow, error: upsertError } = await sb
      .from("payments")
      .upsert(upsertPayload, { onConflict: "razorpay_payment_id" })
      .select("id, status, transaction_id")
      .single();
    if (upsertError) {
      if (isMissingTable(upsertError)) {
        console.error("[razorpay-webhook] payments table missing — run 0002_revamp.sql");
        return json({ ok: false, error: "payments tables not set up" }, 500);
      }
      throw upsertError;
    }
    const row = paymentRow as { id: string; status: string; transaction_id: string | null };

    if (finalStatus === "captured" && !row.transaction_id) {
      await insertLedgerRowOnce(sb, {
        userId,
        paymentId,
        amountPaise: entity.amount,
        linkRowId,
      });
    }

    if (finalStatus === "captured" && linkRowId) {
      const { error: linkError } = await sb
        .from("payment_links")
        .update({ status: "paid" })
        .eq("id", linkRowId);
      if (linkError)
        console.warn(
          `[razorpay-webhook] could not mark link ${linkRowId} paid:`,
          linkError.message,
        );
    }

    console.info(
      `[razorpay-webhook] event=${event} payment=${paymentId} amount_paise=${entity.amount} status=${finalStatus} user=${userId}`,
    );
    return json({ ok: true, event, paymentId, status: finalStatus }, 200);
  } catch (err) {
    console.error(
      `[razorpay-webhook] event=${event} payment=${paymentId}:`,
      (err as Error).message,
    );
    return json({ ok: false, error: "internal error" }, 500);
  }
}

/**
 * Insert the ledger `transactions` row for a captured payment EXACTLY once.
 * Compare-and-set on payments.transaction_id: only the worker whose update
 * flips NULL → txn id wins; a loser deletes its orphan row.
 */
async function insertLedgerRowOnce(
  sb: SupabaseClient,
  args: { userId: string; paymentId: string; amountPaise: number; linkRowId: string | null },
): Promise<void> {
  const dateISO = new Date().toISOString().slice(0, 10);
  const { data: txn, error: txnError } = await sb
    .from("transactions")
    .insert({
      user_id: args.userId,
      type: "expense",
      amount_paise: args.amountPaise,
      category: "others",
      // reference = Razorpay payment id (transactions has no reference column).
      note: `Razorpay test payment · ${args.paymentId}`,
      date_iso: dateISO,
      pay_mode: "razorpay_test",
      // account_id intentionally omitted: this is an external rail — it must
      // not move any FinVerse account balance.
    })
    .select("id")
    .single();
  if (txnError) throw txnError;
  const txnId = (txn as { id: string }).id;

  // CAS: claim the payment row only if no transaction is linked yet.
  const { data: claimed, error: claimError } = await sb
    .from("payments")
    .update({ transaction_id: txnId })
    .eq("razorpay_payment_id", args.paymentId)
    .is("transaction_id", null)
    .select("id");
  if (claimError) throw claimError;

  if (((claimed ?? []) as unknown[]).length === 0) {
    // Another delivery won the race — remove our orphan row.
    await sb.from("transactions").delete().eq("id", txnId);
    console.info(
      `[razorpay-webhook] payment=${args.paymentId}: duplicate delivery, ledger write deduped`,
    );
  } else {
    console.info(
      `[razorpay-webhook] payment=${args.paymentId}: ledger transaction ${txnId} recorded`,
    );
  }
}
