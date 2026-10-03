import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabase, type Profile } from "./supabase";
import { validatePassword } from "./auth/password-policy";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Client-side signup throttle: max 3 attempts per rolling 10-minute window per
 * browser, tracked in localStorage (`fv_signup_attempts`, an array of epoch-ms
 * timestamps). DEFENSE-IN-DEPTH ONLY — localStorage is trivially cleared by
 * the attacker, so the real rate limit must be enforced Supabase dashboard-side
 * (Auth → Rate limits). This layer just stops casual abuse from this browser.
 */
const SIGNUP_ATTEMPT_KEY = "fv_signup_attempts";
const SIGNUP_ATTEMPT_LIMIT = 3;
const SIGNUP_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

function readSignupAttempts(): number[] {
  try {
    const raw = localStorage.getItem(SIGNUP_ATTEMPT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (t): t is number => typeof t === "number" && now - t < SIGNUP_ATTEMPT_WINDOW_MS,
    );
  } catch {
    return [];
  }
}

function recordSignupAttempt(): void {
  try {
    localStorage.setItem(SIGNUP_ATTEMPT_KEY, JSON.stringify([...readSignupAttempts(), Date.now()]));
  } catch {
    // Storage unavailable (private mode etc.) — fail open on the throttle;
    // the server-side Supabase rate limit still applies.
  }
}

/** Fetch the profiles row for `userId`, creating one if it doesn't exist. */
async function ensureProfile(
  userId: string,
  email: string | undefined | null,
): Promise<Profile | null> {
  const supabase = getSupabase();

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (readError) throw new Error(readError.message || "Failed to load your profile.");

  if (existing) return existing as Profile;

  const { error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId, email: email ?? null });

  if (insertError) throw new Error(insertError.message || "Failed to create your profile.");

  const { data: created, error: rereadError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (rereadError) throw new Error(rereadError.message || "Failed to load your profile.");

  return (created as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const resolveSession = async (currentUser: User | null) => {
      if (!mountedRef.current) return;
      if (currentUser) {
        try {
          const p = await ensureProfile(currentUser.id, currentUser.email);
          if (!mountedRef.current) return;
          setUser(currentUser);
          setProfile(p);
        } catch (err) {
          console.error("Failed to resolve profile:", err);
          if (!mountedRef.current) return;
          setUser(currentUser);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mountedRef.current) setLoading(false);
    };

    (async () => {
      try {
        const supabase = getSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await resolveSession(session?.user ?? null);

        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((event, session) => {
          // Token refreshes (hourly + on tab refocus) must NOT tear down the
          // UI: the signed-in user hasn't changed, so resolve silently and
          // keep the current screen and its queries. The old code flipped the
          // full loading gate (SplashScreen → every query restarting from
          // skeleton) on every TOKEN_REFRESHED, which read as loading that
          // never resolved. Only a real sign-in/out re-runs the gate.
          if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
            setLoading(true);
          }
          void resolveSession(session?.user ?? null);
        });
        subscription = sub;
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        if (mountedRef.current) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    // Policy first — never burn a Supabase signup on a weak password.
    const policyError = validatePassword(password);
    if (policyError) throw new Error(policyError);
    // Throttle second — never hit Supabase when the window is exhausted.
    if (readSignupAttempts().length >= SIGNUP_ATTEMPT_LIMIT) {
      throw new Error("Too many signup attempts — try again in a few minutes.");
    }
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message || "Sign up failed. Please try again.");
    // Record failed-attempts too: every submit burns one slot in the window.
    recordSignupAttempt();
    // The profile row is created by the ensure-profile logic above on first session.
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message || "Sign in failed. Please try again.");
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
    if (error) throw new Error(error.message || "Google sign in failed. Please try again.");
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message || "Sign out failed. Please try again.");
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, signUp, signIn, signInWithGoogle, signOut }),
    [user, profile, loading, signUp, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
  return ctx;
}
