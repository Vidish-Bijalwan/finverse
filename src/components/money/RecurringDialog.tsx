import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from "@/components/ui/switch";
import { AmountField } from "./AmountField";
import { CategorySelect } from "./CategorySelect";
import { TagEditor } from "./TagEditor";
import { rupeesToPaise } from "@/components/money/utils";
import { formatINRShort, todayISO } from "@/lib/finance/format";
import { iconForName } from "@/lib/finance/categories";
import {
  useAccountSummaries,
  useAddRecurringRule,
  useUpdateRecurringRule,
} from "@/lib/finance/hooks";
import type {
  PayMode,
  RecurringFrequency,
  RecurringRule,
  TransactionType,
} from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const PAY_MODES: PayMode[] = ["UPI", "Cash", "Card", "Bank"];

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

/** Create / edit dialog for recurring transaction rules. */
export function RecurringDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: RecurringRule | null;
}) {
  const isEdit = Boolean(editing);
  const { data: summaries } = useAccountSummaries();
  const accounts = useMemo(() => summaries ?? [], [summaries]);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("bills");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [startDateISO, setStartDateISO] = useState(todayISO());
  const [hasEnd, setHasEnd] = useState(false);
  const [endDateISO, setEndDateISO] = useState(todayISO());
  const [note, setNote] = useState("");
  const [payMode, setPayMode] = useState<PayMode>("UPI");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addRule = useAddRecurringRule();
  const updateRule = useUpdateRecurringRule();
  const saving = addRule.isPending || updateRule.isPending;

  useEffect(() => {
    if (!open) return;
    const defaultAcc =
      accounts.find((s) => s.account.isDefault)?.account.id ?? accounts[0]?.account.id ?? "";
    setType(editing?.type ?? "expense");
    setAmount(editing ? String(editing.amountPaise / 100) : "");
    setCategory(editing?.category ?? "bills");
    setAccountId(editing?.accountId ?? defaultAcc);
    setToAccountId(editing?.toAccountId ?? "");
    setFrequency(editing?.frequency ?? "monthly");
    setStartDateISO(editing?.startDateISO ?? todayISO());
    setHasEnd(Boolean(editing?.endDateISO));
    setEndDateISO(editing?.endDateISO ?? todayISO());
    setNote(editing?.note ?? "");
    setPayMode(editing?.payMode ?? "UPI");
    setTags(editing?.tags ?? []);
    setError(null);
  }, [open, editing, accounts]);

  const handleSave = () => {
    if (saving) return;
    const amountPaise = rupeesToPaise(amount);
    if (Number.isNaN(amountPaise) || amountPaise <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!startDateISO) {
      setError("Pick a start date.");
      return;
    }
    if (hasEnd && endDateISO < startDateISO) {
      setError("End date cannot be before the start date.");
      return;
    }
    if (type === "transfer" && accountId && toAccountId && accountId === toAccountId) {
      setError("Pick two different accounts for a transfer.");
      return;
    }
    setError(null);
    const payload = {
      type,
      amountPaise,
      category,
      note: note.trim() || "Recurring",
      payMode,
      tags,
      frequency,
      startDateISO,
      ...(accountId ? { accountId } : {}),
      ...(type === "transfer" && toAccountId ? { toAccountId } : {}),
      ...(hasEnd ? { endDateISO } : {}),
    };
    if (isEdit && editing) {
      updateRule.mutate(
        { id: editing.id, patch: payload },
        {
          onSuccess: () => {
            toast.success("Recurring rule updated");
            onOpenChange(false);
          },
          onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
        },
      );
    } else {
      addRule.mutate(payload, {
        onSuccess: () => {
          toast.success(`Recurring ${type} · ${formatINRShort(amountPaise)} ${frequency}`);
          onOpenChange(false);
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit recurring rule" : "New recurring rule"}</DialogTitle>
          <DialogDescription>
            Due occurrences post automatically when the app loads — never twice.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div
            className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
            role="tablist"
            aria-label="Transaction type"
          >
            {(["expense", "income", "transfer"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={type === t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-xl py-2 text-sm font-semibold capitalize transition-colors",
                  type === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <AmountField
            id="recurring-amount"
            label="Amount"
            value={amount}
            onChange={setAmount}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="recurring-category">Category</Label>
              <CategorySelect
                id="recurring-category"
                value={category}
                onChange={setCategory}
                kind={type === "income" ? "income" : "expense"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recurring-frequency">Repeats</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as RecurringFrequency)}
              >
                <SelectTrigger id="recurring-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={cn("grid gap-2", type === "transfer" ? "grid-cols-2" : "grid-cols-1")}>
            <div className="space-y-1.5">
              <Label htmlFor="recurring-account">
                {type === "transfer" ? "From account" : "Account"}
              </Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="recurring-account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(({ account }) => {
                    const Icon = iconForName(account.iconName);
                    return (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="flex shrink-0"
                            style={{ color: account.color }}
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          {account.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {type === "transfer" && (
              <div className="space-y-1.5">
                <Label htmlFor="recurring-to-account">To account</Label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                  <SelectTrigger id="recurring-to-account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(({ account }) => {
                      const Icon = iconForName(account.iconName);
                      return (
                        <SelectItem
                          key={account.id}
                          value={account.id}
                          disabled={account.id === accountId}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="flex shrink-0"
                              style={{ color: account.color }}
                              aria-hidden
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            {account.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="recurring-start">Starts</Label>
              <Input
                id="recurring-start"
                type="date"
                value={startDateISO}
                onChange={(e) => e.target.value && setStartDateISO(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recurring-end">Ends</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="recurring-has-end"
                  checked={hasEnd}
                  onCheckedChange={setHasEnd}
                  aria-label="Has end date"
                />
                <Input
                  id="recurring-end"
                  type="date"
                  value={endDateISO}
                  disabled={!hasEnd}
                  min={startDateISO}
                  onChange={(e) => e.target.value && setEndDateISO(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Paid via</Label>
            <div
              className="grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1"
              role="radiogroup"
              aria-label="Payment mode"
            >
              {PAY_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={payMode === m}
                  onClick={() => setPayMode(m)}
                  className={cn(
                    "rounded-xl py-2 text-sm font-semibold transition-colors",
                    payMode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recurring-note">Note</Label>
            <Input
              id="recurring-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Netflix subscription"
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <TagEditor tags={tags} onChange={setTags} id="recurring-tags" />

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground",
              "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60",
            )}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Check className="h-5 w-5" /> {isEdit ? "Save changes" : "Create rule"}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
