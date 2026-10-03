// @vitest-environment jsdom
/**
 * Integration-style regression tests for the FinVerse data-loading path.
 *
 * These run the REAL Supabase client (src/lib/supabase.ts), the REAL data
 * functions (src/lib/watchlist.ts) and a REAL TanStack QueryClient against a
 * mocked `fetch`, covering: stalled requests (abort), slow-but-healthy
 * responses, RLS denials, expired-session token refresh, and bounded
 * retries. The P0 they guard: skeletons that never resolve / retry-abort
 * loops on real user sessions.
 *
 * jsdom is required: @supabase/ssr's browser client persists the session in
 * document.cookie, which does not exist in the node environment.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---- helpers ----

function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

/** Unsigned JWT with a configurable expiry (seconds since epoch). */
function fakeJwt(expSeconds: number): string {
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ exp: expSeconds, sub: "user-123" })}.sig`;
}

function abortError(): DOMException {
  return new DOMException("The operation was aborted.", "AbortError");
}

/** A fetch handler that never responds — settles only when aborted. */
function hangOnAbort(init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    const signal = init?.signal;
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    signal?.addEventListener("abort", () => reject(abortError()), { once: true });
  });
}

type RouteHandler = (url: string, init?: RequestInit) => Promise<Response> | Response;

interface MockRoutes {
  user?: RouteHandler;
  token?: RouteHandler;
  rest?: RouteHandler;
}

/** Install a fetch mock routing Supabase endpoints; returns all requested URLs. */
function installFetchMock(routes: MockRoutes): { calls: string[] } {
  const calls: string[] = [];
  const mock = vi.fn(async (input: unknown, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    calls.push(url);
    if (url.includes("/auth/v1/user")) {
      return routes.user?.(url, init) ?? Response.json({ id: "user-123", email: "t@finverse.app" });
    }
    if (url.includes("/auth/v1/token")) {
      return routes.token?.(url, init) ?? hangOnAbort(init);
    }
    if (url.includes("/rest/v1/")) {
      return routes.rest?.(url, init) ?? hangOnAbort(init);
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  });
  vi.stubGlobal("fetch", mock);
  return { calls };
}

/** Fresh module registry + stubbed env, then the real supabase module. */
async function freshSupabase(): Promise<typeof import("@/lib/supabase")> {
  vi.resetModules();
  vi.stubEnv("VITE_SUPABASE_URL", "https://testref.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");
  return import("@/lib/supabase");
}

async function seedSession(supabase: SupabaseClient, expOffsetSec = 3600): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSec;
  const { error } = await supabase.auth.setSession({
    access_token: fakeJwt(exp),
    refresh_token: "refresh-token",
  });
  expect(error).toBeNull();
}

function clearCookies(): void {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

beforeEach(() => {
  clearCookies();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

// ---- tests ----

describe("supabase data-loading path", () => {
  it("aborts a stalled table query instead of hanging forever", { timeout: 40_000 }, async () => {
    installFetchMock({ rest: (_url, init) => hangOnAbort(init) });
    const { getSupabase, SUPABASE_FETCH_TIMEOUT_MS } = await freshSupabase();
    const supabase = getSupabase();
    await seedSession(supabase);

    const start = Date.now();
    // Note: postgrest-js resolves (not rejects) on abort, carrying the
    // failure in `error` — the data layer turns that into a thrown error,
    // which is what React Query retries on.
    const { error } = await supabase.from("watchlist_items").select("*");
    const elapsed = Date.now() - start;

    expect(error).not.toBeNull();
    // Settles at ~the request timeout: bounded, never infinite.
    expect(elapsed).toBeGreaterThanOrEqual(SUPABASE_FETCH_TIMEOUT_MS - 2_000);
    expect(elapsed).toBeLessThan(SUPABASE_FETCH_TIMEOUT_MS + 10_000);
  });

  it("resolves the user id without an /auth/v1/user network call", async () => {
    const { calls } = installFetchMock({});
    const { getSupabase, getSessionUserId } = await freshSupabase();
    const supabase = getSupabase();
    await seedSession(supabase);
    calls.length = 0;

    const id = await getSessionUserId();

    expect(id).toBe("user-123");
    // The old auth.getUser() path issued one of these per data call; the
    // session-storage read issues none — this is what keeps slow networks
    // from tripping the request timeout on every dashboard load.
    expect(calls.filter((u) => u.includes("/auth/v1/user"))).toHaveLength(0);
  });

  it(
    "lets a slow-but-healthy query succeed instead of aborting it",
    { timeout: 40_000 },
    async () => {
      installFetchMock({
        rest: async (_url, init) => {
          // 6s per table request — over the old 10s budget when queued, but
          // comfortably inside the 15s per-request timeout.
          await new Promise((r) => setTimeout(r, 6_000));
          if (init?.signal?.aborted) throw abortError();
          return Response.json([]);
        },
      });
      const { getSupabase } = await freshSupabase();
      const supabase = getSupabase();
      await seedSession(supabase);
      const { fetchWatchlist } = await import("@/lib/watchlist");

      const entries = await fetchWatchlist();

      expect(entries).toEqual([]);
    },
  );

  it("surfaces an RLS denial as a fast, actionable error", async () => {
    installFetchMock({
      rest: () =>
        Response.json(
          {
            code: "42501",
            message: 'permission denied for table "watchlist_items"',
            details: null,
            hint: null,
          },
          { status: 403 },
        ),
    });
    const { getSupabase } = await freshSupabase();
    const supabase = getSupabase();
    await seedSession(supabase);
    const { fetchWatchlist } = await import("@/lib/watchlist");

    const start = Date.now();
    await expect(fetchWatchlist()).rejects.toThrow(/Couldn't load your watchlist/);
    // No retry storm, no waiting on the timeout: denied is denied.
    expect(Date.now() - start).toBeLessThan(5_000);
  });

  it(
    "an aborted token refresh settles and does not wedge later auth calls",
    { timeout: 60_000 },
    async () => {
      installFetchMock({ token: (_url, init) => hangOnAbort(init) });
      const { getSupabase, SUPABASE_FETCH_TIMEOUT_MS } = await freshSupabase();
      const supabase = getSupabase();

      // Drive the refresh path directly with an explicit token (no session).
      const t1 = Date.now();
      const first = await supabase.auth.refreshSession({ refresh_token: "test-refresh" });
      const firstElapsed = Date.now() - t1;
      expect(first.error).not.toBeNull();
      // Settles instead of hanging: gotrue retries the aborted refresh once
      // internally (bounded backoff), then gives up with an error. Either
      // way the deferred is settled, never stuck.
      expect(firstElapsed).toBeGreaterThanOrEqual(SUPABASE_FETCH_TIMEOUT_MS - 2_000);
      expect(firstElapsed).toBeLessThan(60_000);

      // The refresh deferred is settled (not stuck): the serial retry hits
      // gotrue's failure cache and returns fast instead of hanging again.
      const t2 = Date.now();
      const second = await supabase.auth.refreshSession({ refresh_token: "test-refresh" });
      expect(second.error).not.toBeNull();
      expect(Date.now() - t2).toBeLessThan(5_000);
    },
  );

  it("reports a missing session as signed-out, not as a connection error", async () => {
    installFetchMock({});
    const { getSessionUserId } = await freshSupabase();

    await expect(getSessionUserId()).rejects.toThrow(/not signed in/i);
  });

  it("React Query settles after bounded retries instead of looping forever", async () => {
    const { FINVERSE_QUERY_DEFAULTS } = await import("@/lib/query");
    let attempts = 0;
    // Same construction as src/router.tsx: no default options.
    const qc = new QueryClient();

    const result = qc.fetchQuery({
      ...FINVERSE_QUERY_DEFAULTS,
      queryKey: ["test", "bounded-retries"],
      queryFn: async () => {
        attempts += 1;
        throw new Error("boom");
      },
    });

    await expect(result).rejects.toThrow("boom");
    // 1 initial attempt + 2 retries, then a definitive error — never infinite.
    expect(attempts).toBe(3);
  });
});
