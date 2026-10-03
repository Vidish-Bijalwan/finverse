import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NumberDisplay } from "./NumberDisplay";

export interface FvOrder {
  type: "market" | "limit";
  /** Qty-based entry or amount-based entry. */
  mode: "qty" | "amount";
  /** Whole units. */
  qty: number;
  /** Execution price in paise (market: LTP; limit: entered price). */
  pricePaise: number;
}

const toPaise = (rupeesText: string): number => {
  const v = Number.parseFloat(rupeesText);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.round(v * 100);
};

/**
 * Bottom-sheet order ticket: Market/Limit segmented control, qty/amount
 * toggle input, live estimated-cost readout. Confirm stays disabled until
 * the order is valid.
 */
export function OrderSheet({
  open,
  onOpenChange,
  symbol,
  name,
  ltpPaise,
  side = "buy",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  name: string;
  /** Live last-traded price, paise per unit. */
  ltpPaise: number;
  side?: "buy" | "sell";
  onConfirm: (order: FvOrder) => void;
}) {
  const [type, setType] = useState<"market" | "limit">("market");
  const [mode, setMode] = useState<"qty" | "amount">("qty");
  const [qtyText, setQtyText] = useState("1");
  const [amountText, setAmountText] = useState("");
  const [limitText, setLimitText] = useState("");

  const pricePaise = type === "market" ? ltpPaise : toPaise(limitText);
  const qtyFromMode =
    mode === "qty"
      ? Math.max(0, Math.floor(Number.parseFloat(qtyText) || 0))
      : pricePaise > 0
        ? Math.floor(toPaise(amountText) / pricePaise)
        : 0;
  const estimatedPaise = qtyFromMode * pricePaise;
  const valid = qtyFromMode > 0 && pricePaise > 0;

  const segmented = <T,>(
    options: { value: T; label: string }[],
    value: T,
    onChange: (v: T) => void,
    label: string,
  ) => (
    <div role="group" aria-label={label} className="flex rounded-full bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors",
            value === o.value
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full max-w-lg rounded-t-3xl border-t px-6 pt-3 pb-8"
        aria-label={`Place ${side} order for ${symbol}`}
      >
        <span aria-hidden className="mx-auto mb-4 block h-1.5 w-12 rounded-full bg-muted" />

        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">
            <span className={cn("mr-2 capitalize", side === "buy" ? "text-gain" : "text-loss")}>
              {side}
            </span>
            {symbol}
          </h2>
          <span className="text-sm text-muted-foreground">
            LTP <NumberDisplay paise={ltpPaise} className="font-bold text-foreground" />
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{name}</p>

        <div className="mt-4 flex flex-col gap-4">
          {segmented(
            [
              { value: "market", label: "Market" },
              { value: "limit", label: "Limit" },
            ],
            type,
            setType,
            "Order type",
          )}

          {type === "limit" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Limit price (₹)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={limitText}
                onChange={(e) => setLimitText(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="h-12 rounded-2xl border border-input bg-card px-4 text-lg font-bold text-foreground tabular-nums"
              />
            </label>
          )}

          {segmented(
            [
              { value: "qty", label: "Quantity" },
              { value: "amount", label: "Amount" },
            ],
            mode,
            setMode,
            "Entry mode",
          )}

          {mode === "qty" ? (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQtyText(String(Math.max(1, (Number.parseInt(qtyText) || 1) - 1)))}
                className="grid size-11 place-items-center rounded-full bg-muted text-foreground transition-transform active:scale-95"
              >
                <Minus className="size-5" aria-hidden />
              </button>
              <input
                type="text"
                inputMode="numeric"
                aria-label="Quantity"
                value={qtyText}
                onChange={(e) => setQtyText(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-14 w-32 rounded-2xl border border-input bg-card text-center text-2xl font-bold text-foreground tabular-nums"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQtyText(String((Number.parseInt(qtyText) || 0) + 1))}
                className="grid size-11 place-items-center rounded-full bg-muted text-foreground transition-transform active:scale-95"
              >
                <Plus className="size-5" aria-hidden />
              </button>
            </div>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Amount (₹)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountText}
                onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="h-14 rounded-2xl border border-input bg-card px-4 text-2xl font-bold text-foreground tabular-nums"
              />
            </label>
          )}

          <div
            className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <span className="text-sm text-muted-foreground">
              Estimated cost · {qtyFromMode} qty
            </span>
            <NumberDisplay paise={estimatedPaise} className="text-lg font-bold text-foreground" />
          </div>

          <button
            type="button"
            disabled={!valid}
            onClick={() => onConfirm({ type, mode, qty: qtyFromMode, pricePaise })}
            className={cn(
              "h-13 w-full rounded-full py-3.5 text-base font-bold text-white transition-colors",
              valid
                ? side === "buy"
                  ? "bg-gain hover:opacity-90"
                  : "bg-loss hover:opacity-90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {side === "buy" ? "Buy" : "Sell"} {symbol}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
