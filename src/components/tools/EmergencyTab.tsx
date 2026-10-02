import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CalcField } from "./CalcField";
import { ResultRow, ResultStat } from "./Stat";
import { calcEmergencyFund, validateEmergency, type EmergencyInput } from "@/lib/calc/emergency";
import { formatINR, monthKey, todayISO } from "@/lib/finance/format";
import { useGoals, useTransactions } from "@/lib/finance/hooks";

const toPaise = (rupees: number) => Math.round(rupees * 100);

/** Average monthly expenses (rupees) from transaction history. */
function avgMonthlyExpenses(
  txns: { type: string; amountPaise: number; dateISO: string }[],
): number {
  const byMonth = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    const key = t.dateISO.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + t.amountPaise);
  }
  if (byMonth.size === 0) return 0;
  const total = [...byMonth.values()].reduce((s, v) => s + v, 0);
  return total / byMonth.size / 100;
}

export function EmergencyTab() {
  const { data: transactions = [], isLoading: txnsLoading } = useTransactions();
  const { data: goals = [], isLoading: goalsLoading } = useGoals();

  const loading = txnsLoading || goalsLoading;

  const detectedAvg = useMemo(() => avgMonthlyExpenses(transactions), [transactions]);
  const emergencyGoal = useMemo(
    () =>
      goals.find((g) => g.id === "goal-emergency") ??
      goals.find((g) => g.name.toLowerCase().includes("emergency")),
    [goals],
  );

  const [input, setInput] = useState<EmergencyInput>({
    monthlyExpenses: 50000,
    monthsCover: 6,
    savedSoFar: 0,
  });
  const [touchedExpenses, setTouchedExpenses] = useState(false);
  const [touchedSaved, setTouchedSaved] = useState(false);
  const [savingPerMonth, setSavingPerMonth] = useState(10000);

  // Prefill from real data once it loads — only until the user edits a field.
  useEffect(() => {
    if (!txnsLoading && !touchedExpenses) {
      setInput((p) => ({
        ...p,
        monthlyExpenses: detectedAvg > 0 ? Math.round(detectedAvg) : p.monthlyExpenses,
      }));
    }
  }, [txnsLoading, detectedAvg, touchedExpenses]);

  useEffect(() => {
    if (!goalsLoading && !touchedSaved) {
      setInput((p) => ({
        ...p,
        savedSoFar: emergencyGoal ? Math.round(emergencyGoal.savedPaise / 100) : p.savedSoFar,
      }));
    }
  }, [goalsLoading, emergencyGoal, touchedSaved]);

  const set = <K extends keyof EmergencyInput>(k: K, v: EmergencyInput[K], touch?: () => void) => {
    touch?.();
    setInput((p) => ({ ...p, [k]: v }));
  };

  const error = validateEmergency(input);
  const result = useMemo(() => calcEmergencyFund(input, savingPerMonth), [input, savingPerMonth]);

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading emergency fund planner">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Emergency-fund planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <CalcField
            id="em-monthly"
            label="Monthly expenses"
            value={input.monthlyExpenses}
            onChange={(v) => set("monthlyExpenses", v, () => setTouchedExpenses(true))}
            min={1000}
            max={5000000}
            step={1000}
            format="rupees"
            error={error && input.monthlyExpenses <= 0 ? error : null}
            helper={
              detectedAvg > 0
                ? `Prefilled from your actual average monthly spend (${formatINR(toPaise(detectedAvg))})`
                : "Add expenses and we'll prefill your average here"
            }
          />
          <CalcField
            id="em-cover"
            label="Months of cover"
            value={input.monthsCover}
            onChange={(v) => set("monthsCover", Math.round(v))}
            min={1}
            max={24}
            step={1}
            format="months"
            error={error && (input.monthsCover < 1 || input.monthsCover > 36) ? error : null}
            helper="Most advisors suggest 3–6 months; 6+ if income is variable"
          />
          <CalcField
            id="em-saved"
            label="Already saved"
            value={input.savedSoFar}
            onChange={(v) => set("savedSoFar", v, () => setTouchedSaved(true))}
            min={0}
            max={100000000}
            step={5000}
            format="rupees"
            error={error && input.savedSoFar < 0 ? error : null}
            helper={
              emergencyGoal
                ? `From your “${emergencyGoal.name}” goal (${formatINR(emergencyGoal.savedPaise)})`
                : "No emergency goal found — add one on the Goals page to track this automatically"
            }
          />
          <CalcField
            id="em-save-rate"
            label="I can save per month"
            value={savingPerMonth}
            onChange={(v) => setSavingPerMonth(Math.max(0, v))}
            min={0}
            max={1000000}
            step={1000}
            format="rupees"
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="p-4">
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultStat
              label="Target fund"
              value={formatINR(toPaise(result.target))}
              sub={`${input.monthsCover} months × ${formatINR(toPaise(input.monthlyExpenses))}`}
              accent="primary"
              icon={<Target className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Still to save"
              value={formatINR(toPaise(result.gap))}
              sub={
                result.monthsToTarget !== null
                  ? `≈ ${result.monthsToTarget} month${result.monthsToTarget === 1 ? "" : "s"} at your saving rate`
                  : result.gap === 0
                    ? "Fully funded — nice work"
                    : "Set a monthly saving rate above"
              }
              accent={result.gap === 0 ? "success" : "warning"}
              icon={<TrendingUp className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Current coverage"
              value={`${result.currentCoverMonths.toFixed(1)} mo`}
              sub={formatINR(toPaise(input.savedSoFar))}
              accent={result.currentCoverMonths >= input.monthsCover ? "success" : "default"}
              icon={<ShieldCheck className="size-5" aria-hidden />}
            />
          </div>

          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Funding progress</span>
                <span className="font-semibold tabular-nums">{result.fundedPct.toFixed(0)}%</span>
              </div>
              <Progress value={result.fundedPct} aria-label="Emergency fund progress" />
              <div className="pt-2">
                <ResultRow label="Target" value={formatINR(toPaise(result.target))} />
                <ResultRow label="Saved" value={formatINR(toPaise(input.savedSoFar))} />
                <div className="border-t">
                  <ResultRow label="Remaining" value={formatINR(toPaise(result.gap))} strong />
                </div>
              </div>
              {!emergencyGoal && (
                <Button asChild variant="outline" className="mt-2 w-full sm:w-auto">
                  <Link to="/goals">Track this in a savings goal</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <p className="text-xs leading-5 text-muted-foreground">
            Figures are in today&apos;s rupees (as of {monthKey(todayISO())}). Keep emergency money
            in a liquid, low-risk place — savings account or liquid fund — not in equities.
          </p>
        </>
      )}
    </div>
  );
}
