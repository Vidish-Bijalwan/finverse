import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import { InsightCard } from "@/components/ai/InsightCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildInsights } from "@/lib/ai/engine";
import { monthLabel } from "@/lib/finance/format";
import { seedIfEmpty } from "@/lib/finance/store";
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

function InsightsPage() {
  const [month] = useMonth();
  const dbQuery = useQuery({
    queryKey: ["finverse", "ai-db"],
    queryFn: () => seedIfEmpty(),
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
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Insights for {monthLabel(month)}
          </h1>
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
