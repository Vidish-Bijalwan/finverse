import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBills,
  useBudgets,
  useGoals,
  useHoldings,
  useMonth,
  useTransactions,
} from "@/lib/finance/hooks";
import { formatINR, monthKey } from "@/lib/finance/format";
import { isInvestmentOrder } from "@/lib/finance/investments";
import { getStock } from "@/lib/market/data";
import { PageShell } from "@/components/markets/PageShell";
import { ScoreRing } from "@/components/markets/ScoreRing";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/finance/types";

export const Route = createFileRoute("/readiness")({
  head: () => ({
    meta: [{ title: "Investment Readiness — FinVerse AI" }],
  }),
  component: ReadinessPage,
});

interface Factor {
  id: string;
  title: string;
  weight: number; // of 100
  points: number; // 0..100 raw
  earned: number; // weighted
  inputs: string;
  reasoning: string;
}

/** "2026-10" minus n months -> "YYYY-MM". */
function shiftMonth(key: string, n: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 - n, 1);
  return monthKey(d);
}

function sumBy(txns: Transaction[], month: string, type: Transaction["type"]): number {
  return (
    txns
      // Legacy expense/income-shaped brokerage rows are transfers, not real
      // income/spend — exclude them from readiness math.
      .filter((t) => t.type === type && !isInvestmentOrder(t) && monthKey(t.dateISO) === month)
      .reduce((a, t) => a + t.amountPaise, 0)
  );
}

