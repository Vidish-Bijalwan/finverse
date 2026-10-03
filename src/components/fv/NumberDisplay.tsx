import { cn } from "@/lib/utils";
import { formatINR, formatINRShort } from "@/lib/finance/format";

/**
 * Money display with guaranteed tabular numerals. Formats integer paise via
 * the existing finance formatters — always use this instead of hand-rolled
 * `tabular-nums` spans.
 */
export function NumberDisplay({
  paise,
  short = false,
  signed = false,
  className,
}: {
  /** Integer paise (may be negative). */
  paise: number;
  /** Use the short form (₹8.4L / ₹950) instead of full grouping. */
  short?: boolean;
  /** Show an explicit +/− sign (negative always shows a sign). */
  signed?: boolean;
  className?: string;
}) {
  const negative = paise < 0;
  const sign = negative ? "−" : signed && paise > 0 ? "+" : "";
  const text = short ? formatINRShort(Math.abs(paise)) : formatINR(Math.abs(paise));
  return (
    <span className={cn("tabular-nums", className)} aria-label={`${sign}${text}`}>
      {sign}
      {text}
    </span>
  );
}
