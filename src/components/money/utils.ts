/**
 * Shared helpers for the money routes (bills / budgets / goals).
 * All money stays in integer paise; dates are "YYYY-MM-DD" / "YYYY-MM".
 */

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 11 -> "11th", 21 -> "21st" */
export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/** "2026-10" -> "Oct 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_SHORT[m - 1]} ${y}`;
}

/** "2027-03-15" -> "15 Mar 2027" */
export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_SHORT[m - 1]} ${y}`;
}

/** Shift a "YYYY-MM" key by delta months. */
export function addMonthsToKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

/** Shift a "YYYY-MM-DD" date by delta calendar months, clamped to month length. */
export function addMonthsToISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const daysInMonth = new Date(ny, nm, 0).getDate();
  return `${ny}-${String(nm).padStart(2, "0")}-${String(Math.min(d, daysInMonth)).padStart(2, "0")}`;
}

/** Whole months from keyA to keyB ("2026-10" -> "2027-03" = 5). */
export function monthDiff(keyA: string, keyB: string): number {
  const [ya, ma] = keyA.split("-").map(Number);
  const [yb, mb] = keyB.split("-").map(Number);
  return yb * 12 + mb - (ya * 12 + ma);
}

/** Parse a "₹12,345.67"-ish string into integer paise. NaN when not parseable. */
export function rupeesToPaise(input: string): number {
  const cleaned = input.replace(/[,₹\s]/g, "");
  if (cleaned === "") return NaN;
  const rupees = Number(cleaned);
  if (!Number.isFinite(rupees) || rupees < 0) return NaN;
  return Math.round(rupees * 100);
}

/** Integer paise -> plain rupee string for form fields ("12345.67"). */
export function paiseToRupees(paise: number): string {
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
}

export const GOAL_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
] as const;
