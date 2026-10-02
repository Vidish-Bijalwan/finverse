import { useState } from "react";
import { CalendarClock, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RecurringDialog } from "./RecurringDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateLong } from "@/components/money/utils";
import { categoryById } from "@/lib/finance/categories";
import { formatINR } from "@/lib/finance/format";
import { nextRecurringDate } from "@/lib/finance/store";
import { todayISO } from "@/lib/finance/format";
import {
  useDeleteRecurringRule,
  useRecurringRules,
  useToggleRecurringRule,
  useAccountSummaries,
} from "@/lib/finance/hooks";
import type { RecurringRule } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const FREQUENCY_LABEL: Record<RecurringRule["frequency"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function RuleRow({ rule, onEdit }: { rule: RecurringRule; onEdit: (rule: RecurringRule) => void }) {
  const toggle = useToggleRecurringRule();
  const deleteRule = useDeleteRecurringRule();
  const { data: summaries } = useAccountSummaries();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const cat = categoryById(rule.category);
  const Icon = cat?.icon ?? CalendarClock;
  const color = cat?.color ?? "#64748B";
  const accountName = summaries?.find((s) => s.account.id === rule.accountId)?.account.name;
  const next = rule.isPaused ? null : nextRecurringDate(rule, todayISO());
  const overdue = next !== null && next <= todayISO();

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-card p-3 shadow-tile",
        rule.isPaused && "opacity-60",
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{rule.note || cat?.label || "Recurring"}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {FREQUENCY_LABEL[rule.frequency]}
          {accountName ? ` · ${accountName}` : ""}
          {next
            ? overdue
              ? ` · due ${formatDateLong(next)}`
              : ` · next ${formatDateLong(next)}`
            : rule.isPaused
              ? " · paused"
              : rule.endDateISO
                ? " · ended"
                : ""}
        </p>
        {rule.lastPostedDateISO && (
          <p className="text-[11px] text-muted-foreground">
            Last posted {formatDateLong(rule.lastPostedDateISO)}
          </p>
        )}
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-bold tabular-nums",
          rule.type === "expense" ? "text-destructive" : "text-success",
        )}
      >
        {rule.type === "expense" ? "−" : "+"} {formatINR(rule.amountPaise)}
      </p>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={() =>
            toggle.mutate(
              { id: rule.id, isPaused: !rule.isPaused },
              {
                onSuccess: () =>
                  toast.success(rule.isPaused ? "Recurring rule resumed" : "Recurring rule paused"),
                onError: () => toast.error("Couldn't update — try again."),
              },
            )
          }
          disabled={toggle.isPending}
          aria-label={rule.isPaused ? `Resume ${rule.note}` : `Pause ${rule.note}`}
          title={rule.isPaused ? "Resume" : "Pause"}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {rule.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => onEdit(rule)}
          aria-label={`Edit ${rule.note}`}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label={`Delete ${rule.note}`}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDeleteDialog
        open={confirmingDelete}
        onOpenChange={(o) => !o && setConfirmingDelete(false)}
        title="Delete recurring rule?"
        description="Future occurrences stop. Transactions already posted stay in your history."
        pending={deleteRule.isPending}
        onConfirm={() => {
          deleteRule.mutate(rule.id, {
            onSuccess: () => {
              toast.success("Recurring rule deleted");
              setConfirmingDelete(false);
            },
            onError: () => toast.error("Couldn't delete — try again."),
          });
        }}
      />
    </li>
  );
}

/** Full manage/pause/delete UI for recurring rules, with a "new rule" action. */
export function RecurringList() {
  const { data: rules, isLoading, isError } = useRecurringRules();
  const [dialog, setDialog] = useState<null | { editing?: RecurringRule | null }>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" aria-label="Loading recurring rules">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-card p-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl bg-card px-6 py-10 text-center shadow-tile">
        <p className="text-sm font-semibold">Couldn't load recurring rules</p>
        <p className="mt-1 text-sm text-muted-foreground">Pull to refresh or try again.</p>
      </div>
    );
  }

  const list = rules ?? [];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setDialog({ editing: null })}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30",
          "py-3.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary",
        )}
      >
        <Plus className="h-5 w-5" /> New recurring rule
      </button>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-12 text-center shadow-tile">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <CalendarClock className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold">No recurring rules yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Automate rent, SIPs, subscriptions, salary — due entries post themselves when you open
              the app.
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((rule) => (
            <RuleRow key={rule.id} rule={rule} onEdit={(r) => setDialog({ editing: r })} />
          ))}
        </ul>
      )}

      <RecurringDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        editing={dialog?.editing ?? null}
      />
    </div>
  );
}
