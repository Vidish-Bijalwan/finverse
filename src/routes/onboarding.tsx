import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { formatINR, monthKey } from "@/lib/finance/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { pressable } from "@/components/fv";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — FinVerse AI" },
      { name: "description", content: "Set up your FinVerse AI profile in four quick steps." },
    ],
  }),
  component: OnboardingPage,
});

const STEP_LABELS = ["Your name", "Monthly income", "Budget split", "Goals"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

const GOAL_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];

function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function plusOneYearISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return toISODate(d);
}

function supabaseErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return "Something went wrong. Please try again.";
}

interface DraftGoal {
  id: number;
  name: string;
  targetText: string;
  deadline: string;
}

function OnboardingLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div
        className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

function OnboardingPage() {
  const { user, profile, loading } = useAuth();

  if (loading) return <OnboardingLoading />;
  if (!user) return <Navigate to="/login" />;
  if (profile?.onboarding_completed) return <Navigate to="/" />;
  return <OnboardingWizard userId={user.id} />;
}

function OnboardingWizard({ userId }: { userId: string }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Step 0 — display name
  const [displayName, setDisplayName] = useState("");

  // Step 1 — monthly income
  const [incomeText, setIncomeText] = useState("");
  const [payday, setPayday] = useState(1);
  const [incomePaise, setIncomePaise] = useState(0);

  // Step 2 — budget split (% per default expense category)
  const [pcts, setPcts] = useState<Record<string, number>>(() =>
    Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, 0])),
  );

  // Step 3 — goals
  const [goals, setGoals] = useState<DraftGoal[]>([]);

  const budgetTotal = useMemo(
    () => EXPENSE_CATEGORIES.reduce((sum, c) => sum + (pcts[c.id] ?? 0), 0),
    [pcts],
  );
  const budgetValid = budgetTotal === 100;
  const budgetRemaining = 100 - budgetTotal;

  function fail(message: string, e?: unknown) {
    const detail = e ? supabaseErrorMessage(e) : null;
    const full = detail && detail !== message ? `${message} ${detail}` : message;
    setError(full);
    toast.error(full);
  }

  async function handleNameNext() {
    const name = displayName.trim();
    if (!name) {
      setError("Please enter your name to continue.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", userId);
      if (dbError) throw dbError;
      setStep(1);
    } catch (e) {
      fail("Couldn't save your name.", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleIncomeNext() {
    const incomeRupees = Number.parseFloat(incomeText.replace(/,/g, ""));
    if (!Number.isFinite(incomeRupees) || incomeRupees <= 0) {
      setError("Enter a monthly income greater than ₹0.");
      return;
    }
    const paise = Math.round(incomeRupees * 100);

    // First payday: this month if it hasn't passed yet, otherwise next month.
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (payday < now.getDate()) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    const startDateIso = `${year}-${String(month).padStart(2, "0")}-${String(payday).padStart(2, "0")}`;

    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase.from("recurring_rules").insert({
        user_id: userId,
        type: "income",
        amount_paise: paise,
        category: "salary",
        note: "Monthly salary",
        pay_mode: "Bank",
        frequency: "monthly",
        start_date_iso: startDateIso,
        is_paused: false,
      });
      if (dbError) throw dbError;
      setIncomePaise(paise);
      setStep(2);
    } catch (e) {
      fail("Couldn't save your income.", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleBudgetNext() {
    if (!budgetValid) {
      setError("Your budget split must add up to exactly 100%.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const month = monthKey(new Date());
      const rows = EXPENSE_CATEGORIES.filter((c) => (pcts[c.id] ?? 0) > 0).map((c) => ({
        user_id: userId,
        category_id: c.id,
        month,
        limit_paise: Math.round((incomePaise * (pcts[c.id] ?? 0)) / 100),
      }));
      if (rows.length > 0) {
        const { error: dbError } = await supabase.from("budgets").insert(rows);
        if (dbError) throw dbError;
      }
      setStep(3);
    } catch (e) {
      fail("Couldn't save your budgets.", e);
    } finally {
      setSaving(false);
    }
  }

  function addGoal() {
    setGoals((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), name: "", targetText: "", deadline: plusOneYearISO() },
    ]);
  }

  function updateGoal(id: number, patch: Partial<DraftGoal>) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function removeGoal(id: number) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleFinish() {
    if (goals.length === 0) {
      setError("Add at least one goal to finish setting up.");
      return;
    }
    for (const g of goals) {
      if (!g.name.trim()) {
        setError("Every goal needs a name.");
        return;
      }
      const targetRupees = Number.parseFloat(g.targetText.replace(/,/g, ""));
      if (!Number.isFinite(targetRupees) || targetRupees <= 0) {
        setError(`Enter a target amount greater than ₹0 for “${g.name.trim()}”.`);
        return;
      }
      if (!g.deadline) {
        setError(`Pick a deadline for “${g.name.trim()}”.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const goalRows = goals.map((g, i) => ({
        user_id: userId,
        name: g.name.trim(),
        target_paise: Math.round(Number.parseFloat(g.targetText.replace(/,/g, "")) * 100),
        saved_paise: 0,
        deadline: g.deadline,
        color: GOAL_COLORS[i % GOAL_COLORS.length],
      }));
      const { error: goalError } = await supabase.from("goals").insert(goalRows);
      if (goalError) throw goalError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);
      if (profileError) throw profileError;

      toast.success("Welcome to FinVerse — you're all set.");
      // Full reload so the auth layer re-reads the completed profile.
      window.location.href = "/";
    } catch (e) {
      fail("Couldn't finish setup.", e);
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Soft animated mesh glow — onboarding only. Static when reduced motion. */}
      <div
        aria-hidden="true"
        className={cn("fv-mesh fv-mesh-soft", !reducedMotion && "fv-mesh-animated")}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-8 sm:px-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-muted-foreground">{STEP_LABELS[step]}</span>
          </div>
          <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="mt-3" />
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
            className={`mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${pressable}`}
          >
            <ArrowLeft className="size-4" /> Back
          </button>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {error}
          </div>
        )}

        {step === 0 && (
          <section aria-labelledby="onboarding-name">
            <h1 id="onboarding-name" className="text-2xl font-black tracking-tight text-foreground">
              What should we call you?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This name shows up across your FinVerse AI experience.
            </p>
            <div className="mt-6 grid gap-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                autoComplete="name"
                maxLength={80}
              />
            </div>
            <Button
              className={`mt-8 w-full ${pressable}`}
              onClick={handleNameNext}
              disabled={saving}
            >
              {saving ? "Saving…" : "Continue"}
            </Button>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="onboarding-income">
            <h1
              id="onboarding-income"
              className="text-2xl font-black tracking-tight text-foreground"
            >
              What's your monthly income?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll use it to suggest budgets and track your salary credits.
            </p>
            <div className="mt-6 grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="monthly-income">Monthly income (₹)</Label>
                <Input
                  id="monthly-income"
                  inputMode="decimal"
                  value={incomeText}
                  onChange={(e) => setIncomeText(e.target.value)}
                  placeholder="e.g. 50,000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payday">Payday (day of month)</Label>
                <select
                  id="payday"
                  value={payday}
                  onChange={(e) => setPayday(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Your salary credit is recorded as a monthly recurring income on this day.
                </p>
              </div>
            </div>
            <Button
              className={`mt-8 w-full ${pressable}`}
              onClick={handleIncomeNext}
              disabled={saving}
            >
              {saving ? "Saving…" : "Continue"}
            </Button>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="onboarding-budget">
            <h1
              id="onboarding-budget"
              className="text-2xl font-black tracking-tight text-foreground"
            >
              Split your budget
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Decide what share of your {formatINR(incomePaise)} monthly income each category gets.
              The shares must add up to exactly 100%.
            </p>

            <div
              className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                budgetValid
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : budgetRemaining > 0
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
              role="status"
            >
              {budgetValid
                ? "Adds up to 100% — nicely done."
                : budgetRemaining > 0
                  ? `${budgetRemaining}% still unassigned`
                  : `${-budgetRemaining}% over — trim it back`}
            </div>

            <div className="mt-4 grid gap-3">
              {EXPENSE_CATEGORIES.map((c) => {
                const pct = pcts[c.id] ?? 0;
                const Icon = c.icon;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: `${c.color}1A`, color: c.color }}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{c.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatINR(Math.round((incomePaise * pct) / 100))} / month
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={pct}
                        onChange={(e) => {
                          const v = Number.parseInt(e.target.value, 10);
                          setPcts((prev) => ({
                            ...prev,
                            [c.id]: Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0,
                          }));
                        }}
                        aria-label={`${c.label} budget percent`}
                        className="w-20 text-right"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              className={`mt-8 w-full ${pressable}`}
              onClick={handleBudgetNext}
              disabled={saving || !budgetValid}
            >
              {saving ? "Saving…" : "Continue"}
            </Button>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="onboarding-goals">
            <h1
              id="onboarding-goals"
              className="text-2xl font-black tracking-tight text-foreground"
            >
              Set your first goals
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              What are you saving toward? Add at least one — you can add more later.
            </p>

            <div className="mt-6 grid gap-4">
              {goals.map((g) => (
                <div key={g.id} className="grid gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Goal {goals.indexOf(g) + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeGoal(g.id)}
                      aria-label={`Remove ${g.name || "goal"}`}
                      className={`grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${pressable}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`goal-name-${g.id}`}>Goal name</Label>
                    <Input
                      id={`goal-name-${g.id}`}
                      value={g.name}
                      onChange={(e) => updateGoal(g.id, { name: e.target.value })}
                      placeholder="e.g. Emergency fund"
                      maxLength={80}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor={`goal-target-${g.id}`}>Target (₹)</Label>
                      <Input
                        id={`goal-target-${g.id}`}
                        inputMode="decimal"
                        value={g.targetText}
                        onChange={(e) => updateGoal(g.id, { targetText: e.target.value })}
                        placeholder="e.g. 2,00,000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`goal-deadline-${g.id}`}>Deadline</Label>
                      <Input
                        id={`goal-deadline-${g.id}`}
                        type="date"
                        value={g.deadline}
                        onChange={(e) => updateGoal(g.id, { deadline: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className={`mt-4 w-full ${pressable}`}
              onClick={() => {
                setError(null);
                addGoal();
              }}
            >
              <Plus className="size-4" /> Add a goal
            </Button>

            <Button className={`mt-4 w-full ${pressable}`} onClick={handleFinish} disabled={saving}>
              {saving ? "Finishing…" : "Finish setup"}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
