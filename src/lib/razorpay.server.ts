/**
 * Razorpay TEST MODE — server functions (server-only module).
 *
 * Import ONLY the exported server functions (createPaymentLinkFn /
 * getRazorpayStatusFn) from client code — TanStack Start compiles them into
 * RPC stubs on the client. Everything else in this module (process.env
 * secrets, node:crypto, direct Supabase access) stays on the server.
 *
 * The webhook is NOT a server function: see src/lib/razorpay-webhook.ts and
 * src/routes/api.razorpay-webhook.tsx for why it must be a raw request
 * handler (the server-function context exposes no raw Request body for
 * HMAC-SHA256, and the app's CSRF middleware only guards serverFn calls —
 * both verified against the installed @tanstack/react-start 1.168.60 types).
 *
 * Secrets used (server-only env):
 *   RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET — Razorpay test-mode keys.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  getUserSupabase,
  isMissingTable,
  missingTableError,
  razorpayCredentials,
} from "./razorpay-env";

/** Whether the server has Razorpay test keys. Never leaks the keys. */
export const getRazorpayStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  return {
    configured: Boolean(process.env["RAZORPAY_KEY_ID"] && process.env["RAZORPAY_KEY_SECRET"]),
  };
});

const CreateLinkInput = z.object({
  amountPaise: z
    .number()
    .int()
    .positive()
    .max(1000000 * 100),
  note: z.string().max(200).optional(),
  accessToken: z.string().min(1),
});

interface RazorpayLinkResponse {
  id: string;
  short_url: string;
  status: string;
}

/**
 * Create a Razorpay TEST-MODE payment link and record it in `payment_links`.
 * Returns the short_url; the client opens it in a new tab. Payment status is
 * learned from the `payments` table (populated by the webhook), never from
 * anything the client claims.
 */
export const createPaymentLinkFn = createServerFn({ method: "POST" })
  .validator(CreateLinkInput)
  .handler(async ({ data }) => {
    const { keyId, keySecret } = razorpayCredentials();

    const sb = getUserSupabase(data.accessToken);
    const {
      data: { user },
      error: userError,
    } = await sb.auth.getUser(data.accessToken);
    if (userError || !user) throw new Error("Not signed in.");
    const userId = user.id;

    // Insert the link row first so we have a stable id for the Razorpay
    // `notes` / `reference_id` (the webhook attributes payments through them).
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    const pendingRef = `pending_${randomUUID()}`;
    const { data: linkRow, error: insertError } = await sb
      .from("payment_links")
      .insert({
        user_id: userId,
        razorpay_link_id: pendingRef,
        amount_paise: data.amountPaise,
        currency: "INR",
        status: "created",
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (insertError) {
      if (isMissingTable(insertError)) throw missingTableError();
      throw insertError;
    }
    const linkId = (linkRow as { id: string }).id;

    let link: RazorpayLinkResponse;
    try {
      const res = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: data.amountPaise, // paise for INR
          currency: "INR",
          description: data.note?.trim() || "FinVerse test payment",
          reference_id: linkId,
          expire_by: Math.floor(new Date(expiresAt).getTime() / 1000),
          reminder_enable: false,
          notes: { finverse_user_id: userId, finverse_link_id: linkId },
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => null)) as {
          error?: { code?: string; description?: string };
        } | null;
        throw new Error(
          `Razorpay rejected the link request (HTTP ${res.status}): ` +
            (errBody?.error?.description ?? errBody?.error?.code ?? "unknown error"),
        );
      }
      link = (await res.json()) as RazorpayLinkResponse;
    } catch (err) {
      // Don't leave a dead row behind; the link was never created.
      await sb.from("payment_links").delete().eq("id", linkId);
      throw err;
    }

    const { error: updateError } = await sb
      .from("payment_links")
      .update({ razorpay_link_id: link.id, status: "created" })
      .eq("id", linkId);
    if (updateError) {
      // The Razorpay link exists; the row keeps the pending ref — log loudly.
      console.error(
        `[razorpay] link ${link.id} created but DB update failed:`,
        updateError.message,
      );
    }

    console.info(
      `[razorpay] payment link created: link=${linkId} razorpay=${link.id} amount_paise=${data.amountPaise} user=${userId}`,
    );
    return {
      linkId,
      razorpayLinkId: link.id,
      shortUrl: link.short_url,
      status: link.status,
    };
  });
