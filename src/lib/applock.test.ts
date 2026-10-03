import { describe, expect, it } from "vitest";

import {
  LOCKOUT_SECONDS,
  MAX_FAILED_ATTEMPTS,
  PBKDF2_ITERATIONS,
  generateSalt,
  hashPin,
  isLockEnabled,
  isValidPin,
  timingSafeEqualHex,
  verifyPin,
} from "./applock";

// crypto.subtle needs a secure context (HTTPS/localhost) or Node >= 19 /
// Bun with WebCrypto. Skip the crypto battery with a clear message if it is
// unavailable instead of failing obscurely.
const hasSubtle = typeof globalThis.crypto?.subtle !== "undefined";
if (!hasSubtle) {
  console.warn(
    "[applock.test] SKIPPED: crypto.subtle is unavailable in this environment " +
      "(WebCrypto needs a secure context). The app surfaces this as a clear error too.",
  );
}

const maybe = hasSubtle ? describe : describe.skip;

maybe("applock crypto", () => {
  it("hashes deterministically and verifies the correct PIN", async () => {
    const salt = generateSalt();
    const hash = await hashPin("482913", salt);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyPin("482913", salt, hash)).toBe(true);
  });

  it("rejects a wrong PIN", async () => {
    const salt = generateSalt();
    const hash = await hashPin("482913", salt);
    expect(await verifyPin("482914", salt, hash)).toBe(false);
    expect(await verifyPin("000000", salt, hash)).toBe(false);
  });

  it("produces unique salts, so identical PINs hash differently", async () => {
    const salts = new Set(Array.from({ length: 8 }, () => generateSalt()));
    expect(salts.size).toBe(8);
    for (const s of salts) expect(s).toMatch(/^[0-9a-f]{32}$/);
    const hashes = await Promise.all([...salts].map((s) => hashPin("123456", s)));
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  it("verifies is timing-channel safe: constant length hex digest", async () => {
    // SHA-256 hex digest is always 64 chars; comparison must not early-exit.
    const salt = generateSalt();
    const hash = await hashPin("999999", salt);
    expect(hash).toHaveLength(64);
    expect(timingSafeEqualHex(hash, "0".repeat(64))).toBe(false);
    expect(timingSafeEqualHex(hash, hash)).toBe(true);
    expect(timingSafeEqualHex(hash, hash.slice(0, 63))).toBe(false);
  });

  it("rejects malformed input instead of hashing silently", async () => {
    const salt = generateSalt();
    await expect(hashPin("12345", salt)).rejects.toThrow(/6 digits/);
    await expect(hashPin("1234567", salt)).rejects.toThrow(/6 digits/);
    await expect(hashPin("abcdef", salt)).rejects.toThrow(/6 digits/);
    await expect(hashPin(" 12345", salt)).rejects.toThrow(/6 digits/);
    // verifyPin swallows format errors into a plain `false` for callers.
    const hash = await hashPin("123456", salt);
    expect(await verifyPin("12345", salt, hash)).toBe(false);
  });
});

describe("applock pure helpers", () => {
  it("validates PIN format (6 ASCII digits)", () => {
    expect(isValidPin("482913")).toBe(true);
    expect(isValidPin("000000")).toBe(true);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("1234567")).toBe(false);
    expect(isValidPin("abcdef")).toBe(false);
    expect(isValidPin("１２３４５６")).toBe(false); // full-width digits
    expect(isValidPin("")).toBe(false);
  });

  it("timingSafeEqualHex is a strict, constant-time comparison", () => {
    expect(timingSafeEqualHex("ab", "ab")).toBe(true);
    expect(timingSafeEqualHex("ab", "ac")).toBe(false);
    expect(timingSafeEqualHex("ab", "abc")).toBe(false);
    expect(timingSafeEqualHex("", "")).toBe(true);
  });

  it("isLockEnabled detects an enabled lock", () => {
    const base = {
      user_id: "u1",
      pin_salt: "s",
      biometric_enabled: false,
      timeout_secs: 120 as const,
      failed_attempts: 0,
      locked_until: null,
      created_at: "",
      updated_at: "",
    };
    expect(isLockEnabled({ ...base, pin_hash: "h" })).toBe(true);
    expect(isLockEnabled({ ...base, pin_hash: "" })).toBe(false);
    expect(isLockEnabled(null)).toBe(false);
    expect(isLockEnabled(undefined)).toBe(false);
  });

  it("lockout constants match the spec", () => {
    expect(MAX_FAILED_ATTEMPTS).toBe(5);
    expect(LOCKOUT_SECONDS).toBe(30);
    expect(PBKDF2_ITERATIONS).toBe(100_000);
  });
});
