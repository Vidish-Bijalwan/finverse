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

/**
 * Friendly copy for the ways an OAuth code exchange can fail, so users never
 * see a raw "PKCE code verifier not found in storage" message.
 */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("pkce") ||
    lower.includes("code verifier") ||
    lower.includes("authorization code") ||
    lower.includes("invalid_grant") ||
    lower.includes("code has expired") ||
    lower.includes("already been used")
  ) {
    return "This sign-in link already expired or was used. Please try signing in again.";
  }
  return raw || "Could not complete sign in.";
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabase();
        // If a session already exists (the code was already exchanged in
        // another tab, or this page was refreshed after a successful
        // exchange), there is nothing to exchange — proceed instead of
        // failing on the spent code.
        const { data: pre } = await supabase.auth.getSession();
        if (!pre.session) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            window.location.href,
          );
          if (exchangeError) {
            // The code may have been consumed by a concurrent exchange
            // (refresh / double tab) while the session landed anyway.
            // If a session exists now, treat it as success.
            const { data: post } = await supabase.auth.getSession();
            if (!post.session) {
              throw new Error(friendlyError(exchangeError.message));
            }
          }
        }
        if (!cancelled) {
          // AuthProvider's onAuthStateChange will resolve the profile; the
          // route guard sorts out whether / or /onboarding is correct.
          // `replace` drops the one-time ?code= URL from history so Back /
          // refresh can't replay the spent code.
          await navigate({ to: "/onboarding", replace: true });
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
