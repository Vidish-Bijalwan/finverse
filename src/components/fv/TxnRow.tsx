import { useRef, useState } from "react";
import { Clock, Tag, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarInitials } from "@/lib/names";
import { NumberDisplay } from "./NumberDisplay";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { pressable } from "./press";

export type TxnStatus = "success" | "pending" | "failed";

/** Swipe actions revealed by swiping a TxnRow left. */
export interface TxnSwipeActions {
  /** Open a category picker for this transaction. */
  onCategorize?: () => void;
  /** Delete this transaction (the caller confirms / toasts). */
  onDelete?: () => void;
}

const ACTION_PX = 64;

/**
 * Initials from a display name, via the shared avatar rule
 * (`@/lib/names`): first letters of the first two words, uppercased.
 * "QA Test Beneficiary" -> "QT".
 */
export function initialsOf(name: string): string {
  return avatarInitials(name);
}

/**
 * Transaction row: avatar circle (initials) | name + secondary line |
 * right-aligned signed amount colored gain/loss. Renders as a <button> when
 * onClick is provided (keyboard-focusable with visible focus ring).
 *
 * With `swipeActions`, swiping left (pointer or touch) reveals Categorize /
 * Delete buttons parked behind the row. Keyboard fallback: tabbing to the row
 * reveals the actions, which stay in the tab order while focus is inside.
 */
export function TxnRow({
  name,
  secondary,
  amountPaise,
  status = "success",
  onClick,
  className,
  swipeActions,
}: {
  name: string;
  /** Date line, e.g. "3 Oct 2026 · UPI". */
  secondary?: string;
  /** Signed paise: positive = money in (gain), negative = money out (loss). */
  amountPaise: number;
  status?: TxnStatus;
  onClick?: () => void;
  className?: string;
  swipeActions?: TxnSwipeActions;
}) {
  const inFlow = amountPaise >= 0;
  const reducedMotion = usePrefersReducedMotion();
  const hasActions = Boolean(swipeActions?.onCategorize ?? swipeActions?.onDelete);
  const actionsWidth =
    (swipeActions?.onCategorize ? ACTION_PX : 0) + (swipeActions?.onDelete ? ACTION_PX : 0);

  const [revealed, setRevealed] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [kbFocus, setKbFocus] = useState(false);
  const [actionsFocus, setActionsFocus] = useState(false);
  const gesture = useRef<{ startX: number; moved: number } | null>(null);
  const suppressClick = useRef(false);

  const shown = revealed || kbFocus || actionsFocus;
  const translate = (shown ? -actionsWidth : 0) + drag;

  const closeActions = () => {
    setRevealed(false);
    setKbFocus(false);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasActions) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = { startX: e.clientX, moved: 0 };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.startX;
    g.moved = Math.max(g.moved, Math.abs(dx));
    if (revealed) {
      // Open: only a rightward drag closes.
      setDrag(Math.min(Math.max(dx, 0), actionsWidth));
    } else {
      // Closed: only a leftward drag opens.
      setDrag(Math.max(Math.min(dx, 0), -(actionsWidth + 24)));
    }
  };
  const endGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (!g) return;
    if (g.moved > 10) suppressClick.current = true;
    if (!revealed && drag < -actionsWidth * 0.45) setRevealed(true);
    else if (revealed && drag > actionsWidth * 0.45) setRevealed(false);
    setDrag(0);
  };

  const onRowClickCapture = (e: React.SyntheticEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // A plain pointer tap on an open row closes it instead of activating
    // the row. Keyboard activation (click detail === 0) still works.
    const detail = (e.nativeEvent as MouseEvent | undefined)?.detail ?? 0;
    if (revealed && detail > 0) {
      e.preventDefault();
      e.stopPropagation();
      closeActions();
    }
  };

  const content = (
    <>
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark"
      >
        {initialsOf(name)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          {secondary}
          {status === "pending" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning uppercase">
              <Clock className="size-3" aria-hidden /> Pending
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger uppercase">
              <XCircle className="size-3" aria-hidden /> Failed
            </span>
          )}
        </span>
      </span>
      <NumberDisplay
        paise={amountPaise}
        signed
        className={cn(
          "shrink-0 text-sm font-bold",
          status === "failed" ? "text-muted-foreground" : inFlow ? "text-gain" : "text-loss",
        )}
      />
    </>
  );

  const rowClasses = cn(
    "flex w-full items-center gap-3 rounded-2xl bg-card px-3 py-3",
    onClick &&
      "transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
    className,
  );

  const row = onClick ? (
    <button
      type="button"
      onClick={onClick}
      onClickCapture={onRowClickCapture}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) setKbFocus(true);
      }}
      onBlur={() => setKbFocus(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && revealed) {
          e.stopPropagation();
          closeActions();
        }
      }}
      className={rowClasses}
      aria-label={`${name}, ${secondary ?? ""}, amount ${amountPaise / 100} rupees${status !== "success" ? `, ${status}` : ""}${hasActions ? ". Swipe left for more actions." : ""}`}
    >
      {content}
    </button>
  ) : (
    <div className={rowClasses} onClickCapture={onRowClickCapture}>
      {content}
    </div>
  );

  if (!hasActions) return row;

  const tabbable = shown;

  return (
    <div
      className="relative touch-pan-y overflow-hidden rounded-2xl select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      onPointerLeave={() => {
        if (gesture.current) endGesture();
      }}
    >
      {/* Actions parked behind the row. */}
      <div
        className={cn("absolute inset-y-0 right-0 flex", !shown && "invisible")}
        onFocus={() => setActionsFocus(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActionsFocus(false);
        }}
      >
        {swipeActions?.onCategorize && (
          <button
            type="button"
            tabIndex={tabbable ? 0 : -1}
            aria-label={`Categorize ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              closeActions();
              swipeActions.onCategorize?.();
            }}
            className={cn(
              pressable,
              "flex w-16 flex-col items-center justify-center gap-1 bg-warning/15 text-[11px] font-bold text-warning",
            )}
          >
            <Tag className="size-5" aria-hidden />
            Categorize
          </button>
        )}
        {swipeActions?.onDelete && (
          <button
            type="button"
            tabIndex={tabbable ? 0 : -1}
            aria-label={`Delete ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              closeActions();
              swipeActions.onDelete?.();
            }}
            className={cn(
              pressable,
              "flex w-16 flex-col items-center justify-center gap-1 bg-destructive text-[11px] font-bold text-destructive-foreground",
            )}
          >
            <Trash2 className="size-5" aria-hidden />
            Delete
          </button>
        )}
      </div>

      {/* Sliding row content. */}
      <div
        className={cn(
          "relative",
          !dragging && !reducedMotion && "transition-transform duration-150 ease-out",
        )}
        style={{ transform: `translateX(${translate}px)` }}
      >
        {row}
      </div>
    </div>
  );
}
