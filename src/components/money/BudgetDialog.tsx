import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { Label } from "@/components/ui/label";
import type { Budget } from "@/lib/finance/types";
import { categoryById } from "@/lib/finance/categories";
import { AmountField } from "./AmountField";
import { CategorySelect } from "./CategorySelect";
import { monthLabel, paiseToRupees, rupeesToPaise } from "./utils";

/**
 * Set / edit a monthly budget for one category. Category is locked when
 * editing an existing budget (setBudget upserts on (category, month)).
 */
export function BudgetDialog({
  open,
  onOpenChange,
  month,
  existing,
  presetCategoryId,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  existing?: Budget | null;
  presetCategoryId?: string;
  onSave: (input: { categoryId: string; limitPaise: number }) => void;
  saving: boolean;
}) {
  const [categoryId, setCategoryId] = useState("bills");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setCategoryId(existing?.categoryId ?? presetCategoryId ?? "bills");
      setAmount(existing ? paiseToRupees(existing.limitPaise) : "");
      setError(undefined);
    }
  }, [open, existing, presetCategoryId]);

  const handleSave = () => {
    const limitPaise = rupeesToPaise(amount);
    if (!Number.isFinite(limitPaise) || limitPaise <= 0) {
      setError("Enter a monthly limit greater than ₹0.");
      return;
    }
    onSave({ categoryId, limitPaise });
  };

  const categoryLabel = categoryById(existing?.categoryId ?? categoryId)?.label ?? "category";

  return (
    <BottomSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={existing ? "Edit budget" : "Set a budget"}
      showCloseButton
    >
      <p className="text-sm text-muted-foreground">
        {existing
          ? `Monthly limit for ${categoryLabel} · ${monthLabel(month)}.`
          : `Cap spending for a category in ${monthLabel(month)}. Spending over the limit is flagged on the card.`}
      </p>
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="budget-category">Category</Label>
          <CategorySelect
            id="budget-category"
            value={categoryId}
            onChange={setCategoryId}
            disabled={Boolean(existing)}
          />
          {existing && (
            <p className="text-xs text-muted-foreground">
              The category of an existing budget cannot be changed.
            </p>
          )}
        </div>
        <AmountField
          id="budget-amount"
          label="Monthly limit"
          value={amount}
          onChange={setAmount}
          error={error}
          placeholder="10,000.00"
          autoFocus
        />
      </div>
      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : existing ? "Save changes" : "Set budget"}
        </Button>
      </div>
    </BottomSheet>
  );
}
