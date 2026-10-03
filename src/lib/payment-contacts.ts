/**
 * Payment contacts — derive "people" from the user's real ledger activity.
 *
 * No address book, no seed data: a person appears here only after the user
 * has actually paid them (simulated UPI / bank transfer), requested money
 * from them, or recharged their number. Displayed as avatar + name, like a
 * consumer payments app.
 *
 * Ledger-note contract (single-line notes only):
 *   upi_test  : "<name>" or "<name> · <user note>"
 *   bank_test : "Bank transfer · <name> · A/c …<last4>" (+ optional " · <user note>")
 *
 * The " · " separator is documented here and covered by tests; display
 * names entered through single-line inputs realistically never contain it.
 */

import { isPaymentTransaction } from "./payments";
import { isValidUpiId } from "./upi-qr";
import type { Transaction } from "./finance/types";
import type { PaymentRequest } from "./payment-requests";

export { isValidUpiId };

export const NOTE_SEP = " · ";
const BANK_NOTE_PREFIX = "Bank transfer";

export interface PayeePerson {
  /** Display name. */
  name: string;
  /** Rail of the most recent interaction. */
  rail: "upi" | "bank" | "request" | "recharge";
  /** Extra line, e.g. "A/c …4821" or the UPI ID. */
  detail?: string;
  /** ISO datetime of the most recent interaction (for ordering). */
  lastAt: string;
}

/** Parsed view of a payment ledger note. */
export interface ParsedPayeeNote {
  name: string;
  /** e.g. "A/c …4821" for bank transfers. */
  detail?: string;
  /** Free-form note the payer attached, if any. */
  userNote?: string;
}

/**
 * Parse a payment ledger note back into its structured parts.
 * Returns null for notes that don't follow the contract.
 */
export function parsePayeeNote(payMode: string, note: string): ParsedPayeeNote | null {
  const parts = note.split(NOTE_SEP);
  if (payMode === "upi_test") {
    const name = (parts[0] ?? "").trim();
    if (!name) return null;
    const rest = parts.slice(1).join(NOTE_SEP).trim();
    return rest ? { name, userNote: rest } : { name };
  }
  if (payMode === "bank_test") {
    if (parts[0] !== BANK_NOTE_PREFIX) return null;
    const name = (parts[1] ?? "").trim();
    const detail = (parts[2] ?? "").trim();
    if (!name || !detail) return null;
    const rest = parts.slice(3).join(NOTE_SEP).trim();
    return rest ? { name, detail, userNote: rest } : { name, detail };
  }
  return null;
}

/** Ledger note for a simulated-UPI payment, with optional user note. */
export function buildUpiNoteWithUserNote(name: string, userNote?: string): string {
  const base = name.trim().slice(0, 120);
  const extra = (userNote ?? "").trim().slice(0, 200);
  return extra ? `${base}${NOTE_SEP}${extra}` : base;
}

/** Ledger note for a simulated bank transfer, with optional user note. */
export function buildBankNote(name: string, accountNumber: string, userNote?: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  const base = `${BANK_NOTE_PREFIX}${NOTE_SEP}${name.trim().slice(0, 120)}${NOTE_SEP}A/c …${digits.slice(-4)}`;
  const extra = (userNote ?? "").trim().slice(0, 200);
  return extra ? `${base}${NOTE_SEP}${extra}` : base;
}

/** Indian mobile number: 10 digits starting 6-9. */
export function isValidMobileNumber(n: string): boolean {
  return /^[6-9]\d{9}$/.test(n.replace(/[\s-]/g, ""));
}

/** Bank account number: 9–18 digits (spaces/dashes tolerated). */
export function isValidAccountNumber(n: string): boolean {
  return /^\d{9,18}$/.test(n.replace(/[\s-]/g, ""));
}

/** IFSC: 4 letters + 0 + 6 alphanumerics. */
export function isValidIfsc(code: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
}

/**
 * Build the people list from real activity. Dedupes case-insensitively,
 * keeps the most recent interaction per person, newest first.
 */
export function extractPeople(
  transactions: Transaction[],
  requests: PaymentRequest[],
): PayeePerson[] {
  const seen = new Map<string, PayeePerson>();
  const upsert = (p: PayeePerson) => {
    const key = p.name.toLowerCase();
    const prev = seen.get(key);
    if (!prev || p.lastAt > prev.lastAt) seen.set(key, p);
  };

  for (const t of transactions) {
    if (!isPaymentTransaction(t)) continue;
    if (t.type !== "expense" && t.type !== "income") continue;
    // Refund transactions are reversals, not counterparties — the original
    // payment already contributes the person.
    if (t.refundOf) continue;
    const parsed = parsePayeeNote(t.payMode, t.note);
    if (!parsed) continue;
    upsert({
      name: parsed.name,
      rail: t.payMode === "bank_test" ? "bank" : "upi",
      ...(parsed.detail ? { detail: parsed.detail } : {}),
      lastAt: t.createdAt,
    });
  }

  for (const r of requests) {
    const name = r.personName.trim();
    if (!name) continue;
    upsert({ name, rail: "request", lastAt: r.createdAt });
  }

  return [...seen.values()].sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
}

/** Case-insensitive people search over name + detail. */
export function searchPeople(people: PayeePerson[], query: string): PayeePerson[] {
  const q = query.trim().toLowerCase();
  if (!q) return people;
  return people.filter(
    (p) => p.name.toLowerCase().includes(q) || (p.detail ?? "").toLowerCase().includes(q),
  );
}
