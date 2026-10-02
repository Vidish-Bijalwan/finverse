import { s as todayISO } from "./utils-CLFOCKAi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-DCGtoGuR.js
/**
* Realistic Indian seed data spanning May–Oct 2026 (~200 transactions),
* with accounts (live balances), custom categories, tags, and recurring
* rules. Deterministic PRNG so the seed is stable across loads.
*/
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = seed + 1831565813 | 0;
		let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var rand = mulberry32(20261002);
/** Deterministic transaction-ID counter (see makeTxn). Reset per buildSeed(). */
var txnSeq = 0;
var pick = (arr) => arr[Math.floor(rand() * arr.length)];
var jitter = (base, spread) => Math.round(base + (rand() * 2 - 1) * spread);
var pad = (n) => String(n).padStart(2, "0");
var d = (month, day) => `2026-${pad(month)}-${pad(day)}`;
var ACC_CASH = "acc-cash";
var ACC_UPI = "acc-upi";
var ACC_HDFC = "acc-hdfc";
var ACC_SBI = "acc-sbi";
var ACCOUNT_FOR_PAYMODE = {
	Cash: ACC_CASH,
	UPI: ACC_UPI,
	Card: ACC_HDFC,
	Bank: ACC_HDFC
};
function makeTxn(s) {
	const dateISO = d(s.month, s.day);
	const createdAt = `${dateISO}T${pad(8 + Math.floor(rand() * 12))}:${pad(Math.floor(rand() * 60))}:00.000Z`;
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
		...s.toAccountId ? { toAccountId: s.toAccountId } : {},
		...s.tags ? { tags: s.tags } : {},
		...s.goalId ? { goalId: s.goalId } : {},
		...s.billId ? { billId: s.billId } : {},
		...s.recurringRuleId ? { recurringRuleId: s.recurringRuleId } : {},
		createdAt,
		updatedAt: createdAt
	};
}
function buildTransactions() {
	const s = [];
	for (let m = 5; m <= 10; m++) {
		s.push({
			month: m,
			day: 1,
			type: "income",
			rupees: 85e3,
			category: "salary",
			note: "Monthly salary credit",
			payMode: "Bank",
			accountId: ACC_HDFC
		});
		if (m <= 9) {
			s.push({
				month: m,
				day: 5,
				type: "expense",
				rupees: 18e3,
				category: "rent",
				note: "House rent",
				payMode: "Bank",
				billId: "bill-rent"
			});
			s.push({
				month: m,
				day: 10,
				type: "transfer",
				rupees: 12e3,
				category: "investments",
				note: "Monthly SIP",
				payMode: "Bank",
				billId: "bill-sip"
			});
			s.push({
				month: m,
				day: 12,
				type: "transfer",
				rupees: 2e4,
				category: "others",
				note: "Monthly sweep to SBI",
				payMode: "Bank",
				accountId: ACC_HDFC,
				toAccountId: ACC_SBI
			});
		}
		if (m === 10) {
			s.push({
				month: m,
				day: 1,
				type: "expense",
				rupees: jitter(2500, 300),
				category: "groceries",
				note: "BigBasket weekly groceries",
				payMode: "UPI",
				tags: ["family"]
			});
			s.push({
				month: m,
				day: 2,
				type: "expense",
				rupees: 320,
				category: "food",
				note: "Office lunch",
				payMode: "UPI",
				tags: ["work"]
			});
			s.push({
				month: m,
				day: 3,
				type: "expense",
				rupees: 145,
				category: "food",
				note: "Morning chai",
				payMode: "Cash"
			});
			continue;
		}
		s.push({
			month: m,
			day: 20,
			type: "expense",
			rupees: 999,
			category: "bills",
			note: "Broadband bill",
			payMode: "Card",
			billId: "bill-broadband"
		});
		s.push({
			month: m,
			day: 15,
			type: "expense",
			rupees: jitter(1800, 350),
			category: "bills",
			note: "Electricity bill",
			payMode: "UPI",
			billId: "bill-electricity"
		});
		s.push({
			month: m,
			day: 28,
			type: "expense",
			rupees: 399,
			category: "bills",
			note: "Mobile recharge",
			payMode: "UPI",
			billId: "bill-mobile"
		});
		s.push({
			month: m,
			day: 8,
			type: "expense",
			rupees: jitter(1e3, 250),
			category: "transport",
			note: "Petrol",
			payMode: "Card"
		});
		s.push({
			month: m,
			day: 22,
			type: "expense",
			rupees: jitter(1e3, 250),
			category: "transport",
			note: "Petrol",
			payMode: "Card"
		});
		s.push({
			month: m,
			day: pick([
				3,
				9,
				16,
				24,
				30
			]),
			type: "expense",
			rupees: jitter(750, 150),
			category: "entertainment",
			note: "Movie night",
			payMode: "UPI",
			tags: ["weekend"]
		});
		s.push({
			month: m,
			day: pick([
				7,
				13,
				19,
				26
			]),
			type: "expense",
			rupees: jitter(450, 200),
			category: "health",
			note: "Pharmacy",
			payMode: "UPI"
		});
		s.push({
			month: m,
			day: pick([
				4,
				11,
				18,
				27
			]),
			type: "expense",
			rupees: jitter(2200, 1500),
			category: "shopping",
			note: pick([
				"Amazon order",
				"Myntra haul",
				"Electronics store",
				"Home essentials"
			]),
			payMode: "Card"
		});
		if (m % 2 === 0) s.push({
			month: m,
			day: pick([
				6,
				14,
				21
			]),
			type: "expense",
			rupees: jitter(900, 500),
			category: "shopping",
			note: pick([
				"Zara",
				"Decathlon",
				"Croma"
			]),
			payMode: "Card"
		});
		s.push({
			month: m,
			day: pick([
				5,
				12,
				19,
				26
			]),
			type: "expense",
			rupees: jitter(420, 150),
			category: "food",
			note: pick(["Zomato dinner", "Swiggy order"]),
			payMode: "UPI",
			tags: ["weekend"]
		});
		s.push({
			month: m,
			day: pick([
				2,
				10,
				17,
				25
			]),
			type: "expense",
			rupees: jitter(380, 150),
			category: "food",
			note: pick(["Swiggy lunch", "Zomato order"]),
			payMode: "UPI",
			tags: pick([["work"], []])
		});
		for (let w = 0; w < 8; w++) {
			const day = 1 + w * 3 + Math.floor(rand() * 3);
			if (day > 28) continue;
			s.push({
				month: m,
				day,
				type: "expense",
				rupees: jitter(120, 90),
				category: "food",
				note: pick([
					"Chai tapri",
					"Canteen lunch",
					"Street food",
					"Coffee"
				]),
				payMode: rand() < .8 ? "UPI" : "Cash"
			});
		}
		s.push({
			month: m,
			day: 15,
			type: "expense",
			rupees: 199,
			category: "custom-subs",
			note: "Netflix subscription",
			payMode: "UPI",
			recurringRuleId: "rule-netflix"
		});
		if (m >= 7) s.push({
			month: m,
			day: 1,
			type: "expense",
			rupees: 1750,
			category: "health",
			note: "Cultpass gym membership",
			payMode: "UPI",
			recurringRuleId: "rule-gym"
		});
		s.push({
			month: m,
			day: pick([
				5,
				12,
				21
			]),
			type: "expense",
			rupees: jitter(1150, 250),
			category: "custom-pet",
			note: pick([
				"Drools dog food 10kg",
				"Pet treats & toys",
				"Grooming session"
			]),
			payMode: "UPI",
			tags: ["bruno"]
		});
	}
	for (let m = 5; m <= 9; m++) for (const day of [
		2,
		9,
		16,
		23
	]) s.push({
		month: m,
		day,
		type: "expense",
		rupees: jitter(2500, 300),
		category: "groceries",
		note: pick([
			"BigBasket weekly groceries",
			"Blinkit top-up",
			"DMart run"
		]),
		payMode: "UPI",
		...day === 2 ? { tags: ["family"] } : {}
	});
	s.push({
		month: 5,
		day: 11,
		type: "income",
		rupees: 8500,
		category: "freelance",
		note: "Logo design gig payout",
		payMode: "Bank"
	});
	s.push({
		month: 8,
		day: 18,
		type: "income",
		rupees: 15e3,
		category: "freelance",
		note: "Freelance UI project payout",
		payMode: "Bank"
	});
	s.push({
		month: 9,
		day: 5,
		type: "income",
		rupees: 9500,
		category: "other-income",
		note: "Sold old phone on OLX",
		payMode: "UPI"
	});
	s.push({
		month: 9,
		day: 30,
		type: "income",
		rupees: 2100,
		category: "interest",
		note: "Savings account interest",
		payMode: "Bank"
	});
	s.push({
		month: 5,
		day: 24,
		type: "expense",
		rupees: 8400,
		category: "travel",
		note: "Goa flight booking",
		payMode: "Card",
		tags: ["trip-goa"]
	});
	s.push({
		month: 6,
		day: 6,
		type: "expense",
		rupees: 6200,
		category: "travel",
		note: "Goa Airbnb stay",
		payMode: "Card",
		tags: ["trip-goa"]
	});
	s.push({
		month: 9,
		day: 12,
		type: "expense",
		rupees: 2400,
		category: "travel",
		note: "Rishikesh weekend bus + stay",
		payMode: "UPI",
		tags: ["trip-rishikesh", "weekend"]
	});
	s.push({
		month: 8,
		day: 7,
		type: "expense",
		rupees: 4999,
		category: "education",
		note: "Online course subscription",
		payMode: "Card",
		tags: ["work"]
	});
	s.push({
		month: 7,
		day: 20,
		type: "expense",
		rupees: 850,
		category: "health",
		note: "Dental checkup",
		payMode: "UPI"
	});
	s.push({
		month: 6,
		day: 29,
		type: "expense",
		rupees: 2300,
		category: "custom-pet",
		note: "Vet visit + vaccination",
		payMode: "UPI",
		tags: ["bruno", "health"]
	});
	s.push({
		month: 9,
		day: 8,
		type: "expense",
		rupees: 3200,
		category: "shopping",
		note: "Festive sale electronics",
		payMode: "Card"
	});
	s.push({
		month: 10,
		day: 2,
		type: "expense",
		rupees: 3499,
		category: "custom-gifts",
		note: "Dussehra gifts for family",
		payMode: "UPI",
		tags: ["dussehra", "family"]
	});
	s.push({
		month: 6,
		day: 15,
		type: "expense",
		rupees: 650,
		category: "transport",
		note: "Cab to airport",
		payMode: "UPI",
		tags: ["trip-goa"]
	});
	s.push({
		month: 7,
		day: 4,
		type: "expense",
		rupees: 6200,
		category: "transport",
		note: "Car service + oil change",
		payMode: "Card"
	});
	s.push({
		month: 9,
		day: 26,
		type: "expense",
		rupees: 1450,
		category: "entertainment",
		note: "Concert tickets",
		payMode: "Card",
		tags: ["weekend"]
	});
	s.push({
		month: 5,
		day: 17,
		type: "expense",
		rupees: 299,
		category: "custom-subs",
		note: "Spotify Premium",
		payMode: "UPI"
	});
	s.push({
		month: 8,
		day: 22,
		type: "expense",
		rupees: 1299,
		category: "custom-subs",
		note: "iCloud+ storage yearly",
		payMode: "Card"
	});
	return s.map(makeTxn).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}
