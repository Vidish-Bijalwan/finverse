import { useMutation, useQuery, useQueryClient, type MutateOptions } from "@tanstack/react-query";

import type { FinanceDB } from "./finance/types";
import { getStock } from "./market/data";
import { getLTP } from "./market/history";
import { formatINR } from "./finance/format";
import { getSupabase } from "@/lib/supabase";

/**
 * Stock watchlist with price alerts, persisted in Supabase.
 *
 * Tables (owned by the Supabase-auth migration):
 *   watchlist_items(id uuid, user_id uuid, symbol text, unique(user_id, symbol))
 *   price_alerts(id uuid, user_id uuid, symbol text,
 *                target_price_paise bigint, direction 'above'|'below')
 *
 * Prices are the demo jittered LTPs from lib/market/history (mock "live"
 * prices that move slightly on refresh). When an alert's condition is met,
 * `watchlistAlerts()` produces a notification-shaped object for the
 * notifications aggregator — the plain structural type below is kept
 * intentionally independent of any other worker's notification types.
 */

export type AlertKind = "above" | "below";

export interface PriceAlert {
  id: string;
  kind: AlertKind;
  /** Integer paise threshold. */
  pricePaise: number;
  createdAt: string;
}

export interface WatchlistEntry {
  /** Stock symbol, e.g. "RELIANCE". */
  symbol: string;
  alerts: PriceAlert[];
  addedAt: string;
}

/** Notification-shaped object produced when an alert condition is met. */
export interface WatchlistNotification {
  id: string;
  kind: "price";
  title: string;
  body: string;
  /** Route the notification deep-links to. */
  to: string;
  createdAt: string;
}

/** Input for {@link insertPriceAlert}. */
export interface InsertPriceAlertInput {
  symbol: string;
  kind: AlertKind;
  /** Integer paise threshold. */
  pricePaise: number;
}

// ---- Supabase row shapes (table columns are snake_case) ----

interface WatchlistItemRow {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
}

interface PriceAlertRow {
  id: string;
  user_id: string;
  symbol: string;
  target_price_paise: number;
  direction: string;
  created_at: string;
}

function isAlertDirection(v: unknown): v is AlertKind {
  return v === "above" || v === "below";
}

/** Signed-in user id, or a clear error when there is no session. */
async function requireUserId(): Promise<string> {
  const { data, error } = await getSupabase().auth.getUser();
  const id = data.user?.id;
  if (error || !id) {
    throw new Error("Sign in to use your watchlist.");
  }
  return id;
}

function toPriceAlert(row: PriceAlertRow): PriceAlert {
  return {
    id: row.id,
    kind: isAlertDirection(row.direction) ? row.direction : "above",
    pricePaise: Number(row.target_price_paise),
    createdAt: row.created_at,
  };
}

/**
 * Last snapshot returned by {@link fetchWatchlist}. The notifications
 * aggregator (src/lib/notify.ts) calls {@link watchlistAlerts} synchronously,
 * so it reads this snapshot — empty until the first successful fetch.
 */
let cachedEntries: WatchlistEntry[] = [];

/** Load the signed-in user's watchlist with its alerts (oldest first). New users get []. */
export async function fetchWatchlist(): Promise<WatchlistEntry[]> {
  const supabase = getSupabase();
  const userId = await requireUserId();

  const { data: itemRows, error: itemsError } = await supabase
    .from("watchlist_items")
    .select("id,user_id,symbol,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (itemsError) {
    throw new Error(`Couldn't load your watchlist: ${itemsError.message}`);
  }

  const { data: alertRows, error: alertsError } = await supabase
    .from("price_alerts")
    .select("id,user_id,symbol,target_price_paise,direction,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (alertsError) {
    throw new Error(`Couldn't load your price alerts: ${alertsError.message}`);
  }

  const alertsBySymbol = new Map<string, PriceAlert[]>();
  for (const row of (alertRows ?? []) as PriceAlertRow[]) {
    if (!isAlertDirection(row.direction)) continue;
    const list = alertsBySymbol.get(row.symbol);
    if (list) list.push(toPriceAlert(row));
    else alertsBySymbol.set(row.symbol, [toPriceAlert(row)]);
  }

  const entries: WatchlistEntry[] = ((itemRows ?? []) as WatchlistItemRow[]).map((row) => ({
    symbol: row.symbol,
    alerts: alertsBySymbol.get(row.symbol) ?? [],
    addedAt: row.created_at,
  }));

  cachedEntries = entries;
  return entries;
}

