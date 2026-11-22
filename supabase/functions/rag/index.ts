/**
 * `rag` — retrieval-augmented generation for FinVerse (M4).
 *
 * A Supabase Edge Function (Deno). It owns the vector store
 * (`rag_documents`, migration 0006): indexing documents (chunk +
 * embed + store) and searching them (embed the query + cosine
 * similarity via the `match_documents` RPC). The `ai-chat` function
 * does NOT call this function over HTTP — it shares the search code
 * in `_shared/rag.ts` directly, so the chat tool loop has no extra
 * network hop (see docs/MIGRATION.md §9 for the reasoning). This
 * function is the HTTP API for indexing (owner-invoked) and for
 * direct search from future clients.
 *
 * API (POST, JSON body; `verify_jwt = true` — the gateway rejects
 * calls without a valid user JWT before the function runs):
 * - Index: `{ "op": "index", "source_type": "guide"|"news"|"profile"|
 *   "transaction", "source_id": string, "title"?: string,
 *   "content": string, "symbol"?: string, "url"?: string,
 *   "published_at"?: string, "metadata"?: object, "shared"?: boolean }`
 *   → 200 `{ indexed: true, source_id, chunks, shared }`. Content is
 *   chunked (~500 chars, 50-char overlap), each chunk is embedded
 *   with baai/bge-base-en-v1.5 (768d), and the rows are stored.
 *   Re-indexing the same (source_type, source_id) replaces the old
 *   rows (delete-then-insert). `shared: true` stores the document
 *   with a NULL owner, visible to every user through search — the
 *   seed guides are indexed this way. Any signed-in user can
 *   technically index a shared document; shared indexing is
 *   owner-invoked by convention (a follow-up, not a gate).
 * - Search: `{ "op": "search", "query": string, "match_count"?:
 *   number, "symbol"?: string }`
 *   → 200 `{ available, chunks, reason }`. `available: false` means
 *   retrieval is down (embeddings or database outage) — the caller
 *   degrades honestly; `available: true` with zero chunks means
 *   nothing relevant passed the 0.35 similarity floor.
 *
 * Errors are honest JSON (`{ error, code }`, never a stack trace):
 * 400 bad request, 401 no JWT, 502 embeddings unreachable,
 * 503 key not configured (`AI_NOT_CONFIGURED` — same OpenRouter key
 * as ai-chat), 500 index failed / internal.
 *
 * Rate limiting: none on this function (indexing is owner-invoked
 * and search is cheap; the chat path that calls the shared search
 * code is already rate-limited by ai-chat). A DB-backed limit is a
 * follow-up — see MIGRATION.md §9.
 *
 * Deploy (owner action — needs the Supabase CLI + access token):
 *   supabase functions deploy rag
 *   (the OPENROUTER_API_KEY secret is already set for ai-chat)
 *   Run supabase/migrations/0006_rag_documents.sql in the SQL Editor
 *   (same manual queue as 0003/0004/0005).
 *
 * NOT verified: live embeddings (no API key exists yet), live
 * pgvector search (no database access from here), the deployed
 * function, or the seed indexing. The chunker, embeddings parsing,
 * and search parsing are unit-tested (see src/lib/ai/rag.test.ts);
 * only the hosted hop, the model, and the database are not.
 */

import {
  chunkText,
  DEFAULT_RAG_INGEST_BATCH_SIZE,
  DEFAULT_RAG_TOP_K,
  EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_TIMEOUT_MS,
  isRagSourceType,
  OpenRouterEmbeddingsClient,
  searchDocuments,
  type RagSourceType,
  type SearchDocumentsDeps,
} from "../_shared/rag.ts";
import { createPostgrestClient, type PostgrestClient } from "../_shared/postgrest.ts";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface RagConfig {
  apiKey: string | undefined;
  baseUrl: string;
  embeddingModel: string;
  timeoutMs: number;
  ingestBatchSize: number;
  topK: number;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
}

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

function textEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function intEnv(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveConfig(get: (key: string) => string | undefined): RagConfig {
  const apiKey = get("OPENROUTER_API_KEY")?.trim();
  return {
    apiKey: apiKey ? apiKey : undefined,
    baseUrl: textEnv(
      get("LLM_EMBEDDING_BASE_URL") ?? get("LLM_BASE_URL"),
      DEFAULT_BASE_URL,
    ),
    embeddingModel: textEnv(get("LLM_EMBEDDING_MODEL"), EMBEDDING_MODEL),
    timeoutMs: intEnv(get("LLM_EMBEDDING_TIMEOUT_MS"), DEFAULT_EMBEDDING_TIMEOUT_MS),
    ingestBatchSize: intEnv(get("RAG_INGEST_BATCH_SIZE"), DEFAULT_RAG_INGEST_BATCH_SIZE),
    topK: intEnv(get("RAG_TOP_K"), DEFAULT_RAG_TOP_K),
    supabaseUrl: get("SUPABASE_URL")?.trim() || undefined,
    supabaseAnonKey: get("SUPABASE_ANON_KEY")?.trim() || undefined,
  };
}

// ---------------------------------------------------------------------------
// Limits (abuse guards — indexing is a paid embeddings call)
// ---------------------------------------------------------------------------

const MAX_CONTENT_CHARS = 50_000;
const MAX_TITLE_CHARS = 200;
const MAX_SOURCE_ID_CHARS = 200;
const MAX_SYMBOL_CHARS = 20;
const MAX_URL_CHARS = 2000;
const MAX_CHUNKS_PER_DOC = 100;
const MAX_MATCH_COUNT = 10;

// ---------------------------------------------------------------------------
// CORS + JSON helpers (same allowlist as market-data / ai-chat)
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
// Request validation
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : null;
}

