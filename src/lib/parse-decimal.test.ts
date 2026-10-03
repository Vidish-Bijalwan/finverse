import { describe, expect, it } from "vitest";

import { parseStrictDecimal } from "./parse-decimal";

describe("parseStrictDecimal", () => {
  it("parses plain decimals", () => {
    expect(parseStrictDecimal("0")).toBe(0);
    expect(parseStrictDecimal("5000")).toBe(5000);
    expect(parseStrictDecimal("12.5")).toBe(12.5);
    expect(parseStrictDecimal("12.55")).toBe(12.55);
    expect(parseStrictDecimal("007")).toBe(7);
  });

  it("strips commas, ₹ and whitespace", () => {
    expect(parseStrictDecimal("1,00,000")).toBe(100000);
    expect(parseStrictDecimal("₹12,345.67")).toBe(12345.67);
    expect(parseStrictDecimal("  500 ")).toBe(500);
  });

  it("rejects exponent, hex and Infinity forms", () => {
    expect(parseStrictDecimal("1e5")).toBeNaN();
    expect(parseStrictDecimal("1E5")).toBeNaN();
    expect(parseStrictDecimal("0x10")).toBeNaN();
    expect(parseStrictDecimal("0b101")).toBeNaN();
    expect(parseStrictDecimal("0o17")).toBeNaN();
    expect(parseStrictDecimal("Infinity")).toBeNaN();
  });

  it("rejects signs, garbage, empties and partial input", () => {
    expect(parseStrictDecimal("")).toBeNaN();
    expect(parseStrictDecimal("   ")).toBeNaN();
    expect(parseStrictDecimal("-5")).toBeNaN();
    expect(parseStrictDecimal("+5")).toBeNaN();
    expect(parseStrictDecimal("12abc")).toBeNaN();
    expect(parseStrictDecimal("abc12")).toBeNaN();
    expect(parseStrictDecimal("12.")).toBeNaN();
    expect(parseStrictDecimal(".5")).toBeNaN();
    expect(parseStrictDecimal(".")).toBeNaN();
    expect(parseStrictDecimal("NaN")).toBeNaN();
  });

  it("rejects more than 2 decimal places instead of silently rounding", () => {
    expect(parseStrictDecimal("12.345")).toBeNaN();
    expect(parseStrictDecimal("0.001")).toBeNaN();
  });

  it("rejects multiple dots and separators", () => {
    expect(parseStrictDecimal("12.3.4")).toBeNaN();
    expect(parseStrictDecimal("1,,000")).toBe(1000); // commas are stripped, then valid
  });
});
