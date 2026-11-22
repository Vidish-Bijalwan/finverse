/**
 * Portfolio return math: CAGR and XIRR. Pure functions, tested against
 * published reference values (see portfolio-math.test.ts).
 *
 * CAGR applies to a single sum held over a period: it cannot handle money
 * added or withdrawn along the way. XIRR handles dated cash flows and is
 * the right measure for a portfolio with several buys at different times.
 *
 * UNITS: values are plain numbers in the quote currency (e.g. rupees), NOT
 * paise; rates are decimals (0.1 = 10% p.a.), not percents. Callers convert
 * amounts to paise with Math.round(rupees * 100) before formatINR(), as in
 * the other calc modules.
 *
 * Ported from the old FinVerse repo (apps/web/lib/portfolio.ts) with the
 * same formulas and edge-case behaviour.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_YEAR = 365;

/**
 * Compound annual growth rate: (end / start) ^ (1 / years) − 1.
 * Returns null when the inputs cannot define a rate (non-positive start,
 * negative end, or a non-positive holding period).
 *
 * @param startValue - Starting value (plain number, not paise); must be > 0.
 * @param endValue - Ending value (plain number, not paise); must be >= 0.
 * @param years - Holding period in years; must be > 0.
 * @returns Annual rate as a decimal (0.1 = 10%), or null.
 */
export function cagr(startValue: number, endValue: number, years: number): number | null {
  if (
    !Number.isFinite(startValue) ||
    !Number.isFinite(endValue) ||
    !Number.isFinite(years) ||
    startValue <= 0 ||
    endValue < 0 ||
    years <= 0
  ) {
    return null;
  }
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

/**
 * CAGR between two dates, with the holding period measured in 365-day years.
 *
 * @param startValue - Starting value (plain number, not paise); must be > 0.
 * @param endValue - Ending value (plain number, not paise); must be >= 0.
 * @param startDate - ISO date (YYYY-MM-DD) or a Date; interpreted as UTC midnight.
 * @param endDate - ISO date (YYYY-MM-DD) or a Date; interpreted as UTC midnight.
 * @returns Annual rate as a decimal (0.1 = 10%), or null when the dates or
 *   values cannot define a rate (bad date, end <= start, bad values).
 */
export function cagrFromDates(
  startValue: number,
  endValue: number,
  startDate: string | Date,
  endDate: string | Date,
): number | null {
  const start = toUtcMs(startDate);
  const end = toUtcMs(endDate);
  if (start === null || end === null) return null;
  const years = (end - start) / MS_PER_DAY / DAYS_PER_YEAR;
  return cagr(startValue, endValue, years);
}

export interface CashFlow {
  /** Negative for money invested, positive for money received. */
  amount: number;
  /** ISO date (YYYY-MM-DD) or a Date; interpreted as UTC midnight. */
  date: string | Date;
}

function toUtcMs(date: string | Date): number | null {
  if (date instanceof Date) {
    const ms = date.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  const ms = Date.parse(`${date}T00:00:00.000Z`);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Internal rate of return for irregular dated cash flows — the annual rate
 * at which the net present value of all flows is zero, discounting each
 * flow by the actual days since the first flow over a 365-day year
 * (the same definition Microsoft Excel's XIRR uses).
 *
 * Solved with Newton–Raphson from a 10% guess, with a bisection fallback
 * if Newton fails to converge. Returns null when there is no rate to find:
 * fewer than two flows, all flows on one side of zero, or no convergence.
 *
 * @param cashFlows - Dated flows; amounts are plain numbers (not paise),
 *   negative for money invested, positive for money received.
 * @param guess - Newton–Raphson starting rate; defaults to 0.1 (Excel's default).
 * @returns Annual rate as a decimal (0.1 = 10%), or null.
 */
export function xirr(cashFlows: CashFlow[], guess = 0.1): number | null {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return null;
  const flows: { amount: number; years: number }[] = [];
  let firstMs: number | null = null;
  let hasNegative = false;
  let hasPositive = false;
  for (const flow of cashFlows) {
    const ms = toUtcMs(flow.date);
    if (
      ms === null ||
      typeof flow.amount !== "number" ||
      !Number.isFinite(flow.amount) ||
      flow.amount === 0
    ) {
      return null;
    }
    if (firstMs === null || ms < firstMs) firstMs = ms;
    if (flow.amount < 0) hasNegative = true;
    if (flow.amount > 0) hasPositive = true;
  }
  if (!hasNegative || !hasPositive || firstMs === null) return null;
  for (const flow of cashFlows) {
    const ms = toUtcMs(flow.date);
    if (ms === null) return null;
    flows.push({
      amount: flow.amount,
      years: (ms - firstMs) / MS_PER_DAY / DAYS_PER_YEAR,
    });
  }
  // The NPV tolerance scales with the size of the flows: an absolute
  // tolerance would be unreachable for large portfolios.
  const scale = flows.reduce((sum, flow) => sum + Math.abs(flow.amount), 0);
  const tolerance = 1e-9 * scale;
  const npv = (rate: number) => {
    let total = 0;
    for (const flow of flows) {
      total += flow.amount / Math.pow(1 + rate, flow.years);
    }
    return total;
  };
  const npvDerivative = (rate: number) => {
    let total = 0;
    for (const flow of flows) {
      total += (-flow.amount * flow.years) / Math.pow(1 + rate, flow.years + 1);
    }
    return total;
  };

  // Newton–Raphson from the guess (Excel's default).
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    if (rate <= -1) break;
    const value = npv(rate);
    if (Math.abs(value) < tolerance) return rate;
    const slope = npvDerivative(rate);
    if (slope === 0 || !Number.isFinite(slope)) break;
    const next = rate - value / slope;
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - rate) < 1e-12) {
      rate = next;
      break;
    }
    rate = next;
  }
  if (rate > -1 && Math.abs(npv(rate)) < tolerance) return rate;

  // Bisection fallback over a widening bracket.
  let low = -0.9999;
  let high = 10;
  let lowValue = npv(low);
  const highValue = npv(high);
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0) {
    return null;
  }
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const value = npv(mid);
    if (Math.abs(value) < tolerance || high - low < 1e-12) return mid;
    if (value * lowValue > 0) {
      low = mid;
      lowValue = value;
    } else {
      high = mid;
    }
  }
  return null;
}
