/**
 * Tiny rule-based natural-language parser for quick expense entry.
 *
 * Understands inputs like:
 *   "chai with friends 250"
 *   "Rs 1500 uber to airport"
 *   "₹4,200 electricity bill"
 *   "salary 85000"
 *   "250 rupees groceries bigbasket"
 *
 * Pure function, SSR-safe, no dependencies. Amounts come back as integer paise.
 * This is a deterministic demo parser, not an LLM — ambiguous input falls back
 * to category "others" rather than guessing.
 */

export interface ParsedExpense {
  /** Integer paise, always > 0 when returned. */
  amountPaise: number;
  /** Category id from lib/finance/categories.ts. */
  category: string;
  /** Remainder of the input after the amount was removed, tidied up. */
  note: string;
  type: "expense" | "income";
}

interface CategoryRule {
  pattern: RegExp;
  category: string;
  type: "expense" | "income";
}

// Ordered: first match wins. Income rules go first so "salary credited"
// doesn't get misclassified by a looser expense keyword.
const RULES: CategoryRule[] = [
  {
    pattern: /\b(salary|paycheck|pay slip|payslip|stipend)\b/i,
    category: "salary",
    type: "income",
  },
  { pattern: /\b(freelance|gig|contract work)\b/i, category: "freelance", type: "income" },
  { pattern: /\b(business|shop income|store income)\b/i, category: "business", type: "income" },
  {
    pattern: /\b(interest|fd interest|savings interest|dividend)\b/i,
    category: "interest",
    type: "income",
  },
  {
    pattern: /\b(received|earned|income|payout|cashback|refund)\b/i,
    category: "other-income",
    type: "income",
  },
  {
    pattern:
      /\b(chai|coffee|tea|food|dinner|lunch|breakfast|pizza|burger|restaurant|snack|snacks|cafe|zomato|swiggy|biryani|samosa|thali|momos|juice)\b/i,
    category: "food",
    type: "expense",
  },
  {
    pattern:
      /\b(grocer(y|ies)|bigbasket|blinkit|zepto|vegetable|sabzi|kirana|dmart|milk|atta|rice|dal)\b/i,
    category: "groceries",
    type: "expense",
  },
  {
    pattern: /\b(uber|ola|cab|taxi|petrol|fuel|diesel|metro|auto|parking|toll|fastag)\b/i,
    category: "transport",
    type: "expense",
  },
  {
    pattern:
      /\b(movie|movies|cinema|netflix|concert|show|spotify|prime video|hotstar|game|gaming|party|club|theatre)\b/i,
    category: "entertainment",
    type: "expense",
  },
  { pattern: /\b(rent|house rent|flat rent|pg rent|hostel)\b/i, category: "rent", type: "expense" },
  {
    pattern:
      /\b(medicine|medicines|doctor|pharmacy|hospital|clinic|health|dental|checkup|chemist)\b/i,
    category: "health",
    type: "expense",
  },
  {
    pattern:
      /\b(flight|hotel|trip|travel|vacation|holiday|bus ticket|railway|irctc|train ticket|tour)\b/i,
    category: "travel",
    type: "expense",
  },
  {
    pattern:
      /\b(mobile|recharge|electricity|broadband|wifi|dth|gas cylinder|water bill|phone bill)\b/i,
    category: "bills",
    type: "expense",
  },
  {
    pattern:
      /\b(shopping|amazon|myntra|flipkart|clothes|shirt|shoes|dress|kurta|saree|jeans|tshirt)\b/i,
    category: "shopping",
    type: "expense",
  },
  {
    pattern: /\b(sip|invest(ment)?|stocks?|mutual fund|shares|fd|ppf|nps|gold)\b/i,
    category: "investments",
    type: "expense",
  },
  {
    pattern: /\b(school|college|course|tuition|books?|exam|fees?|coaching|udemy)\b/i,
    category: "education",
    type: "expense",
  },
];

// Amount patterns, tried in order. Each has exactly one capture group.
// Covers: ₹250, ₹ 4,200.50, Rs 250, Rs.250, INR 250, 250 rupees, 250 rs, 250/-
const AMOUNT_PATTERNS: RegExp[] = [
  /₹\s*([\d,]+(?:\.\d{1,2})?)/,
  /(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:\/-|rs\.?|rupees?|inr)\b/i,
  /\b([\d,]+(?:\.\d{1,2})?)\b/,
];

/** Words that only connect the amount to the sentence; stripped from the note. */
const FILLER = /\b(spent|spend|paid|pay|cost|costing|of|for|on|at|the|a|an|my)\b/gi;

function cleanNote(text: string): string {
  const note = text
    .replace(FILLER, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,.;:\-–—\s]+|[,.;:\-–—\s]+$/g, "")
    .trim();
  if (!note) return "";
  return note.charAt(0).toUpperCase() + note.slice(1);
}

/**
 * Parse free text into a transaction draft.
 * Returns null when no positive amount can be found.
 */
export function parseExpenseInput(raw: string): ParsedExpense | null {
  if (!raw || !raw.trim()) return null;
  const text = raw.trim();

  let amount: number | null = null;
  let matchedToken = "";
  for (const re of AMOUNT_PATTERNS) {
    const m = text.match(re);
    if (m?.[1]) {
      const value = parseFloat(m[1].replace(/,/g, ""));
      if (Number.isFinite(value) && value > 0) {
        amount = value;
        matchedToken = m[0] ?? "";
        break;
      }
    }
  }
  if (amount === null) return null;

  const amountPaise = Math.round(amount * 100);
  if (amountPaise <= 0) return null;

  let rule: CategoryRule = { pattern: /$^/, category: "others", type: "expense" };
  for (const r of RULES) {
    if (r.pattern.test(text)) {
      rule = r;
      break;
    }
  }

  const withoutAmount = text.replace(matchedToken, " ");
  const note = cleanNote(withoutAmount);

  return {
    amountPaise,
    category: rule.category,
    note,
    type: rule.type,
  };
}
