import { Bell, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";

/**
 * Market instrument row: symbol + name | price → change% chip, with watchlist
 * star toggle (aria-pressed) and price-alert bell button.
 */
export function MarketRow({
  symbol,
  name,
  pricePaise,
  changePct,
  starred,
  alerted = false,
  onToggleStar,
  onToggleAlert,
  onClick,
  className,
}: {
  symbol: string;
  name: string;
  /** Price in paise per unit. */
  pricePaise: number;
  /** Day change in percent (signed). */
  changePct: number;
  starred: boolean;
  /** When absent, no alert bell renders (e.g. screener rows). */
  alerted?: boolean;
  onToggleStar: () => void;
  /** When absent, the alert bell is not rendered. */
  onToggleAlert?: () => void;
  onClick?: () => void;
  className?: string;
}) {
  const up = changePct >= 0;

  const action = (
    <span className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar();
        }}
        aria-pressed={starred}
        aria-label={starred ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={cn(
          "grid size-9 place-items-center rounded-full transition-colors hover:bg-muted/60",
          starred ? "text-warning" : "text-muted-foreground",
        )}
      >
        <Star className="size-4" fill={starred ? "currentColor" : "none"} aria-hidden />
      </button>
      {onToggleAlert && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAlert();
          }}
          aria-pressed={alerted}
          aria-label={alerted ? `Edit price alert for ${symbol}` : `Set price alert for ${symbol}`}
          className={cn(
            "grid size-9 place-items-center rounded-full transition-colors hover:bg-muted/60",
            alerted ? "text-info" : "text-muted-foreground",
          )}
        >
          <Bell className="size-4" aria-hidden />
        </button>
      )}
    </span>
  );

  const content = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="truncate text-sm font-bold text-foreground">{symbol}</span>
        <span className="truncate text-xs text-muted-foreground">{name}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <NumberDisplay paise={pricePaise} className="text-sm font-bold text-foreground" />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
            up ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
          )}
        >
          {up ? "+" : "−"}
          {Math.abs(changePct).toFixed(2)}%
        </span>
      </span>
      {action}
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-2 rounded-2xl px-3 py-2.5",
    onClick && "transition-colors hover:bg-muted/60",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
        aria-label={`${name} (${symbol}), ${up ? "up" : "down"} ${Math.abs(changePct).toFixed(2)} percent`}
      >
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
