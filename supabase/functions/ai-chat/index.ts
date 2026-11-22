/**
 * `ai-chat` — real OpenRouter LLM chat with guardrails for FinVerse.
 *
 * A Supabase Edge Function (Deno). The TanStack app is going static on
 * GitHub Pages, where no server functions exist, so all server-side work
 * lives here (see docs/MIGRATION.md §8). The browser calls this function
 * and falls back to the local rule-based chat whenever it is unavailable.
 *
 * API (POST, JSON body `{ "message": string }`, 1–2000 chars):
 * - 200 — `{ answer, claims, refused, refusalReason, model, toolsUsed,
 *   disclaimer, verification: { status, checksPassed, checksFailed } }`
 *   `verification.status` is "verified" (guardrail passed),
 *   "template" (the model answer failed verification twice — the answer
 *   is built only from verified numbers), or "refused" (the model
 *   declined: a prediction, a buy/sell question, or missing data).
 * - 400 — `{ error, code: "BAD_REQUEST" }` (bad message).
 * - 429 — `{ error, code: "RATE_LIMITED" }` (10 requests/minute/user).
 * - 502 — `{ error, code: "UPSTREAM_ERROR" }` (OpenRouter unreachable,
 *   timed out, or errored).
 * - 503 — `{ error, code: "AI_NOT_CONFIGURED" }` (no OPENROUTER_API_KEY
 *   secret set). The client renders guidance, not an error screen.
 * - 500 — `{ error, code: "INTERNAL" }` (never a stack trace).
 *
 * How it works: the model reasons, the code calculates. The function
 * runs a tool loop (max 4 rounds) over 8 typed tools that read the
 * user's own Supabase data (via PostgREST with the caller's JWT, so
 * RLS enforces ownership) and live Yahoo prices (via the `market-data`
 * Edge Function). The `searchKnowledge` tool retrieves from the RAG
 * store (`rag_documents`, migration 0006) through the shared
 * `_shared/rag.ts` search, in-process — it does not call the `rag`
 * function over HTTP, so the chat loop has no extra network hop (see
 * docs/MIGRATION.md §9 for the reasoning). The final answer is structured JSON (answer + claims
 * + refusal flag); every claim is verified by the deterministic
 * guardrail (`_shared/ai-guardrail.ts`) against the tool results of
 * THIS request — money exact to the paise, percentages within ±0.1. A
 * failed answer gets exactly ONE retry with a correction prompt; if it
 * still fails, the user gets a template answer built only from verified
 * numbers. No unverified claim ever reaches the user.
 *
 * `verify_jwt = true` (see supabase/config.toml): unlike `market-data`
 * (public quotes), this function reads USER data, so the Supabase
 * gateway rejects calls without a valid user JWT before the function
 * runs. Inside, the same JWT builds the PostgREST client — RLS applies
 * to every query. The service-role key is never used here.
 *
 * Rate limiting (10 req/min/user) is DB-backed: one row per request in
 * `ai_rate_limits` (migration 0005), counted per user per minute
 * window. The old backend's in-memory limiter breaks on serverless
 * (per-instance state), so it survives here only as a backstop when
 * the table is unavailable (migration not yet applied) — documented
 * as best-effort in `_shared/ai-limits.ts`. The 60s identical-query
 * cache is per-instance by the same token (a miss just costs one more
 * model call). Guardrail check logging is fail-open: a `guardrail_checks`
 * write failure is logged as a warning and never fails the answer.
 *
 * Deploy (owner action — needs the Supabase CLI + access token):
 *   supabase functions deploy ai-chat
 *   supabase secrets set OPENROUTER_API_KEY=...
 *   Run supabase/migrations/0005_guardrail_checks.sql in the SQL Editor
 *   (guardrail log + rate-limit counter; the function works without it
 *   but the log and the DB-backed limit are inactive until it lands).
 *
 * NOT verified: the live OpenRouter call (no API key exists yet — it is
 * still outstanding from Sarthak), the deployed function, or the browser
 * wiring against it. The tool loop, guardrail, templates, and parsers
 * are unit-tested (see src/lib/ai/*.test.ts); only the hosted hop and
 * the model itself are unverified.
 */

