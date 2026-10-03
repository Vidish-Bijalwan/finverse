import { Link, useNavigate } from "@tanstack/react-router";
import { ChartNoAxesCombined, LogOut, Search, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/components/shell/GlobalSearch";
import { NotificationBell } from "@/components/shell/NotificationBell";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

/** App version, shown on the More and Settings pages. */
export const APP_VERSION = "v1.0.0";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Payments", to: "/payments" },
  { label: "Invest", to: "/portfolio" },
  { label: "Markets", to: "/watchlist" },
  { label: "Activity", to: "/expenses" },
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

function initialsOf(name: string | null, email: string | undefined): string {
  const src = (name ?? "").trim() || (email ?? "").trim();
  if (!src) return "FV";
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "F";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

/** Avatar button that opens the account menu (profile + sign out). */
function ProfileMenu() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const name = profile?.full_name?.trim() || user?.email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-muted"
        >
          <Avatar className="size-8">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initialsOf(profile?.full_name ?? null, user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? "FinVerse AI"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            try {
              await signOut();
            } finally {
              navigate({ to: "/login" });
            }
          }}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Sticky top header: brand, the five product sections, global search,
 * notifications, theme toggle, and the account menu.
 *
 * The active section gets a pill + aria-current="page". No SaaS-admin
 * decoration — every control is product-level.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-header backdrop-blur">
      <div className="mx-auto flex h-16 max-w-dashboard items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...(item.to === "/" ? { activeOptions: { exact: true } } : {})}
              activeProps={{
                className: "bg-primary/10 text-primary",
                "aria-current": "page",
              }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                "hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <Link
            to="/expenses"
            search={{}}
            aria-label="Search transactions"
            className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted sm:hidden"
          >
            <Search className="size-5" />
          </Link>

          <NotificationBell />

          <ThemeToggle />

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
