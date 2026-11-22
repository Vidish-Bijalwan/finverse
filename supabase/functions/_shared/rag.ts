/**
 * RAG shared logic: text chunking, the OpenRouter embeddings client,
 * and vector search over `rag_documents` (migration 0006).
 *
 * Ported from the old repo's Phase 2 (`src/rag/`, NestJS) with the DI
 * removed. The module is runtime-agnostic — the `rag` Edge Function
 * and the `ai-chat` function both import it, and the vitest suite
 * imports it directly (see `src/lib/ai/rag.test.ts`).
 *
 * Two design points worth knowing:
 * - Chunks are capped at 500 CHARS (~100–125 tokens), not 500 tokens:
 *   the embedding model takes at most 512 tokens per input, so the
 *   char cap leaves generous headroom for any input (old code's
 *   deliberate choice — a 500-token chunk could exceed the model
 *   limit once tokenised).
 * - Search never throws: `available: false` means the embeddings
 *   layer is down or unconfigured (an outage — the caller degrades
 *   honestly), while `available: true` with zero chunks means the
 *   query embedded fine but nothing relevant passed the similarity
 *   floor (the caller must say "no relevant context" instead of
 *   answering from memory). The two states are kept distinct on
 *   purpose; conflating them would hide real outages behind
 *   "no context" answers.
 */

// ---------------------------------------------------------------------------
// Constants (must match migration 0006)
// ---------------------------------------------------------------------------

/** Embedding model — same OpenRouter key as the chat models. */
export const EMBEDDING_MODEL = "baai/bge-base-en-v1.5";
/** Must match the vector(768) column in migration 0006. */
export const EMBEDDING_DIMENSIONS = 768;
export const DEFAULT_EMBEDDING_TIMEOUT_MS = 30_000;
/** How many chunks a retrieval returns at most (tool default is 3). */
export const DEFAULT_RAG_TOP_K = 5;
/** Minimum cosine similarity — enforced inside match_documents. */
export const DEFAULT_RAG_MIN_SIMILARITY = 0.35;
/** Texts embedded in one provider call during ingestion. */
export const DEFAULT_RAG_INGEST_BATCH_SIZE = 25;
/** Chunks are capped at 500 chars (~100–125 tokens — see the header). */
export const DEFAULT_CHUNK_MAX_CHARS = 500;
export const DEFAULT_CHUNK_OVERLAP_CHARS = 50;
/** A tool result never carries more than this many characters per chunk. */
export const MAX_CHUNK_CONTENT_CHARS = 600;

export type RagSourceType = "guide" | "news" | "profile" | "transaction";

export const RAG_SOURCE_TYPES: ReadonlySet<string> = new Set([
  "guide",
  "news",
  "profile",
  "transaction",
]);

export function isRagSourceType(value: unknown): value is RagSourceType {
  return typeof value === "string" && RAG_SOURCE_TYPES.has(value);
}

// ---------------------------------------------------------------------------
// Chunking (port of the old rag.chunking.ts)
// ---------------------------------------------------------------------------

export interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
}

/** Split into sentences, hard-splitting any sentence over the cap. */
function splitSentences(text: string, maxChars: number): string[] {
  const raw = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const sentences: string[] = [];
  for (const sentence of raw) {
    if (sentence.length <= maxChars) {
      sentences.push(sentence);
      continue;
    }
    // One long sentence: pack its words, hard-splitting a single word
    // that is itself longer than the cap.
    let current = "";
    for (const word of sentence.split(" ")) {
      if (word.length > maxChars) {
        if (current) {
          sentences.push(current);
          current = "";
        }
        for (let i = 0; i < word.length; i += maxChars) {
          sentences.push(word.slice(i, i + maxChars));
        }
        continue;
      }
      if (!current) {
        current = word;
        continue;
      }
      if (current.length + 1 + word.length <= maxChars) {
        current += ` ${word}`;
      } else {
        sentences.push(current);
        current = word;
      }
    }
    if (current) sentences.push(current);
  }
  return sentences;
}

