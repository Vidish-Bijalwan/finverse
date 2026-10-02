import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  Landmark,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

import { STORE_KEY } from "@/lib/finance/store";
import { APP_VERSION } from "@/components/shell/AppHeader";

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

function resetDemoData() {
  try {
    window.localStorage.removeItem(STORE_KEY);
  } catch {
    // Storage may be unavailable; reload anyway so seeded defaults return.
  }
  window.location.reload();
}

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
            className={`flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/60 ${
              index > 0 ? "border-t border-border/60" : ""
            }`}
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

      <button
        type="button"
        onClick={resetDemoData}
        className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-destructive/30 bg-card px-4 py-4 text-left transition-colors hover:bg-destructive/5"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <RotateCcw className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">Reset demo data</span>
          <span className="block truncate text-xs text-muted-foreground">
            Clear local data and restore the seeded demo
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>

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
          FinVerse AI {APP_VERSION} · Demo build — data stays in your browser.
        </p>
      </section>
    </div>
  );
}
