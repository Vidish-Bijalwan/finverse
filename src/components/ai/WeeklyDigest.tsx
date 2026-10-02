import { useMemo } from "react";
import { CalendarRange, Lightbulb } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { weeklyDigest } from "@/lib/ai/engine";
import { formatINR, todayISO } from "@/lib/finance/format";
import type { FinanceDB } from "@/lib/finance/types";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-09-29" -> "29 Sep"; range -> "29 Sep – 5 Oct 2026". */
function weekRangeLabel(startISO: string, endISO: string): string {
  const [sy = 0, sm = 1, sd = 1] = startISO.split("-").map(Number);
  const [ey = 0, em = 1, ed = 1] = endISO.split("-").map(Number);
  const start = `${sd} ${MONTHS_SHORT[sm - 1]}`;
  const end = `${ed} ${MONTHS_SHORT[em - 1]}`;
  return sm === em ? `${start} – ${end} ${ey}` : `${start} – ${end} ${ey}`;
}

/**
 * Auto-generated weekly summary card: this week's spend, saved
 * (income − expenses), top category, and one actionable tip derived from
 * the week's real data.
 */
export function WeeklyDigest({ db }: { db: FinanceDB }) {
  const digest = useMemo(() => weeklyDigest(db, todayISO()), [db]);
  const savedNegative = digest.savedPaise < 0;
  const savingsRate =
    digest.incomePaise > 0 ? Math.round((digest.savedPaise / digest.incomePaise) * 100) : null;

  return (
    <Card className="border-primary/25 bg-gradient-to-b from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <CalendarRange className="size-4" aria-hidden /> WEEKLY DIGEST
        </div>
        <CardTitle className="text-base">
          {weekRangeLabel(digest.weekStartISO, digest.weekEndISO)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/60 px-2 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Spent</dt>
            <dd className="mt-0.5 text-sm font-bold">{formatINR(digest.spentPaise)}</dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Saved</dt>
            <dd
              className={cn(
                "mt-0.5 text-sm font-bold",
                savedNegative
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {formatINR(digest.savedPaise)}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Top category</dt>
            <dd
              className="mt-0.5 truncate text-sm font-bold"
              title={digest.topCategoryLabel ?? undefined}
            >
              {digest.topCategoryLabel ?? "—"}
            </dd>
          </div>
        </dl>

        {savingsRate !== null && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Savings rate this week:{" "}
            <span
              className={cn(
                "font-bold",
                savingsRate < 10
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {savingsRate}%
            </span>
          </p>
        )}

        <div className="mt-3 flex gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
          <Lightbulb
            className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden
          />
          <p className="text-sm leading-6">
            <span className="font-bold">Tip: </span>
            {digest.tip}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
