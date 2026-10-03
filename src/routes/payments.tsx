import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  ExternalLink,
  History,
  Loader2,
  Plus,
  Send,
  Wallet,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AmountInput,
  EmptyState,
  ErrorState,
  NumberDisplay,
  PaymentSheet,
  ReceiptView,
  SearchDropdown,
  TestModeBanner,
  TxnRow,
  initialsOf,
} from "@/components/fv";
import type { TxnStatus } from "@/components/fv";
import { useAccountSummaries, useAddTransaction, useTransactions } from "@/lib/finance/hooks";
import { todayISO } from "@/lib/finance/format";
import {
  buildUpiNote,
  groupTransactionsByMonth,
  isPaymentTransaction,
  isSetupPendingError,
  toTxnStatus,
  useCreatePaymentLink,
  usePaymentLinks,
  usePayments,
  useRazorpayStatus,
  type PaymentRecord,
} from "@/lib/payments";
import type { Transaction } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — FinVerse AI" },
      {
        name: "description",
        content:
          "Send simulated UPI payments and try Razorpay test-mode payments. No real money moves.",
      },
    ],
  }),
  component: PaymentsPage,
});

type Tab = "send" | "razorpay" | "history";
type UpiPhase = "home" | "recipient" | "amount" | "processing" | "receipt";
type RzPhase = "amount" | "waiting" | "done";

