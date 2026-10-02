import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Minimal bottom sheet owned by the expenses feature.
 *
 * - Overlay click and the Escape key close it.
 * - Drag handle for the Paytm-style look (visual only; the sheet worker's
 *   shared Sheet will unify behaviour later).
 * - SSR-safe: all browser APIs are used inside effects only.
 * - Motion is disabled automatically for prefers-reduced-motion users.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while the sheet is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50 motion-safe:animate-in motion-safe:fade-in-0"
      />
      {/* Panel */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg",
          "max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-card text-card-foreground shadow-modal",
          "motion-safe:animate-in motion-safe:slide-in-from-bottom-full motion-safe:duration-200",
        )}
      >
        <div className="sticky top-0 bg-card pt-2">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
