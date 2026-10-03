import { describe, expect, it } from "vitest";

import { canAfford, overBalance } from "./afford";

describe("canAfford", () => {
  it("allows spending the exact balance", () => {
    expect(canAfford(100_000, 100_000)).toBe(true);
  });

  it("allows spending below the balance", () => {
    expect(canAfford(100_000, 99_999)).toBe(true);
  });

  it("blocks one paise over the balance", () => {
    expect(canAfford(100_000, 100_001)).toBe(false);
  });

  it("treats a zero amount as unaffordable (spend gates require a positive amount)", () => {
    expect(canAfford(100_000, 0)).toBe(false);
  });

  it("treats negative amounts as unaffordable", () => {
    expect(canAfford(100_000, -1)).toBe(false);
    expect(canAfford(100_000, -10_000)).toBe(false);
  });

  it("treats a negative balance as unaffordable", () => {
    expect(canAfford(-100, 50)).toBe(false);
    expect(canAfford(-1, 1)).toBe(false);
  });

  it("treats non-finite inputs as unaffordable", () => {
    expect(canAfford(Number.NaN, 100)).toBe(false);
    expect(canAfford(100, Number.NaN)).toBe(false);
    expect(canAfford(Number.POSITIVE_INFINITY, 100)).toBe(false);
    expect(canAfford(100, Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("handles boundary paise exactly (integer money, no float drift)", () => {
    expect(canAfford(1, 1)).toBe(true);
    expect(canAfford(1, 2)).toBe(false);
    expect(canAfford(0, 0)).toBe(false);
  });
});

describe("overBalance", () => {
  it("is the negation of canAfford", () => {
    expect(overBalance(100_000, 100_000)).toBe(false);
    expect(overBalance(100_000, 100_001)).toBe(true);
    expect(overBalance(0, 1)).toBe(true);
  });
});
