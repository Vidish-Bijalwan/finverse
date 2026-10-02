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
} from "lucide-react";
import type { Category } from "./types";

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

/** Returns the category for an id, or undefined when unknown (e.g. legacy free-form values). */
export function categoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}
