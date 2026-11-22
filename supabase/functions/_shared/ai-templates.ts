import type { AiClaim } from "./ai-validation";

/**
 * Template fallback answers: when a model answer fails verification
 * twice, the user gets a template-generated answer built ONLY from
 * verified numbers — never the unverified model text.
 *
 * Ported from the old repo's `ai.guardrail-templates.ts` (NestJS).
 * Only `chatTemplate` is ported here — the explain-stock / explain-news
 * / screener / readiness templates arrive with their endpoints.
 *
 * Every builder is pure and defensive (unknown input shapes degrade to
 * fewer sentences, never to invented numbers). Two structural rules
 * keep the output verifiable by construction:
 *
 * 1. The answer is the claim texts joined — so every number in the
 *    prose is in some claim's values.
 * 2. Every value in every claim is copied verbatim from the evidence
 *    with the tool's own field names — so the guardrail would pass
 *    this output if it were re-checked (pinned by the spec).
 */

export interface TemplateAnswer {
  answer: string;
  claims: AiClaim[];
}

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asList(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

/** "+₹5,000" / "−₹3,000" — the sign stays with the number for matching. */
function signedMoney(value: number): string {
  return value < 0 ? `−${inr0.format(Math.abs(value))}` : `+${inr0.format(value)}`;
}

/** "+0.78%" / "−0.78%" — signed, so the text matches the declared value. */
function signedPercent(value: number): string {
  return `${value < 0 ? "−" : "+"}${Math.abs(value)}%`;
}

function joinAnswer(claims: AiClaim[], empty: string): TemplateAnswer {
  if (claims.length === 0) return { answer: empty, claims: [] };
  return {
    answer: claims.map((claim) => claim.text).join(" "),
    claims,
  };
}

/**
 * The chat fallback: a summary of the snapshot metrics (budget, goals,
 * portfolio) the function already collects for the raw-metrics fallback.
 * Each section degrades independently; a missing section is skipped.
 */
export function chatTemplate(snapshot: Record<string, unknown>): TemplateAnswer {
  const claims: AiClaim[] = [];
  const budget = snapshot["getBudgetStatus"];
  if (isRecord(budget) && budget["available"] !== false) {
    const totalSpent = asNumber(budget["totalSpent"]);
    const totalBudgeted = asNumber(budget["totalBudgeted"]);
    const totalRemaining = asNumber(budget["totalRemaining"]);
    const month = asString(budget["month"]);
    if (totalSpent !== null && totalBudgeted !== null && totalRemaining !== null) {
      claims.push({
        text: `Your budget${month ? ` for ${month}` : ""}: ${inr0.format(totalSpent)} spent of ${inr0.format(totalBudgeted)} budgeted, leaving ${inr0.format(totalRemaining)}.`,
        source: {
          tool: "getBudgetStatus",
          values: { totalSpent, totalBudgeted, totalRemaining },
        },
      });
    }
    for (const category of asList(budget["categories"])) {
      if (category["overBudget"] !== true) continue;
      const name = asString(category["name"]);
      const spent = asNumber(category["spent"]);
      const budgeted = asNumber(category["budgeted"]);
      if (name === null || spent === null || budgeted === null) continue;
      claims.push({
        text: `${name} is over budget: ${inr0.format(spent)} spent of ${inr0.format(budgeted)} budgeted.`,
        source: {
          tool: "getBudgetStatus",
          values: { category: name, spent, budgeted },
        },
      });
    }
  }
  const goals = snapshot["getGoalProgress"];
  if (isRecord(goals)) {
    const totalSaved = asNumber(goals["totalSaved"]);
    const totalTarget = asNumber(goals["totalTarget"]);
    const list = asList(goals["goals"]);
    if (totalSaved !== null && totalTarget !== null && list.length > 0) {
      claims.push({
        text: `Your savings goals: ${inr0.format(totalSaved)} saved of ${inr0.format(totalTarget)} target across ${list.length} goals.`,
        source: {
          tool: "getGoalProgress",
          values: { totalSaved, totalTarget },
        },
      });
      for (const goal of list.slice(0, 4)) {
        const name = asString(goal["name"]);
        const saved = asNumber(goal["saved"]);
        const target = asNumber(goal["target"]);
        const progress = asNumber(goal["progressPercent"]);
        if (name === null || saved === null || target === null || progress === null) {
          continue;
        }
        claims.push({
          text: `${name}: ${inr0.format(saved)} saved of ${inr0.format(target)} target (${progress}% complete).`,
          source: {
            tool: "getGoalProgress",
            values: { name, saved, target, progressPercent: progress },
          },
        });
      }
    }
  }
  const portfolio = snapshot["getPortfolioSummary"];
  if (isRecord(portfolio)) {
    const totals = isRecord(portfolio["totals"]) ? portfolio["totals"] : null;
    const holdings = asList(portfolio["holdings"]);
    const totalValue = totals ? asNumber(totals["totalValue"]) : null;
    const totalInvested = totals ? asNumber(totals["totalInvested"]) : null;
    const totalGainLoss = totals ? asNumber(totals["totalGainLoss"]) : null;
    const totalGainLossPercent = totals ? asNumber(totals["totalGainLossPercent"]) : null;
    if (
      holdings.length > 0 &&
      totalValue !== null &&
      totalInvested !== null &&
      totalGainLoss !== null &&
      totalGainLossPercent !== null
    ) {
      claims.push({
        text: `Your portfolio is worth ${inr0.format(totalValue)} (${inr0.format(totalInvested)} invested, gain/loss ${signedMoney(totalGainLoss)}, ${signedPercent(totalGainLossPercent)} overall).`,
        source: {
          tool: "getPortfolioSummary",
          values: {
            totalValue,
            totalInvested,
            totalGainLoss,
            totalGainLossPercent,
          },
        },
      });
    }
  }
  return joinAnswer(
    claims,
    "Your numbers couldn't be loaded right now, so there's no summary to show. Please try again.",
  );
}
