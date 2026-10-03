import { Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";

export type TxnStatus = "success" | "pending" | "failed";

/** Initials from a display name: "Aarav Sharma" -> "AS". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  if (first === "") return "•";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? "";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/**
 * Transaction row: avatar circle (initials) | name + secondary line |
 * right-aligned signed amount colored gain/loss. Renders as a <button> when
 * onClick is provided (keyboard-focusable with visible focus ring).
 */
export function TxnRow({
  name,
  secondary,
  amountPaise,
  status = "success",
  onClick,
  className,
}: {
  name: string;
  /** Date line, e.g. "3 Oct 2026 · UPI". */
  secondary?: string;
  /** Signed paise: positive = money in (gain), negative = money out (loss). */
  amountPaise: number;
  status?: TxnStatus;
  onClick?: () => void;
  className?: string;
}) {
  const inFlow = amountPaise >= 0;
  const content = (
    <>
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark"
      >
        {initialsOf(name)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          {secondary}
          {status === "pending" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning uppercase">
              <Clock className="size-3" aria-hidden /> Pending
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger uppercase">
              <XCircle className="size-3" aria-hidden /> Failed
            </span>
          )}
        </span>
      </span>
      <NumberDisplay
        paise={amountPaise}
        signed
        className={cn(
          "shrink-0 text-sm font-bold",
          status === "failed" ? "text-muted-foreground" : inFlow ? "text-gain" : "text-loss",
        )}
      />
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-3 rounded-2xl px-3 py-3",
    onClick && "transition-colors hover:bg-muted/60",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
        aria-label={`${name}, ${secondary ?? ""}, amount ${amountPaise / 100} rupees${status !== "success" ? `, ${status}` : ""}`}
      >
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
