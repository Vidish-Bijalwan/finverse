import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  defaultAccountId,
  deleteHolding,
  fetchHoldings,
  insertHolding,
  insertTransaction,
  updateHolding,
} from "./db";
import { formatINR, todayISO } from "./format";
import { applyOrderToHolding } from "./order-math";

export interface PlaceOrderInput {
  side: "buy" | "sell";
  /** Ticker / symbol, e.g. "RELIANCE". */
  symbol: string;
  /** Whole units. */
  qty: number;
  /** Execution price in paise per unit. */
  pricePaise: number;
}

export interface PlaceOrderResult {
  /** "BUY RELIANCE × 10 @ ₹1,234.56" ledger transaction id. */
  transactionId: string;
}

/**
 * Simulated-brokerage order execution. Every order writes the shared ledger:
 *  - BUY  -> upsert `holdings` (weighted-average qty/avg_price) + an
 *           "expense" transaction (category "investments",
 *           note `BUY SYMBOL × qty @ price`, account = default account).
 *  - SELL -> reduce the holding qty (honest error when insufficient; the
 *           holding row is removed when qty reaches zero) + an "income"
 *           transaction (category "investments", note `SELL SYMBOL × qty @ price`).
 * All money is integer paise. Nothing here touches a real broker.
 */
export function usePlaceOrder() {
  const qc = useQueryClient();

  return useMutation<PlaceOrderResult, Error, PlaceOrderInput>({
    mutationFn: async (input) => {
      const symbol = input.symbol.toUpperCase();
      const qty = Math.floor(input.qty);
      const pricePaise = Math.round(input.pricePaise);

      const costPaise = qty * pricePaise;
      const accountId = await defaultAccountId();
      const holdings = await fetchHoldings();
      const holding = holdings.find((h) => h.symbol === symbol);

      // Pure holdings math (throws on invalid qty/price, oversell, …).
      const outcome = applyOrderToHolding(holding, input.side, qty, pricePaise, symbol);

      if (!holding) {
        // Only reachable on buy — a sell without a holding throws above.
        if (outcome === null) {
          throw new Error(`Unexpected: sell closed the missing ${symbol} position.`);
        }
        await insertHolding({ symbol, qty: outcome.qty, avgPricePaise: outcome.avgPricePaise });
      } else if (outcome === null) {
        await deleteHolding(holding.id);
      } else if (input.side === "buy") {
        await updateHolding(holding.id, { qty: outcome.qty, avgPricePaise: outcome.avgPricePaise });
      } else {
        await updateHolding(holding.id, { qty: outcome.qty });
      }

      const tag = input.side === "buy" ? "BUY" : "SELL";
      const txn = await insertTransaction({
        type: input.side === "buy" ? "expense" : "income",
        amountPaise: costPaise,
        category: "investments",
        note: `${tag} ${symbol} × ${qty} @ ${formatINR(pricePaise)}`,
        dateISO: todayISO(),
        payMode: "Bank",
        ...(accountId ? { accountId } : {}),
        tags: ["simulated-brokerage"],
      });

      return { transactionId: txn.id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finverse", "holdings"] });
      qc.invalidateQueries({ queryKey: ["finverse", "transactions"] });
      qc.invalidateQueries({ queryKey: ["finverse", "account-summaries"] });
      qc.invalidateQueries({ queryKey: ["finverse", "tags"] });
    },
  });
}
