import { describe, expect, it } from "vitest";

import {
  investmentReturnsPaise,
  monthlyCashFlowPaise,
  netWorthPaise,
  pctChange,
} from "./money-math";

describe("netWorthPaise", () => {
  it("sums cash + investments − liabilities", () => {
    expect(
      netWorthPaise({
        cashPaise: 100_000,
        investmentsPaise: 50_000,
        otherAssetsPaise: 20_000,
        liabilitiesPaise: 30_000,
      }),
    ).toBe(140_000);
  });
  it("works with only cash + investments", () => {
    expect(netWorthPaise({ cashPaise: 1_000, investmentsPaise: 2_000 })).toBe(3_000);
  });
  it("can go negative when liabilities dominate", () => {
    expect(
      netWorthPaise({ cashPaise: 10_000, investmentsPaise: 0, liabilitiesPaise: 50_000 }),
    ).toBe(-40_000);
  });
});

describe("investmentReturnsPaise", () => {
  it("is current value minus invested cost", () => {
    expect(investmentReturnsPaise(160_000, 150_000)).toBe(10_000);
    expect(investmentReturnsPaise(140_000, 150_000)).toBe(-10_000);
  });
});

describe("monthlyCashFlowPaise", () => {
  it("is income minus expenses", () => {
    expect(monthlyCashFlowPaise(85_000_00, 60_000_00)).toBe(25_000_00);
    expect(monthlyCashFlowPaise(40_000_00, 60_000_00)).toBe(-20_000_00);
  });
});

describe("pctChange", () => {
  it("computes change vs previous", () => {
    expect(pctChange(110, 100)).toBeCloseTo(10);
    expect(pctChange(90, 100)).toBeCloseTo(-10);
  });
  it("handles a zero base honestly", () => {
    expect(pctChange(0, 0)).toBe(0);
    expect(pctChange(50, 0)).toBeNull();
  });
});
