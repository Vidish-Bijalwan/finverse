import { describe, expect, it } from "vitest";
import {
  buildMonthFlows,
  buildWeekFlows,
  categoryMover,
  dateLabel,
  payModeLabel,
  recentTransactions,
  shiftMonthKey,
  shortMonthLabel,
  signedAmountPaise,
  timeLabel,
  topSpendingCategories,
  txnSecondary,
} from "./home-data";
import type { Transaction } from "@/lib/finance/types";

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

describe("shiftMonthKey", () => {
  it("shifts months with year rollover", () => {
    expect(shiftMonthKey("2026-10", -1)).toBe("2026-09");
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthKey("2026-12", 1)).toBe("2027-01");
    expect(shiftMonthKey("2026-10", 0)).toBe("2026-10");
  });
});

describe("shortMonthLabel", () => {
  it("abbreviates month keys", () => {
    expect(shortMonthLabel("2026-10")).toBe("Oct");
    expect(shortMonthLabel("2026-01")).toBe("Jan");
  });
});

describe("dateLabel / timeLabel", () => {
  it("formats calendar dates", () => {
    expect(dateLabel("2026-10-03")).toBe("3 Oct 2026");
  });
  it("returns empty string for unparseable times", () => {
    expect(timeLabel("not-a-date")).toBe("");
  });
});

describe("buildMonthFlows", () => {
  it("aggregates trailing months ending at the anchor, zero-filling gaps", () => {
    const txns = [
      txn({ id: "a", dateISO: "2026-10-05", type: "expense", amountPaise: 5000 }),
      txn({ id: "b", dateISO: "2026-10-06", type: "income", amountPaise: 50000 }),
      txn({ id: "c", dateISO: "2026-08-20", type: "expense", amountPaise: 3000 }),
      // Outside the window — must not leak in.
      txn({ id: "d", dateISO: "2026-07-01", type: "expense", amountPaise: 9999 }),
    ];
    const flows = buildMonthFlows(txns, "2026-10", 3);
    expect(flows).toHaveLength(3);
    expect(flows[0]).toMatchObject({ key: "2026-08", label: "Aug", income: 0, expense: 3000 });
    expect(flows[1]).toMatchObject({ key: "2026-09", label: "Sep", income: 0, expense: 0 });
    expect(flows[2]).toMatchObject({
      key: "2026-10",
      label: "Oct",
      income: 50000,
      expense: 5000,
    });
  });

  it("counts transfers as neither income nor expense", () => {
    const txns = [txn({ id: "a", dateISO: "2026-10-05", type: "transfer", amountPaise: 5000 })];
    expect(buildMonthFlows(txns, "2026-10", 1)[0]).toMatchObject({ income: 0, expense: 0 });
  });
});

describe("buildWeekFlows", () => {
  it("buckets a month into day-of-month weeks with honest labels", () => {
    const txns = [
      txn({ id: "a", dateISO: "2026-10-03", type: "expense", amountPaise: 1000 }),
      txn({ id: "b", dateISO: "2026-10-09", type: "income", amountPaise: 20000 }),
      txn({ id: "c", dateISO: "2026-10-30", type: "expense", amountPaise: 4000 }),
      // Different month — excluded.
      txn({ id: "d", dateISO: "2026-09-30", type: "expense", amountPaise: 7777 }),
    ];
    const weeks = buildWeekFlows(txns, "2026-10");
    expect(weeks.map((w) => w.label)).toEqual(["1–7", "8–14", "15–21", "22–28", "29–31"]);
    expect(weeks[0]).toMatchObject({ income: 0, expense: 1000 });
    expect(weeks[1]).toMatchObject({ income: 20000, expense: 0 });
    expect(weeks[4]).toMatchObject({ income: 0, expense: 4000 });
  });

  it("trims the last week for short months", () => {
    const weeks = buildWeekFlows([], "2026-02");
    expect(weeks.map((w) => w.label)).toEqual(["1–7", "8–14", "15–21", "22–28"]);
  });
});

