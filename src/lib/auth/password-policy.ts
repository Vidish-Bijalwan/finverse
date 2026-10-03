/**
 * Pure password-policy helpers for FinVerse auth flows.
 *
 * No imports, no I/O — safe to unit-test in node and to reuse in signup,
 * reset-password, and any future password-setting surface.
 */

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Curated list of passwords that are always rejected, matched
 * case-insensitively. Weak-on-the-internet AND weak-on-FinVerse (brand name).
 */
export const BLOCKED_PASSWORDS = [
  "password",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "abc123",
  "letmein",
  "welcome",
  "admin123",
  "password1",
  "password123",
  "finverse",
  "11111111",
  "00000000",
] as const;

/**
 * Validate a candidate password against the policy.
 * @returns an error message when the password is rejected, or `null` when it passes.
 */
export function validatePassword(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  const lower = pw.toLowerCase();
  if ((BLOCKED_PASSWORDS as readonly string[]).includes(lower)) {
    return "This password is too common — choose something harder to guess.";
  }
  return null;
}
