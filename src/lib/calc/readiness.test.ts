import { describe, expect, it } from "vitest";
import {
  annualizedVolatility,
  bandForScore,
  READINESS_WEIGHTS,
  scoreReadiness,
  type ReadinessAssessment,
  type ReadinessInputs,
} from "./readiness";

function baseInputs(overrides: Partial<ReadinessInputs> = {}): ReadinessInputs {
  return {
    emergencyMonths: 6,
    savingsRate: 0.2,
    totalDebtPaise: 0,
    annualIncomePaise: 72000000, // ₹7,20,000/yr (₹60,000/mo)
    discipline: { unbreached: 4, total: 4 },
    fixedCostRatio: 0.3,
    holdings: [
      { symbol: "RELIANCE", currentValuePaise: 5000000 },
      { symbol: "TCS", currentValuePaise: 5000000 },
      { symbol: "HDFCBANK", currentValuePaise: 5000000 },
      { symbol: "INFY", currentValuePaise: 5000000 },
    ],
    holdingVolatilities: [
      { symbol: "RELIANCE", volatility: 0.15, currentValuePaise: 5000000 },
      { symbol: "TCS", volatility: 0.15, currentValuePaise: 5000000 },
      { symbol: "HDFCBANK", volatility: 0.15, currentValuePaise: 5000000 },
      { symbol: "INFY", volatility: 0.15, currentValuePaise: 5000000 },
    ],
    ...overrides,
  };
}

function assessed(inputs: ReadinessInputs): ReadinessAssessment {
  const result = scoreReadiness(inputs);
  if (!result.available) throw new Error("expected an available assessment");
  return result;
}

