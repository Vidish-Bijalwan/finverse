import type {
  Account,
  Bill,
  Budget,
  CustomCategory,
  FinanceDB,
  Goal,
  Holding,
  PayMode,
  RecurringRule,
  Transaction,
  TransactionType,
} from "./types";

/**
 * Realistic Indian seed data spanning May–Oct 2026 (~200 transactions),
 * with accounts (live balances), custom categories, tags, and recurring
 * rules. Deterministic PRNG so the seed is stable across loads.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = mulberry32(20261002);
/** Deterministic transaction-ID counter (see makeTxn). Reset per buildSeed(). */
let txnSeq = 0;
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)] as T;
const jitter = (base: number, spread: number) => Math.round(base + (rand() * 2 - 1) * spread);
const pad = (n: number) => String(n).padStart(2, "0");
const d = (month: number, day: number) => `2026-${pad(month)}-${pad(day)}`;

// Default account per pay mode (mirrors the v1 -> v2 migration mapping).
const ACC_CASH = "acc-cash";
const ACC_UPI = "acc-upi";
const ACC_HDFC = "acc-hdfc";
const ACC_SBI = "acc-sbi";

const ACCOUNT_FOR_PAYMODE: Record<PayMode, string> = {
  Cash: ACC_CASH,
  UPI: ACC_UPI,
  Card: ACC_HDFC,
  Bank: ACC_HDFC,
};

interface TxnSeed {
  month: number;
  day: number;
  type: TransactionType;
  rupees: number;
  category: string;
  note: string;
  payMode: PayMode;
  accountId?: string;
  toAccountId?: string;
  tags?: string[];
  goalId?: string;
  billId?: string;
  recurringRuleId?: string;
}

function makeTxn(s: TxnSeed): Transaction {
  const dateISO = d(s.month, s.day);
  const createdAt = `${dateISO}T${pad(8 + Math.floor(rand() * 12))}:${pad(Math.floor(rand() * 60))}:00.000Z`;
  // Deterministic IDs: crypto.randomUUID() differs between SSR and client,
  // which breaks React hydration (server HTML must match the client tree).
  txnSeq += 1;
  return {
    id: `seed-txn-${String(txnSeq).padStart(4, "0")}`,
    type: s.type,
    amountPaise: Math.round(s.rupees * 100),
    category: s.category,
    note: s.note,
    dateISO,
    payMode: s.payMode,
    accountId: s.accountId ?? ACCOUNT_FOR_PAYMODE[s.payMode],
    ...(s.toAccountId ? { toAccountId: s.toAccountId } : {}),
    ...(s.tags ? { tags: s.tags } : {}),
    ...(s.goalId ? { goalId: s.goalId } : {}),
    ...(s.billId ? { billId: s.billId } : {}),
    ...(s.recurringRuleId ? { recurringRuleId: s.recurringRuleId } : {}),
    createdAt,
    updatedAt: createdAt,
  };
}

