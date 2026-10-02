import {
  UtensilsCrossed,
  ShoppingBasket,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  HeartPulse,
  Clapperboard,
  Plane,
  GraduationCap,
  TrendingUp,
  Package,
  Banknote,
  BriefcaseBusiness,
  Briefcase,
  PiggyBank,
  CircleDollarSign,
  PawPrint,
  Dog,
  Cat,
  Baby,
  Gift,
  Coffee,
  Dumbbell,
  Wrench,
  Scissors,
  Music,
  Guitar,
  BookOpen,
  Gamepad2,
  Shirt,
  Smartphone,
  Wifi,
  Fuel,
  TrainFront,
  Hotel,
  Stethoscope,
  Pill,
  Repeat,
  Tag,
  Star,
  Trophy,
  Sparkles,
  Zap,
  Wallet,
  Landmark,
  Bike,
} from "lucide-react";
import type { Category, CustomCategory } from "./types";

export const EXPENSE_CATEGORIES: Category[] = [
  { id: "food", label: "Food & Dining", icon: UtensilsCrossed, color: "#F97316", kind: "expense" },
  { id: "groceries", label: "Groceries", icon: ShoppingBasket, color: "#22C55E", kind: "expense" },
  { id: "transport", label: "Transport", icon: Car, color: "#3B82F6", kind: "expense" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "#EC4899", kind: "expense" },
  { id: "bills", label: "Bills & Utilities", icon: Receipt, color: "#A855F7", kind: "expense" },
  { id: "rent", label: "Rent", icon: Home, color: "#8B5CF6", kind: "expense" },
  { id: "health", label: "Health", icon: HeartPulse, color: "#EF4444", kind: "expense" },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Clapperboard,
    color: "#EAB308",
    kind: "expense",
  },
  { id: "travel", label: "Travel", icon: Plane, color: "#06B6D4", kind: "expense" },
  { id: "education", label: "Education", icon: GraduationCap, color: "#6366F1", kind: "expense" },
  { id: "investments", label: "Investments", icon: TrendingUp, color: "#10B981", kind: "expense" },
  { id: "others", label: "Others", icon: Package, color: "#64748B", kind: "expense" },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: "salary", label: "Salary", icon: Banknote, color: "#16A34A", kind: "income" },
  {
    id: "freelance",
    label: "Freelance",
    icon: BriefcaseBusiness,
    color: "#0EA5E9",
    kind: "income",
  },
  { id: "business", label: "Business", icon: Briefcase, color: "#F59E0B", kind: "income" },
  { id: "interest", label: "Interest", icon: PiggyBank, color: "#8B5CF6", kind: "income" },
  {
    id: "other-income",
    label: "Other Income",
    icon: CircleDollarSign,
    color: "#64748B",
    kind: "income",
  },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/**
 * Icon registry for user-created categories (and accounts).
 * Custom categories persist only the icon NAME, so it stays JSON-serializable.
 */
export const CUSTOM_ICON_OPTIONS: { name: string; label: string; icon: Category["icon"] }[] = [
  { name: "tag", label: "Tag", icon: Tag },
  { name: "paw", label: "Pet", icon: PawPrint },
  { name: "dog", label: "Dog", icon: Dog },
  { name: "cat", label: "Cat", icon: Cat },
  { name: "baby", label: "Baby & Kids", icon: Baby },
  { name: "gift", label: "Gifts", icon: Gift },
  { name: "coffee", label: "Coffee", icon: Coffee },
  { name: "dumbbell", label: "Fitness", icon: Dumbbell },
  { name: "wrench", label: "Repairs", icon: Wrench },
  { name: "scissors", label: "Salon", icon: Scissors },
  { name: "music", label: "Music", icon: Music },
  { name: "guitar", label: "Hobbies", icon: Guitar },
  { name: "book", label: "Books", icon: BookOpen },
  { name: "gamepad", label: "Gaming", icon: Gamepad2 },
  { name: "shirt", label: "Clothing", icon: Shirt },
  { name: "smartphone", label: "Gadgets", icon: Smartphone },
  { name: "wifi", label: "Internet", icon: Wifi },
  { name: "fuel", label: "Fuel", icon: Fuel },
  { name: "train", label: "Rail", icon: TrainFront },
  { name: "bike", label: "Bike", icon: Bike },
  { name: "hotel", label: "Stay", icon: Hotel },
  { name: "stethoscope", label: "Doctor", icon: Stethoscope },
  { name: "pill", label: "Medicine", icon: Pill },
  { name: "repeat", label: "Subscriptions", icon: Repeat },
  { name: "star", label: "Star", icon: Star },
  { name: "trophy", label: "Rewards", icon: Trophy },
  { name: "sparkles", label: "Lifestyle", icon: Sparkles },
  { name: "zap", label: "Quick", icon: Zap },
  { name: "wallet", label: "Wallet", icon: Wallet },
  { name: "bank", label: "Bank", icon: Landmark },
];

/** Preset swatches for the custom-category / account color picker. */
export const CATEGORY_COLORS = [
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
  "#F97316",
] as const;

/** Resolve a stored icon name to a lucide component; falls back to Tag. */
export function iconForName(name: string): Category["icon"] {
  return CUSTOM_ICON_OPTIONS.find((o) => o.name === name)?.icon ?? Tag;
}

/** Convert a stored CustomCategory into a renderable Category. */
export function customCategoryToCategory(c: CustomCategory): Category {
  return {
    id: c.id,
    label: c.label,
    icon: iconForName(c.iconName),
    color: c.color,
    kind: c.kind,
  };
}

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

/**
 * Custom categories live in localStorage (the v2 store), but categoryById is a
 * synchronous pure lookup used by every route. This lazily hydrates stored
 * custom categories with a raw-string cache so repeated renders stay cheap.
 * SSR-safe: returns empty on the server.
 */
let customCache: { raw: string | null; map: Map<string, Category> } = {
  raw: null,
  map: new Map(),
};

function customCategoryMap(): Map<string, Category> {
  if (!isBrowser()) return new Map();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem("finverse:v2");
  } catch {
    return customCache.map;
  }
  if (raw === customCache.raw) return customCache.map;
  const map = new Map<string, Category>();
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const list = (parsed as { customCategories?: unknown } | null)?.customCategories;
    if (Array.isArray(list)) {
      for (const item of list) {
        const c = item as Partial<CustomCategory>;
        if (typeof c.id === "string" && typeof c.label === "string") {
          map.set(c.id, customCategoryToCategory(c as CustomCategory));
        }
      }
    }
  } catch {
    // Corrupt storage: behave as if there are no custom categories.
  }
  customCache = { raw, map };
  return map;
}

/**
 * Returns the category for an id: built-in first, then user-created custom
 * categories (resolved from the v2 store), else undefined for unknown /
 * legacy free-form values.
 */
export function categoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id) ?? customCategoryMap().get(id);
}

/** Built-in plus user-created categories, for pickers and filters. */
export function allCategories(): Category[] {
  return [...ALL_CATEGORIES, ...customCategoryMap().values()];
}
