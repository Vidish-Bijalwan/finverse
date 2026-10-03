import { Delete } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { applyBackspace, applyKey } from "@/lib/amount-keys";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const KEYS: (string | "back")[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"];

/**
 * Custom numeric keypad (no system keyboard). Keys: 1-9, 00, 0, backspace.
 * Emits digit strings; the parent owns paise-safe integer math.
 */
export function NumericKeypad({
  onKey,
  onBackspace,
  disabled = false,
  className,
}: {
  onKey: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className={cn("grid grid-cols-3 gap-2", className)}
      role="group"
      aria-label="Numeric keypad"
    >
      {KEYS.map((k) => {
        const isBack = k === "back";
        const label = isBack ? "Backspace" : k === "00" ? "Double zero" : k;
        return (
          <button
            key={k}
            type="button"
            disabled={disabled}
            aria-label={label}
            onClick={() => (isBack ? onBackspace() : onKey(k))}
            className={cn(
              "grid h-14 place-items-center rounded-2xl bg-keypad text-xl font-semibold text-keypad-foreground tabular-nums",
              !reduced && "transition-transform active:scale-95",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {isBack ? <Delete className="size-6" aria-hidden /> : (k as ReactNode)}
          </button>
        );
      })}
    </div>
  );
}

/** Format integer paise as ₹ with Indian grouping, trimming zero paise. */
function formatAmount(paise: number): string {
  const rupees = Math.trunc(paise / 100);
  const rest = Math.abs(paise % 100);
  const grouped = new Intl.NumberFormat("en-IN").format(rupees);
  return rest === 0 ? `₹${grouped}` : `₹${grouped}.${String(rest).padStart(2, "0")}`;
}

/**
 * GPay-style amount entry: giant readout + custom numeric keypad (no system
 * keyboard). Paise-safe integer math. Confirm stays disabled until valid.
 */
export function AmountInput({
  maxPaise,
  onConfirm,
  onChange,
  confirmLabel = "Confirm",
  className,
}: {
  /** Maximum allowed amount in paise. Defaults to unlimited. */
  maxPaise?: number;
  onConfirm: (amountPaise: number) => void;
  onChange?: (amountPaise: number) => void;
  confirmLabel?: string;
  className?: string;
}) {
  const maxDigits = 10;
  const [digits, setDigits] = useState("");
  // Mirror of digits for event handlers. Keypad taps can arrive faster than
  // React re-renders; reading the ref (instead of the render-scoped `digits`
  // closure) guarantees every tap builds on the latest value — previously
  // rapid 5,0,0 taps dropped the zeros and registered only ₹5.
  const digitsRef = useRef("");

  const commit = (next: string) => {
    digitsRef.current = next;
    setDigits(next);
    onChange?.(next === "" ? 0 : parseInt(next, 10));
  };

  const paise = digits === "" ? 0 : parseInt(digits, 10);
  const overMax = maxPaise != null && paise > maxPaise;
  const valid = paise > 0 && !overMax;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col items-center gap-1 px-4 pt-2">
        <div
          role="status"
          aria-live="polite"
          className="text-5xl font-bold text-foreground tabular-nums"
        >
          {formatAmount(paise)}
        </div>
        {overMax ? (
          <p className="text-sm font-semibold text-danger" role="alert">
            Amount exceeds the {formatAmount(maxPaise ?? 0)} limit
          </p>
        ) : (
          maxPaise != null && (
            <p className="text-xs text-muted-foreground tabular-nums">
              Max {formatAmount(maxPaise)}
            </p>
          )
        )}
      </div>

      <NumericKeypad
        onKey={(d) => commit(applyKey(digitsRef.current, d, maxDigits))}
        onBackspace={() => commit(applyBackspace(digitsRef.current))}
      />

      <button
        type="button"
        disabled={!valid}
        onClick={() => onConfirm(paise)}
        className={cn(
          "h-13 rounded-full py-3.5 text-base font-bold transition-colors",
          valid
            ? "bg-primary text-primary-foreground hover:bg-primary-hover"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
