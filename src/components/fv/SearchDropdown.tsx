import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  right?: string;
  rightTone?: "gain" | "loss" | "neutral";
}

export interface SearchResultGroup {
  label: string;
  items: SearchResultItem[];
}

/**
 * Search input + grouped results dropdown (group label → rows with
 * name/symbol/price/change). Keyboard navigable: ArrowUp/Down + Enter + Escape.
 * Follows the combobox/listbox/option ARIA pattern.
 */
export function SearchDropdown({
  groups,
  onSelect,
  placeholder = "Search stocks, funds, ETFs…",
  value,
  onChange,
  className,
}: {
  groups: SearchResultGroup[];
  onSelect: (item: SearchResultItem) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = value ?? internal;

  const flat = useMemo(() => {
    const out: { group: string; item: SearchResultItem }[] = [];
    for (const g of groups) for (const item of g.items) out.push({ group: g.label, item });
    return out;
  }, [groups]);

  const total = flat.length;
  const clamped = total === 0 ? 0 : Math.min(active, total - 1);

  useEffect(() => {
    setActive(0);
  }, [query, groups]);

  const choose = (item: SearchResultItem) => {
    onSelect(item);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (total === 0 ? 0 : (a + 1) % total));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (total === 0 ? 0 : (a - 1 + total) % total));
    } else if (e.key === "Enter") {
      if (open && flat[clamped]) {
        e.preventDefault();
        choose(flat[clamped].item);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const setQuery = (v: string) => {
    if (onChange) onChange(v);
    else setInternal(v);
    setOpen(true);
  };

  // Keep the active option visible.
  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [clamped, open]);

  let cursor = -1;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open && total > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && flat[clamped] ? `${listId}-${flat[clamped].item.id}` : undefined
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted/60"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {open && total > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-auto rounded-2xl border border-border bg-card p-2 shadow-modal"
        >
          {groups.map(
            (g) =>
              g.items.length > 0 && (
                <li key={g.label} role="presentation">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-muted-foreground uppercase">
                    {g.label}
                  </p>
                  <ul>
                    {g.items.map((item) => {
                      cursor += 1;
                      const idx = cursor;
                      const isActive = idx === clamped;
                      return (
                        <li
                          key={item.id}
                          id={`${listId}-${item.id}`}
                          role="option"
                          aria-selected={isActive}
                          ref={isActive ? activeRef : undefined}
                        >
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(item)}
                            onMouseEnter={() => setActive(idx)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                              isActive ? "bg-muted" : "bg-transparent",
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {item.title}
                              </span>
                              {item.subtitle && (
                                <span className="block truncate text-xs text-muted-foreground">
                                  {item.subtitle}
                                </span>
                              )}
                            </span>
                            {item.right && (
                              <span
                                className={cn(
                                  "shrink-0 text-sm font-bold tabular-nums",
                                  item.rightTone === "gain" && "text-gain",
                                  item.rightTone === "loss" && "text-loss",
                                  (item.rightTone === "neutral" || !item.rightTone) &&
                                    "text-muted-foreground",
                                )}
                              >
                                {item.right}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ),
          )}
        </ul>
      )}
    </div>
  );
}
