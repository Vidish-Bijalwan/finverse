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
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setLoading(true);
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
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message || "Sign up failed. Please try again.");
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
