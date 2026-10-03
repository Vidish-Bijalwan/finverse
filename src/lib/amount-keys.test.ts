import { describe, expect, it } from "vitest";
import { applyBackspace, applyKey } from "./amount-keys";

describe("amount-keys", () => {
  it("registers rapid sequential taps without dropping digits", () => {
    // Simulates taps arriving faster than React re-renders: the component
    // feeds each tap the previous tap's result (via a ref mirror), so the
    // sequence must compose exactly like this loop.
    let digits = "";
    for (const k of ["5", "0", "0"]) digits = applyKey(digits, k);
    expect(digits).toBe("500");
    expect(parseInt(digits, 10)).toBe(500);
  });

  it("reproduces the reported bug scenario: fast 5,0,0 must yield 500 paise-digits", () => {
    // Before the fix, the component's stale render closure computed every
    // rapid tap from "" — the zeros hit the leading-zero guard and vanished,
    // registering only ₹5.
    const result = ["5", "0", "0"].reduce((d, k) => applyKey(d, k), "");
    expect(result).toBe("500");
  });

  it("handles the double-zero key in a rapid sequence", () => {
    let digits = "";
    for (const k of ["1", "00", "5"]) digits = applyKey(digits, k);
    expect(digits).toBe("1005");
  });

  it("rejects leading zeros", () => {
    expect(applyKey("", "0")).toBe("");
    expect(applyKey("", "00")).toBe("");
    expect(applyKey("", "5")).toBe("5");
    expect(applyKey("5", "0")).toBe("50");
  });

  it("caps at maxDigits", () => {
    expect(applyKey("1234567890", "1")).toBe("1234567890");
    expect(applyKey("1234567890", "1", 10)).toBe("1234567890");
    expect(applyKey("123456789", "1", 10)).toBe("1234567891");
  });

  it("backspace removes the last digit", () => {
    expect(applyBackspace("500")).toBe("50");
    expect(applyBackspace("5")).toBe("");
    expect(applyBackspace("")).toBe("");
  });
});
