/**
 * Honest financial-label math (integer paise throughout).
 *
 * Label contract used across the dashboard:
 * - "Net worth"      = cash + investments + other assets − liabilities
 * - "Monthly cash flow" / "Net cash flow" = income − expenses
 * - "Investment P&L" / "Returns"          = current value − invested cost
 *
 * "P&L" must NEVER label income-minus-expenses.
 */

export interface NetWorthInputs {
  /** Account balances. */
  cashPaise: number;
  /** Investments at current market value. */
  investmentsPaise: number;
  /** Optional: other assets (property, gold, …). */
  otherAssetsPaise?: number;
  /** Optional: loans, credit-card dues, …. */
  liabilitiesPaise?: number;
}

/** Net worth = cash + investments + other assets − liabilities. */
export function netWorthPaise(inputs: NetWorthInputs): number {
  const { cashPaise, investmentsPaise } = inputs;
  const other = inputs.otherAssetsPaise ?? 0;
  const liabilities = inputs.liabilitiesPaise ?? 0;
  return cashPaise + investmentsPaise + other - liabilities;
}

/** Investment returns (P&L) = current value − invested cost. */
export function investmentReturnsPaise(
  currentValuePaise: number,
  investedCostPaise: number,
): number {
  return currentValuePaise - investedCostPaise;
}

/** Monthly cash flow = income − expenses. */
export function monthlyCashFlowPaise(incomePaise: number, expensePaise: number): number {
  return incomePaise - expensePaise;
}

/**
 * Percentage change of `current` vs `previous`.
 * Returns null when there is no meaningful base (previous === 0 and current
 * === 0 → 0; previous === 0 and current !== 0 → null).
 */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
