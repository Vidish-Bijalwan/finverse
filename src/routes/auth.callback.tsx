import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing you in — FinVerse AI" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabase();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );
        if (exchangeError) {
          throw new Error(exchangeError.message || "Could not complete sign in.");
        }
        if (!cancelled) {
          // AuthProvider's onAuthStateChange will resolve the profile; the
          // route guard sorts out whether / or /onboarding is correct.
          await navigate({ to: "/onboarding" });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not complete sign in.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center text-card-foreground shadow-card">
        {error ? (
          <>
            <AlertTriangle className="mx-auto size-8 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">Sign in didn't work</h1>
            <p role="alert" className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-primary" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">Signing you in…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Finishing up with Google — you'll be redirected shortly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
