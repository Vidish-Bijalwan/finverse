/**
 * Investment Readiness — the merged 7-factor model (M5).
 *
 * This merges the two readiness models that existed before the migration:
 * this repo's 4-factor model (emergency fund, savings rate, budget
 * discipline, fixed-cost ratio — formerly inline in
 * `src/routes/readiness.tsx`) and the old FinVerse repo's Phase 4 model
 * (emergency fund, debt-to-income, monthly surplus, portfolio
 * concentration, portfolio volatility). Savings rate (theirs) and monthly
 * surplus (ours) measure the same thing, so they count as ONE factor —
 * the merged model has 7 factors, not 8. Weights were decided by Vivek
 * (22 Nov 2026) and are recorded in `docs/MIGRATION.md` §6.
 *
 * | Factor               | Weight | Measurement                                   | Full marks at              | Zero at                    |
 * |----------------------|--------|------------------------------------------------|------------------------------|----------------------------|
 * | Emergency fund       | 20     | Months of avg expenses the emergency goal covers | 6+ months               | 0 months                   |
 * | Savings rate         | 20     | 3-month avg (income − expenses) ÷ income     | Rate ≥ 20%                 | Rate ≤ 0                   |
 * | Debt-to-income       | 15     | Total debt ÷ annual income                   | No debt (ratio 0)          | Debt ≥ 1 year of income    |
 * | Budget discipline    | 10     | % of this month's budgets unbreached         | All unbreached             | All breached               |
 * | Fixed-cost ratio     | 10     | (Rent + bills) ÷ income                      | Ratio ≤ 30%                | Ratio ≥ 60%                |
 * | Portfolio conc.      | 15     | Largest holding's weight by current value    | Largest holding ≤ 20%      | Single holding (100%)      |
 * | Portfolio volatility | 10     | Value-weighted avg annualized volatility     | Volatility ≤ 15%           | Volatility ≥ 60%           |
 *
 * Each factor scores linearly between its full-marks and zero points.
 * Factor points are rounded to 1 decimal; the total is computed from the
 * rounded points and rounded to a whole number, so the displayed numbers
 * reconcile exactly.
 *
 * ## Missing data — never invented
 *
 * A factor whose inputs are missing is UNAVAILABLE, not zero: scoring
 * "no budgets" as maximally undisciplined, or "no holdings" as maximally
 * concentrated, would invent a bad grade for absent data. The total is
 * rescaled over the available factors only
 * (score = earned ÷ available weight × 100), and the assessment reports
 * `maxScore` (the available weight) plus which factors are missing, so
 * the reader can see exactly what the score rests on. A user with no
 * holdings gets a cash-flow readiness score — readiness to START
 * investing is a cash-flow question. A user with nothing measurable at
 * all gets no score.
 *
 * ## Bands (kept from the existing app — do not change)
 *
 * - ≥75: "Ready to invest"
 * - 50–74: "Almost ready"
 * - 30–49: "Build foundations first"
 * - <30: "Not yet — protect cash first"
 *
 * ## Volatility — documented simplification
 *
 * Portfolio volatility is the VALUE-WEIGHTED AVERAGE of the holdings'
 * individual annualized volatilities (daily log returns, 3 months,
 * × √252). Correlations between holdings are NOT modelled, so a
 * diversified portfolio's true volatility is somewhat lower than this
 * figure — the number is a conservative (pessimistic) estimate, and the
 * limitation is stated here rather than hidden. Holdings with fewer
 * than 30 closes are excluded (too little history to be meaningful).
 * Price history in this app is currently simulated (see
 * `src/lib/market/history.ts`), so the volatility factor measures the
 * simulated series — the UI discloses that.
 *
 * UNITS: money inputs are integer paise; rates and ratios are decimals
 * (0.2 = 20%); volatility is an annualized decimal. Ported from the old
 * FinVerse repo (`apps/backend/src/readiness/readiness.formula.ts`,
 * Phase 4) with the merged weights and the two extra factors from this
 * repo's model.
 */

/** The score is always out of 100. */
export const READINESS_SCALE = 100;

/** Merged factor weights — decided by Vivek, 22 Nov 2026 (see MIGRATION.md §6). */
export const READINESS_WEIGHTS = {
  emergency: 20,
  savings: 20,
  debt: 15,
  discipline: 10,
  fixed: 10,
  concentration: 15,
  volatility: 10,
} as const;

export type ReadinessFactorId = keyof typeof READINESS_WEIGHTS;

