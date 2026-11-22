import { macd, rsi, sma } from "./ai-indicators";
import type { ToolDefinition } from "./ai-provider";
import { MAX_CHUNK_CONTENT_CHARS, type RetrievedChunk, type RetrievedContext } from "./rag";
import {
  parseGetBudgetStatusArgs,
  parseGetCategorySpendingArgs,
  parseGetStockArgs,
  parseGetTransactionsArgs,
  parseSearchKnowledgeArgs,
  type GetBudgetStatusArgs,
  type GetCategorySpendingArgs,
  type GetStockArgs,
  type GetTransactionsArgs,
  type SearchKnowledgeArgs,
} from "./ai-validation";
import { toYahooSymbol } from "./yahoo";

/**
 * The tools the model may call. Every tool reads from the deterministic
 * layer and returns plain JSON. The model never computes a number
 * itself; it only interprets what the tools return.
 *
 * Ported from the old repo's `ai.tools.ts` (NestJS), rewritten against
 * THIS schema: Supabase tables, integer paise in storage, rupee values
 * in tool results (the guardrail's text checks compare the model's
 * ₹-formatted prose against rupee values — see ai-guardrail.ts).
 *
 * Two deliberate deviations from the old port:
 * - `getReadinessScore` is NOT here yet: the readiness score is
 *   computed client-side by `src/lib/calc/readiness.ts` (M5) and the
 *   Edge Function cannot import it. It joins when the scorer moves to
 *   a shared location (follow-up in docs/MIGRATION.md §8).
 * - `searchKnowledge` retrieves from the RAG store (M4) via the
 *   shared `_shared/rag.ts` search — the `ai-chat` function calls it
 *   in-process, not over HTTP to the `rag` function (see
 *   docs/MIGRATION.md §9 for why). It searches the indexed guides
 *   (SIP, EMI, PPF, ELSS, emergency fund, readiness, index vs
 *   active, diversification) and, when any exist, indexed news and
 *   company profiles. News ingestion is a follow-up (MIGRATION §9),
 *   so no news is indexed yet — the tool description says so.
 * - `getStockFundamentals` has no P/E / market-cap / 52-week fields:
 *   those came from Yahoo's quoteSummary endpoint, which needs a crumb
 *   session. Everything here is computed from the v8 chart history the
 *   `market-data` function already serves (price + technicals + the
 *   3-month range), and the description says exactly that.
 *
 * All tools are owner-scoped: they receive data only through the
 * `ToolDataAccess` the function builds with the caller's own JWT (RLS
 * enforces ownership), and never a user id from the model's arguments.
 */

// ---------------------------------------------------------------------------
// Tool definitions (sent to the model)
// ---------------------------------------------------------------------------

