/**
 * Strict decimal parsing for user-typed money / calculator input.
 * Pure, framework-free.
 *
 * `Number()` is too lenient for money fields: it accepts "1e5", "0x10",
 * "Infinity", leading/trailing garbage like "12abc", and silently rounds
 * "12.345". This parser strips the harmless formatting users type
 * (commas, ₹, whitespace) and then requires the *whole* string to be a
 * plain non-negative decimal with at most 2 fractional digits.
 */

/** Plain non-negative decimal, at most 2 digits after the point. */
const STRICT_DECIMAL_RE = /^\d+(\.\d{1,2})?$/;

/**
 * Parse free-typed numeric input into a finite number.
 * Returns NaN when the input is not a plain decimal — including "1e5",
 * "0x10", "-5", "Infinity", "", "12abc", "12.345", and ".".
 */
export function parseStrictDecimal(input: string): number {
  const cleaned = input.replace(/[,₹\s]/g, "");
  if (!STRICT_DECIMAL_RE.test(cleaned)) return NaN;
  return Number(cleaned);
}
