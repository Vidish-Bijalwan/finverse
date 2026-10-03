import { r as isMissingTable, t as getServiceSupabase } from "./razorpay-env-CU-eoqng.mjs";
import processModule from "node:process";
import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/razorpay-webhook-DuI9GMG3.js
/**
* Razorpay integration helpers — PURE FUNCTIONS, NO DEPENDENCIES.
*
* Contract for the webhook agent:
*   - `verifyWebhookSignature` is the single source of truth for validating
*     Razorpay webhook callbacks (HMAC-SHA256 of the RAW request body,
*     hex-encoded, compared against the `x-razorpay-signature` header).
*   - `computeWebhookSignature` is provided for testing / signature
*     generation in dev tooling.
*
* Rules:
*   1. Always verify against the RAW body bytes as received on the wire.
*      Do NOT JSON.parse/re-stringify before verifying — key order and
*      whitespace change the digest.
*   2. Uses node:crypto only — no external dependencies, safe to import in
*      server routes, edge handlers, and unit tests alike.
*   3. Uses a constant-time comparison (timingSafeEqual) so a wrong
*      signature does not leak information via timing.
*/
/**
* Compute the Razorpay webhook signature for a raw body + webhook secret.
* Razorpay spec: HMAC-SHA256(webhookSecret, rawBody), hex-encoded.
*/
function computeWebhookSignature(rawBody, secret) {
	return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}