interface IndexRequest {
  sourceType: RagSourceType;
  sourceId: string;
  title: string | null;
  content: string;
  symbol: string | null;
  url: string | null;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
  shared: boolean;
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function parseIndexRequest(body: unknown): ParseResult<IndexRequest> {
  if (!isRecord(body)) return { ok: false, error: "The request body was invalid." };
  if (!isRagSourceType(body["source_type"])) {
    return {
      ok: false,
      error: "source_type is required (guide, news, profile, or transaction).",
    };
  }
  const sourceId = asTrimmedString(body["source_id"]);
  if (sourceId === null || sourceId.length > MAX_SOURCE_ID_CHARS) {
    return { ok: false, error: `source_id is required (1–${MAX_SOURCE_ID_CHARS} characters).` };
  }
  const content = asTrimmedString(body["content"]);
  if (content === null || content.length > MAX_CONTENT_CHARS) {
    return { ok: false, error: `content is required (1–${MAX_CONTENT_CHARS} characters).` };
  }
  const title = asTrimmedString(body["title"]);
  if (title !== null && title.length > MAX_TITLE_CHARS) {
    return { ok: false, error: `title must be at most ${MAX_TITLE_CHARS} characters.` };
  }
  const symbolRaw = asTrimmedString(body["symbol"]);
  if (symbolRaw !== null && symbolRaw.length > MAX_SYMBOL_CHARS) {
    return { ok: false, error: `symbol must be at most ${MAX_SYMBOL_CHARS} characters.` };
  }
  const url = asTrimmedString(body["url"]);
  if (url !== null && url.length > MAX_URL_CHARS) {
    return { ok: false, error: `url must be at most ${MAX_URL_CHARS} characters.` };
  }
  const publishedAt = asTrimmedString(body["published_at"]);
  if (publishedAt !== null && Number.isNaN(Date.parse(publishedAt))) {
    return { ok: false, error: "published_at must be a valid date." };
  }
  const metadataRaw = body["metadata"];
  let metadata: Record<string, unknown> | null = null;
  if (metadataRaw !== undefined && metadataRaw !== null) {
    if (!isRecord(metadataRaw)) {
      return { ok: false, error: "metadata must be an object." };
    }
    metadata = metadataRaw;
  }
  const sharedRaw = body["shared"];
  const shared = sharedRaw === undefined ? false : sharedRaw;
  if (typeof shared !== "boolean") {
    return { ok: false, error: "shared must be a boolean." };
  }
  return {
    ok: true,
    value: {
      sourceType: body["source_type"] as RagSourceType,
      sourceId,
      title,
      content,
      symbol: symbolRaw ? symbolRaw.toUpperCase() : null,
      url,
      publishedAt,
      metadata,
      shared,
    },
  };
}

interface SearchRequest {
  query: string;
  matchCount: number;
  symbol: string | null;
}

function parseSearchRequest(body: unknown, defaultTopK: number): ParseResult<SearchRequest> {
  if (!isRecord(body)) return { ok: false, error: "The request body was invalid." };
  const query = asTrimmedString(body["query"]);
  if (query === null || query.length > 500) {
    return { ok: false, error: "A search query is required (1–500 characters)." };
  }
  const matchCountRaw = body["match_count"];
  let matchCount = defaultTopK;
  if (matchCountRaw !== undefined && matchCountRaw !== null) {
    if (
      typeof matchCountRaw !== "number" ||
      !Number.isInteger(matchCountRaw) ||
      matchCountRaw < 1 ||
      matchCountRaw > MAX_MATCH_COUNT
    ) {
      return { ok: false, error: `match_count must be 1–${MAX_MATCH_COUNT}.` };
    }
    matchCount = matchCountRaw;
  }
  const symbolRaw = asTrimmedString(body["symbol"]);
  if (symbolRaw !== null && symbolRaw.length > MAX_SYMBOL_CHARS) {
    return { ok: false, error: `symbol must be at most ${MAX_SYMBOL_CHARS} characters.` };
  }
  return {
    ok: true,
    value: { query, matchCount, symbol: symbolRaw ? symbolRaw.toUpperCase() : null },
  };
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

async function indexDocument(
  sb: PostgrestClient,
  embedder: OpenRouterEmbeddingsClient,
  userId: string,
  req: IndexRequest,
  config: RagConfig,
): Promise<{ chunks: number } | { error: string; code: string; status: number }> {
  const chunks = chunkText(req.content);
  if (chunks.length === 0) {
    return { error: "The content produced no chunks to index.", code: "BAD_REQUEST", status: 400 };
  }
  if (chunks.length > MAX_CHUNKS_PER_DOC) {
    return {
      error: `The content is too long to index in one call (${chunks.length} chunks, max ${MAX_CHUNKS_PER_DOC}).`,
      code: "BAD_REQUEST",
      status: 400,
    };
  }
  // Embed in batches (one provider call per batch).
  const vectors: number[][] = [];
  for (let i = 0; i < chunks.length; i += config.ingestBatchSize) {
    const batch = chunks.slice(i, i + config.ingestBatchSize);
    try {
      vectors.push(...(await embedder.embed(batch)));
    } catch {
      return {
        error: "The embeddings service is unavailable right now.",
        code: "UPSTREAM_ERROR",
        status: 502,
      };
    }
  }
  // Re-indexing replaces: delete the old rows for this document first
  // (best-effort — the unique index on (owner, source, chunk) guards
  // the user-doc case if the delete fails).
  const ownerFilter: [string, string, string] = req.shared
    ? ["owner_id", "is", "null"]
    : ["owner_id", "eq", userId];
  await sb.deleteWhere("rag_documents", [
    ["source_type", "eq", req.sourceType],
    ["source_id", "eq", req.sourceId],
    ownerFilter,
  ]);
  const rows = chunks.map((content, i) => ({
    owner_id: req.shared ? null : userId,
    source_type: req.sourceType,
    source_id: req.sourceId,
    chunk_index: i,
    symbol: req.symbol,
    title: req.title,
    content,
    // pgvector accepts the text literal — Postgres casts it to
    // vector(768) on insert (and rejects a wrong dimension loudly).
    embedding: `[${(vectors[i] as number[]).join(",")}]`,
    published_at: req.publishedAt,
    url: req.url,
    metadata: req.metadata,
  }));
  const inserted = await sb.insert("rag_documents", rows);
  if (!inserted) {
    return {
      error: "The indexed chunks could not be stored.",
      code: "INDEX_FAILED",
      status: 500,
    };
  }
  return { chunks: chunks.length };
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
    console.error("rag: SUPABASE_URL / SUPABASE_ANON_KEY are not set in the function environment.");
    return errorResponse("The RAG service is not configured.", "INTERNAL", 500, origin);
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
  if (!isRecord(body)) {
    return errorResponse("The request body was invalid.", "BAD_REQUEST", 400, origin);
  }
  const op = body["op"];
  if (op !== "index" && op !== "search") {
    return errorResponse('op is required ("index" or "search").', "BAD_REQUEST", 400, origin);
  }

  if (!config.apiKey) {
    return errorResponse(
      "AI explanations are not configured yet.",
      "AI_NOT_CONFIGURED",
      503,
      origin,
    );
  }

  const sb = createPostgrestClient(config.supabaseUrl, config.supabaseAnonKey, jwt);
  const embedder = new OpenRouterEmbeddingsClient(
    config.apiKey,
    config.baseUrl,
    config.embeddingModel,
    config.timeoutMs,
  );

  if (op === "index") {
    const parsed = parseIndexRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error, "BAD_REQUEST", 400, origin);
    }
    const result = await indexDocument(sb, embedder, userId, parsed.value, config);
    if ("error" in result) {
      return errorResponse(result.error, result.code, result.status, origin);
    }
    return jsonResponse(
      {
        indexed: true,
        source_id: parsed.value.sourceId,
        chunks: result.chunks,
        shared: parsed.value.shared,
      },
      200,
      origin,
    );
  }

  const parsed = parseSearchRequest(body, config.topK);
  if (!parsed.ok) {
    return errorResponse(parsed.error, "BAD_REQUEST", 400, origin);
  }
  const deps: SearchDocumentsDeps = {
    embedOne: (text) => embedder.embedOne(text),
    rpc: <T>(fn: string, args: Record<string, unknown>) => sb.rpc<T>(fn, args),
  };
  const result = await searchDocuments(deps, parsed.value.query, {
    ownerId: userId,
    topK: parsed.value.matchCount,
    symbol: parsed.value.symbol,
  });
  return jsonResponse(result, 200, origin);
});
