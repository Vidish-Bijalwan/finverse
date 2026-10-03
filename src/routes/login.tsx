import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BadgeCheck, ChartNoAxesCombined, Eye, EyeOff, Loader2, PiggyBank } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { pressable, Sparkline } from "@/components/fv";
import { AmbientOrbs } from "@/components/auth/AmbientOrbs";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — FinVerse AI" }],
  }),
  component: LoginPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const clearFieldError = (field: "email" | "password") =>
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSignedUp(false);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setSignedUp(true);
        setPassword("");
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input
          id={`${mode}-email`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? `${mode}-email-error` : undefined}
        />
        {fieldErrors.email && (
          <p id={`${mode}-email-error`} role="alert" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <div className="relative">
          <Input
            id={`${mode}-password`}
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            className="pr-10"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? `${mode}-password-error` : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground ${pressable}`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id={`${mode}-password-error`} role="alert" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {serverError}
        </p>
      )}
      {signedUp && !serverError && (
        <p role="status" className="rounded-md bg-success-soft px-3 py-2 text-xs text-success">
          Account created! Check your email to confirm, then sign in.
        </p>
      )}

      <Button type="submit" className={`w-full ${pressable}`} disabled={submitting}>
        {submitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}

function LoginPage() {
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!loading && user) {
    return <Navigate to={profile?.onboarding_completed ? "/" : "/onboarding"} />;
  }

  const handleGoogle = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setGoogleError(
        err instanceof Error ? err.message : "Google sign in failed. Please try again.",
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[oklch(0.15_0.025_270)] px-4 py-10">
      {/* Animated colored light orbs. Static when reduced motion is preferred. */}
      <AmbientOrbs />

      <div className="relative w-full max-w-md lg:max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl lg:grid lg:grid-cols-[400px_1fr]">
          {/* Form panel */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="grid size-12 place-items-center rounded-xl bg-primary-dark shadow-logo">
                <ChartNoAxesCombined className="size-6 text-logo-mark-fg" strokeWidth={2.5} />
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground">
                Fin<span className="text-primary">Verse</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Clear, explainable insights for your financial life.
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="pt-4">
                <AuthForm mode="login" />
              </TabsContent>
              <TabsContent value="signup" className="pt-4">
                <AuthForm mode="signup" />
              </TabsContent>
            </Tabs>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {googleError && (
              <p
                role="alert"
                className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {googleError}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className={`w-full ${pressable}`}
              onClick={handleGoogle}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>
          </div>

          {/* Immersive visual panel — decorative illustration of the product. */}
          <div
            className="relative hidden min-h-[560px] overflow-hidden lg:block"
            aria-hidden="true"
          >
            <AmbientOrbs />
            <div className="absolute inset-0 bg-[oklch(0.13_0.02_270/0.45)]" />

            <div className="relative z-10 h-full">
              {/* Net worth card */}
              <div className="fv-float-soft absolute left-10 top-12 w-64 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Net worth
                </p>
                <p className="mt-1 text-[26px] font-black tabular-nums text-white">₹4,82,300</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <Sparkline
                    values={[410000, 425000, 418000, 438000, 452000, 446000, 468000, 482300]}
                    width={110}
                    height={34}
                    direction="up"
                    ariaLabel="Sample net worth trend"
                  />
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-bold tabular-nums text-emerald-300">
                    +12.4%
                  </span>
                </div>
              </div>

              {/* UPI payment card */}
              <div
                className="fv-float-soft absolute right-10 top-[40%] w-60 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md"
                style={{ animationDelay: "1.6s" }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-400/20">
                    <BadgeCheck className="size-5 text-emerald-300" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold tabular-nums text-white">₹1,200 sent</p>
                    <p className="truncate text-xs text-white/55">Aditi Sharma • UPI • Just now</p>
                  </div>
                </div>
              </div>

              {/* SIP card */}
              <div
                className="fv-float-soft absolute bottom-16 left-14 w-64 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md"
                style={{ animationDelay: "2.8s" }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-400/20">
                    <PiggyBank className="size-5 text-sky-300" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                      Monthly SIP
                    </p>
                    <p className="truncate text-sm font-bold tabular-nums text-white">
                      ₹10,000 <span className="font-medium text-white/50">• 12.1% XIRR</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
                </div>
              </div>

              <p className="absolute inset-x-0 bottom-5 px-10 text-center text-xs leading-5 text-white/45">
                Spending, investing and everything between — one calm home for your money.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/60">
          Your data is stored securely and never shared.
        </p>
      </div>
    </div>
  );
}
