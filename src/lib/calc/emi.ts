/**
 * EMI / loan amortisation math — pure functions, no UI.
 *
 * Standard reducing-balance EMI:
 *   EMI = P * r * (1 + r)^n / ((1 + r)^n - 1),  r = annualRate / 12, n = months
 *
 * The schedule is built in paise internally so the table balances to the
 * paisa; the final month absorbs rounding drift. Public amounts are RUPEES.
 */

export interface EmiInput {
  /** Loan principal in rupees. */
  principal: number;
  /** Annual interest rate in percent, e.g. 9.5 for 9.5%. */
  annualRatePct: number;
  /** Tenure in months. */
  months: number;
}

export interface EmiRow {
  month: number;
  /** Total instalment for the month (rupees). */
  emi: number;
  /** Principal component (rupees). */
  principal: number;
  /** Interest component (rupees). */
  interest: number;
  /** Balance outstanding AFTER this payment (rupees). */
  balance: number;
}

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  schedule: EmiRow[];
}

export function calcEmi(input: EmiInput): EmiResult {
  const { principal, annualRatePct, months } = input;
  const n = Math.round(months);
  const empty: EmiResult = { emi: 0, totalInterest: 0, totalPayable: 0, schedule: [] };
  if (n <= 0 || principal <= 0) return empty;

  const r = annualRatePct / 100 / 12;
  let emi: number;
  if (r === 0) {
    emi = principal / n;
  } else {
    const growth = Math.pow(1 + r, n);
    emi = (principal * r * growth) / (growth - 1);
  }

  // Build the schedule in integer paise so the table balances exactly.
  const emiPaise = Math.round(emi * 100);
  let balancePaise = Math.round(principal * 100);
  const schedule: EmiRow[] = [];
  let interestPaiseTotal = 0;

  for (let m = 1; m <= n; m++) {
    const interestPaise = Math.round(balancePaise * r);
    let principalPaise = emiPaise - interestPaise;
    // Final month: clear whatever balance remains (absorbs rounding drift).
    if (m === n || principalPaise > balancePaise) principalPaise = balancePaise;
    const payPaise = m === n ? principalPaise + interestPaise : emiPaise;
    balancePaise -= principalPaise;
    interestPaiseTotal += interestPaise;
    schedule.push({
      month: m,
      emi: payPaise / 100,
      principal: principalPaise / 100,
      interest: interestPaise / 100,
      balance: Math.max(0, balancePaise) / 100,
    });
  }

  const totalInterest = interestPaiseTotal / 100;
  return { emi: emiPaise / 100, totalInterest, totalPayable: principal + totalInterest, schedule };
}

/** Aggregate schedule into year-wise buckets for charts (sums per 12 months). */
export interface EmiYearBucket {
  year: number;
  principal: number;
  interest: number;
}

export function emiYearlyBuckets(schedule: EmiRow[]): EmiYearBucket[] {
  const buckets = new Map<number, EmiYearBucket>();
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    const b = buckets.get(year) ?? { year, principal: 0, interest: 0 };
    b.principal += row.principal;
    b.interest += row.interest;
    buckets.set(year, b);
  }
  return [...buckets.values()].sort((a, b) => a.year - b.year);
}

export function validateEmi(input: EmiInput): string | null {
  if (!Number.isFinite(input.principal) || input.principal <= 0)
    return "Loan amount must be greater than ₹0.";
  if (input.principal > 50_00_00_000)
    return "Loan amount looks too large — keep it under ₹50 crore.";
  if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0)
    return "Interest rate can't be negative.";
  if (input.annualRatePct > 60) return "Interest rate above 60% p.a. is unrealistic.";
  if (!Number.isFinite(input.months) || input.months < 1) return "Tenure must be at least 1 month.";
  if (input.months > 360) return "Tenure can't exceed 360 months (30 years).";
  return null;
}
