/** Indian-style number grouping: 8,42,310 */
const EN_IN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/**
 * Format integer paise as INR, e.g. 84231000 -> "₹8,42,310".
 * Throws on non-finite input; rounds non-integer paise.
 */
export function formatINR(paise: number): string {
  if (!Number.isFinite(paise)) throw new Error("formatINR: amount must be a finite number");
  const rupees = Math.round(paise) / 100;
  return `₹${EN_IN.format(rupees)}`;
}

/**
 * Short human form, e.g. 84000000 -> "₹8.4L", 95000 -> "₹950".
 * Indian units: K (thousand), L (lakh), Cr (crore).
 */
export function formatINRShort(paise: number): string {
  if (!Number.isFinite(paise)) throw new Error("formatINRShort: amount must be a finite number");
  const rupees = Math.round(paise) / 100;
  const sign = rupees < 0 ? "-" : "";
  const abs = Math.abs(rupees);
  const trim = (v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(1));
  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)}L`;
  if (abs >= 1_000) return `${sign}₹${trim(abs / 1_000)}K`;
  return `${sign}₹${EN_IN.format(abs)}`;
}

/** "YYYY-MM" for a Date or "YYYY-MM-DD" string. Uses local calendar date. */
export function monthKey(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** "2026-10" -> "Oct 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const months = [
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
  ];
  return `${months[m - 1]} ${y}`;
}

/** Today's local date as "YYYY-MM-DD". */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
