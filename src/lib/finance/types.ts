/**
 * Core finance domain types for FinVerse AI.
 *
 * Contract notes (shared with all feature workers):
 * - Money is ALWAYS stored as an integer number of paise (₹1 = 100 paise).
 * - Dates/datetimes are ISO strings. `dateISO` is calendar-date only ("YYYY-MM-DD").
 * - `createdAt` / `updatedAt` are full ISO datetimes.
 * - Never use `any`; extend these interfaces instead of redefining them.
 */

export type TransactionType = "expense" | "income" | "transfer";

export type PayMode = "UPI" | "Cash" | "Card" | "Bank" | "upi_test" | "razorpay_test";

export type CategoryKind = "expense" | "income";

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Integer paise, always >= 0. */
  amountPaise: number;
  /** Category id (see categories.ts) or free-form for legacy data. */
  category: string;
  note: string;
  /** Calendar date "YYYY-MM-DD". */
  dateISO: string;
  payMode: PayMode;
  /** Linked goal when type === "transfer" towards a savings goal. */
  goalId?: string;
  /** Linked bill when this transaction paid a bill. */
  billId?: string;
  /**
   * Linked account. For expense/income this is the account debited/credited.
   * For transfers this is the SOURCE account (use toAccountId for the destination).
   */
  accountId?: string;
  /** Destination account for type === "transfer" account-to-account moves. */
  toAccountId?: string;
  /** Free-form tags, e.g. ["trip-goa", "work"]. */
  tags?: string[];
  /** Recurring rule that posted this occurrence (drives idempotent auto-post). */
  recurringRuleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  label: string;
  /** lucide-react icon component. */
  icon: React.ComponentType<{ className?: string }>;
  /** Hex color, e.g. "#F59E0B". */
  color: string;
  kind: CategoryKind;
}

export interface Budget {
  id: string;
  categoryId: string;
  /** "YYYY-MM". */
  month: string;
  /** Integer paise. */
  limitPaise: number;
}

export interface Bill {
  id: string;
  name: string;
  /** Integer paise. */
  amountPaise: number;
  /** Day of month 1-31 the bill is due. */
  dueDay: number;
  /** Category id the bill belongs to. */
  category: string;
  /** "YYYY-MM-DD" of the most recent payment, if any. */
  lastPaidOn?: string;
}

export interface Goal {
  id: string;
  name: string;
  /** Integer paise. */
  targetPaise: number;
  /** Integer paise. */
  savedPaise: number;
  /** Calendar date "YYYY-MM-DD". */
  deadline: string;
  /** Hex color. */
  color: string;
}

export interface Holding {
  id: string;
  /** Ticker / symbol, e.g. "RELIANCE". */
  symbol: string;
  qty: number;
  /** Integer paise per unit. */
  avgPricePaise: number;
}

export type InsightConfidence = "high" | "medium" | "low";

export interface Insight {
  id: string;
  title: string;
  body: string;
  /** Human-readable facts that support the insight (for explainability). */
  evidence: string[];
  confidence: InsightConfidence;
  kind: string;
  createdAt: string;
}

/** The whole persisted database shape. Bump STORE_VERSION in store.ts when this changes. */
export interface FinanceDB {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  goals: Goal[];
  holdings: Holding[];
  accounts: Account[];
  customCategories: CustomCategory[];
  recurringRules: RecurringRule[];
}

export type AccountType = "cash" | "upi" | "bank";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Key into CUSTOM_ICON_OPTIONS (see categories.ts); falls back to a per-type icon. */
  iconName: string;
  /** Hex color, e.g. "#10B981". */
  color: string;
  /** Integer paise at creation; live balance = opening + replayed transaction effects. */
  openingBalancePaise: number;
  /** Exactly one account is the default for new transactions. */
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** User-created category. Stored with an icon NAME (serializable); resolve via categories.ts. */
export interface CustomCategory {
  id: string;
  label: string;
  /** Key into CUSTOM_ICON_OPTIONS (see categories.ts). */
  iconName: string;
  /** Hex color, e.g. "#F59E0B". */
  color: string;
  kind: CategoryKind;
  createdAt: string;
  updatedAt: string;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  type: TransactionType;
  /** Integer paise, always >= 0. */
  amountPaise: number;
  /** Category id (built-in or custom). */
  category: string;
  note: string;
  payMode: PayMode;
  /** Account debited (expense/transfer) or credited (income). */
  accountId?: string;
  /** Destination account when type === "transfer". */
  toAccountId?: string;
  tags: string[];
  frequency: RecurringFrequency;
  /** First occurrence, "YYYY-MM-DD". */
  startDateISO: string;
  /** Last occurrence, "YYYY-MM-DD"; omitted means no end. */
  endDateISO?: string;
  /** "YYYY-MM-DD" of the most recently posted occurrence; null when never posted. */
  lastPostedDateISO?: string | null;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}
