import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { validatePassword } from "@/lib/auth/password-policy";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [{ title: "Choose a new password — FinVerse AI" }],
  }),
  component: ResetPasswordPage,
});

/**
 * Friendly copy for the ways a password update can fail (same mapper family
 * as `friendlyError` in auth.callback.tsx).
 */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("expired") ||
    lower.includes("already been used") ||
    lower.includes("invalid") ||
    lower.includes("token")
  ) {
    return "This reset link expired or was already used. Request a new one.";
  }
  if (lower.includes("weak") || lower.includes("password")) {
    return "That password doesn't meet the requirements. Choose a stronger one.";
  }
  return raw || "Could not update your password.";
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState<"checking" | "ready" | "expired">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // The Supabase recovery link sets a recovery session before this route
      // renders. If no session exists, the link is spent, expired, or this
      // page was opened directly.
      const { data } = await getSupabase().auth.getSession();
      if (!cancelled) setSessionState(data.session ? "ready" : "expired");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setServerError(null);

    const policyError = validatePassword(password);
    if (policyError) {
      setFieldError(policyError);
      return;
    }
    if (password !== confirm) {
      setFieldError("The two passwords don't match.");
      return;
    }

    setUpdating(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(friendlyError(error.message));
      // Sign out the recovery session so a fresh login starts clean, then
      // hand off to the login page with a success notice.
      await supabase.auth.signOut();
      await navigate({ to: "/login", search: { reset: "1" }, replace: true });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center text-card-foreground shadow-card">
        {sessionState === "checking" && (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-primary" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">Verifying your link…</h1>
          </>
        )}

        {sessionState === "expired" && (
          <>
            <AlertTriangle className="mx-auto size-8 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">This reset link isn&apos;t valid</h1>
            <p role="alert" className="mt-2 text-sm text-muted-foreground">
              This reset link expired or was already used. Request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Request a new link
            </Link>
          </>
        )}

        {sessionState === "ready" && (
          <>
            <LockKeyhole className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">Choose a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              At least 8 characters — avoid common passwords.
            </p>
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="reset-password">New password</Label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldError(null);
                    }}
                    className="pr-10"
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? "reset-password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-password-confirm">Confirm new password</Label>
                <Input
                  id="reset-password-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setFieldError(null);
                  }}
                  aria-invalid={!!fieldError}
                />
              </div>
              {fieldError && (
                <p
                  id="reset-password-error"
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {fieldError}
                </p>
              )}
              {serverError && (
                <p
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {serverError}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={updating}>
                {updating && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                Update password
              </Button>
            </form>
            <p className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
              You&apos;ll be asked to sign in again with the new password.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