/** Months of expenses at which the emergency fund scores full marks. */
export const EMERGENCY_FULL_MONTHS = 6;
/** Savings rate (of income) at which the savings factor scores full marks. */
export const SAVINGS_FULL_RATE = 0.2;
/** Debt-to-income ratio at/above which the debt factor scores zero. */
export const DEBT_TO_INCOME_ZERO = 1;
/** Fixed-cost ratio at/below which the fixed-cost factor scores full marks. */
export const FIXED_COST_FULL_RATIO = 0.3;
/** Fixed-cost ratio at/above which the fixed-cost factor scores zero. */
export const FIXED_COST_ZERO_RATIO = 0.6;
/** Largest-holding weight at/below which concentration scores full marks. */
export const CONCENTRATION_FULL_WEIGHT = 0.2;
/** Annualized volatility at/below which volatility scores full marks. */
export const VOLATILITY_FULL = 0.15;
/** Annualized volatility at/above which volatility scores zero. */
export const VOLATILITY_ZERO = 0.6;

/** Score bands with their published thresholds (inclusive lower bounds). */
export const READINESS_BANDS = [
  { min: 75, band: "Ready to invest" },
  { min: 50, band: "Almost ready" },
  { min: 30, band: "Build foundations first" },
  { min: 0, band: "Not yet — protect cash first" },
] as const;

export type ReadinessBand = (typeof READINESS_BANDS)[number]["band"];

/** Minimum daily closes for a holding's volatility to be meaningful. */
export const MIN_HISTORY_CLOSES = 30;
/** Trading days per year, for annualizing daily volatility. */
export const TRADING_DAYS_PER_YEAR = 252;

export interface ReadinessInputs {
  /** Months of avg expenses the emergency goal covers; null when unmeasurable (no emergency goal, or no expenses recorded). */
  emergencyMonths: number | null;
  /** 3-month average savings rate as a fraction (0.2 = 20%); null when no income recorded. */
  savingsRate: number | null;
  /** Total debt outstanding in paise; null when no debt data exists. This repo has no debt records, so callers pass null. */
  totalDebtPaise: number | null;
  /** Annual income in paise (for DTI); only used when totalDebtPaise is not null. */
  annualIncomePaise: number;
  /** Budget discipline for the month; null when no budgets are set. */
  discipline: { unbreached: number; total: number } | null;
  /** Fixed-cost ratio (rent + bills) ÷ income; null when income is 0. */
  fixedCostRatio: number | null;
  /** Priced holdings only — unpriced holdings cannot be valued. */
  holdings: Array<{ symbol: string; currentValuePaise: number }>;
  /** Annualized volatility (fraction, e.g. 0.234) per holding with history. */
  holdingVolatilities: Array<{
    symbol: string;
    volatility: number;
    currentValuePaise: number;
  }>;
}

export interface ReadinessFactor {
  id: ReadinessFactorId;
  /** Display name. */
  name: string;
  /** Machine key for the factor, e.g. 'emergencyMonths'. */
  metric: string;
  /** Points earned (1 decimal; 0 when unavailable). */
  points: number;
  /** Raw 0–100 score for progress display (0 when unavailable). */
  pointsPercent: number;
  /** Points available (the factor's weight). */
  maxPoints: number;
  available: boolean;
  /** One line saying what was measured (or why it could not be). */
  detail: string;
  months?: number;
  savingsRatePercent?: number;
  debtToIncomeRatio?: number;
  totalDebtPaise?: number;
  annualIncomePaise?: number;
  unbreachedBudgets?: number;
  totalBudgets?: number;
  fixedCostRatioPercent?: number;
  largestHoldingSymbol?: string;
  largestHoldingWeightPercent?: number;
  holdingsCount?: number;
  volatilityPercent?: number;
  holdingsWithHistory?: number;
}

export interface ReadinessSuggestion {
  /** The factor this suggestion improves. */
  factor: string;
  /** Plain-language action, shown in the UI. */
  action: string;
  /** Points gained by reaching the target (1 decimal). */
  pointsGain: number;
}

export interface ReadinessAssessment {
  available: true;
  /** Total score, integer 0–100, rescaled over available factors. */
  score: number;
  band: ReadinessBand;
  /** The scale the score is out of — always 100. */
  scale: 100;
  /** Sum of the available factors' weights (100 when all are available). */
  maxScore: number;
  factors: ReadinessFactor[];
  /** Names of the factors that could not be measured. */
  unavailableFactors: string[];
  /** Top 3 improvements by points gained (deterministic, not from the model). */
  suggestions: ReadinessSuggestion[];
  context: {
    totalPortfolioValuePaise: number;
    holdingsCount: number;
    largestHolding: { symbol: string; weightPercent: number } | null;
    volatilityPercent: number | null;
  };
}

