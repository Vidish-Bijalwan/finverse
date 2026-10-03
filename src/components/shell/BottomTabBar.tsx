import { Link } from "@tanstack/react-router";
import { Home, LineChart, ReceiptText, Send, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { pressable } from "@/components/fv";

const TABS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Pay", to: "/payments", icon: Send },
  { label: "Invest", to: "/portfolio", icon: TrendingUp },
  { label: "Markets", to: "/watchlist", icon: LineChart },
  { label: "Activity", to: "/expenses", icon: ReceiptText },
] as const;

/**
 * Mobile-only fixed bottom tab bar: Home / Pay / Invest / Markets / Activity.
 * Active tab gets an animated indicator pill + aria-current.
 */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Bottom tabs"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            to={tab.to}
            {...(tab.to === "/" ? { activeOptions: { exact: true } } : {})}
            activeProps={{ "data-active": "true", "aria-current": "page" }}
            className={cn(
              pressable,
              "group relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium",
              "text-muted-foreground transition-colors hover:text-foreground",
              "data-[active=true]:text-primary",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-0 h-1 w-10 rounded-b-full bg-primary",
                "scale-x-0 transition-transform duration-200 ease-out",
                "group-data-[active=true]:scale-x-100",
              )}
            />
            <tab.icon className="size-5" strokeWidth={2.2} />
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
