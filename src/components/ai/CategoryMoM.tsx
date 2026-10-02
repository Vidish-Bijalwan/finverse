import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { categoryMoM, previousMonth } from "@/lib/ai/engine";
import { formatINR, monthLabel } from "@/lib/finance/format";
import type { FinanceDB } from "@/lib/finance/types";

/**
 * Per-category spend this month vs last month, with % delta badges.
 * Rising spend is flagged red, falling spend green — the delta is always
 * grounded in the two real monthly totals shown on each row.
 */
export function CategoryMoM({ db, month }: { db: FinanceDB; month: string }) {
  const rows = useMemo(() => categoryMoM(db, month), [db, month]);
  const maxCur = useMemo(() => Math.max(1, ...rows.map((r) => r.curPaise)), [rows]);
  const prev = previousMonth(month);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">Category vs last month</CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            {monthLabel(month)} vs {monthLabel(prev)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No spending recorded in either month yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {rows.map((row) => {
              const delta = row.deltaPct;
              const isNew = delta === null;
              const up = !isNew && delta > 0;
              const flat = !isNew && delta === 0;
              return (
                <li key={row.categoryId}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color }}
                        aria-hidden
                      />
                      <span className="truncate text-sm font-semibold">{row.label}</span>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
                        isNew && "bg-primary/10 text-primary",
                        up && "bg-red-500/10 text-red-600 dark:text-red-400",
                        !up &&
                          !isNew &&
                          !flat &&
                          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        flat && "bg-muted text-muted-foreground",
                      )}
                    >
                      {isNew ? (
                        "New"
                      ) : (
                        <>
                          {up ? (
                            <ArrowUpRight className="size-3.5" aria-hidden />
                          ) : (
                            <ArrowDownRight className="size-3.5" aria-hidden />
                          )}
                          {Math.abs(delta)}%
                        </>
                      )}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={`${row.label}: ${formatINR(row.curPaise)} this month, ${formatINR(row.prevPaise)} last month`}
                  >
                    <div
                      className="h-full rounded-full transition-[width] motion-reduce:transition-none"
                      style={{
                        width: `${Math.max(2, Math.round((row.curPaise / maxCur) * 100))}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{formatINR(row.curPaise)}</span>
                    {" this month · "}
                    {formatINR(row.prevPaise)} last month
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