export interface ReadinessUnavailable {
  available: false;
  reason: string;
  /** What is missing (factor names / inputs). */
  missing: string[];
}

export type ReadinessResult = ReadinessAssessment | ReadinessUnavailable;

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Paise → whole rupees for display. */
const toRupees = (paise: number): number => Math.round(paise / 100);

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Annualized volatility from daily closes: standard deviation of daily
 * log returns × √252. Returns null when there is too little history
 * (fewer than 30 closes) or the data is unusable (a non-positive close
 * has no log return) — never a made-up number.
 */
export function annualizedVolatility(closes: number[]): number | null {
  if (closes.length < MIN_HISTORY_CLOSES) return null;
  if (closes.some((close) => !Number.isFinite(close) || close <= 0)) {
    return null;
  }
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push(Math.log(closes[i]! / closes[i - 1]!));
  }
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

export function bandForScore(score: number): ReadinessBand {
  for (const { min, band } of READINESS_BANDS) {
    if (score >= min) return band;
  }
  return "Not yet — protect cash first";
}

function emergencyFactor(months: number | null): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.emergency;
  if (months === null) {
    return {
      id: "emergency",
      name: "Emergency-fund coverage",
      metric: "emergencyMonths",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail:
        "No 'Emergency fund' goal found (or no expenses recorded), so the safety net cannot be measured.",
    };
  }
  const percent = clamp((months / EMERGENCY_FULL_MONTHS) * 100, 0, 100);
  return {
    id: "emergency",
    name: "Emergency-fund coverage",
    metric: "emergencyMonths",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail: `${months.toFixed(1)} months covered (target 6).`,
    months: round1(months),
  };
}

function savingsFactor(rate: number | null): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.savings;
  if (rate === null) {
    return {
      id: "savings",
      name: "Savings rate (3-mo avg)",
      metric: "savingsRatePercent",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail: "No income recorded in the last 3 months, so the savings rate cannot be measured.",
    };
  }
  const percent = clamp((rate / SAVINGS_FULL_RATE) * 100, 0, 100);
  return {
    id: "savings",
    name: "Savings rate (3-mo avg)",
    metric: "savingsRatePercent",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail: `Avg savings rate ${round1(rate * 100)}% (target 20%). Income and expenses from your recorded transactions.`,
    savingsRatePercent: round1(rate * 100),
  };
}

function debtFactor(totalDebtPaise: number | null, annualIncomePaise: number): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.debt;
  if (totalDebtPaise === null) {
    return {
      id: "debt",
      name: "Debt-to-income",
      metric: "debtToIncomeRatio",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail:
        "FinVerse doesn't track loans or outstanding debt yet, so debt-to-income cannot be measured.",
    };
  }
  if (!(annualIncomePaise > 0)) {
    return {
      id: "debt",
      name: "Debt-to-income",
      metric: "debtToIncomeRatio",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail: "Annual income is ₹0, so debt-to-income cannot be measured.",
    };
  }
  const ratio = totalDebtPaise / annualIncomePaise;
  const percent = clamp((1 - ratio / DEBT_TO_INCOME_ZERO) * 100, 0, 100);
  return {
    id: "debt",
    name: "Debt-to-income",
    metric: "debtToIncomeRatio",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail:
      totalDebtPaise === 0
        ? "You carry no debt."
        : `Total debt of ${inr0.format(toRupees(totalDebtPaise))} is ${round2(ratio)}× your annual income of ${inr0.format(toRupees(annualIncomePaise))}.`,
    debtToIncomeRatio: round2(ratio),
    totalDebtPaise,
    annualIncomePaise,
  };
}

function disciplineFactor(
  discipline: { unbreached: number; total: number } | null,
): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.discipline;
  if (discipline === null || discipline.total <= 0) {
    return {
      id: "discipline",
      name: "Budget discipline",
      metric: "budgetsUnbreached",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail: "No budgets set for this month — discipline can't be measured.",
    };
  }
  const percent = (discipline.unbreached / discipline.total) * 100;
  return {
    id: "discipline",
    name: "Budget discipline",
    metric: "budgetsUnbreached",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail: `${discipline.unbreached} of ${discipline.total} budgets unbreached this month (${round1(percent)}%).`,
    unbreachedBudgets: discipline.unbreached,
    totalBudgets: discipline.total,
  };
}

