import { describe, expect, it } from "vitest";
import {
  MAX_PAYMENT_PAISE,
  PaymentsSetupPendingError,
  buildUpiNote,
  groupTransactionsByMonth,
  isPaymentTransaction,
  isSetupPendingError,
  toTxnStatus,
  validatePaymentAmount,
} from "./payments";
import type { Transaction } from "./finance/types";

function txn(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t1",
    type: "expense",
    amountPaise: 50000,
    category: "others",
    note: "Aarav",
    dateISO: "2026-10-03",
    payMode: "upi_test",
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
    ...overrides,
  } as Transaction;
}

describe("validatePaymentAmount", () => {
  it("accepts valid integer paise", () => {
    expect(validatePaymentAmount(1)).toEqual({ ok: true, amountPaise: 1 });
    expect(validatePaymentAmount(50000)).toEqual({ ok: true, amountPaise: 50000 });
    expect(validatePaymentAmount(MAX_PAYMENT_PAISE)).toEqual({
      ok: true,
      amountPaise: MAX_PAYMENT_PAISE,
    });
  });

  it("rejects zero, negative, and fractional amounts", () => {
    expect(validatePaymentAmount(0).ok).toBe(false);
    expect(validatePaymentAmount(-100).ok).toBe(false);
    expect(validatePaymentAmount(10.5).ok).toBe(false);
    expect(validatePaymentAmount(NaN).ok).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(validatePaymentAmount("500").ok).toBe(false);
    expect(validatePaymentAmount(undefined).ok).toBe(false);
    expect(validatePaymentAmount(null).ok).toBe(false);
  });

  it("rejects amounts above the per-payment cap", () => {
    const r = validatePaymentAmount(MAX_PAYMENT_PAISE + 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/10,00,000/);
  });
});

describe("toTxnStatus", () => {
  it("maps Razorpay statuses to row chips", () => {
    expect(toTxnStatus("captured")).toBe("success");
    expect(toTxnStatus("failed")).toBe("failed");
    expect(toTxnStatus("created")).toBe("pending");
    expect(toTxnStatus("attempted")).toBe("pending");
  });
});

describe("buildUpiNote", () => {
  it("trims and caps length", () => {
    expect(buildUpiNote("  Aarav Sharma  ")).toBe("Aarav Sharma");
    expect(buildUpiNote("x".repeat(200)).length).toBe(120);
  });
});

describe("isPaymentTransaction", () => {
  it("matches only test-rail pay modes", () => {
    expect(isPaymentTransaction(txn({ payMode: "upi_test" }))).toBe(true);
    expect(isPaymentTransaction(txn({ payMode: "razorpay_test" }))).toBe(true);
    expect(isPaymentTransaction(txn({ payMode: "UPI" }))).toBe(false);
    expect(isPaymentTransaction(txn({ payMode: "Cash" }))).toBe(false);
  });
});

describe("groupTransactionsByMonth", () => {
  it("groups newest month first with labels", () => {
    const groups = groupTransactionsByMonth([
      txn({ id: "a", dateISO: "2026-09-05", createdAt: "2026-09-05T10:00:00Z" }),
      txn({ id: "b", dateISO: "2026-10-01", createdAt: "2026-10-01T10:00:00Z" }),
      txn({ id: "c", dateISO: "2026-10-03", createdAt: "2026-10-03T10:00:00Z" }),
    ]);
    expect(groups.map((g) => g.monthKey)).toEqual(["2026-10", "2026-09"]);
    expect(groups[0]?.label).toMatch(/October 2026/);
    expect(groups[0]?.items.map((t) => t.id)).toEqual(["c", "b"]);
  });

  it("returns empty for no transactions", () => {
    expect(groupTransactionsByMonth([])).toEqual([]);
  });
});

describe("isSetupPendingError", () => {
  it("detects the branded error and Postgrest 42P01", () => {
    expect(isSetupPendingError(new PaymentsSetupPendingError())).toBe(true);
    expect(
      isSetupPendingError({ code: "42P01", message: 'relation "payments" does not exist' }),
    ).toBe(true);
    expect(isSetupPendingError(new Error('relation "payment_links" does not exist'))).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isSetupPendingError(new Error("network down"))).toBe(false);
    expect(isSetupPendingError(null)).toBe(false);
    expect(isSetupPendingError(undefined)).toBe(false);
  });
});