export const AI_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "getPortfolioSummary",
      description:
        "The user\u2019s investment portfolio valued at current prices: holdings, total value, total invested, gains and losses. Holdings whose live price cannot be fetched are valued at average buy price instead and flagged as unpriced — say so when that happens.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getBudgetStatus",
      description:
        "The user\u2019s monthly budget: income, and for each budget category the budgeted amount, what has been spent so far this month, and what remains. Use it for questions about spending, overspending, and what is left to spend.",
      parameters: {
        type: "object",
        properties: {
          month: {
            type: "string",
            description: "Month as YYYY-MM. Defaults to the current month.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTransactions",
      description:
        'The user\u2019s recorded transactions, most recent first. Filter by category (for example "Food & Dining") and by date range. Amounts are negative for expenses and positive for income.',
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Transaction category." },
          startDate: {
            type: "string",
            description: "First date, as YYYY-MM-DD.",
          },
          endDate: { type: "string", description: "Last date, as YYYY-MM-DD." },
          limit: {
            type: "integer",
            description: "How many to return, 1 to 50. Defaults to 20.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getStockQuote",
      description:
        "The current price of a stock or index, with its previous close and change. Symbols are Yahoo symbols: NSE stocks end in .NS (for example RELIANCE.NS), indices start with ^ (for example ^NSEI for NIFTY 50). A plain FinVerse symbol (RELIANCE, NIFTY50) works too.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "The stock symbol." },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getStockFundamentals",
      description:
        "Everything known about one stock from its price history: current price, previous close, change, and technicals computed from 3 months of prices (RSI, moving averages, MACD, one-month and three-month change, 3-month high/low range). Use it to explain how a stock looks right now. It has no P/E, market cap, or 52-week figures — do not state any.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "The stock symbol." },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCategorySpending",
      description:
        'How much the user spent in one category over a period: total spent, number of transactions, and the largest transactions. Use it for "why did I overspend on food" questions. Periods: "week" (last 7 days), "month" (this calendar month), "3months" (this month and the previous two).',
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: 'The category, for example "Food & Dining" or "Transport".',
          },
          period: {
            type: "string",
            enum: ["week", "month", "3months"],
            description: 'Defaults to "month".',
          },
        },
        required: ["category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getGoalProgress",
      description:
        "The user\u2019s savings goals: target amount, amount saved so far, progress percentage, and deadline for each goal.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "searchKnowledge",
      description:
        "Search the indexed knowledge guides for background on a financial concept: what a SIP, EMI, PPF, ELSS, emergency fund, or index fund is, how the readiness score works, what diversification means, and similar explainers. It also searches indexed news and company profiles when any exist (none are indexed yet). Use it for \u201Cwhat is\u2026\u201D and \u201Chow does \u2026 work\u201D questions and for market context — NOT for the user\u2019s own numbers (use the data tools for those). Returns the matching chunks with their source title — cite those in the answer. An empty result means no relevant context was found: say so instead of answering from memory.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "What to search for, in plain language.",
          },
          symbol: {
            type: "string",
            description: "Optional stock symbol to limit the search to (e.g. RELIANCE.NS).",
          },
        },
        required: ["query"],
      },
    },
  },
];

/** Tool names the chat loop accepts (anything else is an unknown tool). */
export const AI_TOOL_NAMES = new Set(AI_TOOL_DEFINITIONS.map((d) => d.function.name));

// ---------------------------------------------------------------------------
// Data access (implemented by the Edge Function with the caller's JWT)
// ---------------------------------------------------------------------------

export interface ToolTransactionRow {
  id: string;
  type: "expense" | "income" | "transfer";
  amountPaise: number;
  category: string;
  note: string;
  dateISO: string;
  tags: string[];
}

export interface ToolBudgetRow {
  categoryId: string;
  month: string;
  limitPaise: number;
}

export interface ToolGoalRow {
  name: string;
  targetPaise: number;
  savedPaise: number;
  deadline: string;
}

export interface ToolHoldingRow {
  symbol: string;
  qty: number;
  avgPricePaise: number;
}

export interface ToolQuote {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  currency: string;
  asOf: string;
}

export interface ToolHistoryBar {
  date: string;
  close: number;
  volume: number | null;
}

