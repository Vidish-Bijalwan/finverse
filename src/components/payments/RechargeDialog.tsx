import { useState } from "react";
import { Loader2, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { pressable } from "@/components/fv";
import { cn } from "@/lib/utils";
import { useAccountSummaries, useAddTransaction } from "@/lib/finance/hooks";
import { formatINR, todayISO } from "@/lib/finance/format";

const OPERATORS = ["Jio", "Airtel", "Vi", "BSNL"] as const;

const MOBILE_RE = /^[6-9]\d{9}$/;

/**
 * Mobile recharge flow — a real ledger flow, not a mock.
 *
 * Collects operator + 10-digit number + amount, then records a genuine
 * expense transaction (category "bills", payMode "upi_test") against the
 * default account. The transaction is deletable/undoable like any other.
 */
export function RechargeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [operator, setOperator] = useState<(typeof OPERATORS)[number]>("Jio");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const { data: summaries } = useAccountSummaries();
  const addTxn = useAddTransaction();

  const numberValid = MOBILE_RE.test(number.replace(/\s/g, ""));
  const amountPaise =
    amount.trim() === ""
      ? null
      : /^\d+(\.\d{1,2})?$/.test(amount.trim())
        ? Math.round(Number(amount) * 100)
        : -1;
  const canSubmit =
    numberValid &&
    amountPaise !== null &&
    amountPaise !== -1 &&
    amountPaise > 0 &&
    !addTxn.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit || amountPaise === null || amountPaise <= 0) return;
    const accountId = summaries?.find((s) => s.account.isDefault)?.account.id;
    try {
      await addTxn.mutateAsync({
        type: "expense",
        amountPaise,
        category: "bills",
        note: `Recharge · ${operator} · ${number.replace(/\s/g, "")}`,
        dateISO: todayISO(),
        payMode: "upi_test",
        ...(accountId ? { accountId } : {}),
      });
      toast.success(
        `Recharged ${formatINR(amountPaise)} on ${operator} ${number.replace(/\s/g, "")}`,
        {
          description: "Recorded in your ledger · simulated",
        },
      );
      setNumber("");
      setAmount("");
      setTouched(false);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't record the recharge — try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Smartphone className="size-5 text-primary" aria-hidden /> Mobile recharge
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close recharge"
            className={cn(
              pressable,
              "grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <div>
            <span className="mb-2 block text-sm font-bold text-foreground">Operator</span>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Operator">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  type="button"
                  role="radio"
                  aria-checked={operator === op}
                  onClick={() => setOperator(op)}
                  className={cn(
                    pressable,
                    "rounded-xl border py-2.5 text-sm font-bold transition-colors",
                    operator === op
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">Mobile number</span>
            <input
              type="tel"
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))}
              placeholder="98765 43210"
              autoComplete="tel"
              className="h-12 rounded-xl border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {touched && !numberValid && (
              <span className="text-xs font-semibold text-loss">
                Enter a valid 10-digit Indian mobile number.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">Amount</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="₹ amount"
              className="h-12 rounded-xl border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {touched && (amountPaise === null || amountPaise === -1 || amountPaise <= 0) && (
              <span className="text-xs font-semibold text-loss">Enter an amount like 299.</span>
            )}
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              pressable,
              "flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {addTxn.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {addTxn.isPending ? "Recording…" : "Recharge now"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Simulated recharge — no real money moves. The entry appears in your ledger.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