describe("READINESS_WEIGHTS", () => {
  it("sums to 100 across the 7 merged factors", () => {
    const total = Object.values(READINESS_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    expect(Object.keys(READINESS_WEIGHTS)).toHaveLength(7);
  });

  it("uses the decided merged weights", () => {
    expect(READINESS_WEIGHTS).toEqual({
      emergency: 20,
      savings: 20,
      debt: 15,
      discipline: 10,
      fixed: 10,
      concentration: 15,
      volatility: 10,
    });
  });
});

describe("annualizedVolatility", () => {
  it("is zero for flat prices", () => {
    expect(annualizedVolatility(Array.from({ length: 30 }, () => 100))).toBe(0);
  });

  it("is zero for perfectly steady growth", () => {
    const closes: number[] = [];
    for (let i = 0; i < 30; i++) closes.push(100 * 1.01 ** i);
    expect(annualizedVolatility(closes)).toBeCloseTo(0, 10);
  });

  it("matches a hand-computed alternating series", () => {
    const closes: number[] = [];
    for (let i = 0; i < 40; i++) closes.push(i % 2 === 0 ? 100 : 110);
    // Daily log returns alternate ±ln(1.1); stddev × √252 = 1.5323.
    expect(annualizedVolatility(closes)).toBeCloseTo(1.5323, 3);
  });

  it("returns null with too little history", () => {
    expect(annualizedVolatility(Array.from({ length: 29 }, () => 100))).toBeNull();
  });

  it("returns null for non-positive closes", () => {
    const closes = Array.from({ length: 30 }, () => 100);
    closes[10] = 0;
    expect(annualizedVolatility(closes)).toBeNull();
  });
});

describe("bandForScore", () => {
  it.each([
    [0, "Not yet — protect cash first"],
    [29, "Not yet — protect cash first"],
    [30, "Build foundations first"],
    [49, "Build foundations first"],
    [50, "Almost ready"],
    [74, "Almost ready"],
    [75, "Ready to invest"],
    [100, "Ready to invest"],
  ])("scores %d as %s", (score, band) => {
    expect(bandForScore(score)).toBe(band);
  });
});

describe("scoreReadiness", () => {
  it("is reproducible: same inputs always give the same assessment", () => {
    const inputs = baseInputs();
    expect(scoreReadiness(inputs)).toEqual(scoreReadiness(inputs));
    expect(scoreReadiness(baseInputs())).toEqual(scoreReadiness(inputs));
  });

  it("scores a healthy user 99 (Ready to invest)", () => {
    const result = assessed(baseInputs());
    expect(result.score).toBe(99);
    expect(result.band).toBe("Ready to invest");
    expect(result.maxScore).toBe(100);
    expect(result.scale).toBe(100);
    expect(result.unavailableFactors).toEqual([]);
    // Four equal holdings: largest weight 25% → 15 × 0.75/0.80 = 14.1.
    const concentration = result.factors.find((factor) => factor.id === "concentration");
    expect(concentration?.points).toBe(14.1);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]?.factor).toBe("Portfolio concentration");
  });

  it("scores a perfect user 100 with no suggestions", () => {
    const holdings = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ITC"].map((symbol) => ({
      symbol,
      currentValuePaise: 4000000,
    }));
    const result = assessed(
      baseInputs({
        holdings,
        holdingVolatilities: holdings.map((holding) => ({
          ...holding,
          volatility: 0.1,
        })),
      }),
    );
    expect(result.score).toBe(100);
    expect(result.band).toBe("Ready to invest");
    expect(result.suggestions).toEqual([]);
  });

  it("scores a struggling user 0 (Not yet — protect cash first)", () => {
    const result = assessed(
      baseInputs({
        emergencyMonths: 0,
        savingsRate: -0.05,
        totalDebtPaise: 48000000,
        annualIncomePaise: 48000000,
        discipline: { unbreached: 0, total: 3 },
        fixedCostRatio: 0.65,
        holdings: [{ symbol: "RELIANCE", currentValuePaise: 10000000 }],
        holdingVolatilities: [{ symbol: "RELIANCE", volatility: 0.6, currentValuePaise: 10000000 }],
      }),
    );
    expect(result.score).toBe(0);
    expect(result.band).toBe("Not yet — protect cash first");
    expect(result.factors.every((factor) => factor.points === 0)).toBe(true);
  });

  it("scores a mid user 50 with the factors auditable", () => {
    const result = assessed(
      baseInputs({
        emergencyMonths: 3, // 20 × 3/6 = 10
        savingsRate: 0.1, // 20 × 0.1/0.2 = 10
        totalDebtPaise: 12000000, // ratio 0.2 of ₹6,00,000/yr → 15 × 0.8 = 12
        annualIncomePaise: 60000000,
        discipline: { unbreached: 3, total: 4 }, // 10 × 3/4 = 7.5
        fixedCostRatio: 0.45, // 10 × (0.6−0.45)/0.3 = 5
        holdings: [{ symbol: "RELIANCE", currentValuePaise: 10000000 }], // 100% → 0
        holdingVolatilities: [
          { symbol: "RELIANCE", volatility: 0.375, currentValuePaise: 10000000 },
        ], // 10 × (0.6−0.375)/0.45 = 5
      }),
    );
    // Earned 10 + 10 + 12 + 7.5 + 5 + 0 + 5 = 49.5 → round → 50.
    expect(result.score).toBe(50);
    expect(result.band).toBe("Almost ready");
    const byId = Object.fromEntries(result.factors.map((f) => [f.id, f.points]));
    expect(byId).toEqual({
      emergency: 10,
      savings: 10,
      debt: 12,
      discipline: 7.5,
      fixed: 5,
      concentration: 0,
      volatility: 5,
    });
  });

  it("normalizes over available factors when debt data is missing (never zero)", () => {
    const result = assessed(baseInputs({ totalDebtPaise: null }));
    expect(result.maxScore).toBe(85);
    expect(result.unavailableFactors).toEqual(["Debt-to-income"]);
    // Earned 99.1 − 15 (debt) = 84.1 over 85 → 99.
    expect(result.score).toBe(99);
    const debt = result.factors.find((factor) => factor.id === "debt");
    expect(debt?.available).toBe(false);
    expect(debt?.points).toBe(0);
  });

  it("scores 100 when every available factor is full, even with debt missing", () => {
    const holdings = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ITC"].map((symbol) => ({
      symbol,
      currentValuePaise: 4000000,
    }));
    const result = assessed(
      baseInputs({
        totalDebtPaise: null,
        holdings,
        holdingVolatilities: holdings.map((holding) => ({
          ...holding,
          volatility: 0.1,
        })),
      }),
    );
    expect(result.maxScore).toBe(85);
    expect(result.score).toBe(100);
  });

  it("treats a missing emergency goal as unavailable, not zero", () => {
    const result = assessed(baseInputs({ emergencyMonths: null }));
    const emergency = result.factors.find((factor) => factor.id === "emergency");
    expect(emergency?.available).toBe(false);
    expect(result.maxScore).toBe(80);
    expect(result.unavailableFactors).toContain("Emergency-fund coverage");
  });

  it("treats no budgets as unavailable, not zero (old code scored 0)", () => {
    const result = assessed(baseInputs({ discipline: null }));
    const discipline = result.factors.find((factor) => factor.id === "discipline");
    expect(discipline?.available).toBe(false);
    expect(result.maxScore).toBe(90);
  });

  it("treats no income as unavailable for savings and fixed costs", () => {
    const result = assessed(baseInputs({ savingsRate: null, fixedCostRatio: null }));
    expect(result.factors.find((f) => f.id === "savings")?.available).toBe(false);
    expect(result.factors.find((f) => f.id === "fixed")?.available).toBe(false);
    expect(result.maxScore).toBe(70);
  });

  it("treats no holdings as unavailable for concentration and volatility", () => {
    const result = assessed(baseInputs({ holdings: [], holdingVolatilities: [] }));
    expect(result.factors.find((f) => f.id === "concentration")?.available).toBe(false);
    expect(result.factors.find((f) => f.id === "volatility")?.available).toBe(false);
    // A cash-flow-only score still works: emergency + savings + debt + discipline + fixed.
    expect(result.maxScore).toBe(75);
    expect(result.score).toBe(100);
  });

  it("returns unavailable when nothing can be measured", () => {
    const result = scoreReadiness(
      baseInputs({
        emergencyMonths: null,
        savingsRate: null,
        totalDebtPaise: null,
        discipline: null,
        fixedCostRatio: null,
        holdings: [],
        holdingVolatilities: [],
      }),
    );
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.missing).toHaveLength(7);
    }
  });

  it("scores debt linearly: half a year's income of debt earns half the factor", () => {
    const result = assessed(baseInputs({ totalDebtPaise: 36000000, annualIncomePaise: 72000000 }));
    const debt = result.factors.find((factor) => factor.id === "debt");
    expect(debt?.points).toBe(7.5);
    expect(debt?.debtToIncomeRatio).toBe(0.5);
  });
});
