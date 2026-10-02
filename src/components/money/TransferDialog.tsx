import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Check } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AmountField } from "./AmountField";
import { rupeesToPaise } from "@/components/money/utils";
import { formatINR, todayISO } from "@/lib/finance/format";
import { iconForName } from "@/lib/finance/categories";
import { useAccountSummaries, useTransfer } from "@/lib/finance/hooks";
import { cn } from "@/lib/utils";

/** Move money between two accounts — debits one, credits the other. */
export function TransferDialog({
  open,
  onOpenChange,
  fromAccountId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromAccountId?: string;
}) {
  const { data: summaries } = useAccountSummaries();
  const accounts = useMemo(() => summaries ?? [], [summaries]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [dateISO, setDateISO] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);

  const transfer = useTransfer();

  useEffect(() => {
    if (!open || accounts.length === 0) return;
    const first = accounts[0]!.account.id;
    const second = accounts[1]?.account.id ?? first;
    setFrom((prev) => {
      if (prev && accounts.some((s) => s.account.id === prev)) return prev;
      return fromAccountId ?? first;
    });
    setTo((prev) => {
      if (prev && accounts.some((s) => s.account.id === prev) && prev !== from) return prev;
      const f = fromAccountId ?? first;
      return accounts.find((s) => s.account.id !== f)?.account.id ?? second;
    });
    setAmount("");
    setNote("");
    setDateISO(todayISO());
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accounts.length]);

  const fromSummary = accounts.find((s) => s.account.id === from);
  const toSummary = accounts.find((s) => s.account.id === to);

  const handleSave = () => {
    if (transfer.isPending) return;
    const amountPaise = rupeesToPaise(amount);
    if (Number.isNaN(amountPaise) || amountPaise <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!from || !to) {
      setError("Pick both accounts.");
      return;
    }
    setError(null);
    transfer.mutate(
      { fromAccountId: from, toAccountId: to, amountPaise, note: note.trim(), dateISO },
      {
        onSuccess: () => {
          toast.success(
            `Transferred ${formatINR(amountPaise)} · ${fromSummary?.account.name} → ${toSummary?.account.name}`,
          );
          onOpenChange(false);
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Transfer between accounts
          </DialogTitle>
          <DialogDescription>
            Debits the source account and credits the destination — one entry, both balances update.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="transfer-from">From</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger id="transfer-from">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(({ account, balancePaise }) => {
                    const Icon = iconForName(account.iconName);
                    return (
                      <SelectItem key={account.id} value={account.id} disabled={account.id === to}>
                        <span className="flex items-center gap-2">
                          <span
                            className="flex shrink-0"
                            style={{ color: account.color }}
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{account.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatINR(balancePaise)}
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-to">To</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger id="transfer-to">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(({ account, balancePaise }) => {
                    const Icon = iconForName(account.iconName);
                    return (
                      <SelectItem
                        key={account.id}
                        value={account.id}
                        disabled={account.id === from}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="flex shrink-0"
                            style={{ color: account.color }}
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{account.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatINR(balancePaise)}
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromSummary && toSummary && (
            <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-2.5 text-sm">
              <span className="font-medium text-muted-foreground">{fromSummary.account.name}</span>
              <ArrowRightLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">{toSummary.account.name}</span>
            </div>
          )}

          <AmountField
            id="transfer-amount"
            label="Amount"
            value={amount}
            onChange={setAmount}
            autoFocus
          />

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="transfer-note">Note</Label>
              <Input
                id="transfer-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                maxLength={120}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-date">Date</Label>
              <Input
                id="transfer-date"
                type="date"
                value={dateISO}
                onChange={(e) => e.target.value && setDateISO(e.target.value)}
                max={todayISO()}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={transfer.isPending || accounts.length < 2}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground",
              "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60",
            )}
          >
            {transfer.isPending ? (
              "Transferring…"
            ) : (
              <>
                <Check className="h-5 w-5" /> Transfer
              </>
            )}
          </button>
          {accounts.length < 2 && (
            <p className="text-center text-xs text-muted-foreground">
              Add a second account to move money between accounts.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
