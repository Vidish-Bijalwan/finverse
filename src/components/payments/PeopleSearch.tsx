import { useMemo, useRef, useState } from "react";
import { AtSign, Search, Smartphone, X } from "lucide-react";
import { initialsOf, pressable } from "@/components/fv";
import { cn } from "@/lib/utils";
import {
  isValidMobileNumber,
  isValidUpiId,
  searchPeople,
  type PayeePerson,
} from "@/lib/payment-contacts";

/**
 * "Search people or UPI ID" — the consumer-payments search bar.
 *
 * Matches recent people by name/detail, and when the query itself looks
 * like a UPI ID (name@bank) or a 10-digit mobile number, offers paying it
 * directly. No fake directory — only real counterparties + direct entry.
 */
export function PeopleSearch({
  people,
  onSelectPerson,
  onPayUpiId,
  className,
}: {
  people: PayeePerson[];
  onSelectPerson: (person: PayeePerson) => void;
  /** Direct pay to a typed UPI ID or mobile number. */
  onPayUpiId: (upiId: string, displayName: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const matches = useMemo(() => searchPeople(people, trimmed), [people, trimmed]);
  const upiDirect = isValidUpiId(trimmed);
  const mobileDirect = !upiDirect && isValidMobileNumber(trimmed);
  const open = focused && trimmed.length > 0;

  const payDirect = () => {
    if (upiDirect) onPayUpiId(trimmed, trimmed);
    else if (mobileDirect) onPayUpiId(trimmed.replace(/[\s-]/g, ""), trimmed);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4 shadow-card focus-within:border-primary">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (matches[0]) onSelectPerson(matches[0]);
              else payDirect();
            }
            if (e.key === "Escape") setQuery("");
          }}
          placeholder="Search people or UPI ID"
          aria-label="Search people or UPI ID"
          autoComplete="off"
          className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={cn(
              pressable,
              "grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted",
            )}
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="People results"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          {(upiDirect || mobileDirect) && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={payDirect}
              className={cn(
                pressable,
                "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60",
              )}
            >
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10"
              >
                {upiDirect ? (
                  <AtSign className="size-5 text-primary" />
                ) : (
                  <Smartphone className="size-5 text-primary" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">{trimmed}</span>
                <span className="block text-xs text-muted-foreground">
                  {upiDirect ? "Pay this UPI ID" : "Pay this mobile number"}
                </span>
              </span>
            </button>
          )}
          {matches.map((p) => (
            <button
              key={p.name.toLowerCase()}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectPerson(p)}
              className={cn(
                pressable,
                "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60",
              )}
            >
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-primary-dark"
              >
                {initialsOf(p.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">{p.name}</span>
                {p.detail && (
                  <span className="block truncate text-xs text-muted-foreground">{p.detail}</span>
                )}
              </span>
            </button>
          ))}
          {matches.length === 0 && !upiDirect && !mobileDirect && (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              No matching people. Type a full UPI ID (name@bank) or 10-digit mobile number to pay
              directly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
