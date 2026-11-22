/**
 * Request validation and the structured-output contract for the LLM.
 *
 * Ported from the old repo's `ai.validation.ts` (NestJS) with one change:
 * the old code used Zod; this module is hand-rolled instead, so it stays
 * runtime-agnostic (importable by both the Deno Edge Function and the
 * vitest suite — see the M2 `_shared/yahoo.ts` pattern). The constraints
 * and error strings match the Zod originals.
 *
 * The answer contract is the core of the guardrail: claims separated
 * from evidence, every claim carrying the tool and values it cites, and
 * refusals as a first-class shape instead of free text.
 */

/** Chat request: one user message, 1–2000 chars. */
export interface ChatRequest {
  message: string;
}

export function parseChatRequest(input: unknown): ChatRequest | null {
  if (!isRecord(input)) return null;
  const message = asTrimmedString(input["message"]);
  if (message === null || message.length < 1 || message.length > 2000) return null;
  return { message };
}

/** Tool argument shapes — defaults applied, no optional properties. */
export interface GetStockArgs {
  symbol: string;
}

export interface GetTransactionsArgs {
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  limit: number;
}

export interface GetBudgetStatusArgs {
  month: string | null;
}

export interface GetCategorySpendingArgs {
  category: string;
  period: "week" | "month" | "3months";
}

export interface SearchKnowledgeArgs {
  query: string;
  symbol: string | null;
}

