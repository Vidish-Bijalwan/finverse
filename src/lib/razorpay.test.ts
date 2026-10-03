import { describe, expect, it } from "vitest";
import { computeWebhookSignature, verifyWebhookSignature } from "./razorpay";

// Known test vector, generated independently with node:crypto:
//   body   = {"event":"payment.captured","entity":"event"}
//   secret = test_webhook_secret_123
//   HMAC-SHA256(secret, body) hex:
const BODY = '{"event":"payment.captured","entity":"event"}';
const SECRET = "test_webhook_secret_123";
const KNOWN_SIGNATURE = "5c6d0e4b4ab46a3f3424bc83ec0dbe7f032da4928447265eb6d971dfd5bdd78e";

describe("computeWebhookSignature", () => {
  it("matches the independently generated known vector", () => {
    expect(computeWebhookSignature(BODY, SECRET)).toBe(KNOWN_SIGNATURE);
  });

  it("is deterministic and secret-sensitive", () => {
    expect(computeWebhookSignature(BODY, SECRET)).toBe(computeWebhookSignature(BODY, SECRET));
    expect(computeWebhookSignature(BODY, "other_secret")).not.toBe(KNOWN_SIGNATURE);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts the correct signature", () => {
    expect(verifyWebhookSignature(BODY, KNOWN_SIGNATURE, SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const tampered = '{"event":"payment.captured","entity":"event","amount":1}';
    expect(verifyWebhookSignature(tampered, KNOWN_SIGNATURE, SECRET)).toBe(false);
  });

  it("rejects a signature computed with the wrong secret", () => {
    expect(verifyWebhookSignature(BODY, KNOWN_SIGNATURE, "wrong_secret")).toBe(false);
  });

  it("rejects a forged signature string", () => {
    expect(verifyWebhookSignature(BODY, "0".repeat(64), SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, "not-hex-at-all", SECRET)).toBe(false);
  });

  it("rejects missing/empty inputs without throwing", () => {
    expect(verifyWebhookSignature(BODY, null, SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, undefined, SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, "", SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, KNOWN_SIGNATURE, "")).toBe(false);
    expect(verifyWebhookSignature("", "", "")).toBe(false);
  });
});
