/**
 * Markowitz mean-variance optimisation and the Sharpe ratio (synopsis
 * Eq. 4.1). Pure functions, tested against the closed-form two-asset
 * solution (see optimization.test.ts).
 *
 * METHOD (closed-form, no grid or random search): the maximum-Sharpe
 * (tangency) portfolio is weights ∝ Σ⁻¹(μ − rf·1), the minimum-variance
 * portfolio is weights ∝ Σ⁻¹·1, and each efficient-frontier point is the
 * minimum-variance portfolio at a target return, solved exactly via its
 * KKT system. All three solve linear systems by Gaussian elimination with
 * partial pivoting (`solveLinearSystem`). The risk-free rate enters only
 * through the excess returns μ − rf·1 (tangency) and the Sharpe numerator
 * (return − rf) / volatility; it does not affect the minimum-variance
 * weights or the frontier shape.
 *
 * UNITS: means, covariance entries, and the risk-free rate are annualised
 * decimals (0.1 = 10%); returns from `logReturns` are per-period decimals.
 * Prices passed to `logReturns` are plain numbers, NOT paise.
 *
 * Portfolios are long-only: negative weights from the unconstrained
 * tangency solution are clipped to zero and the rest renormalised, which
 * is documented on each result. A singular covariance matrix (too little
 * history, or perfectly correlated assets) yields `null` instead of a
 * fabricated allocation.
 *
 * Ported from the old FinVerse repo (apps/web/lib/optimization.ts) with
 * the same algorithm and edge-case behaviour.
 */

export interface ReturnsStats {
  /** Annualised mean return per asset. */
  means: number[];
  /** Annualised sample covariance matrix (n × n). */
  covariance: number[][];
}

export interface PortfolioStats {
  weights: number[];
  expectedReturn: number;
  volatility: number;
  /** Null when volatility is zero (a riskless portfolio has no Sharpe). */
  sharpe: number | null;
}

export interface FrontierPoint extends PortfolioStats {
  targetReturn: number;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Log returns: ln(close[i] / close[i-1]).
 *
 * @param closes - Closing prices, oldest first (plain numbers, not paise);
 *   every price must be positive.
 * @returns Per-period log returns (decimals); length is `closes.length - 1`.
 * @throws RangeError when any price is not positive.
 */
export function logReturns(closes: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    // Loop bounds prove the indices in range; `!` marks that.
    const current = closes[i]!;
    const previous = closes[i - 1]!;
    if (current <= 0 || previous <= 0) {
      throw new RangeError("Prices must be positive to compute returns.");
    }
    returns.push(Math.log(current / previous));
  }
  return returns;
}

/**
 * Annualised means and sample covariance from aligned per-asset return
 * series (each series is one asset's returns over the same periods).
 * Returns null when the series are too short or misaligned.
 *
 * @param series - One return series per asset; all series must have the
 *   same length (>= 2) and contain only finite numbers.
 * @param periodsPerYear - Trading periods per year; defaults to 252.
 *   Means scale by this factor, covariance by the same factor.
 * @returns Annualised means and sample covariance, or null.
 */
export function returnsStats(series: number[][], periodsPerYear = 252): ReturnsStats | null {
  if (
    !Array.isArray(series) ||
    series.length === 0 ||
    !Number.isFinite(periodsPerYear) ||
    periodsPerYear <= 0
  ) {
    return null;
  }
  const n = series.length;
  const m = series[0]!.length;
  if (m < 2) return null;
  for (const asset of series) {
    if (!Array.isArray(asset) || asset.length !== m) return null;
    for (const value of asset) {
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
    }
  }
  const rawMeans = series.map((asset) => mean(asset));
  const means = rawMeans.map((mu) => mu * periodsPerYear);
  const covariance: number[][] = [];
  for (let i = 0; i < n; i++) {
    const rowI = series[i]!;
    const meanI = rawMeans[i]!;
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      const rowJ = series[j]!;
      const meanJ = rawMeans[j]!;
      let sum = 0;
      for (let k = 0; k < m; k++) {
        sum += (rowI[k]! - meanI) * (rowJ[k]! - meanJ);
      }
      row.push((sum / (m - 1)) * periodsPerYear);
    }
    covariance.push(row);
  }
  return { means, covariance };
}

/**
 * Sharpe ratio: excess return per unit of risk. Null at zero volatility.
 *
 * @param expectedReturn - Annualised expected return (decimal).
 * @param volatility - Annualised volatility (decimal); must be > 0.
 * @param riskFreeRate - Annualised risk-free rate (decimal).
 * @returns (expectedReturn − riskFreeRate) / volatility, or null when
 *   volatility is zero or negative.
 */
