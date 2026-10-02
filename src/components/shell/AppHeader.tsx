import { Link } from "@tanstack/react-router";
import { ChartNoAxesCombined, RotateCcw, Search } from "lucide-react";

import { STORE_KEY } from "@/lib/finance/store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const APP_VERSION = "v1.0.0";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Expenses", to: "/expenses" },
  { label: "Insights", to: "/insights" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Screener", to: "/screener" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="FinVerse home">
      <div className="grid size-9 place-items-center rounded-md bg-primary-dark shadow-logo">
        <ChartNoAxesCombined className="size-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-black text-primary-dark">
        Fin<span className="text-primary">Verse</span>
      </span>
    </Link>
  );
}

function resetDemoData() {
  try {
    window.localStorage.removeItem(STORE_KEY);
  } catch {
    // Storage may be unavailable; reload anyway so seeded defaults return.
  }
  window.location.reload();
}

/**
 * Sticky top header: logo, desktop nav, search (navigates to /expenses),
 * and a profile avatar with a small menu.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-header backdrop-blur">
      <div className="mx-auto flex h-16 max-w-dashboard items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={item.to === "/" ? { exact: true } : undefined}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground" }}
              className={cn("text-sm font-medium transition-colors hover:text-primary")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/expenses"
            aria-label="Search transactions"
            className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Search className="size-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open profile menu"
                className="grid size-10 place-items-center rounded-full transition-colors hover:bg-muted"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    FV
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block text-sm font-semibold">FinVerse AI</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {APP_VERSION} · Demo build
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={resetDemoData}>
                <RotateCcw className="size-4" />
                Reset demo data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
