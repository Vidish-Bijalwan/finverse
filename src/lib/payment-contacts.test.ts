import { describe, expect, it } from "vitest";
import {
  buildBankNote,
  buildUpiNoteWithUserNote,
  extractPeople,
  isValidAccountNumber,
  isValidIfsc,
  isValidMobileNumber,
  isValidUpiId,
  parsePayeeNote,
  searchPeople,
} from "./payment-contacts";
import type { Transaction } from "./finance/types";
import type { PaymentRequest } from "./payment-requests";

function txn(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t1",
    type: "expense",
    amountPaise: 50000,
    category: "others",
    note: "Aarav Sharma",
    dateISO: "2026-10-03",
    payMode: "upi_test",
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
    ...overrides,
  } as Transaction;
}

function request(overrides: Partial<PaymentRequest>): PaymentRequest {
  return {
    id: "r1",
    personName: "Meera",
    amountPaise: 20000,
    note: "",
    status: "pending",
    settledTxnId: null,
    createdAt: "2026-10-02T10:00:00.000Z",
    ...overrides,
  };
}

describe("parsePayeeNote", () => {
  it("parses plain UPI names", () => {
    expect(parsePayeeNote("upi_test", "Aarav Sharma")).toEqual({ name: "Aarav Sharma" });
  });

  it("parses UPI names with a user note", () => {
    expect(parsePayeeNote("upi_test", "Aarav Sharma · dinner split")).toEqual({
      name: "Aarav Sharma",
      userNote: "dinner split",
    });
  });

  it("parses bank transfer notes", () => {
    expect(parsePayeeNote("bank_test", "Bank transfer · Rohan Verma · A/c …4821")).toEqual({
      name: "Rohan Verma",
      detail: "A/c …4821",
    });
  });

  it("parses bank notes with a user note", () => {
    expect(
      parsePayeeNote("bank_test", "Bank transfer · Rohan Verma · A/c …4821 · rent oct"),
    ).toEqual({ name: "Rohan Verma", detail: "A/c …4821", userNote: "rent oct" });
  });

  it("rejects malformed notes", () => {
    expect(parsePayeeNote("upi_test", "")).toBeNull();
    expect(parsePayeeNote("bank_test", "Bank transfer ·  · A/c …4821")).toBeNull();
    expect(parsePayeeNote("bank_test", "Some random note")).toBeNull();
    expect(parsePayeeNote("UPI", "Aarav")).toBeNull();
  });
});

describe("note builders", () => {
  it("builds UPI notes with and without user notes", () => {
    expect(buildUpiNoteWithUserNote("Aarav")).toBe("Aarav");
    expect(buildUpiNoteWithUserNote("  Aarav  ", " dinner ")).toBe("Aarav · dinner");
  });

  it("builds bank notes with masked account tail", () => {
    expect(buildBankNote("Rohan", "50100234567891")).toBe("Bank transfer · Rohan · A/c …7891");
    expect(buildBankNote("Rohan", "5010 0234 5678", "rent")).toBe(
      "Bank transfer · Rohan · A/c …5678 · rent",
    );
  });

  it("round-trips through parsePayeeNote", () => {
    const note = buildBankNote("Rohan Verma", "123456789", "oct rent");
    expect(parsePayeeNote("bank_test", note)).toEqual({
      name: "Rohan Verma",
      detail: "A/c …6789",
      userNote: "oct rent",
    });
    const upi = buildUpiNoteWithUserNote("Aarav", "chai");
    expect(parsePayeeNote("upi_test", upi)).toEqual({ name: "Aarav", userNote: "chai" });
  });
});