function fixedFactor(ratio: number | null): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.fixed;
  if (ratio === null) {
    return {
      id: "fixed",
      name: "Fixed-cost ratio",
      metric: "fixedCostRatioPercent",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail: "No income recorded, so the fixed-cost ratio cannot be measured.",
    };
  }
  const percent =
    clamp((FIXED_COST_ZERO_RATIO - ratio) / (FIXED_COST_ZERO_RATIO - FIXED_COST_FULL_RATIO), 0, 1) *
    100;
  return {
    id: "fixed",
    name: "Fixed-cost ratio",
    metric: "fixedCostRatioPercent",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail: `Fixed costs are ${round1(ratio * 100)}% of income (healthy ≤ 30%).`,
    fixedCostRatioPercent: round1(ratio * 100),
  };
}

function concentrationFactor(
  holdings: Array<{ symbol: string; currentValuePaise: number }>,
): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.concentration;
  const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValuePaise, 0);
  if (holdings.length === 0 || !(totalValue > 0)) {
    return {
      id: "concentration",
      name: "Portfolio concentration",
      metric: "largestHoldingWeightPercent",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail: "No priced holdings, so concentration cannot be measured.",
    };
  }
  const largest = holdings.reduce((a, b) => (b.currentValuePaise > a.currentValuePaise ? b : a));
  const weight = largest.currentValuePaise / totalValue;
  const percent = clamp(((1 - weight) / (1 - CONCENTRATION_FULL_WEIGHT)) * 100, 0, 100);
  return {
    id: "concentration",
    name: "Portfolio concentration",
    metric: "largestHoldingWeightPercent",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail: `Your largest holding, ${largest.symbol}, is ${round1(weight * 100)}% of your portfolio (20% or less is full marks).`,
    largestHoldingSymbol: largest.symbol,
    largestHoldingWeightPercent: round1(weight * 100),
    holdingsCount: holdings.length,
  };
}

function volatilityFactor(
  holdingVolatilities: Array<{
    symbol: string;
    volatility: number;
    currentValuePaise: number;
  }>,
): ReadinessFactor {
  const maxPoints = READINESS_WEIGHTS.volatility;
  const totalValue = holdingVolatilities.reduce(
    (sum, holding) => sum + holding.currentValuePaise,
    0,
  );
  if (holdingVolatilities.length === 0 || !(totalValue > 0)) {
    return {
      id: "volatility",
      name: "Portfolio volatility",
      metric: "volatilityPercent",
      points: 0,
      pointsPercent: 0,
      maxPoints,
      available: false,
      detail: "Not enough price history for your holdings yet, so volatility cannot be measured.",
    };
  }
  const weighted =
    holdingVolatilities.reduce(
      (sum, holding) => sum + holding.volatility * holding.currentValuePaise,
      0,
    ) / totalValue;
  const percent =
    clamp((VOLATILITY_ZERO - weighted) / (VOLATILITY_ZERO - VOLATILITY_FULL), 0, 1) * 100;
  return {
    id: "volatility",
    name: "Portfolio volatility",
    metric: "volatilityPercent",
    points: round1((maxPoints * percent) / 100),
    pointsPercent: round1(percent),
    maxPoints,
    available: true,
    detail: `Annualized volatility ${round1(weighted * 100)}% (value-weighted average across ${holdingVolatilities.length} holding${holdingVolatilities.length === 1 ? "" : "s"}; 15% or less is full marks). Computed from simulated price history.`,
    volatilityPercent: round1(weighted * 100),
    holdingsWithHistory: holdingVolatilities.length,
  };
}

/**
 * Deterministic suggestions: for each available factor below full marks,
 * the concrete target that would earn full marks, and the points it
 * would gain. Computed in code from the factor values — never by the
 * model. Sorted by points gained, top 3.
 */
