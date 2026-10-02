import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR, todayISO } from "@/lib/finance/format";
import type { Goal } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { AmountField } from "./AmountField";
import { GOAL_COLORS, paiseToRupees, rupeesToPaise } from "./utils";

export type GoalFormInput = Omit<Goal, "id">;

/** Create / edit a savings goal. Validates name, target, and deadline. */
export function GoalFormDialog({
  open,
  onOpenChange,
  initial,
  today,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Goal | null;
  /** "YYYY-MM-DD", passed down so the page stays SSR-consistent. */
  today: string;
  onSave: (input: GoalFormInput) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState<string>(GOAL_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setTarget(initial ? paiseToRupees(initial.targetPaise) : "");
      setDeadline(initial?.deadline ?? "");
      setColor(initial?.color ?? GOAL_COLORS[0]);
      setErrors({});
    }
  }, [open, initial]);

  const handleSave = () => {
    const next: Record<string, string> = {};
    if (name.trim().length === 0) next.name = "Give the goal a name.";
    const targetPaise = rupeesToPaise(target);
    if (!Number.isFinite(targetPaise) || targetPaise <= 0)
      next.target = "Enter a target greater than ₹0.";
    else if (initial && targetPaise < initial.savedPaise)
      next.target = `Target can't be below what's already saved (${formatINR(initial.savedPaise)}).`;
    if (!deadline) next.deadline = "Pick a deadline date.";
    else if (deadline < today) next.deadline = "Deadline can't be in the past.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({
      name: name.trim(),
      targetPaise,
      savedPaise: initial?.savedPaise ?? 0,
      deadline,
      color,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit goal" : "New savings goal"}</DialogTitle>
          <DialogDescription>
            Set a target and a deadline — FinVerse projects whether your current saving pace will
            get you there.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Goal name</Label>
            <Input
              id="goal-name"
              placeholder="Emergency fund, MacBook, Goa trip…"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "goal-name-error" : undefined}
            />
            {errors.name && (
              <p id="goal-name-error" role="alert" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>
          <AmountField
            id="goal-target"
            label="Target amount"
            value={target}
            onChange={setTarget}
            error={errors.target}
            placeholder="2,00,000.00"
          />
          <div className="space-y-1.5">
            <Label htmlFor="goal-deadline">Deadline</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              min={today}
              onChange={(e) => setDeadline(e.target.value)}
              aria-invalid={errors.deadline ? true : undefined}
              aria-describedby={errors.deadline ? "goal-deadline-error" : undefined}
            />
            {errors.deadline && (
              <p id="goal-deadline-error" role="alert" className="text-xs text-destructive">
                {errors.deadline}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Goal colour">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={`Colour ${c}`}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    color === c ? "border-foreground scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save changes" : "Create goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Add funds to a goal — creates the transfer transaction via useAddToGoal. */
export function AddFundsDialog({
  open,
  onOpenChange,
  goal,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (input: { id: string; amountPaise: number; note?: string }) => void;
  saving: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setAmount("");
      setNote("");
      setError(undefined);
    }
  }, [open]);

  if (!goal) return null;
  const remaining = goal.targetPaise - goal.savedPaise;

  const handleSave = () => {
    const amountPaise = rupeesToPaise(amount);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      setError("Enter an amount greater than ₹0.");
      return;
    }
    if (remaining > 0 && amountPaise > remaining) {
      setError(
        `Only ${formatINR(remaining)} left to reach the target — the extra won't be counted.`,
      );
      return;
    }
    onSave({ id: goal.id, amountPaise, note: note.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add funds</DialogTitle>
          <DialogDescription>
            Move money towards <span className="font-medium">{goal.name}</span>.{" "}
            {formatINR(goal.savedPaise)} of {formatINR(goal.targetPaise)} saved so far.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <AmountField
            id="funds-amount"
            label="Amount"
            value={amount}
            onChange={setAmount}
            error={error}
            placeholder="5,000.00"
            autoFocus
          />
          <div className="space-y-1.5">
            <Label htmlFor="funds-note">
              Note <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="funds-note"
              placeholder="October savings"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Adding…" : "Add funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