/** Add a stock to the signed-in user's watchlist. Throws on unknown symbols. Idempotent. */
export async function insertWatchlistItem(symbol: string): Promise<WatchlistEntry> {
  const upper = symbol.trim().toUpperCase();
  if (!getStock(upper)) throw new Error(`Unknown stock symbol: ${symbol}`);
  const supabase = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("watchlist_items")
    .upsert({ user_id: userId, symbol: upper }, { onConflict: "user_id,symbol" })
    .select("id,user_id,symbol,created_at")
    .single();
  if (error) {
    throw new Error(`Couldn't add ${upper} to your watchlist: ${error.message}`);
  }
  const row = data as WatchlistItemRow;
  return { symbol: row.symbol, alerts: [], addedAt: row.created_at };
}

/** Remove a stock — and all of its price alerts — from the signed-in user's watchlist. */
export async function removeWatchlistItem(symbol: string): Promise<void> {
  const upper = symbol.trim().toUpperCase();
  const supabase = getSupabase();
  const userId = await requireUserId();
  const { error: alertsError } = await supabase
    .from("price_alerts")
    .delete()
    .eq("user_id", userId)
    .eq("symbol", upper);
  if (alertsError) {
    throw new Error(`Couldn't remove ${upper} from your watchlist: ${alertsError.message}`);
  }
  const { error: itemError } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("symbol", upper);
  if (itemError) {
    throw new Error(`Couldn't remove ${upper} from your watchlist: ${itemError.message}`);
  }
}

/** Load the signed-in user's price alerts as a flat list (oldest first). */
export async function fetchPriceAlerts(): Promise<PriceAlert[]> {
  const supabase = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("price_alerts")
    .select("id,user_id,symbol,target_price_paise,direction,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Couldn't load your price alerts: ${error.message}`);
  }
  return ((data ?? []) as PriceAlertRow[])
    .filter((row) => isAlertDirection(row.direction))
    .map(toPriceAlert);
}

/** Add a price alert for a watched stock. */
export async function insertPriceAlert(input: InsertPriceAlertInput): Promise<PriceAlert> {
  assertPaise(input.pricePaise);
  const upper = input.symbol.trim().toUpperCase();
  const supabase = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("price_alerts")
    .insert({
      user_id: userId,
      symbol: upper,
      target_price_paise: input.pricePaise,
      direction: input.kind,
    })
    .select("id,user_id,symbol,target_price_paise,direction,created_at")
    .single();
  if (error) {
    throw new Error(`Couldn't save your price alert: ${error.message}`);
  }
  return toPriceAlert(data as PriceAlertRow);
}

/**
 * Delete a price alert by id. Named delete* to avoid clashing with the pure
 * `removePriceAlert(entries, symbol, alertId)` helper below, whose signature
 * must stay unchanged.
 */
export async function deletePriceAlert(id: string): Promise<void> {
  const supabase = getSupabase();
  const userId = await requireUserId();
  const { error } = await supabase.from("price_alerts").delete().eq("id", id).eq("user_id", userId);
  if (error) {
    throw new Error(`Couldn't delete that price alert: ${error.message}`);
  }
}

// ---- Pure helpers (signatures unchanged) ----

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function assertPaise(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new Error(`Alert price must be a positive integer number of paise, got ${amountPaise}`);
  }
}

/** Add a stock from the market universe. Throws on unknown symbols. Idempotent. */
export function addToWatchlist(entries: WatchlistEntry[], symbol: string): WatchlistEntry[] {
  const upper = symbol.trim().toUpperCase();
  if (!getStock(upper)) throw new Error(`Unknown stock symbol: ${symbol}`);
  if (entries.some((e) => e.symbol === upper)) return entries;
  return [...entries, { symbol: upper, alerts: [], addedAt: new Date().toISOString() }];
}

export function removeFromWatchlist(entries: WatchlistEntry[], symbol: string): WatchlistEntry[] {
  return entries.filter((e) => e.symbol !== symbol.trim().toUpperCase());
}

export function addPriceAlert(
  entries: WatchlistEntry[],
  symbol: string,
  kind: AlertKind,
  pricePaise: number,
): WatchlistEntry[] {
  assertPaise(pricePaise);
  const upper = symbol.trim().toUpperCase();
  return entries.map((e) =>
    e.symbol === upper
      ? {
          ...e,
          alerts: [
            ...e.alerts,
            { id: newId(), kind, pricePaise, createdAt: new Date().toISOString() },
          ],
        }
      : e,
  );
}

