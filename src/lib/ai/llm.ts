/**
 * LLM adapter layer for FinVerse AI.
 *
 * The app talks to AI only through the `LLMAdapter` interface. `LocalAdapter`
 * below answers using the deterministic `buildInsights` engine — no network,
 * no API keys, fully explainable. That is what ships in this PR.
 *
 * ============================================================================
 *  HOW TO SWAP IN A REAL OPEN-SOURCE LLM (later, when keys are available)
 * ============================================================================
 *
 * 1. Create a new class implementing `LLMAdapter`, e.g. `OllamaAdapter`,
 *    `OpenRouterAdapter`, or `TogetherAdapter`. All three providers speak the
 *    OpenAI-compatible chat-completions shape, so one adapter can usually
 *    cover all of them with different `baseURL` / `model` values:
 *
 *      POST {baseURL}/chat/completions
 *      Authorization: Bearer <key>            (not needed for local Ollama)
 *      Content-Type: application/json
 *      {
 *        "model": "qwen2.5:7b",
 *        "temperature": 0.2,
 *        "messages": [
 *          { "role": "system", "content": SYSTEM_PROMPT },
 *          { "role": "user", "content": context }
 *        ]
 *      }
 *
 *    - Ollama (local, no key):      baseURL = "http://localhost:11434/v1"
 *                                   models: "qwen2.5:7b" | "qwen2.5:3b" |
 *                                           "deepseek-r1:7b" (distill)
 *    - OpenRouter:                  baseURL = "https://openrouter.ai/api/v1"
 *                                   models: "qwen/qwen-2.5-7b-instruct" |
 *                                           "deepseek/deepseek-r1-distill-qwen-32b"
 *    - Together AI:                 baseURL = "https://api.together.xyz/v1"
 *                                   models: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B" |
 *                                           "meta-llama/Llama-3.3-70B-Instruct-Turbo"
 *
 * 2. Prompt shape: keep `context` (the string passed to `analyze()`) as the
 *    user message, and use a system prompt like:
 *
 *      "You are FinVerse AI, a personal finance assistant for Indian users.
 *       Amounts are in INR. Answer in plain language, at most 3 short
 *       paragraphs. Every figure you mention MUST come from the context —
 *       never invent numbers. Reply as JSON only:
 *       { \"text\": \"...\", \"reasoning\": [\"...\", \"...\"] }
 *       Put each exact number you cite into \"reasoning\"."
 *
 * 3. Parse the model reply with a safe JSON fallback: if parsing fails, use
 *    the raw text as `text` and `[]` as reasoning, then log the incident.
 *
 * 4. Wiring: `analyze()` is called from the UI layer, so swapping is a
 *    one-line change — construct your adapter instead of `LocalAdapter`
 *    where the adapter is created. The `buildInsights` rules can be reused to
 *    build the `context` string ("grounding"), keeping every model answer
 *    traceable to the same evidence.
 *
 * 5. Privacy: finance data is sensitive. Prefer Ollama (fully on-device) for
 *    personal data; if you use a hosted provider, route only aggregated
 *    figures (never raw transaction notes) into the prompt.
 */

import { buildInsights } from "./engine";
import { monthLabel } from "../finance/format";
import type { FinanceDB } from "../finance/types";

/** Minimal contract every AI backend in FinVerse must satisfy. */
export interface LLMAdapter {
  /**
   * Analyse `context` (a plain-language description of what to look at) and
   * return the answer plus the step-by-step reasoning behind it.
   */
  analyze(context: string): Promise<{ text: string; reasoning: string[] }>;
}

/**
 * Template-based local implementation: renders the deterministic insights
 * engine as prose. Used as the default until a real LLM adapter is wired in.
 */
export class LocalAdapter implements LLMAdapter {
  constructor(
    private db: FinanceDB,
    private monthKeyValue: string,
  ) {}

  async analyze(context: string): Promise<{ text: string; reasoning: string[] }> {
    const insights = buildInsights(this.db, this.monthKeyValue);
    const label = monthLabel(this.monthKeyValue);

    if (insights.length === 0) {
      return {
        text: `All clear for ${label} — nothing in your data needs attention right now.`,
        reasoning: ["No rule in the insights engine fired on the current data."],
      };
    }

    const lines = insights.map((i) => `• ${i.title}\n  ${i.body}`);
    const scoped = context.trim() ? ` regarding "${context.trim()}"` : "";
    return {
      text: `Here is what stands out for ${label}${scoped}:\n\n${lines.join("\n\n")}`,
      reasoning: insights.flatMap((i) => [`${i.title}`, ...i.evidence]),
    };
  }
}