/**
* Verify a Razorpay webhook request.
*
* @param rawBody    The exact raw request body bytes (utf-8 string).
* @param signature  The value of the `x-razorpay-signature` request header.
* @param secret     The webhook secret from the Razorpay dashboard (test mode).
* @returns true only when the signature is valid for the body+secret.
*
* Never throws: any malformed input simply fails verification.
*/
function verifyWebhookSignature(rawBody, signature, secret) {
	try {
		if (!signature || typeof signature !== "string" || !secret) return false;
		const expected = computeWebhookSignature(rawBody, secret);
		const a = Buffer.from(signature, "utf8");
		const b = Buffer.from(expected, "utf8");
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
}
/**
* Raw webhook handler: verify signature → idempotent upsert → ledger write.
* Framework-agnostic: takes the raw Request, returns a Response.
*/
async function handleRazorpayWebhook(request) {
	const json = (body, status) => new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
	let rawBody;
	try {
		rawBody = await request.text();
	} catch {
		return json({
			ok: false,
			error: "could not read request body"
		}, 400);
	}
	const signature = request.headers.get("x-razorpay-signature");
	const secret = processModule.env["RAZORPAY_KEY_SECRET"];
	if (!secret) {
		console.error("[razorpay-webhook] RAZORPAY_KEY_SECRET is not configured");
		return json({
			ok: false,
			error: "webhook not configured"
		}, 500);
	}
	if (!verifyWebhookSignature(rawBody, signature, secret)) {
		console.warn("[razorpay-webhook] signature verification failed");
		return json({
			ok: false,
			error: "invalid signature"
		}, 401);
	}
	let payload;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return json({
			ok: false,
			error: "malformed JSON body"
		}, 400);
	}
	const event = payload.event ?? "";
	const entity = payload.payload?.payment?.entity;
	if (!entity?.id) {
		console.info(`[razorpay-webhook] event=${event}: no payment entity, acknowledged`);
		return json({
			ok: true,
			ignored: "no payment entity"
		}, 200);
	}
	const paymentId = entity.id;
	const notes = entity.notes ?? {};
	const userId = typeof notes["finverse_user_id"] === "string" ? notes["finverse_user_id"] : null;
	const linkRowId = typeof notes["finverse_link_id"] === "string" ? notes["finverse_link_id"] : null;
	if (!userId) {
		console.warn(`[razorpay-webhook] event=${event} payment=${paymentId}: no finverse_user_id in notes — skipping ledger write`);
		return json({
			ok: true,
			ignored: "unattributed payment"
		}, 200);
	}
	const status = event === "payment.captured" ? "captured" : event === "payment.failed" ? "failed" : event === "payment.authorized" ? "attempted" : null;
	if (!status) {
		console.info(`[razorpay-webhook] event=${event} payment=${paymentId}: unhandled event, acknowledged`);
		return json({
			ok: true,
			ignored: `unhandled event ${event}`
		}, 200);
	}
	let sb;
	try {
		sb = getServiceSupabase();
	} catch (err) {
		console.error("[razorpay-webhook]", err.message);
		return json({
			ok: false,
			error: "webhook not configured"
		}, 500);
	}
	try {
		const { data: existing } = await sb.from("payments").select("id, status, transaction_id").eq("razorpay_payment_id", paymentId).maybeSingle();
		const existingRow = existing;
		const finalStatus = existingRow?.status === "captured" || existingRow?.status === "failed" ? existingRow.status : status;
		const upsertPayload = {
			user_id: userId,
			payment_link_id: linkRowId,
			razorpay_payment_id: paymentId,
			amount_paise: entity.amount,
			currency: entity.currency ?? "INR",
			status: finalStatus,
			method: entity.method ?? null,
			webhook_verified: finalStatus === "captured",
			failure_reason: finalStatus === "failed" ? entity.error_description ?? entity.error_reason ?? entity.error_code ?? "payment failed" : null,
			raw_event: payload
		};
		const { data: paymentRow, error: upsertError } = await sb.from("payments").upsert(upsertPayload, { onConflict: "razorpay_payment_id" }).select("id, status, transaction_id").single();
		if (upsertError) {
			if (isMissingTable(upsertError)) {
				console.error("[razorpay-webhook] payments table missing — run 0002_revamp.sql");
				return json({
					ok: false,
					error: "payments tables not set up"
				}, 500);
			}
			throw upsertError;
		}
		if (finalStatus === "captured" && !paymentRow.transaction_id) await insertLedgerRowOnce(sb, {
			userId,
			paymentId,
			amountPaise: entity.amount,
			linkRowId
		});
		if (finalStatus === "captured" && linkRowId) {
			const { error: linkError } = await sb.from("payment_links").update({ status: "paid" }).eq("id", linkRowId);
			if (linkError) console.warn(`[razorpay-webhook] could not mark link ${linkRowId} paid:`, linkError.message);
		}
		console.info(`[razorpay-webhook] event=${event} payment=${paymentId} amount_paise=${entity.amount} status=${finalStatus} user=${userId}`);
		return json({
			ok: true,
			event,
			paymentId,
			status: finalStatus
		}, 200);
	} catch (err) {
		console.error(`[razorpay-webhook] event=${event} payment=${paymentId}:`, err.message);
		return json({
			ok: false,
			error: "internal error"
		}, 500);
	}
}
/**
* Insert the ledger `transactions` row for a captured payment EXACTLY once.
* Compare-and-set on payments.transaction_id: only the worker whose update
* flips NULL → txn id wins; a loser deletes its orphan row.
*/
async function insertLedgerRowOnce(sb, args) {
	const dateISO = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const { data: txn, error: txnError } = await sb.from("transactions").insert({
		user_id: args.userId,
		type: "expense",
		amount_paise: args.amountPaise,
		category: "others",
		note: `Razorpay test payment · ${args.paymentId}`,
		date_iso: dateISO,
		pay_mode: "razorpay_test"
	}).select("id").single();
	if (txnError) throw txnError;
	const txnId = txn.id;
	const { data: claimed, error: claimError } = await sb.from("payments").update({ transaction_id: txnId }).eq("razorpay_payment_id", args.paymentId).is("transaction_id", null).select("id");
	if (claimError) throw claimError;
	if ((claimed ?? []).length === 0) {
		await sb.from("transactions").delete().eq("id", txnId);
		console.info(`[razorpay-webhook] payment=${args.paymentId}: duplicate delivery, ledger write deduped`);
	} else console.info(`[razorpay-webhook] payment=${args.paymentId}: ledger transaction ${txnId} recorded`);
}
//#endregion
export { handleRazorpayWebhook };
