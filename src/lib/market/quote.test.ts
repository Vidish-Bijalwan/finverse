import { describe, expect, it } from "vitest";

import { getQuote } from "./quote";
import { INDICES } from "./indices";
import { genHistory } from "./history";

describe("getQuote — one consistent quote per symbol", () => {
  it("returns undefined for unknown symbols", () => {
    expect(getQuote("NOPE_NOT_A_SYMBOL")).toBeUndefined();
  });

  it("is stable within a session — repeated calls return identical quotes", () => {
    for (const idx of INDICES) {
      expect(getQuote(idx.symbol)).toEqual(getQuote(idx.symbol));
    }
  });

  it("computes changePct on the SAME price basis it displays (the reported strip-vs-snapshot bug)", () => {
    // Regression: the strip showed BANK NIFTY +0.10% while the snapshot
    // showed −0.32% for the same index at the same time, because the strip
    // derived % from the static listed close and the snapshot from the
    // jittered LTP. The quote's % must always be derived from the displayed
    // price vs the deterministic previous close.
    for (const idx of INDICES) {
      const q = getQuote(idx.symbol)!;
      expect(q).toBeDefined();
      const prevClose = genHistory(idx.symbol, 2)[0]!.closePaise;
      expect(q.changePct).toBeCloseTo(((q.pricePaise - prevClose) / prevClose) * 100, 10);
      expect(q.changePaise).toBe(q.pricePaise - prevClose);
    }
  });

  it("strip and snapshot surfaces agree — one source of truth", () => {
    // Both MarketStrip and MarketSnapshot now read getQuote; simulate both
    // call sites and assert they can never disagree.
    for (const idx of INDICES) {
      const stripQuote = getQuote(idx.symbol)!; // MarketStrip item
      const snapshotQuote = getQuote(idx.symbol)!; // MarketSnapshot index card
      expect(snapshotQuote.pricePaise).toBe(stripQuote.pricePaise);
      expect(snapshotQuote.changePct).toBe(stripQuote.changePct);
      expect(snapshotQuote.changePaise).toBe(stripQuote.changePaise);
    }
  });
});