export function sharpeRatio(
  expectedReturn: number,
  volatility: number,
  riskFreeRate: number,
): number | null {
  if (volatility <= 0) return null;
  return (expectedReturn - riskFreeRate) / volatility;
}

function checkSquare(matrix: number[][], label: string) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new RangeError(`${label} must be a non-empty square matrix.`);
  }
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== matrix.length) {
      throw new RangeError(`${label} must be a non-empty square matrix.`);
    }
    for (const value of row) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(`${label} must contain finite numbers.`);
      }
    }
  }
}

/**
 * Solves A·x = b by Gaussian elimination with partial pivoting.
 * Returns null when A is singular (a pivot collapses to zero).
 *
 * @param matrix - Non-empty square matrix of finite numbers.
 * @param vector - Right-hand side; must match the matrix size.
 * @returns The solution vector, or null when the matrix is singular.
 */
export function solveLinearSystem(matrix: number[][], vector: number[]): number[] | null {
  checkSquare(matrix, "The matrix");
  const n = matrix.length;
  if (!Array.isArray(vector) || vector.length !== n) {
    throw new RangeError("The vector must match the matrix size.");
  }
  // Augment and eliminate. Every index below is proven in range by the
  // square-matrix check and the loop bounds; `!` marks that.
  const a = matrix.map((row, i) => [...row, vector[i]!]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row]![col]!) > Math.abs(a[pivot]![col]!)) pivot = row;
    }
    if (Math.abs(a[pivot]![col]!) < 1e-12) return null;
    if (pivot !== col) {
      const temp = a[col]!;
      a[col] = a[pivot]!;
      a[pivot] = temp;
    }
    for (let row = col + 1; row < n; row++) {
      const target = a[row]!;
      const source = a[col]!;
      const factor = target[col]! / source[col]!;
      for (let k = col; k <= n; k++) {
        target[k] = target[k]! - factor * source[k]!;
      }
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    const rowValues = a[row]!;
    let sum = rowValues[n]!;
    for (let k = row + 1; k < n; k++) sum -= rowValues[k]! * x[k]!;
    x[row] = sum / rowValues[row]!;
  }
  return x;
}

function portfolioReturn(weights: number[], means: number[]): number {
  return weights.reduce((sum, w, i) => sum + w * means[i]!, 0);
}

function portfolioVariance(weights: number[], covariance: number[][]): number {
  let total = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      total += weights[i]! * weights[j]! * covariance[i]![j]!;
    }
  }
  return Math.max(0, total);
}

/**
 * Expected return, volatility and Sharpe ratio for a given weight vector
 * — used to compare the current portfolio with the optimiser's suggestion.
 *
 * @param weights - Portfolio weights (one per asset).
 * @param means - Annualised mean return per asset (decimals).
 * @param covariance - Annualised covariance matrix (n × n).
 * @param riskFreeRate - Annualised risk-free rate (decimal).
 * @returns Weights plus expected return, volatility, and Sharpe (null at
 *   zero volatility).
 */
export function portfolioStats(
  weights: number[],
  means: number[],
  covariance: number[][],
  riskFreeRate: number,
): PortfolioStats {
  const expectedReturn = portfolioReturn(weights, means);
  const volatility = Math.sqrt(portfolioVariance(weights, covariance));
  return {
    weights,
    expectedReturn,
    volatility,
    sharpe: sharpeRatio(expectedReturn, volatility, riskFreeRate),
  };
}

/** Clips negative weights to zero and renormalises to sum 1. */
function longOnly(weights: number[]): number[] | null {
  const clipped = weights.map((w) => Math.max(0, w));
  const total = clipped.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return null;
  return clipped.map((w) => w / total);
}

/**
 * The maximum-Sharpe (tangency) portfolio: weights proportional to
 * Σ⁻¹(μ − rf·1), clipped to long-only. Returns null when the covariance
 * matrix is singular or no asset beats the risk-free rate.
 *
 * @param means - Annualised mean return per asset (decimals).
 * @param covariance - Annualised covariance matrix (n × n).
 * @param riskFreeRate - Annualised risk-free rate (decimal).
 */
export function maxSharpeWeights(
  means: number[],
  covariance: number[][],
  riskFreeRate: number,
): PortfolioStats | null {
  checkSquare(covariance, "The covariance matrix");
  if (means.length !== covariance.length) {
    throw new RangeError("Means and covariance must describe the same assets.");
  }
  if (means.length === 1) {
    if (means[0]! <= riskFreeRate) return null;
    return portfolioStats([1], means, covariance, riskFreeRate);
  }
  const excess = means.map((mu) => mu - riskFreeRate);
  const raw = solveLinearSystem(covariance, excess);
  if (raw === null) return null;
  const weights = longOnly(raw);
  if (weights === null) return null;
  return portfolioStats(weights, means, covariance, riskFreeRate);
}

