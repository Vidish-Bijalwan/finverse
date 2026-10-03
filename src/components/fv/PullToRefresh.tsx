import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 80;
const MAX_PULL = 160;

/**
 * Pull-to-refresh wrapper (custom, no dependency). On touch devices, dragging
 * down while the page is scrolled to the top reveals a progress indicator;
 * releasing past ~80px fires `onRefresh` and shows a spinner until it settles.
 * No-ops on desktop (touch-only) and never hijacks upward/inner scrolling.
 */
export function PullToRefresh({
  onRefresh,
  children,
  className,
  label = "Pull to refresh",
}: {
  /** Refetch work; the spinner shows until the returned promise settles. */
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const pullPx = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || window.scrollY > 0) {
        startY.current = null;
        return;
      }
      const t = e.touches[0];
      startY.current = t ? t.clientY : null;
      startX.current = t ? t.clientX : 0;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null || refreshingRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dy = t.clientY - startY.current;
      const dx = t.clientX - startX.current;
      // Only take over predominantly-vertical downward drags — horizontal
      // rail swipes keep working.
      if (dy > 8 && dy > Math.abs(dx) && window.scrollY <= 0) {
        if (e.cancelable) e.preventDefault();
        pullPx.current = Math.min(MAX_PULL, dy * 0.5);
        setPull(pullPx.current);
      } else if (dy <= 0 || Math.abs(dx) >= dy) {
        // Not our gesture — hand it back so inner scrollers work.
        startY.current = null;
        pullPx.current = 0;
        setPull(0);
      }
    };
    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      const released = pullPx.current;
      pullPx.current = 0;
      setPull(0);
      if (released >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        Promise.resolve()
          .then(() => onRefreshRef.current())
          .catch(() => {
            // A failed refresh still ends the gesture — the page's own
            // error states describe the failure.
          })
          .finally(() => {
            refreshingRef.current = false;
            setRefreshing(false);
          });
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const progress = Math.min(1, pull / THRESHOLD);
  const shown = refreshing || pull > 4;

  return (
    <div ref={rootRef} className={cn("relative", className)} aria-label={label}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center transition-opacity duration-150",
          shown ? "opacity-100" : "opacity-0",
        )}
        style={{
          transform: `translateY(${refreshing ? 14 : pull * 0.6 - 44}px)`,
        }}
      >
        <span className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-modal">
          {refreshing ? (
            <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
          ) : (
            <ArrowDown
              className="size-5 text-primary transition-transform duration-150"
              style={{ transform: `rotate(${progress >= 1 ? 180 : 0}deg)` }}
              aria-hidden
            />
          )}
        </span>
      </div>
      {children}
      <span className="sr-only" role="status">
        {refreshing ? "Refreshing…" : ""}
      </span>
    </div>
  );
}
