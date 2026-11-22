import { describe, expect, it } from "vitest";
import {
  efficientFrontier,
  logReturns,
  maxSharpeWeights,
  minVarianceWeights,
  returnsStats,
  sharpeRatio,
  solveLinearSystem,
} from "./optimization";

// Two-asset case with a closed-form answer. Returns:
//   A: [0.10, 0.20, 0.15] → mean 0.15, sample variance 0.0025
//   B: [0.06, 0.04, 0.08] → mean 0.06, sample variance 0.0004
// Covariance: −0.0005. With rf = 0 the tangency weights are 2/7 and 5/7,
// the portfolio mean is 0.0857, volatility 0.014286, Sharpe exactly 6.
const seriesA = [0.1, 0.2, 0.15];
const seriesB = [0.06, 0.04, 0.08];
const means = [0.15, 0.06];
const covariance = [
  [0.0025, -0.0005],
  [-0.0005, 0.0004],
];

describe("logReturns", () => {
  it("takes natural log price ratios", () => {
    const values = logReturns([100, 110, 121]);
    expect(values[0]).toBeCloseTo(Math.log(1.1), 9);
    expect(values[1]).toBeCloseTo(Math.log(1.1), 9);
    expect(() => logReturns([100, 0])).toThrow(RangeError);
    expect(() => logReturns([100, -5])).toThrow(RangeError);
  });

  it("returns an empty array for zero or one price", () => {
    expect(logReturns([])).toEqual([]);
    expect(logReturns([100])).toEqual([]);
  });
});

describe("returnsStats", () => {
  it("computes annualised sample means and covariance", () => {
    const stats = returnsStats([seriesA, seriesB], 1);
    expect(stats).not.toBeNull();
    expect(stats!.means[0]).toBeCloseTo(0.15, 12);
    expect(stats!.means[1]).toBeCloseTo(0.06, 12);
    expect(stats!.covariance[0]![0]).toBeCloseTo(0.0025, 12);
    expect(stats!.covariance[1]![1]).toBeCloseTo(0.0004, 12);
    expect(stats!.covariance[0]![1]).toBeCloseTo(-0.0005, 12);
    expect(stats!.covariance[1]![0]).toBeCloseTo(-0.0005, 12);
    // Annualisation scales means by 252 and covariance by 252.
    const annual = returnsStats([seriesA, seriesB], 252);
    expect(annual).not.toBeNull();
    expect(annual!.means[0]).toBeCloseTo(0.15 * 252, 9);
    expect(annual!.covariance[0]![0]).toBeCloseTo(0.0025 * 252, 9);
  });

  it("returns null for unusable series", () => {
    expect(returnsStats([], 1)).toBeNull();
    expect(returnsStats([[0.1]], 1)).toBeNull();
    expect(returnsStats([[0.1, 0.2], [0.1]], 1)).toBeNull();
    expect(returnsStats([[0.1, Number.NaN]], 1)).toBeNull();
    expect(returnsStats([[0.1, 0.2]], 0)).toBeNull();
  });
});

describe("sharpeRatio", () => {
  it("is excess return per unit of risk", () => {
    expect(sharpeRatio(0.12, 0.2, 0.02)).toBeCloseTo(0.5, 12);
    expect(sharpeRatio(0.12, 0, 0.02)).toBeNull();
    expect(sharpeRatio(0.12, -0.2, 0.02)).toBeNull();
  });
});

describe("solveLinearSystem", () => {
  it("solves and reports singular systems", () => {
    expect(
      solveLinearSystem(
        [
          [2, 1],
          [1, 3],
        ],
        [5, 10],
      )!.map((v) => Math.round(v * 1e9) / 1e9),
    ).toEqual([1, 3]);
    expect(
      solveLinearSystem(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2],
      ),
    ).toBeNull();
  });

  it("rejects non-square matrices and mismatched vectors", () => {
    expect(() => solveLinearSystem([[1, 2]], [1, 2])).toThrow(RangeError);
    expect(() => solveLinearSystem([], [])).toThrow(RangeError);
    expect(() =>
      solveLinearSystem(
        [
          [1, 0],
          [0, 1],
        ],
        [1],
      ),
    ).toThrow(RangeError);
  });
});

