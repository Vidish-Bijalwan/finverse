import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AmountField } from "./AmountField";
import { CATEGORY_COLORS, CUSTOM_ICON_OPTIONS, iconForName } from "@/lib/finance/categories";

/** Default color per account type (copied from the old localStorage store). */
const DEFAULT_ACCOUNT_COLORS: Record<AccountType, string> = {
  cash: "#F59E0B",
  upi: "#10B981",
  bank: "#3B82F6",
};
import { paiseToRupees, rupeesToPaise } from "@/components/money/utils";
import { useAddAccount, useUpdateAccount } from "@/lib/finance/hooks";
import type { Account, AccountType } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
];

const TYPE_ICON: Record<AccountType, string> = { cash: "wallet", upi: "smartphone", bank: "bank" };

/** Add / edit dialog for accounts (cash wallets, UPI handles, bank accounts). */
export function AccountDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Account | null;
}) {
  const isEdit = Boolean(editing);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [iconName, setIconName] = useState("bank");
  const [color, setColor] = useState(DEFAULT_ACCOUNT_COLORS.bank);
  const [opening, setOpening] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const saving = addAccount.isPending || updateAccount.isPending;

  // Reset the form whenever the dialog opens or the edited account changes.
  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setType(editing?.type ?? "bank");
    setIconName(editing?.iconName ?? TYPE_ICON[editing?.type ?? "bank"]);
    setColor(editing?.color ?? DEFAULT_ACCOUNT_COLORS[editing?.type ?? "bank"]);
    setOpening(editing ? paiseToRupees(editing.openingBalancePaise) : "");
    setIsDefault(editing?.isDefault ?? false);
    setError(null);
  }, [open, editing]);

  const switchType = (t: AccountType) => {
    setType(t);
    setIconName(TYPE_ICON[t]);
    setColor(DEFAULT_ACCOUNT_COLORS[t]);
  };

  const handleSave = () => {
    if (saving) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the account a name.");
      return;
    }
    const openingPaise = opening.trim() === "" ? 0 : rupeesToPaise(opening);
    if (Number.isNaN(openingPaise)) {
      setError("Opening balance must be a valid amount.");
      return;
    }
    setError(null);
    const payload = {
      name: trimmed,
      type,
      iconName,
      color,
      openingBalancePaise: openingPaise,
    };
    if (isEdit && editing) {
      updateAccount.mutate(
        { id: editing.id, patch: payload },
        {
          onSuccess: () => {
            toast.success("Account updated");
            onOpenChange(false);
          },
          onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
        },
      );
    } else {
      addAccount.mutate(
        { ...payload, isDefault },
        {
          onSuccess: () => {
            toast.success(`Account added · ${trimmed}`);
            onOpenChange(false);
          },
          onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
        },
      );
    }
  };

  const PreviewIcon = iconForName(iconName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename, recolor, or adjust the opening balance."
              : "Track a cash wallet, UPI handle, or bank account with its own live balance."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="HDFC Savings"
              maxLength={40}
              autoComplete="off"
            />
          </div>

          <div>
            <Label className="mb-2 block">Account type</Label>
            <div
              className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
              role="radiogroup"
              aria-label="Account type"
            >
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={type === t.value}
                  onClick={() => switchType(t.value)}
                  className={cn(
                    "rounded-xl py-2 text-sm font-semibold transition-colors",
                    type === t.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Icon</Label>
            <div
              className="grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto"
              role="radiogroup"
              aria-label="Account icon"
            >
              {CUSTOM_ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = iconName === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={opt.label}
                    title={opt.label}
                    onClick={() => setIconName(opt.name)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl transition-all",
                      selected
                        ? "ring-2 ring-offset-1"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                    style={
                      selected
                        ? {
                            backgroundColor: `${color}1f`,
                            color,
                            ["--tw-ring-color" as string]: color,
                          }
                        : undefined
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  className={cn(
                    "h-9 w-9 rounded-full transition-transform",
                    color === c && "scale-110 ring-2 ring-offset-2 ring-foreground/30",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <label
                className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40"
                title="Custom color"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Custom color"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
                  }}
                />
              </label>
              <span
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}1f`, color }}
                aria-hidden
              >
                <PreviewIcon className="h-5 w-5" />
              </span>
            </div>
          </div>

          <AmountField
            id="account-opening"
            label="Opening balance"
            value={opening}
            onChange={setOpening}
            placeholder="0.00"
          />

          {!isEdit && (
            <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Default account</p>
                <p className="text-xs text-muted-foreground">
                  New transactions use this account unless you pick another.
                </p>
              </div>
              <Switch
                checked={isDefault}
                onCheckedChange={setIsDefault}
                aria-label="Default account"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground",
              "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60",
            )}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Check className="h-5 w-5" /> {isEdit ? "Save changes" : "Add account"}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