describe("topSpendingCategories", () => {
  it("ranks expense categories over an inclusive month range", () => {
    const txns = [
      txn({ id: "a", dateISO: "2026-10-05", type: "expense", amountPaise: 1000, category: "food" }),
      txn({
        id: "b",
        dateISO: "2026-10-06",
        type: "expense",
        amountPaise: 5000,
        category: "travel",
      }),
      txn({
        id: "c",
        dateISO: "2026-09-06",
        type: "expense",
        amountPaise: 9000,
        category: "travel",
      }),
      txn({
        id: "d",
        dateISO: "2026-08-06",
        type: "expense",
        amountPaise: 50000,
        category: "travel",
      }),
      // Income must not appear.
      txn({
        id: "e",
        dateISO: "2026-10-07",
        type: "income",
        amountPaise: 99999,
        category: "salary",
      }),
    ];
    const top = topSpendingCategories(txns, "2026-09", "2026-10", 4);
    expect(top).toHaveLength(2);
    expect(top[0]).toMatchObject({ id: "travel", value: 14000 });
    expect(top[1]).toMatchObject({ id: "food", value: 1000 });
    expect(top[0]?.label).toBeTruthy();
    expect(top[0]?.color).toMatch(/^#/);
  });

  it("respects the limit", () => {
    const txns = ["a", "b", "c", "d", "e"].map((id, i) =>
      txn({
        id,
        dateISO: "2026-10-05",
        type: "expense",
        amountPaise: (i + 1) * 100,
        category: `cat${i}`,
      }),
    );
    expect(topSpendingCategories(txns, "2026-10", "2026-10", 2)).toHaveLength(2);
  });
});

describe("categoryMover", () => {
  it("finds the biggest absolute spend change, with direction", () => {
    const txns = [
      txn({
        id: "a",
        dateISO: "2026-09-05",
        type: "expense",
        amountPaise: 10000,
        category: "food",
      }),
      txn({
        id: "b",
        dateISO: "2026-10-05",
        type: "expense",
        amountPaise: 11800,
        category: "food",
      }),
      txn({
        id: "c",
        dateISO: "2026-09-05",
        type: "expense",
        amountPaise: 50000,
        category: "travel",
      }),
      txn({
        id: "d",
        dateISO: "2026-10-05",
        type: "expense",
        amountPaise: 30000,
        category: "travel",
      }),
    ];
    const mover = categoryMover(txns, "2026-10", "2026-09");
    expect(mover).toMatchObject({ delta: -20000, direction: "down", pct: -40 });
    expect(mover?.label).toBeTruthy();
  });

  it("reports an increase with a null pct when there is no previous base", () => {
    const txns = [
      txn({ id: "a", dateISO: "2026-10-05", type: "expense", amountPaise: 5000, category: "food" }),
    ];
    expect(categoryMover(txns, "2026-10", "2026-09")).toMatchObject({
      delta: 5000,
      direction: "up",
      pct: null,
    });
  });

  it("returns null when nothing moved — no card should render", () => {
    expect(categoryMover([], "2026-10", "2026-09")).toBeNull();
    const flat = [
      txn({ id: "a", dateISO: "2026-10-05", type: "expense", amountPaise: 5000, category: "food" }),
      txn({ id: "b", dateISO: "2026-09-05", type: "expense", amountPaise: 5000, category: "food" }),
    ];
    expect(categoryMover(flat, "2026-10", "2026-09")).toBeNull();
  });
});

describe("recentTransactions", () => {
  it("sorts newest first", () => {
    const txns = [
      txn({ id: "a", dateISO: "2026-10-01" }),
      txn({ id: "b", dateISO: "2026-10-03" }),
      txn({ id: "c", dateISO: "2026-09-28" }),
    ];
    expect(recentTransactions(txns, 7).map((t) => t.id)).toEqual(["b", "a", "c"]);
  });
});

describe("signedAmountPaise", () => {
  it("signs by type", () => {
    expect(
      signedAmountPaise(txn({ id: "a", dateISO: "2026-10-01", type: "income", amountPaise: 100 })),
    ).toBe(100);
    expect(
      signedAmountPaise(txn({ id: "b", dateISO: "2026-10-01", type: "expense", amountPaise: 100 })),
    ).toBe(-100);
    expect(
      signedAmountPaise(
        txn({ id: "c", dateISO: "2026-10-01", type: "transfer", amountPaise: 100 }),
      ),
    ).toBe(-100);
  });
});

describe("txnSecondary", () => {
  it("builds a payment-app-style second line", () => {
    const t = txn({
      id: "a",
      dateISO: "2026-10-03",
      note: "Swiggy",
      category: "food",
      payMode: "UPI",
      createdAt: "2026-10-03T14:30:00.000Z",
    });
    const line = txnSecondary(t, true);
    expect(line).toContain("3 Oct 2026");
    expect(line).toContain("Dining");
    expect(line).toContain("UPI");
  });

  it("omits the category when the name already shows it", () => {
    const t = txn({ id: "a", dateISO: "2026-10-03", category: "food", payMode: "Cash" });
    expect(txnSecondary(t, false)).not.toContain("Dining");
  });
});

describe("payModeLabel", () => {
  it("humanizes test pay modes", () => {
    expect(payModeLabel("upi_test")).toBe("UPI · test");
    expect(payModeLabel("razorpay_test")).toBe("Razorpay · test");
    expect(payModeLabel("UPI")).toBe("UPI");
  });
});