function buildAccounts() {
	const createdAt = "2026-05-01T00:00:00.000Z";
	return [
		{
			id: ACC_CASH,
			name: "Cash Wallet",
			type: "cash",
			iconName: "wallet",
			color: "#F59E0B",
			openingBalancePaise: 8e5,
			isDefault: false,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: ACC_UPI,
			name: "UPI · PhonePe",
			type: "upi",
			iconName: "smartphone",
			color: "#10B981",
			openingBalancePaise: 12e5,
			isDefault: false,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: ACC_HDFC,
			name: "HDFC Savings",
			type: "bank",
			iconName: "bank",
			color: "#3B82F6",
			openingBalancePaise: 24e6,
			isDefault: true,
			createdAt,
			updatedAt: createdAt
		},
		{
			id: ACC_SBI,
			name: "SBI Savings",
			type: "bank",
			iconName: "bank",
			color: "#6366F1",
			openingBalancePaise: 85e5,
			isDefault: false,
			createdAt,
			updatedAt: createdAt
		}
	];
}
function buildCustomCategories() {
	const createdAt = "2026-05-01T00:00:00.000Z";
	return [
		{
			id: "custom-pet",
			label: "Pet Care",
			iconName: "paw",
			color: "#D97706",
			kind: "expense",
			createdAt,
			updatedAt: createdAt
		},
		{
			id: "custom-subs",
			label: "Subscriptions",
			iconName: "repeat",
			color: "#8B5CF6",
			kind: "expense",
			createdAt,
			updatedAt: createdAt
		},
		{
			id: "custom-gifts",
			label: "Gifts",
			iconName: "gift",
			color: "#EC4899",
			kind: "expense",
			createdAt,
			updatedAt: createdAt
		}
	];
}
function buildRecurringRules() {
	const createdAt = "2026-06-01T00:00:00.000Z";
	return [{
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
		updatedAt: createdAt
	}, {
		id: "rule-gym",
		type: "expense",
		amountPaise: 175e3,
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
		updatedAt: createdAt
	}];
}
function buildBudgets() {
	return [
		[
			"budget-food",
			"food",
			12e5
		],
		[
			"budget-groceries",
			"groceries",
			15e5
		],
		[
			"budget-transport",
			"transport",
			6e5
		],
		[
			"budget-shopping",
			"shopping",
			1e6
		],
		[
			"budget-entertainment",
			"entertainment",
			5e5
		],
		[
			"budget-bills",
			"bills",
			8e5
		]
	].map(([id, categoryId, limitPaise]) => ({
		id,
		categoryId,
		month: "2026-10",
		limitPaise
	}));
}
function buildBills() {
	return [
		{
			id: "bill-rent",
			name: "Rent",
			amountPaise: 18e5,
			dueDay: 5,
			category: "rent",
			lastPaidOn: "2026-09-05"
		},
		{
			id: "bill-sip",
			name: "SIP",
			amountPaise: 12e5,
			dueDay: 10,
			category: "investments",
			lastPaidOn: "2026-09-10"
		},
		{
			id: "bill-electricity",
			name: "Electricity",
			amountPaise: 18e4,
			dueDay: 15,
			category: "bills",
			lastPaidOn: "2026-09-15"
		},
		{
			id: "bill-broadband",
			name: "Broadband",
			amountPaise: 99900,
			dueDay: 20,
			category: "bills",
			lastPaidOn: "2026-09-20"
		},
		{
			id: "bill-mobile",
			name: "Mobile",
			amountPaise: 39900,
			dueDay: 28,
			category: "bills",
			lastPaidOn: "2026-09-28"
		}
	];
}
function buildGoals() {
	return [
		{
			id: "goal-emergency",
			name: "Emergency fund",
			targetPaise: 3e7,
			savedPaise: 185e5,
			deadline: "2027-06-30",
			color: "#10B981"
		},
		{
			id: "goal-japan",
			name: "Japan trip",
			targetPaise: 25e6,
			savedPaise: 45e5,
			deadline: "2027-11-15",
			color: "#EC4899"
		},
		{
			id: "goal-laptop",
			name: "New laptop",
			targetPaise: 12e6,
			savedPaise: 3e6,
			deadline: "2026-12-31",
			color: "#3B82F6"
		}
	];
}
function buildHoldings() {
	return [
		{
			id: "holding-reliance",
			symbol: "RELIANCE",
			qty: 15,
			avgPricePaise: 285e3
		},
		{
			id: "holding-hdfcbank",
			symbol: "HDFCBANK",
			qty: 40,
			avgPricePaise: 162e3
		},
		{
			id: "holding-infy",
			symbol: "INFY",
			qty: 25,
			avgPricePaise: 178e3
		},
		{
			id: "holding-niftybees",
			symbol: "NIFTYBEES",
			qty: 100,
			avgPricePaise: 26500
		}
	];
}
function buildSeed() {
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
		recurringRules: buildRecurringRules()
	};
}
/**
* Versioned localStorage persistence. SSR-safe: every window/localStorage
* access is guarded with `typeof window === "undefined"`.
*
* v2 adds: accounts, customCategories, recurringRules; transactions gain
* accountId / toAccountId / tags / recurringRuleId. Migrating from v1 keeps
* every v1 record and assigns legacy transactions to default accounts by
* pay mode so balances stay meaningful.
*
* On the server (or with no storage), functions return safe defaults:
* loadDB/seedIfEmpty return an in-memory seeded DB that is NOT persisted.
*/
var STORE_KEY = "finverse:v2";
var LEGACY_STORE_KEY = "finverse:v1";
var isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
function emptyDB() {
	return {
		transactions: [],
		budgets: [],
		bills: [],
		goals: [],
		holdings: [],
		accounts: [],
		customCategories: [],
		recurringRules: []
	};
}
function isValidDB(db) {
	if (typeof db !== "object" || db === null) return false;
	const d = db;
	return Array.isArray(d["transactions"]) && Array.isArray(d["budgets"]) && Array.isArray(d["bills"]) && Array.isArray(d["goals"]) && Array.isArray(d["holdings"]) && Array.isArray(d["accounts"]) && Array.isArray(d["customCategories"]) && Array.isArray(d["recurringRules"]);
}
function isValidV1(db) {
	if (typeof db !== "object" || db === null) return false;
	const d = db;
	return Array.isArray(d["transactions"]) && Array.isArray(d["budgets"]) && Array.isArray(d["bills"]) && Array.isArray(d["goals"]) && Array.isArray(d["holdings"]);
}
var DEFAULT_ICON_FOR_TYPE = {
	cash: "wallet",
	upi: "smartphone",
	bank: "bank"
};
var DEFAULT_ACCOUNT_COLORS = {
	cash: "#F59E0B",
	upi: "#10B981",
	bank: "#3B82F6"
};
/** v1 -> v2: keep every record; park legacy transactions in default accounts by pay mode. */
function migrateV1(v1) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const mk = (id, name, type, isDefault) => ({
		id,
		name,
		type,
		iconName: DEFAULT_ICON_FOR_TYPE[type],
		color: DEFAULT_ACCOUNT_COLORS[type],
		openingBalancePaise: 0,
		isDefault,
		createdAt: now,
		updatedAt: now
	});
	const accounts = [
		mk("acc-cash", "Cash Wallet", "cash", false),
		mk("acc-upi", "UPI", "upi", true),
		mk("acc-bank", "Bank Account", "bank", false)
	];
	const byPayMode = {
		Cash: "acc-cash",
		UPI: "acc-upi",
		Card: "acc-bank",
		Bank: "acc-bank"
	};
	for (const t of v1.transactions) if (!t.accountId) t.accountId = byPayMode[t.payMode] ?? "acc-bank";
	return {
		transactions: v1.transactions,
		budgets: v1.budgets,
		bills: v1.bills,
		goals: v1.goals,
		holdings: v1.holdings,
		accounts,
		customCategories: [],
		recurringRules: []
	};
}
/** Load the DB from localStorage; migrates v1 -> v2 when needed. Server/corruption -> empty DB. */
function loadDB() {
	if (!isBrowser()) return emptyDB();
	try {
		const raw = window.localStorage.getItem(STORE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (isValidDB(parsed)) return parsed;
		}
		const legacyRaw = window.localStorage.getItem(LEGACY_STORE_KEY);
		if (legacyRaw) {
			const legacy = JSON.parse(legacyRaw);
			if (isValidV1(legacy)) {
				const migrated = migrateV1(legacy);
				saveDB(migrated);
				return migrated;
			}
		}
		return emptyDB();
	} catch {
		return emptyDB();
	}
}
/** Persist the DB. No-op on the server. */
function saveDB(db) {
	if (!isBrowser()) return;
	window.localStorage.setItem(STORE_KEY, JSON.stringify(db));
}
/**
* Load; if empty, seed it. On every browser load, also posts due recurring
* transactions (idempotent — never double-posts). Persists only in the browser.
*/
function seedIfEmpty() {
	const db = loadDB();
	if (!(db.transactions.length > 0)) {
		const seeded = buildSeed();
		saveDB(seeded);
		return seeded;
	}
	if (isBrowser()) {
		if (postDueRecurring(db, todayISO()) > 0) saveDB(db);
	}
	return db;
}
/** Assert an amount is a non-negative integer number of paise. */
function assertPaise(amountPaise) {
	if (!Number.isInteger(amountPaise) || amountPaise < 0) throw new Error(`Amount must be a non-negative integer number of paise, got ${amountPaise}`);
}
function assertDateISO(value, field) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN((/* @__PURE__ */ new Date(`${value}T12:00:00`)).getTime())) throw new Error(`${field} must be a valid YYYY-MM-DD date, got "${value}"`);
}
/** Trim, drop empties, dedupe (case-insensitive), cap count/length. */
function normalizeTags(tags) {
	if (!Array.isArray(tags)) return [];
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const raw of tags) {
		if (typeof raw !== "string") continue;
		const t = raw.trim().slice(0, 24);
		if (!t) continue;
		const key = t.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(t);
		if (out.length >= 10) break;
	}
	return out;
}
function listTransactions(db, monthKey) {
	return [...monthKey ? db.transactions.filter((t) => t.dateISO.startsWith(monthKey)) : db.transactions].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}
