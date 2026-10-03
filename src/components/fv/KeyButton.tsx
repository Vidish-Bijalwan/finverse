import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { classifyPressEvent } from "@/lib/press-events";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Keypad key shared by NumericKeypad and PinPad.
 *
 * Acts on `pointerdown` (not `click`): touch browsers can swallow the click
 * of a fast tap when they suspect a double-tap-zoom gesture, which dropped
 * digits on rapid entry (e.g. 5,0,0 registering only ₹5). `preventDefault()`
 * on the pointerdown suppresses the compatibility mouse events so the press
 * is never double-counted; keyboard Enter/Space and assistive-tech
 * activation fire `click` with `detail === 0` and are handled via the click
 * path (see `classifyPressEvent`).
 *
 * `touch-manipulation` disables double-tap zoom on the key itself. The
 * pressed visual is tracked in state (data-pressed) rather than relying on
 * `:active`, which is unreliable once the pointerdown default is prevented.
 */
export function KeyButton({
  label,
  onPress,
  disabled = false,
  className,
  children,
}: {
  /** Accessible name for the key (defaults to the visible content). */
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [pressed, setPressed] = useState(false);
  const reduced = usePrefersReducedMotion();
  // Set on pointerdown; cleared when the press gesture ends. Guards against
  // a stuck pressed visual if pointerup fires outside the button.
  const pointerDownRef = useRef(false);

  const release = () => {
    pointerDownRef.current = false;
    setPressed(false);
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-pressed={pressed || undefined}
      onPointerDown={(e) => {
        if (disabled) return;
        // Act on press for instant, per-tap response; suppress the
        // compatibility click so this tap is counted exactly once.
        e.preventDefault();
        pointerDownRef.current = true;
        setPressed(true);
        onPress();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onClick={(e) => {
        if (disabled) return;
        if (classifyPressEvent("click", e.detail) === "press") onPress();
      }}
      onBlur={release}
      className={cn(
        "touch-manipulation select-none",
        !reduced && "transition-transform duration-120",
        "data-[pressed=true]:scale-[0.97] data-[pressed=true]:brightness-95",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}
