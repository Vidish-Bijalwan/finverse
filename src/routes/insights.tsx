import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { InsightCard } from "@/components/ai/InsightCard";
import { CategoryMoM } from "@/components/ai/CategoryMoM";
import { SpendingHeatmap } from "@/components/ai/SpendingHeatmap";
import { StreakCard } from "@/components/ai/StreakCard";
import { WeeklyDigest } from "@/components/ai/WeeklyDigest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildInsights, previousMonth } from "@/lib/ai/engine";
import { loadFinanceDB } from "@/lib/finance/db";
import { monthKey, monthLabel } from "@/lib/finance/format";
import { useMonth } from "@/lib/finance/hooks";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — FinVerse AI" },
      {
        name: "description",
        content: "Explainable insights about your spending, budgets, bills, goals and savings.",
      },
    ],
  }),
  component: InsightsPage,
});

function shiftMonthKey(key: string, offset: number): string {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function InsightsPage() {
  const [month, setMonth] = useMonth();
  const currentMonth = monthKey(new Date());
  const isCurrentMonth = month === currentMonth;

  const dbQuery = useQuery({
    queryKey: ["finverse", "db"],
    queryFn: loadFinanceDB,
  });

  const insights = useMemo(
    () => (dbQuery.data ? buildInsights(dbQuery.data, month) : []),
    [dbQuery.data, month],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mt-2">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles className="size-4" /> FINVERSE AI
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Insights for {monthLabel(month)}
            </h1>
            <div
              className="flex shrink-0 items-center gap-1"
              role="group"
              aria-label="Change month"
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setMonth(previousMonth(month))}
                aria-label={`Previous month (${monthLabel(previousMonth(month))})`}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setMonth(shiftMonthKey(month, 1))}
                disabled={isCurrentMonth}
                aria-label={`Next month (${monthLabel(shiftMonthKey(month, 1))})`}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Computed from your real data by simple, transparent rules — expand any card to see
            exactly why it appeared.
          </p>
        </header>

        <div className="mt-6 grid gap-4">
          {dbQuery.isPending && (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </>
          )}

          {dbQuery.isSuccess && dbQuery.data && (
            <>
              {isCurrentMonth && <WeeklyDigest db={dbQuery.data} />}
              <StreakCard db={dbQuery.data} />
              <SpendingHeatmap db={dbQuery.data} month={month} />
              <CategoryMoM db={dbQuery.data} month={month} />
            </>
          )}

          {dbQuery.isSuccess && insights.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10">
                  <Sparkles className="size-6 text-emerald-600 dark:text-emerald-400" />
                </span>
                <h2 className="mt-4 text-lg font-bold">
                  All clear — nothing needs your attention this month.
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  FinVerse AI checked your spending trends, budget usage, upcoming bills, goal pace
                  and savings rate. Everything looks healthy.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/expenses">Review transactions</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
