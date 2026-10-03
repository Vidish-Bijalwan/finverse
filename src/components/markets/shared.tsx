import type { ReactNode } from "react";

// EmptyState lives in components/fv/ now; re-exported here so existing
// imports keep working.
export { EmptyState } from "@/components/fv/EmptyState";

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