function buildSuggestions(
  factors: ReadinessFactor[],
  inputs: ReadinessInputs,
): ReadinessSuggestion[] {
  const suggestions: ReadinessSuggestion[] = [];
  for (const factor of factors) {
    if (!factor.available || factor.points >= factor.maxPoints) continue;
    const gain = round1(factor.maxPoints - factor.points);
    switch (factor.metric) {
      case "emergencyMonths":
        suggestions.push({
          factor: factor.name,
          action: `Build your emergency fund to 6 months (currently ${factor.months} months) to gain ${gain} points.`,
          pointsGain: gain,
        });
        break;
      case "savingsRatePercent":
        suggestions.push({
          factor: factor.name,
          action: `Raising your savings rate to 20% (currently ${factor.savingsRatePercent}%) would add ${gain} points.`,
          pointsGain: gain,
        });
        break;
      case "debtToIncomeRatio":
        suggestions.push({
          factor: factor.name,
          action: `Clearing your ${inr0.format(toRupees(inputs.totalDebtPaise ?? 0))} debt would add ${gain} points.`,
          pointsGain: gain,
        });
        break;
      case "budgetsUnbreached":
        suggestions.push({
          factor: factor.name,
          action: `Keeping all ${factor.totalBudgets} budgets unbreached this month would add ${gain} points.`,
          pointsGain: gain,
        });
        break;
      case "fixedCostRatioPercent":
        suggestions.push({
          factor: factor.name,
          action: `Bringing fixed costs to 30% of income or below (currently ${factor.fixedCostRatioPercent}%) would add ${gain} points.`,
          pointsGain: gain,
        });
        break;
      case "largestHoldingWeightPercent":
        suggestions.push({
          factor: factor.name,
          action: `Reducing ${factor.largestHoldingSymbol} below 20% of your portfolio (currently ${factor.largestHoldingWeightPercent}%) would add ${gain} points.`,
          pointsGain: gain,
        });
        break;
      case "volatilityPercent":
        suggestions.push({
          factor: factor.name,
          action: `Reducing your portfolio's volatility to 15% or below (currently ${factor.volatilityPercent}%) would add ${gain} points.`,
          pointsGain: gain,
        });
        break;
      default:
        break;
    }
  }
  suggestions.sort((a, b) => b.pointsGain - a.pointsGain);
  return suggestions.slice(0, 3);
}

/**
 * Score the inputs. Pure and deterministic: the same inputs always
 * produce the same assessment. Returns `available: false` when no
 * factor can be measured at all.
 */
export function scoreReadiness(inputs: ReadinessInputs): ReadinessResult {
  const factors: ReadinessFactor[] = [
    emergencyFactor(inputs.emergencyMonths),
    savingsFactor(inputs.savingsRate),
    debtFactor(inputs.totalDebtPaise, inputs.annualIncomePaise),
    disciplineFactor(inputs.discipline),
    fixedFactor(inputs.fixedCostRatio),
    concentrationFactor(inputs.holdings),
    volatilityFactor(inputs.holdingVolatilities),
  ];
  const availableFactors = factors.filter((factor) => factor.available);
  if (availableFactors.length === 0) {
    return {
      available: false,
      reason:
        "Not enough data to measure investment readiness yet. Add income, an emergency-fund goal, budgets, or holdings to get a score.",
      missing: factors.map((factor) => factor.name),
    };
  }
  const maxScore = availableFactors.reduce((sum, factor) => sum + factor.maxPoints, 0);
  const earned = availableFactors.reduce((sum, factor) => sum + factor.points, 0);
  const score = Math.round((earned / maxScore) * READINESS_SCALE);
  const totalPortfolioValuePaise = inputs.holdings.reduce(
    (sum, holding) => sum + holding.currentValuePaise,
    0,
  );
  const largest =
    inputs.holdings.length > 0 && totalPortfolioValuePaise > 0
      ? inputs.holdings.reduce((a, b) => (b.currentValuePaise > a.currentValuePaise ? b : a))
      : null;
  const volatilityTotal = inputs.holdingVolatilities.reduce(
    (sum, holding) => sum + holding.currentValuePaise,
    0,
  );
  const volatility =
    inputs.holdingVolatilities.length > 0 && volatilityTotal > 0
      ? inputs.holdingVolatilities.reduce(
          (sum, holding) => sum + holding.volatility * holding.currentValuePaise,
          0,
        ) / volatilityTotal
      : null;
  return {
    available: true,
    score,
    band: bandForScore(score),
    scale: READINESS_SCALE,
    maxScore,
    factors,
    unavailableFactors: factors.filter((factor) => !factor.available).map((factor) => factor.name),
    suggestions: buildSuggestions(factors, inputs),
    context: {
      totalPortfolioValuePaise,
      holdingsCount: inputs.holdings.length,
      largestHolding:
        largest === null
          ? null
          : {
              symbol: largest.symbol,
              weightPercent: round1((largest.currentValuePaise / totalPortfolioValuePaise) * 100),
            },
      volatilityPercent: volatility === null ? null : round1(volatility * 100),
    },
  };
}
