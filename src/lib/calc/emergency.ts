/**
 * Emergency-fund planner — pure functions, no UI.
 *
 * Target = monthly expenses × months of cover. "Current coverage" comes from
 * the user's emergency-fund savings goal (savedPaise), so we report how many
 * months of expenses their existing savings already cover. Amounts in RUPEES.
 */

export interface EmergencyInput {
  /** Average monthly expenses in rupees. */
  monthlyExpenses: number;
  /** Months of cover desired, e.g. 6. */
  monthsCover: number;
  /** Current emergency savings in rupees (from the user's emergency goal). */
  savedSoFar: number;
}

export interface EmergencyResult {
  /** Target corpus (rupees). */
  target: number;
  /** Remaining to save (rupees), never negative. */
  gap: number;
  /** Months of cover already funded. */
  currentCoverMonths: number;
  /** Funded percentage of the target. */
  fundedPct: number;
  /** Months left to reach target if the user saves `savingPerMonth`. */
  monthsToTarget: number | null;
}

export function calcEmergencyFund(input: EmergencyInput, savingPerMonth = 0): EmergencyResult {
  const target = Math.max(0, input.monthlyExpenses * input.monthsCover);
  const saved = Math.max(0, input.savedSoFar);
  const gap = Math.max(0, target - saved);
  const currentCoverMonths = input.monthlyExpenses > 0 ? saved / input.monthlyExpenses : 0;
  const fundedPct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const monthsToTarget = savingPerMonth > 0 && gap > 0 ? Math.ceil(gap / savingPerMonth) : null;
  return { target, gap, currentCoverMonths, fundedPct, monthsToTarget };
}

export function validateEmergency(input: EmergencyInput): string | null {
  if (!Number.isFinite(input.monthlyExpenses) || input.monthlyExpenses <= 0)
    return "Monthly expenses must be greater than ₹0.";
  if (input.monthlyExpenses > 1_00_00_000)
    return "Monthly expenses look too large — keep them under ₹1 crore.";
  if (!Number.isFinite(input.monthsCover) || input.monthsCover < 1)
    return "Cover must be at least 1 month.";
  if (input.monthsCover > 36) return "Cover can't exceed 36 months.";
  if (!Number.isFinite(input.savedSoFar) || input.savedSoFar < 0)
    return "Existing savings can't be negative.";
  return null;
}
