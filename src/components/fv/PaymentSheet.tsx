import { Loader2, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";
import { initialsOf } from "./TxnRow";
import { pressable } from "./press";

/**
 * Bottom-sheet payment review: recipient, amount, funding source,
 * "Proceed to pay" pill button, "Use another method" escape link.
 * `children` renders extra rows (fees, notes) between amount and source.
 *
 * The summary footer (amount + primary CTA) is sticky — always visible even
 * when the sheet content scrolls.
 */
export function PaymentSheet({
  open,
  onOpenChange,
  recipientName,
  recipientDetail,
  amountPaise,
  fundingSource,
  fundingDetail,
  onProceed,
  processing = false,
  proceedLabel = "Proceed to pay",
  onUseAnotherMethod,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  recipientDetail?: string;
  amountPaise: number;
  fundingSource: string;
  fundingDetail?: string;
  onProceed: () => void;
  processing?: boolean;
  proceedLabel?: string;
  onUseAnotherMethod?: () => void;
  children?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col gap-0 rounded-t-3xl border-t px-0 pt-3 pb-0"
        aria-label="Review payment"
      >
        <span
          aria-hidden
          className="mx-auto mb-2 block h-1.5 w-12 shrink-0 rounded-full bg-muted"
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <h2 className="text-base font-bold text-foreground">Review payment</h2>

          <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-border bg-card p-4 shadow-card">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark"
            >
              {initialsOf(recipientName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">
                {recipientName}
              </span>
              {recipientDetail && (
                <span className="block truncate text-xs text-muted-foreground">
                  {recipientDetail}
                </span>
              )}
            </span>
            <NumberDisplay paise={amountPaise} className="text-xl font-bold text-foreground" />
          </div>

          {children}

          <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-muted/60 px-4 py-3">
            <Wallet className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">Paying from</span>
              <span className="block truncate text-sm font-semibold text-foreground">
                {fundingSource}
              </span>
              {fundingDetail && (
                <span className="block truncate text-xs text-muted-foreground">
                  {fundingDetail}
                </span>
              )}
            </span>
          </div>
          {/* Spacer so the last row never hides under the sticky footer. */}
          <div className="h-4" aria-hidden />
        </div>

        <div className="shrink-0 border-t border-border bg-background px-6 pt-3 pb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <NumberDisplay paise={amountPaise} className="text-xl font-black text-foreground" />
          </div>
          <button
            type="button"
            onClick={onProceed}
            disabled={processing}
            className={cn(
              pressable,
              "mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold",
              processing
                ? "cursor-wait bg-primary/70 text-primary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary-hover",
            )}
          >
            {processing && <Loader2 className="size-5 animate-spin" aria-hidden />}
            {processing ? "Processing…" : proceedLabel}
          </button>

          {onUseAnotherMethod && (
            <button
              type="button"
              onClick={onUseAnotherMethod}
              className="mx-auto mt-3 block text-sm font-semibold text-primary hover:underline"
            >
              Use another method
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
