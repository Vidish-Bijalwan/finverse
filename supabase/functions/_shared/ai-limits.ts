/**
 * Small in-memory helpers for the AI chat function, ported from the old
 * repo's `ai.cache.ts` and `ai.rate-limit.ts` (NestJS).
 *
 * HONEST LIMITS — read before trusting either class:
 * - The cache is per-instance: Supabase runs many isolates, so a cached
 *   answer usually won't be found by the next request. It saves a model
 *   call only when the same isolate happens to serve the repeat. That is
 *   acceptable (a cache miss just costs one more model call).
 * - The in-memory rate limiter is per-instance too — and for a LIMITER
 *   that is NOT acceptable on its own: with N isolates, a user could
 *   make N × the limit. The function therefore uses the DB-backed
 *   counter (`ai_rate_limits` table, migration 0005) as the real limit
 *   and this class only as a backstop when the table is unavailable
 *   (e.g. migration 0005 not yet applied — see docs/MIGRATION.md §8).
 *   The backstop is documented as best-effort, never as a guarantee.
 */

/**
 * A tiny in-memory cache for identical AI queries: asking the same
 * question twice within a minute reuses the first answer instead of
 * paying for another model call. Entries expire after the TTL, and the
 * cache is capped so it cannot grow without bound. Keys always include
 * the user id — one user's answer is never served to another.
 */
export class AiResponseCache<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
  ) {}

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, now = Date.now()): void {
    if (!this.entries.has(key) && this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: now + this.ttlMs });
  }
}

/**
 * A small in-memory sliding-window rate limiter, one window per key
 * (one per user). BACKSTOP ONLY — see the header note. The real limit
 * is the DB-backed counter in the Edge Function.
 */
export class AiRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  /**
   * Returns true and records the hit when the key is within its limit,
   * false when the window is full (the hit is not recorded).
   */
  allow(key: string, now = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= this.maxRequests) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}

/**
 * Pure window math for the DB-backed counter: given the number of rows
 * the user already has inside the window, is one more request allowed?
 * Kept pure so the boundary (exactly at the limit) is unit-testable
 * without a database.
 */
export function dbRateLimitAllows(priorCount: number, maxRequests: number): boolean {
  return priorCount < maxRequests;
}

/** ISO timestamp for the start of the current rate-limit window. */
export function rateLimitWindowStartIso(now = Date.now(), windowMs: number): string {
  return new Date(now - windowMs).toISOString();
}