const RAIL_LABEL: Record<string, string> = {
  upi_test: "UPI · Test",
  razorpay_test: "Razorpay · Test",
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("send");

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-28">
      <header className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-2xl bg-tint">
          <Send className="size-5 text-primary" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">Payments</h1>
          <p className="text-xs text-muted-foreground">Simulated rails — no real money moves</p>
        </div>
      </header>

      <TestModeBanner className="mt-4" />

      <nav
        aria-label="Payments sections"
        className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted/60 p-1"
      >
        {(
          [
            { id: "send", label: "Send", icon: Send },
            { id: "razorpay", label: "Razorpay", icon: CreditCard },
            { id: "history", label: "History", icon: History },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-colors",
              tab === id
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {tab === "send" && <SendTab />}
        {tab === "razorpay" && <RazorpayTab />}
        {tab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}

// ── Simulated UPI tab ───────────────────────────────────────────────────────

function SendTab() {
  const [phase, setPhase] = useState<UpiPhase>("home");
  const [payeeName, setPayeeName] = useState("");
  const [amountPaise, setAmountPaise] = useState(0);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [receipt, setReceipt] = useState<null | {
    status: "success" | "failure";
    txn?: Transaction;
    reason?: string;
  }>(null);

  const { data: transactions } = useTransactions();
  const { data: summaries, isLoading: accountsLoading } = useAccountSummaries();
  const addTransaction = useAddTransaction();

  const payees = useMemo(() => {
    const seen = new Map<string, { name: string; at: string }>();
    for (const t of transactions ?? []) {
      if (t.type !== "expense" || t.payMode !== "upi_test") continue;
      const name = t.note.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const prev = seen.get(key);
      if (!prev || t.createdAt > prev.at) seen.set(key, { name, at: t.createdAt });
    }
    return [...seen.values()].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  }, [transactions]);

  const accounts = summaries ?? [];
  const selectedAccount =
    accounts.find((s) => s.account.id === accountId) ??
    accounts.find((s) => s.account.isDefault) ??
    accounts[0];
  const effectiveAccountId = selectedAccount?.account.id ?? null;
  const overBalance =
    selectedAccount != null && amountPaise > 0 && amountPaise > selectedAccount.balancePaise;

  const startFor = (name: string) => {
    setPayeeName(name);
    setReceipt(null);
    setAmountPaise(0);
    setPhase("amount");
  };

  const confirmPayment = async () => {
    if (!effectiveAccountId) return;
    setSheetOpen(false);
    setPhase("processing");
    try {
      const [created] = await Promise.all([
        addTransaction.mutateAsync({
          type: "expense",
          amountPaise,
          category: "others",
          note: buildUpiNote(payeeName),
          dateISO: todayISO(),
          payMode: "upi_test",
          accountId: effectiveAccountId,
        }),
        delay(1000), // simulated network / bank processing
      ]);
      // Success is shown ONLY after the ledger write resolves.
      setReceipt({ status: "success", txn: created });
    } catch (err) {
      setReceipt({
        status: "failure",
        reason: err instanceof Error ? err.message : "The payment could not be recorded.",
      });
    }
    setPhase("receipt");
  };

  const reset = () => {
    setPhase("home");
    setReceipt(null);
    setPayeeName("");
    setAmountPaise(0);
    setSheetOpen(false);
  };

  return (
    <div>
      {phase === "home" && (
        <div className="flex flex-col gap-5">
          <SearchDropdown
            groups={[
              {
                label: "People",
                items: payees.map((p) => ({
                  id: p.name,
                  title: p.name,
                  subtitle: "Recent payee",
                })),
              },
            ]}
            onSelect={(item) => startFor(item.title)}
            placeholder="Search people…"
          />

          {payees.length > 0 ? (
            <section aria-label="Recent payees">
              <h2 className="text-sm font-bold text-foreground">Recent</h2>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {payees.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => startFor(p.name)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors hover:bg-muted/60"
                  >
                    <span
                      aria-hidden
                      className="grid size-14 place-items-center rounded-full bg-tint text-base font-bold text-primary-dark"
                    >
                      {initialsOf(p.name)}
                    </span>
                    <span className="w-full truncate text-center text-xs font-semibold text-foreground">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState
              title="No payees yet"
              body="Your simulated UPI payments will appear here. Start your first test payment below."
            />
          )}

          <button
            type="button"
            onClick={() => {
              setPayeeName("");
              setReceipt(null);
              setPhase("recipient");
            }}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-bold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="size-5" aria-hidden /> New payment
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Simulated UPI — settles instantly in your FinVerse ledger. No real money moves.
          </p>
        </div>
      )}

      {phase === "recipient" && (
        <RecipientStep
          initial={payeeName}
          onBack={() => setPhase("home")}
          onContinue={(name) => startFor(name)}
        />
      )}

      {phase === "amount" && (
        <div className="flex flex-col gap-4">
          <StepHeader title={`Pay ${payeeName || "someone"}`} onBack={() => setPhase("home")} />
          <TestModeBanner />
          {accountsLoading ? (
            <Skeleton className="h-14 rounded-2xl" />
          ) : accounts.length === 0 ? (
            <ErrorState
              title="No accounts yet"
              body="Create an account first — simulated UPI payments debit a FinVerse account."
            />
          ) : (
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
              <Wallet className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">Paying from</span>
                <select
                  aria-label="Funding account"
                  value={effectiveAccountId ?? ""}
                  onChange={(e) => setAccountId(e.target.value || null)}
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
          <AmountInput
            confirmLabel="Continue"
            onConfirm={(paise) => {
              setAmountPaise(paise);
              setSheetOpen(true);
            }}
          />
        </div>
      )}

      {phase === "processing" && (
        <div className="flex flex-col gap-4">
          <TestModeBanner />
          <ReceiptView status="processing" amountPaise={amountPaise} counterparty={payeeName} />
        </div>
      )}

      {phase === "receipt" && receipt && (
        <div className="flex flex-col gap-4">
          <TestModeBanner />
          <ReceiptView
            status={receipt.status}
            amountPaise={amountPaise}
            counterparty={payeeName}
            {...(receipt.txn
              ? { referenceId: receipt.txn.id, timestamp: formatDateTime(receipt.txn.createdAt) }
              : {})}
            {...(receipt.reason ? { reason: receipt.reason } : {})}
            onRetry={() => {
              setReceipt(null);
              setAmountPaise(0);
              setPhase("amount");
            }}
            retryLabel={receipt.status === "failure" ? "Retry payment" : "Pay again"}
          />
          <button
            type="button"
            onClick={reset}
            className="mx-auto text-sm font-semibold text-primary hover:underline"
          >
            Back to payments
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Test mode — this was a simulated payment. No real money moved.
          </p>
        </div>
      )}

      <PaymentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        recipientName={payeeName || "Recipient"}
        recipientDetail="Simulated UPI"
        amountPaise={amountPaise}
        fundingSource={selectedAccount?.account.name ?? "Account"}
        {...(selectedAccount
          ? {
              fundingDetail: `Balance ${(selectedAccount.balancePaise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}`,
            }
          : {})}
        onProceed={confirmPayment}
        onUseAnotherMethod={() => setSheetOpen(false)}
      >
        <div className="mt-3">
          <TestModeBanner />
        </div>
        {overBalance && (
          <p
            role="alert"
            className="mt-3 rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger"
          >
            Insufficient balance in {selectedAccount?.account.name}. Lower the amount or pick
            another account.
          </p>
        )}
      </PaymentSheet>
    </div>
  );
}

function StepHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="grid size-10 place-items-center rounded-full text-foreground hover:bg-muted/60"
      >
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <h2 className="truncate text-base font-bold text-foreground">{title}</h2>
    </div>
  );
}

function RecipientStep({
  initial,
  onBack,
  onContinue,
}: {
  initial: string;
  onBack: () => void;
  onContinue: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const valid = buildUpiNote(name).length > 0;
  return (
    <div className="flex flex-col gap-4">
      <StepHeader title="New payment" onBack={onBack} />
      <TestModeBanner />
      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-foreground">Recipient name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aarav Sharma"
          maxLength={120}
          autoFocus
          className="h-13 rounded-2xl border border-input bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>
      <button
        type="button"
        disabled={!valid}
        onClick={() => onContinue(buildUpiNote(name))}
        className={cn(
          "h-13 rounded-full py-3.5 text-base font-bold transition-colors",
          valid
            ? "bg-primary text-primary-foreground hover:bg-primary-hover"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        Continue
      </button>
    </div>
  );
}

// ── Razorpay test-mode tab ──────────────────────────────────────────────────

function RazorpayTab() {
  const [rzPhase, setRzPhase] = useState<RzPhase>("amount");
  const [waitingLinkId, setWaitingLinkId] = useState<string | null>(null);
  const [waitingShortUrl, setWaitingShortUrl] = useState<string | null>(null);
  const [doneRecord, setDoneRecord] = useState<PaymentRecord | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const statusQuery = useRazorpayStatus();
  const linksQuery = usePaymentLinks(rzPhase === "waiting");
  const paymentsQuery = usePayments(rzPhase === "waiting");
  const createLink = useCreatePaymentLink();

  const configured = statusQuery.data?.configured ?? false;
  const waitingRecord: PaymentRecord | undefined = (paymentsQuery.data ?? []).find(
    (p) => p.paymentLinkId === waitingLinkId,
  );

  // Success is derived ONLY from the webhook-populated row.
  const settled =
    waitingRecord && waitingRecord.status === "captured" && waitingRecord.webhookVerified
      ? "success"
      : waitingRecord && waitingRecord.status === "failed"
        ? "failed"
        : null;

  const startLink = async (amountPaise: number) => {
    setCreateError(null);
    try {
      const created = await createLink.mutateAsync({ amountPaise, note: "FinVerse test payment" });
      setWaitingLinkId(created.linkId);
      setWaitingShortUrl(created.shortUrl);
      setRzPhase("waiting");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create the payment link.");
    }
  };

  const resetRazorpay = () => {
    setRzPhase("amount");
    setWaitingLinkId(null);
    setWaitingShortUrl(null);
    setDoneRecord(null);
    setCreateError(null);
  };

  if (statusQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <ErrorState
        title="Couldn't check Razorpay status"
        body="We couldn't reach the server to check whether Razorpay test mode is configured."
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  if (!configured) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="grid size-14 place-items-center rounded-full bg-tint">
          <CreditCard className="size-6 text-primary" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-foreground">Razorpay test keys not configured</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Razorpay test mode needs server-only keys. Add{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">RAZORPAY_KEY_ID</code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            RAZORPAY_KEY_SECRET
          </code>{" "}
          (test-mode keys only) to the server environment, plus{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          for the webhook. Then register the webhook URL in the Razorpay dashboard (test mode):
        </p>
        <code className="block truncate rounded-xl bg-muted px-3 py-2 font-mono text-xs text-foreground">
          {typeof window !== "undefined" ? window.location.origin : ""}/api/razorpay-webhook
        </code>
        <p className="text-sm leading-6 text-muted-foreground">
          Nothing here is a real payment — and nothing here fakes one either. Until the keys are
          set, this rail stays honestly unavailable.
        </p>
      </div>
    );
  }

  if (isSetupPendingError(linksQuery.error) || isSetupPendingError(paymentsQuery.error)) {
    return (
      <ErrorState
        title="Payments database setup pending"
        body="The payments tables don't exist yet. Run supabase/migrations/0002_revamp.sql in the Supabase SQL editor, then try again."
        onRetry={() => {
          linksQuery.refetch();
          paymentsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <TestModeBanner />

      {rzPhase === "amount" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Razorpay test payment</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Creates a real Razorpay <span className="font-semibold">test-mode</span> payment link
              and opens it in a new tab. Pay with Razorpay's test credentials, then return here —
              success is confirmed by the webhook, never by this screen.
            </p>
          </div>
          <AmountInput confirmLabel="Create test payment link" onConfirm={startLink} />
          {createError && (
            <p
              role="alert"
              className="rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger"
            >
              {createError}
            </p>
          )}
        </div>
      )}

      {rzPhase === "waiting" && !settled && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <span
            role="status"
            aria-label="Waiting for payment"
            className="grid size-16 place-items-center rounded-full bg-info-soft"
          >
            <Loader2 className="size-8 animate-spin text-info" aria-hidden />
          </span>
          <h2 className="text-base font-bold text-foreground">Waiting for payment…</h2>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            The test payment link opened in a new tab. Complete the payment there, then come back —
            this screen polls for the webhook confirmation every few seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {waitingShortUrl && (
              <button
                type="button"
                onClick={() => window.open(waitingShortUrl, "_blank", "noopener,noreferrer")}
                className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
              >
                <ExternalLink className="size-4" aria-hidden /> Reopen payment link
              </button>
            )}
            <button
              type="button"
              onClick={resetRazorpay}
              className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted/60"
            >
              <X className="size-4" aria-hidden /> Cancel
            </button>
          </div>
        </div>
      )}

      {rzPhase === "waiting" && settled && waitingRecord && (
        <div className="flex flex-col gap-4">
          <TestModeBanner />
          <ReceiptView
            status={settled === "success" ? "success" : "failure"}
            amountPaise={waitingRecord.amountPaise}
            counterparty="Razorpay test payment"
            referenceId={waitingRecord.razorpayPaymentId}
            timestamp={formatDateTime(waitingRecord.createdAt)}
            {...(waitingRecord.failureReason ? { reason: waitingRecord.failureReason } : {})}
            onRetry={resetRazorpay}
            retryLabel="New test payment"
          />
          {settled === "success" && (
            <p className="text-center text-xs text-muted-foreground">
              Confirmed by webhook — captured and verified. Test mode, no real money moved.
            </p>
          )}
        </div>
      )}

      {rzPhase === "done" && doneRecord && (
        <div className="flex flex-col gap-4">
          <TestModeBanner />
          <ReceiptView
            status={
              doneRecord.status === "captured"
                ? "success"
                : doneRecord.status === "failed"
                  ? "failure"
                  : "processing"
            }
            amountPaise={doneRecord.amountPaise}
            counterparty="Razorpay test payment"
            referenceId={doneRecord.razorpayPaymentId}
            timestamp={formatDateTime(doneRecord.createdAt)}
            {...(doneRecord.failureReason ? { reason: doneRecord.failureReason } : {})}
            onRetry={resetRazorpay}
            retryLabel="New test payment"
          />
        </div>
      )}

      <RecentLinks
        onSelect={(r) => {
          setDoneRecord(r);
          setRzPhase("done");
        }}
      />
    </div>
  );
}

function RecentLinks({ onSelect }: { onSelect: (r: PaymentRecord) => void }) {
  const { data: links, isLoading } = usePaymentLinks(false);
  const { data: payments } = usePayments(false);

  const byLink = useMemo(() => {
    const m = new Map<string, PaymentRecord>();
    for (const p of payments ?? []) {
      if (p.paymentLinkId && !m.has(p.paymentLinkId)) m.set(p.paymentLinkId, p);
    }
    return m;
  }, [payments]);

  if (isLoading) return <Skeleton className="h-32 rounded-2xl" />;
  if (!links || links.length === 0) return null;

  return (
    <section aria-label="Recent payment links" className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-foreground">Recent links</h2>
      {links.slice(0, 5).map((l) => {
        const rec = byLink.get(l.id);
        const chip: { label: string; tone: "gain" | "loss" | "neutral" } = rec
          ? rec.status === "captured"
            ? { label: "Captured", tone: "gain" }
            : rec.status === "failed"
              ? { label: "Failed", tone: "loss" }
              : { label: "Pending", tone: "neutral" }
          : l.status === "paid"
            ? { label: "Paid", tone: "gain" }
            : l.status === "expired" || l.status === "cancelled"
              ? { label: l.status === "expired" ? "Expired" : "Cancelled", tone: "neutral" }
              : { label: "Open", tone: "neutral" };
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => rec && onSelect(rec)}
            disabled={!rec}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-card",
              rec ? "hover:bg-muted/40" : "opacity-80",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-foreground">
                <NumberDisplay paise={l.amountPaise} />
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {formatDateTime(l.createdAt)}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                chip.tone === "gain" && "bg-gain/15 text-gain",
                chip.tone === "loss" && "bg-loss/15 text-loss",
                chip.tone === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              {chip.label}
            </span>
            {rec && <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
          </button>
        );
      })}
    </section>
  );
}

// ── History tab ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const [detail, setDetail] = useState<Transaction | null>(null);
  const txnsQuery = useTransactions();
  const paymentsQuery = usePayments(false);

  const paymentTxns = useMemo(
    () => (txnsQuery.data ?? []).filter(isPaymentTransaction),
    [txnsQuery.data],
  );
  const groups = useMemo(() => groupTransactionsByMonth(paymentTxns), [paymentTxns]);

  const paymentByTxnId = useMemo(() => {
    const m = new Map<string, PaymentRecord>();
    for (const p of paymentsQuery.data ?? []) {
      if (p.transactionId) m.set(p.transactionId, p);
    }
    return m;
  }, [paymentsQuery.data]);

  const statusOf = (t: Transaction): TxnStatus => {
    if (t.payMode === "razorpay_test") {
      return toTxnStatus(paymentByTxnId.get(t.id)?.status ?? "created");
    }
    return "success";
  };

  const nameOf = (t: Transaction) =>
    t.payMode === "upi_test" ? t.note || "UPI payment" : "Razorpay test payment";

  if (txnsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (txnsQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load payment history"
        body="We couldn't load your payments. Check your connection and try again."
        onRetry={() => txnsQuery.refetch()}
      />
    );
  }

  if (paymentTxns.length === 0) {
    return (
      <EmptyState
        title="No payments yet"
        body="Simulated UPI payments and Razorpay test payments will show up here, grouped by month."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <section key={g.monthKey} aria-label={g.label}>
          <h2 className="sticky top-0 z-10 bg-background/95 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground backdrop-blur">
            {g.label}
          </h2>
          <div className="mt-1 flex flex-col">
            {g.items.map((t) => (
              <TxnRow
                key={t.id}
                name={nameOf(t)}
                secondary={`${formatDay(t.dateISO)} · ${RAIL_LABEL[t.payMode] ?? t.payMode}`}
                amountPaise={-t.amountPaise}
                status={statusOf(t)}
                onClick={() => setDetail(t)}
              />
            ))}
          </div>
        </section>
      ))}

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogTitle className="sr-only">Payment receipt</DialogTitle>
          {detail &&
            (() => {
              const rec = paymentByTxnId.get(detail.id);
              return (
                <HistoryDetail
                  txn={detail}
                  {...(rec ? { record: rec } : {})}
                  status={statusOf(detail)}
                />
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoryDetail({
  txn,
  record,
  status,
}: {
  txn: Transaction;
  record?: PaymentRecord;
  status: TxnStatus;
}) {
  const receiptStatus =
    status === "success" ? "success" : status === "failed" ? "failure" : "processing";
  return (
    <div className="flex flex-col gap-3">
      <TestModeBanner />
      <ReceiptView
        status={receiptStatus}
        amountPaise={txn.amountPaise}
        counterparty={
          txn.payMode === "upi_test" ? txn.note || "UPI payment" : "Razorpay test payment"
        }
        referenceId={record?.razorpayPaymentId ?? txn.id}
        timestamp={formatDateTime(txn.createdAt)}
        {...(record?.failureReason ? { reason: record.failureReason } : {})}
      />
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <dt className="font-semibold text-muted-foreground uppercase">Rail</dt>
          <dd className="mt-0.5 font-bold text-foreground">
            {RAIL_LABEL[txn.payMode] ?? txn.payMode}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <dt className="font-semibold text-muted-foreground uppercase">Method</dt>
          <dd className="mt-0.5 font-bold text-foreground tabular-nums">
            {record?.method ? record.method.toUpperCase() : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
