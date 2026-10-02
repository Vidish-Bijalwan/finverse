import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChartNoAxesCombined } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { label: "Dashboard", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Screener", to: "/screener" },
  { label: "Readiness", to: "/readiness" },
] as const;

/**
 * Shared page shell for Markets routes: brand header + module nav + content
 * container. (App-shell module may later wrap these; links all work today.)
 */
export function PageShell({
  title,
  subtitle,
  active,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  active: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-header backdrop-blur">
        <div className="mx-auto flex h-16 max-w-dashboard items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="FinVerse home">
            <span className="grid size-9 place-items-center rounded-md bg-primary-dark shadow-logo">
              <ChartNoAxesCombined className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-black text-primary-dark">
              Fin<span className="text-primary">Verse</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Markets navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  item.label === active
                    ? "text-sm font-bold text-primary"
                    : "text-sm font-medium text-foreground transition-colors hover:text-primary"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {actions}
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted md:inline-flex"
            >
              <ArrowLeft className="size-4" /> Home
            </Link>
          </div>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden"
          aria-label="Markets navigation (mobile)"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                item.label === active
                  ? "rounded-md bg-tint px-3 py-1.5 text-sm font-bold text-primary"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-dashboard px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-black tracking-tight text-primary-dark sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
