import { describe, expect, it } from "vitest";
import { buildReceiptText } from "./payment-receipt";

describe("buildReceiptText", () => {
  it("renders a complete honest receipt", () => {
    const text = buildReceiptText({
      statusLabel: "Success",
      amountPaise: 50000,
      counterparty: "Aarav Sharma",
      railLabel: "UPI · Test",
      referenceId: "txn-123",
      timestamp: "3 Oct 2026, 2:30 pm",
      note: "dinner split",
    });
    expect(text).toContain("FinVerse AI");
    expect(text).toContain("Status:      Success");
    expect(text).toContain("₹500");
    expect(text).toContain("Paid to:     Aarav Sharma");
    expect(text).toContain("Rail:        UPI · Test");
    expect(text).toContain("Reference:   txn-123");
    expect(text).toContain("Note:        dinner split");
    expect(text).toContain("No real money moved.");
  });

  it("omits optional rows when absent", () => {
    const text = buildReceiptText({
      statusLabel: "Failed",
      amountPaise: 100,
      counterparty: "Rohan",
      railLabel: "Bank · Test",
    });
    expect(text).not.toContain("Reference:");
    expect(text).not.toContain("Note:");
    expect(text).toContain("No real money moved.");
  });
});