export function removePriceAlert(
  entries: WatchlistEntry[],
  symbol: string,
  alertId: string,
): WatchlistEntry[] {
  const upper = symbol.trim().toUpperCase();
  return entries.map((e) =>
    e.symbol === upper ? { ...e, alerts: e.alerts.filter((a) => a.id !== alertId) } : e,
  );
}

/** Is this alert's condition currently met at the given LTP? */
export function isAlertMet(alert: PriceAlert, ltpPaise: number): boolean {
  return alert.kind === "above" ? ltpPaise >= alert.pricePaise : ltpPaise <= alert.pricePaise;
}

/**
 * Evaluate every watchlist alert against current mock LTPs and return one
 * notification-shaped object per alert whose condition is currently met.
 * Reads the last snapshot loaded by {@link fetchWatchlist} (empty until the
 * first successful fetch) so this stays synchronous for the notifications
 * aggregator. The `db` param keeps the signature compatible with a
 * notifications aggregator that passes the finance DB.
 */
export function watchlistAlerts(_db: FinanceDB): WatchlistNotification[] {
  const out: WatchlistNotification[] = [];
  const now = new Date().toISOString();
  for (const entry of cachedEntries) {
    const ltp = getLTP(entry.symbol);
    if (ltp <= 0) continue;
    const stock = getStock(entry.symbol);
    const name = stock?.name ?? entry.symbol;
    for (const alert of entry.alerts) {
      if (!isAlertMet(alert, ltp)) continue;
      const direction = alert.kind === "above" ? "rose above" : "fell below";
      out.push({
        id: `watchlist-${entry.symbol}-${alert.id}`,
        kind: "price",
        title: `${entry.symbol} price alert`,
        body: `${name} ${direction} your ${alert.kind} alert of ${formatINR(alert.pricePaise)} — now at ${formatINR(ltp)}.`,
        to: "/watchlist",
        createdAt: now,
      });
    }
  }
  return out;
}

// ---- React Query hooks ----

const QK_WATCHLIST = ["finverse", "watchlist"] as const;

function useInvalidateWatchlist() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QK_WATCHLIST });
}

export function useWatchlist() {
  return useQuery({ queryKey: QK_WATCHLIST, queryFn: fetchWatchlist, retry: false });
}

export function useAddToWatchlist() {
  const invalidate = useInvalidateWatchlist();
  const m = useMutation<WatchlistEntry, Error, string>({
    mutationFn: insertWatchlistItem,
    onSuccess: invalidate,
  });
  return {
    ...m,
    mutateAdd: (symbol: string, options?: MutateOptions<WatchlistEntry, Error, string>) =>
      m.mutate(symbol, options),
  };
}

export function useRemoveFromWatchlist() {
  const invalidate = useInvalidateWatchlist();
  const m = useMutation<void, Error, string>({
    mutationFn: removeWatchlistItem,
    onSuccess: invalidate,
  });
  return {
    ...m,
    mutateRemove: (symbol: string, options?: MutateOptions<void, Error, string>) =>
      m.mutate(symbol, options),
  };
}

export function useAddPriceAlert() {
  const invalidate = useInvalidateWatchlist();
  const m = useMutation<PriceAlert, Error, InsertPriceAlertInput>({
    mutationFn: insertPriceAlert,
    onSuccess: invalidate,
  });
  return {
    ...m,
    mutateAddAlert: (
      symbol: string,
      kind: AlertKind,
      pricePaise: number,
      options?: MutateOptions<PriceAlert, Error, InsertPriceAlertInput>,
    ) => m.mutate({ symbol, kind, pricePaise }, options),
  };
}

export function useRemovePriceAlert() {
  const invalidate = useInvalidateWatchlist();
  const m = useMutation<void, Error, { symbol: string; alertId: string }>({
    mutationFn: ({ alertId }) => deletePriceAlert(alertId),
    onSuccess: invalidate,
  });
  return {
    ...m,
    mutateRemoveAlert: (
      symbol: string,
      alertId: string,
      options?: MutateOptions<void, Error, { symbol: string; alertId: string }>,
    ) => m.mutate({ symbol, alertId }, options),
  };
}

export { QK_WATCHLIST as WATCHLIST_QUERY_KEY };
