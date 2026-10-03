/**
 * App-lock cryptography + types (framework-free, no React).
 *
 * The raw PIN never leaves the device: the PIN is salted and stretched with
 * PBKDF2-SHA256 (100k iterations) client-side via WebCrypto, and only the
 * salt + hex digest are stored in the `app_lock` table. The database never
 * sees the raw PIN, and nothing here logs it.
 *
 * Requires a secure context (window.crypto.subtle); every public helper
 * throws a descriptive error when WebCrypto is unavailable.
 */

/**
 * TypeScript mirror of the `app_lock` table from
 * supabase/migrations/0002_revamp.sql (one row per user).
 *
 * pin_salt / pin_hash are the PBKDF2-SHA256 salt and hex digest computed
 * client-side — the server never sees the raw PIN.
 */
export interface AppLockRow {
  user_id: string;
  pin_salt: string;
  pin_hash: string;
  biometric_enabled: boolean;
  timeout_secs: 30 | 60 | 120 | 300 | 600;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

/** Lock is "enabled" when the user has a PIN set (pin_hash present). */
export function isLockEnabled(row: AppLockRow | null | undefined): boolean {
  return !!row && typeof row.pin_hash === "string" && row.pin_hash.length > 0;
}

/** PBKDF2 iterations for PIN derivation. */
export const PBKDF2_ITERATIONS = 100_000;
/** Supported auto-lock timeouts (seconds) — matches the DB check constraint. */
export const APP_LOCK_TIMEOUTS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
] as const;
/** Wrong-PIN attempts before a cooldown lockout is imposed. */
export const MAX_FAILED_ATTEMPTS = 5;
/** Lockout duration (seconds) after MAX_FAILED_ATTEMPTS wrong entries. */
export const LOCKOUT_SECONDS = 30;

function subtle(): SubtleCrypto {
  const sc = globalThis.crypto?.subtle;
  if (!sc) {
    throw new Error(
      "App lock needs WebCrypto (crypto.subtle), which is unavailable in this " +
        "context — use HTTPS or localhost. The PIN was never stored or sent.",
    );
  }
  return sc;
}

/** 16 random bytes, returned as a 32-char lowercase hex string. */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * Derive a hex digest from `pin` + hex `salt` via PBKDF2-SHA256, 100k
 * iterations. Validates the PIN is exactly 6 ASCII digits (the PIN pad's
 * contract) so malformed input fails loudly instead of hashing silently.
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  assertPinFormat(pin);
  assertSaltFormat(salt);
  const crypto_ = subtle();
  const key = await crypto_.importKey(
    "raw",
    new TextEncoder().encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto_.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

/**
 * Constant-time comparison of a candidate PIN against a stored salt+hash.
 * Returns false (not throws) for malformed input so callers can treat any
 * mismatch as a plain wrong-PIN attempt.
 *
 * Note: this is XOR-loop comparison on hex strings — it removes the
 * early-exit timing channel present in `===`. It is not a hardware-level
 * guarantee, but it is the correct practice for a client-side unlock gate.
 */
export async function verifyPin(pin: string, salt: string, hash: string): Promise<boolean> {
  let candidate: string;
  try {
    candidate = await hashPin(pin, salt);
  } catch {
    return false;
  }
  return timingSafeEqualHex(candidate, hash);
}

/** Constant-time equality over lowercase hex digests. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** PIN contract: exactly 6 ASCII digits. */
export function isValidPin(pin: string): boolean {
  return /^[0-9]{6}$/.test(pin);
}

/**
 * True for PINs too predictable to guard the app and worth rejecting at
 * set/change time: all-same-digit ("000000", "777777") and full
 * ascending/descending runs ("123456", "654321", "901234", "987654").
 * Malformed input also returns true (fail closed — format errors are
 * surfaced separately by `isValidPin`/`assertPinFormat`).
 */
export function isWeakPin(pin: string): boolean {
  if (!isValidPin(pin)) return true;
  const d = pin.split("").map(Number);
  if (d.every((x) => x === d[0])) return true; // 000000, 111111, …
  const ascending = d.every((x, i) => i === 0 || x === (d[i - 1]! + 1) % 10);
  const descending = d.every((x, i) => i === 0 || x === (d[i - 1]! + 9) % 10);
  return ascending || descending;
}

function assertPinFormat(pin: string): void {
  if (!isValidPin(pin)) {
    throw new Error("PIN must be exactly 6 digits.");
  }
}

function assertSaltFormat(salt: string): void {
  if (!/^[0-9a-f]{32}$/i.test(salt)) {
    throw new Error("Invalid salt format.");
  }
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