export interface ToolDataAccess {
  listTransactions(filter: {
    type?: "expense" | "income" | "transfer" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    limit: number;
  }): Promise<ToolTransactionRow[]>;
  listBudgets(month: string): Promise<ToolBudgetRow[]>;
  listGoals(): Promise<ToolGoalRow[]>;
  listHoldings(): Promise<ToolHoldingRow[]>;
  /** Live quote via the `market-data` Edge Function; null when unavailable. */
  getQuote(yahooSymbol: string): Promise<ToolQuote | null>;
  /** Daily closes via the `market-data` Edge Function; null when unavailable. */
  getHistory(yahooSymbol: string, range: string): Promise<ToolHistoryBar[] | null>;
  /**
   * Vector search over the RAG store via the shared `_shared/rag.ts`
   * search (in-process — the ai-chat function does not call the `rag`
   * function over HTTP). Never throws: `available: false` means the
   * embeddings layer is down or unconfigured; zero chunks means
   * nothing relevant passed the similarity floor.
   */
  searchKnowledge(
    query: string,
    symbol: string | null,
    topK: number,
  ): Promise<RetrievedContext>;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Tag written on every simulated-brokerage ledger row (orders + SIP posts). */
const SIMULATED_BROKERAGE_TAG = "simulated-brokerage";

/**
 * True for simulated-brokerage investment rows in both ledger shapes
 * (current `transfer` rows and legacy expense/income rows). These must
 * never count as spending or income anywhere — mirrors
 * `src/lib/finance/investments.ts`.
 */
export function isInvestmentOrderRow(row: ToolTransactionRow): boolean {
  if (row.tags.includes(SIMULATED_BROKERAGE_TAG)) return true;
  return row.type === "transfer" && row.category === "investments";
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Integer paise → rupees, rounded to 2 decimals. */
function paiseToRupees(paise: number): number {
  return round2(paise / 100);
}

/** Category id ↔ label, mirroring `src/lib/finance/categories.ts`. */
const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Dining",
  groceries: "Groceries",
  transport: "Transport",
  shopping: "Shopping",
  bills: "Bills & Utilities",
  rent: "Rent",
  health: "Health",
  entertainment: "Entertainment",
  travel: "Travel",
  education: "Education",
  investments: "Investments",
  others: "Others",
  salary: "Salary",
  freelance: "Freelance",
  business: "Business",
  interest: "Interest",
  "other-income": "Other Income",
};

function categoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId.toLowerCase()] ?? categoryId;
}

/**
 * Match a model-supplied category against a stored category id: by id,
 * by label, or by a unique label word. Case-insensitive; "food" matches
 * the `food` id and the "Food & Dining" label alike.
 */
export function categoryMatches(stored: string, wanted: string): boolean {
  const want = wanted.trim().toLowerCase();
  if (want === "") return false;
  const id = stored.trim().toLowerCase();
  if (id === want) return true;
  const label = categoryLabel(stored).toLowerCase();
  if (label === want) return true;
  // A single distinctive word ("dining") matches the label.
  const words = label.split(/[^a-z]+/).filter((w) => w.length >= 4);
  return words.includes(want);
}

function last<T>(values: (T | null)[]): T | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i];
    if (value !== null && value !== undefined) return value;
  }
  return null;
}

/** A tool result that is a failure marker, not evidence the model may cite. */
export function isToolError(result: unknown): boolean {
  return (
    typeof result === "object" &&
    result !== null &&
    !Array.isArray(result) &&
    typeof (result as Record<string, unknown>)["error"] === "string"
  );
}

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

/**
 * Run one tool call from the model. Throws on unknown tools and bad
 * args (the chat loop turns a throw into a `{ error }` tool result the
 * model sees, so the failure is visible instead of silent).
 */
