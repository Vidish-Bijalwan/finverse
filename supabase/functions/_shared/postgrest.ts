/**
 * A minimal PostgREST client for the Edge Functions — plain `fetch`,
 * zero dependencies (the M2 `market-data` pattern: no supabase-js in
 * the function, so the bundle stays small and `esbuild` can verify it
 * without resolving remote imports).
 *
 * Every request carries the user's JWT (`Authorization: Bearer <jwt>`)
 * plus the anon key (`apikey`), so PostgREST enforces RLS exactly as
 * the browser client does. The caller always scopes queries to its own
 * user id — RLS is the backstop, not the filter.
 *
 * Error policy is split by use:
 * - `select` throws on failure (the tools need their data to answer).
 * - `count` / `insert` / `deleteWhere` return a soft result instead of
 *   throwing — they serve the rate limiter and the guardrail log, both
 *   of which are fail-open by design (a metrics outage must never fail
 *   an answer the guardrail already verified).
 */

export class PostgrestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PostgrestError";
    this.status = status;
  }
}

/** One PostgREST filter: `column=operator.value` (value is URL-encoded). */
export type PostgrestFilter = [column: string, operator: string, value: string];

export interface PostgrestClient {
  select<T>(
    table: string,
    columns: string,
    filters: PostgrestFilter[],
    opts?: { order?: string; limit?: number },
  ): Promise<T[]>;
  /**
   * Exact row count for the filters, or null when the count could not
   * be read (fail-open: the caller treats null as "unknown").
   */
  count(table: string, filters: PostgrestFilter[]): Promise<number | null>;
  /** Insert rows. Returns false (never throws) when the insert failed. */
  insert(table: string, rows: Array<Record<string, unknown>>): Promise<boolean>;
  /** Best-effort delete of rows matching the filters. Never throws. */
  deleteWhere(table: string, filters: PostgrestFilter[]): Promise<void>;
}

const POSTGREST_TIMEOUT_MS = 10_000;

type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export function createPostgrestClient(
  supabaseUrl: string,
  anonKey: string,
  userJwt: string,
  fetchFn: FetchFn = fetch,
): PostgrestClient {
  const base = supabaseUrl.replace(/\/+$/, "");

  function headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      apikey: anonKey,
      Authorization: `Bearer ${userJwt}`,
      ...extra,
    };
  }

  function filterQuery(filters: PostgrestFilter[]): string {
    return filters
      .map(
        ([column, operator, value]) =>
          `${encodeURIComponent(column)}=${operator}.${encodeURIComponent(value)}`,
      )
      .join("&");
  }

  async function select<T>(
    table: string,
    columns: string,
    filters: PostgrestFilter[],
    opts?: { order?: string; limit?: number },
  ): Promise<T[]> {
    const query = filterQuery(filters);
    const extras = [
      opts?.order ? `order=${encodeURIComponent(opts.order)}` : "",
      opts?.limit !== undefined ? `limit=${opts.limit}` : "",
    ]
      .filter((part) => part !== "")
      .join("&");
    const suffix = [query, extras].filter((part) => part !== "").join("&");
    const url = `${base}/rest/v1/${table}?select=${encodeURIComponent(columns)}${suffix ? `&${suffix}` : ""}`;
    const res = await fetchFn(url, {
      headers: headers(),
      signal: AbortSignal.timeout(POSTGREST_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new PostgrestError(`PostgREST select on ${table} failed.`, res.status);
    }
    const json: unknown = await res.json();
    if (!Array.isArray(json)) {
      throw new PostgrestError(`PostgREST select on ${table} returned no rows.`, res.status);
    }
    return json as T[];
  }

  async function count(table: string, filters: PostgrestFilter[]): Promise<number | null> {
    try {
      const query = filterQuery(filters);
      const url = `${base}/rest/v1/${table}?select=id${query ? `&${query}` : ""}`;
      const res = await fetchFn(url, {
        method: "HEAD",
        headers: headers({ Prefer: "count=exact" }),
        signal: AbortSignal.timeout(POSTGREST_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const range = res.headers.get("content-range");
      if (!range) return null;
      const total = range.split("/")[1];
      if (total === undefined || total === "*") return null;
      const parsed = Number.parseInt(total, 10);
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async function insert(table: string, rows: Array<Record<string, unknown>>): Promise<boolean> {
    if (rows.length === 0) return true;
    try {
      const res = await fetchFn(`${base}/rest/v1/${table}`, {
        method: "POST",
        headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
        body: JSON.stringify(rows),
        signal: AbortSignal.timeout(POSTGREST_TIMEOUT_MS),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function deleteWhere(table: string, filters: PostgrestFilter[]): Promise<void> {
    try {
      const query = filterQuery(filters);
      await fetchFn(`${base}/rest/v1/${table}?${query}`, {
        method: "DELETE",
        headers: headers(),
        signal: AbortSignal.timeout(POSTGREST_TIMEOUT_MS),
      });
    } catch {
      // Best-effort cleanup — a failure just leaves old rows behind.
    }
  }

  return { select, count, insert, deleteWhere };
}
