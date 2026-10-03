import { n as createClient } from "../_libs/@supabase/ssr+[...].mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/razorpay-env-CU-eoqng.js
/**
* Shared server-side helpers for the Razorpay integration.
*
* No node:crypto here and no createServerFn — safe to import from both the
* server-function module (src/lib/razorpay.server.ts) and the webhook module
* (src/lib/razorpay-webhook.ts).
*/
/** Razorpay test-mode credentials (server-only env). Throws when missing. */
function razorpayCredentials() {
	const keyId = processModule.env["RAZORPAY_KEY_ID"];
	const keySecret = processModule.env["RAZORPAY_KEY_SECRET"];
	if (!keyId || !keySecret) throw new Error("Razorpay test keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the server environment (server-only, test mode keys only).");
	return {
		keyId,
		keySecret
	};
}
function supabaseUrl() {
	const url = processModule.env["SUPABASE_URL"] ?? processModule.env["VITE_SUPABASE_URL"];
	if (!url) throw new Error("Supabase URL is not configured (SUPABASE_URL / VITE_SUPABASE_URL).");
	return url;
}
function supabaseAnonKey() {
	const key = processModule.env["VITE_SUPABASE_ANON_KEY"];
	if (!key) throw new Error("VITE_SUPABASE_ANON_KEY is not configured.");
	return key;
}
/** Supabase client scoped to the caller via their access token (RLS enforced). */
function getUserSupabase(accessToken) {
	return createClient(supabaseUrl(), supabaseAnonKey(), {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		},
		global: { headers: { Authorization: `Bearer ${accessToken}` } }
	});
}
/**
* Service-role client for the webhook (no user session on webhooks).
* Bypasses RLS — only ever used to write rows attributed via the
* signature-verified webhook payload's notes.
*/
function getServiceSupabase() {
	const key = processModule.env["SUPABASE_SERVICE_ROLE_KEY"];
	if (!key) throw new Error("Webhook is not configured: set SUPABASE_SERVICE_ROLE_KEY in the server environment (server-only). It lets the webhook write payments/ledger rows for the paying user, since webhooks carry no user session.");
	return createClient(supabaseUrl(), key, { auth: {
		persistSession: false,
		autoRefreshToken: false
	} });
}
/** True when a Supabase error means the table doesn't exist (42P01). */
function isMissingTable(err) {
	return err != null && typeof err === "object" && err.code === "42P01";
}
function missingTableError() {
	return /* @__PURE__ */ new Error("Payments database setup pending — run supabase/migrations/0002_revamp.sql in the Supabase SQL editor.");
}
//#endregion
export { razorpayCredentials as a, missingTableError as i, getUserSupabase as n, isMissingTable as r, getServiceSupabase as t };
