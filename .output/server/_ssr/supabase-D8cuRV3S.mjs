import { t as createBrowserClient } from "../_libs/@supabase/ssr+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-D8cuRV3S.js
var client = null;
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
var SUPABASE_FETCH_TIMEOUT_MS = 15e3;
function fetchWithTimeout(input, init) {
	const timeoutSignal = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
	const signal = init?.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;
	return fetch(input, {
		...init,
		signal
	});
}
/**
* Lazy singleton browser Supabase client.
*
* Throws a clear Error when the required env vars are missing so misconfig is
* loud instead of silently failing later.
*/
function getSupabase() {
	if (client) return client;
	const url = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_SUPABASE_URL"];
	const anonKey = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_SUPABASE_ANON_KEY"];
	if (!url || !anonKey) throw new Error("Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (see .env.example).");
	client = createBrowserClient(url, anonKey, {
		auth: { experimental: { appendPkceFlowIdToRedirects: true } },
		global: { fetch: fetchWithTimeout }
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
async function getSessionUserId() {
	let session;
	try {
		const { data, error } = await getSupabase().auth.getSession();
		if (error) {
			if (error.name === "AuthRetryableFetchError") throw error;
			session = null;
		} else session = data.session;
	} catch (e) {
		throw new Error("Couldn't reach FinVerse's servers. Check your connection and try again.", { cause: e });
	}
	const id = session?.user?.id;
	if (!id) throw new Error("Not signed in. Sign in to continue.");
	return id;
}
//#endregion
export { getSupabase as n, getSessionUserId as t };
