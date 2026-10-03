import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  /** The element that opens the panel — rendered inside a real <button>. */
  trigger: React.ReactNode;
  /** Panel content. */
  children: React.ReactNode;
  /** aria-label for the trigger button. */
  label: string;
  /** Horizontal alignment of the panel relative to the trigger. */
  align?: "left" | "center" | "right";
  className?: string;
  panelClassName?: string;
}

/**
 * Lightweight popover: click the trigger to toggle a positioned panel.
 * Closes on Escape or outside pointer-down, and returns focus to the
 * trigger on close. Trigger is a real <button> with aria-haspopup="dialog"
 * + aria-expanded; the panel is role="dialog".
 */
export function Popover({
  trigger,
  children,
  label,
  align = "left",
  className,
  panelClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const wasOpen = useRef(false);

  // Return focus to the trigger when the panel closes (not on mount).
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const alignClass =
    align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          className={cn(
            "fv-card-static absolute top-full z-50 mt-2 min-w-44 rounded-2xl bg-popover p-2 shadow-modal",
            alignClass,
            panelClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