export async function executeTool(
  data: ToolDataAccess,
  name: string,
  args: unknown,
): Promise<unknown> {
  switch (name) {
    case "getPortfolioSummary":
      return portfolioSummary(data);
    case "getBudgetStatus":
      return budgetStatus(data, args);
    case "getTransactions":
      return transactions(data, args);
    case "getStockQuote":
      return stockQuote(data, args);
    case "getStockFundamentals":
      return stockFundamentals(data, args);
    case "getCategorySpending":
      return categorySpending(data, args);
    case "getGoalProgress":
      return goalProgress(data);
    case "searchKnowledge":
      return searchKnowledge(data, args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function requireParsed<T>(parsed: { ok: true; value: unknown } | { ok: false; error: string }): T {
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.value as T;
}

async function portfolioSummary(data: ToolDataAccess) {
  const holdings = await data.listHoldings();
  // Live prices in parallel; each symbol degrades independently.
  const quotes = await Promise.all(
    holdings.map(async (holding) => {
      const yahoo = toYahooSymbol(holding.symbol);
      if (!yahoo) return null;
      try {
        return await data.getQuote(yahoo);
      } catch {
        return null;
      }
    }),
  );
  const rows = holdings.map((holding, i) => {
    const quote = quotes[i] ?? null;
    const avgPrice = paiseToRupees(holding.avgPricePaise);
    const price = quote ? round2(quote.price) : avgPrice;
    const value = round2(price * holding.qty);
    const invested = round2(avgPrice * holding.qty);
    const gainLoss = round2(value - invested);
    return {
      symbol: holding.symbol,
      qty: holding.qty,
      avgPrice,
      price,
      priced: quote !== null,
      value,
      invested,
      gainLoss,
      gainLossPercent: invested > 0 ? round2((gainLoss / invested) * 100) : 0,
    };
  });
  const totalValue = round2(rows.reduce((sum, row) => sum + row.value, 0));
  const totalInvested = round2(rows.reduce((sum, row) => sum + row.invested, 0));
  const totalGainLoss = round2(totalValue - totalInvested);
  const priced = rows.every((row) => row.priced);
  return {
    holdings: rows,
    totals: {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercent: totalInvested > 0 ? round2((totalGainLoss / totalInvested) * 100) : 0,
    },
    priced,
    note: priced
      ? null
      : "Some holdings are valued at average buy price — live prices were unavailable.",
  };
}

async function budgetStatus(data: ToolDataAccess, args: unknown) {
  const parsed = requireParsed<GetBudgetStatusArgs>(parseGetBudgetStatusArgs(args));
  // UTC month boundaries (the function runs in UTC; a 5:30h IST skew at
  // the month edge is accepted, matching the old backend).
  const month = parsed.month ?? new Date().toISOString().slice(0, 7);
  const budgets = await data.listBudgets(month);
  if (budgets.length === 0) {
    return {
      available: false,
      month,
      reason: `No budgets are set for ${month} yet.`,
    };
  }
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-31`;
  const expenses = await data.listTransactions({
    type: "expense",
    startDate: monthStart,
    endDate: monthEnd,
    limit: 500,
  });
  const income = await data.listTransactions({
    type: "income",
    startDate: monthStart,
    endDate: monthEnd,
    limit: 500,
  });
  const spentPaise = new Map<string, number>();
  for (const txn of expenses) {
    if (isInvestmentOrderRow(txn)) continue;
    spentPaise.set(txn.category, (spentPaise.get(txn.category) ?? 0) + txn.amountPaise);
  }
  const monthlyIncomePaise = income
    .filter((txn) => !isInvestmentOrderRow(txn))
    .reduce((sum, txn) => sum + txn.amountPaise, 0);
  const categories = budgets.map((budget) => {
    const budgeted = budget.limitPaise;
    const spent = spentPaise.get(budget.categoryId) ?? 0;
    return {
      name: categoryLabel(budget.categoryId),
      budgeted: paiseToRupees(budgeted),
      spent: paiseToRupees(spent),
      remaining: paiseToRupees(budgeted - spent),
      overBudget: spent > budgeted,
    };
  });
  const totalBudgetedPaise = budgets.reduce((sum, b) => sum + b.limitPaise, 0);
  const totalSpentPaise = categories.reduce((sum, c) => sum + Math.round(c.spent * 100), 0);
  return {
    available: true,
    month,
    monthlyIncome: paiseToRupees(monthlyIncomePaise),
    categories,
    totalBudgeted: paiseToRupees(totalBudgetedPaise),
    totalSpent: paiseToRupees(totalSpentPaise),
    totalRemaining: paiseToRupees(totalBudgetedPaise - totalSpentPaise),
  };
}

async function transactions(data: ToolDataAccess, args: unknown) {
  const parsed = requireParsed<GetTransactionsArgs>(parseGetTransactionsArgs(args));
  // Category filtering happens in code (alias-aware), so a filtered
  // query fetches a wider window before slicing to the limit. `count`
  // covers that window (500 rows) — enough for any realistic range,
  // and the cap keeps one query from flooding the prompt.
  const fetchLimit = parsed.category ? 500 : parsed.limit;
  const rows = await data.listTransactions({
    startDate: parsed.startDate ?? undefined,
    endDate: parsed.endDate ?? undefined,
    limit: fetchLimit,
  });
  const filtered = rows.filter((row) => {
    if (parsed.category && !categoryMatches(row.category, parsed.category)) return false;
    return true;
  });
  return {
    count: filtered.length,
    returned: Math.min(parsed.limit, filtered.length),
    transactions: filtered.slice(0, parsed.limit).map((row) => ({
      name: row.note.trim() !== "" ? row.note : categoryLabel(row.category),
      amount:
        row.type === "expense" ? -paiseToRupees(row.amountPaise) : paiseToRupees(row.amountPaise),
      category: categoryLabel(row.category),
      date: row.dateISO,
      type: row.type,
    })),
  };
}

async function stockQuote(data: ToolDataAccess, args: unknown) {
  const parsed = requireParsed<GetStockArgs>(parseGetStockArgs(args));
  const yahoo = toYahooSymbol(parsed.symbol);
  if (!yahoo) {
    throw new Error(`"${parsed.symbol}" is not a known stock or index symbol.`);
  }
  const quote = await data.getQuote(yahoo);
  if (!quote) {
    throw new Error(`No price is available for ${parsed.symbol} right now.`);
  }
  return {
    symbol: quote.symbol,
    price: round2(quote.price),
    previousClose: round2(quote.prevClose),
    change: round2(quote.change),
    changePercent: round2(quote.changePct),
    currency: quote.currency,
    asOf: quote.asOf,
  };
}

async function stockFundamentals(data: ToolDataAccess, args: unknown) {
  const parsed = requireParsed<GetStockArgs>(parseGetStockArgs(args));
  const yahoo = toYahooSymbol(parsed.symbol);
  if (!yahoo) {
    throw new Error(`"${parsed.symbol}" is not a known stock or index symbol.`);
  }
  const quote = await data.getQuote(yahoo);
  const history = await data.getHistory(yahoo, "3mo");
  if (!quote || !history || history.length === 0) {
    throw new Error(`No price history is available for ${parsed.symbol} right now.`);
  }
  const closes = history.map((bar) => bar.close);
  const rsiValues = closes.length > 1 ? rsi(closes) : [];
  const sma20Values = closes.length > 1 ? sma(closes, 20) : [];
  const sma50Values = closes.length > 1 ? sma(closes, 50) : [];
  const macdValues = closes.length > 1 ? macd(closes) : [];
  const latestRsi = last(rsiValues);
  const latestSma20 = last(sma20Values);
  const latestSma50 = last(sma50Values);
  const latestMacd = last(macdValues);
  const first = closes[0];
  const latest = closes[closes.length - 1];
  const monthAgo = closes.length > 21 ? closes[closes.length - 22] : closes[0];
  const rangeHigh = Math.max(...closes);
  const rangeLow = Math.min(...closes);
  const notes: string[] = [];
  if (closes.length < 15) {
    notes.push("Not enough price history for reliable indicators.");
  }
  return {
    symbol: quote.symbol,
    price: round2(quote.price),
    previousClose: round2(quote.prevClose),
    change: round2(quote.change),
    changePercent: round2(quote.changePct),
    currency: quote.currency,
    technicals: {
      barsUsed: closes.length,
      rsi14: latestRsi === null ? null : round2(latestRsi),
      sma20: latestSma20 === null ? null : round2(latestSma20),
      sma50: latestSma50 === null ? null : round2(latestSma50),
      macd:
        latestMacd === null
          ? null
          : {
              macd: round2(latestMacd.macd),
              signal: round2(latestMacd.signal),
              histogram: round2(latestMacd.histogram),
            },
      change1moPercent:
        monthAgo !== undefined && latest !== undefined && monthAgo !== 0
          ? round2(((latest - monthAgo) / monthAgo) * 100)
          : null,
      change3moPercent:
        first !== undefined && latest !== undefined && first !== 0
          ? round2(((latest - first) / first) * 100)
          : null,
      rangeHigh3mo: round2(rangeHigh),
      rangeLow3mo: round2(rangeLow),
      note: notes.length > 0 ? notes.join(" ") : null,
    },
  };
}

async function categorySpending(data: ToolDataAccess, args: unknown) {
  const parsed = requireParsed<GetCategorySpendingArgs>(parseGetCategorySpendingArgs(args));
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  let start: string;
  if (parsed.period === "week") {
    start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  } else if (parsed.period === "3months") {
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1))
      .toISOString()
      .slice(0, 10);
  } else {
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      .toISOString()
      .slice(0, 10);
  }
  const rows = await data.listTransactions({
    type: "expense",
    startDate: start,
    endDate: todayKey,
    limit: 500,
  });
  const matches = rows.filter(
    (row) => !isInvestmentOrderRow(row) && categoryMatches(row.category, parsed.category),
  );
  const totalPaise = matches.reduce((sum, row) => sum + row.amountPaise, 0);
  const largest = [...matches]
    .sort((a, b) => b.amountPaise - a.amountPaise)
    .slice(0, 5)
    .map((row) => ({
      name: row.note.trim() !== "" ? row.note : categoryLabel(row.category),
      amount: paiseToRupees(row.amountPaise),
      date: row.dateISO,
    }));
  return {
    category: parsed.category,
    period: parsed.period,
    startDate: start,
    endDate: todayKey,
    totalSpent: paiseToRupees(totalPaise),
    count: matches.length,
    largest,
  };
}

async function goalProgress(data: ToolDataAccess) {
  const goals = await data.listGoals();
  const rows = goals.map((goal) => {
    const target = paiseToRupees(goal.targetPaise);
    const saved = paiseToRupees(goal.savedPaise);
    return {
      name: goal.name,
      target,
      saved,
      remaining: round2(target - saved),
      progressPercent: target > 0 ? round2((saved / target) * 100) : 0,
      targetDate: goal.deadline,
    };
  });
  const totalTarget = round2(rows.reduce((sum, row) => sum + row.target, 0));
  const totalSaved = round2(rows.reduce((sum, row) => sum + row.saved, 0));
  return {
    goals: rows,
    totalTarget,
    totalSaved,
  };
}

/** How many chunks the chat loop asks for (the rag function defaults to 5). */
const SEARCH_KNOWLEDGE_TOP_K = 3;

function mapRetrievedChunk(chunk: RetrievedChunk) {
  return {
    sourceType: chunk.sourceType,
    title: chunk.title,
    symbol: chunk.symbol,
    // The store keeps a full timestamp; the model cites a date.
    publishedAt: chunk.publishedAt ? chunk.publishedAt.slice(0, 10) : null,
    url: chunk.url,
    similarity: round2(chunk.similarity),
    content:
      chunk.content.length > MAX_CHUNK_CONTENT_CHARS
        ? `${chunk.content.slice(0, MAX_CHUNK_CONTENT_CHARS)}…`
        : chunk.content,
  };
}

async function searchKnowledge(data: ToolDataAccess, args: unknown) {
  const parsed = requireParsed<SearchKnowledgeArgs>(parseSearchKnowledgeArgs(args));
  // Stored news/profile rows carry Yahoo symbols (RELIANCE.NS), so the
  // model's symbol is normalised the same way as the quote tools. An
  // unmappable symbol passes through upper-cased — the search then
  // finds nothing rather than failing the whole tool call.
  const symbol = parsed.symbol
    ? (toYahooSymbol(parsed.symbol) ?? parsed.symbol.toUpperCase())
    : null;
  const result = await data.searchKnowledge(parsed.query, symbol, SEARCH_KNOWLEDGE_TOP_K);
  if (!result.available) {
    return { available: false, reason: result.reason, chunks: [] };
  }
  return {
    available: true,
    chunks: result.chunks.map(mapRetrievedChunk),
  };
}