/**
 * The minimum-variance portfolio: weights proportional to Σ⁻¹·1, clipped
 * to long-only. Returns null when the covariance matrix is singular.
 *
 * @param means - Annualised mean return per asset (decimals).
 * @param covariance - Annualised covariance matrix (n × n).
 * @param riskFreeRate - Annualised risk-free rate (decimal); used only for
 *   the reported Sharpe ratio, not for the weights.
 */
export function minVarianceWeights(
  means: number[],
  covariance: number[][],
  riskFreeRate: number,
): PortfolioStats | null {
  checkSquare(covariance, "The covariance matrix");
  if (means.length !== covariance.length) {
    throw new RangeError("Means and covariance must describe the same assets.");
  }
  if (means.length === 1) return portfolioStats([1], means, covariance, riskFreeRate);
  const raw = solveLinearSystem(covariance, new Array(means.length).fill(1));
  if (raw === null) return null;
  const weights = longOnly(raw);
  if (weights === null) return null;
  return portfolioStats(weights, means, covariance, riskFreeRate);
}

/**
 * The efficient frontier: for a sweep of target returns between the lowest
 * and highest asset mean, the minimum-variance portfolio at that return,
 * solved exactly via the KKT system and then clipped to long-only. Each
 * point reports its actual (post-clipping) return and volatility, not the
 * target, so the plotted curve is honest about the approximation.
 *
 * @param means - Annualised mean return per asset (decimals).
 * @param covariance - Annualised covariance matrix (n × n).
 * @param riskFreeRate - Annualised risk-free rate (decimal); used only for
 *   the reported Sharpe ratios, not for the weights.
 * @param points - Number of frontier points; defaults to 12, must be >= 2.
 * @returns Frontier points sorted by rising volatility. Points whose KKT
 *   system is singular are skipped, so fewer than `points` may come back.
 */
export function efficientFrontier(
  means: number[],
  covariance: number[][],
  riskFreeRate: number,
  points = 12,
): FrontierPoint[] {
  checkSquare(covariance, "The covariance matrix");
  if (means.length !== covariance.length) {
    throw new RangeError("Means and covariance must describe the same assets.");
  }
  if (!Number.isInteger(points) || points < 2) {
    throw new RangeError("The frontier needs at least two points.");
  }
  const n = means.length;
  // The efficient frontier is the upper branch: from the minimum-variance
  // return up to the highest asset mean. Portfolios below the minimum-
  // variance return are inefficient (same risk, less return) and excluded.
  const minVar = minVarianceWeights(means, covariance, riskFreeRate);
  const low = minVar ? minVar.expectedReturn : Math.min(...means);
  const high = Math.max(...means);
  const frontier: FrontierPoint[] = [];
  for (let p = 0; p < points; p++) {
    const target = low + ((high - low) * p) / (points - 1);
    // KKT system for min (1/2)wᵀΣw subject to μᵀw = target, 1ᵀw = 1:
    // [2Σ  μ  1] [w ]   [0]
    // [μᵀ  0  0] [λ1] = [target]
    // [1ᵀ  0  0] [λ2]   [1]
    const size = n + 2;
    const matrix: number[][] = [];
    const vector: number[] = new Array(size).fill(0);
    for (let i = 0; i < n; i++) {
      const row = new Array<number>(size).fill(0);
      for (let j = 0; j < n; j++) row[j] = 2 * covariance[i]![j]!;
      row[n] = means[i]!;
      row[n + 1] = 1;
      matrix.push(row);
    }
    const returnRow = new Array<number>(size).fill(0);
    for (let j = 0; j < n; j++) returnRow[j] = means[j]!;
    matrix.push(returnRow);
    const unityRow = new Array<number>(size).fill(0);
    for (let j = 0; j < n; j++) unityRow[j] = 1;
    matrix.push(unityRow);
    vector[n] = target;
    vector[n + 1] = 1;
    const solved = solveLinearSystem(matrix, vector);
    if (solved === null) continue;
    const weights = longOnly(solved.slice(0, n));
    if (weights === null) continue;
    frontier.push({
      targetReturn: target,
      ...portfolioStats(weights, means, covariance, riskFreeRate),
    });
  }
  frontier.sort((a, b) => a.volatility - b.volatility);
  return frontier;
}