import {
  AiRateLimiter,
  AiResponseCache,
  dbRateLimitAllows,
  rateLimitWindowStartIso,
} from "../_shared/ai-limits.ts";
import {
  OpenRouterClient,
  LlmProviderError,
  type ChatMessage,
  type LlmClient,
  type ToolCall,
} from "../_shared/ai-provider.ts";
import {
  AI_DISCLAIMER,
  STRUCTURED_OUTPUT_INSTRUCTIONS,
  SYSTEM_PROMPT,
  correctionPrompt,
  guardrailCorrectionPrompt,
} from "../_shared/ai-prompts.ts";
import {
  chunksFromToolResults,
  verifyAnswer,
  type GuardrailCheckRow,
  type GuardrailContext,
  type GuardrailResult,
  type VerificationState,
} from "../_shared/ai-guardrail.ts";
import { chatTemplate } from "../_shared/ai-templates.ts";
import {
  AI_TOOL_DEFINITIONS,
  executeTool,
  isToolError,
  type ToolDataAccess,
  type ToolHistoryBar,
  type ToolQuote,
} from "../_shared/ai-tools.ts";
import { parseChatRequest, parseStructuredJson, type AiAnswer } from "../_shared/ai-validation.ts";
import { createPostgrestClient, type PostgrestClient } from "../_shared/postgrest.ts";
import {
  EMBEDDING_MODEL,
  OpenRouterEmbeddingsClient,
  searchDocuments,
  type RetrievedContext,
} from "../_shared/rag.ts";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface AiChatConfig {
  apiKey: string | undefined;
  baseUrl: string;
  primaryModel: string;
  embeddingModel: string;
  timeoutMs: number;
  maxToolRounds: number;
  rateLimitPerMinute: number;
  rateLimitWindowMs: number;
  cacheTtlMs: number;
  cacheMaxEntries: number;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
}

const DEFAULT_PRIMARY_MODEL = "qwen/qwen-2.5-72b-instruct";
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_TOOL_ROUNDS = 4;
const DEFAULT_RATE_LIMIT_PER_MINUTE = 10;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_CACHE_MAX_ENTRIES = 100;

function textEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function intEnv(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveConfig(get: (key: string) => string | undefined): AiChatConfig {
  const apiKey = get("OPENROUTER_API_KEY")?.trim();
  return {
    apiKey: apiKey ? apiKey : undefined,
    baseUrl: textEnv(get("LLM_BASE_URL"), DEFAULT_BASE_URL),
    primaryModel: textEnv(get("LLM_MODEL_PRIMARY"), DEFAULT_PRIMARY_MODEL),
    embeddingModel: textEnv(
      get("LLM_EMBEDDING_MODEL"),
      EMBEDDING_MODEL,
    ),
    timeoutMs: intEnv(get("LLM_TIMEOUT_MS"), DEFAULT_TIMEOUT_MS),
    maxToolRounds: intEnv(get("LLM_MAX_TOOL_ROUNDS"), DEFAULT_MAX_TOOL_ROUNDS),
    rateLimitPerMinute: intEnv(get("LLM_RATE_LIMIT_PER_MINUTE"), DEFAULT_RATE_LIMIT_PER_MINUTE),
    rateLimitWindowMs: intEnv(get("LLM_RATE_LIMIT_WINDOW_MS"), DEFAULT_RATE_LIMIT_WINDOW_MS),
    cacheTtlMs: intEnv(get("LLM_CACHE_TTL_MS"), DEFAULT_CACHE_TTL_MS),
    cacheMaxEntries: intEnv(get("LLM_CACHE_MAX_ENTRIES"), DEFAULT_CACHE_MAX_ENTRIES),
    supabaseUrl: get("SUPABASE_URL")?.trim() || undefined,
    supabaseAnonKey: get("SUPABASE_ANON_KEY")?.trim() || undefined,
  };
}

// ---------------------------------------------------------------------------
// Shared per-instance state (best-effort by design — see the header note)
// ---------------------------------------------------------------------------

const responseCache = new AiResponseCache<AiChatResponse>(
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_CACHE_MAX_ENTRIES,
);
const memoryLimiter = new AiRateLimiter(
  DEFAULT_RATE_LIMIT_PER_MINUTE,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
);

/** Memoised "table missing" windows — avoids a failing round-trip per request. */
const TABLE_MISSING_MEMO_MS = 10 * 60_000;
let rateLimitTableMissingUntil = 0;
let guardrailTableMissingUntil = 0;

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface AiChatResponse {
  answer: string;
  claims: AiAnswer["claims"];
  refused: boolean;
  refusalReason: string | null;
  model: string | null;
  toolsUsed: string[];
  disclaimer: string;
  verification: VerificationState;
}

/** The model answered twice without producing a valid structured answer. */
class AiUnverifiableError extends Error {
  constructor() {
    super("The AI answer could not be verified.");
    this.name = "AiUnverifiableError";
  }
}

/** Tool results are capped so one large result cannot flood the prompt. */
const MAX_TOOL_RESULT_CHARS = 6000;

function truncate(value: string, max = MAX_TOOL_RESULT_CHARS): string {
  return value.length > max ? `${value.slice(0, max)}\u2026[truncated]` : value;
}

// ---------------------------------------------------------------------------
// CORS + JSON helpers (same allowlist as market-data)
// ---------------------------------------------------------------------------

const CORS_ALLOWLIST = new Set([
  "https://vidish-bijalwan.github.io", // GitHub Pages (target host)
  "https://finverse-nu.vercel.app", // Vercel (current host, until cutover)
  "http://localhost:8080", // vite dev (this repo's dev port)
  "http://localhost:5173", // vite default dev port
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (origin && CORS_ALLOWLIST.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function errorResponse(
  message: string,
  code: string,
  status: number,
  origin: string | null,
): Response {
  return jsonResponse({ error: message, code }, status, origin);
}

// ---------------------------------------------------------------------------
// Auth: the user id from the (gateway-verified) JWT
// ---------------------------------------------------------------------------

/**
 * Read the `sub` claim from the JWT. The Supabase gateway already
 * verified the signature (verify_jwt = true), and PostgREST verifies it
 * again on every query — decoding here only reads the claim, it does
 * not authenticate anything.
 */
function userIdFromJwt(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const segment = (parts[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = segment + "=".repeat((4 - (segment.length % 4)) % 4);
    const payload: unknown = JSON.parse(atob(padded));
    if (payload && typeof payload === "object") {
      const sub = (payload as Record<string, unknown>)["sub"];
      return typeof sub === "string" && sub !== "" ? sub : null;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Tool data access: PostgREST (user JWT → RLS) + market-data function
// ---------------------------------------------------------------------------

interface TransactionRow {
  id: string;
  type: string;
  amount_paise: number;
  category: string;
  note: string;
  date_iso: string;
  tags: string[] | null;
}

interface BudgetRow {
  category_id: string;
  month: string;
  limit_paise: number;
}

interface GoalRow {
  name: string;
  target_paise: number;
  saved_paise: number;
  deadline: string;
}

interface HoldingRow {
  symbol: string;
  qty: number;
  avg_price_paise: number;
}

const MARKET_DATA_TIMEOUT_MS = 8_000;

function createToolDataAccess(
  sb: PostgrestClient,
  userId: string,
  supabaseUrl: string,
  anonKey: string,
  embedder: OpenRouterEmbeddingsClient | null,
): ToolDataAccess {
  async function listTransactions(filter: {
    type?: "expense" | "income" | "transfer";
    startDate?: string;
    endDate?: string;
    limit: number;
  }) {
    const filters: Array<[string, string, string]> = [["user_id", "eq", userId]];
    if (filter.type) filters.push(["type", "eq", filter.type]);
    if (filter.startDate) filters.push(["date_iso", "gte", filter.startDate]);
    if (filter.endDate) filters.push(["date_iso", "lte", filter.endDate]);
    const rows = await sb.select<TransactionRow>(
      "transactions",
      "id,type,amount_paise,category,note,date_iso,tags",
      filters,
      { order: "date_iso.desc", limit: filter.limit },
    );
    return rows.map((row) => ({
      id: row.id,
      type: (row.type === "income" || row.type === "transfer" ? row.type : "expense") as
        "expense" | "income" | "transfer",
      amountPaise: row.amount_paise,
      category: row.category,
      note: row.note ?? "",
      dateISO: row.date_iso,
      tags: row.tags ?? [],
    }));
  }

  async function listBudgets(month: string) {
    const rows = await sb.select<BudgetRow>("budgets", "category_id,month,limit_paise", [
      ["user_id", "eq", userId],
      ["month", "eq", month],
    ]);
    return rows.map((row) => ({
      categoryId: row.category_id,
      month: row.month,
      limitPaise: row.limit_paise,
    }));
  }

  async function listGoals() {
    const rows = await sb.select<GoalRow>("goals", "name,target_paise,saved_paise,deadline", [
      ["user_id", "eq", userId],
    ]);
    return rows.map((row) => ({
      name: row.name,
      targetPaise: row.target_paise,
      savedPaise: row.saved_paise,
      deadline: row.deadline,
    }));
  }

  async function listHoldings() {
    const rows = await sb.select<HoldingRow>("holdings", "symbol,qty,avg_price_paise", [
      ["user_id", "eq", userId],
    ]);
    return rows.map((row) => ({
      symbol: row.symbol,
      qty: Number(row.qty),
      avgPricePaise: row.avg_price_paise,
    }));
  }

  function marketDataUrl(): string {
    return `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/market-data`;
  }

  async function fetchMarketData(params: string): Promise<Record<string, unknown> | null> {
    try {
      const res = await fetch(`${marketDataUrl()}?${params}`, {
        headers: { apikey: anonKey },
        signal: AbortSignal.timeout(MARKET_DATA_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const json: unknown = await res.json();
      if (!json || typeof json !== "object" || Array.isArray(json)) return null;
      return json as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  function finite(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }

  async function getQuote(yahooSymbol: string): Promise<ToolQuote | null> {
    const json = await fetchMarketData(`symbol=${encodeURIComponent(yahooSymbol)}`);
    if (!json) return null;
    const price = finite(json["price"]);
    const prevClose = finite(json["prevClose"]);
    const change = finite(json["change"]);
    const changePct = finite(json["changePct"]);
    const currency = json["currency"];
    const asOf = json["asOf"];
    if (
      price === undefined ||
      prevClose === undefined ||
      change === undefined ||
      changePct === undefined ||
      typeof currency !== "string" ||
      typeof asOf !== "string"
    ) {
      return null;
    }
    return {
      symbol: yahooSymbol,
      price,
      prevClose,
      change,
      changePct,
      currency,
      asOf,
    };
  }

  async function getHistory(yahooSymbol: string, range: string): Promise<ToolHistoryBar[] | null> {
    const json = await fetchMarketData(
      `symbol=${encodeURIComponent(yahooSymbol)}&range=${encodeURIComponent(range)}&interval=1d`,
    );
    if (!json) return null;
    const history = json["history"];
    if (!Array.isArray(history)) return null;
    const bars: ToolHistoryBar[] = [];
    for (const raw of history) {
      if (!raw || typeof raw !== "object") continue;
      const row = raw as Record<string, unknown>;
      const date = row["date"];
      const close = finite(row["close"]);
      if (typeof date !== "string" || close === undefined) continue;
      const volume = finite(row["volume"]);
      bars.push({ date, close, volume: volume ?? null });
    }
    bars.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return bars.length > 0 ? bars : null;
  }

  async function searchKnowledge(
    query: string,
    symbol: string | null,
    topK: number,
  ): Promise<RetrievedContext> {
    // In-process shared search (see the header note): the embedder is
    // null only when the key is missing, in which case the handler
    // already 503'd — the null path exists for robustness.
    if (!embedder) {
      return searchDocuments(null, query, { ownerId: userId, topK, symbol });
    }
    return searchDocuments(
      {
        embedOne: (text) => embedder.embedOne(text),
        rpc: <T>(fn: string, args: Record<string, unknown>) => sb.rpc<T>(fn, args),
      },
      query,
      { ownerId: userId, topK, symbol },
    );
  }

  return {
    listTransactions,
    listBudgets,
    listGoals,
    listHoldings,
    getQuote,
    getHistory,
    searchKnowledge,
  };
}

// ---------------------------------------------------------------------------
// Rate limit: DB-backed counter with an in-memory backstop
// ---------------------------------------------------------------------------

async function checkRateLimit(
  sb: PostgrestClient,
  userId: string,
  config: AiChatConfig,
): Promise<boolean> {
  const now = Date.now();
  // DB path — unless the table was recently found missing.
  if (now >= rateLimitTableMissingUntil) {
    const inserted = await sb.insert("ai_rate_limits", [{ user_id: userId }]);
    if (inserted) {
      const count = await sb.count("ai_rate_limits", [
        ["user_id", "eq", userId],
        ["created_at", "gt", rateLimitWindowStartIso(now, config.rateLimitWindowMs)],
      ]);
      if (count !== null) {
        // Opportunistic cleanup of rows older than an hour (best-effort).
        void sb.deleteWhere("ai_rate_limits", [
          ["user_id", "eq", userId],
          ["created_at", "lt", new Date(now - 60 * 60_000).toISOString()],
        ]);
        // `count` includes the row just inserted; the prior count is
        // what the limit applies to.
        return dbRateLimitAllows(count - 1, config.rateLimitPerMinute);
      }
      // Count unreadable — fall through to the backstop below.
    } else {
      // The insert failed (most likely migration 0005 not applied yet).
      // Memoise so the next 10 minutes skip the failing round-trip.
      rateLimitTableMissingUntil = now + TABLE_MISSING_MEMO_MS;
      console.warn(
        "ai-chat: ai_rate_limits insert failed — falling back to the per-instance limiter. " +
          "Apply migration 0005 to restore the DB-backed limit.",
      );
    }
  }
  return memoryLimiter.allow(userId, now);
}

// ---------------------------------------------------------------------------
// Guardrail check log (fail-open)
// ---------------------------------------------------------------------------

async function logGuardrailChecks(
  sb: PostgrestClient,
  context: GuardrailContext,
  checks: GuardrailCheckRow[],
  attempt: number,
): Promise<void> {
  if (checks.length === 0) return;
  if (Date.now() < guardrailTableMissingUntil) return;
  const ok = await sb.insert(
    "guardrail_checks",
    checks.map((check) => ({
      request_id: context.requestId,
      user_id: context.userId,
      feature: context.feature,
      attempt,
      claim_text: check.claimText,
      source_tool: check.sourceTool,
      check_type: check.checkType,
      expected: check.expected,
      actual: check.actual,
      verdict: check.passed ? "pass" : "fail",
    })),
  );
  if (!ok) {
    guardrailTableMissingUntil = Date.now() + TABLE_MISSING_MEMO_MS;
    console.warn(
      `ai-chat: failed to log ${checks.length} guardrail checks for request ${context.requestId} — ` +
        "the check log is incomplete (apply migration 0005).",
    );
  }
}

async function verifyAndLog(
  sb: PostgrestClient,
  answer: AiAnswer,
  context: GuardrailContext,
  attempt: number,
): Promise<GuardrailResult> {
  const result = verifyAnswer(answer, context);
  await logGuardrailChecks(sb, context, result.checks, attempt);
  return result;
}

// ---------------------------------------------------------------------------
// Chat pipeline (port of the old AiService chat path)
// ---------------------------------------------------------------------------

async function runTool(data: ToolDataAccess, call: ToolCall): Promise<unknown> {
  let args: unknown;
  try {
    args = JSON.parse(call.arguments);
  } catch {
    return { error: "The tool arguments were not valid JSON." };
  }
  try {
    return await executeTool(data, call.name, args);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The tool could not complete this request.",
    };
  }
}

/** Best-effort snapshot: each section degrades independently. */
async function snapshotMetrics(data: ToolDataAccess): Promise<Record<string, unknown>> {
  const sections = await Promise.all([
    executeTool(data, "getBudgetStatus", {})
      .then((value) => ({ name: "getBudgetStatus", value }))
      .catch(() => ({ name: "getBudgetStatus", value: { available: false } })),
    executeTool(data, "getGoalProgress", {})
      .then((value) => ({ name: "getGoalProgress", value }))
      .catch(() => ({ name: "getGoalProgress", value: { available: false } })),
    executeTool(data, "getPortfolioSummary", {})
      .then((value) => ({ name: "getPortfolioSummary", value }))
      .catch(() => ({ name: "getPortfolioSummary", value: { available: false } })),
  ]);
  const metrics: Record<string, unknown> = {};
  for (const section of sections) metrics[section.name] = section.value;
  return metrics;
}

/**
 * The final structured answer: one call asking for the JSON object, one
 * retry with a correction prompt when the reply is not valid. Anything
 * else throws, and the caller falls back to the template.
 */
async function structuredAnswer(
  client: LlmClient,
  messages: ChatMessage[],
  model: string,
  timeoutMs: number,
): Promise<AiAnswer> {
  const withInstructions: ChatMessage[] = [
    ...messages,
    { role: "user", content: STRUCTURED_OUTPUT_INSTRUCTIONS },
  ];
  const first = await client.chat({
    model,
    messages: withInstructions,
    responseFormatJson: true,
    timeoutMs,
  });
  const parsed = parseStructuredJson(first.content);
  if (parsed.ok) return parsed.value;
  const retry = await client.chat({
    model,
    messages: [
      ...withInstructions,
      { role: "assistant", content: first.content },
      { role: "user", content: correctionPrompt(first.content ?? "") },
    ],
    responseFormatJson: true,
    timeoutMs,
  });
  const reparsed = parseStructuredJson(retry.content);
  if (reparsed.ok) return reparsed.value;
  throw new AiUnverifiableError();
}

/**
 * The guarded answer: every model answer is verified against the
 * evidence of THIS request before it reaches the user. Refusals skip
 * verification (there is nothing to check). A failed answer gets
 * exactly ONE retry with a correction prompt naming the failed claims
 * and their correct values; if it still fails, the template answer —
 * built only from verified numbers — is returned instead. No unverified
 * claim ever reaches the user.
 */
async function guardedAnswer(
  sb: PostgrestClient,
  client: LlmClient,
  messages: ChatMessage[],
  model: string,
  timeoutMs: number,
  context: GuardrailContext,
  template: () => Promise<{ answer: string; claims: AiAnswer["claims"] }>,
): Promise<{ answer: AiAnswer; verification: VerificationState }> {
  const first = await structuredAnswer(client, messages, model, timeoutMs);
  if (first.refused) {
    return { answer: first, verification: { status: "refused", checksPassed: 0, checksFailed: 0 } };
  }
  const firstResult = await verifyAndLog(sb, first, context, 1);
  if (firstResult.passed) {
    return {
      answer: first,
      verification: {
        status: "verified",
        checksPassed: firstResult.checksPassed,
        checksFailed: 0,
      },
    };
  }
  const retryMessages: ChatMessage[] = [
    ...messages,
    { role: "assistant", content: JSON.stringify(first) },
    {
      role: "user",
      content: guardrailCorrectionPrompt(firstResult.failures),
    },
  ];
  const second = await structuredAnswer(client, retryMessages, model, timeoutMs);
  if (second.refused) {
    return {
      answer: second,
      verification: { status: "refused", checksPassed: 0, checksFailed: 0 },
    };
  }
  const secondResult = await verifyAndLog(sb, second, context, 2);
  if (secondResult.passed) {
    return {
      answer: second,
      verification: {
        status: "verified",
        checksPassed: secondResult.checksPassed,
        checksFailed: 0,
      },
    };
  }
  const built = await template();
  return {
    answer: {
      answer: built.answer,
      claims: built.claims,
      refused: false,
      refusalReason: null,
    },
    verification: {
      status: "template",
      checksPassed: secondResult.checksPassed,
      checksFailed: secondResult.checksFailed,
    },
  };
}

async function chatWithModel(
  sb: PostgrestClient,
  data: ToolDataAccess,
  client: LlmClient,
  userId: string,
  message: string,
  config: AiChatConfig,
): Promise<AiChatResponse> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: message },
  ];
  const toolsUsed: string[] = [];
  // The guardrail checks the answer against exactly what the tools
  // returned in THIS request, so successful results are retained
  // (failures are not evidence — the model must not cite them).
  const toolResults = new Map<string, unknown[]>();
  for (let round = 0; round < config.maxToolRounds; round++) {
    const completion = await client.chat({
      model: config.primaryModel,
      messages,
      tools: AI_TOOL_DEFINITIONS,
      timeoutMs: config.timeoutMs,
    });
    if (completion.toolCalls.length === 0) break;
    messages.push({
      role: "assistant",
      content: completion.content,
      tool_calls: completion.toolCalls.map((call) => ({
        id: call.id,
        type: "function" as const,
        function: { name: call.name, arguments: call.arguments },
      })),
    });
    for (const call of completion.toolCalls) {
      if (!toolsUsed.includes(call.name)) toolsUsed.push(call.name);
      const result = await runTool(data, call);
      if (!isToolError(result)) {
        const results = toolResults.get(call.name) ?? [];
        results.push(result);
        toolResults.set(call.name, results);
      }
      messages.push({
        role: "tool",
        content: truncate(JSON.stringify(result)),
        tool_call_id: call.id,
      });
    }
  }
  const guardrailContext: GuardrailContext = {
    requestId: crypto.randomUUID(),
    userId,
    feature: "chat",
    toolResults,
    chunks: chunksFromToolResults(toolResults.get("searchKnowledge") ?? []),
  };
  const { answer, verification } = await guardedAnswer(
    sb,
    client,
    messages,
    config.primaryModel,
    config.timeoutMs,
    guardrailContext,
    async () => {
      const metrics = await snapshotMetrics(data);
      return chatTemplate(metrics);
    },
  );
  return {
    answer: answer.answer,
    claims: answer.claims,
    refused: answer.refused,
    refusalReason: answer.refusalReason ?? null,
    // A template answer is built by code, not by the model.
    model: verification.status === "template" ? null : config.primaryModel,
    toolsUsed,
    disclaimer: AI_DISCLAIMER,
    verification,
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return errorResponse("Only POST is supported.", "BAD_REQUEST", 405, origin);
  }

  const config = resolveConfig((key) => Deno.env.get(key));
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.error(
      "ai-chat: SUPABASE_URL / SUPABASE_ANON_KEY are not set in the function environment.",
    );
    return errorResponse("The AI service is not configured.", "INTERNAL", 500, origin);
  }

  // The gateway (verify_jwt = true) already rejected missing/invalid
  // JWTs; here the token is read to build the user-scoped client.
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  const userId = jwt ? userIdFromJwt(jwt) : null;
  if (!userId) {
    return errorResponse("Sign in to use FinVerse AI.", "UNAUTHORIZED", 401, origin);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("The request body was not valid JSON.", "BAD_REQUEST", 400, origin);
  }
  const parsed = parseChatRequest(body);
  if (!parsed) {
    return errorResponse("A message is required (1–2000 characters).", "BAD_REQUEST", 400, origin);
  }

  const sb = createPostgrestClient(config.supabaseUrl, config.supabaseAnonKey, jwt);

  if (!(await checkRateLimit(sb, userId, config))) {
    return errorResponse(
      "You are asking too quickly. Please wait a moment and try again.",
      "RATE_LIMITED",
      429,
      origin,
    );
  }

  const cacheKey = `chat:${userId}:${parsed.message.toLowerCase()}`;
  const cached = responseCache.get(cacheKey);
  if (cached) return jsonResponse(cached, 200, origin);

  if (!config.apiKey) {
    return errorResponse(
      "AI explanations are not configured yet.",
      "AI_NOT_CONFIGURED",
      503,
      origin,
    );
  }

  const embedder = new OpenRouterEmbeddingsClient(
    config.apiKey,
    config.baseUrl,
    config.embeddingModel,
    config.timeoutMs,
  );
  const data = createToolDataAccess(
    sb,
    userId,
    config.supabaseUrl,
    config.supabaseAnonKey,
    embedder,
  );
  const client = new OpenRouterClient(config.apiKey, config.baseUrl);
  try {
    const response = await chatWithModel(sb, data, client, userId, parsed.message, config);
    responseCache.set(cacheKey, response);
    return jsonResponse(response, 200, origin);
  } catch (error) {
    if (error instanceof LlmProviderError) {
      return errorResponse(
        "The AI service is unavailable right now.",
        "UPSTREAM_ERROR",
        502,
        origin,
      );
    }
    if (error instanceof AiUnverifiableError) {
      // The structured answer could not be produced twice. The template
      // fallback only applies to valid JSON that fails verification, so
      // this is an honest upstream-style failure, not a silent success.
      return errorResponse(
        "The AI answer could not be verified. Please try again.",
        "UPSTREAM_ERROR",
        502,
        origin,
      );
    }
    console.error("ai-chat: unexpected error", error);
    return errorResponse("Unexpected error.", "INTERNAL", 500, origin);
  }
});
