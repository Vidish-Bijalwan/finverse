import { describe, expect, it } from "vitest";
import {
  combineSeries,
  genIntraday,
  holdingTotals,
  longDateLabel,
  parseOrderNote,
  portfolioTotals,
  shortDateLabel,
  todayReturnPaise,
  RANGE_TRADING_DAYS,
  type HoldingTotals,
} from "./portfolio-math";

describe("holdingTotals", () => {
  it("invested = qty × avg price; value = qty × LTP; returns = value − invested", () => {
    expect(holdingTotals({ symbol: "INFY", qty: 10, avgPricePaise: 150000 }, 160000)).toEqual({
      symbol: "INFY",
      qty: 10,
      investedPaise: 1500000,
      valuePaise: 1600000,
      pnlPaise: 100000,
      pnlPct: (100000 / 1500000) * 100,
    });
  });

  it("handles a loss and rounds fractional paise", () => {
    const r = holdingTotals({ symbol: "X", qty: 3, avgPricePaise: 10001 }, 9999);
    expect(r.investedPaise).toBe(30003);
    expect(r.valuePaise).toBe(29997);
    expect(r.pnlPaise).toBe(-6);
    expect(r.pnlPct).toBeCloseTo((-6 / 30003) * 100, 10);
  });

  it("returns 0% when nothing is invested (no divide-by-zero)", () => {
    const r = holdingTotals({ symbol: "X", qty: 0, avgPricePaise: 0 }, 100);
    expect(r.pnlPaise).toBe(0);
    expect(r.pnlPct).toBe(0);
  });
});

describe("portfolioTotals", () => {
  const rows: HoldingTotals[] = [
    {
      symbol: "A",
      qty: 10,
      investedPaise: 100000,
      valuePaise: 110000,
      pnlPaise: 10000,
      pnlPct: 10,
    },
    {
      symbol: "B",
      qty: 5,
      investedPaise: 200000,
      valuePaise: 190000,
      pnlPaise: -10000,
      pnlPct: -5,
    },
  ];

  it("sums invested/value and derives returns from them", () => {
    expect(portfolioTotals(rows)).toEqual({
      investedPaise: 300000,
      valuePaise: 300000,
      pnlPaise: 0,
      pnlPct: 0,
    });
  });

  it("is the empty portfolio (0/0/0/0) with no holdings", () => {
    expect(portfolioTotals([])).toEqual({
      investedPaise: 0,
      valuePaise: 0,
      pnlPaise: 0,
      pnlPct: 0,
    });
  });
});

describe("todayReturnPaise", () => {
  it("is qty × (LTP − previous close), rounded", () => {
    expect(todayReturnPaise(10, 160050, 159900)).toBe(1500);
    expect(todayReturnPaise(10, 159800, 159900)).toBe(-1000);
    expect(todayReturnPaise(0, 1, 2)).toBe(0);
  });
});

describe("genIntraday", () => {
  it("starts exactly at the previous close and ends exactly at the LTP", () => {
    const pts = genIntraday("RELIANCE", 156000, 158000);
    expect(pts.length).toBe(78);
    expect(pts[0]!.valuePaise).toBe(156000);
    expect(pts[pts.length - 1]!.valuePaise).toBe(158000);
    expect(pts[0]!.label).toBe("09:15");
    expect(pts[pts.length - 1]!.label).toBe("15:30");
  });

  it("is deterministic per symbol + prices (SSR/client agreement)", () => {
    const a = genIntraday("HDFCBANK", 98000, 99000);
    const b = genIntraday("HDFCBANK", 98000, 99000);
    expect(a).toEqual(b);
    const c = genIntraday("HDFCBANK", 98000, 99050);
    expect(c).not.toEqual(a);
  });

  it("all values stay positive", () => {
    const pts = genIntraday("X", 100, 95);
    expect(pts.every((p) => p.valuePaise >= 1)).toBe(true);
  });
});

describe("combineSeries", () => {
  const series = {
    A: [
      { label: "D1", valuePaise: 10000 },
      { label: "D2", valuePaise: 11000 },
    ],
    B: [
      { label: "D1", valuePaise: 20000 },
      { label: "D2", valuePaise: 19000 },
    ],
  };

  it("zips aligned series into qty-weighted portfolio values", () => {
    expect(combineSeries(series, { A: 10, B: 5 })).toEqual([
      { label: "D1", valuePaise: 10 * 10000 + 5 * 20000 },
      { label: "D2", valuePaise: 10 * 11000 + 5 * 19000 },
    ]);
  });

  it("ignores symbols with no/zero qty", () => {
    expect(combineSeries(series, { A: 10 })).toEqual([
      { label: "D1", valuePaise: 100000 },
      { label: "D2", valuePaise: 110000 },
    ]);
  });

  it("returns [] with no positions", () => {
    expect(combineSeries(series, {})).toEqual([]);
  });

  it("throws on misaligned series", () => {
    expect(() =>
      combineSeries({ A: series.A, B: [{ label: "D1", valuePaise: 1 }] }, { A: 1, B: 1 }),
    ).toThrow(/misaligned/);
  });
});

describe("parseOrderNote", () => {
  it("parses BUY/SELL ledger notes written by usePlaceOrder", () => {
    expect(parseOrderNote("BUY RELIANCE × 10 @ ₹1,580")).toEqual({
      side: "buy",
      symbol: "RELIANCE",
      qty: 10,
    });
    expect(parseOrderNote("SELL INFY × 2 @ ₹1,520")).toEqual({
      side: "sell",
      symbol: "INFY",
      qty: 2,
    });
  });

  it("returns null for non-order notes (SIP posts, transfers, plain txns)", () => {
    expect(parseOrderNote("SIP RELIANCE")).toBeNull();
    expect(parseOrderNote("Grocery")).toBeNull();
    expect(parseOrderNote("")).toBeNull();
  });
});

describe("date labels", () => {
  it("shortDateLabel", () => {
    expect(shortDateLabel("2026-09-12")).toBe("12 Sep");
    expect(shortDateLabel("not-a-date")).toBe("not-a-date");
  });

  it("longDateLabel", () => {
    expect(longDateLabel("2026-09-12")).toBe("12 Sep 2026");
    expect(longDateLabel("x")).toBe("x");
  });
});

describe("RANGE_TRADING_DAYS", () => {
  it("covers every non-1D range", () => {
    for (const r of ["1W", "1M", "1Y", "ALL"] as const) {
      expect(RANGE_TRADING_DAYS[r]).toBeGreaterThan(0);
    }
    expect(RANGE_TRADING_DAYS["1W"]).toBeLessThan(RANGE_TRADING_DAYS["1M"]);
    expect(RANGE_TRADING_DAYS["1M"]).toBeLessThan(RANGE_TRADING_DAYS["1Y"]);
    expect(RANGE_TRADING_DAYS["1Y"]).toBeLessThan(RANGE_TRADING_DAYS["ALL"]);
  });
});
