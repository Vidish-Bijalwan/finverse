import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const COUNT_UP_MS = 800;

/**
 * Money display with guaranteed tabular numerals. Formats integer paise via
 * the existing finance formatters — always use this instead of hand-rolled
 * `tabular-nums` spans.
 */
export function NumberDisplay({
  paise,
  short = false,
  signed = false,
  animate = false,
  className,
}: {
  /** Integer paise (may be negative). */
  paise: number;
  /** Use the short form (₹8.4L / ₹950) instead of full grouping. */
  short?: boolean;
  /** Show an explicit +/− sign (negative always shows a sign). */
  signed?: boolean;
  /**
   * Count up from 0 on mount (~800ms, ease-out). Later paise changes glide
   * from the current shown value. Off by default; disabled entirely when the
   * user prefers reduced motion.
   */
  animate?: boolean;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animate && !reducedMotion;
  const [shownPaise, setShownPaise] = useState(shouldAnimate ? 0 : paise);
  const fromRef = useRef(shouldAnimate ? 0 : paise);

  useEffect(() => {
    if (!shouldAnimate) {
      fromRef.current = paise;
      setShownPaise(paise);
      return;
    }
    const from = fromRef.current;
    if (from === paise) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = from + (paise - from) * eased;
      fromRef.current = value;
      setShownPaise(value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paise, shouldAnimate]);

  const displayNegative = shownPaise < 0;
  const displaySign = displayNegative ? "−" : signed && shownPaise > 0 ? "+" : "";
  const displayText = short
    ? formatINRShort(Math.abs(Math.round(shownPaise)))
    : formatINR(Math.abs(Math.round(shownPaise)));

  const negative = paise < 0;
  const finalSign = negative ? "−" : signed && paise > 0 ? "+" : "";
  const finalText = short ? formatINRShort(Math.abs(paise)) : formatINR(Math.abs(paise));

  return (
    <span className={cn("fv-money", className)} aria-label={`${finalSign}${finalText}`}>
      {displaySign}
      {displayText}
    </span>
  );
}
