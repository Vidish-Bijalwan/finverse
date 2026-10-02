import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Animated score ring. Animates the arc on mount (and when score changes);
 * animation is disabled under prefers-reduced-motion.
 */
export function ScoreRing({ score, size = 190 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));

  useEffect(() => {
    if (reducedMotion) {
      // No sweep animation — show the final value immediately.
      setAnimated(clamped);
      return;
    }
    setAnimated(0);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(clamped)));
    return () => cancelAnimationFrame(raf);
  }, [clamped, reducedMotion]);

  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * animated) / 100;

  const tone =
    clamped >= 75
      ? "text-success"
      : clamped >= 50
        ? "text-primary"
        : clamped >= 30
          ? "text-amber-600"
          : "text-destructive";
  const arc =
    clamped >= 75
      ? "stroke-success"
      : clamped >= 50
        ? "stroke-primary"
        : clamped >= 30
          ? "stroke-amber-500"
          : "stroke-destructive";

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Readiness score ${Math.round(clamped)} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            arc,
            "transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none",
          )}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className={cn("text-5xl font-black tabular-nums", tone)}>{Math.round(animated)}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}
