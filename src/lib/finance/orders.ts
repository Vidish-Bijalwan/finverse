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
 * Simulated-brokerage order execution. Every order writes the shared ledger
 * as a TRANSFER (brief §12: investment buys/sells are cash ↔ investments
 * moves, never expenses/income):
 *  - BUY  -> upsert `holdings` (weighted-average qty/avg_price) + a
 *           "transfer" transaction (category "investments",
 *           note `BUY SYMBOL × qty @ price`, accountId = cash account
 *           debited, no toAccountId — the destination is the holdings
 *           ledger, same shape as goal-saving transfers).
 *  - SELL -> reduce the holding qty (honest error when insufficient; the
 *           holding row is removed when qty reaches zero) + a "transfer"
 *           transaction (category "investments", note `SELL SYMBOL × qty @
 *           price`, toAccountId = cash account credited).
 * Because the type is "transfer", no spend/income aggregation (dashboard
 * cash flow, top categories, insights, budgets, AI engine — they all key on
 * expense/income) ever counts an investment order as spending. Cash balances
 * stay exact via balanceForAccount (transfer debits the source account and
 * credits the destination account).
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
        // Transfer, not expense/income: a buy moves cash → investments, a
        // sell moves investments → cash. See the module docstring.
        type: "transfer",
        amountPaise: costPaise,
        category: "investments",
        note: `${tag} ${symbol} × ${qty} @ ${formatINR(pricePaise)}`,
        dateISO: todayISO(),
        payMode: "Bank",
        // Buy: debit the cash account. Sell: credit the cash account. The
        // other side of the transfer is the holdings ledger (not an account).
        ...(accountId ? (input.side === "buy" ? { accountId } : { toAccountId: accountId }) : {}),
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
