import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, ReceiptIndianRupee, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { NumberDisplay, pressable } from "@/components/fv";
import { useBills, usePayBill } from "@/lib/finance/hooks";
import { isBillDue } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { RechargeDialog } from "./RechargeDialog";

/**
 * Bills & recharges: due bills with one-tap Pay (real ledger write via
 * usePayBill), a mobile-recharge entry point, and a link to manage bills.
 */
export function BillsCard() {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const billsQuery = useBills();
  const payBill = usePayBill();

  const bills = billsQuery.data ?? [];
  const due = bills.filter((b) => isBillDue(b)).sort((a, b) => a.dueDay - b.dueDay);

  return (
    <section aria-label="Bills and recharges" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Bills & recharges</h2>
        <Link
          to="/bills"
          className={cn(
            pressable,
            "flex items-center gap-1 text-xs font-bold text-primary hover:underline",
          )}
        >
          Manage bills <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRechargeOpen(true)}
          className={cn(
            pressable,
            "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-card hover:bg-muted/40",
          )}
        >
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-tint"
          >
            <Smartphone className="size-5 text-primary" />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground">Recharge</span>
            <span className="block text-xs text-muted-foreground">Mobile prepaid</span>
          </span>
        </button>
        <Link
          to="/bills"
          className={cn(
            pressable,
            "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-card hover:bg-muted/40",
          )}
        >
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-tint"
          >
            <ReceiptIndianRupee className="size-5 text-primary" />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground">Pay a bill</span>
            <span className="block text-xs text-muted-foreground">
              {due.length === 0 ? "All caught up" : `${due.length} due`}
            </span>
          </span>
        </Link>
      </div>

      {billsQuery.isLoading && (
        <div className="h-16 animate-pulse rounded-2xl bg-muted" aria-hidden />
      )}

      {billsQuery.isSuccess && due.length > 0 && (
        <ul className="flex flex-col gap-2">
          {due.slice(0, 4).map((bill) => (
            <li
              key={bill.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{bill.name}</p>
                <p className="text-xs text-muted-foreground">Due on day {bill.dueDay}</p>
              </div>
              <NumberDisplay
                paise={bill.amountPaise}
                className="text-sm font-bold text-foreground"
              />
              <button
                type="button"
                disabled={payBill.isPending}
                onClick={() =>
                  payBill.mutate(
                    { id: bill.id },
                    {
                      onSuccess: () => toast.success(`${bill.name} bill paid`),
                      onError: () => toast.error("Couldn't pay the bill — try again."),
                    },
                  )
                }
                className={cn(
                  pressable,
                  "flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50",
                )}
              >
                {payBill.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Pay
              </button>
            </li>
          ))}
        </ul>
      )}

      <RechargeDialog open={rechargeOpen} onOpenChange={setRechargeOpen} />
    </section>
  );
}
