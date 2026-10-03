import { Users } from "lucide-react";
import { initialsOf, pressable } from "@/components/fv";
import { cn } from "@/lib/utils";
import type { PayeePerson } from "@/lib/payment-contacts";

/**
 * Recent people: avatar + name, horizontal scroll on mobile (GPay pattern),
 * wrapping grid on desktop. People come only from real activity — paid,
 * requested, or recharged — never seed data.
 */
export function PeopleStrip({
  people,
  onSelect,
  onSeeAll,
}: {
  people: PayeePerson[];
  onSelect: (person: PayeePerson) => void;
  /** Optional "view all" action shown when the strip is truncated. */
  onSeeAll?: () => void;
}) {
  if (people.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-5">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-tint">
          <Users className="size-5 text-primary" />
        </span>
        <p className="text-sm text-muted-foreground">
          People you pay will appear here. Start with{" "}
          <span className="font-semibold text-foreground">Pay anyone</span> above.
        </p>
      </div>
    );
  }

  const visible = people.slice(0, 12);
  return (
    <div
      role="list"
      aria-label="Recent people"
      className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-6 sm:overflow-visible lg:grid-cols-8"
    >
      {visible.map((p) => (
        <button
          key={p.name.toLowerCase()}
          type="button"
          onClick={() => onSelect(p)}
          aria-label={`Pay ${p.name}`}
          className={cn(
            pressable,
            "flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors hover:bg-muted/60 sm:w-auto",
          )}
        >
          <span
            aria-hidden
            className="grid size-14 place-items-center rounded-full bg-tint text-base font-bold text-primary-dark"
          >
            {initialsOf(p.name)}
          </span>
          <span className="w-full truncate text-center text-xs font-semibold text-foreground">
            {p.name}
          </span>
          {p.detail && (
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {p.detail}
            </span>
          )}
        </button>
      ))}
      {onSeeAll && people.length > visible.length && (
        <button
          type="button"
          onClick={onSeeAll}
          className={cn(
            pressable,
            "flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2 text-primary hover:bg-muted/60 sm:w-auto",
          )}
        >
          <span
            aria-hidden
            className="grid size-14 place-items-center rounded-full bg-primary/10 text-sm font-bold"
          >
            +{people.length - visible.length}
          </span>
          <span className="text-xs font-semibold">All</span>
        </button>
      )}
    </div>
  );
}
