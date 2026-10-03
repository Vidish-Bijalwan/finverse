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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChartNoAxesCombined } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth } from "../lib/auth";
import { AppLockScreen } from "@/components/fv";
import { isLockEnabled, LOCKOUT_SECONDS, MAX_FAILED_ATTEMPTS, verifyPin } from "../lib/applock";
import { useAppLock, useRecordFailedAttempt, useResetAttempts } from "../lib/applock-hooks";
import { assertBiometric, platformBiometricAvailable } from "../lib/applock-webauthn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
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
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Space+Grotesk:wght@400;500;600;700&display=swap",
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
          <ChartNoAxesCombined className="size-8 text-background" strokeWidth={2.5} />
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
  // Signed-out users land on /login. The Toaster stays mounted so the
  // "signed out to reset passcode" notice (see AppLockGate) is visible there.
  if (!user && !AUTH_OPEN_PATHS.includes(pathname)) {
    return (
      <>
        <Toaster richColors position="bottom-center" />
        <Navigate to="/login" />
      </>
    );
  }
  if (
    user &&
    profile &&
    !profile.onboarding_completed &&
    !["/onboarding", ...AUTH_OPEN_PATHS].includes(pathname)
  ) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <AppLockGate>
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
    </AppLockGate>
  );
}

/**
 * App-lock gate. Renders after the existing auth/onboarding guards.
 *
 * Lock conditions: app lock enabled (pin_hash set) AND (the tab was
 * backgrounded longer than timeout_secs, or an explicit "lock now" request
 * arrived via the "finverse:lock-now" window event, e.g. from Settings).
 *
 * Last-active time lives only in memory (never localStorage) — closing the
 * tab forgets it. Unlock verifies the PIN against the stored PBKDF2 digest;
 * 5 consecutive wrong entries impose a 30s cooldown recorded in the DB.
 *
 * "Forgot passcode?" is a recovery path, not a backdoor: it signs the user
 * OUT and routes to /login so they must re-authenticate with Supabase before
 * they can set a new passcode. The sessionStorage key
 * "finverse:applock-reset-notice" carries the notice for /login to display.
 */
function AppLockGate({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const lock = useAppLock();
  const recordFailed = useRecordFailedAttempt();
  const resetAttempts = useResetAttempts();

  const row = lock.data?.row ?? null;
  const enabled = isLockEnabled(row);
  const timeoutSecs = row?.timeout_secs ?? 120;

  const [locked, setLocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const backgroundedAtRef = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const timeoutRef = useRef(timeoutSecs);
  timeoutRef.current = timeoutSecs;

  // If the lock gets disabled while the overlay is up, drop the overlay.
  useEffect(() => {
    if (!enabled) setLocked(false);
  }, [enabled]);

  // Background tracking: lock when the tab was away longer than timeout.
  useEffect(() => {
    const onHidden = () => {
      backgroundedAtRef.current = Date.now();
    };
    const onVisible = () => {
      const started = backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      if (started == null) return;
      const awaySecs = (Date.now() - started) / 1000;
      if (enabledRef.current && awaySecs >= timeoutRef.current) {
        setError(null);
        setLocked(true);
      }
    };
    const onLockNow = () => {
      if (enabledRef.current) {
        setError(null);
        setLocked(true);
      }
    };
    const onVisibility = () => {
      if (document.hidden) onHidden();
      else onVisible();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHidden);
    window.addEventListener("finverse:lock-now", onLockNow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHidden);
      window.removeEventListener("finverse:lock-now", onLockNow);
    };
  }, []);

  // Biometric unlock is offered only when: user enabled it AND the platform
  // actually has a user-verifying authenticator. Otherwise no button appears.
  useEffect(() => {
    let cancelled = false;
    if (enabled && row?.biometric_enabled) {
      void platformBiometricAvailable().then((ok) => {
        if (!cancelled) setBioAvailable(ok);
      });
    } else {
      setBioAvailable(false);
    }
    return () => {
      cancelled = true;
    };
  }, [enabled, row?.biometric_enabled]);

  const cooldownRemainingSecs = (() => {
    if (!row?.locked_until) return 0;
    return Math.max(0, Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 1000));
  })();

  async function handleComplete(pin: string) {
    if (!row || cooldownRemainingSecs > 0) return;
    setVerifying(true);
    setError(null);
    try {
      const ok = await verifyPin(pin, row.pin_salt, row.pin_hash);
      if (ok) {
        await resetAttempts.mutateAsync();
        setLocked(false);
        backgroundedAtRef.current = null;
      } else {
        const r = await recordFailed.mutateAsync();
        if (r.lockedOut) {
          setError(`Too many wrong attempts — locked for ${LOCKOUT_SECONDS} seconds.`);
        } else {
          const left = MAX_FAILED_ATTEMPTS - r.failed_attempts;
          setError(
            `Wrong passcode — ${left} attempt${left === 1 ? "" : "s"} left before a ${LOCKOUT_SECONDS}-second lockout.`,
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't verify the passcode. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleBiometric() {
    if (!user || cooldownRemainingSecs > 0) return;
    setVerifying(true);
    setError(null);
    try {
      await assertBiometric(user.id);
      await resetAttempts.mutateAsync();
      setLocked(false);
      backgroundedAtRef.current = null;
    } catch (e) {
      // Honest fallback: any authenticator failure returns to PIN.
      setError(
        e instanceof Error
          ? `${e.message} Use your passcode instead.`
          : "Biometric unlock failed — use your passcode instead.",
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleResetConfirm() {
    setShowResetConfirm(false);
    try {
      window.sessionStorage.setItem("finverse:applock-reset-notice", "1");
    } catch {
      // Private mode — the toast below still carries the notice.
    }
    toast.info("Signed out. Sign back in, then set a new passcode in Settings → App lock.");
    await signOut();
    // The guard above routes to /login automatically.
  }

  return (
    <>
      {children}
      {locked && enabled && (
        <AppLockScreen
          onComplete={(pin) => void handleComplete(pin)}
          error={error}
          disabled={verifying || cooldownRemainingSecs > 0}
          cooldownSeconds={cooldownRemainingSecs}
          biometricAvailable={bioAvailable}
          onBiometric={() => void handleBiometric()}
          onReset={() => setShowResetConfirm(true)}
        />
      )}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your passcode?</AlertDialogTitle>
            <AlertDialogDescription>
              For your security, this signs you out of FinVerse completely. Sign back in with your
              account credentials, then set a new passcode in Settings → App lock. There is no
              master code and support cannot recover a forgotten passcode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleResetConfirm()}>
              Sign me out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
