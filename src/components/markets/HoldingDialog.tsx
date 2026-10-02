import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddHolding, useUpdateHolding } from "@/lib/finance/hooks";
import { formatINR } from "@/lib/finance/format";
import { toast } from "sonner";
import { STOCKS, getStock } from "@/lib/market/data";
import { getLTP } from "@/lib/market/history";
import type { Holding } from "@/lib/finance/types";

/**
 * Add / edit a portfolio holding. Amounts entered in ₹, stored as paise.
 * In add mode the symbol select defaults to `defaultSymbol` (stock detail page)
 * or the first stock; in edit mode the symbol is fixed.
 */
export function HoldingDialog({
  open,
  onOpenChange,
  holding,
  defaultSymbol,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding?: Holding;
  defaultSymbol?: string;
}) {
  const isEdit = !!holding;
  const addHolding = useAddHolding();
  const updateHolding = useUpdateHolding();

  const [symbol, setSymbol] = useState(defaultSymbol ?? holding?.symbol ?? STOCKS[0].symbol);
  const [qty, setQty] = useState(String(holding?.qty ?? ""));
  const [avgPrice, setAvgPrice] = useState(
    holding ? String((holding.avgPricePaise / 100).toFixed(2)) : "",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSymbol(holding?.symbol ?? defaultSymbol ?? STOCKS[0].symbol);
      setQty(holding ? String(holding.qty) : "");
      setAvgPrice(holding ? String((holding.avgPricePaise / 100).toFixed(2)) : "");
      setError("");
      addHolding.reset();
      updateHolding.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const qtyNum = Number(qty);
  const priceNum = Number(avgPrice);
  const valid =
    symbol.length > 0 &&
    Number.isFinite(qtyNum) &&
    qtyNum > 0 &&
    Number.isFinite(priceNum) &&
    priceNum > 0;

  const pending = addHolding.isPending || updateHolding.isPending;

  function handleSave() {
    if (!valid || pending) return;
    const avgPricePaise = Math.round(priceNum * 100);
    if (isEdit && holding) {
      updateHolding.mutate(
        { id: holding.id, patch: { qty: qtyNum, avgPricePaise } },
        {
          onSuccess: () => {
            toast.success(`Holding updated · ${holding.symbol} × ${qtyNum}`);
            onOpenChange(false);
          },
          onError: (e) => {
            setError(e.message);
            toast.error("Couldn't save — try again.");
          },
        },
      );
    } else {
      addHolding.mutate(
        { symbol: symbol.toUpperCase(), qty: qtyNum, avgPricePaise },
        {
          onSuccess: () => {
            toast.success(
              `Holding added · ${symbol.toUpperCase()} × ${qtyNum} · ${formatINR(Math.round(qtyNum * priceNum * 100))}`,
            );
            onOpenChange(false);
          },
          onError: (e) => {
            setError(e.message);
            toast.error("Couldn't save — try again.");
          },
        },
      );
    }
  }

  const selected = getStock(symbol);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit holding" : "Add to portfolio"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update your ${holding?.symbol} position.`
              : "Record shares you own — quantity and the average price you paid."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="holding-symbol">Stock</Label>
            {isEdit ? (
              <Input id="holding-symbol" value={holding?.symbol} disabled />
            ) : (
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger id="holding-symbol">
                  <SelectValue placeholder="Choose a stock" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {STOCKS.map((s) => (
                    <SelectItem key={s.symbol} value={s.symbol}>
                      {s.symbol} · {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selected && (
              <p className="text-xs text-muted-foreground">
                Current demo price: {formatINR(getLTP(selected.symbol))}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="holding-qty">Quantity</Label>
              <Input
                id="holding-qty"
                inputMode="decimal"
                placeholder="10"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holding-price">Avg price (₹)</Label>
              <Input
                id="holding-price"
                inputMode="decimal"
                placeholder="1,520.00"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value.replace(/,/g, ""))}
              />
            </div>
          </div>

          {valid && (
            <p className="rounded-md bg-tint px-3 py-2 text-xs font-medium text-primary-dark">
              Invested value: {formatINR(Math.round(qtyNum * priceNum * 100))}
            </p>
          )}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid || pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Add holding"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
