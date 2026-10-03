import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Public `profiles` row shape (Supabase `profiles` table).
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  onboarding_completed: boolean;
}

let client: SupabaseClient | null = null;

/**
 * Lazy singleton browser Supabase client.
 *
 * Throws a clear Error when the required env vars are missing so misconfig is
 * loud instead of silently failing later.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
        "in your .env file (see .env.example).",
    );
  }

  // PKCE note: this version of auth-js stores the OAuth code verifier in a
  // per-flow slot and exchangeCodeForSession() can only find it via the
  // sb_flow_id query param. Without appendPkceFlowIdToRedirects the param
  // never travels through the redirect and Google sign-in always fails with
  // "PKCE code verifier not found in storage". The wildcard redirect URL
  // (https://<site>/**) in the Supabase dashboard allows the extra param.
  client = createBrowserClient(url, anonKey, {
    auth: {
      experimental: { appendPkceFlowIdToRedirects: true },
    },
  });
  return client;
}
