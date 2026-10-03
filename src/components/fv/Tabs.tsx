import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { roveIndex } from "./tabsNav";

export interface FvTab {
  id: string;
  label: React.ReactNode;
  /** Optional count badge shown after the label. */
  badge?: React.ReactNode;
  /** Disabled tabs are skipped by arrow-key nav. */
  disabled?: boolean;
}

export interface TabsProps {
  tabs: FvTab[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Segmented tabs with a sliding indicator (CSS transform layout animation)
 * and WAI-ARIA arrow-key navigation (Left/Right/Home/End with wrapping).
 * The indicator tracks the selected tab's measured offset/width.
 */
export function Tabs({ tabs, value, onChange, ariaLabel, className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeIndex];
      const list = listRef.current;
      if (!el || !list) return;
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, tabs]);

  const focusTab = (index: number, dir: 1 | -1 = 1) => {
    // Step past disabled tabs in the key direction, bounded by the tab count
    // so an all-disabled list can't recurse forever.
    let i = index;
    for (let step = 0; step < tabs.length; step++) {
      const tab = tabs[i];
      if (tab && !tab.disabled) {
        onChange(tab.id);
        tabRefs.current[i]?.focus();
        return;
      }
      i = roveIndex(i, tabs.length, dir);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    let dir: 1 | -1 = 1;
    if (e.key === "ArrowRight") next = roveIndex(activeIndex, tabs.length, 1);
    else if (e.key === "ArrowLeft") {
      dir = -1;
      next = roveIndex(activeIndex, tabs.length, -1);
    } else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    focusTab(next, dir);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-muted p-1 scrollbar-none",
        className,
      )}
    >
      {indicator && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 left-0 rounded-full bg-card shadow-tile transition-[transform,width] duration-200 ease-out"
          style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
        />
      )}
      {tabs.map((tab, i) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`fv-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`fv-tabpanel-${tab.id}`}
            disabled={tab.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors",
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              tab.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary tabular-nums">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
