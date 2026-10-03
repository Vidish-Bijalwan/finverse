/**
 * Pure holdings math for simulated-brokerage order execution.
 *
 * No side effects, no framework imports — safe to unit-test anywhere
 * (vitest has no `@/` alias configured, so this module imports nothing).
 */

export type OrderSide = "buy" | "sell";

/** Minimal holding shape this math needs. */
export interface HoldingLike {
  qty: number;
  avgPricePaise: number;
}

/** Values to upsert on the holding row. */
export interface HoldingUpsert {
  qty: number;
  avgPricePaise: number;
}

/**
 * Apply an order to an existing holding (or none, for a first buy).
 *
 * Returns the `{ qty, avgPricePaise }` values to upsert, or `null` when a
 * sell closes the position (the caller deletes the row).
 *
 * Behavior contract (matches the legacy `usePlaceOrder` mutation):
 *  - buy-new       → `{ qty, avgPricePaise: pricePaise }`
 *  - buy-existing  → weighted average
 *                    `Math.round((oldQty * oldAvg + qty * price) / newQty)`
 *  - sell-partial  → reduced qty, average unchanged
 *  - sell-all      → `null`
 *  - sell-more-than-held → throw
 *  - qty <= 0 / price <= 0 → throw
 */
export function applyOrderToHolding(
  holding: HoldingLike | undefined,
  side: OrderSide,
  qty: number,
  pricePaise: number,
  symbol: string,
): HoldingUpsert | null {
  const wholeQty = Math.floor(qty);
  const price = Math.round(pricePaise);
  if (wholeQty <= 0) throw new Error("Quantity must be at least 1.");
  if (price <= 0) throw new Error("Price must be greater than zero.");

  if (side === "buy") {
    if (holding) {
      const newQty = holding.qty + wholeQty;
      const newAvg = Math.round((holding.qty * holding.avgPricePaise + wholeQty * price) / newQty);
      return { qty: newQty, avgPricePaise: newAvg };
    }
    return { qty: wholeQty, avgPricePaise: price };
  }

  const owned = holding?.qty ?? 0;
  if (!holding || holding.qty < wholeQty) {
    throw new Error(`You hold ${owned} × ${symbol} — reduce the quantity to place this sell.`);
  }
  const newQty = holding.qty - wholeQty;
  if (newQty === 0) return null;
  return { qty: newQty, avgPricePaise: holding.avgPricePaise };
}
