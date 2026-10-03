import { C as Smartphone, Ct as Fuel, E as Shirt, Ft as Coffee, G as Pill, I as Repeat, K as PiggyBank, N as Scissors, Q as Package, Qt as Car, Rt as Clapperboard, S as Sparkles, St as Gamepad2, T as ShoppingBag, Vt as CircleDollarSign, W as Plane, Y as PawPrint, Zt as Cat, _t as HeartPulse, a as Wallet, b as Stethoscope, bt as GraduationCap, d as Trophy, dn as Baby, et as Music, g as TrainFront, ht as Hotel, i as Wifi, in as BriefcaseBusiness, jt as Dog, kt as Dumbbell, mt as House, on as BookOpen, p as TrendingUp, r as Wrench, rn as Briefcase, s as UtensilsCrossed, sn as Bike, t as Zap, un as Banknote, ut as Landmark, v as Tag, w as ShoppingBasket, x as Star, xt as Gift, yt as Guitar, z as Receipt } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-BtDQEnJC.js
var EXPENSE_CATEGORIES = [
	{
		id: "food",
		label: "Food & Dining",
		icon: UtensilsCrossed,
		color: "#F97316",
		kind: "expense"
	},
	{
		id: "groceries",
		label: "Groceries",
		icon: ShoppingBasket,
		color: "#22C55E",
		kind: "expense"
	},
	{
		id: "transport",
		label: "Transport",
		icon: Car,
		color: "#3B82F6",
		kind: "expense"
	},
	{
		id: "shopping",
		label: "Shopping",
		icon: ShoppingBag,
		color: "#EC4899",
		kind: "expense"
	},
	{
		id: "bills",
		label: "Bills & Utilities",
		icon: Receipt,
		color: "#A855F7",
		kind: "expense"
	},
	{
		id: "rent",
		label: "Rent",
		icon: House,
		color: "#8B5CF6",
		kind: "expense"
	},
	{
		id: "health",
		label: "Health",
		icon: HeartPulse,
		color: "#EF4444",
		kind: "expense"
	},
	{
		id: "entertainment",
		label: "Entertainment",
		icon: Clapperboard,
		color: "#EAB308",
		kind: "expense"
	},
	{
		id: "travel",
		label: "Travel",
		icon: Plane,
		color: "#06B6D4",
		kind: "expense"
	},
	{
		id: "education",
		label: "Education",
		icon: GraduationCap,
		color: "#6366F1",
		kind: "expense"
	},
	{
		id: "investments",
		label: "Investments",
		icon: TrendingUp,
		color: "#10B981",
		kind: "expense"
	},
	{
		id: "others",
		label: "Others",
		icon: Package,
		color: "#64748B",
		kind: "expense"
	}
];
var INCOME_CATEGORIES = [
	{
		id: "salary",
		label: "Salary",
		icon: Banknote,
		color: "#16A34A",
		kind: "income"
	},
	{
		id: "freelance",
		label: "Freelance",
		icon: BriefcaseBusiness,
		color: "#0EA5E9",
		kind: "income"
	},
	{
		id: "business",
		label: "Business",
		icon: Briefcase,
		color: "#F59E0B",
		kind: "income"
	},
	{
		id: "interest",
		label: "Interest",
		icon: PiggyBank,
		color: "#8B5CF6",
		kind: "income"
	},
	{
		id: "other-income",
		label: "Other Income",
		icon: CircleDollarSign,
		color: "#64748B",
		kind: "income"
	}
];
var ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
/**
* Icon registry for user-created categories (and accounts).
* Custom categories persist only the icon NAME, so it stays JSON-serializable.
*/
var CUSTOM_ICON_OPTIONS = [
	{
		name: "tag",
		label: "Tag",
		icon: Tag
	},
	{
		name: "paw",
		label: "Pet",
		icon: PawPrint
	},
	{
		name: "dog",
		label: "Dog",
		icon: Dog
	},
	{
		name: "cat",
		label: "Cat",
		icon: Cat
	},
	{
		name: "baby",
		label: "Baby & Kids",
		icon: Baby
	},
	{
		name: "gift",
		label: "Gifts",
		icon: Gift
	},
	{
		name: "coffee",
		label: "Coffee",
		icon: Coffee
	},
	{
		name: "dumbbell",
		label: "Fitness",
		icon: Dumbbell
	},
	{
		name: "wrench",
		label: "Repairs",
		icon: Wrench
	},
	{
		name: "scissors",
		label: "Salon",
		icon: Scissors
	},
	{
		name: "music",
		label: "Music",
		icon: Music
	},
	{
		name: "guitar",
		label: "Hobbies",
		icon: Guitar
	},
	{
		name: "book",
		label: "Books",
		icon: BookOpen
	},
	{
		name: "gamepad",
		label: "Gaming",
		icon: Gamepad2
	},
	{
		name: "shirt",
		label: "Clothing",
		icon: Shirt
	},
	{
		name: "smartphone",
		label: "Gadgets",
		icon: Smartphone
	},
	{
		name: "wifi",
		label: "Internet",
		icon: Wifi
	},
	{
		name: "fuel",
		label: "Fuel",
		icon: Fuel
	},
	{
		name: "train",
		label: "Rail",
		icon: TrainFront
	},
	{
		name: "bike",
		label: "Bike",
		icon: Bike
	},
	{
		name: "hotel",
		label: "Stay",
		icon: Hotel
	},
	{
		name: "stethoscope",
		label: "Doctor",
		icon: Stethoscope
	},
	{
		name: "pill",
		label: "Medicine",
		icon: Pill
	},
	{
		name: "repeat",
		label: "Subscriptions",
		icon: Repeat
	},
	{
		name: "star",
		label: "Star",
		icon: Star
	},
	{
		name: "trophy",
		label: "Rewards",
		icon: Trophy
	},
	{
		name: "sparkles",
		label: "Lifestyle",
		icon: Sparkles
	},
	{
		name: "zap",
		label: "Quick",
		icon: Zap
	},
	{
		name: "wallet",
		label: "Wallet",
		icon: Wallet
	},
	{
		name: "bank",
		label: "Bank",
		icon: Landmark
	}
];
/** Preset swatches for the custom-category / account color picker. */
var CATEGORY_COLORS = [
	"#F59E0B",
	"#EF4444",
	"#EC4899",
	"#8B5CF6",
	"#6366F1",
	"#3B82F6",
	"#06B6D4",
	"#10B981",
	"#22C55E",
	"#84CC16",
	"#EAB308",
	"#F97316"
];
/** Resolve a stored icon name to a lucide component; falls back to Tag. */
function iconForName(name) {
	return CUSTOM_ICON_OPTIONS.find((o) => o.name === name)?.icon ?? Tag;
}
/** Convert a stored CustomCategory into a renderable Category. */
function customCategoryToCategory(c) {
	return {
		id: c.id,
		label: c.label,
		icon: iconForName(c.iconName),
		color: c.color,
		kind: c.kind
	};
}
/**
* In-memory cache of the user's custom categories, populated by the Supabase
* data-access layer (db.ts calls setCustomCategoryCache after every fetch).
* categoryById stays a synchronous pure lookup: built-ins first, then this
* cache. Empty until the first fetchCustomCategories() resolves.
*/
var customCache = /* @__PURE__ */ new Map();
/** Replace the custom-category lookup cache (called by db.ts after fetches). */
function setCustomCategoryCache(list) {
	customCache = new Map(list.map((c) => [c.id, customCategoryToCategory(c)]));
}
/**
* Returns the category for an id: built-in first, then user-created custom
* categories (from the in-memory cache), else undefined for unknown /
* legacy free-form values.
*/
function categoryById(id) {
	return ALL_CATEGORIES.find((c) => c.id === id) ?? customCache.get(id);
}
/** Built-in plus user-created categories, for pickers and filters. */
function allCategories() {
	return [...ALL_CATEGORIES, ...customCache.values()];
}
//#endregion
export { allCategories as a, iconForName as c, EXPENSE_CATEGORIES as i, setCustomCategoryCache as l, CATEGORY_COLORS as n, categoryById as o, CUSTOM_ICON_OPTIONS as r, customCategoryToCategory as s, ALL_CATEGORIES as t };
