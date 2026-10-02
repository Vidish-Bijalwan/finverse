import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/finance/format";

interface CountUpProps {
  /** Value in paise. */
  value: number;
  /** Animation length in ms. */
  duration?: number;
  className?: string;
  /** Defaults to formatINR. */
  format?: (paise: number) => string;
  /** Start value for the animation. Defaults to 0 (count up). */
  from?: number;
}

/**
 * Animated count-up number. Uses requestAnimationFrame with an ease-out cubic
 * curve, and snaps instantly when the user prefers reduced motion. SSR-safe:
 * the animation only runs in an effect, so the server renders the start value.
 */
export function CountUp({
  value,
  duration = 900,
  className,
  format = formatINR,
  from = 0,
}: CountUpProps) {
  const [display, setDisplay] = useState(from);
  const fromRef = useRef(from);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const startValue = fromRef.current;
    const target = value;
    if (startValue === target) {
      setDisplay(target);
      return;
    }
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || duration <= 0) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(startValue + (target - startValue) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