function sumCategory(txns: Transaction[], month: string, category: string): number {
  return txns
    .filter(
      (t) =>
        t.type === "expense" &&
        !isInvestmentOrder(t) &&
        t.category === category &&
        monthKey(t.dateISO) === month,
    )
    .reduce((a, t) => a + t.amountPaise, 0);
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function ReadinessPage() {
  const [month] = useMonth();
  const { data: goals, isPending: goalsPending } = useGoals();
  const { data: txns, isPending: txnsPending } = useTransactions();
  const { data: bills, isPending: billsPending } = useBills();
  const { data: budgets, isPending: budgetsPending } = useBudgets(month);
  const { data: holdings, isPending: holdingsPending } = useHoldings();

  const [amount, setAmount] = useState("");
  const [asked, setAsked] = useState(false);

  const pending = goalsPending || txnsPending || billsPending || budgetsPending || holdingsPending;

  const model = useMemo(() => {
    if (!goals || !txns || !bills || !budgets || !holdings) return null;

    const last3 = [0, 1, 2].map((n) => shiftMonth(month, n + 1)); // 3 completed months
    const expenses3 = last3.map((m) => sumBy(txns, m, "expense"));
    const income3 = last3.map((m) => sumBy(txns, m, "income"));
    const avgMonthlyExpenses = expenses3.reduce((a, b) => a + b, 0) / 3;

    // 1. Emergency fund (35%)
    const emergency = goals.find((g) => g.name.toLowerCase().includes("emergency"));
    const monthsCovered =
      avgMonthlyExpenses > 0 ? (emergency?.savedPaise ?? 0) / avgMonthlyExpenses : 0;
    const emergencyPts = clamp((monthsCovered / 6) * 100);

    // 2. Savings rate, 3-month average (25%)
    const rates = last3.map((m, i) =>
      income3[i] > 0 ? ((income3[i] - expenses3[i]) / income3[i]) * 100 : 0,
    );
    const avgRate = rates.reduce((a, b) => a + b, 0) / 3;
    const savingsPts = clamp((avgRate / 20) * 100);

    // 3. Budget discipline, current month (20%)
    const spentByCat = new Map<string, number>();
    txns
      .filter((t) => t.type === "expense" && !isInvestmentOrder(t) && monthKey(t.dateISO) === month)
      .forEach((t) =>
        spentByCat.set(t.category, (spentByCat.get(t.category) ?? 0) + t.amountPaise),
      );
    const unbreached = budgets.filter(
      (b) => (spentByCat.get(b.categoryId) ?? 0) <= b.limitPaise,
    ).length;
    const disciplinePts = budgets.length > 0 ? (unbreached / budgets.length) * 100 : 0;

    // 4. Fixed-cost ratio (20%)
    let rent = sumCategory(txns, month, "rent");
    if (rent === 0) rent = last3.reduce((a, m) => a + sumCategory(txns, m, "rent"), 0) / 3; // not paid yet this month
    const billsTotal = bills.reduce((a, b) => a + b.amountPaise, 0);
    let incomeNow = sumBy(txns, month, "income");
    if (incomeNow === 0) incomeNow = income3.reduce((a, b) => a + b, 0) / 3;
    const fixedTotal = rent + billsTotal;
    const fixedRatio = incomeNow > 0 ? fixedTotal / incomeNow : 1;
    const fixedPts = clamp(((0.6 - fixedRatio) / 0.3) * 100);

    const factors: Factor[] = [
      {
        id: "emergency",
        title: "Emergency-fund coverage",
        weight: 35,
        points: emergencyPts,
        earned: (emergencyPts / 100) * 35,
        inputs: emergency
          ? `Saved ${formatINR(emergency.savedPaise)} ÷ avg monthly expenses ${formatINR(Math.round(avgMonthlyExpenses))} = ${monthsCovered.toFixed(1)} months covered (target 6).`
          : "No 'Emergency fund' goal found — 0 months covered.",
        reasoning:
          monthsCovered >= 6
            ? "A full 6-month cushion means a market dip never forces a distress sale."
            : monthsCovered >= 3
              ? "Partial cushion — investing is reasonable, but keep topping up the fund first."
              : "Thin safety net — an emergency could force you to sell investments at the worst time.",
      },
      {
        id: "savings",
        title: "Savings rate (3-mo avg)",
        weight: 25,
        points: savingsPts,
        earned: (savingsPts / 100) * 25,
        inputs: `Monthly rates ${rates.map((r) => `${r.toFixed(0)}%`).join(" · ")} → avg ${avgRate.toFixed(1)}% (target 20%). Income and expenses from your recorded transactions.`,
        reasoning:
          avgRate >= 20
            ? "You consistently keep a fifth of income — that surplus is what investing compounds."
            : avgRate >= 10
              ? "Positive but below the 20% investing threshold — trim one spending category to unlock more."
              : "Near-zero surplus leaves nothing to invest without cutting spending or raising income first.",
      },
      {
        id: "discipline",
        title: "Budget discipline",
        weight: 20,
        points: disciplinePts,
        earned: (disciplinePts / 100) * 20,
        inputs:
          budgets.length > 0
            ? `${unbreached} of ${budgets.length} budgets unbreached in ${month} (${disciplinePts.toFixed(0)}%).`
            : "No budgets set for this month — discipline can't be measured.",
        reasoning:
          disciplinePts >= 80
            ? "You stick to planned spending, so an investing habit is likely to stick too."
            : "Frequent budget breaches suggest spending controls need work before locking money into markets.",
      },
      {
        id: "fixed",
        title: "Fixed-cost ratio",
        weight: 20,
        points: fixedPts,
        earned: (fixedPts / 100) * 20,
        inputs: `Rent ${formatINR(Math.round(rent))} + bills ${formatINR(billsTotal)} = ${formatINR(Math.round(fixedTotal))} ÷ income ${formatINR(Math.round(incomeNow))} = ${(fixedRatio * 100).toFixed(1)}% (healthy ≤ 30%).`,
        reasoning:
          fixedRatio <= 0.3
            ? "Low fixed costs leave your surplus flexible — market volatility won't squeeze essentials."
            : fixedRatio <= 0.5
              ? "Fixed costs eat a large share of income, shrinking the safe amount to invest."
              : "Most income is committed before the month starts — investing more now adds real risk.",
      },
    ];

    const score = factors.reduce((a, f) => a + f.earned, 0);

    // "Can I invest ₹X more?" — monthly surplus model
    const incomeMonth = sumBy(txns, month, "income");
    const expensesMonth = sumBy(txns, month, "expense");
    const unpaidBills = bills.filter((b) => !b.lastPaidOn || monthKey(b.lastPaidOn) !== month);
    const unpaidBillsTotal = unpaidBills.reduce((a, b) => a + b.amountPaise, 0);
    const surplus = incomeMonth - expensesMonth - unpaidBillsTotal;

    // Portfolio context (Module 2 data, informational — static demo prices)
    const portfolioValue = holdings.reduce(
      (a, h) => a + Math.round(h.qty * (getStock(h.symbol)?.pricePaise ?? 0)),
      0,
    );

    return {
      factors,
      score,
      incomeMonth,
      expensesMonth,
      unpaidBills,
      unpaidBillsTotal,
      surplus,
      portfolioValue,
      holdingCount: holdings.length,
    };
  }, [goals, txns, bills, budgets, holdings, month]);

  const verdict = !model
    ? ""
    : model.score >= 75
      ? "Ready to invest"
      : model.score >= 50
        ? "Almost ready"
        : model.score >= 30
          ? "Build foundations first"
          : "Not yet — protect cash first";

  const verdictReason = !model
    ? ""
    : model.score >= 75
      ? "Your safety net, savings habit and spending discipline can support market investing."
      : model.score >= 50
        ? "One or two factors are holding you back — fix the lowest-scoring card below first."
        : "Your money is stretched thin right now; investing before fixing this risks forced selling.";

  const askPaise = Math.round(Number(amount.replace(/,/g, "")) * 100);
  const askValid = Number.isFinite(askPaise) && askPaise > 0;

  return (
    <PageShell
      title="Investment Readiness"
      subtitle="A 0–100 score built from your Module 1 money data — emergency savings, savings rate, budget discipline and fixed costs. Every point is explained; no black boxes."
      active="Readiness"
    >
      {pending || !model ? (
        <div className="grid gap-5">
          <Skeleton className="h-56 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {/* Score hero */}
          <section className="grid items-center gap-6 rounded-lg border border-border bg-card p-6 shadow-card sm:p-8 lg:grid-cols-[auto_1fr]">
            <ScoreRing score={model.score} />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                Readiness score
              </p>
              <h2 className="mt-1 text-2xl font-black text-primary-dark">{verdict}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {verdictReason}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Portfolio value:{" "}
                  <span className="font-bold text-foreground">
                    {formatINR(model.portfolioValue)}
                  </span>
                  <span className="text-xs"> ({model.holdingCount} holdings)</span>
                </span>
                <span className="text-muted-foreground">
                  This month's surplus:{" "}
                  <span
                    className={cn(
                      "font-bold",
                      model.surplus >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatINR(model.surplus)}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Factor cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {model.factors.map((f) => (
              <article
                key={f.id}
                className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-primary-dark">{f.title}</h3>
                  <span className="shrink-0 rounded-full bg-tint px-2.5 py-1 text-xs font-black text-primary-dark tabular-nums">
                    {f.earned.toFixed(1)} / {f.weight}
                  </span>
                </div>
                <Progress
                  value={f.points}
                  className="mt-3"
                  aria-label={`${f.title}: ${f.points.toFixed(0)} of 100`}
                />
                <p className="mt-3 text-[13px] font-medium leading-5 text-foreground">{f.inputs}</p>
                <p className="mt-1.5 flex gap-1.5 text-[13px] leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f.reasoning}
                </p>
              </article>
            ))}
          </div>

          {/* Can I invest ₹X more? */}
          <section className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-tint">
                <Calculator className="size-4 text-primary" />
              </span>
              <h2 className="text-base font-bold text-primary-dark">
                Can I invest more this month?
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter an amount — FinVerse checks it against this month's surplus from your Module 1
              data: income {formatINR(model.incomeMonth)} − expenses{" "}
              {formatINR(model.expensesMonth)} − unpaid bills {formatINR(model.unpaidBillsTotal)}
              {model.unpaidBills.length > 0 && (
                <span> ({model.unpaidBills.map((b) => b.name).join(", ")})</span>
              )}{" "}
              = <span className="font-bold text-foreground">{formatINR(model.surplus)}</span>{" "}
              surplus.
            </p>
            <form
              className="mt-4 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setAsked(true);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="invest-amount">Extra amount (₹)</Label>
                <Input
                  id="invest-amount"
                  inputMode="decimal"
                  placeholder="5,000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAsked(false);
                  }}
                  className="w-48"
                />
              </div>
              <Button type="submit" disabled={!askValid}>
                Check
              </Button>
            </form>
            {asked && askValid && (
              <div
                className={cn(
                  "mt-4 rounded-md px-4 py-3 text-sm leading-6",
                  askPaise <= model.surplus
                    ? "bg-success-soft text-foreground"
                    : "bg-destructive/10 text-foreground",
                )}
                role="status"
              >
                {model.surplus <= 0 ? (
                  <>
                    <span className="font-bold text-destructive">Not this month.</span> Your surplus
                    is {formatINR(model.surplus)} — income is already fully committed to expenses
                    and bills. Free up cash before adding investments.
                  </>
                ) : askPaise <= model.surplus ? (
                  <>
                    <span className="font-bold text-success">
                      Yes — {formatINR(askPaise)} fits.
                    </span>{" "}
                    It uses {((askPaise / model.surplus) * 100).toFixed(0)}% of your{" "}
                    {formatINR(model.surplus)} surplus, leaving{" "}
                    {formatINR(model.surplus - askPaise)} as buffer for the rest of the month.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-destructive">That stretches too far.</span>{" "}
                    {formatINR(askPaise)} exceeds your {formatINR(model.surplus)} surplus by{" "}
                    {formatINR(askPaise - model.surplus)}. Consider {formatINR(model.surplus)} or
                    less, so bills and essentials stay covered.
                  </>
                )}
              </div>
            )}
          </section>

          <p className="text-xs leading-5 text-muted-foreground">
            Methodology: emergency coverage 35% (6 months of avg expenses = full marks) · savings
            rate 25% (20% = full marks) · budget discipline 20% (% of this month's budgets
            unbreached) · fixed-cost ratio 20% (≤30% = full marks, 60%+ = zero). Scores are
            educational estimates from your recorded data — not financial advice.
          </p>
        </div>
      )}
    </PageShell>
  );
}
