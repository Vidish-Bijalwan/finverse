/**
 * Shared React Query defaults for FinVerse data queries.
 *
 * Every data query funnels through these so the loading path behaves the
 * same everywhere: bounded retries with capped exponential backoff, then a
 * definitive error state the UI can render honestly. No infinite shimmer,
 * no retry-abort storms.
 *
 * - `retry: 2` — two retries ride out transient blips (a single timed-out
 *   request, a dropped packet); a third failure means the network or the
 *   backend is genuinely down and the UI should say so instead of spinning.
 * - Backoff 1s → 2s (capped at 5s) — gives the network a beat to recover
 *   without the ~7s of dead air the default 1s/2s/4s schedule added.
 *
 * Combined with the per-request timeout in lib/supabase.ts, the worst case
 * for one query is ~15s + 1s + 15s + 2s + 15s ≈ 48s before a definitive
 * error — and the common slow-network case succeeds on the first attempt
 * instead of aborting repeatedly.
 */
export const FINVERSE_QUERY_DEFAULTS = {
  retry: 2,
  retryDelay: (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 5000),
} as const;
