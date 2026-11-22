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
import { genHistory } from "@/lib/market/history";
import { useLiveHistories } from "@/lib/market/live-hooks";
import {
  annualizedVolatility,
  scoreReadiness,
  type ReadinessFactor as LibFactor,
  type ReadinessResult,
} from "@/lib/calc/readiness";
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
  available: boolean;
}

/** "2026-10" minus n months -> "YYYY-MM". */
function shiftMonth(key: string, n: number): string {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
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

/** Trading days of history used for the volatility factor (~3 months). */
const VOLATILITY_HISTORY_DAYS = 63;

/** Plain-language reasoning for each factor when it is measured. */
function reasoningFor(factor: LibFactor): string {
  switch (factor.id) {
    case "emergency": {
      const months = factor.months ?? 0;
      return months >= 6
        ? "A full 6-month cushion means a market dip never forces a distress sale."
        : months >= 3
          ? "Partial cushion — investing is reasonable, but keep topping up the fund first."
          : "Thin safety net — an emergency could force you to sell investments at the worst time.";
    }
    case "savings": {
      const rate = factor.savingsRatePercent ?? 0;
      return rate >= 20
        ? "You consistently keep a fifth of income — that surplus is what investing compounds."
        : rate >= 10
          ? "Positive but below the 20% investing threshold — trim one spending category to unlock more."
          : "Near-zero surplus leaves nothing to invest without cutting spending or raising income first.";
    }
    case "debt": {
      const ratio = factor.debtToIncomeRatio ?? 0;
      return ratio === 0
        ? "No debt means every rupee of surplus is yours to invest."
        : ratio < 0.5
          ? "Debt is manageable, but payments compete with investing every month."
          : "Heavy debt — clearing it beats investing, because interest outruns market returns.";
    }
    case "discipline":
      return factor.pointsPercent >= 80
        ? "You stick to planned spending, so an investing habit is likely to stick too."
        : "Frequent budget breaches suggest spending controls need work before locking money into markets.";
    case "fixed": {
      const ratio = (factor.fixedCostRatioPercent ?? 0) / 100;
      return ratio <= 0.3
        ? "Low fixed costs leave your surplus flexible — market volatility won't squeeze essentials."
        : ratio <= 0.5
          ? "Fixed costs eat a large share of income, shrinking the safe amount to invest."
          : "Most income is committed before the month starts — investing more now adds real risk.";
    }
    case "concentration": {
      const weight = factor.largestHoldingWeightPercent ?? 0;
      return weight <= 20
        ? "No single stock can sink your portfolio."
        : weight <= 50
          ? "One holding dominates the portfolio — a bad quarter for it is a bad quarter for you."
          : "A single holding is most of your portfolio — spreading it out would cut the risk sharply.";
    }
    case "volatility": {
      const vol = factor.volatilityPercent ?? 0;
      return vol <= 15
        ? "Your portfolio's swings are mild — it is unlikely to drop sharply."
        : vol <= 35
          ? "Moderate swings — expect noticeable ups and downs, and invest only money you won't need soon."
          : "High volatility means the portfolio can drop sharply — size positions so a dip doesn't force a sale.";
    }
    default:
      return "";
  }
}

/** What would make each unmeasured factor measurable. */
const UNAVAILABLE_HINT: Record<string, string> = {
  emergency: "Add a goal named “Emergency fund” so FinVerse can measure your safety net.",
  savings: "Record income for the last 3 months to measure your savings rate.",
  debt: "FinVerse doesn't track loans yet, so debt can't be measured — it isn't counted against you.",
  discipline: "Set a budget for this month to measure discipline.",
  fixed: "Record income to measure your fixed-cost ratio.",
  concentration: "Add holdings to measure concentration.",
  volatility: "Add holdings with price history to measure volatility.",
};

function ReadinessPage() {
  const [month] = useMonth();
  const { data: goals, isPending: goalsPending } = useGoals();
  const { data: txns, isPending: txnsPending } = useTransactions();
  const { data: bills, isPending: billsPending } = useBills();
  const { data: budgets, isPending: budgetsPending } = useBudgets(month);
  const { data: holdings, isPending: holdingsPending } = useHoldings();

  // Live histories (Yahoo via the market-data Edge Function) for the
  // volatility factor — per-holding fallback to simulated history inside
  // the model memo below. The scorer itself is untouched: only its
  // volatility INPUT changes source.
  const liveHistories = useLiveHistories(
    (holdings ?? []).map((h) => h.symbol),
    "3M",
  );

  const [amount, setAmount] = useState("");
  const [asked, setAsked] = useState(false);

  const pending = goalsPending || txnsPending || billsPending || budgetsPending || holdingsPending;

  const model = useMemo(() => {
    if (!goals || !txns || !bills || !budgets || !holdings) return null;

    const last3 = [0, 1, 2].map((n) => shiftMonth(month, n + 1)); // 3 completed months
    const expenses3 = last3.map((m) => sumBy(txns, m, "expense"));
    const income3 = last3.map((m) => sumBy(txns, m, "income"));
    const avgMonthlyExpenses = expenses3.reduce((a, b) => a + b, 0) / 3;
    const avgMonthlyIncome = income3.reduce((a, b) => a + b, 0) / 3;

    // Emergency fund: months covered, or null when unmeasurable (no
    // emergency goal, or no expenses to measure against).
    const emergency = goals.find((g) => g.name.toLowerCase().includes("emergency"));
    const emergencyMonths =
      emergency && avgMonthlyExpenses > 0 ? emergency.savedPaise / avgMonthlyExpenses : null;

    // Savings rate: only months with income can define a rate; months
    // without income are excluded, not scored as zero.
    const measuredRates = last3
      .map((_, i) => {
        const income = income3[i] ?? 0;
        const expense = expenses3[i] ?? 0;
        return income > 0 ? ((income - expense) / income) * 100 : null;
      })
      .filter((r): r is number => r !== null);
    const avgRate =
      measuredRates.length > 0
        ? measuredRates.reduce((a, b) => a + b, 0) / measuredRates.length
        : null;

    // Budget discipline: null when no budgets are set (unmeasurable, not zero).
    const spentByCat = new Map<string, number>();
    txns
      .filter((t) => t.type === "expense" && !isInvestmentOrder(t) && monthKey(t.dateISO) === month)
      .forEach((t) =>
        spentByCat.set(t.category, (spentByCat.get(t.category) ?? 0) + t.amountPaise),
      );
    const unbreached = budgets.filter(
      (b) => (spentByCat.get(b.categoryId) ?? 0) <= b.limitPaise,
    ).length;
    const discipline = budgets.length > 0 ? { unbreached, total: budgets.length } : null;

    // Fixed-cost ratio: null when there is no income to measure against.
    let rent = sumCategory(txns, month, "rent");
    if (rent === 0) rent = last3.reduce((a, m) => a + sumCategory(txns, m, "rent"), 0) / 3; // not paid yet this month
    const billsTotal = bills.reduce((a, b) => a + b.amountPaise, 0);
    let incomeNow = sumBy(txns, month, "income");
    if (incomeNow === 0) incomeNow = income3.reduce((a, b) => a + b, 0) / 3;
    const fixedTotal = rent + billsTotal;
    const fixedCostRatio = incomeNow > 0 ? fixedTotal / incomeNow : null;

    // Priced holdings only — unpriced holdings cannot be valued.
    const pricedHoldings = holdings
      .map((h) => ({
        symbol: h.symbol,
        currentValuePaise: Math.round(h.qty * (getStock(h.symbol)?.pricePaise ?? 0)),
      }))
      .filter((h) => h.currentValuePaise > 0);

    // Volatility per holding from live price history when available,
    // simulated history otherwise (see src/lib/market/history.ts).
    // Holdings with too little history are excluded instead of failing
    // the factor.
    const holdingVolatilities: Array<{
      symbol: string;
      volatility: number;
      currentValuePaise: number;
    }> = [];
    let volatilityLiveCount = 0;
    let volatilityMeasuredCount = 0;
    for (const holding of pricedHoldings) {
      const history =
        liveHistories.get(holding.symbol) ?? genHistory(holding.symbol, VOLATILITY_HISTORY_DAYS);
      const closes = history.map((p) => p.closePaise);
      const volatility = annualizedVolatility(closes);
      if (volatility !== null) {
        volatilityMeasuredCount += 1;
        if (liveHistories.has(holding.symbol)) volatilityLiveCount += 1;
        holdingVolatilities.push({ ...holding, volatility });
      }
    }
    const volatilitySource: "live" | "mixed" | "simulated" =
      volatilityMeasuredCount > 0 && volatilityLiveCount === volatilityMeasuredCount
        ? "live"
        : volatilityLiveCount > 0
          ? "mixed"
          : "simulated";

    // Debt-to-income: this repo records no loans or outstanding debt, so
    // the factor is always unmeasured for now — never invented, never zero.
    const assessment: ReadinessResult = scoreReadiness({
      emergencyMonths,
      savingsRate: avgRate === null ? null : avgRate / 100,
      totalDebtPaise: null,
      annualIncomePaise: Math.round(avgMonthlyIncome * 12),
      discipline,
      fixedCostRatio,
      holdings: pricedHoldings,
      holdingVolatilities,
    });

    // Rich inputs lines for the four original factors (raw numbers the
    // scorer aggregates away); the three new factors use the scorer's
    // detail line, which already carries their numbers.
    const inputsFor = (factor: LibFactor): string => {
      if (!factor.available) return factor.detail;
      switch (factor.id) {
        case "emergency":
          return emergency && emergencyMonths !== null
            ? `Saved ${formatINR(emergency.savedPaise)} ÷ avg monthly expenses ${formatINR(Math.round(avgMonthlyExpenses))} = ${emergencyMonths.toFixed(1)} months covered (target 6).`
            : factor.detail;
        case "savings":
          return avgRate !== null
            ? `Monthly rates ${measuredRates.map((r) => `${r.toFixed(0)}%`).join(" · ")} → avg ${avgRate.toFixed(1)}% (target 20%). Income and expenses from your recorded transactions.`
            : factor.detail;
        case "discipline":
          return budgets.length > 0
            ? `${unbreached} of ${budgets.length} budgets unbreached in ${month} (${((unbreached / budgets.length) * 100).toFixed(0)}%).`
            : factor.detail;
        case "fixed":
          return incomeNow > 0
            ? `Rent ${formatINR(Math.round(rent))} + bills ${formatINR(billsTotal)} = ${formatINR(Math.round(fixedTotal))} ÷ income ${formatINR(Math.round(incomeNow))} = ${((fixedTotal / incomeNow) * 100).toFixed(1)}% (healthy ≤ 30%).`
            : factor.detail;
        case "volatility": {
          // The scorer's detail says "simulated price history" — it cannot
          // know the route resolved live history for the input. Override
          // the suffix honestly; if the scorer's wording ever changes, the
          // check fails and the detail stays as the scorer wrote it
          // (under-claiming liveness, never over-claiming it).
          const simulatedSuffix = "Computed from simulated price history.";
          if (!factor.detail.endsWith(simulatedSuffix)) return factor.detail;
          const liveSuffix =
            volatilitySource === "live"
              ? "Computed from live price history (Yahoo Finance)."
              : volatilitySource === "mixed"
                ? "Computed from live price history (Yahoo Finance) where available, simulated otherwise."
                : simulatedSuffix;
          return factor.detail.slice(0, -simulatedSuffix.length) + liveSuffix;
        }
        default:
          return factor.detail;
      }
    };

    const factors: Factor[] = assessment.available
      ? assessment.factors.map((f) => ({
          id: f.id,
          title: f.name,
          weight: f.maxPoints,
          points: f.pointsPercent,
          earned: f.points,
          inputs: inputsFor(f),
          reasoning: f.available ? reasoningFor(f) : (UNAVAILABLE_HINT[f.id] ?? f.detail),
          available: f.available,
        }))
      : [];

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
      assessment,
      factors,
      incomeMonth,
      expensesMonth,
      unpaidBills,
      unpaidBillsTotal,
      surplus,
      portfolioValue,
      holdingCount: holdings.length,
      volatilitySource,
    };
  }, [goals, txns, bills, budgets, holdings, month, liveHistories]);

  const verdict = model?.assessment.available === true ? model.assessment.band : "";

  const verdictReason =
    model?.assessment.available !== true
      ? ""
      : verdict === "Ready to invest"
        ? "Your safety net, savings habit and spending discipline can support market investing."
        : verdict === "Almost ready"
          ? "One or two factors are holding you back — fix the lowest-scoring card below first."
          : "Your money is stretched thin right now; investing before fixing this risks forced selling.";

  const askPaise = Math.round(Number(amount.replace(/,/g, "")) * 100);
  const askValid = Number.isFinite(askPaise) && askPaise > 0;

  return (
    <PageShell
      title="Investment Readiness"
      subtitle="A 0–100 score built from your money data — emergency savings, savings rate, debt, budget discipline, fixed costs, portfolio concentration and volatility. Every point is explained; factors with no data are left out, never scored zero."
      active="Readiness"
    >
      {pending || !model ? (
        <div className="grid gap-5">
          <Skeleton className="h-56 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {/* Score hero */}
          {model.assessment.available ? (
            <section className="grid items-center gap-6 rounded-lg border border-border bg-card p-6 shadow-card sm:p-8 lg:grid-cols-[auto_1fr]">
              <ScoreRing score={model.assessment.score} />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary">
                  Readiness score
                </p>
                <h2 className="mt-1 text-2xl font-black text-primary-dark">{verdict}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {verdictReason}
                </p>
                {model.assessment.maxScore < 100 && (
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Based on {model.assessment.maxScore} of 100 points —{" "}
                    {model.assessment.unavailableFactors.join(", ")} not measured yet, so the score
                    is rescaled over the rest.
                  </p>
                )}
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
          ) : (
            <section className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                Readiness score
              </p>
              <h2 className="mt-1 text-2xl font-black text-primary-dark">Not enough data yet</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {model.assessment.reason}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Nothing is measured yet: {model.assessment.missing.join(", ")}. Add income, an
                emergency-fund goal, budgets, or holdings and the score will appear — a missing
                factor is never counted as zero.
              </p>
            </section>
          )}

          {/* Factor cards */}
          {model.assessment.available && (
            <div className="grid gap-4 sm:grid-cols-2">
              {model.factors.map((f) => (
                <article
                  key={f.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-primary-dark">{f.title}</h3>
                    {f.available ? (
                      <span className="shrink-0 rounded-full bg-tint px-2.5 py-1 text-xs font-black text-primary-dark tabular-nums">
                        {f.earned.toFixed(1)} / {f.weight}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">
                        Not measured
                      </span>
                    )}
                  </div>
                  <Progress
                    value={f.points}
                    className="mt-3"
                    aria-label={
                      f.available
                        ? `${f.title}: ${f.points.toFixed(0)} of 100`
                        : `${f.title}: not measured`
                    }
                  />
                  <p className="mt-3 text-[13px] font-medium leading-5 text-foreground">
                    {f.inputs}
                  </p>
                  <p className="mt-1.5 flex gap-1.5 text-[13px] leading-5 text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f.reasoning}
                  </p>
                </article>
              ))}
            </div>
          )}

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
            Methodology: emergency coverage 20% (6 months of avg expenses = full marks) · savings
            rate 20% (20% = full marks) · debt-to-income 15% (no debt = full marks) · budget
            discipline 10% (% of this month's budgets unbreached) · fixed-cost ratio 10% (≤30% =
            full marks, 60%+ = zero) · portfolio concentration 15% (largest holding ≤20% = full
            marks) · portfolio volatility 10% (≤15% = full marks, 60%+ = zero). Factors with no data
            are left out and the score rescales over the rest — never counted as zero.{" "}
            {model?.volatilitySource === "live"
              ? "Volatility is computed from live price history (Yahoo Finance)."
              : model?.volatilitySource === "mixed"
                ? "Volatility is computed from live price history (Yahoo Finance) where available, simulated otherwise."
                : "Volatility is computed from simulated price history."}{" "}
            Scores are educational estimates from your recorded data — not financial advice.
          </p>
        </div>
      )}
    </PageShell>
  );
}
