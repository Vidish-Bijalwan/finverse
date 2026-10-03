import { describe, expect, it } from "vitest";

import { parseUpiPayload, upiAmountToPaise } from "./upi-qr";

describe("upiAmountToPaise", () => {
  it("converts rupees to paise", () => {
    expect(upiAmountToPaise("500")).toBe(50000);
    expect(upiAmountToPaise("10.50")).toBe(1050);
    expect(upiAmountToPaise("0.5")).toBe(50);
  });
  it("rejects malformed amounts", () => {
    expect(upiAmountToPaise(null)).toBeNull();
    expect(upiAmountToPaise("")).toBeNull();
    expect(upiAmountToPaise("abc")).toBeNull();
    expect(upiAmountToPaise("10.555")).toBeNull();
    expect(upiAmountToPaise("0")).toBeNull();
  });
});

describe("parseUpiPayload", () => {
  it("parses a full pay intent", () => {
    const p = parseUpiPayload(
      "upi://pay?pa=merchant@okhdfcbank&pn=Corner%20Store&am=250.50&cu=INR",
    );
    expect(p).toEqual({ upiId: "merchant@okhdfcbank", name: "Corner Store", amountPaise: 25050 });
  });
  it("accepts an open-amount QR (no am param)", () => {
    const p = parseUpiPayload("upi://pay?pa=cafe@upi&pn=Cafe");
    expect(p?.amountPaise).toBeNull();
    expect(p?.upiId).toBe("cafe@upi");
  });
  it("rejects non-UPI text", () => {
    expect(parseUpiPayload("https://example.com")).toBeNull();
    expect(parseUpiPayload("upi://pay?pa=not-an-upi-id")).toBeNull();
  });
  it("rejects non-INR currency", () => {
    expect(parseUpiPayload("upi://pay?pa=a@upi&cu=USD")).toBeNull();
  });
  it("rejects collect intents without a valid pa", () => {
    expect(parseUpiPayload("upi://collect?pn=Someone")).toBeNull();
  });
});
