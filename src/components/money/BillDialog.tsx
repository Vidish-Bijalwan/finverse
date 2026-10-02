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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bill } from "@/lib/finance/types";
import { AmountField } from "./AmountField";
import { CategorySelect } from "./CategorySelect";
import { paiseToRupees, rupeesToPaise } from "./utils";

export type BillFormInput = Omit<Bill, "id">;

/** Add / edit dialog for a recurring bill. Validates name, amount, and due day. */
export function BillDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this bill; otherwise it creates one. */
  initial?: Bill | null;
  onSave: (input: BillFormInput) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [category, setCategory] = useState("bills");
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setAmount(initial ? paiseToRupees(initial.amountPaise) : "");
      setDueDay(String(initial?.dueDay ?? 1));
      setCategory(initial?.category ?? "bills");
      setErrors({});
    }
  }, [open, initial]);

  const handleSave = () => {
    const next: typeof errors = {};
    if (name.trim().length === 0) next.name = "Give the bill a name.";
    const amountPaise = rupeesToPaise(amount);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0)
      next.amount = "Enter an amount greater than ₹0.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({
      name: name.trim(),
      amountPaise,
      dueDay: Number(dueDay),
      category,
      lastPaidOn: initial?.lastPaidOn,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit bill" : "Add a bill"}</DialogTitle>
          <DialogDescription>
            Recurring bills remind you when they are due. Marking one paid records the expense
            automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bill-name">Bill name</Label>
            <Input
              id="bill-name"
              placeholder="Electricity, Rent, Netflix…"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "bill-name-error" : undefined}
            />
            {errors.name && (
              <p id="bill-name-error" role="alert" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>
          <AmountField
            id="bill-amount"
            label="Amount"
            value={amount}
            onChange={setAmount}
            error={errors.amount}
            placeholder="1,250.00"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bill-due-day">Due day of month</Label>
              <Select value={dueDay} onValueChange={setDueDay}>
                <SelectTrigger id="bill-due-day" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                      {d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Days 1–28 so every month has one.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bill-category">Category</Label>
              <CategorySelect id="bill-category" value={category} onChange={setCategory} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