describe("maxSharpeWeights", () => {
  it("matches the closed-form two-asset solution", () => {
    const result = maxSharpeWeights(means, covariance, 0);
    expect(result).not.toBeNull();
    expect(result!.weights[0]).toBeCloseTo(2 / 7, 9);
    expect(result!.weights[1]).toBeCloseTo(5 / 7, 9);
    expect(result!.weights[0]! + result!.weights[1]!).toBeCloseTo(1, 12);
    expect(result!.expectedReturn).toBeCloseTo(0.0857142857, 9);
    expect(result!.volatility).toBeCloseTo(0.0142857143, 9);
    expect(result!.sharpe).toBeCloseTo(6, 9);
    // The tangency Sharpe beats either asset alone (both are 3.0).
    expect(result!.sharpe!).toBeGreaterThan(sharpeRatio(0.15, 0.05, 0)!);
    expect(result!.sharpe!).toBeGreaterThan(sharpeRatio(0.06, 0.02, 0)!);
  });

  it("accounts for the risk-free rate", () => {
    // rf = 0.03: excess means 0.12 and 0.03 → weights 7/22 and 15/22.
    const result = maxSharpeWeights(means, covariance, 0.03);
    expect(result).not.toBeNull();
    expect(result!.weights[0]).toBeCloseTo(7 / 22, 9);
    expect(result!.weights[1]).toBeCloseTo(15 / 22, 9);
  });

  it("is long-only and returns null without excess return", () => {
    // A dominates B so strongly the unconstrained solution shorts B.
    const result = maxSharpeWeights(
      [0.3, 0.01],
      [
        [0.01, 0.009],
        [0.009, 0.01],
      ],
      0,
    );
    expect(result).not.toBeNull();
    expect(result!.weights.every((w) => w >= 0)).toBe(true);
    expect(result!.weights[0]! + result!.weights[1]!).toBeCloseTo(1, 12);
    // No asset beats the risk-free rate: nothing to allocate to.
    expect(maxSharpeWeights([0.01, 0.02], covariance, 0.05)).toBeNull();
    // A singular covariance matrix yields null, not a fabricated answer.
    expect(
      maxSharpeWeights(
        [0.1, 0.1],
        [
          [0.01, 0.01],
          [0.01, 0.01],
        ],
        0,
      ),
    ).toBeNull();
  });

  it("handles a single asset", () => {
    const result = maxSharpeWeights([0.1], [[0.04]], 0.02);
    expect(result).not.toBeNull();
    expect(result!.weights).toEqual([1]);
    expect(result!.sharpe).toBeCloseTo(0.4, 12);
    expect(maxSharpeWeights([0.01], [[0.04]], 0.02)).toBeNull();
  });
});

describe("minVarianceWeights", () => {
  it("beats each asset on volatility", () => {
    const result = minVarianceWeights(means, covariance, 0);
    expect(result).not.toBeNull();
    expect(result!.weights[0]! + result!.weights[1]!).toBeCloseTo(1, 12);
    expect(result!.weights.every((w) => w >= 0)).toBe(true);
    // Min-variance volatility is below either asset's own volatility.
    expect(result!.volatility).toBeLessThan(0.05);
    expect(result!.volatility).toBeLessThan(0.02);
  });

  it("handles a single asset", () => {
    const result = minVarianceWeights([0.1], [[0.04]], 0.02);
    expect(result).not.toBeNull();
    expect(result!.weights).toEqual([1]);
    expect(result!.volatility).toBeCloseTo(0.2, 12);
  });
});

describe("efficientFrontier", () => {
  it("returns a valid risk-return curve", () => {
    const frontier = efficientFrontier(means, covariance, 0, 6);
    expect(frontier).toHaveLength(6);
    for (const point of frontier) {
      expect(point.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
      expect(point.weights.every((w) => w >= -1e-12)).toBe(true);
      expect(point.volatility).toBeGreaterThanOrEqual(0);
    }
    // Sorted by rising volatility; on the efficient (upper) branch, returns
    // rise with volatility.
    for (let i = 1; i < frontier.length; i++) {
      expect(frontier[i]!.volatility).toBeGreaterThanOrEqual(frontier[i - 1]!.volatility - 1e-12);
      expect(frontier[i]!.expectedReturn).toBeGreaterThanOrEqual(
        frontier[i - 1]!.expectedReturn - 1e-12,
      );
    }
    // The frontier starts at the minimum-variance portfolio.
    const minVar = minVarianceWeights(means, covariance, 0);
    expect(minVar).not.toBeNull();
    expect(frontier[0]!.volatility).toBeCloseTo(minVar!.volatility, 9);
    expect(frontier[0]!.expectedReturn).toBeCloseTo(minVar!.expectedReturn, 9);
  });

  it("rejects fewer than two points", () => {
    expect(() => efficientFrontier(means, covariance, 0, 1)).toThrow(RangeError);
  });
});
