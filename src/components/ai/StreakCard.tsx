import { useMemo, useState } from "react";
import { Flame, Pencil } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { STREAK_MILESTONES, loadStreakState, setDailyTargetPaise } from "@/lib/ai/engine";
import { formatINR } from "@/lib/finance/format";
import type { FinanceDB } from "@/lib/finance/types";

/**
 * Savings streak card: consecutive days under the daily spend target.
 * Shows the live streak, all-time best, milestone badges (7/14/30 days),
 * progress to the next milestone, and lets the user edit the daily target.
 * Streak state persists in localStorage ("finverse:streaks:v1").
 */
export function StreakCard({ db }: { db: FinanceDB }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [targetInput, setTargetInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const streak = useMemo(() => {
    // Read refreshKey so the streak recomputes after a target edit.
    void refreshKey;
    return loadStreakState(db);
  }, [db, refreshKey]);

  const nextMilestone = STREAK_MILESTONES.find((n) => streak.currentDays < n) ?? null;
  const prevMilestone = [...STREAK_MILESTONES].reverse().find((n) => streak.currentDays >= n) ?? 0;
  const progressPct =
    nextMilestone === null
      ? 100
      : Math.round(((streak.currentDays - prevMilestone) / (nextMilestone - prevMilestone)) * 100);

  const openDialog = () => {
    setTargetInput(String(Math.round(streak.targetPaisePerDay) / 100));
    setInputError(null);
    setDialogOpen(true);
  };

  const saveTarget = () => {
    const rupees = Number(targetInput);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      setInputError("Enter a daily target above ₹0.");
      return;
    }
    try {
      setDailyTargetPaise(Math.round(rupees * 100));
    } catch {
      setInputError("That amount is not valid — try a whole rupee figure.");
      return;
    }
    setDialogOpen(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame
              className={cn(
                "size-5",
                streak.currentDays > 0 ? "text-orange-500" : "text-muted-foreground",
              )}
              aria-hidden
            />
            Savings streak
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" onClick={openDialog} className="h-8 gap-1 text-xs">
                <Pencil className="size-3.5" aria-hidden />
                {formatINR(streak.targetPaisePerDay)}/day
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daily spend target</DialogTitle>
                <DialogDescription>
                  A streak day is any day you spend at or under this target. Days with no spending
                  count too.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-2">
                <Label htmlFor="streak-target">Target per day (₹)</Label>
                <Input
                  id="streak-target"
                  inputMode="decimal"
                  value={targetInput}
                  onChange={(e) => {
                    setTargetInput(e.target.value);
                    setInputError(null);
                  }}
                  placeholder="500"
                />
                {inputError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{inputError}</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={saveTarget}>Save target</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-4xl font-black tabular-nums">{streak.currentDays}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {streak.currentDays === 1 ? "day" : "days"} under target in a row
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums">{streak.bestDays}</p>
            <p className="text-xs text-muted-foreground">best ever</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {nextMilestone === null
                ? "All milestones smashed!"
                : `${streak.currentDays} of ${nextMilestone} days to the next badge`}
            </span>
            <span className="font-semibold">{progressPct}%</span>
          </div>
          <Progress
            value={progressPct}
            className="mt-1.5 h-2"
            aria-label="Progress to next streak milestone"
          />
        </div>

        <div className="mt-4 flex gap-2">
          {STREAK_MILESTONES.map((n) => {
            const earned = streak.badges.includes(`streak-${n}`);
            return (
              <span
                key={n}
                title={earned ? `${n}-day badge earned` : `${n}-day badge — keep the streak going`}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-bold",
                  earned
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "border-border bg-muted/50 text-muted-foreground",
                )}
              >
                <Flame className="size-3.5" aria-hidden />
                {n} days
              </span>
            );
          })}
        </div>

        {streak.currentDays === 0 && (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            No active streak — spend under {formatINR(streak.targetPaisePerDay)} today to start one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
