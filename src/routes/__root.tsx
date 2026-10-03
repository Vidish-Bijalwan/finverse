import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  Navigate,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ChartNoAxesCombined } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth } from "../lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/shell/AppHeader";
import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { PageTransition } from "@/components/shell/PageTransition";
import { ThemeApplier } from "@/components/shell/ThemeApplier";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FinVerse AI" },
      { name: "description", content: "Clear, explainable insights for your financial life." },
      { name: "author", content: "FinVerse AI" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "FinVerse AI" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@finverse" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuardedShell />
      </AuthProvider>
    </QueryClientProvider>
  );
}

/** Paths that never require a signed-in user. */
const AUTH_OPEN_PATHS = ["/login", "/auth/callback"];
/** Focused flows that render without the app chrome (header / bottom tabs). */
const BARE_CHROME_PATHS = ["/login", "/auth/callback", "/onboarding"];

function SplashScreen() {
  return (
    <div
      className="grid min-h-screen place-items-center bg-background"
      role="status"
      aria-label="Loading FinVerse"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="grid size-14 place-items-center rounded-xl bg-primary-dark shadow-logo">
          <ChartNoAxesCombined className="size-8 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-black text-primary-dark">
          Fin<span className="text-primary">Verse</span>
        </span>
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none" />
      </div>
    </div>
  );
}

function GuardedShell() {
  const { user, profile, loading } = useAuth();
  const { pathname } = useLocation();
  const bare = BARE_CHROME_PATHS.includes(pathname);

  if (loading) return <SplashScreen />;
  if (!user && !AUTH_OPEN_PATHS.includes(pathname)) return <Navigate to="/login" />;
  if (
    user &&
    profile &&
    !profile.onboarding_completed &&
    !["/onboarding", ...AUTH_OPEN_PATHS].includes(pathname)
  ) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <>
      <ThemeApplier />
      <div className="min-h-screen bg-background text-foreground">
        {!bare && <AppHeader />}
        <main className={bare ? undefined : "pb-24 md:pb-0"}>
          <PageTransition>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </PageTransition>
        </main>
        {!bare && <BottomTabBar />}
        <Toaster richColors position="bottom-center" />
      </div>
    </>
  );
}
