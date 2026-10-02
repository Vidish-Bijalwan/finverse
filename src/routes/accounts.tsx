import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRightLeft, Landmark, Pencil, Plus, Star, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AccountDialog } from "@/components/money/AccountDialog";
import { TransferDialog } from "@/components/money/TransferDialog";
import { ConfirmDeleteDialog } from "@/components/money/ConfirmDeleteDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { iconForName } from "@/lib/finance/categories";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { useAccountSummaries, useDeleteAccount, useSetDefaultAccount } from "@/lib/finance/hooks";
import type { Account, AccountType } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — FinVerse AI" },
      {
        name: "description",
        content: "Cash, UPI, and bank accounts with live balances. Transfer between them.",
      },
    ],
  }),
  component: AccountsPage,
});

const TYPE_LABEL: Record<AccountType, string> = {
  cash: "Cash",
  upi: "UPI",
  bank: "Bank",
};

function AccountsPage() {
  const { data: summaries, isLoading, isError } = useAccountSummaries();
  const deleteAccount = useDeleteAccount();
  const setDefault = useSetDefaultAccount();

  const [accountDialog, setAccountDialog] = useState<null | { editing?: Account | null }>(null);
  const [transferDialog, setTransferDialog] = useState<null | { fromAccountId?: string }>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);

  const list = summaries ?? [];
  const total = list.reduce((sum, s) => sum + s.balancePaise, 0);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <button
          type="button"
          onClick={() => setAccountDialog({ editing: null })}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Total across accounts */}
      <div className="mt-3 rounded-3xl bg-card p-5 shadow-tile">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-48" />
          </div>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total balance
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
              {formatINR(total)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {list.length} {list.length === 1 ? "account" : "accounts"} · updates live as
              you add transactions
            </p>
          </>
        )}
      </div>

      {/* Transfer CTA */}
      <button
        type="button"
        onClick={() => setTransferDialog({})}
        disabled={list.length < 2}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed",
          "border-muted-foreground/30 py-3.5 text-sm font-bold text-muted-foreground transition-colors",
          "hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <ArrowRightLeft className="h-5 w-5" /> Transfer between accounts
      </button>

      {/* Account cards */}
      <div className="mt-4 flex flex-col gap-3">
        {isLoading && (
          <div className="flex flex-col gap-3" aria-label="Loading accounts">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-3xl bg-card p-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-2 h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-3xl bg-card px-6 py-10 text-center shadow-tile">
            <p className="text-sm font-semibold">Couldn't load accounts</p>
            <p className="mt-1 text-sm text-muted-foreground">Pull to refresh or try again.</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          list.map(({ account, balancePaise }) => {
            const Icon = iconForName(account.iconName);
            return (
              <article
                key={account.id}
                className="rounded-3xl bg-card p-4 shadow-tile"
                aria-label={account.name}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${account.color}1f`, color: account.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-base font-bold">
                      {account.name}
                      {account.isDefault && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          <Star className="h-3 w-3" /> Default
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{TYPE_LABEL[account.type]}</p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-lg font-bold tabular-nums",
                      balancePaise < 0 ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {formatINRShort(balancePaise)}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1 border-t border-border/60 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferDialog({ fromAccountId: account.id })}
                    disabled={list.length < 2}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                  >
                    <ArrowRightLeft className="h-4 w-4" /> Transfer
                  </button>
                  {!account.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        setDefault.mutate(account.id, {
                          onSuccess: () =>
                            toast.success(`“${account.name}” is now the default account`),
                          onError: () => toast.error("Couldn't update — try again."),
                        })
                      }
                      disabled={setDefault.isPending}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      <Star className="h-4 w-4" /> Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAccountDialog({ editing: account })}
                    aria-label={`Edit ${account.name}`}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(account)}
                    aria-label={`Delete ${account.name}`}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}

        {!isLoading && !isError && list.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-12 text-center shadow-tile">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Wallet className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold">No accounts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your cash wallet, UPI handle, or bank account to track live balances.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAccountDialog({ editing: null })}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Add account
            </button>
          </div>
        )}
      </div>

      {/* Explainer */}
      <div className="mt-4 flex gap-3 rounded-2xl bg-muted p-4">
        <Landmark className="h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-5 text-muted-foreground">
          Balances update automatically: every expense debits its account, every income credits it,
          and transfers move money between two accounts. Deleting an account moves its history to
          your default account — nothing is lost.
        </p>
      </div>

      <AccountDialog
        open={accountDialog !== null}
        onOpenChange={(o) => !o && setAccountDialog(null)}
        editing={accountDialog?.editing ?? null}
      />
      <TransferDialog
        open={transferDialog !== null}
        onOpenChange={(o) => !o && setTransferDialog(null)}
        {...(transferDialog?.fromAccountId ? { fromAccountId: transferDialog.fromAccountId } : {})}
      />
      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete account?"
        description={
          deleting
            ? `“${deleting.name}” will be removed and its transactions moved to your default account.`
            : ""
        }
        pending={deleteAccount.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteAccount.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Account deleted");
              setDeleting(null);
            },
            onError: (e) =>
              toast.error(e instanceof Error ? e.message : "Couldn't delete — try again."),
          });
        }}
      />
    </div>
  );
}
