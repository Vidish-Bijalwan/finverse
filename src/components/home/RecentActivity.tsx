import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, TxnRow } from "@/components/fv";
import { categoryById } from "@/lib/finance/categories";
import type { Transaction } from "@/lib/finance/types";
import { recentTransactions, signedAmountPaise, txnSecondary } from "./home-data";

/**
 * Recent activity (§14): 5–7 payment-app-style rows — merchant avatar
 * (initials), name, date/time/category context, signed tabular amount.
 * Recorded transactions are settled, so no status badges are shown
 * (no badge-stuffing). Tapping a row opens the receipt/detail sheet;
 * swipe left still reveals categorize/delete.
 */
export function RecentActivity({
  txns,
  loading,
  onCategorize,
  onDelete,
  onOpenDetail,
  onAddExpense,
}: {
  txns: Transaction[];
  loading: boolean;
  onCategorize: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onOpenDetail: (t: Transaction) => void;
  onAddExpense: () => void;
}) {
  const recent = recentTransactions(txns, 7);

  return (
    <section
      aria-label="Recent activity"
      className="min-w-0 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="truncate text-[15px] font-bold text-foreground">Recent activity</h2>
        <Link
          to="/expenses"
          search={{}}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {loading ? (
        <ul className="space-y-1" aria-label="Loading transactions">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-3 w-1/3 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-20 rounded-lg" />
            </li>
          ))}
        </ul>
      ) : recent.length === 0 ? (
        <EmptyState title="No transactions yet" actionLabel="Add expense" onAction={onAddExpense} />
      ) : (
        <ul className="flex flex-col gap-2">
          {recent.map((t) => {
            const cat = categoryById(t.category);
            const name = t.note || cat?.label || t.category;
            return (
              <li key={t.id}>
                <TxnRow
                  name={name}
                  secondary={txnSecondary(t, t.note.trim().length > 0)}
                  amountPaise={signedAmountPaise(t)}
                  onClick={() => onOpenDetail(t)}
                  swipeActions={{
                    onCategorize: () => onCategorize(t),
                    onDelete: () => onDelete(t),
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
