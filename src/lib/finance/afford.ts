/**
 * Pure affordability guard for money-spend paths.
 *
 * All spend gates (UPI send, bank transfer, account transfers, stock buys)
 * share one rule: the source account must cover the amount, in integer
 * paise. Exact balance is OK — affordability is `amount <= balance`.
 *
 * Negative balances, zero/negative amounts, and non-finite inputs are
 * always unaffordable: a spend gate should never green-light a malformed
 * value. Callers still own their own "amount > 0" validation and the
 * user-facing "Insufficient balance in <account name>" messaging.
 */

export function canAfford(balancePaise: number, amountPaise: number): boolean {
  if (!Number.isFinite(balancePaise) || !Number.isFinite(amountPaise)) return false;
  if (balancePaise < 0) return false;
  if (amountPaise <= 0) return false;
  return amountPaise <= balancePaise;
}

/** Same as `!canAfford`, named for the common `if (overBalance)` call-site shape. */
export function overBalance(balancePaise: number, amountPaise: number): boolean {
  return !canAfford(balancePaise, amountPaise);
}
