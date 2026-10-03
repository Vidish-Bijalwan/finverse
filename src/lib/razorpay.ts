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

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compute the Razorpay webhook signature for a raw body + webhook secret.
 * Razorpay spec: HMAC-SHA256(webhookSecret, rawBody), hex-encoded.
 */
export function computeWebhookSignature(rawBody: string, secret: string): string {
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
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
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
