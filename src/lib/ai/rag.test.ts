import { describe, expect, it } from "vitest";

import {
  buildEmbeddingRequest,
  buildNewsChunkText,
  buildProfileChunkText,
  buildTransactionChunkText,
  chunkText,
  parseEmbeddingResponse,
  parseMatchDocumentsRows,
  RagEmbeddingError,
  searchDocuments,
  vectorLiteral,
  type SearchDocumentsDeps,
} from "../../../supabase/functions/_shared/rag.ts";

/**
 * Tests for the M4 RAG layer. The chunker and chunk-text builders are
 * ported from the old repo's `rag.chunking.spec.ts` (same cases, same
 * expectations); the embeddings and search parsers are ported from
 * `rag.embeddings.spec.ts` / `rag.retrieval.spec.ts` semantics.
 * Nothing here touches a live provider or database — the embeddings
 * client and the RPC are faked at the seam.
 */

function vector(dimensions = 768, value = 0.01): number[] {
  return Array.from({ length: dimensions }, () => value);
}

describe("chunkText", () => {
  it("returns [] for empty or blank text", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\t  ")).toEqual([]);
  });

  it("returns short text as a single chunk", () => {
    expect(chunkText("One short sentence.")).toEqual(["One short sentence."]);
  });

  it("collapses whitespace", () => {
    expect(chunkText("  Too   much\n  space.  ")).toEqual(["Too much space."]);
  });

  it("splits long text into chunks under the cap", () => {
    const sentences = Array.from(
      { length: 20 },
      (_, i) => `Sentence number ${i + 1} carries a small fact.`,
    );
    const chunks = chunkText(sentences.join(" "), { maxChars: 100 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(100);
    }
    // Every sentence survives somewhere.
    const joined = chunks.join(" ");
    for (const sentence of sentences) {
      expect(joined).toContain(sentence);
    }
  });

  it("does not split a sentence across chunks when it fits", () => {
    const text = "First sentence is here. Second sentence follows it. Third one ends.";
    const chunks = chunkText(text, { maxChars: 55, overlapChars: 0 });
    expect(chunks).toEqual([
      "First sentence is here. Second sentence follows it.",
      "Third one ends.",
    ]);
  });

  it("overlaps consecutive chunks so boundary facts survive", () => {
    const text = "Alpha beta gamma delta. Epsilon zeta eta theta. Iota kappa lambda mu.";
    const chunks = chunkText(text, { maxChars: 45, overlapChars: 15 });
    expect(chunks).toEqual([
      "Alpha beta gamma delta. Epsilon zeta eta theta.",
      "eta theta. Iota kappa lambda mu.",
    ]);
  });

  it("hard-splits one sentence longer than the cap", () => {
    const long = `Word `.repeat(60).trim();
    const chunks = chunkText(long, { maxChars: 50, overlapChars: 0 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
    expect(chunks.join(" ")).toBe(long);
  });

  it("hard-splits a single word longer than the cap", () => {
    const word = "x".repeat(130);
    const chunks = chunkText(word, { maxChars: 50, overlapChars: 0 });
    expect(chunks).toEqual(["x".repeat(50), "x".repeat(50), "x".repeat(30)]);
  });

  it("caps the overlap at half the chunk size", () => {
    const text = "One two three four five six. Seven eight nine ten eleven.";
    const chunks = chunkText(text, { maxChars: 30, overlapChars: 999 });
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(30);
    }
  });
});

describe("chunk text builders", () => {
  it("builds news text from title, publisher and date only", () => {
    expect(buildNewsChunkText("Reliance profit jumps 12%", "Reuters", "2026-11-18T10:00:00Z")).toBe(
      "Reliance profit jumps 12%. Source: Reuters. Published: 2026-11-18",
    );
  });

  it("omits missing news metadata", () => {
    expect(buildNewsChunkText("Headline only", null, null)).toBe("Headline only");
  });

  it("builds profile text from name, sector and description", () => {
    expect(
      buildProfileChunkText(
        "Reliance Industries",
        "Energy",
        "Oil & Gas",
        "Operates refineries and retail.",
      ),
    ).toBe(
      "Reliance Industries. Sector: Energy. Industry: Oil & Gas. Operates refineries and retail.",
    );
  });

  it("builds transaction text with direction and amount", () => {
    expect(buildTransactionChunkText("Swiggy order", "Food & Dining", -420.5, "2026-11-15")).toBe(
      "Swiggy order: spent ₹420.50 on Food & Dining on 2026-11-15.",
    );
    expect(buildTransactionChunkText("Salary", "Income", 85000, "2026-11-01")).toBe(
      "Salary: received ₹85000.00 on Income on 2026-11-01.",
    );
  });
});

describe("buildEmbeddingRequest", () => {
  it("builds the OpenAI-compatible body", () => {
    expect(buildEmbeddingRequest("baai/bge-base-en-v1.5", ["hello"])).toEqual({
      model: "baai/bge-base-en-v1.5",
      input: ["hello"],
    });
  });

  it("passes multiple texts through in order", () => {
    expect(buildEmbeddingRequest("m", ["a", "b", "c"])).toEqual({
      model: "m",
      input: ["a", "b", "c"],
    });
  });
});

describe("parseEmbeddingResponse", () => {
  it("parses a valid response in input order", () => {
    const data = {
      data: [
        { index: 0, embedding: vector(768, 0.1) },
        { index: 1, embedding: vector(768, 0.2) },
      ],
    };
    const vectors = parseEmbeddingResponse(data, 2, 768);
    expect(vectors).toHaveLength(2);
    expect(vectors[0]?.[0]).toBe(0.1);
    expect(vectors[1]?.[0]).toBe(0.2);
  });

  it("sorts by index when the provider reorders", () => {
    const data = {
      data: [
        { index: 1, embedding: vector(768, 0.2) },
        { index: 0, embedding: vector(768, 0.1) },
      ],
    };
    const vectors = parseEmbeddingResponse(data, 2, 768);
    expect(vectors[0]?.[0]).toBe(0.1);
    expect(vectors[1]?.[0]).toBe(0.2);
  });

  it("throws on a non-object payload", () => {
    expect(() => parseEmbeddingResponse(null, 1, 768)).toThrow(RagEmbeddingError);
    expect(() => parseEmbeddingResponse("nope", 1, 768)).toThrow(RagEmbeddingError);
  });

  it("throws on the wrong number of vectors", () => {
    const data = { data: [{ index: 0, embedding: vector() }] };
    expect(() => parseEmbeddingResponse(data, 2, 768)).toThrow(
      "The embeddings provider returned the wrong number of vectors.",
    );
  });

  it("throws on wrong dimensions", () => {
    const data = { data: [{ index: 0, embedding: vector(3) }] };
    expect(() => parseEmbeddingResponse(data, 1, 768)).toThrow(
      "The embedding model returned 3 dimensions, expected 768.",
    );
  });

  it("throws on a non-numeric vector", () => {
    const bad = vector();
    bad[0] = Number.NaN;
    const data = { data: [{ index: 0, embedding: bad }] };
    expect(() => parseEmbeddingResponse(data, 1, 768)).toThrow(
      "The embeddings provider returned a non-numeric vector.",
    );
  });
});

describe("vectorLiteral", () => {
  it("formats a vector as a pgvector literal", () => {
    expect(vectorLiteral([0.1, -0.2, 3])).toBe("[0.1,-0.2,3]");
  });
});

describe("parseMatchDocumentsRows", () => {
  const ROW = {
    id: "doc-1",
    source_type: "guide",
    title: "What is a SIP?",
    content: "A SIP invests a fixed amount every month.",
    symbol: null,
    published_at: "2026-11-23T00:00:00Z",
    url: null,
    similarity: 0.87654,
  };

  it("parses valid rows, rounding similarity", () => {
    expect(parseMatchDocumentsRows([ROW])).toEqual([
      {
        id: "doc-1",
        sourceType: "guide",
        title: "What is a SIP?",
        symbol: null,
        publishedAt: "2026-11-23T00:00:00Z",
        url: null,
        similarity: 0.88,
        content: "A SIP invests a fixed amount every month.",
      },
    ]);
  });

  it("skips malformed rows", () => {
    const rows = [
      ROW,
      { ...ROW, id: undefined },
      { ...ROW, id: "doc-2", content: "" },
      { ...ROW, id: "doc-3", similarity: "high" },
      null,
      "not a row",
    ];
    expect(parseMatchDocumentsRows(rows)).toHaveLength(1);
  });

  it("returns [] for a non-array payload", () => {
    expect(parseMatchDocumentsRows(null)).toEqual([]);
    expect(parseMatchDocumentsRows({})).toEqual([]);
  });

  it("defaults a missing source_type to guide", () => {
    const rows = parseMatchDocumentsRows([{ ...ROW, source_type: undefined }]);
    expect(rows[0]?.sourceType).toBe("guide");
  });

  it("caps content at 600 characters", () => {
    const rows = parseMatchDocumentsRows([{ ...ROW, content: "x".repeat(700) }]);
    expect(rows[0]?.content).toBe(`${"x".repeat(600)}…`);
  });
});

describe("searchDocuments", () => {
  interface FakeOpts {
    rows?: unknown[];
    embedThrows?: boolean;
    rpcThrows?: boolean;
  }

  function fakeDeps(opts: FakeOpts = {}): {
    calls: Array<{ fn: string; args: Record<string, unknown> }>;
    deps: SearchDocumentsDeps;
  } {
    const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
    return {
      calls,
      deps: {
        embedOne: async () => {
          if (opts.embedThrows) throw new Error("embed down");
          return vector();
        },
        rpc: async <T>(fn: string, args: Record<string, unknown>): Promise<T[]> => {
          calls.push({ fn, args });
          if (opts.rpcThrows) throw new Error("rpc down");
          return (opts.rows ?? []) as T[];
        },
      },
    };
  }

  const ROW = {
    id: "doc-1",
    source_type: "guide",
    title: "What is a SIP?",
    content: "A SIP invests a fixed amount every month.",
    symbol: null,
    published_at: null,
    url: null,
    similarity: 0.9,
  };

  it("returns available:true with parsed chunks on success", async () => {
    const { deps } = fakeDeps({ rows: [ROW] });
    const result = await searchDocuments(deps, "what is a SIP?", {
      ownerId: "user-1",
      topK: 3,
    });
    expect(result.available).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.chunks).toHaveLength(1);
    expect(result.chunks[0]?.title).toBe("What is a SIP?");
  });

  it("passes owner, vector literal and match count to the RPC", async () => {
    const { calls, deps } = fakeDeps({ rows: [] });
    await searchDocuments(deps, "what is a SIP?", { ownerId: "user-1", topK: 3 });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.fn).toBe("match_documents");
    expect(calls[0]?.args["owner_id"]).toBe("user-1");
    expect(calls[0]?.args["match_count"]).toBe(3);
    const literal = calls[0]?.args["query_embedding"];
    expect(typeof literal).toBe("string");
    expect((literal as string).startsWith("[0.01,")).toBe(true);
    expect((literal as string).endsWith("]")).toBe(true);
    expect("p_symbol" in (calls[0]?.args ?? {})).toBe(false);
  });

  it("passes p_symbol only when a symbol is given", async () => {
    const { calls, deps } = fakeDeps({ rows: [] });
    await searchDocuments(deps, "RELIANCE news", {
      ownerId: "user-1",
      symbol: "RELIANCE.NS",
    });
    expect(calls[0]?.args["p_symbol"]).toBe("RELIANCE.NS");
  });

  it("returns available:false when the embedder is missing (unconfigured)", async () => {
    const result = await searchDocuments(null, "what is a SIP?", { ownerId: "user-1" });
    expect(result).toEqual({
      available: false,
      chunks: [],
      reason: "Embeddings are not configured yet.",
    });
  });

  it("returns available:false on an embedding failure (outage, not no-context)", async () => {
    const { deps } = fakeDeps({ embedThrows: true });
    const result = await searchDocuments(deps, "what is a SIP?", { ownerId: "user-1" });
    expect(result.available).toBe(false);
    expect(result.chunks).toEqual([]);
    expect(result.reason).toBe("Retrieval is unavailable right now.");
  });

  it("returns available:false on an RPC failure", async () => {
    const { deps } = fakeDeps({ rpcThrows: true });
    const result = await searchDocuments(deps, "what is a SIP?", { ownerId: "user-1" });
    expect(result.available).toBe(false);
    expect(result.reason).toBe("Retrieval is unavailable right now.");
  });

  it("returns available:true with zero chunks when nothing matches", async () => {
    const { deps } = fakeDeps({ rows: [] });
    const result = await searchDocuments(deps, "obscure topic", { ownerId: "user-1" });
    expect(result).toEqual({ available: true, chunks: [], reason: null });
  });
});
