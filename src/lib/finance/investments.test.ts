/**
 * Regression tests for the Bug 4 financial-logic fix (brief §12):
 * investment buys/sells are TRANSFERS (cash ↔ investments), never
 * expenses/income — so they must not move Spent/Income totals or appear in
 * top-spending categories, while still moving cash the right way.
 */
import { describe, expect, it } from "vitest";

import { balanceForAccount } from "./db";
import {
  buildMonthFlows,
  signedAmountPaise,
  topSpendingCategories,
} from "@/components/home/home-data";
import type { Account, Transaction } from "./types";
import { firstBuyDateBySymbol, isInvestmentOrder } from "./investments";

function txn(over: Partial<Transaction> & { id: string; dateISO: string }): Transaction {
  return {
    type: "expense",
    amountPaise: 0,
    category: "food",
    note: "",
    payMode: "UPI",
    createdAt: `${over.dateISO}T10:30:00.000Z`,
    updatedAt: `${over.dateISO}T10:30:00.000Z`,
    ...over,
  } as Transaction;
}

const CASH = {
  id: "acc-cash",
  name: "Cash",
  openingBalancePaise: 100_000_00, // ₹100,000
  isDefault: true,
} as unknown as Account;

/** Ledger row as written by usePlaceOrder AFTER the fix (transfer shape). */
const buyTransfer = (id: string, dateISO: string, amountPaise: number): Transaction =>
  txn({
    id,
    dateISO,
    type: "transfer",
    amountPaise,
    category: "investments",
    note: "BUY RELIANCE × 10 @ ₹1,580",
    accountId: CASH.id,
    tags: ["simulated-brokerage"],
  });

/** Ledger row as written by usePlaceOrder BEFORE the fix (legacy shape). */
const buyLegacyExpense = (id: string, dateISO: string, amountPaise: number): Transaction =>
  txn({
    id,
    dateISO,
    type: "expense",
    amountPaise,
    category: "investments",
    note: "BUY RELIANCE × 10 @ ₹1,580",
    accountId: CASH.id,
    tags: ["simulated-brokerage"],
  });

/** SELL row as written by usePlaceOrder AFTER the fix: proceeds → cash. */
const sellTransfer = (id: string, dateISO: string, amountPaise: number): Transaction =>
  txn({
    id,
    dateISO,
    type: "transfer",
    amountPaise,
    category: "investments",
    note: "SELL RELIANCE × 10 @ ₹1,620",
    toAccountId: CASH.id,
    tags: ["simulated-brokerage"],
  });

describe("isInvestmentOrder", () => {
  it("matches the new transfer-shaped brokerage rows", () => {
    expect(isInvestmentOrder(buyTransfer("t1", "2026-10-03", 1_580_00))).toBe(true);
    expect(isInvestmentOrder(sellTransfer("t2", "2026-10-03", 1_620_00))).toBe(true);
  });

  it("matches legacy expense/income-shaped brokerage rows", () => {
    expect(isInvestmentOrder(buyLegacyExpense("t3", "2026-10-03", 1_580_00))).toBe(true);
    expect(
      isInvestmentOrder(
        txn({
          id: "t4",
          dateISO: "2026-10-03",
          type: "income",
          amountPaise: 1_620_00,
          category: "investments",
          note: "SELL RELIANCE × 10 @ ₹1,620",
          tags: ["simulated-brokerage"],
        }),
      ),
    ).toBe(true);
  });

  it("matches SIP instalment posts (investments + simulated-brokerage tag)", () => {
    expect(
      isInvestmentOrder(
        txn({
          id: "t5",
          dateISO: "2026-10-03",
          type: "expense",
          amountPaise: 5_000_00,
          category: "investments",
          note: "SIP RELIANCE",
          tags: ["sip", "simulated-brokerage"],
        }),
      ),
    ).toBe(true);
  });

  it("does NOT match ordinary spending or hand-logged investments", () => {
    expect(isInvestmentOrder(txn({ id: "t6", dateISO: "2026-10-03" }))).toBe(false);
    // A PPF deposit the user categorized by hand carries no brokerage tag.
    expect(
      isInvestmentOrder(
        txn({
          id: "t7",
          dateISO: "2026-10-03",
          type: "expense",
          amountPaise: 10_000_00,
          category: "investments",
          note: "PPF deposit",
        }),
      ),
    ).toBe(false);
  });
});

