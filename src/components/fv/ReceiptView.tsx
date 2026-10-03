import { Check, Download, Loader2, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type ReceiptStatus = "success" | "failure" | "processing";

/**
 * Result screen: success / failure / processing. Success shows an animated
 * check (CSS-drawn, skipped under reduced motion), amount + counterparty
 * recap, reference ID row, and Download / Pay-again actions. Failure shows
 * the reason with Retry.
 */
export function ReceiptView({
  status,
  amountPaise,
  counterparty,
  referenceId,
  timestamp,
  reason,
  onDownload,
  onRetry,
  retryLabel,
  className,
}: {
  status: ReceiptStatus;
  amountPaise: number;
  counterparty: string;
  referenceId?: string;
  timestamp?: string;
  /** Failure reason shown on the failure state. */
  reason?: string;
  onDownload?: () => void;
  /** Failure: retry. Success: "Pay again". */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={cn("flex flex-col items-center px-6 py-8 text-center", className)}>
      {status === "processing" && (
        <span
          role="status"
          aria-label="Processing"
          className="grid size-20 place-items-center rounded-full bg-info-soft"
        >
          <Loader2 className={cn("size-10 text-info", !reduced && "animate-spin")} aria-hidden />
        </span>
      )}

      {status === "success" && (
        <span
          role="img"
          aria-label="Payment successful"
          className={cn(
            "grid size-20 place-items-center rounded-full bg-gain/15",
            !reduced && "fv-check-pop",
          )}
        >
          <svg viewBox="0 0 24 24" className="size-10" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("text-gain", !reduced && "fv-check-draw")}
            />
            <Check className="hidden" aria-hidden />
          </svg>
        </span>
      )}

      {status === "failure" && (
        <span
          role="img"
          aria-label="Payment failed"
          className={cn(
            "grid size-20 place-items-center rounded-full bg-loss/15",
            !reduced && "fv-check-pop",
          )}
        >
          <X className="size-10 text-loss" strokeWidth={3} aria-hidden />
        </span>
      )}

      <h2 className="mt-4 text-xl font-bold text-foreground">
        {status === "success" && "Payment successful"}
        {status === "failure" && "Payment failed"}
        {status === "processing" && "Processing payment"}
      </h2>

      <NumberDisplay
        paise={amountPaise}
        className={cn(
          "mt-2 text-3xl font-bold",
          status === "failure" ? "text-muted-foreground" : "text-foreground",
        )}
      />
      <p className="mt-1 text-sm text-muted-foreground">
        {status === "success" ? "Paid to" : status === "failure" ? "To" : "Paying"}{" "}
        <span className="font-semibold text-foreground">{counterparty}</span>
      </p>

      {status === "failure" && reason && (
        <p
          role="alert"
          className="mt-3 max-w-sm rounded-2xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger"
        >
          {reason}
        </p>
      )}

      <dl className="mt-6 w-full max-w-sm rounded-2xl border border-border bg-card text-left shadow-card">
        {referenceId && (
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <dt className="text-xs font-semibold text-muted-foreground uppercase">Reference ID</dt>
            <dd className="truncate font-mono text-sm text-foreground">{referenceId}</dd>
          </div>
        )}
        {timestamp && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="text-xs font-semibold text-muted-foreground uppercase">Time</dt>
            <dd className="text-sm text-foreground tabular-nums">{timestamp}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            <Download className="size-4" aria-hidden /> Download receipt
          </button>
        )}
        {onRetry && status !== "processing" && (
          <button
            type="button"
            onClick={onRetry}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted/60"
          >
            <RotateCcw className="size-4" aria-hidden />
            {retryLabel ?? (status === "failure" ? "Retry payment" : "Pay again")}
          </button>
        )}
      </div>
    </div>
  );
}
