import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PillVariant = "neutral" | "gain" | "loss" | "info" | "accent";
export type PillSize = "sm" | "md";

const variantClass: Record<PillVariant, string> = {
  neutral: "bg-muted text-muted-foreground",
  gain: "bg-gain/10 text-gain",
  loss: "bg-loss/10 text-loss",
  info: "bg-info/10 text-info",
  accent: "bg-tint text-primary",
};

const sizeClass: Record<PillSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

const dotClass: Record<PillVariant, string> = {
  neutral: "bg-faint",
  gain: "bg-gain",
  loss: "bg-loss",
  info: "bg-info",
  accent: "bg-primary",
};

export interface PillProps {
  children: React.ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  /** Colored dot before the label (e.g. status). */
  dot?: boolean;
  /** Shows a dismiss × button; does not affect the outer element's semantics. */
  onClose?: () => void;
  /** Makes the pill a real <button>. */
  onClick?: () => void;
  /** aria-label for the close button or the clickable pill. */
  label?: string;
  className?: string;
}

/**
 * Pill tag for status labels, section tags and filter pills.
 *
 * Semantics are honest: plain content renders as a <span>; with `onClick` it
 * becomes a <button>. With `onClose` the pill stays a <span> wrapping an
 * explicit close <button>, so a11y tree never nests buttons. Colors use the
 * high-saturation money/status tokens — never pastel.
 */
export function Pill({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  onClose,
  onClick,
  label,
  className,
}: PillProps) {
  const inner = (
    <>
      {dot && (
        <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dotClass[variant])} />
      )}
      <span className="truncate">{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={label ?? `Remove ${typeof children === "string" ? children : "filter"}`}
          className="-mr-1 grid size-4 shrink-0 place-items-center rounded-full transition-colors hover:bg-foreground/10"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </>
  );

  const classes = cn(
    "inline-flex max-w-full items-center rounded-full font-semibold whitespace-nowrap",
    variantClass[variant],
    sizeClass[size],
    onClick && "cursor-pointer transition-colors hover:brightness-95 focus-visible:outline-2",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={classes}>
        {inner}
      </button>
    );
  }
  return <span className={classes}>{inner}</span>;
}
