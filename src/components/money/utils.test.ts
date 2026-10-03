import { describe, expect, it } from "vitest";

import { paiseToRupees, rupeesToPaise } from "./utils";

describe("rupeesToPaise (strict)", () => {
  it("parses formatted rupee strings", () => {
    expect(rupeesToPaise("5000")).toBe(500000);
    expect(rupeesToPaise("₹12,345.67")).toBe(1234567);
    expect(rupeesToPaise("  99.9 ")).toBe(9990);
    expect(rupeesToPaise("0.05")).toBe(5);
  });

  it("rejects loose Number() forms instead of coercing them", () => {
    expect(rupeesToPaise("1e5")).toBeNaN();
    expect(rupeesToPaise("0x10")).toBeNaN();
    expect(rupeesToPaise("12.345")).toBeNaN(); // no silent rounding
    expect(rupeesToPaise("12abc")).toBeNaN();
    expect(rupeesToPaise("")).toBeNaN();
    expect(rupeesToPaise("-5")).toBeNaN();
  });
});

describe("paiseToRupees", () => {
  it("round-trips whole and fractional amounts", () => {
    expect(paiseToRupees(500000)).toBe("5000");
    expect(paiseToRupees(1234567)).toBe("12345.67");
  });
});