describe("validators", () => {
  it("validates UPI IDs", () => {
    expect(isValidUpiId("aarav@okhdfcbank")).toBe(true);
    expect(isValidUpiId("98765.43210@upi")).toBe(true);
    expect(isValidUpiId("not-an-upi-id")).toBe(false);
    expect(isValidUpiId("a@b")).toBe(false);
    expect(isValidUpiId("")).toBe(false);
  });

  it("validates Indian mobile numbers", () => {
    expect(isValidMobileNumber("9876543210")).toBe(true);
    expect(isValidMobileNumber("98765 43210")).toBe(true);
    expect(isValidMobileNumber("5876543210")).toBe(false);
    expect(isValidMobileNumber("987654321")).toBe(false);
  });

  it("validates bank account numbers", () => {
    expect(isValidAccountNumber("50100234567891")).toBe(true);
    expect(isValidAccountNumber("123456789")).toBe(true);
    expect(isValidAccountNumber("12345678")).toBe(false);
    expect(isValidAccountNumber("1234567890123456789")).toBe(false);
    expect(isValidAccountNumber("ABC123456789")).toBe(false);
  });

  it("validates IFSC codes", () => {
    expect(isValidIfsc("HDFC0001234")).toBe(true);
    expect(isValidIfsc("hdfc0001234")).toBe(true);
    expect(isValidIfsc("HDFC001234")).toBe(false);
    expect(isValidIfsc("12340001234")).toBe(false);
  });
});

describe("extractPeople", () => {
  it("derives people from real payment activity only", () => {
    const people = extractPeople(
      [
        txn({ id: "a", note: "Aarav Sharma", createdAt: "2026-10-01T10:00:00Z" }),
        txn({
          id: "b",
          note: "Bank transfer · Rohan Verma · A/c …4821",
          payMode: "bank_test",
          createdAt: "2026-10-03T10:00:00Z",
        }),
        txn({ id: "c", note: "Aarav Sharma · dinner", createdAt: "2026-10-02T10:00:00Z" }),
        // Not a payment rail — must not create a person.
        txn({ id: "d", note: "Swiggy", payMode: "UPI", createdAt: "2026-10-03T11:00:00Z" }),
      ],
      [request({ personName: "Meera", createdAt: "2026-09-30T10:00:00Z" })],
    );
    expect(people.map((p) => p.name)).toEqual(["Rohan Verma", "Aarav Sharma", "Meera"]);
    expect(people[0]).toMatchObject({ rail: "bank", detail: "A/c …4821" });
    expect(people[1]).toMatchObject({ rail: "upi" });
    expect(people[2]).toMatchObject({ rail: "request" });
  });

  it("dedupes case-insensitively, keeping the latest interaction", () => {
    const people = extractPeople(
      [
        txn({ id: "a", note: "aarav sharma", createdAt: "2026-10-01T10:00:00Z" }),
        txn({ id: "b", note: "Aarav Sharma", createdAt: "2026-10-03T10:00:00Z" }),
      ],
      [],
    );
    expect(people).toHaveLength(1);
    expect(people[0]?.name).toBe("Aarav Sharma");
  });

  it("ignores refund transactions (no phantom 'Refund' person)", () => {
    const people = extractPeople(
      [
        txn({ id: "a", note: "Aarav Sharma", createdAt: "2026-10-01T10:00:00Z" }),
        txn({
          id: "r",
          type: "income",
          note: "Refund · Aarav Sharma",
          refundOf: "a",
          createdAt: "2026-10-03T10:00:00Z",
        }),
      ],
      [],
    );
    expect(people.map((p) => p.name)).toEqual(["Aarav Sharma"]);
  });

  it("returns empty when there is no activity", () => {
    expect(extractPeople([], [])).toEqual([]);
  });
});

describe("searchPeople", () => {
  const people = extractPeople(
    [
      txn({ id: "a", note: "Aarav Sharma", createdAt: "2026-10-01T10:00:00Z" }),
      txn({
        id: "b",
        note: "Bank transfer · Rohan Verma · A/c …4821",
        payMode: "bank_test",
        createdAt: "2026-10-03T10:00:00Z",
      }),
    ],
    [],
  );

  it("matches name and detail case-insensitively", () => {
    expect(searchPeople(people, "aarav")).toHaveLength(1);
    expect(searchPeople(people, "4821")).toHaveLength(1);
    expect(searchPeople(people, "")).toHaveLength(2);
    expect(searchPeople(people, "zzz")).toHaveLength(0);
  });
});
