import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AtSign,
  HandCoins,
  Landmark,
  LayoutGrid,
  Plus,
  QrCode,
  ReceiptIndianRupee,
  Send,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { pressable } from "@/components/fv";
import { cn } from "@/lib/utils";
import { QUICK_ACTIONS, type QuickActionId } from "@/lib/quick-actions";
import type { UpiPayload } from "@/lib/upi-qr";
import { QrScannerDialog } from "@/components/payments/QrScannerDialog";
import { RechargeDialog } from "@/components/payments/RechargeDialog";

const ICONS: Record<QuickActionId, LucideIcon> = {
  "scan-qr": QrCode,
  "pay-contact": Users,
  "upi-id": AtSign,
  "bank-transfer": Landmark,
  recharge: Smartphone,
  bills: ReceiptIndianRupee,
  request: HandCoins,
  more: LayoutGrid,
  invest: TrendingUp,
  "add-expense": Plus,
  "add-goal": Target,
};

/**
 * Compact quick-action grid (icon container + short label).
 *
 * Desktop: compact grid · mobile: 4 columns. Every action resolves through
 * the `quick-actions` routing table to a real destination — route deep-links
 * into existing flows, or a working dialog (QR scanner / recharge).
 */
export function QuickActions({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<"qr-scan" | "recharge" | null>(null);

  const handleScan = (payload: UpiPayload) => {
    setDialog(null);
    void navigate({
      to: "/payments",
      search: {
        flow: "upi",
        upiId: payload.upiId,
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.amountPaise !== null ? { amount: String(payload.amountPaise) } : {}),
      },
    });
  };

  const activate = (id: QuickActionId) => {
    const action = QUICK_ACTIONS.find((a) => a.id === id);
    if (!action) return;
    const target = action.target;
    if (target.kind === "dialog") {
      setDialog(target.dialog);
      return;
    }
    // Route deep-links: each case passes a concrete search shape so it
    // typechecks against that route's own validateSearch schema.
    const s = target.search ?? {};
    switch (target.to) {
      case "/payments":
        void navigate({
          to: "/payments",
          search: {
            flow: s["flow"],
            tab: s["tab"],
            upiId: s["upiId"],
            name: s["name"],
            amount: s["amount"],
          },
        });
        break;
      case "/accounts":
        void navigate({
          to: "/accounts",
          search: s["transfer"] === "1" ? { transfer: "1" as const } : {},
        });
        break;
      case "/expenses":
        void navigate({
          to: "/expenses",
          search: s["add"] === "1" ? { add: "1" as const } : {},
        });
        break;
      case "/goals":
        void navigate({
          to: "/goals",
          search: s["add"] === "1" ? { add: "1" as const } : {},
        });
        break;
      default:
        void navigate({ to: target.to });
    }
  };

  return (
    <>
      <nav aria-label="Quick actions" className={className}>
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-11">
          {QUICK_ACTIONS.map(({ id, label }) => {
            const Icon = ICONS[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => activate(id)}
                  aria-label={label}
                  className={cn(
                    pressable,
                    "group flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2",
                    "hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-12 place-items-center rounded-2xl border border-border/70 bg-card text-primary",
                      "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors group-hover:border-primary/40 group-hover:bg-primary/10",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={2.1} />
                  </span>
                  <span className="max-w-full truncate text-[11px] font-semibold leading-tight text-foreground">
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
          <li aria-hidden="true" className="hidden sm:block lg:hidden" />
        </ul>
      </nav>

      <QrScannerDialog
        open={dialog === "qr-scan"}
        onOpenChange={(o) => !o && setDialog(null)}
        onScan={handleScan}
      />
      <RechargeDialog open={dialog === "recharge"} onOpenChange={(o) => !o && setDialog(null)} />
    </>
  );
}
