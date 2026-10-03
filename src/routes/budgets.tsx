import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgets, useMonth, useSetBudget, useTransactions } from "@/lib/finance/hooks";
import { categoryById } from "@/lib/finance/categories";
import { formatINR } from "@/lib/finance/format";
import type { Budget } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { AnimatedProgress } from "@/components/money/AnimatedProgress";
import { BudgetDialog } from "@/components/money/BudgetDialog";
import { addMonthsToKey, monthLabel } from "@/components/money/utils";
import { pressable } from "@/components/fv";
import { isInvestmentOrder } from "@/lib/finance/investments";

export const Route = createFileRoute("/budgets")({
  head: () => ({
    meta: [
      { title: "Budgets — FinVerse AI" },
      { name: "description", content: "Set monthly spending limits per category and track them." },
    ],
  }),
  component: BudgetsPage,
});

type BudgetState = "ok" | "warning" | "over";

function budgetState(spentPaise: number, limitPaise: number): BudgetState {
  const pct = limitPaise > 0 ? (spentPaise / limitPaise) * 100 : 0;
  if (pct > 100) return "over";
  if (pct >= 80) return "warning";
  return "ok";
}

const indicatorClass: Record<BudgetState, string> = {
  ok: "",
  warning: "[&>div]:bg-amber-500",
  over: "[&>div]:bg-red-500",
};

const stateLabel: Record<BudgetState, string> = {
  ok: "On track",
  warning: "Near limit",
  over: "Over budget",
};

const stateTextClass: Record<BudgetState, string> = {
  ok: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  over: "text-red-600 dark:text-red-400",
};

function BudgetCard({
  budget,
  spentPaise,
  onEdit,
}: {
  budget: Budget;
  spentPaise: number;
  onEdit: () => void;
}) {
  const category = categoryById(budget.categoryId);
  const state = budgetState(spentPaise, budget.limitPaise);
  const pct = budget.limitPaise > 0 ? Math.min(100, (spentPaise / budget.limitPaise) * 100) : 0;
  const remaining = budget.limitPaise - spentPaise;
  const Icon = category?.icon ?? Plus;

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${category?.color ?? "#64748B"}1A` }}
            aria-hidden
          >
            <Icon className="h-5 w-5" style={{ color: category?.color ?? "#64748B" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{category?.label ?? budget.categoryId}</p>
            <p className={cn("text-xs font-medium", stateTextClass[state])}>
              {state === "over"
                ? `Over by ${formatINR(-remaining)}`
                : state === "warning"
                  ? "Near limit"
                  : "On track"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit ${category?.label ?? "budget"}`}
            className={pressable}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <AnimatedProgress value={pct} className={cn("h-2.5", indicatorClass[state])} />
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">{formatINR(spentPaise)}</span>
          <span className="text-muted-foreground">of {formatINR(budget.limitPaise)}</span>
        </div>
        <p className={cn("text-xs", stateTextClass[state])}>
          {remaining >= 0 ? `${formatINR(remaining)} remaining` : `${formatINR(-remaining)} over`}
          {" · "}
          {stateLabel[state]}
        </p>
      </CardContent>
    </Card>
  );
}

function BudgetsPage() {
  const [month, setMonth] = useMonth();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(month);
  const { data: txns = [], isLoading: txnsLoading } = useTransactions(month);
  const setBudget = useSetBudget();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string | undefined>();

  const loading = budgetsLoading || txnsLoading;

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of txns) {
      // Legacy expense/income-shaped brokerage rows are transfers, not spend.
      if (t.type !== "expense" || isInvestmentOrder(t)) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amountPaise);
    }
    return map;
  }, [txns]);

  const unbudgeted = useMemo(() => {
    const budgeted = new Set(budgets.map((b) => b.categoryId));
    return [...spentByCategory.entries()]
      .filter(([categoryId, spent]) => !budgeted.has(categoryId) && spent > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [spentByCategory, budgets]);

  const totalSpent = [...spentByCategory.values()].reduce((a, b) => a + b, 0);
  const totalLimit = budgets.reduce((a, b) => a + b.limitPaise, 0);

  const shiftMonth = (delta: number) => setMonth((m) => addMonthsToKey(m, delta));

  const openNew = (categoryId?: string) => {
    setEditing(null);
    setPresetCategoryId(categoryId);
    setDialogOpen(true);
  };

  const handleSave = (input: { categoryId: string; limitPaise: number }) => {
    setBudget.mutate(
      { ...input, month },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setEditing(null);
          setPresetCategoryId(undefined);
          toast.success(
            `Budget set · ${categoryById(input.categoryId)?.label ?? "category"} ${formatINR(input.limitPaise)}`,
          );
        },
        onError: () => toast.error("Couldn't save — try again."),
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">Monthly spending limits per category.</p>
        </div>
        <Button onClick={() => openNew()} className={pressable}>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Set budget
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className={pressable}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="w-32 text-center font-medium tabular-nums" aria-live="polite">
          {monthLabel(month)}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className={pressable}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading budgets">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : budgets.length === 0 && unbudgeted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-tint">
              <WalletCards className="size-7 text-primary" />
            </span>
            <p className="text-lg font-medium">No budgets for {monthLabel(month)}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pick a category and a monthly limit to start tracking spending against it.
            </p>
            <Button onClick={() => openNew()} className={pressable}>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Set your first budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {budgets.length > 0 && (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center justify-between p-4">
                  <p className="text-sm font-medium">Total this month</p>
                  <p className="text-sm">
                    <span className="font-semibold">{formatINR(totalSpent)}</span>
                    <span className="text-muted-foreground"> of {formatINR(totalLimit)}</span>
                  </p>
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2">
                {budgets.map((b) => (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    spentPaise={spentByCategory.get(b.categoryId) ?? 0}
                    onEdit={() => {
                      setEditing(b);
                      setPresetCategoryId(undefined);
                      setDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {unbudgeted.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Spending without a budget</p>
              <div className="space-y-2">
                {unbudgeted.map(([categoryId, spent]) => {
                  const category = categoryById(categoryId);
                  const Icon = category?.icon ?? Plus;
                  return (
                    <Card key={categoryId} className="border-dashed">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${category?.color ?? "#64748B"}1A` }}
                          aria-hidden
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{ color: category?.color ?? "#64748B" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {category?.label ?? categoryId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Spent {formatINR(spent)} in {monthLabel(month)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openNew(categoryId)}
                          className={pressable}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
                          Set budget
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        month={month}
        existing={editing}
        presetCategoryId={presetCategoryId}
        onSave={handleSave}
        saving={setBudget.isPending}
      />
    </div>
  );
}
