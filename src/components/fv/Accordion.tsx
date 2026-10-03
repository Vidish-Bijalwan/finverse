import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** "single" closes the open item when another opens; "multiple" toggles. */
  type?: "single" | "multiple";
  /** Uncontrolled initial open ids. */
  defaultOpen?: string[];
  /** Controlled open ids. */
  open?: string[];
  onOpenChange?: (open: string[]) => void;
  className?: string;
}

/**
 * Accessible accordion. Height animation uses the grid-template-rows trick
 * (0fr → 1fr on an overflow-hidden child) — no JS measuring, no max-height
 * hacks. Buttons are native <button>s with aria-expanded + aria-controls;
 * panels are role="region" labelled by their button.
 */
export function Accordion({
  items,
  type = "single",
  defaultOpen,
  open: openProp,
  onOpenChange,
  className,
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen ?? []);
  const open = openProp ?? uncontrolled;
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const setOpen = (next: string[]) => {
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    if (type === "single") {
      setOpen(isOpen ? [] : [id]);
    } else {
      setOpen(isOpen ? open.filter((o) => o !== id) : [...open, id]);
    }
  };

  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left text-sm font-bold text-foreground transition-colors hover:text-primary sm:py-3.5"
              >
                <span className="min-w-0">{item.title}</span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] [&>*]:invisible",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pb-4 text-sm leading-6 text-muted-foreground">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
