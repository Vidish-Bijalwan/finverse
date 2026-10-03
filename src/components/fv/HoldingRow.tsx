import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";

/**
 * Holding row: symbol + name | qty · avg → LTP + P&L% chip.
 * Renders as a <button> when onClick is provided.
 */
export function HoldingRow({
  symbol,
  name,
  qty,
  avgPaise,
  ltpPaise,
  onClick,
  className,
}: {
  symbol: string;
  name: string;
  qty: number;
  /** Average buy price, paise per unit. */
  avgPaise: number;
  /** Last traded price, paise per unit. */
  ltpPaise: number;
  onClick?: () => void;
  className?: string;
}) {
  const invested = qty * avgPaise;
  const current = qty * ltpPaise;
  const pnl = current - invested;
  const pct = invested !== 0 ? (pnl / invested) * 100 : 0;
  const positive = pnl >= 0;

  const content = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{symbol}</span>
          <span className="truncate text-xs text-muted-foreground">{name}</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {qty} qty · avg <NumberDisplay paise={avgPaise} />
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <NumberDisplay paise={ltpPaise} className="text-sm font-bold text-foreground" />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
            positive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
          )}
        >
          {positive ? "+" : "−"}
          {Math.abs(pct).toFixed(1)}%
        </span>
      </span>
      {onClick && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-3 rounded-2xl px-3 py-3",
    onClick && "transition-colors hover:bg-muted/60",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
        aria-label={`${name} (${symbol}), ${qty} quantity, P&L ${positive ? "plus" : "minus"} ${Math.abs(pct).toFixed(1)} percent`}
      >
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
