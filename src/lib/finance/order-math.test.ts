import { describe, expect, it } from "vitest";
import { applyOrderToHolding } from "./order-math";

describe("applyOrderToHolding", () => {
  it("buy with no holding creates the position (QA: BUY INFY × 2 @ 152200 paise)", () => {
    expect(applyOrderToHolding(undefined, "buy", 2, 152200, "INFY")).toEqual({
      qty: 2,
      avgPricePaise: 152200,
    });
  });

  it("buy-existing computes the weighted average", () => {
    // 10 @ 100000 + 10 @ 120000 -> 20 @ 110000
    expect(
      applyOrderToHolding({ qty: 10, avgPricePaise: 100000 }, "buy", 10, 120000, "INFY"),
    ).toEqual({ qty: 20, avgPricePaise: 110000 });
  });

  it("buy-existing rounds the weighted average", () => {
    // (2*100 + 1*101) / 3 = 100.333… -> 100
    expect(applyOrderToHolding({ qty: 2, avgPricePaise: 100 }, "buy", 1, 101, "INFY")).toEqual({
      qty: 3,
      avgPricePaise: 100,
    });
  });

  it("sell-partial reduces qty, average unchanged", () => {
    expect(
      applyOrderToHolding({ qty: 10, avgPricePaise: 100000 }, "sell", 4, 120000, "INFY"),
    ).toEqual({ qty: 6, avgPricePaise: 100000 });
  });

  it("sell-all returns null (caller deletes the row)", () => {
    expect(
      applyOrderToHolding({ qty: 10, avgPricePaise: 100000 }, "sell", 10, 120000, "INFY"),
    ).toBeNull();
  });

  it("oversell throws with the holdings message", () => {
    expect(() =>
      applyOrderToHolding({ qty: 3, avgPricePaise: 100000 }, "sell", 5, 120000, "INFY"),
    ).toThrow("You hold 3 × INFY — reduce the quantity to place this sell.");
  });

  it("sell with no holding throws", () => {
    expect(() => applyOrderToHolding(undefined, "sell", 1, 120000, "INFY")).toThrow(
      "You hold 0 × INFY",
    );
  });

  it("qty <= 0 throws", () => {
    expect(() => applyOrderToHolding(undefined, "buy", 0, 120000, "INFY")).toThrow(
      "Quantity must be at least 1.",
    );
    expect(() => applyOrderToHolding(undefined, "buy", -2, 120000, "INFY")).toThrow(
      "Quantity must be at least 1.",
    );
  });

  it("price <= 0 throws", () => {
    expect(() => applyOrderToHolding(undefined, "buy", 1, 0, "INFY")).toThrow(
      "Price must be greater than zero.",
    );
    expect(() => applyOrderToHolding(undefined, "buy", 1, -50, "INFY")).toThrow(
      "Price must be greater than zero.",
    );
  });

  it("floors fractional qty and rounds fractional price before applying", () => {
    // 2.9 -> 2 units @ Math.round(152200.4) = 152200
    expect(applyOrderToHolding(undefined, "buy", 2.9, 152200.4, "INFY")).toEqual({
      qty: 2,
      avgPricePaise: 152200,
    });
  });
});
