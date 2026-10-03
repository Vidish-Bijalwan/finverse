// @vitest-environment jsdom
/**
 * Regression test for the AuthProvider loading gate.
 *
 * A TOKEN_REFRESHED event (hourly refresh, or session recovery when the tab
 * regains focus) must NOT tear down the UI: the old handler flipped the
 * full loading gate on every auth event, unmounting the app to the
 * SplashScreen and restarting every query from skeleton — which read as
 * loading that never resolved. Only a real sign-in/out may do that.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { getSupabase } from "@/lib/supabase";
import { AuthProvider } from "@/lib/auth";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

const PROFILE_ROW = {
  id: "user-123",
  email: "t@finverse.app",
  full_name: "Test User",
  avatar_url: null,
  bio: null,
  phone: null,
  onboarding_completed: true,
};

beforeAll(async () => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://testref.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

  const abortError = () => new DOMException("The operation was aborted.", "AbortError");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: unknown, init?: RequestInit): Promise<Response> => {
      const url = String(input);
      if (url.includes("/auth/v1/user")) {
        return Response.json({ id: "user-123", email: "t@finverse.app" });
      }
      if (url.includes("/rest/v1/profiles")) {
        if (init?.signal?.aborted) throw abortError();
        return Response.json(PROFILE_ROW);
      }
      throw new Error(`unexpected fetch in test: ${url}`);
    }),
  );

  // Seed a valid session before the provider mounts.
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ exp, sub: "user-123" })}.sig`;
  const { error } = await getSupabase().auth.setSession({
    access_token: jwt,
    refresh_token: "refresh-token",
  });
  expect(error).toBeNull();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("AuthProvider loading gate", () => {
  it("stays mounted across a token refresh (no splash-screen teardown)", async () => {
    const supabase = getSupabase();
    const onAuthSpy = vi.spyOn(supabase.auth, "onAuthStateChange");

    render(
      <AuthProvider>
        <div>app-ready</div>
      </AuthProvider>,
    );
    await screen.findByText("app-ready", undefined, { timeout: 10_000 });

    const handler = onAuthSpy.mock.calls[0]?.[0];
    expect(handler).toBeDefined();

    await act(async () => {
      await handler!("TOKEN_REFRESHED", { user: { id: "user-123" } } as never);
    });

    // The splash screen never appears: no setLoading(true) on refresh.
    expect(screen.queryByLabelText("Loading FinVerse")).toBeNull();
    expect(screen.getByText("app-ready")).not.toBeNull();
    onAuthSpy.mockRestore();
  });
});
