import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Mic,
  Plus,
  Repeat,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import { ExpenseForm, type ExpenseDraft } from "@/components/expenses/ExpenseForm";
import { RecurringList } from "@/components/money/RecurringList";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { allCategories, categoryById } from "@/lib/finance/categories";
import { formatINR, monthKey, monthLabel, todayISO } from "@/lib/finance/format";
import { isInvestmentOrder } from "@/lib/finance/investments";
import {
  useAccounts,
  useAllTags,
  useDeleteTransaction,
  useAddTransaction,
  useMonth,
  useTransactions,
} from "@/lib/finance/hooks";
import { parseExpenseInput } from "@/lib/nlp";
import { buildTransactionsCSV } from "@/lib/settings";
import { useVoiceInput } from "@/lib/voice";
import type { PayMode, Transaction } from "@/lib/finance/types";
import { cn, downloadFile } from "@/lib/utils";
import { ErrorState, pressable } from "@/components/fv";

export const Route = createFileRoute("/expenses")({
  /** `?add=1` deep-link opens the add-expense sheet (dashboard quick action). */
  validateSearch: (search: Record<string, unknown>): { add?: "1" } => ({
    ...(search["add"] === "1" ? { add: "1" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Expenses — FinVerse AI" },
      {
        name: "description",
        content: "Track every rupee: add, edit, and search your expenses and income.",
      },
    ],
  }),
  component: ExpensesPage,
});

type TypeFilter = "all" | "expense" | "income";
type Tab = "transactions" | "recurring";

const DELETE_WIDTH = 88;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabel(dateISO: string): string {
  if (dateISO === todayISO()) return "Today";
  if (dateISO === toISODate(new Date(Date.now() - 86_400_000))) return "Yesterday";
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function shiftMonth(key: string, delta: number): string {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

/**
 * Row that reveals a Delete action on left-swipe (touch).
 * Tapping the row opens the edit sheet; the delete target sits behind.
 */
function SwipeableRow({
  onDelete,
  deleteLabel,
  onOpen,
  children,
}: {
  onDelete: () => void;
  deleteLabel: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);

  const translate = open ? -DELETE_WIDTH : -dx;

  return (
    <div className="relative overflow-hidden rounded-[14px]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={deleteLabel}
        tabIndex={open ? 0 : -1}
        className="absolute inset-y-0 right-0 flex w-[88px] cursor-pointer flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground"
      >
        <Trash2 className="h-5 w-5" />
        <span className="text-xs font-semibold">Delete</span>
      </button>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) startX.current = touch.clientX;
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (startX.current === null || !touch) return;
          const delta = startX.current - touch.clientX;
          setDx(delta > 0 ? Math.min(delta, DELETE_WIDTH) : 0);
        }}
        onTouchEnd={() => {
          setOpen(dx > DELETE_WIDTH / 2);
          setDx(0);
          startX.current = null;
        }}
        className={cn(
          "relative cursor-pointer bg-card",
          "motion-safe:transition-transform motion-safe:duration-150",
        )}
        style={{ transform: `translateX(${translate}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * DEMO STUB — receipt scan results.
 * Plug a real OCR service (e.g. on-device ML Kit / a vision API) here:
 * replace MOCK_RECEIPTS with the parsed { merchant, total } from the scan.
 */
const MOCK_RECEIPTS: {
  merchant: string;
  amountPaise: number;
  category: string;
  payMode: PayMode;
}[] = [
  { merchant: "Swiggy", amountPaise: 48600, category: "food", payMode: "UPI" },
  { merchant: "BigBasket", amountPaise: 124950, category: "groceries", payMode: "Card" },
  { merchant: "Uber", amountPaise: 21300, category: "transport", payMode: "UPI" },
  { merchant: "Apollo Pharmacy", amountPaise: 87500, category: "health", payMode: "Card" },
];

function ExpensesPage() {
  const routeSearch = Route.useSearch();
  const navigate = useNavigate();
  const [month, setMonth] = useMonth();
  const [tab, setTab] = useState<Tab>("transactions");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const [quickAdd, setQuickAdd] = useState("");
  const [scanning, setScanning] = useState(false);
  const receiptIdx = useRef(0);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sheet, setSheet] = useState<null | { mode: "add" } | { mode: "edit"; txn: Transaction }>(
    null,
  );
  const [prefill, setPrefill] = useState<ExpenseDraft | null>(null);

  const { data: txns, isLoading, isError, refetch } = useTransactions(month);
  const { data: accounts } = useAccounts();
  const { data: allTagList } = useAllTags();
  const addTxn = useAddTransaction();
  const deleteTxn = useDeleteTransaction();

  const defaultAccountId = accounts?.find((a) => a.isDefault)?.id ?? accounts?.[0]?.id;

  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.info("Nothing to export — no transactions match the current filters.");
      return;
    }
    downloadFile(`finverse-expenses-${month}.csv`, buildTransactionsCSV(filtered), "text/csv");
    toast.success(
      `Exported ${filtered.length} transaction${filtered.length === 1 ? "" : "s"} to CSV.`,
    );
  }

  const {
    supported: voiceSupported,
    listening,
    transcript,
    error: voiceError,
    start: startVoice,
    stop: stopVoice,
    clear: clearVoice,
  } = useVoiceInput();

  // Feed finished voice transcripts into the quick-add box.
  useEffect(() => {
    if (!listening && transcript.trim()) {
      const text = transcript.trim();
      setQuickAdd((prev) => (prev ? `${prev} ${text}` : text));
      clearVoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  // Clean up a pending mock scan if the page unmounts mid-scan.
  useEffect(() => {
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, []);

  const parsed = useMemo(() => parseExpenseInput(quickAdd), [quickAdd]);

  const filtered = useMemo(() => {
    const list = txns ?? [];
    const q = search.trim().toLowerCase();
    return list
      .filter((t) => {
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (catFilter !== "all" && t.category !== catFilter) return false;
        if (tagFilter.length > 0) {
          const txnTags = t.tags ?? [];
          if (!tagFilter.some((tag) => txnTags.includes(tag))) return false;
        }
        if (q) {
          const label = categoryById(t.category)?.label ?? t.category;
          const hay =
            `${t.note} ${label} ${t.payMode} ${(t.tags ?? []).join(" ")} ${formatINR(t.amountPaise)} ${t.amountPaise / 100}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) =>
        a.dateISO === b.dateISO
          ? a.createdAt < b.createdAt
            ? 1
            : -1
          : a.dateISO < b.dateISO
            ? 1
            : -1,
      );
  }, [txns, search, typeFilter, catFilter, tagFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const arr = map.get(t.dateISO);
      if (arr) arr.push(t);
      else map.set(t.dateISO, [t]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const totals = useMemo(() => {
    let spent = 0;
    let earned = 0;
    for (const t of txns ?? []) {
      // Investment orders are transfers, not spending/income.
      if (isInvestmentOrder(t)) continue;
      if (t.type === "expense") spent += t.amountPaise;
      else if (t.type === "income") earned += t.amountPaise;
    }
    return { spent, earned };
  }, [txns]);

  const openAdd = (draft?: ExpenseDraft | null) => {
    setPrefill(draft ?? null);
    setSheet({ mode: "add" });
  };

  // `?add=1` deep-link (dashboard "Add expense" quick action): open the real
  // add sheet once, then drop the param so back/forward stays clean.
  const addHandled = useRef(false);
  useEffect(() => {
    if (routeSearch["add"] === "1" && !addHandled.current) {
      addHandled.current = true;
      openAdd();
      void navigate({ to: "/expenses", search: {}, replace: true });
    }
  }, [routeSearch, navigate]);

  const confirmQuickAdd = () => {
    if (!parsed || addTxn.isPending) return;
    const cat = categoryById(parsed.category);
    addTxn.mutate(
      {
        type: parsed.type,
        amountPaise: parsed.amountPaise,
        category: parsed.category,
        note: parsed.note || cat?.label || "Quick add",
        dateISO: todayISO(),
        payMode: "UPI",
        ...(defaultAccountId ? { accountId: defaultAccountId } : {}),
      },
      {
        onSuccess: () => {
          setQuickAdd("");
          toast.success(
            `${parsed.type === "income" ? "Income" : "Expense"} added · ${formatINR(parsed.amountPaise)}`,
          );
        },
        onError: () => toast.error("Couldn't save — try again."),
      },
    );
  };

  const mockReceiptScan = () => {
    if (scanning) return;
    setScanning(true);
    scanTimer.current = setTimeout(() => {
      const r = MOCK_RECEIPTS[receiptIdx.current % MOCK_RECEIPTS.length];
      receiptIdx.current += 1;
      if (!r) {
        setScanning(false);
        return;
      }
      setScanning(false);
      openAdd({
        amountPaise: r.amountPaise,
        category: r.category,
        note: `Receipt · ${r.merchant}`,
        type: "expense",
        payMode: r.payMode,
      });
    }, 1200);
  };

  const previewCat = parsed ? categoryById(parsed.category) : undefined;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
      {/* Header + month selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Previous month"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-20 text-center text-sm font-semibold">{monthLabel(month)}</span>
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label="Next month"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs: transactions / recurring + accounts shortcut */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="flex flex-1 gap-1 rounded-[14px] bg-muted p-1"
          role="tablist"
          aria-label="Expenses sections"
        >
          {(
            [
              ["transactions", "Transactions"],
              ["recurring", "Recurring"],
            ] as [Tab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                pressable,
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                tab === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "recurring" && <Repeat className="h-4 w-4" />}
              {label}
            </button>
          ))}
        </div>
        <Link
          to="/accounts"
          search={{}}
          aria-label="Manage accounts"
          className="flex items-center gap-1.5 rounded-[14px] bg-card px-3.5 py-2.5 text-sm font-bold text-primary shadow-tile transition-colors hover:bg-primary/10"
        >
          <Wallet className="h-4 w-4" /> Accounts
        </Link>
        <button
          type="button"
          onClick={handleExportCSV}
          aria-label="Export visible transactions to CSV"
          title="Export visible transactions to CSV"
          className="flex items-center gap-1.5 rounded-[14px] bg-card px-3.5 py-2.5 text-sm font-bold text-primary shadow-tile transition-colors hover:bg-primary/10"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {tab === "recurring" ? (
        <div className="mt-4">
          <RecurringList />
        </div>
      ) : (
        <>
          {/* Month totals */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[14px] bg-card p-3 shadow-tile">
              <p className="text-xs font-medium text-muted-foreground">Spent</p>
              <p className="text-lg font-bold tabular-nums text-destructive">
                {formatINR(totals.spent)}
              </p>
            </div>
            <div className="rounded-[14px] bg-card p-3 shadow-tile">
              <p className="text-xs font-medium text-muted-foreground">Earned</p>
              <p className="text-lg font-bold tabular-nums text-success">
                {formatINR(totals.earned)}
              </p>
            </div>
          </div>

          {/* Quick-add bar */}
          <div className="mt-3 rounded-[14px] bg-card p-2 shadow-tile">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={quickAdd}
                onChange={(e) => setQuickAdd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmQuickAdd();
                }}
                placeholder='Try "chai with friends 250"…'
                aria-label="Quick add expense"
                className="h-11 flex-1 rounded-xl bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {quickAdd && (
                <button
                  type="button"
                  onClick={() => setQuickAdd("")}
                  aria-label="Clear quick add"
                  className={cn(pressable, "rounded-full p-2 text-muted-foreground hover:bg-muted")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => (listening ? stopVoice() : startVoice())}
                disabled={!voiceSupported && !listening}
                aria-label={listening ? "Stop voice input" : "Voice input"}
                title={
                  voiceSupported ? "Speak an expense" : "Voice input not supported in this browser"
                }
                className={cn(
                  pressable,
                  "rounded-full p-2.5 transition-colors",
                  listening
                    ? "bg-destructive text-destructive-foreground motion-safe:animate-pulse"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40",
                )}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={mockReceiptScan}
                disabled={scanning}
                aria-label="Scan receipt"
                title="Scan a receipt (demo)"
                className={cn(
                  pressable,
                  "rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60",
                )}
              >
                {scanning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Live parse preview chip */}
            {parsed && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5">
                <p className="truncate text-sm">
                  <span className="font-bold tabular-nums">{formatINR(parsed.amountPaise)}</span>
                  <span className="text-muted-foreground"> · </span>
                  <span className="font-medium">{previewCat?.label ?? parsed.category}</span>
                  {parsed.note && (
                    <>
                      <span className="text-muted-foreground"> · </span>
                      <span className="text-muted-foreground">“{parsed.note}”</span>
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={confirmQuickAdd}
                  disabled={addTxn.isPending}
                  className={cn(
                    pressable,
                    "shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60",
                  )}
                >
                  {addTxn.isPending ? "Saving…" : "Confirm"}
                </button>
              </div>
            )}
            {scanning && (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
                Scanning receipt…
              </p>
            )}
            {voiceError && !listening && (
              <p className="px-3 py-2 text-sm text-destructive" role="alert">
                {voiceError}
              </p>
            )}
            {listening && (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
                Listening… say something like “chai 250”
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, categories…"
              aria-label="Search transactions"
              className="h-11 w-full rounded-2xl border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Type chips + category select */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className="flex gap-1 rounded-[14px] bg-muted p-1"
              role="tablist"
              aria-label="Type filter"
            >
              {(
                [
                  ["all", "All"],
                  ["expense", "Expenses"],
                  ["income", "Income"],
                ] as [TypeFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={typeFilter === value}
                  onClick={() => setTypeFilter(value)}
                  className={cn(
                    pressable,
                    "min-h-[44px] rounded-xl px-3.5 text-sm font-semibold transition-colors",
                    typeFilter === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              aria-label="Filter by category"
              className="h-10 flex-1 rounded-2xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All categories</option>
              <optgroup label="Expenses">
                {allCategories()
                  .filter((c) => c.kind === "expense")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Income">
                {allCategories()
                  .filter((c) => c.kind === "income")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Tag filter chips */}
          {(allTagList ?? []).length > 0 && (
            <div
              className="mt-2 flex gap-1.5 overflow-x-auto pb-1"
              role="group"
              aria-label="Filter by tag"
            >
              {(allTagList ?? []).map((tag) => {
                const active = tagFilter.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setTagFilter((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                      )
                    }
                    className={cn(
                      pressable,
                      "min-h-[44px] shrink-0 rounded-full px-3 text-xs font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    #{tag}
                  </button>
                );
              })}
              {tagFilter.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTagFilter([])}
                  className={cn(
                    pressable,
                    "flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive",
                  )}
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          )}

          {/* Transaction list */}
          <div className="mt-4 flex flex-col gap-5">
            {isLoading && (
              <div className="flex flex-col gap-3" aria-label="Loading transactions">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[14px] bg-card p-3">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="mt-2 h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && isError && (
              <ErrorState
                title="Couldn't load your transactions"
                body="Your transactions failed to load. Check your connection and try again."
                onRetry={() => void refetch()}
              />
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-[14px] bg-card px-6 py-12 text-center shadow-tile">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-muted">
                  <Plus className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold">No transactions — add your first</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Type it, speak it, or scan a receipt above.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAdd()}
                  className={cn(
                    pressable,
                    "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90",
                  )}
                >
                  Add transaction
                </button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              groups.map(([dateISO, items]) => {
                let daySpent = 0;
                let dayEarned = 0;
                for (const t of items) {
                  if (isInvestmentOrder(t)) continue;
                  if (t.type === "expense") daySpent += t.amountPaise;
                  else if (t.type === "income") dayEarned += t.amountPaise;
                }
                return (
                  <section key={dateISO} aria-label={dayLabel(dateISO)}>
                    <div className="mb-2 flex items-baseline justify-between px-1">
                      <h2 className="text-sm font-bold text-muted-foreground">
                        {dayLabel(dateISO)}
                      </h2>
                      <p className="text-xs font-medium tabular-nums text-muted-foreground">
                        {daySpent > 0 && (
                          <span className="text-destructive">− {formatINR(daySpent)}</span>
                        )}
                        {daySpent > 0 && dayEarned > 0 && " · "}
                        {dayEarned > 0 && (
                          <span className="text-success">+ {formatINR(dayEarned)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {items.map((t) => {
                        const cat = categoryById(t.category);
                        const Icon = cat?.icon ?? Plus;
                        const color = cat?.color ?? "#64748B";
                        return (
                          <SwipeableRow
                            key={t.id}
                            onOpen={() => setSheet({ mode: "edit", txn: t })}
                            onDelete={() =>
                              deleteTxn.mutate(t.id, {
                                onSuccess: () => toast.success("Transaction deleted"),
                                onError: () => toast.error("Couldn't delete — try again."),
                              })
                            }
                            deleteLabel={`Delete ${t.note || cat?.label || "transaction"}`}
                          >
                            <div className="flex items-center gap-3 rounded-[14px] bg-card p-3 shadow-tile">
                              <span
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: `${color}1f`, color }}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {t.note || cat?.label || t.category}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {dayLabel(t.dateISO)} · {t.payMode}
                                  {(t.tags ?? []).length > 0 && (
                                    <> · {(t.tags ?? []).map((tag) => `#${tag}`).join(" ")}</>
                                  )}
                                </p>
                              </div>
                              <p
                                className={cn(
                                  "shrink-0 text-sm font-bold tabular-nums",
                                  t.type === "expense" ? "text-destructive" : "text-success",
                                )}
                              >
                                {t.type === "expense" ? "−" : "+"} {formatINR(t.amountPaise)}
                              </p>
                            </div>
                          </SwipeableRow>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
          </div>
        </>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => openAdd()}
        aria-label="Add transaction"
        className={cn(
          pressable,
          "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] md:bottom-6 md:right-6",
          "bg-primary text-primary-foreground shadow-modal transition-transform hover:scale-105",
        )}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add / edit sheet */}
      <BottomSheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
          setPrefill(null);
        }}
        title={sheet?.mode === "edit" ? "Edit transaction" : "Add transaction"}
        showCloseButton
      >
        {sheet?.mode === "edit" ? (
          <ExpenseForm
            key={sheet.txn.id}
            editing={sheet.txn}
            onDone={() => {
              setSheet(null);
              setPrefill(null);
            }}
          />
        ) : (
          <ExpenseForm
            key={prefill ? `draft-${prefill.amountPaise}-${prefill.note}` : "new"}
            draft={prefill}
            onDone={() => {
              setSheet(null);
              setPrefill(null);
            }}
          />
        )}
      </BottomSheet>
    </div>
  );
}
