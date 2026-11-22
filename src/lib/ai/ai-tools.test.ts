import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AI_TOOL_DEFINITIONS,
  categoryMatches,
  executeTool,
  isInvestmentOrderRow,
  type ToolDataAccess,
  type ToolHistoryBar,
  type ToolQuote,
  type ToolTransactionRow,
} from "../../../supabase/functions/_shared/ai-tools.ts";
import { parseGetTransactionsArgs } from "../../../supabase/functions/_shared/ai-validation.ts";

/**
 * Tool tests for the ai-chat Edge Function. A fake `ToolDataAccess`
 * stands in for PostgREST + the market-data function; the tools'
 * math, filtering, and validation are all exercised against fixed data.
 *
 * Dates are pinned (fake timers at 2026-11-23) because
 * `getCategorySpending` windows on "today".
 */

const TXNS: ToolTransactionRow[] = [
  {
    id: "t1",
    type: "expense",
    amountPaise: 125_000,
    category: "food",
    note: "Dinner at Spice House",
    dateISO: "2026-11-19",
    tags: [],
  },
  {
    id: "t2",
    type: "expense",
    amountPaise: 90_000,
    category: "food",
    note: "Grocery run",
    dateISO: "2026-11-18",
    tags: [],
  },
  {
    id: "t3",
    type: "expense",
    amountPaise: 42_000,
    category: "transport",
    note: "Metro card",
    dateISO: "2026-11-15",
    tags: [],
  },
  {
    id: "t4",
    type: "expense",
    amountPaise: 800_000,
    category: "food",
    note: "Party catering",
    dateISO: "2026-10-20",
    tags: [],
  },
  {
    id: "t5",
    type: "income",
    amountPaise: 6_000_000,
    category: "salary",
    note: "November salary",
    dateISO: "2026-11-01",
    tags: [],
  },
  {
    id: "t6",
    type: "transfer",
    amountPaise: 500_000,
    category: "investments",
    note: "RELIANCE buy",
    dateISO: "2026-11-10",
    tags: ["simulated-brokerage"],
  },
  {
    id: "t7",
    type: "transfer",
    amountPaise: 200_000,
    category: "investments",
    note: "SIP",
    dateISO: "2026-11-05",
    tags: [],
  },
  {
    id: "t8",
    type: "expense",
    amountPaise: 300_000,
    category: "shopping",
    note: "Shoes",
    dateISO: "2026-11-12",
    tags: [],
  },
  {
    id: "t9",
    type: "expense",
    amountPaise: 700_000,
    category: "investments",
    note: "Old buy",
    dateISO: "2026-11-08",
    tags: ["simulated-brokerage"],
  },
];

const QUOTES: Record<string, ToolQuote> = {
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    price: 2600,
    prevClose: 2580,
    change: 20,
    changePct: 0.78,
    currency: "INR",
    asOf: "2026-11-22T10:00:00Z",
  },
};

/** 63 daily closes, steadily rising ₹3/day from ₹2,400 (RSI = 100). */
const HISTORY: ToolHistoryBar[] = Array.from({ length: 63 }, (_, i) => ({
  date: `2026-09-${String(i + 1).padStart(2, "0")}`,
  close: 2400 + i * 3,
  volume: null,
}));

/** searchKnowledge calls made through fakeData(), reset per test. */
const SEARCH_CALLS: Array<{ query: string; symbol: string | null; topK: number }> = [];

