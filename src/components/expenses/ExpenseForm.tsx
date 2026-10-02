import { useMemo, useState, type CSSProperties } from "react";
import { Check, Delete, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { allCategories } from "@/lib/finance/categories";
import {
  useAccounts,
  useAddTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/lib/finance/hooks";
import { formatINR, todayISO } from "@/lib/finance/format";
import type { PayMode, Transaction, TransactionType } from "@/lib/finance/types";
import { CategoryManagerDialog } from "@/components/money/CategoryManagerDialog";
import { TagEditor } from "@/components/money/TagEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Paytm-style add/edit expense sheet content.
 *
 * - Big amount display + numeric keypad (1-9, 0, ., backspace).
 * - Expense/Income toggle, category icon-tile grid, pay-mode segmented
 *   control, note input, date input.
 * - Save validates (amount > 0, category required) with inline errors.
 * - In edit mode a Delete button appears with a two-tap confirm.
 *
 * Amounts are always stored as integer paise (Math.round(parseFloat * 100)).
 */

export interface ExpenseDraft {
  amountPaise?: number;
  category?: string;
  note?: string;
  type?: TransactionType;
  payMode?: PayMode;
  dateISO?: string;
  accountId?: string;
  tags?: string[];
}

type FormErrors = { amount?: string; category?: string };

const PAY_MODES: PayMode[] = ["UPI", "Cash", "Card", "Bank"];

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

function paiseToRupeesString(paise: number): string {
  return (paise / 100).toString();
}

export function ExpenseForm({
  editing,
  draft,
  onDone,
}: {
  /** When set, the form edits this transaction instead of creating one. */
  editing?: Transaction | null;
  /** Prefill from quick-add / receipt scan. */
  draft?: ExpenseDraft | null;
  onDone: () => void;
}) {
  const isEdit = Boolean(editing);

  const [type, setType] = useState<TransactionType>(editing?.type ?? draft?.type ?? "expense");
  const [amountStr, setAmountStr] = useState<string>(
    editing
      ? paiseToRupeesString(editing.amountPaise)
      : draft?.amountPaise
        ? paiseToRupeesString(draft.amountPaise)
        : "0",
  );
  const [categoryId, setCategoryId] = useState<string>(
    editing?.category ?? draft?.category ?? "food",
  );
  const [payMode, setPayMode] = useState<PayMode>(editing?.payMode ?? draft?.payMode ?? "UPI");
  const [note, setNote] = useState<string>(editing?.note ?? draft?.note ?? "");
  const [dateISO, setDateISO] = useState<string>(editing?.dateISO ?? draft?.dateISO ?? todayISO());
  const [tags, setTags] = useState<string[]>(editing?.tags ?? draft?.tags ?? []);
  const [accountId, setAccountId] = useState<string | undefined>(
    editing?.accountId ?? draft?.accountId,
  );
  const [managingCategories, setManagingCategories] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const clearError = (key: keyof FormErrors) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const addTxn = useAddTransaction();
  const updateTxn = useUpdateTransaction();
  const deleteTxn = useDeleteTransaction();
  const { data: accounts } = useAccounts();
  const saving = addTxn.isPending || updateTxn.isPending;

  const defaultAccountId = accounts?.find((a) => a.isDefault)?.id ?? accounts?.[0]?.id;
  const effectiveAccountId = accountId ?? defaultAccountId;

  const categories = useMemo(() => allCategories().filter((c) => c.kind === type), [type]);
  const defaultCategoryFor = (t: TransactionType) => (t === "expense" ? "food" : "salary");

  const amountPaise = useMemo(() => {
    const v = parseFloat(amountStr);
    if (!Number.isFinite(v) || v <= 0) return 0;
    return Math.round(v * 100);
  }, [amountStr]);

  const pressKey = (key: (typeof KEYPAD_KEYS)[number]) => {
    clearError("amount");
    if (key === "back") {
      setAmountStr((s) => (s.length <= 1 ? "0" : s.slice(0, -1)));
      return;
    }
    setAmountStr((s) => {
      if (key === ".") {
        if (s.includes(".")) return s;
        return `${s}.`;
      }
      if (s.includes(".")) {
        const decimals = s.split(".")[1] ?? "";
        if (decimals.length >= 2) return s;
        return `${s}${key}`;
      }
      // Avoid runaway leading zeros and cap integer length for sanity.
      const next = s === "0" ? key : `${s}${key}`;
      if (next.replace(".", "").length > 10) return s;
      return next;
    });
  };

  const switchType = (t: TransactionType) => {
    setType(t);
    setCategoryId((current) => {
      const pool = allCategories().filter((c) => c.kind === t);
      return pool.some((c) => c.id === current) ? current : defaultCategoryFor(t);
    });
    clearError("category");
  };

  const validate = () => {
    const errs: { amount?: string; category?: string } = {};
    if (amountPaise <= 0) errs.amount = "Enter an amount greater than zero.";
    if (!categoryId) errs.category = "Pick a category.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate() || saving) return;
    const payload = {
      type,
      amountPaise,
      category: categoryId,
      note: note.trim(),
      dateISO,
      payMode,
      tags,
      ...(effectiveAccountId ? { accountId: effectiveAccountId } : {}),
    };
    if (isEdit && editing) {
      updateTxn.mutate(
        { id: editing.id, patch: payload },
        {
          onSuccess: () => {
            toast.success("Transaction updated");
            onDone();
          },
          onError: () => toast.error("Couldn't save — try again."),
        },
      );
    } else {
      addTxn.mutate(payload, {
        onSuccess: () => {
          toast.success(
            `${type === "income" ? "Income" : "Expense"} added · ${formatINR(amountPaise)}`,
          );
          onDone();
        },
        onError: () => toast.error("Couldn't save — try again."),
      });
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteTxn.mutate(editing.id, {
      onSuccess: () => {
        toast.success("Transaction deleted");
        onDone();
      },
      onError: () => toast.error("Couldn't delete — try again."),
    });
  };

  const amountColor = type === "expense" ? "text-destructive" : "text-success";
  const saveLabel = isEdit ? "Save changes" : `Add ${type === "expense" ? "expense" : "income"}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Type toggle */}
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1"
        role="tablist"
        aria-label="Transaction type"
      >
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={type === t}
            onClick={() => switchType(t)}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition-colors",
              type === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      {/* Big amount display */}
      <div className="flex flex-col items-center py-2">
        <span
          aria-live="polite"
          className={cn("text-5xl font-bold tracking-tight tabular-nums", amountColor)}
        >
          ₹{amountStr || "0"}
        </span>
        {errors.amount && (
          <p role="alert" className="mt-1 text-sm font-medium text-destructive">
            {errors.amount}
          </p>
        )}
      </div>

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Amount keypad">
        {KEYPAD_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => pressKey(key)}
            aria-label={
              key === "back" ? "Backspace" : key === "." ? "Decimal point" : `Digit ${key}`
            }
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-xl font-semibold transition-colors",
              "bg-muted text-foreground hover:bg-accent active:bg-accent/70",
            )}
          >
            {key === "back" ? <Delete className="h-5 w-5" /> : key}
          </button>
        ))}
      </div>

      {/* Category grid */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">Category</p>
          <button
            type="button"
            onClick={() => setManagingCategories(true)}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Settings2 className="h-3.5 w-3.5" /> Manage
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Category">
          {categories.map((c) => {
            const Icon = c.icon;
            const selected = categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setCategoryId(c.id);
                  clearError("category");
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 transition-all",
                  selected
                    ? "border-transparent ring-2 ring-offset-1"
                    : "border-transparent hover:bg-muted",
                )}
                style={
                  selected
                    ? ({ ["--tw-ring-color" as string]: c.color } as CSSProperties)
                    : undefined
                }
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${c.color}1f`, color: c.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-center text-[11px] font-medium leading-tight text-foreground">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p role="alert" className="mt-1 text-sm font-medium text-destructive">
            {errors.category}
          </p>
        )}
      </div>

      {/* Pay mode segmented control */}
      <div>
        <p className="mb-2 text-sm font-semibold text-muted-foreground">Paid via</p>
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

      {/* Account picker */}
      <div>
        <p className="mb-2 text-sm font-semibold text-muted-foreground">Account</p>
        <Select value={effectiveAccountId ?? ""} onValueChange={setAccountId}>
          <SelectTrigger aria-label="Account" className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {(accounts ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <span className="flex items-center gap-2">
                  {a.name}
                  {a.isDefault && (
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Default
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">
          The balance of this account updates when you save.
        </p>
      </div>

      {/* Note + date */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-muted-foreground">Note</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            maxLength={120}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-muted-foreground">Date</span>
          <input
            type="date"
            value={dateISO}
            onChange={(e) => e.target.value && setDateISO(e.target.value)}
            max={todayISO()}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {/* Tags */}
      <TagEditor tags={tags} onChange={setTags} />

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "flex h-13 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground",
          "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60",
        )}
      >
        {saving ? (
          "Saving…"
        ) : (
          <>
            <Check className="h-5 w-5" /> {saveLabel}
          </>
        )}
      </button>

      {/* Delete in edit mode, with two-tap confirm */}
      {isEdit && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteTxn.isPending}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors",
            confirmingDelete
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-destructive/40 text-destructive hover:bg-destructive/10",
          )}
        >
          <Trash2 className="h-4 w-4" />
          {deleteTxn.isPending
            ? "Deleting…"
            : confirmingDelete
              ? "Tap again to confirm delete"
              : "Delete transaction"}
        </button>
      )}

      <CategoryManagerDialog
        open={managingCategories}
        onOpenChange={setManagingCategories}
        defaultKind={type === "income" ? "income" : "expense"}
      />
    </div>
  );
}