/** The tail of a chunk, cut at a word boundary, for the next chunk. */
function overlapTail(text: string, chars: number): string {
  if (chars <= 0 || text.length <= chars) return "";
  const tail = text.slice(-chars);
  const firstSpace = tail.indexOf(" ");
  return firstSpace === -1 ? tail : tail.slice(firstSpace + 1);
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const maxChars = Math.max(50, options.maxChars ?? DEFAULT_CHUNK_MAX_CHARS);
  const overlapChars = Math.min(
    Math.max(0, options.overlapChars ?? DEFAULT_CHUNK_OVERLAP_CHARS),
    Math.floor(maxChars / 2),
  );
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = splitSentences(cleaned, maxChars);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (!current) {
      current = sentence;
      continue;
    }
    if (current.length + 1 + sentence.length <= maxChars) {
      current += ` ${sentence}`;
      continue;
    }
    chunks.push(current);
    const tail = overlapTail(current, overlapChars);
    current =
      tail && tail.length + 1 + sentence.length <= maxChars
        ? `${tail} ${sentence}`
        : sentence;
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * The indexed text for a news item. Yahoo search news carries a title,
 * publisher, date and link but no article body, so the chunk is exactly
 * that metadata — the system never pretends to have read the full text.
 * (News ingestion is a follow-up — see MIGRATION.md §9 — but the
 * builder is kept so the future ingester chunks the same way.)
 */
export function buildNewsChunkText(
  title: string,
  publisher: string | null,
  publishedAt: string | null,
): string {
  const date = publishedAt ? publishedAt.slice(0, 10) : null;
  const parts = [title];
  if (publisher) parts.push(`Source: ${publisher}`);
  if (date) parts.push(`Published: ${date}`);
  return parts.join(". ");
}

/** The indexed text for a company profile (Yahoo longBusinessSummary). */
export function buildProfileChunkText(
  name: string,
  sector: string | null,
  industry: string | null,
  description: string | null,
): string {
  const parts = [name];
  if (sector) parts.push(`Sector: ${sector}`);
  if (industry) parts.push(`Industry: ${industry}`);
  if (description) parts.push(description);
  return parts.join(". ");
}

/** The indexed text for one of the user's transactions. */
export function buildTransactionChunkText(
  name: string,
  category: string,
  amount: number,
  date: string,
): string {
  const direction = amount < 0 ? "spent" : "received";
  return `${name}: ${direction} ₹${Math.abs(amount).toFixed(2)} on ${category} on ${date}.`;
}

// ---------------------------------------------------------------------------
// Embeddings client (port of the old rag.embeddings.ts)
// ---------------------------------------------------------------------------

export class RagEmbeddingError extends Error {
  readonly status: number | undefined;
  readonly timedOut: boolean;

  constructor(message: string, status?: number, timedOut = false) {
    super(message);
    this.name = "RagEmbeddingError";
    this.status = status;
    this.timedOut = timedOut;
  }
}

export interface EmbeddingsClient {
  /** One vector per input, in input order. Empty input returns []. */
  embed(texts: string[]): Promise<number[][]>;
  embedOne(text: string): Promise<number[]>;
}

/** The JSON body for an OpenAI-compatible embeddings call. */
export function buildEmbeddingRequest(model: string, texts: string[]): unknown {
  return { model, input: texts };
}

/**
 * Parse an embeddings response into vectors, in input order. Throws
 * RagEmbeddingError on any shape problem — a wrong count, wrong
 * dimensions, or a non-numeric vector is a loud failure, never a
 * silently stored bad vector.
 */
export function parseEmbeddingResponse(
  data: unknown,
  expectedCount: number,
  dimensions: number,
): number[][] {
  if (!data || typeof data !== "object") {
    throw new RagEmbeddingError("The embeddings provider returned an invalid response.");
  }
  const record = data as Record<string, unknown>;
  const items = record["data"];
  if (!Array.isArray(items) || items.length !== expectedCount) {
    throw new RagEmbeddingError(
      "The embeddings provider returned the wrong number of vectors.",
    );
  }
  const vectors: number[][] = [];
  // The API returns items in input order, but sort by index defensively
  // so a provider that reorders cannot mislabel a chunk's vector.
  const indexed = (item: unknown): number | null => {
    if (!item || typeof item !== "object") return null;
    const index = (item as Record<string, unknown>)["index"];
    return typeof index === "number" ? index : null;
  };
  const sorted = items.every((item) => indexed(item) !== null)
    ? [...items].sort((a, b) => (indexed(a) as number) - (indexed(b) as number))
    : items;
  for (const item of sorted) {
    if (!item || typeof item !== "object") {
      throw new RagEmbeddingError("The embeddings provider returned an invalid response.");
    }
    const embedding = (item as Record<string, unknown>)["embedding"];
    if (!Array.isArray(embedding) || embedding.length !== dimensions) {
      throw new RagEmbeddingError(
        `The embedding model returned ${Array.isArray(embedding) ? embedding.length : "no"} dimensions, expected ${dimensions}.`,
      );
    }
    if (!embedding.every((value) => typeof value === "number" && Number.isFinite(value))) {
      throw new RagEmbeddingError("The embeddings provider returned a non-numeric vector.");
    }
    vectors.push(embedding as number[]);
  }
  return vectors;
}

export class OpenRouterEmbeddingsClient implements EmbeddingsClient {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly baseUrl: string,
    private readonly model: string,
    private readonly timeoutMs: number,
    private readonly dimensions: number = EMBEDDING_DIMENSIONS,
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    if (!this.apiKey) {
      throw new RagEmbeddingError("The embeddings provider is not configured.");
    }
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "FinVerse AI",
        },
        body: JSON.stringify(buildEmbeddingRequest(this.model, texts)),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new RagEmbeddingError(
          "The embeddings provider took too long to respond.",
          undefined,
          true,
        );
      }
      throw new RagEmbeddingError("The embeddings provider could not be reached.");
    }
    if (!response.ok) {
      // Only the status is kept; provider error bodies can contain
      // request echoes and are never surfaced.
      throw new RagEmbeddingError("The embeddings provider returned an error.", response.status);
    }
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new RagEmbeddingError("The embeddings provider returned an invalid response.");
    }
    return parseEmbeddingResponse(data, texts.length, this.dimensions);
  }

  async embedOne(text: string): Promise<number[]> {
    const [vector] = await this.embed([text]);
    // `embed` guarantees one vector per input, so this is always set.
    return vector as number[];
  }
}

