import type { ReactNode } from "react";

/**
 * Shared page shell for Markets routes: title + subtitle + content container.
 * The global AppHeader / BottomTabBar come from the app shell (__root.tsx),
 * so this wrapper deliberately renders no nav header of its own.
 */
export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Accepted for API compatibility; the app shell owns navigation. */
  active?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-dashboard px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-primary-dark sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
