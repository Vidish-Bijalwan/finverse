import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddGoal,
  useAddToGoal,
  useDeleteGoal,
  useGoals,
  useTransactions,
  useUpdateGoal,
} from "@/lib/finance/hooks";
import { formatINR, todayISO } from "@/lib/finance/format";
import type { Goal, Transaction } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { AnimatedProgress } from "@/components/money/AnimatedProgress";
import { ConfirmDeleteDialog } from "@/components/money/ConfirmDeleteDialog";
import { AddFundsDialog, GoalFormDialog, type GoalFormInput } from "@/components/money/GoalDialogs";
import { addMonthsToKey, formatDateLong, monthDiff, monthLabel } from "@/components/money/utils";
import { ErrorState, pressable } from "@/components/fv";

export const Route = createFileRoute("/goals")({
  /** `?add=1` deep-link opens the goal form (dashboard quick action). */
  validateSearch: (search: Record<string, unknown>): { add?: "1" } => ({
    ...(search["add"] === "1" ? { add: "1" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Goals — FinVerse AI" },
      { name: "description", content: "Set savings goals, add funds, and track your pace." },
    ],
  }),
  component: GoalsPage,
});

interface Projection {
  kind: "complete" | "onTrack" | "behind" | "needsPlan";
  completionMonthLabel?: string;
  neededPerMonthPaise?: number;
  deadlinePassed: boolean;
}

/**
 * Project completion from the average monthly allocation to this goal over the
 * last 3 calendar months (transfer transactions linked by goalId).
 */
function projectGoal(txns: Transaction[], goal: Goal, today: string): Projection {
  const remaining = goal.targetPaise - goal.savedPaise;
  const curMonthKey = today.slice(0, 7);
  const deadlineKey = goal.deadline.slice(0, 7);
  const monthsLeft = monthDiff(curMonthKey, deadlineKey);

  if (remaining <= 0) return { kind: "complete", deadlinePassed: false };

  const windowKeys = [0, 1, 2].map((i) => addMonthsToKey(curMonthKey, -i));
  let total = 0;
  for (const t of txns) {
    if (t.type !== "transfer" || t.goalId !== goal.id) continue;
    if (windowKeys.includes(t.dateISO.slice(0, 7))) total += t.amountPaise;
  }
  const avg = Math.round(total / 3);

  if (avg > 0) {
    const monthsToGo = Math.ceil(remaining / avg);
    const completionKey = addMonthsToKey(curMonthKey, monthsToGo);
    if (monthDiff(curMonthKey, completionKey) <= monthsLeft) {
      return {
        kind: "onTrack",
        completionMonthLabel: monthLabel(completionKey),
        deadlinePassed: monthsLeft < 0,
      };
    }
    const needed = Math.ceil(remaining / Math.max(1, monthsLeft));
    return {
      kind: "behind",
      neededPerMonthPaise: Math.max(0, needed - avg),
      deadlinePassed: monthsLeft < 0,
    };
  }
  const needed = monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining;
  return {
    kind: "needsPlan",
    neededPerMonthPaise: needed,
    deadlinePassed: monthsLeft < 0,
  };
}

function GoalCard({
  goal,
  today,
  txns,
  onAddFunds,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  today: string;
  txns: Transaction[];
  onAddFunds: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct =
    goal.targetPaise > 0
      ? Math.min(100, Math.round((goal.savedPaise / goal.targetPaise) * 100))
      : 0;
  const projection = useMemo(() => projectGoal(txns, goal, today), [txns, goal, today]);

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: goal.color }} aria-hidden />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{goal.name}</p>
            <p className="text-xs text-muted-foreground">
              Deadline {formatDateLong(goal.deadline)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label={`Edit ${goal.name}`}
              className={pressable}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label={`Delete ${goal.name}`}
              className={`text-destructive hover:text-destructive ${pressable}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold tabular-nums">{formatINR(goal.savedPaise)}</span>
            <span className="text-muted-foreground tabular-nums">
              of {formatINR(goal.targetPaise)}
            </span>
          </div>
          <AnimatedProgress value={pct} />
          <p className="text-xs text-muted-foreground tabular-nums">{pct}% saved</p>
        </div>

        <ProjectionLine goal={goal} projection={projection} />

        <Button
          className={`w-full ${pressable}`}
          onClick={onAddFunds}
          disabled={goal.savedPaise >= goal.targetPaise}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Add funds
        </Button>
      </CardContent>
    </Card>
  );
}

function ProjectionLine({ goal, projection }: { goal: Goal; projection: Projection }) {
  const remaining = goal.targetPaise - goal.savedPaise;

  if (projection.kind === "complete") {
    return (
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        Goal reached — well done.
      </p>
    );
  }
  if (projection.kind === "onTrack") {
    return (
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        On track — by {projection.completionMonthLabel}
      </p>
    );
  }
  if (projection.deadlinePassed) {
    return (
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Deadline passed — {formatINR(remaining)} still to go.
      </p>
    );
  }
  if (projection.kind === "behind") {
    return (
      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
        Needs {formatINR(projection.neededPerMonthPaise ?? 0)}/mo more to hit{" "}
        {formatDateLong(goal.deadline)}
      </p>
    );
  }
  return (
    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
      Save {formatINR(projection.neededPerMonthPaise ?? 0)}/mo to reach by{" "}
      {formatDateLong(goal.deadline)}
    </p>
  );
}

function GoalsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [today] = useState(() => todayISO());
  const {
    data: goals = [],
    isLoading: goalsLoading,
    isError: goalsError,
    refetch: refetchGoals,
  } = useGoals();
  const {
    data: txns = [],
    isLoading: txnsLoading,
    isError: txnsError,
    refetch: refetchTxns,
  } = useTransactions();
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const addToGoal = useAddToGoal();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [fundsFor, setFundsFor] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);

  // `?add=1` deep-link (dashboard "Add goal" quick action): open the real
  // goal form once, then drop the param so back/forward stays clean.
  const addHandled = useRef(false);
  const addParam = search["add"];
  useEffect(() => {
    if (addParam === "1" && !addHandled.current) {
      addHandled.current = true;
      setEditing(null);
      setFormOpen(true);
      void navigate({ to: "/goals", search: {}, replace: true });
    }
  }, [addParam, navigate]);

  const loading = goalsLoading || txnsLoading;
  const loadFailed = goalsError || txnsError;

  const handleSave = (input: GoalFormInput) => {
    const isEdit = Boolean(editing);
    const onDone = () => {
      setFormOpen(false);
      setEditing(null);
    };
    if (editing) {
      updateGoal.mutate(
        { id: editing.id, patch: input },
        {
          onSuccess: () => {
            onDone();
            toast.success("Goal updated");
          },
          onError: () => toast.error("Couldn't save — try again."),
        },
      );
    } else {
      addGoal.mutate(input, {
        onSuccess: () => {
          onDone();
          toast.success(`Goal created · ${formatINR(input.targetPaise)} target`);
        },
        onError: () => toast.error("Couldn't save — try again."),
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings goals</h1>
          <p className="text-sm text-muted-foreground">
            Set targets, add funds, and watch your pace.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className={pressable}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          New goal
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading goals">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : loadFailed ? (
        <ErrorState
          title="Couldn't load your goals"
          body="Your goals and contributions failed to load. Check your connection and try again."
          onRetry={() => {
            void refetchGoals();
            void refetchTxns();
          }}
        />
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-tint">
              <Target className="size-7 text-primary" />
            </span>
            <p className="text-lg font-medium">No goals yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create your first savings goal — an emergency fund, a gadget, a trip — and FinVerse
              will project whether your pace gets you there.
            </p>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className={pressable}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Create your first goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              today={today}
              txns={txns}
              onAddFunds={() => setFundsFor(goal)}
              onEdit={() => {
                setEditing(goal);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(goal)}
            />
          ))}
        </div>
      )}

      <GoalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        today={today}
        onSave={handleSave}
        saving={addGoal.isPending || updateGoal.isPending}
      />
      <AddFundsDialog
        open={fundsFor !== null}
        onOpenChange={(open) => !open && setFundsFor(null)}
        goal={fundsFor}
        onSave={(input) =>
          addToGoal.mutate(input, {
            onSuccess: () => {
              toast.success(`Added ${formatINR(input.amountPaise)} to ${fundsFor?.name ?? "goal"}`);
              setFundsFor(null);
            },
            onError: () => toast.error("Couldn't add funds — try again."),
          })
        }
        saving={addToGoal.isPending}
      />
      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete goal?"
        description={
          deleting
            ? `"${deleting.name}" and its ${formatINR(deleting.savedPaise)} saved progress will be removed. Past fund transactions are kept.`
            : ""
        }
        onConfirm={() =>
          deleting &&
          deleteGoal.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null);
              toast.success("Goal deleted");
            },
            onError: () => toast.error("Couldn't delete — try again."),
          })
        }
        pending={deleteGoal.isPending}
      />
    </div>
  );
}
