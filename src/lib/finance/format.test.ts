import { describe, expect, it } from "vitest";
import { formatINR, formatINRShort } from "./format";

describe("formatINR (paise → ₹, Indian grouping)", () => {
  it("formats paise with Indian digit grouping", () => {
    expect(formatINR(84231000)).toBe("₹8,42,310");
  });

  it("formats zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });

  it("rounds non-integer paise to the nearest rupee", () => {
    expect(formatINR(1049)).toBe("₹10");
    expect(formatINR(1050)).toBe("₹11");
  });

  it("groups large amounts Indian-style (lakh/crore separators)", () => {
    expect(formatINR(1000000000)).toBe("₹1,00,00,000");
    expect(formatINR(99900)).toBe("₹999");
    expect(formatINR(100000)).toBe("₹1,000");
  });

  it("throws on non-finite input", () => {
    expect(() => formatINR(NaN)).toThrow("formatINR");
    expect(() => formatINR(Infinity)).toThrow("formatINR");
  });
});

describe("formatINRShort (Indian units K / L / Cr)", () => {
  it("shows rupees for amounts below ₹1,000", () => {
    expect(formatINRShort(95000)).toBe("₹950");
    expect(formatINRShort(0)).toBe("₹0");
  });

  it("uses K for thousands", () => {
    expect(formatINRShort(100000)).toBe("₹1K");
    expect(formatINRShort(150000)).toBe("₹1.5K");
    expect(formatINRShort(9990000)).toBe("₹99.9K");
  });

  it("uses L for lakhs", () => {
    expect(formatINRShort(84000000)).toBe("₹8.4L");
    expect(formatINRShort(10000000)).toBe("₹1L");
    expect(formatINRShort(100000000)).toBe("₹10L");
  });

  it("uses Cr for crores", () => {
    expect(formatINRShort(1000000000)).toBe("₹1Cr");
    expect(formatINRShort(2500000000)).toBe("₹2.5Cr");
  });

  it("prefixes a single minus sign for negatives", () => {
    expect(formatINRShort(-84000000)).toBe("-₹8.4L");
    expect(formatINRShort(-50000)).toBe("-₹500");
  });

  it("throws on non-finite input", () => {
    expect(() => formatINRShort(NaN)).toThrow("formatINRShort");
    expect(() => formatINRShort(Infinity)).toThrow("formatINRShort");
  });
});