function buildTransactions(): Transaction[] {
  const s: TxnSeed[] = [];

  // ---- Recurring monthly (May–Oct; Oct only 1st–3rd has happened) ----
  for (let m = 5; m <= 10; m++) {
    // Salary credited on the 1st (HDFC)
    s.push({
      month: m,
      day: 1,
      type: "income",
      rupees: 85000,
      category: "salary",
      note: "Monthly salary credit",
      payMode: "Bank",
      accountId: ACC_HDFC,
    });
    if (m <= 9) {
      // Rent paid on the 5th (May–Sep; Oct not yet paid, today is Oct 3)
      s.push({
        month: m,
        day: 5,
        type: "expense",
        rupees: 18000,
        category: "rent",
        note: "House rent",
        payMode: "Bank",
        billId: "bill-rent",
      });
      // SIP on the 10th as transfer
      s.push({
        month: m,
        day: 10,
        type: "transfer",
        rupees: 12000,
        category: "investments",
        note: "Monthly SIP",
        payMode: "Bank",
        billId: "bill-sip",
      });
      // Monthly sweep HDFC -> SBI
      s.push({
        month: m,
        day: 12,
        type: "transfer",
        rupees: 20000,
        category: "others",
        note: "Monthly sweep to SBI",
        payMode: "Bank",
        accountId: ACC_HDFC,
        toAccountId: ACC_SBI,
      });
    }
    if (m === 10) {
      // October: only Oct 1–3 have happened. Salary is above; add a few.
      s.push({
        month: m,
        day: 1,
        type: "expense",
        rupees: jitter(2500, 300),
        category: "groceries",
        note: "BigBasket weekly groceries",
        payMode: "UPI",
        tags: ["family"],
      });
      s.push({
        month: m,
        day: 2,
        type: "expense",
        rupees: 320,
        category: "food",
        note: "Office lunch",
        payMode: "UPI",
        tags: ["work"],
      });
      s.push({
        month: m,
        day: 3,
        type: "expense",
        rupees: 145,
        category: "food",
        note: "Morning chai",
        payMode: "Cash",
      });
      continue;
    }
    // Broadband ₹999
    s.push({
      month: m,
      day: 20,
      type: "expense",
      rupees: 999,
      category: "bills",
      note: "Broadband bill",
      payMode: "Card",
      billId: "bill-broadband",
    });
    // Electricity ~₹1,800
    s.push({
      month: m,
      day: 15,
      type: "expense",
      rupees: jitter(1800, 350),
      category: "bills",
      note: "Electricity bill",
      payMode: "UPI",
      billId: "bill-electricity",
    });
    // Mobile recharge ₹399
    s.push({
      month: m,
      day: 28,
      type: "expense",
      rupees: 399,
      category: "bills",
      note: "Mobile recharge",
      payMode: "UPI",
      billId: "bill-mobile",
    });
    // Fuel 2x per month
    s.push({
      month: m,
      day: 8,
      type: "expense",
      rupees: jitter(1000, 250),
      category: "transport",
      note: "Petrol",
      payMode: "Card",
    });
    s.push({
      month: m,
      day: 22,
      type: "expense",
      rupees: jitter(1000, 250),
      category: "transport",
      note: "Petrol",
      payMode: "Card",
    });
    // Movie night
    s.push({
      month: m,
      day: pick([3, 9, 16, 24, 30]),
      type: "expense",
      rupees: jitter(750, 150),
      category: "entertainment",
      note: "Movie night",
      payMode: "UPI",
      tags: ["weekend"],
    });
    // Pharmacy
    s.push({
      month: m,
      day: pick([7, 13, 19, 26]),
      type: "expense",
      rupees: jitter(450, 200),
      category: "health",
      note: "Pharmacy",
      payMode: "UPI",
    });
    // Shopping (Amazon/Myntra)
    s.push({
      month: m,
      day: pick([4, 11, 18, 27]),
      type: "expense",
      rupees: jitter(2200, 1500),
      category: "shopping",
      note: pick(["Amazon order", "Myntra haul", "Electronics store", "Home essentials"]),
      payMode: "Card",
    });
    if (m % 2 === 0) {
      s.push({
        month: m,
        day: pick([6, 14, 21]),
        type: "expense",
        rupees: jitter(900, 500),
        category: "shopping",
        note: pick(["Zara", "Decathlon", "Croma"]),
        payMode: "Card",
      });
    }
    // Zomato / Swiggy dinner ~2x per month
    s.push({
      month: m,
      day: pick([5, 12, 19, 26]),
      type: "expense",
      rupees: jitter(420, 150),
      category: "food",
      note: pick(["Zomato dinner", "Swiggy order"]),
      payMode: "UPI",
      tags: ["weekend"],
    });
    s.push({
      month: m,
      day: pick([2, 10, 17, 25]),
      type: "expense",
      rupees: jitter(380, 150),
      category: "food",
      note: pick(["Swiggy lunch", "Zomato order"]),
      payMode: "UPI",
      tags: pick([["work"], []]),
    });
    // Weekly UPI chai / snacks: ~2 per week
    for (let w = 0; w < 8; w++) {
      const day = 1 + w * 3 + Math.floor(rand() * 3);
      if (day > 28) continue;
      s.push({
        month: m,
        day,
        type: "expense",
        rupees: jitter(120, 90),
        category: "food",
        note: pick(["Chai tapri", "Canteen lunch", "Street food", "Coffee"]),
        payMode: rand() < 0.8 ? "UPI" : "Cash",
      });
    }
    // Netflix ₹199 (matches the seeded recurring rule)
    s.push({
      month: m,
      day: 15,
      type: "expense",
      rupees: 199,
      category: "custom-subs",
      note: "Netflix subscription",
      payMode: "UPI",
      recurringRuleId: "rule-netflix",
    });
    if (m >= 7) {
      // Cultpass gym ₹1,750 from July (matches the seeded recurring rule)
      s.push({
        month: m,
        day: 1,
        type: "expense",
        rupees: 1750,
        category: "health",
        note: "Cultpass gym membership",
        payMode: "UPI",
        recurringRuleId: "rule-gym",
      });
    }
    // Pet care (custom category) — Bruno the indie dog
    s.push({
      month: m,
      day: pick([5, 12, 21]),
      type: "expense",
      rupees: jitter(1150, 250),
      category: "custom-pet",
      note: pick(["Drools dog food 10kg", "Pet treats & toys", "Grooming session"]),
      payMode: "UPI",
      tags: ["bruno"],
    });
  }

  // ---- Weekly groceries ~₹2,500 (May–Sep) ----
  for (let m = 5; m <= 9; m++) {
    for (const day of [2, 9, 16, 23]) {
      s.push({
        month: m,
        day,
        type: "expense",
        rupees: jitter(2500, 300),
        category: "groceries",
        note: pick(["BigBasket weekly groceries", "Blinkit top-up", "DMart run"]),
        payMode: "UPI",
        ...(day === 2 ? { tags: ["family"] } : {}),
      });
    }
  }

  // ---- One-off realistic bits ----
  s.push({
    month: 5,
    day: 11,
    type: "income",
    rupees: 8500,
    category: "freelance",
    note: "Logo design gig payout",
    payMode: "Bank",
  });
  s.push({
    month: 8,
    day: 18,
    type: "income",
    rupees: 15000,
    category: "freelance",
    note: "Freelance UI project payout",
    payMode: "Bank",
  });
  s.push({
    month: 9,
    day: 5,
    type: "income",
    rupees: 9500,
    category: "other-income",
    note: "Sold old phone on OLX",
    payMode: "UPI",
  });
  s.push({
    month: 9,
    day: 30,
    type: "income",
    rupees: 2100,
    category: "interest",
    note: "Savings account interest",
    payMode: "Bank",
  });
  s.push({
    month: 5,
    day: 24,
    type: "expense",
    rupees: 8400,
    category: "travel",
    note: "Goa flight booking",
    payMode: "Card",
    tags: ["trip-goa"],
  });
  s.push({
    month: 6,
    day: 6,
    type: "expense",
    rupees: 6200,
    category: "travel",
    note: "Goa Airbnb stay",
    payMode: "Card",
    tags: ["trip-goa"],
  });
  s.push({
    month: 9,
    day: 12,
    type: "expense",
    rupees: 2400,
    category: "travel",
    note: "Rishikesh weekend bus + stay",
    payMode: "UPI",
    tags: ["trip-rishikesh", "weekend"],
  });
  s.push({
    month: 8,
    day: 7,
    type: "expense",
    rupees: 4999,
    category: "education",
    note: "Online course subscription",
    payMode: "Card",
    tags: ["work"],
  });
  s.push({
    month: 7,
    day: 20,
    type: "expense",
    rupees: 850,
    category: "health",
    note: "Dental checkup",
    payMode: "UPI",
  });
  s.push({
    month: 6,
    day: 29,
    type: "expense",
    rupees: 2300,
    category: "custom-pet",
    note: "Vet visit + vaccination",
    payMode: "UPI",
    tags: ["bruno", "health"],
  });
  s.push({
    month: 9,
    day: 8,
    type: "expense",
    rupees: 3200,
    category: "shopping",
    note: "Festive sale electronics",
    payMode: "Card",
  });
  s.push({
    month: 10,
    day: 2,
    type: "expense",
    rupees: 3499,
    category: "custom-gifts",
    note: "Dussehra gifts for family",
    payMode: "UPI",
    tags: ["dussehra", "family"],
  });
  s.push({
    month: 6,
    day: 15,
    type: "expense",
    rupees: 650,
    category: "transport",
    note: "Cab to airport",
    payMode: "UPI",
    tags: ["trip-goa"],
  });
  s.push({
    month: 7,
    day: 4,
    type: "expense",
    rupees: 6200,
    category: "transport",
    note: "Car service + oil change",
    payMode: "Card",
  });
  s.push({
    month: 9,
    day: 26,
    type: "expense",
    rupees: 1450,
    category: "entertainment",
    note: "Concert tickets",
    payMode: "Card",
    tags: ["weekend"],
  });
  s.push({
    month: 5,
    day: 17,
    type: "expense",
    rupees: 299,
    category: "custom-subs",
    note: "Spotify Premium",
    payMode: "UPI",
  });
  s.push({
    month: 8,
    day: 22,
    type: "expense",
    rupees: 1299,
    category: "custom-subs",
    note: "iCloud+ storage yearly",
    payMode: "Card",
  });

  return s.map(makeTxn).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

function buildAccounts(): Account[] {
  const createdAt = "2026-05-01T00:00:00.000Z";
  return [
    {
      id: ACC_CASH,
      name: "Cash Wallet",
      type: "cash",
      iconName: "wallet",
      color: "#F59E0B",
      openingBalancePaise: 800000,
      isDefault: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: ACC_UPI,
      name: "UPI · PhonePe",
      type: "upi",
      iconName: "smartphone",
      color: "#10B981",
      openingBalancePaise: 1200000,
      isDefault: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: ACC_HDFC,
      name: "HDFC Savings",
      type: "bank",
      iconName: "bank",
      color: "#3B82F6",
      openingBalancePaise: 24000000,
      isDefault: true,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: ACC_SBI,
      name: "SBI Savings",
      type: "bank",
      iconName: "bank",
      color: "#6366F1",
      openingBalancePaise: 8500000,
      isDefault: false,
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

function buildCustomCategories(): CustomCategory[] {
  const createdAt = "2026-05-01T00:00:00.000Z";
  return [
    {
      id: "custom-pet",
      label: "Pet Care",
      iconName: "paw",
      color: "#D97706",
      kind: "expense",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "custom-subs",
      label: "Subscriptions",
      iconName: "repeat",
      color: "#8B5CF6",
      kind: "expense",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "custom-gifts",
      label: "Gifts",
      iconName: "gift",
      color: "#EC4899",
      kind: "expense",
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

function buildRecurringRules(): RecurringRule[] {
  const createdAt = "2026-06-01T00:00:00.000Z";
  return [
    {
      id: "rule-netflix",
      type: "expense",
      amountPaise: 19900,
      category: "custom-subs",
      note: "Netflix subscription",
      payMode: "UPI",
      accountId: ACC_UPI,
      tags: [],
      frequency: "monthly",
      startDateISO: "2026-06-15",
      lastPostedDateISO: "2026-09-15",
      isPaused: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "rule-gym",
      type: "expense",
      amountPaise: 175000,
      category: "health",
      note: "Cultpass gym membership",
      payMode: "UPI",
      accountId: ACC_UPI,
      tags: [],
      frequency: "monthly",
      startDateISO: "2026-07-01",
      lastPostedDateISO: "2026-10-01",
      isPaused: false,
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

function buildBudgets(): Budget[] {
  const defs: Array<[string, string, number]> = [
    ["budget-food", "food", 1200000],
    ["budget-groceries", "groceries", 1500000],
    ["budget-transport", "transport", 600000],
    ["budget-shopping", "shopping", 1000000],
    ["budget-entertainment", "entertainment", 500000],
    ["budget-bills", "bills", 800000],
  ];
  return defs.map(([id, categoryId, limitPaise]) => ({
    id,
    categoryId,
    month: "2026-10",
    limitPaise,
  }));
}

function buildBills(): Bill[] {
  return [
    {
      id: "bill-rent",
      name: "Rent",
      amountPaise: 1800000,
      dueDay: 5,
      category: "rent",
      lastPaidOn: "2026-09-05",
    },
    {
      id: "bill-sip",
      name: "SIP",
      amountPaise: 1200000,
      dueDay: 10,
      category: "investments",
      lastPaidOn: "2026-09-10",
    },
    {
      id: "bill-electricity",
      name: "Electricity",
      amountPaise: 180000,
      dueDay: 15,
      category: "bills",
      lastPaidOn: "2026-09-15",
    },
    {
      id: "bill-broadband",
      name: "Broadband",
      amountPaise: 99900,
      dueDay: 20,
      category: "bills",
      lastPaidOn: "2026-09-20",
    },
    {
      id: "bill-mobile",
      name: "Mobile",
      amountPaise: 39900,
      dueDay: 28,
      category: "bills",
      lastPaidOn: "2026-09-28",
    },
  ];
}

function buildGoals(): Goal[] {
  return [
    {
      id: "goal-emergency",
      name: "Emergency fund",
      targetPaise: 30000000,
      savedPaise: 18500000,
      deadline: "2027-06-30",
      color: "#10B981",
    },
    {
      id: "goal-japan",
      name: "Japan trip",
      targetPaise: 25000000,
      savedPaise: 4500000,
      deadline: "2027-11-15",
      color: "#EC4899",
    },
    {
      id: "goal-laptop",
      name: "New laptop",
      targetPaise: 12000000,
      savedPaise: 3000000,
      deadline: "2026-12-31",
      color: "#3B82F6",
    },
  ];
}

function buildHoldings(): Holding[] {
  return [
    { id: "holding-reliance", symbol: "RELIANCE", qty: 15, avgPricePaise: 285000 },
    { id: "holding-hdfcbank", symbol: "HDFCBANK", qty: 40, avgPricePaise: 162000 },
    { id: "holding-infy", symbol: "INFY", qty: 25, avgPricePaise: 178000 },
    { id: "holding-niftybees", symbol: "NIFTYBEES", qty: 100, avgPricePaise: 26500 },
  ];
}

export function buildSeed(): FinanceDB {
  // Reset deterministic generators so every buildSeed() call — server or
  // client, first or tenth — produces byte-identical data (hydration-safe).
  rand = mulberry32(20261002);
  txnSeq = 0;
  return {
    transactions: buildTransactions(),
    budgets: buildBudgets(),
    bills: buildBills(),
    goals: buildGoals(),
    holdings: buildHoldings(),
    accounts: buildAccounts(),
    customCategories: buildCustomCategories(),
    recurringRules: buildRecurringRules(),
  };
}
