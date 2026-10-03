import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  Eye,
  Landmark,
  ReceiptIndianRupee,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Wallet,
  WalletCards,
} from "lucide-react";

import { APP_VERSION } from "@/components/shell/AppHeader";
import { pressable } from "@/components/fv";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — FinVerse AI" },
      { name: "description", content: "Browse every FinVerse AI feature from one menu." },
    ],
  }),
  component: MorePage,
});

const MENU_ROWS = [
  {
    label: "Profile",
    description: "Your account, photo and sign out",
    to: "/profile",
    icon: User,
  },
  {
    label: "Bills",
    description: "Recurring bills and upcoming dues",
    to: "/bills",
    icon: ReceiptIndianRupee,
  },
  {
    label: "Budgets",
    description: "Monthly spending limits by category",
    to: "/budgets",
    icon: WalletCards,
  },
  { label: "Goals", description: "Savings goals and milestones", to: "/goals", icon: Target },
  { label: "AI Chat", description: "Ask FinVerse about your money", to: "/chat", icon: Bot },
  {
    label: "Accounts",
    description: "Cash, UPI and bank wallets with live balances",
    to: "/accounts",
    icon: Wallet,
  },
  {
    label: "Calculators",
    description: "SIP, EMI, FD, tax, emergency fund and forecasts",
    to: "/tools",
    icon: Calculator,
  },
  {
    label: "Notifications",
    description: "Bill dues, budget alerts, price alerts and more",
    to: "/notifications",
    icon: Bell,
  },
  {
    label: "Watchlist",
    description: "Track stocks and set price alerts",
    to: "/markets",
    icon: Eye,
  },
  {
    label: "Settings",
    description: "Theme, data controls and about",
    to: "/settings",
    icon: Settings,
  },
  {
    label: "Screener",
    description: "Screen stocks by fundamentals",
    to: "/screener",
    icon: BriefcaseBusiness,
  },
  {
    label: "Readiness",
    description: "Financial readiness score",
    to: "/readiness",
    icon: ShieldCheck,
  },
] as const;

function MorePage() {
  return (
    <div className="mx-auto w-full max-w-dashboard px-4 py-6 sm:px-5 lg:px-8">
      <div className="mb-5 flex items-center gap-2 text-sm font-bold text-primary">
        <Sparkles className="size-4" /> BROWSE
      </div>
      <h1 className="text-2xl font-black tracking-tight text-primary-dark">More</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every FinVerse AI feature, one tap away.</p>

      <nav
        aria-label="All features"
        className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      >
        {MENU_ROWS.map((row, index) => (
          <Link
            key={row.label}
            to={row.to}
            className={`${`flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/60 ${
              index > 0 ? "border-t border-border/60" : ""
            }`} ${pressable}`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <row.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{row.label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {row.description}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <section className="mt-6 rounded-2xl border border-border bg-surface-soft p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-primary-dark">
            <Landmark className="size-5 text-primary-foreground" />
          </span>
          <h2 className="text-base font-bold text-foreground">About FinVerse</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          FinVerse AI is a college major project that turns raw money data into clear, explainable
          insights. Track spending, manage budgets and bills, set goals, and understand your
          investments — with AI that always shows its reasoning.
        </p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          FinVerse AI {APP_VERSION} · Your data syncs securely to your account.
        </p>
      </section>
    </div>
  );
}