function addTransaction(db, input) {
	assertPaise(input.amountPaise);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const txn = {
		...input,
		tags: normalizeTags(input.tags),
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now
	};
	db.transactions.push(txn);
	return txn;
}
function updateTransaction(db, id, patch) {
	if (patch.amountPaise !== void 0) assertPaise(patch.amountPaise);
	const txn = db.transactions.find((t) => t.id === id);
	if (!txn) return void 0;
	const { tags, ...rest } = patch;
	Object.assign(txn, rest, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
	if (tags !== void 0) txn.tags = normalizeTags(tags);
	return txn;
}
function deleteTransaction(db, id) {
	const idx = db.transactions.findIndex((t) => t.id === id);
	if (idx === -1) return false;
	db.transactions.splice(idx, 1);
	return true;
}
/** Every distinct tag used across transactions, sorted alphabetically. */
function allTags(db) {
	const set = /* @__PURE__ */ new Set();
	for (const t of db.transactions) for (const tag of t.tags ?? []) set.add(tag);
	return [...set].sort((a, b) => a.localeCompare(b));
}
function listAccounts(db) {
	return [...db.accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
function getAccount(db, id) {
	return db.accounts.find((a) => a.id === id);
}
/** The account new transactions default to; falls back to the first account. */
function defaultAccount(db) {
	return db.accounts.find((a) => a.isDefault) ?? db.accounts[0];
}
/**
* Live balance: opening balance plus replayed transaction effects.
* Expense debits, income credits; transfers debit the source account and
* credit the destination account. Always consistent — edits/deletes flow
* through automatically because the balance is derived, not stored.
*/
function accountBalancePaise(db, accountId) {
	const account = db.accounts.find((a) => a.id === accountId);
	if (!account) return 0;
	let balance = account.openingBalancePaise;
	for (const t of db.transactions) if (t.type === "transfer") {
		if (t.accountId === accountId) balance -= t.amountPaise;
		if (t.toAccountId === accountId) balance += t.amountPaise;
	} else if (t.accountId === accountId) balance += t.type === "income" ? t.amountPaise : -t.amountPaise;
	return balance;
}
function accountSummaries(db) {
	return listAccounts(db).map((account) => ({
		account,
		balancePaise: accountBalancePaise(db, account.id)
	}));
}
function addAccount(db, input) {
	const name = input.name.trim();
	if (!name) throw new Error("Account name is required.");
	assertPaise(input.openingBalancePaise);
	if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) throw new Error("Account color must be a hex color.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const makeDefault = input.isDefault === true || db.accounts.length === 0;
	if (makeDefault) for (const a of db.accounts) a.isDefault = false;
	const account = {
		id: crypto.randomUUID(),
		name: name.slice(0, 40),
		type: input.type,
		iconName: input.iconName || DEFAULT_ICON_FOR_TYPE[input.type],
		color: input.color,
		openingBalancePaise: input.openingBalancePaise,
		isDefault: makeDefault,
		createdAt: now,
		updatedAt: now
	};
	db.accounts.push(account);
	return account;
}
function updateAccount(db, id, patch) {
	const account = db.accounts.find((a) => a.id === id);
	if (!account) return void 0;
	if (patch.name !== void 0) {
		const name = patch.name.trim();
		if (!name) throw new Error("Account name is required.");
		account.name = name.slice(0, 40);
	}
	if (patch.openingBalancePaise !== void 0) assertPaise(patch.openingBalancePaise);
	if (patch.color !== void 0 && !/^#[0-9a-fA-F]{6}$/.test(patch.color)) throw new Error("Account color must be a hex color.");
	Object.assign(account, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
	return account;
}
/**
* Deletes an account and re-points its transactions (and recurring rules) at
* the default account, so no history is lost. Throws when the account is the
* default or the last one — pick/set another default first.
*/
function deleteAccount(db, id) {
	const idx = db.accounts.findIndex((a) => a.id === id);
	if (idx === -1) throw new Error("Account not found.");
	const account = db.accounts[idx];
	if (db.accounts.length === 1) throw new Error("You need at least one account — create another before deleting this one.");
	if (account.isDefault) throw new Error("This is your default account. Set another account as default first.");
	const fallback = defaultAccount(db) ?? db.accounts.find((a) => a.id !== id);
	for (const t of db.transactions) {
		if (t.accountId === id) t.accountId = fallback.id;
		if (t.toAccountId === id) t.toAccountId = fallback.id;
	}
	for (const r of db.recurringRules) {
		if (r.accountId === id) r.accountId = fallback.id;
		if (r.toAccountId === id) r.toAccountId = fallback.id;
	}
	db.accounts.splice(idx, 1);
}
function setDefaultAccount(db, id) {
	const account = db.accounts.find((a) => a.id === id);
	if (!account) throw new Error("Account not found.");
	for (const a of db.accounts) a.isDefault = a.id === id;
	account.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	return account;
}
/** Record an account-to-account transfer as a single transfer transaction. */
function transferBetweenAccounts(db, input) {
	assertPaise(input.amountPaise);
	if (input.amountPaise === 0) throw new Error("Transfer amount must be greater than zero.");
	if (input.fromAccountId === input.toAccountId) throw new Error("Pick two different accounts for a transfer.");
	const from = getAccount(db, input.fromAccountId);
	const to = getAccount(db, input.toAccountId);
	if (!from || !to) throw new Error("Both accounts must exist.");
	const dateISO = input.dateISO ?? todayISO();
	assertDateISO(dateISO, "dateISO");
	return addTransaction(db, {
		type: "transfer",
		amountPaise: input.amountPaise,
		category: "others",
		note: input.note?.trim() || `Transfer · ${from.name} → ${to.name}`,
		dateISO,
		payMode: input.payMode ?? "Bank",
		accountId: from.id,
		toAccountId: to.id
	});
}
function listCustomCategories(db) {
	return [...db.customCategories].sort((a, b) => a.label.localeCompare(b.label));
}
function addCustomCategory(db, input) {
	const label = input.label.trim();
	if (!label) throw new Error("Category name is required.");
	if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) throw new Error("Color must be a hex color.");
	if (db.customCategories.some((c) => c.label.toLowerCase() === label.toLowerCase()) || label.toLowerCase() === "others") throw new Error("A category with this name already exists.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const category = {
		id: `custom-${crypto.randomUUID()}`,
		label: label.slice(0, 30),
		iconName: input.iconName || "tag",
		color: input.color,
		kind: input.kind,
		createdAt: now,
		updatedAt: now
	};
	db.customCategories.push(category);
	return category;
}
function updateCustomCategory(db, id, patch) {
	const category = db.customCategories.find((c) => c.id === id);
	if (!category) return void 0;
	if (patch.label !== void 0) {
		const label = patch.label.trim();
		if (!label) throw new Error("Category name is required.");
		if (db.customCategories.some((c) => c.id !== id && c.label.toLowerCase() === label.toLowerCase())) throw new Error("A category with this name already exists.");
		category.label = label.slice(0, 30);
	}
	if (patch.color !== void 0 && !/^#[0-9a-fA-F]{6}$/.test(patch.color)) throw new Error("Color must be a hex color.");
	Object.assign(category, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
	return category;
}
function deleteCustomCategory(db, id) {
	const idx = db.customCategories.findIndex((c) => c.id === id);
	if (idx === -1) return false;
	db.customCategories.splice(idx, 1);
	return true;
}
var FREQUENCIES = [
	"daily",
	"weekly",
	"monthly",
	"yearly"
];
function pad2(n) {
	return String(n).padStart(2, "0");
}
function addDaysISO(iso, days) {
	const parts = iso.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	const dt = new Date(y, m - 1, d);
	dt.setDate(dt.getDate() + days);
	return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
/** Shift a date by whole months, clamping the day to the target month length. */
function addMonthsClamped(y, m, d, delta) {
	const total = y * 12 + (m - 1) + delta;
	const ny = Math.floor(total / 12);
	const nm = total % 12 + 1;
	const daysInMonth = new Date(ny, nm, 0).getDate();
	return `${ny}-${pad2(nm)}-${pad2(Math.min(d, daysInMonth))}`;
}
/** The nth occurrence date of a rule, computed from its start (no drift). */
function recurringOccurrenceDate(startDateISO, frequency, n) {
	const parts = startDateISO.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	switch (frequency) {
		case "daily": return addDaysISO(startDateISO, n);
		case "weekly": return addDaysISO(startDateISO, n * 7);
		case "monthly": return addMonthsClamped(y, m, d, n);
		case "yearly": return addMonthsClamped(y, m, d, n * 12);
	}
}
function listRecurringRules(db) {
	return [...db.recurringRules].sort((a, b) => a.startDateISO.localeCompare(b.startDateISO));
}
function assertRuleInput(input) {
	if (input.type !== "expense" && input.type !== "income" && input.type !== "transfer") throw new Error("Recurring rule type must be expense, income, or transfer.");
	assertPaise(input.amountPaise);
	if (input.amountPaise === 0) throw new Error("Recurring amount must be greater than zero.");
	if (!FREQUENCIES.includes(input.frequency)) throw new Error("Invalid frequency.");
	assertDateISO(input.startDateISO, "startDateISO");
	if (input.endDateISO !== void 0) {
		assertDateISO(input.endDateISO, "endDateISO");
		if (input.endDateISO < input.startDateISO) throw new Error("End date cannot be before the start date.");
	}
}
function addRecurringRule(db, input) {
	assertRuleInput(input);
	if (input.type === "transfer" && input.accountId && input.toAccountId && input.accountId === input.toAccountId) throw new Error("Transfer rules need two different accounts.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const rule = {
		...input,
		tags: normalizeTags(input.tags),
		lastPostedDateISO: null,
		isPaused: input.isPaused ?? false,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now
	};
	db.recurringRules.push(rule);
	return rule;
}
function updateRecurringRule(db, id, patch) {
	const rule = db.recurringRules.find((r) => r.id === id);
	if (!rule) return void 0;
	assertRuleInput({
		...rule,
		...patch
	});
	const { tags, ...rest } = patch;
	Object.assign(rule, rest, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
	if (tags !== void 0) rule.tags = normalizeTags(tags);
	return rule;
}
function deleteRecurringRule(db, id) {
	const idx = db.recurringRules.findIndex((r) => r.id === id);
	if (idx === -1) return false;
	db.recurringRules.splice(idx, 1);
	return true;
}
function setRecurringRulePaused(db, id, isPaused) {
	const rule = db.recurringRules.find((r) => r.id === id);
	if (!rule) return void 0;
	rule.isPaused = isPaused;
	rule.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	return rule;
}
/**
* Posts every due occurrence of every active rule up to and including
* `asOfISO`. Idempotent: an occurrence is skipped when a transaction with the
* same (rule, date) already exists, and lastPostedDateISO only moves forward.
* Returns the number of transactions posted.
*/
function postDueRecurring(db, asOfISO) {
	let posted = 0;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	for (const rule of db.recurringRules) {
		if (rule.isPaused) continue;
		if (rule.startDateISO > asOfISO) continue;
		const lastPosted = rule.lastPostedDateISO ?? null;
		for (let n = 0; n < 1e3; n++) {
			const dateISO = recurringOccurrenceDate(rule.startDateISO, rule.frequency, n);
			if (dateISO > asOfISO) break;
			if (lastPosted !== null && dateISO <= lastPosted) continue;
			if (rule.endDateISO && dateISO > rule.endDateISO) break;
			if (!db.transactions.some((t) => t.recurringRuleId === rule.id && t.dateISO === dateISO)) {
				db.transactions.push({
					id: crypto.randomUUID(),
					type: rule.type,
					amountPaise: rule.amountPaise,
					category: rule.category,
					note: rule.note || "Recurring",
					dateISO,
					payMode: rule.payMode,
					...rule.accountId ? { accountId: rule.accountId } : {},
					...rule.toAccountId ? { toAccountId: rule.toAccountId } : {},
					tags: [...rule.tags],
					recurringRuleId: rule.id,
					createdAt: now,
					updatedAt: now
				});
				posted++;
			}
			rule.lastPostedDateISO = dateISO;
			rule.updatedAt = now;
		}
	}
	return posted;
}
/** Next occurrence date after `fromISO` (exclusive), or null when the rule ended. */
function nextRecurringDate(rule, fromISO) {
	const lastPosted = rule.lastPostedDateISO ?? null;
	for (let n = 0; n < 1e3; n++) {
		const dateISO = recurringOccurrenceDate(rule.startDateISO, rule.frequency, n);
		if (lastPosted !== null && dateISO <= lastPosted) continue;
		if (rule.endDateISO && dateISO > rule.endDateISO) return null;
		if (dateISO > fromISO) return dateISO;
		if (dateISO <= fromISO) return dateISO;
	}
	return null;
}
function getBudgets(db, month) {
	return db.budgets.filter((b) => b.month === month);
}
/** Upsert: creates or replaces the budget for (categoryId, month). */
function setBudget(db, input) {
	assertPaise(input.limitPaise);
	const existing = db.budgets.find((b) => b.categoryId === input.categoryId && b.month === input.month);
	if (existing) {
		existing.limitPaise = input.limitPaise;
		return existing;
	}
	const budget = {
		id: crypto.randomUUID(),
		...input
	};
	db.budgets.push(budget);
	return budget;
}
function listBills(db) {
	return [...db.bills].sort((a, b) => a.dueDay - b.dueDay);
}
function markBillPaid(db, id, dateISO) {
	const bill = db.bills.find((b) => b.id === id);
	if (!bill) return void 0;
	bill.lastPaidOn = dateISO;
	return bill;
}
function listGoals(db) {
	return [...db.goals];
}
function addGoal(db, input) {
	assertPaise(input.targetPaise);
	assertPaise(input.savedPaise);
	const goal = {
		...input,
		id: crypto.randomUUID()
	};
	db.goals.push(goal);
	return goal;
}
function updateGoal(db, id, patch) {
	if (patch.targetPaise !== void 0) assertPaise(patch.targetPaise);
	if (patch.savedPaise !== void 0) assertPaise(patch.savedPaise);
	const goal = db.goals.find((g) => g.id === id);
	if (!goal) return void 0;
	Object.assign(goal, patch);
	return goal;
}
function deleteGoal(db, id) {
	const idx = db.goals.findIndex((g) => g.id === id);
	if (idx === -1) return false;
	db.goals.splice(idx, 1);
	return true;
}
/** Add funds to a goal (bump savedPaise, clamp at target). Returns undefined when goal missing. */
function addFundsToGoal(db, id, amountPaise) {
	assertPaise(amountPaise);
	const goal = db.goals.find((g) => g.id === id);
	if (!goal) return void 0;
	goal.savedPaise = Math.min(goal.targetPaise, goal.savedPaise + amountPaise);
	return goal;
}
function listHoldings(db) {
	return [...db.holdings];
}
function addHolding(db, input) {
	assertPaise(input.avgPricePaise);
	if (!Number.isFinite(input.qty) || input.qty < 0) throw new Error("Holding qty must be a non-negative number");
	const holding = {
		...input,
		id: crypto.randomUUID()
	};
	db.holdings.push(holding);
	return holding;
}
function updateHolding(db, id, patch) {
	if (patch.avgPricePaise !== void 0) assertPaise(patch.avgPricePaise);
	if (patch.qty !== void 0 && (!Number.isFinite(patch.qty) || patch.qty < 0)) throw new Error("Holding qty must be a non-negative number");
	const holding = db.holdings.find((h) => h.id === id);
	if (!holding) return void 0;
	Object.assign(holding, patch);
	return holding;
}
function deleteHolding(db, id) {
	const idx = db.holdings.findIndex((h) => h.id === id);
	if (idx === -1) return false;
	db.holdings.splice(idx, 1);
	return true;
}
//#endregion
export { saveDB as A, updateRecurringRule as B, listGoals as C, loadDB as D, listTransactions as E, transferBetweenAccounts as F, updateAccount as I, updateCustomCategory as L, setBudget as M, setDefaultAccount as N, markBillPaid as O, setRecurringRulePaused as P, updateGoal as R, listCustomCategories as S, listRecurringRules as T, updateTransaction as V, deleteRecurringRule as _, addCustomCategory as a, listAccounts as b, addHolding as c, allTags as d, defaultAccount as f, deleteHolding as g, deleteGoal as h, addAccount as i, seedIfEmpty as j, nextRecurringDate as k, addRecurringRule as l, deleteCustomCategory as m, STORE_KEY as n, addFundsToGoal as o, deleteAccount as p, accountSummaries as r, addGoal as s, DEFAULT_ACCOUNT_COLORS as t, addTransaction as u, deleteTransaction as v, listHoldings as w, listBills as x, getBudgets as y, updateHolding as z };
