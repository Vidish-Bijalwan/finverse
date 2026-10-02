import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultStatProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "primary" | "success" | "warning" | "danger";
  icon?: ReactNode;
}

const ACCENT: Record<NonNullable<ResultStatProps["accent"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
};

/** Big result number card used across calculator tabs. */
export function ResultStat({ label, value, sub, accent = "default", icon }: ResultStatProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4">
        {icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("truncate text-xl font-bold tabular-nums", ACCENT[accent])}>{value}</p>
          {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

/** Single label/value line for breakdown lists. */
export function ResultRow({ label, value, strong }: ResultRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span
        className={cn("text-sm text-muted-foreground", strong && "font-medium text-foreground")}
      >
        {label}
      </span>
      <span
        className={cn("text-sm tabular-nums", strong ? "font-bold text-foreground" : "font-medium")}
      >
        {value}
      </span>
    </div>
  );
}
