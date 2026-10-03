/**
 * Pure keypad logic for AmountInput.
 *
 * Extracted as pure functions so rapid-tap behavior is unit-testable.
 * The component applies these against a ref-mirrored digit string so taps
 * arriving faster than React re-renders never compute from stale closure
 * state (previously, fast 5,0,0 taps dropped the zeros and registered ₹5).
 */

/** Append a keypad key ("0"–"9" or "00") to the digit string. */
export function applyKey(digits: string, key: string, maxDigits = 10): string {
  if (digits.length >= maxDigits) return digits;
  if (digits === "" && (key === "0" || key === "00")) return digits; // no leading zeros
  return digits + key;
}

/** Remove the last entered digit. */
export function applyBackspace(digits: string): string {
  return digits.slice(0, -1);
}
