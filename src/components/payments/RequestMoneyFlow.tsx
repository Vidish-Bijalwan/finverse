import { useState } from "react";
import { Check, Clock, HandCoins, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AmountInput,
  ErrorState,
  NumberDisplay,
  Pill,
  initialsOf,
  pressable,
} from "@/components/fv";
import { useAccountSummaries } from "@/lib/finance/hooks";
import { formatINR } from "@/lib/finance/format";
import {
  allowedRequestTransitions,
  pendingReceivablePaise,
  useCreatePaymentRequest,
  useDeletePaymentRequest,
  usePaymentRequests,
  useSettlePaymentRequest,
  useTransitionPaymentRequest,
  type PaymentRequest,
  type PaymentRequestStatus,
} from "@/lib/payment-requests";
import { PaymentsSetupPendingError, isSetupPendingError } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { FlowHeader } from "./FlowHeader";
import type { PayeePerson } from "@/lib/payment-contacts";

type Phase = "list" | "create" | "amount" | "sent";

const STATUS_PILL: Record<
  PaymentRequestStatus,
  { label: string; variant: "info" | "gain" | "loss" | "neutral" }
> = {
  pending: { label: "Pending", variant: "info" },
  paid: { label: "Paid", variant: "gain" },
  declined: { label: "Declined", variant: "loss" },
  cancelled: { label: "Cancelled", variant: "neutral" },
};

/**
 * Payment requests ("request money"): create → pending → paid/declined/
 * cancelled. Settling records a real income transaction; nothing auto-
 * settles. Distinct pending state is shown on the sent screen and cards.
 */
export function RequestMoneySection({
  people,
  onExit,
  initialPhase = "list",
}: {
  people: PayeePerson[];
  /** Return to the payments home. */
  onExit: () => void;
  /** Start directly at the create step (deep-link). */
  initialPhase?: "list" | "create";
}) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const requestsQuery = usePaymentRequests();
  const requests = requestsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      {phase !== "list" && (
        <FlowHeader
          title={phase === "create" ? "Request money" : "New request"}
          onBack={() => (phase === "sent" ? onExit() : setPhase("list"))}
        />
      )}
      {requestsQuery.isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {requestsQuery.isError && isSetupPendingError(requestsQuery.error) && (
        <ErrorState
          title="Requests aren't set up yet"
          body="Requests unlock after a quick database update — run supabase/migrations/0003_payment_requests.sql in the Supabase SQL editor, then try again."
          onRetry={() => requestsQuery.refetch()}
        />
      )}

      {requestsQuery.isError && !isSetupPendingError(requestsQuery.error) && (
        <ErrorState
          title="Couldn't load requests"
          body="We couldn't load your payment requests. Check your connection and try again."
          onRetry={() => requestsQuery.refetch()}
        />
      )}

      {requestsQuery.isSuccess && phase === "list" && (
        <>
          {pendingReceivablePaise(requests) > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
              <span className="text-sm text-muted-foreground">Pending receivable</span>
              <NumberDisplay
                paise={pendingReceivablePaise(requests)}
                className="text-base font-bold text-foreground"
              />
            </div>
          )}
          {requests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <span aria-hidden className="grid size-12 place-items-center rounded-full bg-tint">
                <HandCoins className="size-6 text-primary" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                No requests yet. Create one to track money someone owes you — mark it paid when it
                arrives and it lands in your ledger.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {requests.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setPhase("create")}
            className={cn(
              pressable,
              "flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover",
            )}
          >
            <HandCoins className="size-4" aria-hidden /> New request
          </button>
        </>
      )}

      {phase === "create" && (
        <RequestCreateStep people={people} onContinue={() => setPhase("amount")} />
      )}
      {phase === "amount" && (
        <RequestAmountStep onBack={() => setPhase("create")} onSent={() => setPhase("sent")} />
      )}
      {phase === "sent" && <RequestSentPanel onDone={onExit} />}
    </div>
  );
}

// Draft shared between the create steps (module-level so back-navigation keeps it).
const draft: { personName: string; note: string; amountPaise: number } = {
  personName: "",
  note: "",
  amountPaise: 0,
};

function resetDraft() {
  draft.personName = "";
  draft.note = "";
  draft.amountPaise = 0;
}

