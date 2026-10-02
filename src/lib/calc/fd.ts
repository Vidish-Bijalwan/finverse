/**
 * FD / lump-sum growth math — pure functions, no UI.
 *
 *   FV = P * (1 + r / k)^(k * t)
 * where r = annual rate (decimal), k = compounding periods per year,
 * t = tenure in years. Amounts are RUPEES.
 */

export type CompoundingFrequency = "yearly" | "half-yearly" | "quarterly" | "monthly";

export const COMPOUNDING_PERIODS: Record<CompoundingFrequency, number> = {
  yearly: 1,
  "half-yearly": 2,
  quarterly: 4,
  monthly: 12,
};

export const COMPOUNDING_LABELS: Record<CompoundingFrequency, string> = {
  yearly: "Yearly",
  "half-yearly": "Half-yearly",
  quarterly: "Quarterly",
  monthly: "Monthly",
};

export interface FdInput {
  /** Deposit amount in rupees. */
  principal: number;
  /** Annual rate in percent, e.g. 7.25 for 7.25%. */
  annualRatePct: number;
  /** Tenure in years (may be fractional, e.g. 2.5). */
  years: number;
  compounding: CompoundingFrequency;
}

export interface FdResult {
  /** Maturity value (rupees). */
  maturity: number;
  /** Interest earned (rupees). */
  interest: number;
  /** Effective annual yield in percent (accounts for compounding frequency). */
  effectiveAnnualPct: number;
}

export function calcFd(input: FdInput): FdResult {
  const { principal, annualRatePct, years, compounding } = input;
  if (principal <= 0 || years <= 0) {
    return { maturity: 0, interest: 0, effectiveAnnualPct: 0 };
  }
  const k = COMPOUNDING_PERIODS[compounding];
  const r = annualRatePct / 100;
  const periods = k * years;
  const maturity = r === 0 ? principal : principal * Math.pow(1 + r / k, periods);
  const effectiveAnnualPct = (Math.pow(1 + r / k, k) - 1) * 100;
  return { maturity, interest: maturity - principal, effectiveAnnualPct };
}

export interface FdYearPoint {
  year: number;
  value: number;
}

/** Year-by-year value series for charts. */
export function fdGrowthSeries(input: FdInput): FdYearPoint[] {
  const points: FdYearPoint[] = [];
  const wholeYears = Math.max(1, Math.round(input.years));
  for (let y = 1; y <= wholeYears; y++) {
    const r = calcFd({ ...input, years: Math.min(y, input.years) });
    points.push({ year: y, value: r.maturity });
  }
  return points;
}

export function validateFd(input: FdInput): string | null {
  if (!Number.isFinite(input.principal) || input.principal <= 0)
    return "Deposit amount must be greater than ₹0.";
  if (input.principal > 100_00_00_000) return "Deposit looks too large — keep it under ₹100 crore.";
  if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0)
    return "Interest rate can't be negative.";
  if (input.annualRatePct > 20) return "FD rates above 20% p.a. are unrealistic.";
  if (!Number.isFinite(input.years) || input.years < 0.25)
    return "Tenure must be at least 3 months.";
  if (input.years > 30) return "Tenure can't exceed 30 years.";
  return null;
}
