/**
 * Remote AI client — the async layer over the `ai-chat` Supabase Edge
 * Function (M3: real OpenRouter LLM + guardrails).
 *
 * The function holds the OpenRouter key and runs the tool loop and the
 * guardrail server-side; the browser never sees the key. The client
 * passes the user's Supabase access token, so the gateway verifies the
 * JWT and RLS enforces ownership on every data read inside the function.
 *
 * Every function here fails soft: the chat UI falls back to the local
 * rule-based engine whenever the function is unavailable, rate-limited,
 * or unconfigured — the app must never break when AI is down. The
 * discriminated `AiChatResult` tells the UI WHICH fallback state to
 * show, so an unconfigured key renders as guidance, not an error.
 */

import { getSupabase } from "../supabase";
import type { LLMAdapter } from "./llm";

/** The verified response shape from the ai-chat function (200). */
export interface AiChatResponse {
  answer: string;
  claims: Array<{ text: string; source: { tool: string; values: Record<string, unknown> } }>;
  refused: boolean;
  refusalReason: string | null;
  model: string | null;
  toolsUsed: string[];
  disclaimer: string;
  verification: {
    status: "verified" | "template" | "refused";
    checksPassed: number;
    checksFailed: number;
  };
}

/** Why the remote call did not return an answer. */
export type AiChatFailureStatus = "not-configured" | "rate-limited" | "unavailable";

/** Discriminated result: an answer, or the reason there is none. */
export type AiChatResult =
  { status: "ok"; response: AiChatResponse } | { status: AiChatFailureStatus };

/**
 * Error thrown by `EdgeFunctionAdapter` when the remote call fails —
 * carries the failure status so callers can choose the fallback UI.
 */
export class AiChatError extends Error {
  readonly status: AiChatFailureStatus;

  constructor(status: AiChatFailureStatus, message: string) {
    super(message);
    this.name = "AiChatError";
    this.status = status;
  }
}

/**
 * Per-request timeout for the Edge Function call. The server runs a tool
 * loop (up to 4 model rounds) plus a guardrail retry, so a busy answer
 * can legitimately take over a minute; 120s bounds a true stall while
 * letting slow-but-healthy answers land. A timeout is a soft failure —
 * the caller falls back to the local engine.
 */
const AI_CHAT_TIMEOUT_MS = 120_000;

/**
 * Edge Function URL, derived from the existing Supabase env var — no new
 * env var. Returns null when Supabase is not configured (the live layer
 * is disabled and every caller falls back to the local engine). Never
 * throws: like `getMarketDataFunctionUrl`, this must stay silent.
 */
export function getAiChatFunctionUrl(): string | null {
  const base = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)
    ?.trim()
    .replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/functions/v1/ai-chat`;
}

function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate one Edge Function response into an `AiChatResponse`. Returns
 * null on any shape problem — the function is an external boundary and
 * its JSON is never trusted blindly.
 */
export function parseAiChatResponse(json: unknown): AiChatResponse | null {
  if (!isRecord(json)) return null;
  const answer = json["answer"];
  const claims = json["claims"];
  const refused = json["refused"];
  const refusalReason = json["refusalReason"];
  const model = json["model"];
  const toolsUsed = json["toolsUsed"];
  const disclaimer = json["disclaimer"];
  const verification = json["verification"];
  if (
    typeof answer !== "string" ||
    answer.trim() === "" ||
    !Array.isArray(claims) ||
    typeof refused !== "boolean" ||
    (refusalReason !== null && typeof refusalReason !== "string") ||
    (model !== null && typeof model !== "string") ||
    !Array.isArray(toolsUsed) ||
    !toolsUsed.every((tool) => typeof tool === "string") ||
    typeof disclaimer !== "string" ||
    !isRecord(verification)
  ) {
    return null;
  }
  const parsedClaims: AiChatResponse["claims"] = [];
  for (const raw of claims) {
    if (!isRecord(raw)) return null;
    const text = raw["text"];
    const source = raw["source"];
    if (typeof text !== "string" || text.trim() === "" || !isRecord(source)) return null;
    const tool = source["tool"];
    const values = source["values"];
    if (typeof tool !== "string" || !isRecord(values)) return null;
    parsedClaims.push({ text, source: { tool, values } });
  }
  const status = verification["status"];
  const checksPassed = finite(verification["checksPassed"]);
  const checksFailed = finite(verification["checksFailed"]);
  if (
    (status !== "verified" && status !== "template" && status !== "refused") ||
    checksPassed === undefined ||
    checksFailed === undefined
  ) {
    return null;
  }
  return {
    answer,
    claims: parsedClaims,
    refused,
    refusalReason: refusalReason as string | null,
    model: model as string | null,
    toolsUsed: toolsUsed as string[],
    disclaimer,
    verification: { status, checksPassed, checksFailed },
  };
}

/**
 * Call the ai-chat function with the user's message. The access token is
 * a parameter (not read from Supabase here) so tests need no session.
 * Never throws — every failure is a discriminated status.
 */
export async function fetchAiChat(message: string, accessToken: string): Promise<AiChatResult> {
  const url = getAiChatFunctionUrl();
  const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!url || !anonKey) return { status: "unavailable" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(AI_CHAT_TIMEOUT_MS),
    });
    if (res.status === 503) return { status: "not-configured" };
    if (res.status === 429) return { status: "rate-limited" };
    if (!res.ok) return { status: "unavailable" };
    const parsed = parseAiChatResponse(await res.json());
    return parsed ? { status: "ok", response: parsed } : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * The signed-in user's access token for ai-chat calls. Null when there
 * is no session or Supabase is unconfigured — never throws, so a missing
 * session degrades to the local engine instead of crashing the caller.
 */
export async function getAiChatAccessToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await getSupabase().auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * LLMAdapter backed by the ai-chat Edge Function. `analyze()` returns the
 * verified answer as `text` with the claim texts as `reasoning` (each
 * claim is a number the guardrail checked against the user's data).
 *
 * Throws `AiChatError` on any remote failure — callers catch it and fall
 * back to `LocalAdapter`. The chat route calls `fetchAiChat` directly
 * instead, so it can render the per-status fallback UI.
 */
export class EdgeFunctionAdapter implements LLMAdapter {
  async analyze(context: string): Promise<{ text: string; reasoning: string[] }> {
    const token = await getAiChatAccessToken();
    if (!token) {
      throw new AiChatError("unavailable", "Sign in to use FinVerse AI.");
    }
    const result = await fetchAiChat(context, token);
    if (result.status !== "ok") {
      const messages: Record<AiChatFailureStatus, string> = {
        "not-configured": "AI explanations are not configured yet.",
        "rate-limited": "You are asking too quickly. Please wait a moment and try again.",
        unavailable: "The AI service is unavailable right now.",
      };
      throw new AiChatError(result.status, messages[result.status]);
    }
    return {
      text: result.response.answer,
      reasoning: result.response.claims.map((claim) => claim.text),
    };
  }
}
