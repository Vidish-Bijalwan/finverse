import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dailySpendSeries } from "@/lib/ai/engine";
import { formatINR, monthLabel } from "@/lib/finance/format";
import type { FinanceDB } from "@/lib/finance/types";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** GitHub-style intensity: 0 = no spend, 4 = busiest day of the month. */
function intensityClass(level: number): string {
  switch (level) {
    case 1:
      return "bg-primary/20";
    case 2:
      return "bg-primary/40";
    case 3:
      return "bg-primary/70";
    case 4:
      return "bg-primary";
    default:
      return "bg-muted";
  }
}

interface Cell {
  dateISO: string | null;
  spendPaise: number;
  level: number;
}

/**
 * GitHub-style daily spending intensity grid for a month.
 * Darker cells = more spent that day. Pure rendering over real stored data.
 */
export function SpendingHeatmap({ db, month }: { db: FinanceDB; month: string }) {
  const { weeks, totalPaise, avgPaise, maxDay, maxPaise } = useMemo(() => {
    const series = dailySpendSeries(db, month);
    const max = Math.max(0, ...series.map((d) => d.spendPaise));
    const total = series.reduce((s, d) => s + d.spendPaise, 0);

    const [y = 1970, m = 1] = month.split("-").map(Number);
    const firstWeekday = new Date(y, m - 1, 1).getDay(); // 0 = Sunday

    // Week columns, each with 7 day rows (Sun..Sat), padded with nulls.
    const cells: (Cell | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (const d of series) {
      const level =
        d.spendPaise === 0 || max === 0 ? 0 : Math.min(4, Math.ceil((d.spendPaise / max) * 4));
      cells.push({ dateISO: d.dateISO, spendPaise: d.spendPaise, level });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weekCount = cells.length / 7;
    const weekCols: (Cell | null)[][] = [];
    for (let w = 0; w < weekCount; w += 1) {
      weekCols.push(cells.slice(w * 7, w * 7 + 7));
    }

    const peak = series.reduce((best, d) => (d.spendPaise > best.spendPaise ? d : best), {
      dateISO: "",
      spendPaise: 0,
    });

    return {
      weeks: weekCols,
      totalPaise: total,
      avgPaise: series.length > 0 ? Math.round(total / series.length) : 0,
      maxDay: peak.dateISO,
      maxPaise: peak.spendPaise,
    };
  }, [db, month]);

  const dayOfMonth = (iso: string) => iso.slice(8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">Spending heatmap</CardTitle>
          <span className="text-xs font-medium text-muted-foreground">{monthLabel(month)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="overflow-x-auto pb-1"
          role="img"
          aria-label={`Daily spending intensity for ${monthLabel(month)}. Total spent ${formatINR(totalPaise)}.`}
        >
          <div className="flex min-w-max gap-1.5">
            <div className="grid grid-rows-7 gap-1.5 pr-1" aria-hidden>
              {WEEKDAY_LABELS.map((d, i) => (
                <span
                  key={i}
                  className="grid size-3.5 place-items-center text-[10px] font-medium text-muted-foreground sm:size-4"
                >
                  {i % 2 === 1 ? d : ""}
                </span>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-rows-7 gap-1.5">
                {week.map((cell, di) =>
                  cell === null || cell.dateISO === null ? (
                    <span key={di} className="size-3.5 sm:size-4" aria-hidden />
                  ) : (
                    <span
                      key={di}
                      title={`${cell.dateISO}: ${formatINR(cell.spendPaise)} spent`}
                      aria-label={`${cell.dateISO}: ${formatINR(cell.spendPaise)} spent`}
                      className={cn(
                        "size-3.5 rounded-[3px] transition-transform motion-reduce:transition-none sm:size-4",
                        intensityClass(cell.level),
                      )}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={cn("size-3 rounded-[3px]", intensityClass(l))} aria-hidden />
          ))}
          <span>More</span>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/60 px-2 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Total</dt>
            <dd className="mt-0.5 text-sm font-bold">{formatINR(totalPaise)}</dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Avg / day</dt>
            <dd className="mt-0.5 text-sm font-bold">{formatINR(avgPaise)}</dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Busiest</dt>
            <dd className="mt-0.5 text-sm font-bold">
              {maxPaise > 0 ? `${dayOfMonth(maxDay)} · ${formatINR(maxPaise)}` : "—"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