function RequestCreateStep({
  people,
  onContinue,
}: {
  people: PayeePerson[];
  onContinue: () => void;
}) {
  const [personName, setPersonName] = useState(draft.personName);
  const [note, setNote] = useState(draft.note);
  const [touched, setTouched] = useState(false);
  const valid = personName.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-foreground">Request from</span>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="e.g. Meera"
          maxLength={120}
          autoFocus
          className="h-12 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        {touched && !valid && (
          <span className="text-xs font-semibold text-loss">Enter who you're requesting from.</span>
        )}
      </label>

      {people.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-bold text-muted-foreground uppercase">
            Recent
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {people.slice(0, 8).map((p) => (
              <button
                key={p.name.toLowerCase()}
                type="button"
                onClick={() => setPersonName(p.name)}
                className={cn(
                  pressable,
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                  personName === p.name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden
                  className="grid size-6 place-items-center rounded-full bg-tint text-[10px] font-bold text-primary-dark"
                >
                  {initialsOf(p.name)}
                </span>
                <span className="max-w-28 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

      <button
        type="button"
        onClick={() => {
          setTouched(true);
          if (!valid) return;
          draft.personName = personName.trim();
          draft.note = note.trim();
          onContinue();
        }}
        className={cn(
          pressable,
          "h-12 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover",
        )}
      >
        Continue
      </button>
    </div>
  );
}

function RequestAmountStep({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const createRequest = useCreatePaymentRequest();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Requesting from <span className="font-bold text-foreground">{draft.personName}</span>
        {draft.note && (
          <>
            {" · "}
            <span className="text-foreground">{draft.note}</span>
          </>
        )}
      </p>
      <AmountInput
        confirmLabel={createRequest.isPending ? "Sending…" : "Send request"}
        processing={createRequest.isPending}
        onConfirm={async (paise) => {
          setError(null);
          draft.amountPaise = paise;
          try {
            await createRequest.mutateAsync({
              personName: draft.personName,
              amountPaise: paise,
              ...(draft.note ? { note: draft.note } : {}),
            });
            resetDraft();
            onSent();
          } catch (err) {
            setError(
              err instanceof PaymentsSetupPendingError
                ? "Requests need the database update first — run supabase/migrations/0003_payment_requests.sql in the Supabase SQL editor."
                : err instanceof Error
                  ? err.message
                  : "Couldn't create the request.",
            );
          }
        }}
      />
      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onBack}
        className={cn(pressable, "mx-auto text-sm font-semibold text-primary hover:underline")}
      >
        Change recipient
      </button>
    </div>
  );
}

function RequestSentPanel({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      <span
        role="img"
        aria-label="Request pending"
        className="grid size-20 place-items-center rounded-full bg-info/15"
      >
        <Clock className="size-10 text-info" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-bold text-foreground">Request sent</h2>
      <NumberDisplay
        paise={draft.amountPaise}
        className="mt-2 text-3xl font-bold text-foreground"
      />
      <p className="mt-1 text-sm text-muted-foreground">
        Requested from <span className="font-semibold text-foreground">{draft.personName}</span>
      </p>
      <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
        Status: <span className="font-bold text-info">Pending</span>. When the money arrives, open
        the request and mark it paid — it will be recorded in your ledger.
      </p>
      <button
        type="button"
        onClick={onDone}
        className={cn(
          pressable,
          "mt-6 flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary-hover",
        )}
      >
        Done
      </button>
    </div>
  );
}

/** A single payment-request row with its legal actions. Exported for the payments home preview. */
export function RequestCard({ request }: { request: PaymentRequest }) {
  const [settleOpen, setSettleOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const transition = useTransitionPaymentRequest();
  const deleteRequest = useDeletePaymentRequest();
  const pill = STATUS_PILL[request.status];
  const transitions = allowedRequestTransitions(request.status);

  const doTransition = (to: Exclude<PaymentRequestStatus, "pending">) => {
    transition.mutate(
      { request, to },
      {
        onSuccess: () =>
          toast.success(to === "declined" ? "Request marked as declined" : "Request cancelled"),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <li className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark"
        >
          {initialsOf(request.personName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{request.personName}</p>
          {request.note && <p className="truncate text-xs text-muted-foreground">{request.note}</p>}
          <p className="text-xs text-muted-foreground">
            {new Date(request.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <NumberDisplay
            paise={request.amountPaise}
            className="text-sm font-bold text-foreground"
          />
          <Pill variant={pill.variant} size="sm" dot>
            {pill.label}
          </Pill>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setSettleOpen(true)}
            disabled={transition.isPending}
            className={cn(
              pressable,
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-gain/15 px-4 text-sm font-bold text-gain hover:bg-gain/25 disabled:opacity-50",
            )}
          >
            <Check className="size-4" aria-hidden /> Mark as paid
          </button>
          <button
            type="button"
            onClick={() => doTransition("declined")}
            disabled={transition.isPending}
            className={cn(
              pressable,
              "flex h-10 items-center justify-center gap-1.5 rounded-full border border-border px-4 text-sm font-bold text-muted-foreground hover:bg-muted/60 disabled:opacity-50",
            )}
          >
            <X className="size-4" aria-hidden /> Decline
          </button>
          <button
            type="button"
            onClick={() => (confirmDelete ? doTransition("cancelled") : setConfirmDelete(true))}
            onBlur={() => setConfirmDelete(false)}
            disabled={transition.isPending}
            aria-label={confirmDelete ? "Confirm cancel request" : "Cancel request"}
            className={cn(
              pressable,
              "flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-bold disabled:opacity-50",
              confirmDelete
                ? "border-loss/40 bg-loss/10 text-loss"
                : "border-border text-muted-foreground hover:bg-muted/60",
            )}
          >
            <Trash2 className="size-4" aria-hidden />
            {confirmDelete ? "Confirm" : "Cancel"}
          </button>
        </div>
      )}

      {request.status !== "pending" && (
        <div className="mt-3 flex justify-end border-t border-border pt-3">
          <button
            type="button"
            onClick={() =>
              deleteRequest.mutate(request.id, {
                onSuccess: () => toast.success("Request deleted"),
                onError: () => toast.error("Couldn't delete — try again."),
              })
            }
            disabled={deleteRequest.isPending}
            className={cn(
              pressable,
              "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-muted-foreground hover:bg-muted/60 disabled:opacity-50",
            )}
          >
            <Trash2 className="size-3.5" aria-hidden /> Delete
          </button>
        </div>
      )}

      <SettleDialog request={request} open={settleOpen} onOpenChange={setSettleOpen} />
    </li>
  );
}

function SettleDialog({
  request,
  open,
  onOpenChange,
}: {
  request: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: summaries } = useAccountSummaries();
  const settle = useSettlePaymentRequest();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accounts = summaries ?? [];
  const effectiveId =
    accountId ?? accounts.find((s) => s.account.isDefault)?.account.id ?? accounts[0]?.account.id;

  const submit = async () => {
    setError(null);
    try {
      await settle.mutateAsync({ request, ...(effectiveId ? { accountId: effectiveId } : {}) });
      toast.success(`Received ${formatINR(request.amountPaise)} from ${request.personName}`, {
        description: "Recorded as income in your ledger.",
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't settle the request.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-base font-bold text-foreground">Mark as paid</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className={cn(
              pressable,
              "grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          This records{" "}
          <NumberDisplay paise={request.amountPaise} className="font-bold text-foreground" /> from{" "}
          <span className="font-bold text-foreground">{request.personName}</span> as income. Only do
          this when the money has actually arrived.
        </p>
        {accounts.length > 0 && (
          <label className="mt-3 flex flex-col gap-1.5">
            <span className="text-sm font-bold text-foreground">Received into</span>
            <select
              aria-label="Destination account"
              value={effectiveId ?? ""}
              onChange={(e) => setAccountId(e.target.value || null)}
              className="h-12 rounded-xl border border-input bg-card px-3 text-sm font-bold text-foreground outline-none focus:border-primary"
            >
              {accounts.map((s) => (
                <option key={s.account.id} value={s.account.id}>
                  {s.account.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={settle.isPending}
          className={cn(
            pressable,
            "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-50",
          )}
        >
          {settle.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {settle.isPending ? "Recording…" : "Confirm — money received"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
