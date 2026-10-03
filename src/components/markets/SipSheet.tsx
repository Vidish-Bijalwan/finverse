import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAccounts, useAddRecurringRule } from "@/lib/finance/hooks";
import { formatINR, todayISO } from "@/lib/finance/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const toPaise = (rupeesText: string): number => {
  const v = Number.parseFloat(rupeesText);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.round(v * 100);
};

/**
 * "Start SIP" sheet for a stock. Creates a `recurring_rules` row
 * (category "investments", note `SIP SYMBOL`) — the existing
 * `ensureRecurringPosted()` auto-posts each occurrence as a ledger
 * transaction. Pause/resume happens in the existing recurring UI
 * (Expenses → Recurring).
 */
export function SipSheet({
  open,
  onOpenChange,
  symbol,
  name,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  name: string;
}) {
  const { data: accounts } = useAccounts();
  const addRule = useAddRecurringRule();

  const [amountText, setAmountText] = useState("5000");
  const [frequency, setFrequency] = useState<"monthly" | "weekly">("monthly");
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (open) {
      setDate(todayISO());
      addRule.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, symbol]);

  const amountPaise = toPaise(amountText);
  const valid = amountPaise > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const pending = addRule.isPending;

  function handleStart() {
    if (!valid || pending) return;
    const defaultAccount = accounts?.find((a) => a.isDefault) ?? accounts?.[0];
    addRule.mutate(
      {
        type: "expense",
        amountPaise,
        category: "investments",
        note: `SIP ${symbol.toUpperCase()}`,
        payMode: "Bank",
        ...(defaultAccount ? { accountId: defaultAccount.id } : {}),
        tags: ["sip", "simulated-brokerage"],
        frequency,
        startDateISO: date,
        isPaused: false,
      },
      {
        onSuccess: () => {
          toast.success(
            `SIP started · ${formatINR(amountPaise)} ${frequency} in ${symbol.toUpperCase()}`,
          );
          onOpenChange(false);
        },
        onError: (e) => toast.error(e.message || "Couldn't start the SIP — try again."),
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full max-w-lg rounded-t-3xl border-t px-6 pt-3 pb-8"
        aria-label={`Start SIP in ${symbol}`}
      >
        <span aria-hidden className="mx-auto mb-4 block h-1.5 w-12 rounded-full bg-muted" />

        <h2 className="text-base font-bold text-foreground">
          Start SIP <span className="text-muted-foreground">· {symbol}</span>
        </h2>
        <p className="truncate text-xs text-muted-foreground">{name}</p>

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Amount per instalment (₹)
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="5,000.00"
              className="h-14 rounded-2xl border border-input bg-card px-4 text-2xl font-bold text-foreground tabular-nums"
            />
          </label>

          <div role="group" aria-label="SIP frequency" className="flex rounded-full bg-muted p-1">
            {(
              [
                { value: "monthly", label: "Monthly" },
                { value: "weekly", label: "Weekly" },
              ] as const
            ).map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={frequency === o.value}
                onClick={() => setFrequency(o.value)}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  frequency === o.value
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              First instalment
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-2xl border border-input bg-card px-4 text-sm font-semibold text-foreground"
            />
          </label>

          <p className="rounded-2xl bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
            Each instalment posts an <strong className="text-foreground">Investments</strong>{" "}
            expense transaction to your shared ledger automatically. Pause or resume anytime in{" "}
            <Link to="/expenses" search={{}} className="font-bold text-primary hover:underline">
              Expenses → Recurring
            </Link>
            . Note: SIP instalments don't change your holding quantity — that updates when you place
            buy orders.
          </p>

          <Button
            className="h-13 w-full rounded-full py-3.5 text-base font-bold"
            disabled={!valid || pending}
            onClick={handleStart}
          >
            {pending ? "Starting…" : `Start ${frequency} SIP`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
