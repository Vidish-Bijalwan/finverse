import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  AtSign,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  ExternalLink,
  HandCoins,
  History,
  Landmark,
  Loader2,
  Plus,
  QrCode,
  ReceiptIndianRupee,
  Search,
  Send,
  Smartphone,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AmountInput,
  CategorizeSheet,
  EmptyState,
  ErrorState,
  NumberDisplay,
  PaymentSheet,
  Pill,
  ReceiptView,
  TxnRow,
  pressable,
} from "@/components/fv";
import type { TxnStatus } from "@/components/fv";
import { AccountDialog } from "@/components/money/AccountDialog";
import { QrScannerDialog } from "@/components/payments/QrScannerDialog";
import { RechargeDialog } from "@/components/payments/RechargeDialog";
import { PeopleStrip } from "@/components/payments/PeopleStrip";
import { PeopleSearch } from "@/components/payments/PeopleSearch";
import { FlowHeader } from "@/components/payments/FlowHeader";
import { BankTransferFlow } from "@/components/payments/BankTransferFlow";
import { BillsCard } from "@/components/payments/BillsCard";
import { RequestCard, RequestMoneySection } from "@/components/payments/RequestMoneyFlow";
import {
  useAccountSummaries,
  useAddTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/lib/finance/hooks";
import { formatINR, todayISO } from "@/lib/finance/format";
import { canAfford } from "@/lib/finance/afford";
import {
  MAX_PAYMENT_PAISE,
  buildUpiNote,
  canRefundPayment,
  groupTransactionsByMonth,
  isPaymentTransaction,
  isSetupPendingError,
  paymentDisplayStatus,
  refundedTxnIds,
  toTxnStatus,
  useCreatePaymentLink,
  usePaymentLinks,
  usePayments,
  useRazorpayStatus,
  useRefundPayment,
  type PaymentRecord,
} from "@/lib/payments";
import { usePaymentRequests } from "@/lib/payment-requests";
import {
  buildUpiNoteWithUserNote,
  extractPeople,
  isValidMobileNumber,
  isValidUpiId,
  parsePayeeNote,
  type PayeePerson,
} from "@/lib/payment-contacts";
import { downloadReceipt } from "@/lib/payment-receipt";
import type { Transaction } from "@/lib/finance/types";
import type { UpiPayload } from "@/lib/upi-qr";
import { cn } from "@/lib/utils";

export interface PaymentsSearch {
  /** Deep-link into a send flow: "recipient" | "upi-id" | "upi" (QR scan) | "bank" | "request". */
  flow?: string | undefined;
  /** Deep-link into a tab: "send" | "razorpay" | "history". */
  tab?: string | undefined;
  upiId?: string | undefined;
  name?: string | undefined;
  amount?: string | undefined;
}

export const Route = createFileRoute("/payments")({
  validateSearch: (search: Record<string, unknown>): PaymentsSearch => ({
    flow: typeof search["flow"] === "string" ? (search["flow"] as string) : undefined,
    tab: typeof search["tab"] === "string" ? (search["tab"] as string) : undefined,
    upiId: typeof search["upiId"] === "string" ? (search["upiId"] as string) : undefined,
    name: typeof search["name"] === "string" ? (search["name"] as string) : undefined,
    amount: typeof search["amount"] === "string" ? (search["amount"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payments — FinVerse AI" },
      {
        name: "description",
        content:
          "Send simulated UPI and bank payments, request money, pay bills, and try Razorpay test-mode payments. No real money moves.",
      },
    ],
  }),
  component: PaymentsPage,
});

type Tab = "send" | "razorpay" | "history";

const RAIL_LABEL: Record<string, string> = {
  upi_test: "UPI · Test",
  razorpay_test: "Razorpay · Test",
  bank_test: "Bank · Test",
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
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(
    search.tab === "razorpay" ? "razorpay" : search.tab === "history" ? "history" : "send",
  );

  // Keep the tab in sync when arriving via a deep-link while already here.
  useEffect(() => {
    if (search.tab === "razorpay") setTab("razorpay");
    else if (search.tab === "history") setTab("history");
    else if (search.tab === "send") setTab("send");
  }, [search.tab]);

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

      <nav
        aria-label="Payments sections"
        className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted/60 p-1"
      >
        {(
          [
            { id: "send", label: "Pay", icon: Send },
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
              pressable,
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
        {tab === "send" && <PayTab search={search} />}
        {tab === "razorpay" && <RazorpayTab />}
        {tab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}

// ── Pay hub ─────────────────────────────────────────────────────────────────

type PayView =
  | { name: "home" }
  | { name: "send-recipient" }
  | { name: "send-amount" }
  | { name: "send-processing" }
  | { name: "send-receipt" }
  | { name: "bank" }
  | { name: "request"; initialPhase?: "list" | "create" };

function PayTab({ search }: { search: PaymentsSearch }) {
  const navigate = useNavigate();
  const [view, setView] = useState<PayView>({ name: "home" });

  // Send-flow state
  const [payeeMode, setPayeeMode] = useState<"name" | "upi-id">("name");
  const [payeeName, setPayeeName] = useState("");
  const [amountPaise, setAmountPaise] = useState(0);
  const [note, setNote] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [receipt, setReceipt] = useState<null | {
    status: "success" | "failure";
    txn?: Transaction;
    reason?: string;
  }>(null);
  const [refund, setRefund] = useState<null | { txn: Transaction }>(null);

  // Dialogs on the home
  const [scanOpen, setScanOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const billsRef = useRef<HTMLDivElement>(null);

  const { data: transactions } = useTransactions();
  const { data: summaries, isLoading: accountsLoading } = useAccountSummaries();
  const requestsQuery = usePaymentRequests();
  const addTransaction = useAddTransaction();
  const deleteTransaction = useDeleteTransaction();
  const refundPayment = useRefundPayment();

  const people = useMemo(
    () => extractPeople(transactions ?? [], requestsQuery.data ?? []),
    [transactions, requestsQuery.data],
  );
  const refundedIds = useMemo(() => refundedTxnIds(transactions ?? []), [transactions]);
  const pendingRequests = useMemo(
    () => (requestsQuery.data ?? []).filter((r) => r.status === "pending"),
    [requestsQuery.data],
  );

  const accounts = summaries ?? [];
  const selectedAccount =
    accounts.find((s) => s.account.id === accountId) ??
    accounts.find((s) => s.account.isDefault) ??
    accounts[0];
  const effectiveAccountId = selectedAccount?.account.id ?? null;
  const overBalance =
    selectedAccount != null &&
    amountPaise > 0 &&
    !canAfford(selectedAccount.balancePaise, amountPaise);

  const resetSend = () => {
    setPayeeName("");
    setAmountPaise(0);
    setNote("");
    setSheetOpen(false);
    setReceipt(null);
    setRefund(null);
  };
  const goHome = () => {
    resetSend();
    setView({ name: "home" });
  };

  /** Start the UPI send flow for a person (name prefilled, straight to amount). */
  const startSendTo = (name: string, mode: "name" | "upi-id" = "name") => {
    resetSend();
    setPayeeMode(mode);
    setPayeeName(name);
    setView({ name: "send-amount" });
  };

  const startBlankSend = (mode: "name" | "upi-id") => {
    resetSend();
    setPayeeMode(mode);
    setView({ name: "send-recipient" });
  };

  // Deep-link flows from dashboard quick actions / QR scanner. Re-applies
  // when the search params change (e.g. scanning a second QR while here).
  const appliedKey = useRef("");
  useEffect(() => {
    const key = JSON.stringify({
      flow: search.flow,
      upiId: search.upiId,
      name: search.name,
      amount: search.amount,
    });
    if (appliedKey.current === key) return;
    appliedKey.current = key;
    if (search.flow === "recipient") startBlankSend("name");
    else if (search.flow === "upi-id") startBlankSend("upi-id");
    else if (search.flow === "upi" && (search.name || search.upiId)) {
      resetSend();
      setPayeeMode("upi-id");
      setPayeeName(search.name ?? search.upiId ?? "");
      const paise = search.amount !== undefined ? Number(search.amount) : NaN;
      setAmountPaise(Number.isFinite(paise) && paise > 0 ? Math.round(paise) : 0);
      setView({ name: "send-amount" });
    } else if (search.flow === "bank") {
      resetSend();
      setView({ name: "bank" });
    } else if (search.flow === "request") {
      resetSend();
      setView({ name: "request", initialPhase: "create" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.flow, search.upiId, search.name, search.amount]);

  const confirmPayment = async () => {
    if (!effectiveAccountId) return;
    setSheetOpen(false);
    // Defense in depth: the proceed button is disabled while overBalance,
    // but the mutation path itself must never record an uncovered payment.
    if (overBalance) {
      setReceipt({
        status: "failure",
        reason: `Insufficient balance in ${selectedAccount?.account.name ?? "the account"} — the payment was not recorded.`,
      });
      setView({ name: "send-receipt" });
      return;
    }
    setView({ name: "send-processing" });
    try {
      const [created] = await Promise.all([
        addTransaction.mutateAsync({
          type: "expense",
          amountPaise,
          category: "others",
          note: buildUpiNoteWithUserNote(payeeName, note),
          dateISO: todayISO(),
          payMode: "upi_test",
          accountId: effectiveAccountId,
        }),
        delay(1000), // simulated network / bank processing
      ]);
      // Success is shown ONLY after the ledger write resolves.
      setReceipt({ status: "success", txn: created });
      toast.success("Payment recorded", {
        description: `${formatINR(amountPaise)} to ${payeeName || "recipient"} · simulated UPI`,
        action: {
          label: "Undo",
          onClick: () => {
            // Undo reverses the ledger write for real.
            deleteTransaction.mutate(created.id, {
              onSuccess: () => toast.success("Payment reversed"),
              onError: () => toast.error("Couldn't reverse — delete it from History."),
            });
          },
        },
        duration: 8000,
      });
    } catch (err) {
      setReceipt({
        status: "failure",
        reason: err instanceof Error ? err.message : "The payment could not be recorded.",
      });
    }
    setView({ name: "send-receipt" });
  };

  const handleScan = (payload: UpiPayload) => {
    setScanOpen(false);
    void navigate({
      to: "/payments",
      search: {
        flow: "upi",
        upiId: payload.upiId,
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.amountPaise !== null ? { amount: String(payload.amountPaise) } : {}),
      },
    });
  };

  const doRefund = async () => {
    if (!receipt?.txn) return;
    try {
      const refundTxn = await refundPayment.mutateAsync({ payment: receipt.txn });
      setRefund({ txn: refundTxn });
      toast.success("Refund recorded", {
        description: `${formatINR(receipt.txn.amountPaise)} credited back · simulated`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't record the refund — try again.");
    }
  };

  // ── Flow views ──

  if (view.name === "send-recipient") {
    return (
      <RecipientStep
        initial={payeeName}
        mode={payeeMode}
        onBack={goHome}
        onContinue={(name) => startSendTo(name, payeeMode)}
      />
    );
  }

  if (view.name === "send-amount") {
    return (
      <div className="flex flex-col gap-4">
        <FlowHeader title={`Pay ${payeeName || "someone"}`} onBack={goHome} />
        <p className="text-xs text-muted-foreground">Simulated UPI — no real money moves.</p>
        {accountsLoading ? (
          <Skeleton className="h-14 rounded-2xl" />
        ) : accounts.length === 0 ? (
          <div className="flex flex-col gap-3">
            <ErrorState
              title="No accounts yet"
              body="Create an account first — simulated UPI payments debit a FinVerse account."
            />
            <button
              type="button"
              onClick={() => setAccountDialogOpen(true)}
              className={cn(
                pressable,
                "h-12 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover",
              )}
            >
              Create account
            </button>
          </div>
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

        <PaymentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          recipientName={payeeName || "Recipient"}
          recipientDetail={
            payeeMode === "upi-id" && isValidUpiId(payeeName) ? payeeName : "Simulated UPI"
          }
          amountPaise={amountPaise}
          fundingSource={selectedAccount?.account.name ?? "Account"}
          {...(selectedAccount
            ? {
                fundingDetail: `Balance ${formatINR(selectedAccount.balancePaise)}`,
              }
            : {})}
          onProceed={confirmPayment}
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

        <AccountDialog
          open={accountDialogOpen}
          onOpenChange={setAccountDialogOpen}
          editing={null}
        />
      </div>
    );
  }

  if (view.name === "send-processing") {
    return (
      <div className="flex flex-col gap-4">
        <ReceiptView status="processing" amountPaise={amountPaise} counterparty={payeeName} />
      </div>
    );
  }

  if (view.name === "send-receipt" && receipt) {
    if (refund) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <span
              role="img"
              aria-label="Refund recorded"
              className="grid size-20 place-items-center rounded-full bg-gain/15"
            >
              <Check className="size-10 text-gain" strokeWidth={3} aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-bold text-foreground">Refund recorded</h2>
            <NumberDisplay
              paise={amountPaise}
              className="mt-2 text-3xl font-bold text-foreground"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Credited back to{" "}
              <span className="font-semibold text-foreground">
                {selectedAccount?.account.name ?? "your account"}
              </span>
            </p>
            <dl className="mt-6 w-full max-w-sm rounded-2xl border border-border bg-card text-left shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <dt className="text-xs font-semibold text-muted-foreground uppercase">
                  Reference ID
                </dt>
                <dd className="truncate font-mono text-sm text-foreground">{refund.txn.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <dt className="text-xs font-semibold text-muted-foreground uppercase">Time</dt>
                <dd className="text-sm text-foreground tabular-nums">
                  {formatDateTime(refund.txn.createdAt)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              The original payment now shows the Refunded status in History.
            </p>
          </div>
          <button
            type="button"
            onClick={goHome}
            className={cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline")}
          >
            Back to payments
          </button>
        </div>
      );
    }
    const parsed = parsePayeeNote("upi_test", receipt.txn?.note ?? payeeName);
    const refundable =
      receipt.status === "success" && receipt.txn && canRefundPayment(receipt.txn, refundedIds);
    return (
      <div className="flex flex-col gap-4">
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
            setView({ name: "send-amount" });
          }}
          retryLabel={receipt.status === "failure" ? "Retry payment" : "Pay again"}
        />
        {refundable && <RefundButton onRefund={doRefund} pending={refundPayment.isPending} />}
        {parsed?.userNote && (
          <p className="mx-auto max-w-sm text-center text-sm text-muted-foreground">
            <span className="font-semibold">Note:</span> {parsed.userNote}
          </p>
        )}
        <div className="mx-auto flex max-w-sm flex-col gap-2">
          {receipt.status === "success" && receipt.txn && (
            <button
              type="button"
              onClick={() =>
                downloadReceipt(
                  {
                    statusLabel: "Success",
                    amountPaise,
                    counterparty: payeeName,
                    railLabel: RAIL_LABEL["upi_test"] ?? "UPI · Test",
                    referenceId: receipt.txn ? receipt.txn.id : undefined,
                    timestamp: receipt.txn ? formatDateTime(receipt.txn.createdAt) : undefined,
                    ...(parsed?.userNote ? { note: parsed.userNote } : {}),
                  },
                  `finverse-receipt-${receipt.txn?.id.slice(0, 8) ?? "receipt"}.txt`,
                )
              }
              className={cn(
                pressable,
                "flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted/60",
              )}
            >
              <Download className="size-4" aria-hidden /> Download receipt
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={goHome}
          className={cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline")}
        >
          Back to payments
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Test mode — this was a simulated payment. No real money moved.
        </p>
      </div>
    );
  }

  if (view.name === "bank") {
    return <BankTransferFlow onExit={goHome} />;
  }

  if (view.name === "request") {
    return (
      <RequestMoneySection
        people={people}
        onExit={goHome}
        {...(view.initialPhase ? { initialPhase: view.initialPhase } : {})}
      />
    );
  }

  // ── Home ──
  const actions: {
    id: string;
    label: string;
    sub: string;
    icon: typeof Send;
    onClick: () => void;
  }[] = [
    {
      id: "scan",
      label: "Scan & Pay",
      sub: "QR code",
      icon: QrCode,
      onClick: () => setScanOpen(true),
    },
    {
      id: "pay-anyone",
      label: "Pay anyone",
      sub: "By name",
      icon: Users,
      onClick: () => startBlankSend("name"),
    },
    {
      id: "bank",
      label: "Bank transfer",
      sub: "Account + IFSC",
      icon: Landmark,
      onClick: () => setView({ name: "bank" }),
    },
    {
      id: "upi-id",
      label: "UPI ID",
      sub: "name@bank",
      icon: AtSign,
      onClick: () => startBlankSend("upi-id"),
    },
    {
      id: "request",
      label: "Request",
      sub: "Ask for money",
      icon: HandCoins,
      onClick: () => setView({ name: "request" }),
    },
    {
      id: "recharge",
      label: "Recharge",
      sub: "Mobile",
      icon: Smartphone,
      onClick: () => setRechargeOpen(true),
    },
    {
      id: "bills",
      label: "Bills",
      sub: "Utilities",
      icon: ReceiptIndianRupee,
      onClick: () => billsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PeopleSearch
        people={people}
        onSelectPerson={(p) => startSendTo(p.name)}
        onPayUpiId={(upiId) => startSendTo(upiId, "upi-id")}
      />

      <section aria-label="Payment actions">
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
          {actions.map(({ id, label, sub, icon: Icon, onClick }) => (
            <li key={id}>
              <button
                type="button"
                onClick={onClick}
                aria-label={label}
                className={cn(
                  pressable,
                  "group flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
                )}
              >
                <span
                  aria-hidden
                  className="grid size-12 place-items-center rounded-2xl border border-border/70 bg-card text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors group-hover:border-primary/40 group-hover:bg-primary/10"
                >
                  <Icon className="size-5" strokeWidth={2.1} />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-foreground">
                  {label}
                </span>
                <span className="-mt-1 text-[10px] leading-tight text-muted-foreground">{sub}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Recent people" className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">People</h2>
        <PeopleStrip people={people} onSelect={(p) => startSendTo(p.name)} />
        <div className="flex">
          <button
            type="button"
            onClick={() => startBlankSend("name")}
            className={cn(
              pressable,
              "flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover",
            )}
          >
            <Plus className="size-4" aria-hidden /> New payment
          </button>
        </div>
      </section>

      {pendingRequests.length > 0 && (
        <section aria-label="Pending requests" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              Requests · {pendingRequests.length} pending
            </h2>
            <button
              type="button"
              onClick={() => setView({ name: "request" })}
              className={cn(pressable, "text-xs font-bold text-primary hover:underline")}
            >
              View all
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {pendingRequests.slice(0, 2).map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </ul>
        </section>
      )}

      <div ref={billsRef} className="scroll-mt-4">
        <BillsCard />
      </div>

      <QrScannerDialog open={scanOpen} onOpenChange={setScanOpen} onScan={handleScan} />
      <RechargeDialog open={rechargeOpen} onOpenChange={setRechargeOpen} />
    </div>
  );
}

/** Two-tap confirm refund button (danger-styled on confirm). */
function RefundButton({ onRefund, pending }: { onRefund: () => void; pending: boolean }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirming) {
            setConfirming(false);
            onRefund();
          } else {
            setConfirming(true);
          }
        }}
        onBlur={() => setConfirming(false)}
        className={cn(
          pressable,
          "flex h-12 items-center justify-center gap-2 rounded-full border text-sm font-bold transition-colors disabled:opacity-50",
          confirming
            ? "border-loss/40 bg-loss/10 text-loss hover:bg-loss/20"
            : "border-border bg-card text-foreground hover:bg-muted/60",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Recording refund…
          </>
        ) : confirming ? (
          "Tap again to confirm refund"
        ) : (
          "Refund this payment"
        )}
      </button>
      {confirming && !pending && (
        <p className="text-center text-xs text-muted-foreground">
          This credits the amount back to the funding account.
        </p>
      )}
    </div>
  );
}

function RecipientStep({
  initial,
  mode = "name",
  onBack,
  onContinue,
}: {
  initial: string;
  /** "name" = free-text recipient; "upi-id" = UPI ID or 10-digit mobile. */
  mode?: "name" | "upi-id";
  onBack: () => void;
  onContinue: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const trimmed = buildUpiNote(name);
  const valid =
    mode === "name" ? trimmed.length > 0 : isValidUpiId(trimmed) || isValidMobileNumber(trimmed);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className={cn(
            pressable,
            "grid size-10 place-items-center rounded-full text-foreground hover:bg-muted/60",
          )}
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <h2 className="truncate text-base font-bold text-foreground">New payment</h2>
      </div>
      <p className="text-xs text-muted-foreground">Simulated UPI — no real money moves.</p>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-foreground">
          {mode === "name" ? "Recipient name" : "UPI ID or mobile number"}
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={mode === "name" ? "e.g. Aarav Sharma" : "name@bank or 98765 43210"}
          maxLength={120}
          autoFocus
          className="h-13 rounded-2xl border border-input bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>
      <p className="-mt-2 text-xs text-muted-foreground">
        {mode === "name"
          ? "Pay anyone by name — the payment is recorded in your FinVerse ledger."
          : "Enter the recipient's UPI ID (name@bank) or 10-digit mobile number."}
      </p>
      <button
        type="button"
        disabled={!valid}
        onClick={() => onContinue(buildUpiNote(name))}
        className={cn(
          pressable,
          "h-12 rounded-full px-8 text-sm font-bold transition-colors",
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
  const [rzPhase, setRzPhase] = useState<"amount" | "waiting" | "done">("amount");
  const [waitingLinkId, setWaitingLinkId] = useState<string | null>(null);
  const [waitingShortUrl, setWaitingShortUrl] = useState<string | null>(null);
  const [doneRecord, setDoneRecord] = useState<PaymentRecord | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);

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
      <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4 shadow-card sm:p-6">
        <div className="grid size-14 place-items-center rounded-full bg-tint">
          <CreditCard className="size-6 text-primary" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-foreground">Razorpay test keys not configured</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Nothing here is a real payment — and nothing here fakes one either. Until the test-mode
          keys are set, this rail stays honestly unavailable.
        </p>
        <div className="overflow-hidden rounded-[14px] border border-border">
          <button
            type="button"
            aria-expanded={setupOpen}
            onClick={() => setSetupOpen((o) => !o)}
            className={cn(
              pressable,
              "flex w-full items-center justify-between px-4 py-3 text-left",
            )}
          >
            <span className="text-sm font-bold text-foreground">Setup instructions</span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                setupOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {setupOpen && (
            <div className="flex flex-col gap-3 border-t border-border px-4 py-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Razorpay test mode needs server-only keys. Add{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  RAZORPAY_KEY_ID
                </code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  RAZORPAY_KEY_SECRET
                </code>{" "}
                (test-mode keys only) to the server environment, plus{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>{" "}
                for the webhook. Then register the webhook URL in the Razorpay dashboard (test
                mode):
              </p>
              <code className="block truncate rounded-xl bg-muted px-3 py-2 font-mono text-xs text-foreground">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /api/razorpay-webhook
              </code>
            </div>
          )}
        </div>
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
          <AmountInput
            confirmLabel={createLink.isPending ? "Creating…" : "Create test payment link"}
            processing={createLink.isPending}
            onConfirm={startLink}
          />
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
                className={cn(
                  pressable,
                  "flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover",
                )}
              >
                <ExternalLink className="size-4" aria-hidden /> Reopen payment link
              </button>
            )}
            <button
              type="button"
              onClick={resetRazorpay}
              className={cn(
                pressable,
                "flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted/60",
              )}
            >
              <X className="size-4" aria-hidden /> Cancel
            </button>
          </div>
        </div>
      )}

      {rzPhase === "waiting" && settled && waitingRecord && (
        <div className="flex flex-col gap-4">
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
              pressable,
              "flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3 text-left shadow-card",
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

type HistoryFilter = "all" | "success" | "pending" | "failed" | "refunded";

const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "success", label: "Successful" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

function HistoryTab() {
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [categorizing, setCategorizing] = useState<Transaction | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const txnsQuery = useTransactions();
  const paymentsQuery = usePayments(false);
  const deleteTxn = useDeleteTransaction();
  const updateTxn = useUpdateTransaction();

  const refundedIds = useMemo(() => refundedTxnIds(txnsQuery.data ?? []), [txnsQuery.data]);

  const paymentTxns = useMemo(
    () => (txnsQuery.data ?? []).filter(isPaymentTransaction),
    [txnsQuery.data],
  );

  const paymentByTxnId = useMemo(() => {
    const m = new Map<string, PaymentRecord>();
    for (const p of paymentsQuery.data ?? []) {
      if (p.transactionId) m.set(p.transactionId, p);
    }
    return m;
  }, [paymentsQuery.data]);

  /** Distinct payment status: success / pending / failed / refunded. */
  const statusOf = (t: Transaction): "success" | "pending" | "failed" | "refunded" => {
    if (t.payMode === "razorpay_test") {
      return toTxnStatus(paymentByTxnId.get(t.id)?.status ?? "created");
    }
    return paymentDisplayStatus(t, refundedIds);
  };

  const nameOf = (t: Transaction) => {
    if (t.refundOf) return t.note || "Refund";
    if (t.payMode === "upi_test") {
      const parsed = parsePayeeNote("upi_test", t.note);
      return parsed ? `UPI · ${parsed.name}` : t.note || "UPI payment";
    }
    if (t.payMode === "bank_test") {
      const parsed = parsePayeeNote("bank_test", t.note);
      return parsed ? `Bank · ${parsed.name}` : "Bank transfer";
    }
    return "Razorpay test payment";
  };

  const rowStatus = (t: Transaction): TxnStatus => {
    const s = statusOf(t);
    // "refunded" has no TxnRow chip — it renders as success with "· Refunded"
    // in the secondary line, and distinctly in the detail dialog.
    return s === "refunded" ? "success" : s;
  };

  const secondaryOf = (t: Transaction) => {
    const base = `${formatDay(t.dateISO)} · ${RAIL_LABEL[t.payMode] ?? t.payMode}`;
    return statusOf(t) === "refunded" ? `${base} · Refunded` : base;
  };

  const q = query.trim().toLowerCase();
  const matchesQuery = (t: Transaction) =>
    q.length === 0 ||
    nameOf(t).toLowerCase().includes(q) ||
    t.note.toLowerCase().includes(q) ||
    String(t.amountPaise / 100).includes(q);

  const filtered = paymentTxns.filter(
    (t) =>
      matchesQuery(t) &&
      (filter === "all" ||
        (filter === "success" && statusOf(t) === "success") ||
        (filter === "pending" && statusOf(t) === "pending") ||
        (filter === "failed" && statusOf(t) === "failed") ||
        (filter === "refunded" && statusOf(t) === "refunded")),
  );
  const groups = useMemo(() => groupTransactionsByMonth(filtered), [filtered]);

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

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4 shadow-card focus-within:border-primary">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search payments…"
            aria-label="Search payment history"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className={cn(
                pressable,
                "grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted",
              )}
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
          {HISTORY_FILTERS.map(({ id, label }) => (
            <Pill
              key={id}
              size="md"
              variant={filter === id ? "accent" : "neutral"}
              onClick={() => setFilter(id)}
              label={`Show ${label.toLowerCase()} payments`}
            >
              {label}
            </Pill>
          ))}
        </div>

        {paymentTxns.length === 0 ? (
          <EmptyState
            title="No payments yet"
            body="Simulated UPI and bank payments plus Razorpay test payments will show up here, grouped by month."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            body="No payments match this search or filter. Try a different term."
          />
        ) : (
          groups.map((g) => (
            <section key={g.monthKey} aria-label={g.label}>
              <h2 className="sticky top-0 z-10 bg-background/95 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground backdrop-blur">
                {g.label}
              </h2>
              <div className="mt-1 flex flex-col gap-2">
                {g.items.map((t) => (
                  <TxnRow
                    key={t.id}
                    name={nameOf(t)}
                    secondary={secondaryOf(t)}
                    amountPaise={t.type === "income" ? t.amountPaise : -t.amountPaise}
                    status={rowStatus(t)}
                    onClick={() => setDetail(t)}
                    swipeActions={{
                      onCategorize: () => setCategorizing(t),
                      onDelete: () =>
                        deleteTxn.mutate(t.id, {
                          onSuccess: () => toast.success("Payment deleted"),
                          onError: () => toast.error("Couldn't delete — try again."),
                        }),
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}

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
                    refundedIds={refundedIds}
                    onClose={() => setDetail(null)}
                  />
                );
              })()}
          </DialogContent>
        </Dialog>
      </div>

      <CategorizeSheet
        open={categorizing !== null}
        onOpenChange={(o) => {
          if (!o) setCategorizing(null);
        }}
        currentCategory={categorizing?.category}
        onPick={(categoryId) => {
          const target = categorizing;
          setCategorizing(null);
          if (!target) return;
          updateTxn.mutate(
            { id: target.id, patch: { category: categoryId } },
            {
              onSuccess: () => toast.success("Payment recategorized"),
              onError: () => toast.error("Couldn't update — try again."),
            },
          );
        }}
      />
    </>
  );
}

const DETAIL_STATUS_LABEL: Record<"success" | "pending" | "failed" | "refunded", string> = {
  success: "Successful",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

function HistoryDetail({
  txn,
  record,
  status,
  refundedIds,
  onClose,
}: {
  txn: Transaction;
  record?: PaymentRecord;
  status: "success" | "pending" | "failed" | "refunded";
  refundedIds: Set<string>;
  onClose: () => void;
}) {
  const [confirmRefund, setConfirmRefund] = useState(false);
  const refundPayment = useRefundPayment();
  const refundable = canRefundPayment(txn, refundedIds);

  const receiptStatus =
    status === "success" || status === "refunded"
      ? "success"
      : status === "failed"
        ? "failure"
        : "processing";
  const counterparty = txn.refundOf
    ? txn.note || "Refund"
    : txn.payMode === "upi_test"
      ? (parsePayeeNote("upi_test", txn.note)?.name ?? txn.note ?? "UPI payment")
      : txn.payMode === "bank_test"
        ? (() => {
            const p = parsePayeeNote("bank_test", txn.note);
            return p ? `${p.name} · ${p.detail ?? ""}`.trim() : "Bank transfer";
          })()
        : "Razorpay test payment";

  const doRefund = async () => {
    try {
      await refundPayment.mutateAsync({ payment: txn });
      toast.success("Refund recorded", {
        description: `${formatINR(txn.amountPaise)} credited back · simulated`,
      });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't record the refund — try again.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ReceiptView
        status={receiptStatus}
        amountPaise={txn.amountPaise}
        counterparty={counterparty}
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
          <dt className="font-semibold text-muted-foreground uppercase">Status</dt>
          <dd
            className={cn(
              "mt-0.5 font-bold",
              status === "success" && "text-gain",
              status === "refunded" && "text-info",
              status === "failed" && "text-loss",
              status === "pending" && "text-info",
            )}
          >
            {DETAIL_STATUS_LABEL[status]}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <dt className="font-semibold text-muted-foreground uppercase">Method</dt>
          <dd className="mt-0.5 font-bold text-foreground tabular-nums">
            {record?.method ? record.method.toUpperCase() : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <dt className="font-semibold text-muted-foreground uppercase">Note</dt>
          <dd className="mt-0.5 truncate font-bold text-foreground">{txn.note || "—"}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() =>
            downloadReceipt(
              {
                statusLabel: DETAIL_STATUS_LABEL[status],
                amountPaise: txn.amountPaise,
                counterparty,
                railLabel: RAIL_LABEL[txn.payMode] ?? txn.payMode,
                referenceId: record?.razorpayPaymentId ?? txn.id,
                timestamp: formatDateTime(txn.createdAt),
                ...(txn.note ? { note: txn.note } : {}),
              },
              `finverse-receipt-${txn.id.slice(0, 8)}.txt`,
            )
          }
          className={cn(
            pressable,
            "flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted/60",
          )}
        >
          <Download className="size-4" aria-hidden /> Download receipt
        </button>
        {refundable && (
          <button
            type="button"
            disabled={refundPayment.isPending}
            onClick={() => {
              if (confirmRefund) {
                setConfirmRefund(false);
                void doRefund();
              } else {
                setConfirmRefund(true);
              }
            }}
            onBlur={() => setConfirmRefund(false)}
            className={cn(
              pressable,
              "flex h-11 items-center justify-center gap-2 rounded-full border text-sm font-bold transition-colors disabled:opacity-50",
              confirmRefund
                ? "border-loss/40 bg-loss/10 text-loss hover:bg-loss/20"
                : "border-border bg-card text-foreground hover:bg-muted/60",
            )}
          >
            {refundPayment.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Recording refund…
              </>
            ) : confirmRefund ? (
              "Tap again to confirm refund"
            ) : (
              "Refund this payment"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
