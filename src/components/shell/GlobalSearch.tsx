import { useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Receipt, ReceiptIndianRupee, Search, Target, TrendingUp, X } from "lucide-react";

import { loadFinanceDB } from "@/lib/finance/db";
import type { FinanceDB } from "@/lib/finance/types";
import { categoryById } from "@/lib/finance/categories";
import { formatINR } from "@/lib/finance/format";
import { STOCKS } from "@/lib/market/data";
import { cn } from "@/lib/utils";

type Group = "Transactions" | "Bills" | "Goals" | "Stocks";

interface SearchResult {
  key: string;
  group: Group;
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
}

const GROUP_ICON: Record<Group, typeof Search> = {
  Transactions: Receipt,
  Bills: ReceiptIndianRupee,
  Goals: Target,
  Stocks: TrendingUp,
};

const GROUP_ORDER: Group[] = ["Transactions", "Bills", "Goals", "Stocks"];
const MAX_PER_GROUP = 5;

/** Parse a rupee amount out of the query ("₹1,500", "1500", "1500.50"). */
function parseRupees(q: string): number | null {
  const cleaned = q.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function buildResults(query: string, db: FinanceDB | undefined): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const rupees = parseRupees(query.trim());
  const paise = rupees !== null ? Math.round(rupees * 100) : null;

  const out: SearchResult[] = [];

  // --- Transactions / bills / goals (need the finance DB) ---
  if (db) {
    // --- Transactions: note, category label, type, pay mode, date, amount ---
    const txns = db.transactions
      .filter((t) => {
        const cat = categoryById(t.category);
        const hay =
          `${t.note} ${t.category} ${cat?.label ?? ""} ${t.type} ${t.payMode} ${t.dateISO}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (paise !== null && t.amountPaise === paise) return true;
        if (formatINR(t.amountPaise).toLowerCase().includes(q)) return true;
        return false;
      })
      .slice(0, MAX_PER_GROUP);
    for (const t of txns) {
      const cat = categoryById(t.category);
      out.push({
        key: `txn-${t.id}`,
        group: "Transactions",
        title: t.note || cat?.label || t.category,
        subtitle: `${t.dateISO} · ${formatINR(t.amountPaise)}`,
        to: "/expenses",
      });
    }

    // --- Bills ---
    const bills = db.bills
      .filter((b) => {
        const hay = `${b.name} ${b.category} ${b.dueDay}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (paise !== null && b.amountPaise === paise) return true;
        return false;
      })
      .slice(0, MAX_PER_GROUP);
    for (const b of bills) {
      out.push({
        key: `bill-${b.id}`,
        group: "Bills",
        title: b.name,
        subtitle: `${formatINR(b.amountPaise)} · due day ${b.dueDay}`,
        to: "/bills",
      });
    }

    // --- Goals ---
    const goals = db.goals
      .filter((g) => {
        const hay = `${g.name} ${g.deadline}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (paise !== null && (g.targetPaise === paise || g.savedPaise === paise)) return true;
        return false;
      })
      .slice(0, MAX_PER_GROUP);
    for (const g of goals) {
      out.push({
        key: `goal-${g.id}`,
        group: "Goals",
        title: g.name,
        subtitle: `${formatINR(g.savedPaise)} of ${formatINR(g.targetPaise)}`,
        to: "/goals",
      });
    }
  }

  // --- Stocks (41-stock universe) ---
  const stocks = STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q),
  ).slice(0, MAX_PER_GROUP);
  for (const s of stocks) {
    out.push({
      key: `stock-${s.symbol}`,
      group: "Stocks",
      title: s.symbol,
      subtitle: `${s.name} · ${s.sector}`,
      to: "/stocks/$symbol",
      params: { symbol: s.symbol },
    });
  }

  return out;
}

/**
 * Standalone global search. Mounted by the coordinator in the app header.
 * Searches transactions, bills, goals and the stock universe with grouped,
 * keyboard-accessible results; activating a result navigates to the right page.
 */
export function GlobalSearch({
  placeholder = "Search transactions, bills, goals, stocks…",
  onNavigate,
}: {
  placeholder?: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const dbQuery = useQuery({
    queryKey: ["finverse", "db"],
    queryFn: loadFinanceDB,
  });

  const results = useMemo(() => buildResults(query, dbQuery.data), [query, dbQuery.data]);
  const showPanel = open && query.trim().length > 0;

  function go(r: SearchResult) {
    setOpen(false);
    setQuery("");
    setActive(0);
    onNavigate?.();
    inputRef.current?.blur();
    if (r.params) {
      void navigate({ to: r.to, params: r.params as { symbol: string } });
    } else {
      void navigate({ to: r.to });
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showPanel || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[active] ?? results[0];
      if (target) go(target);
    }
  }

  let lastGroup: Group | null = null;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-input bg-card py-2 pl-3 pr-2 shadow-tile transition-colors focus-within:border-ring">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={showPanel && results.length > 0 ? `gs-opt-${active}` : undefined}
          aria-label="Global search"
          type="search"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-36 bg-transparent text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:w-44 sm:w-44 sm:focus:w-56 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setActive(0);
              inputRef.current?.focus();
            }}
            className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showPanel && (
        <>
          <button
            type="button"
            aria-label="Close search results"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-modal sm:w-96">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for “{query.trim()}”.
              </p>
            ) : (
              <ul role="listbox" id={listId} aria-label="Search results">
                {results.map((r, i) => {
                  const showHeader = r.group !== lastGroup;
                  lastGroup = r.group;
                  const Icon = GROUP_ICON[r.group];
                  return (
                    <li key={r.key}>
                      {showHeader && (
                        <p
                          aria-hidden
                          className="px-2.5 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          {r.group}
                        </p>
                      )}
                      <button
                        type="button"
                        role="option"
                        id={`gs-opt-${i}`}
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                          i === active ? "bg-accent text-accent-foreground" : "text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-lg",
                            i === active ? "bg-background/20" : "bg-primary/10 text-primary",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{r.title}</span>
                          <span
                            className={cn(
                              "block truncate text-xs",
                              i === active ? "opacity-80" : "text-muted-foreground",
                            )}
                          >
                            {r.subtitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
              ↑↓ to navigate · Enter to open · Esc to close
            </p>
          </div>
        </>
      )}
    </div>
  );
}
