import { describe, expect, it } from "vitest";

import { verifyAnswer } from "../../../supabase/functions/_shared/ai-guardrail.ts";
import {
  AiRateLimiter,
  AiResponseCache,
  dbRateLimitAllows,
  rateLimitWindowStartIso,
} from "../../../supabase/functions/_shared/ai-limits.ts";
import { chatTemplate } from "../../../supabase/functions/_shared/ai-templates.ts";
import {
  parseStructuredJson,
  validateAiAnswer,
} from "../../../supabase/functions/_shared/ai-validation.ts";
import { parseAiChatResponse } from "./remote";

/**
 * Tests for the ai-chat answer contract, the template fallback, the
 * client response parser, and the rate-limit / cache helpers.
 *
 * The template round-trip is the key property: a template answer is
 * built ONLY from verified numbers, so feeding it back through the
 * guardrail must always pass (pinned here, so a template regression
 * fails loudly instead of shipping an unverifiable fallback).
 */

describe("parseStructuredJson", () => {
  const VALID = JSON.stringify({
    answer: "You spent ₹8,200 on food.",
    claims: [
      {
        text: "You spent ₹8,200 on food.",
        source: { tool: "getCategorySpending", values: { totalSpent: 8200 } },
      },
    ],
    refused: false,
    refusalReason: null,
  });

  it("parses plain JSON", () => {
    const result = parseStructuredJson(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.answer).toContain("₹8,200");
  });

  it("strips markdown fences defensively", () => {
    const result = parseStructuredJson(`\`\`\`json\n${VALID}\n\`\`\``);
    expect(result.ok).toBe(true);
  });

  it("rejects empty and non-JSON replies", () => {
    expect(parseStructuredJson(null).ok).toBe(false);
    expect(parseStructuredJson("").ok).toBe(false);
    expect(parseStructuredJson("not json at all")).toEqual({
      ok: false,
      error: "The model reply was not valid JSON.",
    });
  });

  it("rejects valid JSON that breaks the answer contract", () => {
    const result = parseStructuredJson(
      JSON.stringify({ answer: "Trust me.", claims: [], refused: false }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("at least one claim");
  });
});

describe("validateAiAnswer — the refusal rules", () => {
  it("accepts a well-formed refusal", () => {
    const result = validateAiAnswer({
      answer: "I cannot predict stock prices.",
      claims: [],
      refused: true,
      refusalReason: "I cannot predict stock prices.",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a refusal that carries claims", () => {
    const result = validateAiAnswer({
      answer: "I cannot predict stock prices.",
      claims: [
        {
          text: "RELIANCE is at ₹2,600.",
          source: { tool: "getStockQuote", values: { price: 2600 } },
        },
      ],
      refused: true,
      refusalReason: "I cannot predict stock prices.",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("must not carry claims");
  });

  it("rejects a refusal without a reason", () => {
    const result = validateAiAnswer({
      answer: "No.",
      claims: [],
      refused: true,
      refusalReason: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("refusal reason");
  });

  it("rejects a non-refused answer with no claims", () => {
    const result = validateAiAnswer({
      answer: "Everything is fine.",
      claims: [],
      refused: false,
      refusalReason: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects nested claim values (only scalars are citable)", () => {
    const result = validateAiAnswer({
      answer: "Your budget is fine.",
      claims: [
        {
          text: "Your budget is fine.",
          source: { tool: "getBudgetStatus", values: { categories: [] } },
        },
      ],
      refused: false,
      refusalReason: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("strings, numbers, booleans, or null");
  });
});

describe("chatTemplate — the fallback is verifiable by construction", () => {
  const SNAPSHOT = {
    getBudgetStatus: {
      available: true,
      month: "2026-11",
      monthlyIncome: 60000,
      categories: [
        {
          name: "Food & Dining",
          budgeted: 10000,
          spent: 10600,
          remaining: -600,
          overBudget: true,
        },
        {
          name: "Transport",
          budgeted: 5000,
          spent: 4200,
          remaining: 800,
          overBudget: false,
        },
      ],
      totalBudgeted: 15000,
      totalSpent: 14800,
      totalRemaining: 200,
    },
    getGoalProgress: {
      totalSaved: 120000,
      totalTarget: 180000,
      goals: [
        {
          name: "Emergency fund",
          saved: 40000,
          target: 100000,
          progressPercent: 40,
        },
        { name: "Laptop", saved: 80000, target: 80000, progressPercent: 100 },
      ],
    },
    getPortfolioSummary: {
      totals: {
        totalValue: 41000,
        totalInvested: 39000,
        totalGainLoss: 2000,
        totalGainLossPercent: 5.13,
      },
      holdings: [{ symbol: "RELIANCE", qty: 10 }],
    },
  };

  it("builds a summary from the snapshot and passes the guardrail", () => {
    const built = chatTemplate(SNAPSHOT);
    expect(built.claims).toHaveLength(6);
    expect(built.answer).toContain("₹14,800 spent of ₹15,000 budgeted");
    expect(built.answer).toContain("Food & Dining is over budget");
    expect(built.answer).toContain("₹1,20,000 saved of ₹1,80,000 target");
    expect(built.answer).toContain("Your portfolio is worth ₹41,000");

    const result = verifyAnswer(
      {
        answer: built.answer,
        claims: built.claims,
        refused: false,
        refusalReason: null,
      },
      {
        requestId: "req-template",
        userId: "user-123",
        feature: "chat",
        toolResults: new Map<string, unknown[]>([
          ["getBudgetStatus", [SNAPSHOT.getBudgetStatus]],
          ["getGoalProgress", [SNAPSHOT.getGoalProgress]],
          ["getPortfolioSummary", [SNAPSHOT.getPortfolioSummary]],
        ]),
        chunks: [],
      },
    );
    expect(result.passed).toBe(true);
    expect(result.checksFailed).toBe(0);
  });

  it("degrades section by section when data is missing", () => {
    const budgetOnly = chatTemplate({
      getBudgetStatus: SNAPSHOT.getBudgetStatus,
      getGoalProgress: { available: false },
      getPortfolioSummary: { available: false },
    });
    expect(budgetOnly.claims).toHaveLength(2);
    expect(budgetOnly.answer).not.toContain("portfolio");
  });

  it("says so honestly when nothing could be loaded", () => {
    const empty = chatTemplate({});
    expect(empty.claims).toHaveLength(0);
    expect(empty.answer).toContain("couldn't be loaded");
  });
});

describe("parseAiChatResponse (client)", () => {
  const VALID = {
    answer: "You spent ₹8,200 on food.",
    claims: [
      {
        text: "You spent ₹8,200 on food.",
        source: { tool: "getCategorySpending", values: { totalSpent: 8200 } },
      },
    ],
    refused: false,
    refusalReason: null,
    model: "qwen/qwen-2.5-72b-instruct",
    toolsUsed: ["getCategorySpending"],
    disclaimer: "Educational only — not financial advice.",
    verification: { status: "verified", checksPassed: 4, checksFailed: 0 },
  };

  it("parses a valid function response", () => {
    expect(parseAiChatResponse(VALID)).toEqual(VALID);
  });

  it("accepts a template response (model null)", () => {
    const template = {
      ...VALID,
      model: null,
      verification: { status: "template", checksPassed: 2, checksFailed: 1 },
    };
    expect(parseAiChatResponse(template)?.verification.status).toBe("template");
    expect(parseAiChatResponse(template)?.model).toBeNull();
  });

  it("rejects malformed responses", () => {
    expect(parseAiChatResponse(null)).toBeNull();
    expect(parseAiChatResponse({ ...VALID, answer: "" })).toBeNull();
    expect(parseAiChatResponse({ ...VALID, claims: "nope" })).toBeNull();
    expect(
      parseAiChatResponse({
        ...VALID,
        verification: { status: "maybe", checksPassed: 0, checksFailed: 0 },
      }),
    ).toBeNull();
    expect(
      parseAiChatResponse({
        ...VALID,
        claims: [{ text: "x", source: { tool: "getBudgetStatus" } }],
      }),
    ).toBeNull();
  });
});

describe("dbRateLimitAllows — the DB-backed counter boundary", () => {
  it("allows up to the limit, then denies", () => {
    expect(dbRateLimitAllows(0, 10)).toBe(true);
    expect(dbRateLimitAllows(9, 10)).toBe(true);
    expect(dbRateLimitAllows(10, 10)).toBe(false);
    expect(dbRateLimitAllows(11, 10)).toBe(false);
  });
});

describe("rateLimitWindowStartIso", () => {
  it("returns the window start in ISO form", () => {
    expect(rateLimitWindowStartIso(1_700_000_000_000, 60_000)).toBe(
      new Date(1_699_999_940_000).toISOString(),
    );
  });
});

describe("AiRateLimiter — the in-memory backstop", () => {
  it("allows maxRequests per window, then denies, then recovers", () => {
    const limiter = new AiRateLimiter(3, 60_000);
    expect(limiter.allow("user-1", 1000)).toBe(true);
    expect(limiter.allow("user-1", 2000)).toBe(true);
    expect(limiter.allow("user-1", 3000)).toBe(true);
    expect(limiter.allow("user-1", 4000)).toBe(false);
    // A different user has their own window.
    expect(limiter.allow("user-2", 4000)).toBe(true);
    // After the window slides past, the limit opens again.
    expect(limiter.allow("user-1", 61_001)).toBe(true);
  });
});

describe("AiResponseCache", () => {
  it("returns cached values until the TTL expires", () => {
    const cache = new AiResponseCache<string>(60_000, 10);
    cache.set("k", "v", 1000);
    expect(cache.get("k", 2000)).toBe("v");
    expect(cache.get("k", 61_000)).toBeUndefined();
    expect(cache.get("missing", 2000)).toBeUndefined();
  });

  it("evicts the oldest entry when full", () => {
    const cache = new AiResponseCache<string>(60_000, 2);
    cache.set("a", "1", 1000);
    cache.set("b", "2", 2000);
    cache.set("c", "3", 3000);
    expect(cache.get("a", 4000)).toBeUndefined();
    expect(cache.get("b", 4000)).toBe("2");
    expect(cache.get("c", 4000)).toBe("3");
  });
});