function fakeData(): ToolDataAccess {
  return {
    async listTransactions(filter) {
      const rows = TXNS.filter((row) => {
        if (filter.type && row.type !== filter.type) return false;
        if (filter.startDate && row.dateISO < filter.startDate) return false;
        if (filter.endDate && row.dateISO > filter.endDate) return false;
        return true;
      });
      rows.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
      return rows.slice(0, filter.limit);
    },
    async listBudgets(month) {
      if (month !== "2026-11") return [];
      return [
        { categoryId: "food", month, limitPaise: 1_000_000 },
        { categoryId: "transport", month, limitPaise: 500_000 },
      ];
    },
    async listGoals() {
      return [
        {
          name: "Emergency fund",
          targetPaise: 10_000_000,
          savedPaise: 4_000_000,
          deadline: "2027-06-30",
        },
        {
          name: "Laptop",
          targetPaise: 8_000_000,
          savedPaise: 8_000_000,
          deadline: "2026-12-31",
        },
      ];
    },
    async listHoldings() {
      return [
        { symbol: "RELIANCE", qty: 10, avgPricePaise: 240_000 },
        { symbol: "TCS", qty: 5, avgPricePaise: 300_000 },
      ];
    },
    async getQuote(yahooSymbol) {
      return QUOTES[yahooSymbol] ?? null;
    },
    async getHistory(yahooSymbol) {
      return yahooSymbol === "RELIANCE.NS" ? HISTORY : null;
    },
    async searchKnowledge(query, symbol, topK) {
      SEARCH_CALLS.push({ query, symbol, topK });
      if (query.toLowerCase().includes("outage")) {
        return { available: false, chunks: [], reason: "Retrieval is unavailable right now." };
      }
      if (query.toLowerCase().includes("long")) {
        return {
          available: true,
          reason: null,
          chunks: [
            {
              id: "doc-long",
              sourceType: "guide",
              title: "Long guide",
              symbol: null,
              publishedAt: null,
              url: null,
              similarity: 0.9,
              content: "x".repeat(700),
            },
          ],
        };
      }
      if (query.toLowerCase().includes("sip")) {
        return {
          available: true,
          reason: null,
          chunks: [
            {
              id: "doc-sip",
              sourceType: "guide",
              title: "What is a SIP?",
              symbol: null,
              publishedAt: "2026-11-23T10:00:00Z",
              url: null,
              similarity: 0.87654,
              content: "A SIP invests a fixed amount every month.",
            },
          ],
        };
      }
      return { available: true, chunks: [], reason: null };
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-23T12:00:00Z"));
  SEARCH_CALLS.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("tool definitions", () => {
  it("exposes the 8 M3 tools and not getReadinessScore yet", () => {
    const names = AI_TOOL_DEFINITIONS.map((d) => d.function.name).sort();
    expect(names).toEqual(
      [
        "getBudgetStatus",
        "getCategorySpending",
        "getGoalProgress",
        "getPortfolioSummary",
        "getStockFundamentals",
        "getStockQuote",
        "getTransactions",
        "searchKnowledge",
      ].sort(),
    );
    expect(names).not.toContain("getReadinessScore");
  });
});

describe("getBudgetStatus", () => {
  it("sums spend per budgeted category and the month income", async () => {
    const result = await executeTool(fakeData(), "getBudgetStatus", {
      month: "2026-11",
    });
    expect(result).toEqual({
      available: true,
      month: "2026-11",
      monthlyIncome: 60000,
      categories: [
        {
          name: "Food & Dining",
          budgeted: 10000,
          spent: 2150,
          remaining: 7850,
          overBudget: false,
        },
        {
          name: "Transport",
          budgeted: 5000,
          spent: 420,
          remaining: 4580,
          overBudget: false,
        },
      ],
      totalBudgeted: 15000,
      totalSpent: 2570,
      totalRemaining: 12430,
    });
  });

  it("reports available:false when no budgets exist for the month", async () => {
    const result = await executeTool(fakeData(), "getBudgetStatus", {
      month: "2026-10",
    });
    expect(result).toEqual({
      available: false,
      month: "2026-10",
      reason: "No budgets are set for 2026-10 yet.",
    });
  });

  it("rejects a bad month", async () => {
    await expect(executeTool(fakeData(), "getBudgetStatus", { month: "2026-13" })).rejects.toThrow(
      "month must be YYYY-MM.",
    );
    await expect(executeTool(fakeData(), "getBudgetStatus", { month: "Nov 2026" })).rejects.toThrow(
      "month must be YYYY-MM.",
    );
  });
});

describe("getTransactions", () => {
  it("returns the most recent first, expenses negative", async () => {
    const result = (await executeTool(fakeData(), "getTransactions", {})) as {
      count: number;
      returned: number;
      transactions: Array<{ name: string; amount: number; date: string }>;
    };
    expect(result.count).toBe(9);
    expect(result.returned).toBe(9);
    expect(result.transactions[0]).toEqual({
      name: "Dinner at Spice House",
      amount: -1250,
      category: "Food & Dining",
      date: "2026-11-19",
      type: "expense",
    });
    const salary = result.transactions.find((t) => t.name === "November salary");
    expect(salary?.amount).toBe(60000);
  });

  it("filters by category alias and date range", async () => {
    const result = (await executeTool(fakeData(), "getTransactions", {
      category: "dining",
      startDate: "2026-11-01",
      endDate: "2026-11-30",
    })) as { count: number; transactions: Array<{ name: string }> };
    expect(result.count).toBe(2);
    expect(result.transactions.map((t) => t.name)).toEqual([
      "Dinner at Spice House",
      "Grocery run",
    ]);
  });

  it("respects the limit (count covers the fetched window)", async () => {
    const unfiltered = (await executeTool(fakeData(), "getTransactions", {
      limit: 2,
    })) as { count: number; returned: number; transactions: unknown[] };
    // No category filter: the fetch itself is limited, so count is 2.
    expect(unfiltered.count).toBe(2);
    expect(unfiltered.returned).toBe(2);
    expect(unfiltered.transactions).toHaveLength(2);
    // With a category filter the window is wide (500) and count is the
    // full match count even when only `limit` rows are returned.
    const filtered = (await executeTool(fakeData(), "getTransactions", {
      category: "food",
      limit: 2,
    })) as { count: number; returned: number; transactions: unknown[] };
    expect(filtered.count).toBe(3);
    expect(filtered.returned).toBe(2);
    expect(filtered.transactions).toHaveLength(2);
  });

  it("rejects a bad limit and bad dates", async () => {
    await expect(executeTool(fakeData(), "getTransactions", { limit: 0 })).rejects.toThrow(
      "limit must be an integer between 1 and 50.",
    );
    await expect(executeTool(fakeData(), "getTransactions", { limit: 51 })).rejects.toThrow(
      "limit must be an integer between 1 and 50.",
    );
    await expect(
      executeTool(fakeData(), "getTransactions", { startDate: "2026-02-30" }),
    ).rejects.toThrow("startDate must be a date (YYYY-MM-DD).");
    await expect(executeTool(fakeData(), "getTransactions", { endDate: "Nov 1" })).rejects.toThrow(
      "endDate must be a date (YYYY-MM-DD).",
    );
  });

  it("applies parser defaults (limit 20, no filters)", () => {
    expect(parseGetTransactionsArgs({})).toEqual({
      ok: true,
      value: { category: null, startDate: null, endDate: null, limit: 20 },
    });
  });
});

describe("getPortfolioSummary", () => {
  it("values live-priced holdings at market and the rest at avg buy", async () => {
    const result = (await executeTool(fakeData(), "getPortfolioSummary", {})) as {
      holdings: Array<{ symbol: string; priced: boolean; price: number; value: number }>;
      totals: {
        totalValue: number;
        totalInvested: number;
        totalGainLoss: number;
        totalGainLossPercent: number;
      };
      priced: boolean;
      note: string | null;
    };
    const reliance = result.holdings.find((h) => h.symbol === "RELIANCE");
    const tcs = result.holdings.find((h) => h.symbol === "TCS");
    expect(reliance).toMatchObject({ priced: true, price: 2600, value: 26000 });
    expect(tcs).toMatchObject({ priced: false, price: 3000, value: 15000 });
    expect(result.totals).toEqual({
      totalValue: 41000,
      totalInvested: 39000,
      totalGainLoss: 2000,
      totalGainLossPercent: 5.13,
    });
    expect(result.priced).toBe(false);
    expect(result.note).toContain("average buy price");
  });
});

describe("getStockQuote", () => {
  it("returns the live quote for a known symbol", async () => {
    const result = await executeTool(fakeData(), "getStockQuote", {
      symbol: "RELIANCE",
    });
    expect(result).toEqual({
      symbol: "RELIANCE.NS",
      price: 2600,
      previousClose: 2580,
      change: 20,
      changePercent: 0.78,
      currency: "INR",
      asOf: "2026-11-22T10:00:00Z",
    });
  });

  it("fails honestly when no price is available", async () => {
    await expect(executeTool(fakeData(), "getStockQuote", { symbol: "TCS" })).rejects.toThrow(
      "No price is available for TCS right now.",
    );
  });

  it("rejects an unknown symbol shape and an empty symbol", async () => {
    await expect(executeTool(fakeData(), "getStockQuote", { symbol: "FAKE CO" })).rejects.toThrow(
      "is not a known stock or index symbol.",
    );
    await expect(executeTool(fakeData(), "getStockQuote", { symbol: "" })).rejects.toThrow(
      "A stock symbol is required (1–20 characters).",
    );
  });
});

describe("getStockFundamentals", () => {
  it("computes technicals from a fixed close series", async () => {
    const result = (await executeTool(fakeData(), "getStockFundamentals", {
      symbol: "RELIANCE",
    })) as {
      price: number;
      technicals: {
        barsUsed: number;
        rsi14: number | null;
        sma20: number | null;
        sma50: number | null;
        macd: { macd: number; signal: number; histogram: number } | null;
        change1moPercent: number | null;
        change3moPercent: number | null;
        rangeHigh3mo: number;
        rangeLow3mo: number;
        note: string | null;
      };
    };
    expect(result.price).toBe(2600);
    expect(result.technicals.barsUsed).toBe(63);
    expect(result.technicals.rsi14).toBe(100);
    expect(result.technicals.sma20).toBe(2557.5);
    expect(result.technicals.sma50).toBe(2512.5);
    expect(result.technicals.macd).not.toBeNull();
    expect(Number.isFinite(result.technicals.macd?.macd)).toBe(true);
    expect(result.technicals.change1moPercent).toBe(2.5);
    expect(result.technicals.change3moPercent).toBe(7.75);
    expect(result.technicals.rangeHigh3mo).toBe(2586);
    expect(result.technicals.rangeLow3mo).toBe(2400);
    expect(result.technicals.note).toBeNull();
  });

  it("has no P/E or market-cap fields (quoteSummary is unavailable)", async () => {
    const result = (await executeTool(fakeData(), "getStockFundamentals", {
      symbol: "RELIANCE",
    })) as Record<string, unknown>;
    expect(result).not.toHaveProperty("trailingPE");
    expect(result).not.toHaveProperty("marketCap");
    expect(result).not.toHaveProperty("fiftyTwoWeekHigh");
  });

  it("fails honestly when history is unavailable", async () => {
    await expect(
      executeTool(fakeData(), "getStockFundamentals", { symbol: "TCS" }),
    ).rejects.toThrow("No price history is available for TCS right now.");
  });
});

describe("getCategorySpending", () => {
  it("sums the current month for a category alias", async () => {
    const result = (await executeTool(fakeData(), "getCategorySpending", {
      category: "dining",
      period: "month",
    })) as {
      category: string;
      period: string;
      startDate: string;
      endDate: string;
      totalSpent: number;
      count: number;
      largest: Array<{ name: string; amount: number }>;
    };
    expect(result).toEqual({
      category: "dining",
      period: "month",
      startDate: "2026-11-01",
      endDate: "2026-11-23",
      totalSpent: 2150,
      count: 2,
      largest: [
        { name: "Dinner at Spice House", amount: 1250, date: "2026-11-19" },
        { name: "Grocery run", amount: 900, date: "2026-11-18" },
      ],
    });
  });

  it("windows week and 3months correctly", async () => {
    const week = (await executeTool(fakeData(), "getCategorySpending", {
      category: "food",
      period: "week",
    })) as { startDate: string; totalSpent: number; count: number };
    expect(week.startDate).toBe("2026-11-17");
    expect(week.totalSpent).toBe(2150);
    const three = (await executeTool(fakeData(), "getCategorySpending", {
      category: "food",
      period: "3months",
    })) as { startDate: string; totalSpent: number; count: number };
    expect(three.startDate).toBe("2026-09-01");
    expect(three.totalSpent).toBe(10150);
    expect(three.count).toBe(3);
  });

  it("excludes simulated-brokerage rows from category spend", async () => {
    const result = (await executeTool(fakeData(), "getCategorySpending", {
      category: "investments",
      period: "month",
    })) as { totalSpent: number; count: number };
    expect(result.totalSpent).toBe(0);
    expect(result.count).toBe(0);
  });

  it("rejects a missing category and a bad period", async () => {
    await expect(executeTool(fakeData(), "getCategorySpending", {})).rejects.toThrow(
      "A category is required (1–40 characters).",
    );
    await expect(
      executeTool(fakeData(), "getCategorySpending", {
        category: "food",
        period: "year",
      }),
    ).rejects.toThrow('period must be "week", "month", or "3months".');
  });
});

describe("getGoalProgress", () => {
  it("sums goals with per-goal progress", async () => {
    const result = (await executeTool(fakeData(), "getGoalProgress", {})) as {
      goals: Array<{ name: string; progressPercent: number; remaining: number }>;
      totalTarget: number;
      totalSaved: number;
    };
    expect(result.totalTarget).toBe(180000);
    expect(result.totalSaved).toBe(120000);
    expect(result.goals).toEqual([
      {
        name: "Emergency fund",
        target: 100000,
        saved: 40000,
        remaining: 60000,
        progressPercent: 40,
        targetDate: "2027-06-30",
      },
      {
        name: "Laptop",
        target: 80000,
        saved: 80000,
        remaining: 0,
        progressPercent: 100,
        targetDate: "2026-12-31",
      },
    ]);
  });
});

describe("searchKnowledge", () => {
  it("returns mapped chunks from the data access", async () => {
    const result = await executeTool(fakeData(), "searchKnowledge", {
      query: "what is a SIP?",
    });
    expect(result).toEqual({
      available: true,
      chunks: [
        {
          sourceType: "guide",
          title: "What is a SIP?",
          symbol: null,
          // Full timestamp in the store, date-only in the tool result.
          publishedAt: "2026-11-23",
          url: null,
          // Similarity rounded to 2 decimals (0.87654 → 0.88).
          similarity: 0.88,
          content: "A SIP invests a fixed amount every month.",
        },
      ],
    });
  });

  it("returns available:false with the reason when retrieval is down", async () => {
    const result = await executeTool(fakeData(), "searchKnowledge", {
      query: "outage test",
    });
    expect(result).toEqual({
      available: false,
      reason: "Retrieval is unavailable right now.",
      chunks: [],
    });
  });

  it("returns available:true with zero chunks when nothing matches", async () => {
    const result = await executeTool(fakeData(), "searchKnowledge", {
      query: "obscure topic",
    });
    expect(result).toEqual({ available: true, chunks: [] });
  });

  it("still validates its arguments", async () => {
    await expect(executeTool(fakeData(), "searchKnowledge", { query: "" })).rejects.toThrow(
      "A search query is required (1–500 characters).",
    );
  });

  it("normalises the symbol to Yahoo form and asks for the top 3", async () => {
    await executeTool(fakeData(), "searchKnowledge", {
      query: "RELIANCE news",
      symbol: "RELIANCE",
    });
    expect(SEARCH_CALLS).toHaveLength(1);
    expect(SEARCH_CALLS[0]?.symbol).toBe("RELIANCE.NS");
    expect(SEARCH_CALLS[0]?.topK).toBe(3);
  });

  it("caps long chunk content at 600 characters", async () => {
    const result = (await executeTool(fakeData(), "searchKnowledge", {
      query: "long guide",
    })) as { chunks: Array<{ content: string }> };
    expect(result.chunks[0]?.content).toBe(`${"x".repeat(600)}…`);
  });
});

describe("executeTool — unknown tools", () => {
  it("throws on an invented tool name", async () => {
    await expect(executeTool(fakeData(), "getCryptoPrices", {})).rejects.toThrow(
      "Unknown tool: getCryptoPrices",
    );
  });
});

describe("categoryMatches", () => {
  it("matches by id, label, and label word (case-insensitive)", () => {
    expect(categoryMatches("food", "food")).toBe(true);
    expect(categoryMatches("food", "Food & Dining")).toBe(true);
    expect(categoryMatches("food", "DINING")).toBe(true);
    expect(categoryMatches("food", "groceries")).toBe(false);
    expect(categoryMatches("food", "")).toBe(false);
    expect(categoryMatches("food", "foo")).toBe(false);
  });
});

describe("isInvestmentOrderRow", () => {
  it("flags both simulated-brokerage ledger shapes", () => {
    expect(isInvestmentOrderRow(TXNS[5]!)).toBe(true); // tagged transfer
    expect(isInvestmentOrderRow(TXNS[6]!)).toBe(true); // transfer + investments
    expect(isInvestmentOrderRow(TXNS[8]!)).toBe(true); // legacy tagged expense
    expect(isInvestmentOrderRow(TXNS[0]!)).toBe(false); // plain expense
    expect(isInvestmentOrderRow(TXNS[4]!)).toBe(false); // salary income
  });
});