export type ToolArgsParse = { ok: true; value: unknown } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidMonth(value: string): boolean {
  if (!MONTH_RE.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function parseGetStockArgs(args: unknown): ToolArgsParse {
  if (!isRecord(args)) return { ok: false, error: "The tool arguments were invalid." };
  const symbol = asTrimmedString(args["symbol"]);
  if (symbol === null || symbol.length > 20) {
    return { ok: false, error: "A stock symbol is required (1–20 characters)." };
  }
  const value: GetStockArgs = { symbol };
  return { ok: true, value };
}

export function parseGetTransactionsArgs(args: unknown): ToolArgsParse {
  if (!isRecord(args)) return { ok: false, error: "The tool arguments were invalid." };
  const categoryRaw = args["category"];
  let category: string | null = null;
  if (categoryRaw !== undefined && categoryRaw !== null) {
    category = asTrimmedString(categoryRaw);
    if (category === null || category.length > 40) {
      return { ok: false, error: "The category must be 1–40 characters." };
    }
  }
  const startRaw = args["startDate"];
  let startDate: string | null = null;
  if (startRaw !== undefined && startRaw !== null) {
    if (typeof startRaw !== "string" || !isValidDate(startRaw)) {
      return { ok: false, error: "startDate must be a date (YYYY-MM-DD)." };
    }
    startDate = startRaw;
  }
  const endRaw = args["endDate"];
  let endDate: string | null = null;
  if (endRaw !== undefined && endRaw !== null) {
    if (typeof endRaw !== "string" || !isValidDate(endRaw)) {
      return { ok: false, error: "endDate must be a date (YYYY-MM-DD)." };
    }
    endDate = endRaw;
  }
  const limitRaw = args["limit"];
  let limit = 20;
  if (limitRaw !== undefined && limitRaw !== null) {
    if (
      typeof limitRaw !== "number" ||
      !Number.isInteger(limitRaw) ||
      limitRaw < 1 ||
      limitRaw > 50
    ) {
      return { ok: false, error: "limit must be an integer between 1 and 50." };
    }
    limit = limitRaw;
  }
  const value: GetTransactionsArgs = { category, startDate, endDate, limit };
  return { ok: true, value };
}

export function parseGetBudgetStatusArgs(args: unknown): ToolArgsParse {
  if (!isRecord(args)) return { ok: false, error: "The tool arguments were invalid." };
  const monthRaw = args["month"];
  let month: string | null = null;
  if (monthRaw !== undefined && monthRaw !== null) {
    if (typeof monthRaw !== "string" || !isValidMonth(monthRaw)) {
      return { ok: false, error: "month must be YYYY-MM." };
    }
    month = monthRaw;
  }
  const value: GetBudgetStatusArgs = { month };
  return { ok: true, value };
}

export function parseGetCategorySpendingArgs(args: unknown): ToolArgsParse {
  if (!isRecord(args)) return { ok: false, error: "The tool arguments were invalid." };
  const category = asTrimmedString(args["category"]);
  if (category === null || category.length > 40) {
    return { ok: false, error: "A category is required (1–40 characters)." };
  }
  const periodRaw = args["period"];
  let period: GetCategorySpendingArgs["period"] = "month";
  if (periodRaw !== undefined && periodRaw !== null) {
    if (periodRaw !== "week" && periodRaw !== "month" && periodRaw !== "3months") {
      return { ok: false, error: 'period must be "week", "month", or "3months".' };
    }
    period = periodRaw;
  }
  const value: GetCategorySpendingArgs = { category, period };
  return { ok: true, value };
}

export function parseSearchKnowledgeArgs(args: unknown): ToolArgsParse {
  if (!isRecord(args)) return { ok: false, error: "The tool arguments were invalid." };
  const query = asTrimmedString(args["query"]);
  if (query === null || query.length > 500) {
    return { ok: false, error: "A search query is required (1–500 characters)." };
  }
  const symbolRaw = args["symbol"];
  let symbol: string | null = null;
  if (symbolRaw !== undefined && symbolRaw !== null) {
    symbol = asTrimmedString(symbolRaw);
    if (symbol === null || symbol.length > 20) {
      return { ok: false, error: "The symbol must be 1–20 characters." };
    }
  }
  const value: SearchKnowledgeArgs = { query, symbol };
  return { ok: true, value };
}

// ---------------------------------------------------------------------------
// Structured answers
// ---------------------------------------------------------------------------

export interface AiClaimSource {
  tool: string;
  values: Record<string, string | number | boolean | null>;
}

export interface AiClaim {
  text: string;
  source: AiClaimSource;
}

export interface AiAnswer {
  answer: string;
  claims: AiClaim[];
  refused: boolean;
  refusalReason: string | null;
}

function isClaimValue(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/**
 * Validate a parsed JSON value against the structured-answer contract.
 * Replicates the old Zod schema's superRefine rules: a refused answer
 * must carry no claims and a refusal reason; a non-refused answer must
 * cite at least one claim.
 */
export function validateAiAnswer(
  value: unknown,
): { ok: true; value: AiAnswer } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return {
      ok: false,
      error: "The model reply did not match the required shape: expected an object.",
    };
  }
  const answer = value["answer"];
  if (typeof answer !== "string" || answer.trim() === "") {
    return {
      ok: false,
      error: "The model reply did not match the required shape: answer is required.",
    };
  }
  const refused = value["refused"];
  if (typeof refused !== "boolean") {
    return {
      ok: false,
      error: "The model reply did not match the required shape: refused must be a boolean.",
    };
  }
  const rawClaims = value["claims"];
  if (!Array.isArray(rawClaims)) {
    return {
      ok: false,
      error: "The model reply did not match the required shape: claims must be an array.",
    };
  }
  const claims: AiClaim[] = [];
  for (const raw of rawClaims) {
    if (!isRecord(raw)) {
      return {
        ok: false,
        error: "The model reply did not match the required shape: each claim must be an object.",
      };
    }
    const text = raw["text"];
    if (typeof text !== "string" || text.trim() === "") {
      return {
        ok: false,
        error: "The model reply did not match the required shape: each claim needs text.",
      };
    }
    const source = raw["source"];
    if (!isRecord(source)) {
      return {
        ok: false,
        error: "The model reply did not match the required shape: each claim needs a source.",
      };
    }
    const tool = source["tool"];
    if (typeof tool !== "string" || tool.trim() === "") {
      return {
        ok: false,
        error: "The model reply did not match the required shape: each claim needs a source tool.",
      };
    }
    const valuesRaw = source["values"];
    if (!isRecord(valuesRaw)) {
      return {
        ok: false,
        error: "The model reply did not match the required shape: each claim needs source values.",
      };
    }
    const values: Record<string, string | number | boolean | null> = {};
    for (const [key, entry] of Object.entries(valuesRaw)) {
      if (!isClaimValue(entry)) {
        return {
          ok: false,
          error:
            "The model reply did not match the required shape: claim values must be strings, numbers, booleans, or null.",
        };
      }
      values[key] = entry;
    }
    claims.push({ text, source: { tool, values } });
  }
  const refusalRaw = value["refusalReason"];
  let refusalReason: string | null = null;
  if (refusalRaw !== undefined && refusalRaw !== null) {
    if (typeof refusalRaw !== "string") {
      return {
        ok: false,
        error:
          "The model reply did not match the required shape: refusalReason must be a string or null.",
      };
    }
    refusalReason = refusalRaw;
  }
  if (refused) {
    if (claims.length > 0) {
      return {
        ok: false,
        error:
          "The model reply did not match the required shape: A refused answer must not carry claims.",
      };
    }
    if (!refusalReason || !refusalReason.trim()) {
      return {
        ok: false,
        error:
          "The model reply did not match the required shape: A refused answer must carry a refusal reason.",
      };
    }
  } else if (claims.length === 0) {
    return {
      ok: false,
      error:
        "The model reply did not match the required shape: An answer must cite at least one claim from the tools.",
    };
  }
  return { ok: true, value: { answer, claims, refused, refusalReason } };
}

/**
 * Parse one structured JSON reply from the model: strip markdown fences
 * defensively, parse the JSON, validate against the answer contract.
 */
export function parseStructuredJson(
  raw: string | null,
): { ok: true; value: AiAnswer } | { ok: false; error: string } {
  if (raw === null || !raw.trim()) {
    return { ok: false, error: "The model returned an empty reply." };
  }
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "The model reply was not valid JSON." };
  }
  return validateAiAnswer(parsed);
}
