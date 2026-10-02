/**
 * SIP (Systematic Investment Plan) math — pure functions, no UI.
 *
 * Convention: monthly SIP uses the annuity-due formula (payment at the START
 * of each month, as mutual-fund SIP calculators do):
 *   FV = P * [((1 + i)^n - 1) / i] * (1 + i),  i = annualRate / 12, n = months
 *
 * All amounts returned are in RUPEES (floats). Callers convert to paise with
 * Math.round(rupees * 100) before formatINR().
 */

export interface SipInput {
  /** Monthly investment in rupees. */
  monthlyAmount: number;
  /** Expected annual return in percent, e.g. 12 for 12%. */
  annualRatePct: number;
  /** Tenure in whole years. */
  years: number;
}

export interface SipResult {
  /** Total amount invested (rupees). */
  invested: number;
  /** Maturity value (rupees). */
  maturity: number;
  /** Gains = maturity - invested (rupees). */
  gains: number;
}

export function calcSip(input: SipInput): SipResult {
  const { monthlyAmount, annualRatePct, years } = input;
  const months = Math.round(years * 12);
  if (months <= 0 || monthlyAmount <= 0) {
    return { invested: 0, maturity: 0, gains: 0 };
  }
  const i = annualRatePct / 100 / 12;
  const invested = monthlyAmount * months;
  let maturity: number;
  if (i === 0) {
    maturity = invested;
  } else {
    const growth = Math.pow(1 + i, months);
    maturity = monthlyAmount * ((growth - 1) / i) * (1 + i);
  }
  return { invested, maturity, gains: maturity - invested };
}

export interface SipYearPoint {
  year: number;
  invested: number;
  value: number;
}

/** Year-by-year growth series for charts (invested vs maturity value). */
export function sipGrowthSeries(input: SipInput): SipYearPoint[] {
  const points: SipYearPoint[] = [];
  for (let y = 1; y <= Math.round(input.years); y++) {
    const r = calcSip({ ...input, years: y });
    points.push({ year: y, invested: r.invested, value: r.maturity });
  }
  return points;
}

export function validateSip(input: SipInput): string | null {
  if (!Number.isFinite(input.monthlyAmount) || input.monthlyAmount <= 0)
    return "Monthly amount must be greater than ₹0.";
  if (input.monthlyAmount > 1_00_00_000)
    return "Monthly amount looks too large — keep it under ₹1 crore.";
  if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0)
    return "Expected return can't be negative.";
  if (input.annualRatePct > 50) return "Expected return above 50% p.a. is unrealistic.";
  if (!Number.isFinite(input.years) || input.years < 1) return "Tenure must be at least 1 year.";
  if (input.years > 60) return "Tenure can't exceed 60 years.";
  return null;
}
