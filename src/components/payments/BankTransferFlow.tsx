import { useState } from "react";
import { Landmark } from "lucide-react";
import { toast } from "sonner";

import { AmountInput, NumberDisplay, PaymentSheet, ReceiptView, pressable } from "@/components/fv";
import { AccountDialog } from "@/components/money/AccountDialog";
import { useAccountSummaries, useAddTransaction } from "@/lib/finance/hooks";
import { formatINR, todayISO } from "@/lib/finance/format";
import { canAfford } from "@/lib/finance/afford";
import { buildBankNote, isValidAccountNumber, isValidIfsc } from "@/lib/payment-contacts";
import { MAX_PAYMENT_PAISE } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { FlowHeader } from "./FlowHeader";
import type { Transaction } from "@/lib/finance/types";

type Phase = "details" | "amount" | "processing" | "receipt";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Simulated bank transfer (NEFT/IMPS-style): beneficiary name + account
 * number + IFSC → amount → optional note → confirmation sheet → processing
 * → verified receipt. Writes a real ledger expense (pay_mode "bank_test");
 * no real money moves and every surface says so.
 */
export function BankTransferFlow({
  initial,
  onExit,
}: {
  /** Prefill from a deep-link (e.g. quick action). */
  initial?: { name?: string; accountNumber?: string; ifsc?: string };
  /** Return to the payments home. */
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("details");
  const [name, setName] = useState(initial?.name ?? "");
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber ?? "");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState(initial?.ifsc ?? "");
  const [touched, setTouched] = useState(false);
  const [note, setNote] = useState("");
  const [amountPaise, setAmountPaise] = useState(0);
  const [fundingAccountId, setFundingAccountId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [receipt, setReceipt] = useState<null | {
    status: "success" | "failure";
    txn?: Transaction;
    reason?: string;
  }>(null);

  const { data: summaries, isLoading: accountsLoading } = useAccountSummaries();
  const addTransaction = useAddTransaction();

  const accounts = summaries ?? [];
  const selectedAccount =
    accounts.find((s) => s.account.id === fundingAccountId) ??
    accounts.find((s) => s.account.isDefault) ??
    accounts[0];
  const effectiveAccountId = selectedAccount?.account.id ?? null;

  const digits = accountNumber.replace(/[\s-]/g, "");
  const confirmDigits = confirmAccountNumber.replace(/[\s-]/g, "");
  const nameValid = name.trim().length > 0;
  const accountValid = isValidAccountNumber(accountNumber);
  const confirmValid = confirmDigits === digits && digits.length > 0;
  const ifscValid = isValidIfsc(ifsc);
  const detailsValid = nameValid && accountValid && confirmValid && ifscValid;

  const overBalance =
    selectedAccount != null &&
    amountPaise > 0 &&
    !canAfford(selectedAccount.balancePaise, amountPaise);

  const confirmTransfer = async () => {
    if (!effectiveAccountId) return;
    setSheetOpen(false);
    // Defense in depth: the proceed button is disabled while overBalance,
    // but the mutation path itself must never record an uncovered transfer.
    if (overBalance) {
      setReceipt({
        status: "failure",
        reason: `Insufficient balance in ${selectedAccount?.account.name ?? "the account"} — the transfer was not recorded.`,
      });
      setPhase("receipt");
      return;
    }
    setPhase("processing");
    try {
      const [created] = await Promise.all([
        addTransaction.mutateAsync({
          type: "expense",
          amountPaise,
          category: "others",
          note: buildBankNote(name, digits, note),
          dateISO: todayISO(),
          payMode: "bank_test",
          accountId: effectiveAccountId,
        }),
        delay(1200), // simulated bank processing
      ]);
      // Success is shown ONLY after the ledger write resolves.
      setReceipt({ status: "success", txn: created });
      toast.success("Bank transfer recorded", {
        description: `${formatINR(amountPaise)} to ${name.trim()} ····${digits.slice(-4)} · simulated`,
      });
    } catch (err) {
      setReceipt({
        status: "failure",
        reason: err instanceof Error ? err.message : "The transfer could not be recorded.",
      });
    }
    setPhase("receipt");
  };

  return (
    <div className="flex flex-col gap-4">
      {phase === "details" && (
        <>
          <FlowHeader title="Bank transfer" onBack={onExit} />
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-tint"
            >
              <Landmark className="size-5 text-primary" />
            </span>
            <p className="text-sm text-muted-foreground">
              Transfer to any bank account. Simulated — settles in your FinVerse ledger, no real
              money moves.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">Beneficiary name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Verma"
              maxLength={120}
              autoFocus
              className="h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {touched && !nameValid && (
              <span className="text-xs font-semibold text-loss">Enter the beneficiary name.</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">Account number</span>
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 22))
              }
              placeholder="9–18 digits"
              autoComplete="off"
              className="h-12 rounded-xl border border-input bg-card px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {touched && !accountValid && (
              <span className="text-xs font-semibold text-loss">
                Enter a valid 9–18 digit account number.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">Confirm account number</span>
            <input
              type="text"
              inputMode="numeric"
              value={confirmAccountNumber}
              onChange={(e) =>
                setConfirmAccountNumber(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 22))
              }
              placeholder="Re-enter the account number"
              autoComplete="off"
              className="h-12 rounded-xl border border-input bg-card px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {touched && !confirmValid && (
              <span className="text-xs font-semibold text-loss">Account numbers don't match.</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">IFSC</span>
            <input
              type="text"
              value={ifsc}
              onChange={(e) =>
                setIfsc(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 11),
                )
              }
              placeholder="e.g. HDFC0001234"
              autoComplete="off"
              autoCapitalize="characters"
              className="h-12 rounded-xl border border-input bg-card px-3 text-sm font-mono uppercase tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {touched && !ifscValid && (
              <span className="text-xs font-semibold text-loss">
                Enter a valid IFSC (4 letters, 0, 6 characters).
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (detailsValid) {
                setTouched(false);
                setPhase("amount");
              }
            }}
            className={cn(
              pressable,
              "h-12 rounded-full text-sm font-bold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary-hover",
            )}
          >
            Continue
          </button>
        </>
      )}

      {phase === "amount" && (
        <>
          <FlowHeader title={`Transfer to ${name.trim()}`} onBack={() => setPhase("details")} />
          {accountsLoading ? (
            <div className="h-14 animate-pulse rounded-2xl bg-muted" />
          ) : accounts.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                Create an account first — simulated transfers debit a FinVerse account.
              </p>
              <button
                type="button"
                onClick={() => setAccountDialogOpen(true)}
                className={cn(
                  pressable,
                  "h-12 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover",
                )}
              >
                Create account
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
              <Landmark className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">Paying from</span>
                <select
                  aria-label="Funding account"
                  value={effectiveAccountId ?? ""}
                  onChange={(e) => setFundingAccountId(e.target.value || null)}
                  className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                >
                  {accounts.map((s) => (
                    <option key={s.account.id} value={s.account.id}>
                      {s.account.name}
                    </option>
                  ))}
                </select>
              </span>
              {selectedAccount && (
                <NumberDisplay
                  paise={selectedAccount.balancePaise}
                  className="text-sm font-bold text-foreground"
                />
              )}
            </label>
          )}
          <p className="rounded-2xl bg-muted/60 px-4 py-2.5 font-mono text-xs text-muted-foreground">
            {name.trim()} · A/c …{digits.slice(-4)} · {ifsc.trim().toUpperCase()}
          </p>
          <AmountInput
            confirmLabel="Continue"
            maxPaise={MAX_PAYMENT_PAISE}
            onConfirm={(paise) => {
              setAmountPaise(paise);
              setSheetOpen(true);
            }}
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              maxLength={200}
              className="h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </label>
        </>
      )}

      {phase === "processing" && (
        <>
          <ReceiptView
            status="processing"
            amountPaise={amountPaise}
            counterparty={`${name.trim()} ····${digits.slice(-4)}`}
          />
        </>
      )}

      {phase === "receipt" && receipt && (
        <>
          <ReceiptView
            status={receipt.status}
            amountPaise={amountPaise}
            counterparty={`${name.trim()} ····${digits.slice(-4)}`}
            {...(receipt.txn
              ? {
                  referenceId: receipt.txn.id,
                  timestamp: new Date(receipt.txn.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                }
              : {})}
            {...(receipt.reason ? { reason: receipt.reason } : {})}
            onRetry={() => {
              setReceipt(null);
              setAmountPaise(0);
              setPhase("amount");
            }}
            retryLabel={receipt.status === "failure" ? "Retry transfer" : "New transfer"}
          />
          <button
            type="button"
            onClick={onExit}
            className={cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline")}
          >
            Back to payments
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Test mode — this was a simulated transfer. No real money moved.
          </p>
        </>
      )}

      <PaymentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        recipientName={name.trim() || "Beneficiary"}
        recipientDetail={`Bank transfer · A/c …${digits.slice(-4)} · ${ifsc.trim().toUpperCase()}`}
        amountPaise={amountPaise}
        fundingSource={selectedAccount?.account.name ?? "Account"}
        onProceed={confirmTransfer}
        processing={addTransaction.isPending}
        proceedDisabled={overBalance}
        onUseAnotherMethod={() => setSheetOpen(false)}
      >
        {note.trim() && (
          <p className="mt-3 rounded-2xl bg-muted/60 px-4 py-2.5 text-sm text-foreground">
            <span className="font-semibold text-muted-foreground">Note: </span>
            {note.trim()}
          </p>
        )}
        {overBalance && (
          <p
            role="alert"
            className="mt-3 rounded-2xl border border-danger/40 bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger"
          >
            Insufficient balance in {selectedAccount?.account.name}. Lower the amount or pick
            another account.
          </p>
        )}
      </PaymentSheet>

      <AccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} editing={null} />
    </div>
  );
}
