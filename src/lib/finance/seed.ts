import type {
  Bill,
  Budget,
  FinanceDB,
  Goal,
  Holding,
  PayMode,
  Transaction,
  TransactionType,
} from "./types";

/**
 * Realistic Indian seed data spanning Jun–Oct 2026 (~120 transactions).
 * Deterministic PRNG so the seed is stable across loads.
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

const rand = mulberry32(20261002);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const jitter = (base: number, spread: number) => Math.round(base + (rand() * 2 - 1) * spread);
const pad = (n: number) => String(n).padStart(2, "0");
const d = (month: number, day: number) => `2026-${pad(month)}-${pad(day)}`;

interface TxnSeed {
  month: number;
  day: number;
  type: TransactionType;
  rupees: number;
  category: string;
  note: string;
  payMode: PayMode;
  goalId?: string;
  billId?: string;
}

function makeTxn(s: TxnSeed): Transaction {
  const dateISO = d(s.month, s.day);
  const createdAt = `${dateISO}T${pad(8 + Math.floor(rand() * 12))}:${pad(Math.floor(rand() * 60))}:00.000Z`;
  return {
    id: crypto.randomUUID(),
    type: s.type,
    amountPaise: Math.round(s.rupees * 100),
    category: s.category,
    note: s.note,
    dateISO,
    payMode: s.payMode,
    ...(s.goalId ? { goalId: s.goalId } : {}),
    ...(s.billId ? { billId: s.billId } : {}),
    createdAt,
    updatedAt: createdAt,
  };
}

function buildTransactions(): Transaction[] {
  const s: TxnSeed[] = [];

  // ---- Recurring monthly ----
  for (let m = 6; m <= 10; m++) {
    // Salary credited on the 1st (Bank)
    s.push({
      month: m,
      day: 1,
      type: "income",
      rupees: 85000,
      category: "salary",
      note: "Monthly salary credit",
      payMode: "Bank",
    });
    if (m <= 9) {
      // Rent paid on the 5th (Jun–Sep; Oct not yet paid, today is Oct 2)
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
    }
    if (m === 10) {
      // October: only Oct 1–2 have happened. Salary is above; add one grocery run.
      s.push({
        month: m,
        day: 1,
        type: "expense",
        rupees: jitter(2500, 300),
        category: "groceries",
        note: "BigBasket weekly groceries",
        payMode: "UPI",
      });
      continue;
    }
    // Broadband ₹999
    s.push({
      month: m,
      day: m === 10 ? 1 : 20,
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
    });
    if (m !== 10) {
      s.push({
        month: m,
        day: pick([2, 10, 17, 25]),
        type: "expense",
        rupees: jitter(380, 150),
        category: "food",
        note: pick(["Swiggy lunch", "Zomato order"]),
        payMode: "UPI",
      });
    }
    // Weekly UPI chai / snacks: ~2 per week
    for (let w = 0; w < 8; w++) {
      const day = 1 + w * 3 + Math.floor(rand() * 3);
      if (day > 28 || (m === 10 && day > 2)) continue;
      s.push({
        month: m,
        day,
        type: "expense",
        rupees: jitter(120, 90),
        category: "food",
        note: pick(["Chai tapri", "Canteen lunch", "Street food", "Coffee"]),
        payMode: "UPI",
      });
    }
  }

  // ---- Weekly groceries ~₹2,500 (Jun–Sep; Oct handled above) ----
  for (let m = 6; m <= 9; m++) {
    for (const day of [2, 9, 16, 23]) {
      s.push({
        month: m,
        day,
        type: "expense",
        rupees: jitter(2500, 300),
        category: "groceries",
        note: pick(["BigBasket weekly groceries", "Blinkit top-up", "DMart run"]),
        payMode: "UPI",
      });
    }
  }

  // ---- One-off realistic bits ----
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
    day: 30,
    type: "income",
    rupees: 2100,
    category: "interest",
    note: "Savings account interest",
    payMode: "Bank",
  });
  s.push({
    month: 9,
    day: 12,
    type: "expense",
    rupees: 2400,
    category: "travel",
    note: "Rishikesh weekend bus + stay",
    payMode: "UPI",
  });
  s.push({
    month: 8,
    day: 7,
    type: "expense",
    rupees: 4999,
    category: "education",
    note: "Online course subscription",
    payMode: "Card",
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
    month: 9,
    day: 8,
    type: "expense",
    rupees: 3200,
    category: "shopping",
    note: "Festive sale electronics",
    payMode: "Card",
  });
  s.push({
    month: 6,
    day: 15,
    type: "expense",
    rupees: 650,
    category: "transport",
    note: "Cab to airport",
    payMode: "UPI",
  });
  s.push({
    month: 9,
    day: 26,
    type: "expense",
    rupees: 1450,
    category: "entertainment",
    note: "Concert tickets",
    payMode: "Card",
  });
  s.push({
    month: 10,
    day: 1,
    type: "expense",
    rupees: 180,
    category: "food",
    note: "Morning chai",
    payMode: "UPI",
  });
  s.push({
    month: 10,
    day: 2,
    type: "expense",
    rupees: 320,
    category: "food",
    note: "Office lunch",
    payMode: "UPI",
  });

  return s.map(makeTxn).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
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
  return {
    transactions: buildTransactions(),
    budgets: buildBudgets(),
    bills: buildBills(),
    goals: buildGoals(),
    holdings: buildHoldings(),
  };
}
