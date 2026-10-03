import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Calculator,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Eye,
  Headphones,
  Lightbulb,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/charts/CountUp";
import { MonthBars, type MonthFlow } from "@/components/charts/MonthBars";
import { NetWorthSpark, type NetWorthPoint } from "@/components/charts/NetWorthSpark";
import { SpendDonut, type DonutSlice } from "@/components/charts/SpendDonut";
import { ChartSkeleton } from "@/components/charts/shared";
import { categoryById } from "@/lib/finance/categories";
import { formatINR, formatINRShort, monthKey, monthLabel } from "@/lib/finance/format";
import { useHoldings, useMonth, useTransactions } from "@/lib/finance/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinVerse AI — Your Money, Clearly Explained" },
      {
        name: "description",
        content:
          "Track spending, understand investments, and make clearer financial decisions with explainable AI.",
      },
      { property: "og:title", content: "FinVerse AI — Your Money, Clearly Explained" },
      {
        property: "og:description",
        content: "One clear view of your spending, investments, goals, and financial health.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinVerseDashboard,
});

/** "2026-10" shifted by delta months, e.g. shiftMonth("2026-10", -1) -> "2026-09". */
function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-10" -> "Oct" for compact chart axis labels. */
function shortMonthLabel(key: string): string {
  return monthLabel(key).split(" ")[0];
}

function signFormat(paise: number): string {
  return `${paise >= 0 ? "+ " : "− "}${formatINR(Math.abs(paise))}`;
}

const quickActions = [
  { label: "Add Expense", icon: Plus, to: "/expenses" },
  { label: "Budgets", icon: WalletCards, to: "/budgets" },
  { label: "Bills", icon: Receipt, to: "/bills" },
  { label: "Goals", icon: Target, to: "/goals" },
  { label: "Portfolio", icon: BriefcaseBusiness, to: "/portfolio" },
  { label: "AI Chat", icon: Bot, to: "/chat" },
  { label: "Accounts", icon: Wallet, to: "/accounts" },
  { label: "Calculators", icon: Calculator, to: "/tools" },
  { label: "Watchlist", icon: Eye, to: "/watchlist" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="FinVerse home">
      <div className="grid size-9 place-items-center rounded-md bg-primary-dark shadow-logo">
        <ChartNoAxesCombined className="size-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-black text-primary-dark">
        Fin<span className="text-primary">Verse</span>
      </span>
    </div>
  );
}

interface Mover {
  id: string;
  label: string;
  color: string;
  delta: number;
  current: number;
  previous: number;
  pct: number | null;
}

