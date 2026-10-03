import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { n as objectType, r as stringType, t as numberType } from "../_libs/zod.mjs";
import { a as razorpayCredentials, i as missingTableError, n as getUserSupabase, r as isMissingTable } from "./razorpay-env-CU-eoqng.mjs";
import processModule from "node:process";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/razorpay.server-CVxih64f.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
/** Whether the server has Razorpay test keys. Never leaks the keys. */
var getRazorpayStatusFn_createServerFn_handler = createServerRpc({
	id: "02c6def9966c47bdd505ba6ad74da24b480ffe8f8a969d31154dedc2f29a2142",
	name: "getRazorpayStatusFn",
	filename: "src/lib/razorpay.server.ts"
}, (opts) => getRazorpayStatusFn.__executeServer(opts));
var getRazorpayStatusFn = createServerFn({ method: "GET" }).handler(getRazorpayStatusFn_createServerFn_handler, async () => {
	return { configured: Boolean(processModule.env["RAZORPAY_KEY_ID"] && processModule.env["RAZORPAY_KEY_SECRET"]) };
});
var CreateLinkInput = objectType({
	amountPaise: numberType().int().positive().max(1e8),
	note: stringType().max(200).optional(),
	accessToken: stringType().min(1)
});
/**
* Create a Razorpay TEST-MODE payment link and record it in `payment_links`.
* Returns the short_url; the client opens it in a new tab. Payment status is
* learned from the `payments` table (populated by the webhook), never from
* anything the client claims.
*/
var createPaymentLinkFn_createServerFn_handler = createServerRpc({
	id: "5fdba5c9b2c2a46d87ce158b2cbb0afc81faff67cd4a1b7610dccff638f8f3db",
	name: "createPaymentLinkFn",
	filename: "src/lib/razorpay.server.ts"
}, (opts) => createPaymentLinkFn.__executeServer(opts));
var createPaymentLinkFn = createServerFn({ method: "POST" }).validator(CreateLinkInput).handler(createPaymentLinkFn_createServerFn_handler, async ({ data }) => {
	const { keyId, keySecret } = razorpayCredentials();
	const sb = getUserSupabase(data.accessToken);
	const { data: { user }, error: userError } = await sb.auth.getUser(data.accessToken);
	if (userError || !user) throw new Error("Not signed in.");
	const userId = user.id;
	const expiresAt = new Date(Date.now() + 12e5).toISOString();
	const pendingRef = `pending_${randomUUID()}`;
	const { data: linkRow, error: insertError } = await sb.from("payment_links").insert({
		user_id: userId,
		razorpay_link_id: pendingRef,
		amount_paise: data.amountPaise,
		currency: "INR",
		status: "created",
		expires_at: expiresAt
	}).select("id").single();
	if (insertError) {
		if (isMissingTable(insertError)) throw missingTableError();
		throw insertError;
	}
	const linkId = linkRow.id;
	let link;
	try {
		const res = await fetch("https://api.razorpay.com/v1/payment_links", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
			},
			body: JSON.stringify({
				amount: data.amountPaise,
				currency: "INR",
				description: data.note?.trim() || "FinVerse test payment",
				reference_id: linkId,
				expire_by: Math.floor(new Date(expiresAt).getTime() / 1e3),
				reminder_enable: false,
				notes: {
					finverse_user_id: userId,
					finverse_link_id: linkId
				}
			})
		});
		if (!res.ok) {
			const errBody = await res.json().catch(() => null);
			throw new Error(`Razorpay rejected the link request (HTTP ${res.status}): ` + (errBody?.error?.description ?? errBody?.error?.code ?? "unknown error"));
		}
		link = await res.json();
	} catch (err) {
		await sb.from("payment_links").delete().eq("id", linkId);
		throw err;
	}
	const { error: updateError } = await sb.from("payment_links").update({
		razorpay_link_id: link.id,
		status: "created"
	}).eq("id", linkId);
	if (updateError) console.error(`[razorpay] link ${link.id} created but DB update failed:`, updateError.message);
	console.info(`[razorpay] payment link created: link=${linkId} razorpay=${link.id} amount_paise=${data.amountPaise} user=${userId}`);
	return {
		linkId,
		razorpayLinkId: link.id,
		shortUrl: link.short_url,
		status: link.status
	};
});
//#endregion
export { createPaymentLinkFn_createServerFn_handler, getRazorpayStatusFn_createServerFn_handler };
