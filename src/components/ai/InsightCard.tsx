import { useState } from "react";
import {
  AlertOctagon,
  CalendarClock,
  ChevronDown,
  Lightbulb,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/finance/types";

const KIND_ICONS: Record<string, LucideIcon> = {
  overspend: TrendingUp,
  savings: PiggyBank,
  budget: AlertOctagon,
  unusual: Receipt,
  goal: Target,
  bill: CalendarClock,
};

const CONFIDENCE_STYLES: Record<Insight["confidence"], string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const Icon = KIND_ICONS[insight.kind] ?? Lightbulb;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
            <Icon className="size-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-snug">{insight.title}</CardTitle>
            <Badge
              variant="outline"
              className={cn("mt-2 capitalize", CONFIDENCE_STYLES[insight.confidence])}
            >
              {insight.confidence} confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-muted-foreground">{insight.body}</p>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Why this?
            <ChevronDown
              className={cn(
                "size-4 transition-transform motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="motion-reduce:animate-none">
            <ul className="mt-2 space-y-1.5 rounded-md bg-muted/60 p-3 text-sm leading-6">
              {insight.evidence.map((fact, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-primary">
                    •
                  </span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