function FinVerseDashboard() {
  const [month, setMonth] = useMonth();
  const [chartsReady, setChartsReady] = useState(false);

  // Recharts needs layout measurements; mount charts client-side only (SSR-safe).
  useEffect(() => {
    setChartsReady(true);
  }, []);

  const { data: txns, isLoading: txnsLoading, isError: txnsError } = useTransactions();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();

  const currentKey = monthKey(new Date());
  const prevKey = shiftMonth(month, -1);
  const canGoForward = month < currentKey;

  const stats = useMemo(() => {
    const all = txns ?? [];
    let lifetimeIncome = 0;
    let lifetimeExpenses = 0;
    const byMonth = new Map<string, { income: number; expense: number }>();
    const monthCatSpend = new Map<string, number>();
    const prevCatSpend = new Map<string, number>();

    for (const t of all) {
      const key = t.dateISO.slice(0, 7);
      let entry = byMonth.get(key);
      if (!entry) {
        entry = { income: 0, expense: 0 };
        byMonth.set(key, entry);
      }
      if (t.type === "income") {
        lifetimeIncome += t.amountPaise;
        entry.income += t.amountPaise;
      } else if (t.type === "expense") {
        lifetimeExpenses += t.amountPaise;
        entry.expense += t.amountPaise;
        if (key === month)
          monthCatSpend.set(t.category, (monthCatSpend.get(t.category) ?? 0) + t.amountPaise);
        else if (key === prevKey)
          prevCatSpend.set(t.category, (prevCatSpend.get(t.category) ?? 0) + t.amountPaise);
      }
    }

    const monthEntry = byMonth.get(month) ?? { income: 0, expense: 0 };
    const monthIncome = monthEntry.income;
    const monthExpense = monthEntry.expense;

    // Spend-by-category donut slices, largest first.
    const donut: DonutSlice[] = [...monthCatSpend.entries()]
      .map(([id, value]) => {
        const cat = categoryById(id);
        return {
          id,
          label: cat?.label ?? id,
          value,
          color: cat?.color ?? "#64748B",
        };
      })
      .sort((a, b) => b.value - a.value);

    // Six months ending at the selected month.
    const bars: MonthFlow[] = [];
    for (let i = 5; i >= 0; i--) {
      const key = shiftMonth(month, -i);
      const e = byMonth.get(key) ?? { income: 0, expense: 0 };
      bars.push({ key, label: shortMonthLabel(key), income: e.income, expense: e.expense });
    }

    // Cumulative (income − expenses) by month, last six months up to the selection.
    const keys = [...byMonth.keys()].filter((k) => k <= month).sort();
    const spark: NetWorthPoint[] = [];
    let running = 0;
    for (const key of keys) {
      const e = byMonth.get(key);
      if (!e) continue;
      running += e.income - e.expense;
      spark.push({ key, label: shortMonthLabel(key), net: running });
    }
    const spark6 = spark.slice(-6);

    // Biggest month-over-month category increase.
    let mover: Mover | null = null;
    for (const id of new Set([...monthCatSpend.keys(), ...prevCatSpend.keys()])) {
      const current = monthCatSpend.get(id) ?? 0;
      const previous = prevCatSpend.get(id) ?? 0;
      const delta = current - previous;
      if (delta > 0 && (!mover || delta > mover.delta)) {
        const cat = categoryById(id);
        mover = {
          id,
          label: cat?.label ?? id,
          color: cat?.color ?? "#64748B",
          delta,
          current,
          previous,
          pct: previous > 0 ? Math.round((delta / previous) * 100) : null,
        };
      }
    }

    const topSlice = donut[0];

    return {
      balance: lifetimeIncome - lifetimeExpenses,
      pnl: monthIncome - monthExpense,
      monthIncome,
      monthExpense,
      donut,
      bars,
      spark: spark6,
      mover,
      topCategory: topSlice ? { label: topSlice.label, value: topSlice.value } : null,
    };
  }, [txns, month, prevKey]);

  const investedPaise = useMemo(
    () => (holdings ?? []).reduce((sum, h) => sum + h.qty * h.avgPricePaise, 0),
    [holdings],
  );

  const loading = txnsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* ── Hero: balance + month selector ─────────────────────────── */}
        <section className="border-b border-border bg-surface-soft">
          <div className="mx-auto grid max-w-dashboard gap-8 px-5 py-10 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-12">
            <div className="self-center">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
                <Sparkles className="size-4" /> YOUR FINANCIAL OVERVIEW
              </div>
              <h1 className="max-w-2xl text-3xl font-black leading-tight text-primary-dark sm:text-4xl">
                Your money, in one clear view.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Track spending, understand your investments, and make confident decisions with AI
                that always explains why.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/expenses">
                    <Plus className="size-4" /> Add Expense
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/insights">
                    View AI Insights <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">TOTAL BALANCE</p>
                  {loading ? (
                    <ChartSkeleton className="mt-2 h-9 w-48" />
                  ) : (
                    <CountUp
                      value={stats.balance}
                      className="mt-2 block text-3xl font-black text-primary-dark"
                    />
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lifetime income minus lifetime expenses
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 rounded-md border border-border bg-background px-1 py-0.5"
                  aria-label="Select month"
                >
                  <button
                    type="button"
                    onClick={() => setMonth(shiftMonth(month, -1))}
                    className="grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="min-w-20 px-1 text-center text-sm font-bold text-foreground">
                    {monthLabel(month)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMonth(shiftMonth(month, 1))}
                    disabled={!canGoForward}
                    className="grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Next month"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {loading ? (
                  <ChartSkeleton className="h-5 w-40" />
                ) : (
                  <>
                    <span
                      className={cn(
                        "flex items-center gap-1 font-bold",
                        stats.pnl >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {stats.pnl >= 0 ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                      <CountUp value={stats.pnl} format={signFormat} duration={700} />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {monthLabel(month)} P&amp;L
                    </span>
                  </>
                )}
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    NET WORTH · LAST 6 MONTHS
                  </p>
                  {!loading && stats.spark.length > 0 && (
                    <span
                      className={cn(
                        "text-sm font-bold",
                        stats.spark[stats.spark.length - 1].net >= 0
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {formatINRShort(stats.spark[stats.spark.length - 1].net)}
                    </span>
                  )}
                </div>
                <NetWorthSpark data={stats.spark} ready={chartsReady} loading={loading} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Analytics charts ───────────────────────────────────────── */}
        <section className="mx-auto max-w-dashboard px-5 py-10 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-primary">ANALYTICS</p>
              <h2 className="mt-1 text-2xl font-bold text-primary-dark">Where your money went</h2>
            </div>
            <span className="text-sm font-bold text-muted-foreground">{monthLabel(month)}</span>
          </div>

          {txnsError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Couldn&apos;t load your transactions. Please try again.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-12">
              <article className="rounded-lg border border-border bg-card p-6 shadow-card lg:col-span-5">
                <h3 className="text-base font-bold text-primary-dark">Spend by category</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{monthLabel(month)}</p>
                <div className="mt-4">
                  <SpendDonut
                    data={stats.donut}
                    totalPaise={stats.monthExpense}
                    ready={chartsReady}
                    loading={loading}
                  />
                </div>
              </article>
              <article className="rounded-lg border border-border bg-card p-6 shadow-card lg:col-span-7">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-primary-dark">Income vs expenses</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Last 6 months, ending {monthLabel(month)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2.5 rounded-sm bg-[#16A34A]" /> Income
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2.5 rounded-sm bg-[#EF4444]" /> Expense
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <MonthBars data={stats.bars} ready={chartsReady} loading={loading} />
                </div>
              </article>
            </div>
          )}
        </section>

        {/* ── Quick actions ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-dashboard px-5 py-10 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-primary">QUICK ACTIONS</p>
              <h2 className="mt-1 text-2xl font-bold text-primary-dark">
                What would you like to do?
              </h2>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
            {quickActions.map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="group flex flex-col items-center gap-2.5 rounded-md p-2 text-center transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <span className="grid size-15 place-items-center rounded-md bg-tint shadow-tile transition-colors group-hover:bg-primary">
                  <Icon className="size-6 text-primary transition-colors group-hover:text-primary-foreground" />
                </span>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── AI insight + deep-link cards ───────────────────────────── */}
        <section className="border-y border-border bg-surface-soft py-10">
          <div className="mx-auto max-w-dashboard px-5 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-5 sm:grid-cols-3">
                <DeepLinkCard
                  icon={<Wallet className="size-6" />}
                  title="Expenses"
                  to="/expenses"
                  stat={loading ? "…" : formatINRShort(stats.monthExpense)}
                  statLabel={`Spent in ${monthLabel(month)}`}
                  sub={
                    loading
                      ? "…"
                      : stats.topCategory
                        ? `Top: ${stats.topCategory.label} · ${formatINRShort(stats.topCategory.value)}`
                        : "No spending recorded yet"
                  }
                />
                <DeepLinkCard
                  icon={<BriefcaseBusiness className="size-6" />}
                  title="Portfolio"
                  to="/portfolio"
                  stat={holdingsLoading ? "…" : formatINRShort(investedPaise)}
                  statLabel="Invested value"
                  sub={
                    holdingsLoading
                      ? "…"
                      : `${holdings?.length ?? 0} holding${(holdings?.length ?? 0) === 1 ? "" : "s"} at avg. buy price`
                  }
                />
                <DeepLinkCard
                  icon={<Sparkles className="size-6" />}
                  title="Insights"
                  to="/insights"
                  stat={loading ? "…" : stats.mover ? `+${formatINRShort(stats.mover.delta)}` : "—"}
                  statLabel="Biggest riser"
                  sub={
                    loading
                      ? "…"
                      : stats.mover
                        ? `${stats.mover.label} vs ${monthLabel(prevKey)}`
                        : "No category rose this month"
                  }
                />
              </div>

              <aside className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2 text-sm font-bold text-primary-dark">
                  <Sparkles className="size-4 text-primary" /> FinVerse AI says
                </div>
                {loading ? (
                  <ChartSkeleton className="mt-3 h-16" />
                ) : stats.mover ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    <span className="font-bold text-foreground">{stats.mover.label}</span> rose{" "}
                    <span className="font-bold text-destructive">
                      +{formatINR(stats.mover.delta)}
                    </span>
                    {stats.mover.pct !== null ? ` (${stats.mover.pct}% more)` : ""} vs{" "}
                    {monthLabel(prevKey)} — your biggest jump this month. That&apos;s the first
                    place to look if you want to save.
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    No spending category rose this month — your habits are holding steady. See the
                    full breakdown of what moved and why.
                  </p>
                )}
                <Button size="sm" className="mt-4" asChild>
                  <Link to="/insights">
                    View AI Insights <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Trust row ──────────────────────────────────────────────── */}
        <section className="border-b border-border bg-tint/60">
          <div className="mx-auto grid max-w-dashboard gap-7 px-5 py-8 sm:grid-cols-3 lg:px-8">
            <Trust
              icon={<ShieldCheck />}
              title="Bank-grade security"
              detail="Encrypted and protected"
            />
            <Trust icon={<Lightbulb />} title="AI, explained" detail="No black-box scores" />
            <Trust icon={<Headphones />} title="24×7 help" detail="Support when you need it" />
          </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="mx-auto max-w-dashboard px-5 py-10 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                Decision support for better money habits. FinVerse does not provide financial
                advice.
              </p>
            </div>
            <FooterColumn
              heading="Product"
              links={[
                { label: "Dashboard", to: "/" },
                { label: "Portfolio", to: "/portfolio" },
                { label: "AI Insights", to: "/insights" },
              ]}
            />
            <FooterColumn
              heading="Company"
              links={[{ label: "About" }, { label: "Security" }, { label: "Contact" }]}
            />
            <FooterColumn
              heading="Resources"
              links={[{ label: "Help Centre" }, { label: "Privacy" }, { label: "Terms" }]}
            />
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 FinVerse AI. All rights reserved.</span>
            <span>Data encrypted · Explainable AI · Decision support only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DeepLinkCard({
  icon,
  title,
  to,
  stat,
  statLabel,
  sub,
}: {
  icon: ReactNode;
  title: string;
  to: string;
  stat: string;
  statLabel: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-lg border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-modal active:translate-y-0 active:scale-[0.99]"
    >
      <div className="grid size-12 shrink-0 place-items-center rounded-md bg-tint text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-black text-primary-dark">{stat}</p>
      <p className="text-xs text-muted-foreground">{statLabel}</p>
      <p className="mt-3 min-h-8 text-xs leading-5 text-muted-foreground">{sub}</p>
      <span className="mt-3 flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary-hover">
        Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; to?: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-foreground">{heading}</h3>
      <div className="mt-3 grid gap-2">
        {links.map((link) =>
          link.to ? (
            <Link
              key={link.label}
              to={link.to}
              className="w-fit text-left text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ) : (
            <span key={link.label} className="w-fit text-left text-xs text-muted-foreground">
              {link.label}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function Trust({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 sm:justify-center">
      <span className="text-primary [&>svg]:size-6">{icon}</span>
      <div>
        <p className="text-sm font-bold text-primary-dark">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
