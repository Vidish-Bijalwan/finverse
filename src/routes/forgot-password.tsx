import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Reset your password — FinVerse AI" }],
  }),
  component: ForgotPasswordPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Friendly copy for the ways a reset-link request can fail, so users never
 * see a raw Supabase error.
 */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many requests — wait a little and try again.";
  }
  if (lower.includes("email") && lower.includes("not found")) {
    // Intentionally vague: don't confirm whether the account exists.
    return "Check your inbox for the reset link.";
  }
  return raw || "Could not send the reset email.";
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/auth/reset-password",
      });
      if (error) throw new Error(friendlyError(error.message));
      setSent(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center text-card-foreground shadow-card">
        {sent ? (
          <>
            <CheckCircle2 className="mx-auto size-8 text-success" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a reset link to <span className="font-medium">{email.trim()}</span>. The link
              expires after one use — if you don&apos;t see it, check spam.
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
            <KeyRound className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h1 className="mt-4 text-lg font-semibold">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "forgot-email-error" : undefined}
                />
                {emailError && (
                  <p id="forgot-email-error" role="alert" className="text-xs text-destructive">
                    {emailError}
                  </p>
                )}
              </div>
              {serverError && (
                <p
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {serverError}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                Send reset link
              </Button>
            </form>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
