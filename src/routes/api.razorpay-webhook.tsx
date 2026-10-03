import { createFileRoute } from "@tanstack/react-router";

/**
 * Razorpay webhook endpoint — POST /api/razorpay-webhook.
 *
 * This is a raw request handler (NOT a createServerFn): the framework's
 * server-function context does not expose the raw Request body needed for
 * HMAC-SHA256 verification, and the app's CSRF middleware only guards
 * serverFn handlers — Razorpay's cross-origin POSTs must reach this route
 * untouched. See src/lib/razorpay.server.ts for the full rationale.
 *
 * The handler logic is dynamically imported so the node:crypto /
 * service-role Supabase code never lands in the client bundle (the client
 * never executes this handler).
 *
 * Configure in the Razorpay dashboard (test mode):
 *   Webhook URL: https://<your-app>/api/razorpay-webhook
 *   Events: payment.authorized, payment.captured, payment.failed
 *   Secret: must match RAZORPAY_KEY_SECRET in the server environment.
 */
export const Route = createFileRoute("/api/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleRazorpayWebhook } = await import("@/lib/razorpay-webhook");
        return handleRazorpayWebhook(request);
      },
    },
  },
});