describe("firstBuyDateBySymbol", () => {
  it("returns the earliest BUY date per symbol and ignores sells", () => {
    const txns = [
      buyTransfer("b1", "2026-10-02", 1_580_00),
      buyTransfer("b2", "2026-10-03", 1_590_00),
      sellTransfer("s1", "2026-10-04", 1_620_00),
      txn({ id: "x", dateISO: "2026-09-01", note: "Grocery" }),
    ];
    const out = firstBuyDateBySymbol(txns);
    expect(out.get("RELIANCE")).toBe("2026-10-02");
    expect(out.has("INFY")).toBe(false);
  });

  it("returns an empty map when there are no buys", () => {
    expect(firstBuyDateBySymbol([]).size).toBe(0);
  });
});

describe("bug 4: buys are transfers, not spending", () => {
  const grocery = txn({
    id: "g1",
    dateISO: "2026-10-03",
    type: "expense",
    amountPaise: 2_000_00,
    category: "food",
    note: "Grocery",
  });

  it("a buy decreases cash and leaves Spent unchanged (new transfer shape)", () => {
    const buy = buyTransfer("b1", "2026-10-03", 15_800_00); // ₹15,800
    expect(balanceForAccount(CASH, [buy])).toBe(100_000_00 - 15_800_00);

    const flows = buildMonthFlows([grocery, buy], "2026-10", 1);
    expect(flows[0]!.expense).toBe(2_000_00); // only the grocery counts

    const top = topSpendingCategories([grocery, buy], "2026-10", "2026-10");
    expect(top.map((c) => c.id)).toEqual(["food"]);
    expect(top.some((c) => c.id === "investments")).toBe(false);
  });

  it("a buy decreases cash and leaves Spent unchanged (legacy expense shape)", () => {
    const buy = buyLegacyExpense("b1", "2026-10-03", 15_800_00);
    expect(balanceForAccount(CASH, [buy])).toBe(100_000_00 - 15_800_00);

    const flows = buildMonthFlows([grocery, buy], "2026-10", 1);
    expect(flows[0]!.expense).toBe(2_000_00);

    const top = topSpendingCategories([grocery, buy], "2026-10", "2026-10");
    expect(top.map((c) => c.id)).toEqual(["food"]);
  });

  it("a sell increases cash and leaves Income unchanged", () => {
    const sell = sellTransfer("s1", "2026-10-03", 16_200_00); // ₹16,200
    expect(balanceForAccount(CASH, [sell])).toBe(100_000_00 + 16_200_00);

    const salary = txn({
      id: "i1",
      dateISO: "2026-10-03",
      type: "income",
      amountPaise: 80_000_00,
      category: "salary",
      note: "Salary",
    });
    const flows = buildMonthFlows([salary, sell], "2026-10", 1);
    expect(flows[0]!.income).toBe(80_000_00); // sell proceeds are not income
  });
});

describe("signedAmountPaise for investment transfers", () => {
  it("buy transfer (cash → investments) renders negative", () => {
    expect(signedAmountPaise(buyTransfer("b1", "2026-10-03", 15_800_00))).toBe(-15_800_00);
  });

  it("sell transfer (investments → cash) renders positive", () => {
    expect(signedAmountPaise(sellTransfer("s1", "2026-10-03", 16_200_00))).toBe(16_200_00);
  });

  it("account-to-account transfers keep the existing money-out sign", () => {
    const t = txn({
      id: "x1",
      dateISO: "2026-10-03",
      type: "transfer",
      amountPaise: 5_000_00,
      category: "others",
      accountId: "a",
      toAccountId: "b",
    });
    expect(signedAmountPaise(t)).toBe(-5_000_00);
  });
});
