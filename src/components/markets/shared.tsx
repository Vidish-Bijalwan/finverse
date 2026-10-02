import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Friendly empty state with an optional call-to-action. */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center shadow-card">
      <div className="grid size-14 place-items-center rounded-full bg-tint">
        <Inbox className="size-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-primary-dark">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/** Coloured P&L pill: "+ ₹4,210 (+3.2%)". */
export function PnlBadge({ pnlPaise, pct }: { pnlPaise: number; pct: number }) {
  const positive = pnlPaise >= 0;
  const sign = positive ? "+" : "−";
  const absRupees = Math.abs(Math.round(pnlPaise / 100)).toLocaleString("en-IN");
  return (
    <span
      className={
        positive
          ? "inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success"
          : "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive"
      }
    >
      {sign} ₹{absRupees} ({sign}
      {Math.abs(pct).toFixed(1)}%)
    </span>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-primary-dark">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
