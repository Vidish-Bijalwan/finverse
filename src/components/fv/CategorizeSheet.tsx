import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { allCategories, categoryById } from "@/lib/finance/categories";
import { cn } from "@/lib/utils";
import { pressable } from "./press";

/**
 * Bottom-sheet category picker for the TxnRow swipe action. Categories are
 * grouped into collapsible Expense/Income sections (long flat lists become
 * expandable rows). The picker's group containing the current category opens
 * by default.
 */
export function CategorizeSheet({
  open,
  onOpenChange,
  currentCategory,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently assigned category id — highlighted, its group open by default. */
  currentCategory?: string | undefined;
  /** Called with the picked category id; the sheet closes itself. */
  onPick: (categoryId: string) => void;
}) {
  const groups = useMemo(() => {
    const cats = allCategories();
    return [
      { id: "expense", label: "Expenses", items: cats.filter((c) => c.kind === "expense") },
      { id: "income", label: "Income", items: cats.filter((c) => c.kind === "income") },
    ];
  }, []);

  const defaultOpen = categoryById(currentCategory ?? "")?.kind === "income" ? "income" : "expense";
  const [openGroup, setOpenGroup] = useState<string>(defaultOpen);

  const close = () => onOpenChange(false);

  return (
    <BottomSheet open={open} onClose={close} title="Categorize" showCloseButton>
      <div className="flex flex-col gap-2 px-1 pb-2">
        {groups.map((g) => {
          const isOpen = openGroup === g.id;
          return (
            <section
              key={g.id}
              className="overflow-hidden rounded-[14px] border border-border bg-card"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenGroup(isOpen ? "" : g.id)}
                className={cn(
                  pressable,
                  "flex w-full items-center justify-between px-4 py-3 text-left",
                )}
              >
                <span className="text-sm font-bold text-foreground">
                  {g.label}
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">
                    {g.items.length}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {isOpen && (
                <ul className="grid grid-cols-2 gap-1.5 px-3 pb-3">
                  {g.items.map((c) => {
                    const Icon = c.icon;
                    const active = c.id === currentCategory;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            onPick(c.id);
                            close();
                          }}
                          className={cn(
                            pressable,
                            "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left",
                            active
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:bg-muted/60",
                          )}
                        >
                          <span
                            aria-hidden
                            className="grid size-8 shrink-0 place-items-center rounded-full"
                            style={{ backgroundColor: `${c.color}1f`, color: c.color }}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm font-semibold",
                              active ? "text-primary" : "text-foreground",
                            )}
                          >
                            {c.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </BottomSheet>
  );
}
