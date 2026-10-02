import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Renders an X close button in the header (default false). */
  showCloseButton?: boolean;
  children: ReactNode;
}

const DISMISS_THRESHOLD = 110;

/**
 * Reusable bottom sheet: drag handle, swipe-down-to-dismiss on touch,
 * overlay click closes, Escape closes. SSR-safe (renders only in the browser).
 */
export function BottomSheet({ open, onClose, title, showCloseButton, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; offset: number; startTime: number } | null>(null);

  // Mount only in the browser so SSR output matches.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate in after mount; on close, play the exit transition first.
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      setVisible(true);
      // Lock body scroll while the sheet is open.
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    if (reducedMotion) {
      setVisible(false);
      return;
    }
    const t = window.setTimeout(() => setVisible(false), 240);
    return () => window.clearTimeout(t);
  }, [open, mounted, reducedMotion]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const applyDragOffset = useCallback(
    (offset: number) => {
      const el = sheetRef.current;
      if (el && !reducedMotion) {
        el.style.transition = "none";
        el.style.transform = `translateY(${Math.max(0, offset)}px)`;
      }
    },
    [reducedMotion],
  );

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    const el = sheetRef.current;
    dragRef.current = null;
    if (!drag) return;
    const velocity = drag.offset / Math.max(1, Date.now() - drag.startTime); // px per ms
    const shouldDismiss = drag.offset > DISMISS_THRESHOLD || velocity > 0.6;
    if (shouldDismiss) {
      onClose();
    } else if (el && !reducedMotion) {
      el.style.transition = "";
      el.style.transform = "";
    }
  }, [onClose, reducedMotion]);

  useEffect(() => {
    if (!open || !mounted) return;
    const el = sheetRef.current;
    if (!el || reducedMotion) return;
    const onMove = (e: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      drag.offset = e.touches[0].clientY - drag.startY;
      applyDragOffset(drag.offset);
    };
    const onUp = () => endDrag();
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    };
  }, [open, mounted, reducedMotion, applyDragOffset, endDrag]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Sheet"}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/55",
          reducedMotion ? "opacity-100" : "transition-opacity duration-240",
        )}
        style={reducedMotion ? undefined : { opacity: open ? 1 : 0 }}
      />
      <div
        ref={sheetRef}
        onTouchStart={(e) => {
          dragRef.current = {
            startY: e.touches[0].clientY,
            offset: 0,
            startTime: Date.now(),
          };
        }}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] w-full max-w-lg",
          "overflow-hidden rounded-t-3xl bg-card shadow-2xl",
          !reducedMotion && "transition-transform duration-240 ease-[cubic-bezier(0.32,0.72,0,1)]",
        )}
        style={
          reducedMotion ? undefined : { transform: open ? "translateY(0)" : "translateY(100%)" }
        }
      >
        <div className="px-5 pb-2 pt-3">
          <div className="flex flex-col items-center">
            <div className="h-1.5 w-11 rounded-full bg-muted" aria-hidden="true" />
          </div>
          {(title || showCloseButton) && (
            <div className="mt-3 flex items-center justify-between gap-3">
              {title ? <h2 className="text-lg font-bold text-foreground">{title}</h2> : <span />}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="max-h-[calc(88dvh-4rem)] overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