// ---------------------------------------------------------------------------
// Vector search (port of the old retrieval + repository search)
// ---------------------------------------------------------------------------

/** One retrieved chunk, as the tool loop and the rag function see it. */
export interface RetrievedChunk {
  id: string;
  sourceType: string;
  title: string | null;
  symbol: string | null;
  publishedAt: string | null;
  url: string | null;
  /** Cosine similarity, 0–1, rounded to 2 decimals. */
  similarity: number;
  content: string;
}

export interface RetrievedContext {
  available: boolean;
  chunks: RetrievedChunk[];
  reason: string | null;
}

export interface SearchDocumentsOptions {
  /** The caller's user id — the RPC returns their docs + shared docs. */
  ownerId: string;
  topK?: number;
  symbol?: string | null;
}

export interface SearchDocumentsDeps {
  embedOne: (text: string) => Promise<number[]>;
  /** PostgREST RPC call — throws on failure (search needs its data). */
  rpc: <T>(fn: string, args: Record<string, unknown>) => Promise<T[]>;
}

/** A 768-float vector as a pgvector literal: `[0.1,-0.2,...]`. */
export function vectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Parse `match_documents` rows into chunks. Malformed rows are skipped
 * (a bad row must not fail the whole search); a non-array payload
 * yields no chunks.
 */
export function parseMatchDocumentsRows(rows: unknown): RetrievedChunk[] {
  if (!Array.isArray(rows)) return [];
  const chunks: RetrievedChunk[] = [];
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = asString(row["id"]);
    const content = asString(row["content"]);
    const similarity = row["similarity"];
    if (id === null || content === null) continue;
    if (typeof similarity !== "number" || !Number.isFinite(similarity)) continue;
    chunks.push({
      id,
      sourceType: asString(row["source_type"]) ?? "guide",
      title: asString(row["title"]),
      symbol: asString(row["symbol"]),
      publishedAt: asString(row["published_at"]),
      url: asString(row["url"]),
      similarity: round2(similarity),
      content:
        content.length > MAX_CHUNK_CONTENT_CHARS
          ? `${content.slice(0, MAX_CHUNK_CONTENT_CHARS)}…`
          : content,
    });
  }
  return chunks;
}

/**
 * Embed the query, search the vector store, return the top chunks.
 * Never throws — see the header note on available:false vs zero
 * chunks. `embedder` null means the key is not configured.
 */
export async function searchDocuments(
  deps: SearchDocumentsDeps | null,
  query: string,
  options: SearchDocumentsOptions,
): Promise<RetrievedContext> {
  if (!deps) {
    return { available: false, chunks: [], reason: "Embeddings are not configured yet." };
  }
  try {
    const vector = await deps.embedOne(query);
    const args: Record<string, unknown> = {
      owner_id: options.ownerId,
      query_embedding: vectorLiteral(vector),
      match_count: options.topK ?? DEFAULT_RAG_TOP_K,
    };
    if (options.symbol) args["p_symbol"] = options.symbol;
    const rows = await deps.rpc<Record<string, unknown>>("match_documents", args);
    return { available: true, chunks: parseMatchDocumentsRows(rows), reason: null };
  } catch {
    // An embedding failure or a database failure is a retrieval
    // outage, not a "no context" answer — but it must not take the
    // feature down with it.
    return { available: false, chunks: [], reason: "Retrieval is unavailable right now." };
  }
}
