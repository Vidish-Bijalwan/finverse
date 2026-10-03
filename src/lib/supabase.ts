import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

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
 * Upper bound for any single Supabase HTTP request.
 *
 * supabase-js issues fetches with no timeout, so a stalled connection (cold
 * start, flaky mobile network) hangs forever: the query promise never
 * settles, React Query stays `isPending`, and the page sits on skeletons
 * until a manual retry. Bounding each request turns a silent hang into a
 * failure that React Query's bounded retry recovers from transparently.
 *
 * 15s (not 10s): on slow mobile networks a healthy request can legitimately
 * take 10-15s (TLS + cold PostgREST). Aborting those guarantees every retry
 * fails identically — a slow network could then never load data. 15s still
 * bounds true stalls while letting slow-but-healthy requests succeed.
 */
export const SUPABASE_FETCH_TIMEOUT_MS = 15_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;
  return fetch(input, { ...init, signal });
}

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
    global: {
      // Bound every request so a stalled connection fails fast instead of
      // hanging the query (and its loading UI) forever.
      fetch: fetchWithTimeout,
    },
  });
  return client;
}

/**
 * Signed-in user id, resolved from the local session — no network round-trip.
 *
 * Data queries used to call `auth.getUser()` here, which always issues a
 * `GET /auth/v1/user` request. On dashboard mount that meant ~8 auth
 * round-trips competing with the table queries for the browser's
 * per-origin connection pool, while each request's abort timer was already
 * running — on a slow network the queued auth calls timed out, the query
 * retried, timed out again, and the page shimmered until the retries ran
 * out (or errored immediately for `retry: false` queries like the
 * watchlist). `auth.getSession()` reads the session from storage instead;
 * gotrue silently refreshes the token first when it is expired, so the id
 * is just as fresh for RLS-scoped queries.
 *
 * Throws an honest error: a network-level failure (e.g. the timeout aborted
 * a silent token refresh) reads as a connection problem, NOT as "signed
 * out" — the old code reported every transient auth blip as "Not signed
 * in", which was wrong and unactionable.
 */
export async function getSessionUserId(): Promise<string> {
  let session: Session | null;
  try {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) {
      // A failed silent refresh surfaces here (expired session). A
      // retryable fetch error means the network failed, not the session —
      // report it honestly instead of as a sign-out. Any other error means
      // the refresh token is dead and the session is genuinely gone.
      if (error.name === "AuthRetryableFetchError") throw error;
      session = null;
    } else {
      session = data.session;
    }
  } catch (e) {
    throw new Error("Couldn't reach FinVerse's servers. Check your connection and try again.", {
      cause: e,
    });
  }
  const id = session?.user?.id;
  if (!id) {
    throw new Error("Not signed in. Sign in to continue.");
  }
  return id;
}
