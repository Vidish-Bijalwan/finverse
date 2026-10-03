import { ArrowRight } from "lucide-react";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { NumberDisplay } from "@/components/fv/NumberDisplay";
import { initialsOf } from "@/components/fv/TxnRow";
import { categoryById } from "@/lib/finance/categories";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/finance/types";
import { dateLabel, payModeLabel, signedAmountPaise, timeLabel } from "./home-data";

/**
 * Receipt-style detail for a single ledger transaction, opened by tapping a
 * row in Recent activity. Every field comes from the real transaction —
 * no synthesized rows. Edit happens in /expenses, so the sheet offers one
 * CTA: "Open in expenses".
 */
export function TxnDetailSheet({
  txn,
  accountName,
  hideAmounts = false,
  onClose,
  onOpenExpenses,
}: {
  /** null = closed. */
  txn: Transaction | null;
  /** Resolved account name, if the transaction is linked to an account. */
  accountName?: string | undefined;
  hideAmounts?: boolean;
  onClose: () => void;
  onOpenExpenses: () => void;
}) {
  const open = txn !== null;
  const cat = txn ? categoryById(txn.category) : undefined;
  const name = txn ? txn.note || cat?.label || txn.category : "";
  const signed = txn ? signedAmountPaise(txn) : 0;
  const inFlow = signed >= 0;
  const time = txn ? timeLabel(txn.createdAt) : "";
  const CatIcon = cat?.icon;

  return (
    <BottomSheet open={open} onClose={onClose} title="Transaction" showCloseButton>
      {txn && (
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3.5 pt-1">
            <span
              aria-hidden
              className="grid size-14 shrink-0 place-items-center rounded-full bg-tint text-lg font-bold text-primary-dark"
            >
              {initialsOf(name)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-foreground">{name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {txn.type === "income"
                  ? "Money in"
                  : txn.type === "transfer"
                    ? "Transfer"
                    : "Money out"}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 text-xl font-bold tabular-nums",
                inFlow ? "text-gain" : "text-loss",
              )}
            >
              {hideAmounts ? (
                <span aria-label="Amount hidden">₹ ••••••</span>
              ) : (
                <>
                  {inFlow ? "+" : "−"}
                  <NumberDisplay paise={Math.abs(signed)} />
                </>
              )}
            </p>
          </div>

          <dl className="mt-5 divide-y divide-border/60 rounded-2xl border border-border bg-card text-sm">
            <DetailRow label="Date & time">
              {dateLabel(txn.dateISO)}
              {time ? ` · ${time}` : ""}
            </DetailRow>
            <DetailRow label="Category">
              <span className="inline-flex items-center gap-2">
                {CatIcon && <CatIcon className="size-4 text-muted-foreground" aria-hidden />}
                {cat?.label ?? txn.category}
              </span>
            </DetailRow>
            <DetailRow label="Paid via">{payModeLabel(txn.payMode)}</DetailRow>
            {accountName && <DetailRow label="Account">{accountName}</DetailRow>}
            {txn.goalId && <DetailRow label="Linked goal">Savings goal contribution</DetailRow>}
            {txn.billId && <DetailRow label="Linked bill">Bill payment</DetailRow>}
            {txn.tags && txn.tags.length > 0 && (
              <DetailRow label="Tags">{txn.tags.join(", ")}</DetailRow>
            )}
          </dl>

          <button
            type="button"
            onClick={onOpenExpenses}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Open in expenses <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right font-semibold text-foreground">{children}</dd>
    </div>
  );
}
