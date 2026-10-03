/**
 * Simulated-brokerage investment helpers (pure, side-effect free).
 *
 * Financial-logic contract (brief §12): investment buys/sells are TRANSFERS
 * (cash ↔ investments), never expenses/income. `usePlaceOrder` writes them
 * as `type: "transfer"`; rows written before that fix exist as
 * expense/income with the "simulated-brokerage" tag. `isInvestmentOrder`
 * identifies both shapes so spend/income aggregations can exclude them.
 */
import type { Transaction } from "./types";

/** Tag written on every simulated-brokerage ledger row (orders + SIP posts). */
export const SIMULATED_BROKERAGE_TAG = "simulated-brokerage";

/**
 * Parse a simulated-brokerage ledger note of the form
 * "BUY RELIANCE × 10 @ ₹1,580" (see usePlaceOrder in lib/finance/orders.ts).
 * Returns null for notes that aren't brokerage orders. The execution price is
 * recovered from amount ÷ qty by the caller — formatINR rounds notes to
 * whole rupees, so the note text alone can't carry exact paise.
 */
export function parseOrderNote(note: string): {
  side: "buy" | "sell";
  symbol: string;
  qty: number;
} | null {
  const m = /^(BUY|SELL)\s+([A-Z0-9.]+)\s+×\s+(\d+)\s+@/.exec(note.trim());
  if (!m) return null;
  return {
    side: m[1] === "BUY" ? "buy" : "sell",
    symbol: m[2]!,
    qty: Number.parseInt(m[3]!, 10),
  };
}

/**
 * True for simulated-brokerage investment rows — BUY/SELL orders and SIP
 * instalment posts — in BOTH ledger shapes: the current `transfer` shape and
 * the legacy `expense`/`income` shape. These must never count as spending or
 * income anywhere (dashboard cash flow, insights, expenses views, budgets).
 *
 * Deliberately narrow: a manually-categorized "investments" expense (e.g. a
 * PPF deposit the user logged by hand) carries no simulated-brokerage tag
 * and is NOT excluded — only system-written brokerage rows are.
 */
export function isInvestmentOrder(t: Transaction): boolean {
  return t.category === "investments" && (t.tags ?? []).includes(SIMULATED_BROKERAGE_TAG);
}

/**
 * Earliest BUY order date ("YYYY-MM-DD") per symbol, parsed from
 * simulated-brokerage ledger notes. Symbols with no recorded buy (e.g.
 * holdings added by hand) are absent — callers must treat "unknown" as
 * unknown, never as "bought today".
 */
export function firstBuyDateBySymbol(txns: Transaction[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const t of txns) {
    if (!isInvestmentOrder(t)) continue;
    const parsed = parseOrderNote(t.note);
    if (!parsed || parsed.side !== "buy") continue;
    const prev = out.get(parsed.symbol);
    if (prev === undefined || t.dateISO < prev) out.set(parsed.symbol, t.dateISO);
  }
  return out;
}
