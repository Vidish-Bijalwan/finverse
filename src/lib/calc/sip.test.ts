import { describe, expect, it } from "vitest";
import { calcSip, sipGrowthSeries, validateSip } from "./sip";

describe("calcSip — annuity-due (payment at start of month)", () => {
  it("matches the hand-computed formula for ₹10k/mo @ 12% for 10y", () => {
    // i = 0.01, n = 120: FV = 10000 * ((1.01^120 − 1)/0.01) * 1.01
    //                    = 10000 * 230.03868906 * 1.01
    //                    ≈ ₹23,23,390.76
    const r = calcSip({ monthlyAmount: 10000, annualRatePct: 12, years: 10 });
    expect(r.invested).toBe(10000 * 120);
    expect(r.maturity).toBeCloseTo(2323390.76, 1);
    expect(r.gains).toBeCloseTo(r.maturity - r.invested, 6);
    expect(r.gains).toBeGreaterThan(0);
  });

  it("returns invested when the rate is 0%", () => {
    const r = calcSip({ monthlyAmount: 5000, annualRatePct: 0, years: 5 });
    expect(r.invested).toBe(300000);
    expect(r.maturity).toBe(300000);
    expect(r.gains).toBe(0);
  });

  it("returns zeros for non-positive inputs", () => {
    expect(calcSip({ monthlyAmount: 0, annualRatePct: 12, years: 10 })).toEqual({
      invested: 0,
      maturity: 0,
      gains: 0,
    });
    expect(calcSip({ monthlyAmount: 1000, annualRatePct: 12, years: 0 })).toEqual({
      invested: 0,
      maturity: 0,
      gains: 0,
    });
  });

  it("grows monotonically with tenure and rate", () => {
    const base = calcSip({ monthlyAmount: 10000, annualRatePct: 12, years: 5 });
    const longer = calcSip({ monthlyAmount: 10000, annualRatePct: 12, years: 10 });
    const higher = calcSip({ monthlyAmount: 10000, annualRatePct: 15, years: 5 });
    expect(longer.maturity).toBeGreaterThan(base.maturity);
    expect(higher.maturity).toBeGreaterThan(base.maturity);
  });
});

describe("sipGrowthSeries", () => {
  it("returns one point per year with rising invested/value", () => {
    const points = sipGrowthSeries({ monthlyAmount: 10000, annualRatePct: 12, years: 3 });
    expect(points).toHaveLength(3);
    expect(points.map((p) => p.year)).toEqual([1, 2, 3]);
    const first = points[0];
    const second = points[1];
    const third = points[2];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();
    expect(first).toEqual({ year: 1, invested: 120000, value: first!.value });
    expect(third!.invested).toBe(360000);
    expect(third!.value).toBeGreaterThan(second!.value);
    expect(second!.value).toBeGreaterThan(first!.value);
  });
});

describe("validateSip", () => {
  it("accepts a sane input", () => {
    expect(validateSip({ monthlyAmount: 10000, annualRatePct: 12, years: 10 })).toBeNull();
  });

  it("rejects bad inputs with a message", () => {
    expect(validateSip({ monthlyAmount: -5, annualRatePct: 12, years: 10 })).toContain("₹0");
    expect(validateSip({ monthlyAmount: 10000, annualRatePct: -1, years: 10 })).toContain(
      "negative",
    );
    expect(validateSip({ monthlyAmount: 10000, annualRatePct: 12, years: 0 })).toContain("Tenure");
  });
});
