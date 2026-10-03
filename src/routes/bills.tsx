import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, ReceiptIndianRupee, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FINVERSE_QUERY_KEYS, useBills, usePayBill } from "@/lib/finance/hooks";
import { deleteBill, insertBill, updateBill } from "@/lib/finance/db";
import { categoryById } from "@/lib/finance/categories";
import { formatINR, todayISO } from "@/lib/finance/format";
import type { Bill } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { BillDialog, type BillFormInput } from "@/components/money/BillDialog";
import { ConfirmDeleteDialog } from "@/components/money/ConfirmDeleteDialog";
import { ordinal } from "@/components/money/utils";

export const Route = createFileRoute("/bills")({
  head: () => ({
    meta: [
      { title: "Bills — FinVerse AI" },
      {
        name: "description",
        content: "Track recurring bills, mark them paid, and stay ahead of due dates.",
      },
    ],
  }),
  component: BillsPage,
});

type BillStatus =
  | { kind: "paid"; label: string }
  | { kind: "dueToday"; label: string }
  | { kind: "upcoming"; label: string }
  | { kind: "overdue"; label: string };

/** Local bill mutations: the shared hooks layer only exposes list + pay. */
function useBillMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: FINVERSE_QUERY_KEYS.bills });
    qc.invalidateQueries({ queryKey: ["finverse", "db"] });
  };

  const saveBill = useMutation({
    mutationFn: (args: { id?: string; input: BillFormInput }): Promise<Bill> => {
      if (args.id) {
        return updateBill(args.id, args.input).then((bill) => {
          if (!bill) throw new Error("Bill not found");
          return bill;
        });
      }
      return insertBill(args.input);
    },
    onSuccess: invalidate,
  });

  const deleteBillMutation = useMutation({
    mutationFn: (id: string): Promise<boolean> => deleteBill(id),
    onSuccess: invalidate,
  });

  return { saveBill, deleteBill: deleteBillMutation };
}

function billStatus(bill: Bill, today: string): BillStatus {
  const currentMonth = today.slice(0, 7);
  if (bill.lastPaidOn && bill.lastPaidOn.slice(0, 7) === currentMonth) {
    return { kind: "paid", label: "Paid" };
  }
  const todayDay = Number(today.slice(8, 10));
  if (todayDay === bill.dueDay) return { kind: "dueToday", label: "Due today" };
  if (todayDay < bill.dueDay)
    return {
      kind: "upcoming",
      label: `Due in ${bill.dueDay - todayDay} day${bill.dueDay - todayDay === 1 ? "" : "s"}`,
    };
  return { kind: "overdue", label: "Overdue" };
}

const statusStyles: Record<BillStatus["kind"], string> = {
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  dueToday: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  upcoming: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  overdue: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
};

function BillRow({
  bill,
  today,
  onPay,
  paying,
  onEdit,
  onDelete,
}: {
  bill: Bill;
  today: string;
  onPay: () => void;
  paying: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = billStatus(bill, today);
  const category = categoryById(bill.category);
  const Icon = category?.icon ?? Plus;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${category?.color ?? "#64748B"}1A` }}
          aria-hidden
        >
          <Icon className="h-5 w-5" style={{ color: category?.color ?? "#64748B" }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{bill.name}</p>
            <Badge
              variant="outline"
              className={cn("shrink-0 font-medium", statusStyles[status.kind])}
            >
              {status.kind === "paid" && <Check className="mr-1 h-3 w-3" aria-hidden />}
              {status.label}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Due {ordinal(bill.dueDay)}
            {category ? ` · ${category.label}` : ""}
            {status.kind === "paid" && bill.lastPaidOn
              ? ` · Paid ${ordinal(Number(bill.lastPaidOn.slice(8, 10)))}`
              : ""}
          </p>
        </div>
        <p className="shrink-0 text-base font-semibold">{formatINR(bill.amountPaise)}</p>
        <div className="flex shrink-0 items-center gap-1">
          {status.kind === "paid" ? (
            <Button variant="ghost" size="sm" disabled className="text-emerald-600">
              <Check className="mr-1 h-4 w-4" aria-hidden />
              Paid
            </Button>
          ) : (
            <Button size="sm" onClick={onPay} disabled={paying}>
              {paying ? "Saving…" : "Mark paid"}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${bill.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Delete ${bill.name}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BillsPage() {
  const [today] = useState(() => todayISO());
  const { data: bills = [], isLoading } = useBills();
  const payBill = usePayBill();
  const { saveBill, deleteBill } = useBillMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [deleting, setDeleting] = useState<Bill | null>(null);

  const handleSave = (input: BillFormInput) => {
    const isEdit = Boolean(editing);
    const args = editing ? { id: editing.id, input } : { input };
    saveBill.mutate(args, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditing(null);
        toast.success(isEdit ? "Bill updated" : `Bill added · ${formatINR(input.amountPaise)}`);
      },
      onError: () => toast.error("Couldn't save — try again."),
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteBill.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        toast.success("Bill deleted");
      },
      onError: () => toast.error("Couldn't delete — try again."),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
          <p className="text-sm text-muted-foreground">
            Recurring bills and their due dates. Marking one paid records the expense.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Add bill
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading bills">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-tint">
              <ReceiptIndianRupee className="size-7 text-primary" />
            </span>
            <p className="text-lg font-medium">No bills yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add your first recurring bill — rent, electricity, a subscription — and never miss a
              due date again.
            </p>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Add your first bill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              today={today}
              onPay={() =>
                payBill.mutate(
                  { id: bill.id },
                  {
                    onSuccess: () =>
                      toast.success(`"${bill.name}" marked paid · ${formatINR(bill.amountPaise)}`),
                    onError: () => toast.error("Couldn't mark paid — try again."),
                  },
                )
              }
              paying={payBill.isPending && payBill.variables?.id === bill.id}
              onEdit={() => {
                setEditing(bill);
                setDialogOpen(true);
              }}
              onDelete={() => setDeleting(bill)}
            />
          ))}
        </div>
      )}

      <BillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
        saving={saveBill.isPending}
      />
      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete bill?"
        description={
          deleting ? `"${deleting.name}" will be removed. Past payment transactions are kept.` : ""
        }
        onConfirm={handleDelete}
        pending={deleteBill.isPending}
      />
    </div>
  );
}
